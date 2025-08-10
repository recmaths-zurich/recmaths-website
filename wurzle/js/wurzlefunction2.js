class NumberParserError extends Error {
    constructor(message) {
        super(message)
        this.name = "NumberParserError"
    }
}

class ComplexNumber {

    constructor(realPart=0, imaginaryPart=0) {
        this.realPart = realPart
        this.imaginaryPart = imaginaryPart
    }

    isNumberNearlyZero(n) {
        return Math.abs(n) < 1e-8
    }

    toArray() {
        return [this.realPart, this.imaginaryPart]
    }

    static fromArray(arr) {
        return new ComplexNumber(arr[0], arr[1])
    }

    static Zero() {
        return new ComplexNumber(0, 0)
    }

    static One() {
        return new ComplexNumber(1, 0)
    }

    static i() {
        return new ComplexNumber(0, 1)
    }

    toString() {
        if (this.realPart == 0 && this.imaginaryPart == 0) {
            return "0"
        }

        let imaginaryString = ""
        if (this.imaginaryPart == 1) {
            imaginaryString = `+i`
        } else if (this.imaginaryPart == -1) {
            imaginaryString = "-i"
        } else if (this.imaginaryPart > 0 && !this.isNumberNearlyZero(this.imaginaryPart)) {
            imaginaryString = `+${this.imaginaryPart}i`
        } else if (this.imaginaryPart < 0 && !this.isNumberNearlyZero(this.imaginaryPart)) {
            imaginaryString = `-${-this.imaginaryPart}i`
        }

        if (this.isNumberNearlyZero(this.realPart)) {
            if (imaginaryString.startsWith("+")) {
                return imaginaryString.slice(1)
            } else {
                return imaginaryString
            }
        } else {
            return `${this.realPart}${imaginaryString}`
        }
    }

    static asComplexNumber(number) {
        if (typeof number === "number") {
            return new ComplexNumber(number, 0)
        } else if (number instanceof ComplexNumber) {
            return number
        } else {
            throw new Error("Failed to convert number to complex number type")
        }
    }
    
    conjugate() {
        return new ComplexNumber(this.realPart, -this.imaginaryPart)
    }

    get isReal() {
        return this.isNumberNearlyZero(this.imaginaryPart)
    }

    magnitude() {
        return Math.hypot(this.realPart, this.imaginaryPart)
    }

    magnitudeSquared() {
        return this.realPart ** 2 + this.imaginaryPart ** 2
    }

    add(other) {
        other = ComplexNumber.asComplexNumber(other)
        return new ComplexNumber(this.realPart + other.realPart, this.imaginaryPart + other.imaginaryPart)
    }

    mul(other) {
        other = ComplexNumber.asComplexNumber(other)
        return new ComplexNumber(
            this.realPart * other.realPart - this.imaginaryPart * other.imaginaryPart,
            this.realPart * other.imaginaryPart + this.imaginaryPart * other.realPart
        )
    }

    sub(other) {
        other = ComplexNumber.asComplexNumber(other)
        return new ComplexNumber(this.realPart - other.realPart, this.imaginaryPart - other.imaginaryPart)
    }

    div(other) {
        other = ComplexNumber.asComplexNumber(other)

        const otherSquaredMagnitude = other.magnitudeSquared()
        if (otherSquaredMagnitude == 0) {
            throw new Error("Zero Divison Error")
        }

        return new ComplexNumber(
            (this.realPart * other.realPart + this.imaginaryPart * other.imaginaryPart) / otherSquaredMagnitude,
            (this.imaginaryPart * other.realPart - this.realPart * other.imaginaryPart) / otherSquaredMagnitude
        )
    }

    pow(other) {
        // Principal value of (this)^(other).
        other = ComplexNumber.asComplexNumber(other)
        const [a, b] = this.toArray()
        const [c, d] = other.toArray()

        const r2 = this.magnitudeSquared()
        if (r2 === 0) throw new RangeError("Base 0+0i is not defined for complex powers.")

        const theta = Math.atan2(b, a)
        const mag   = Math.pow(r2, c / 2) * Math.exp(-d * theta)
        const ang   = c * theta + (d / 2) * Math.log(r2)

        return new ComplexNumber(
            mag * Math.cos(ang),
            mag * Math.sin(ang),
        )
    }

    sqrt() {
        const a = this.realPart;
        const b = this.imaginaryPart;

        if (a == 0 && b == 0) return new ComplexNumber(0, 0)

        const r = Math.hypot(a, b); // |z|

        let u, v
        if (a >= 0) {
            // Stable when a >= 0
            u = Math.sqrt(0.5 * (r + a))
            v = b / (2 * u)
        } else {
            v = Math.sqrt(0.5 * (r - a))
            const s = (b >= 0 ? 1 : -1)
            u = s * (b / (2 * v))
        }

        return new ComplexNumber(u, v)
    }

    abs() {
        return new ComplexNumber(this.magnitude(), 0)
    }

    arg() {
        return Math.atan2(this.imaginaryPart, this.realPart)
    }

    exp() {
        const ea = Math.exp(this.realPart)
        return new ComplexNumber(
            ea * Math.cos(this.imaginaryPart),
            ea * Math.sin(this.imaginaryPart)
        )
    }

    ln() {
        const r2 = this.magnitudeSquared()
        if (r2 === 0) throw new RangeError("Ln(0) undefined")
        return new ComplexNumber(0.5 * Math.log(r2), this.arg())
    }

    // trigs
    sin()  { const [a,b]=this.toArray(); return new ComplexNumber(Math.sin(a)*Math.cosh(b),  Math.cos(a)*Math.sinh(b)) }
    cos()  { const [a,b]=this.toArray(); return new ComplexNumber(Math.cos(a)*Math.cosh(b), -Math.sin(a)*Math.sinh(b)) }
    tan()  { return this.sin().div(this.cos()) }

    // hyperbolic
    sinh() { const [a,b]=this.toArray(); return new ComplexNumber(Math.sinh(a)*Math.cos(b),  Math.cosh(a)*Math.sin(b)) }
    cosh() { const [a,b]=this.toArray(); return new ComplexNumber(Math.cosh(a)*Math.cos(b),  Math.sinh(a)*Math.sin(b)) }
    tanh() { return this.sinh().div(this.cosh()) }

    // inverse trig
    arcsin() {
        const i = ComplexNumber.i()
        return i.mul(-1).mul( i.mul(this).add( ComplexNumber.One().sub(this.mul(this)).sqrt() ).ln() )
    }

    arccos() {
        const i = ComplexNumber.i()
        return i.mul(-1).mul( this.add( this.sub(1).sqrt().mul(this.add(1).sqrt()) ).ln() )
    }

    arctan() {
        const i = ComplexNumber.i()
        return ComplexNumber.One().add(i.mul(this)).div(ComplexNumber.One().sub(i.mul(this))).ln().mul(i.mul(-0.5))
    }

    // inverse hyperbolic
    arcsinh() { return this.add( this.mul(this).add(1).sqrt() ).ln() }
    arccosh() { return this.add( this.sub(1).sqrt().mul(this.add(1).sqrt()) ).ln() }
    arctanh() { return ComplexNumber.One().add(this).div(ComplexNumber.One().sub(this)).ln().mul(0.5) }

    // logs (change of base)
    log10() { return this.ln().div(Math.log(10)) }
    log2()  { return this.ln().div(Math.log(2)) }
    log3()  { return this.ln().div(Math.log(3)) }
    
}

function evaluateNumberString(numberString) {
    // GRAMMAR:
    // number: "-" number | decimal | number "/" number | "0x" hexint | "0x" hexdecimal |
    //         "0b" binint | "0b" bindecimal | "sqrt(" number ")" |
    //         "sin(" number ")" | "cos(" number ")" | "tan(" number ")" |
    //         decimal "e" int | "pi" | "tau" | "phi" | "e" |
    //         number "*" number | number "^" number | number "-" number | number "+" number
    // decimal: int | int "." int
    // int: "0" int | ... | "9" int | "0" | ... | "9"
    // hexdecimal: hexint | hexint "." hexint
    // hexint: "0" hexint | ... | "f" hexint | "0" | ... | "f"
    // bindecimal: binint | binint "." binint
    // binint: "0" binint | "1" binint | "0" | "1"

    const constants = {
        "pi": new ComplexNumber(Math.PI),
        "π": new ComplexNumber(Math.PI),
        "tau": new ComplexNumber(2 * Math.PI),
        "phi": new ComplexNumber((1 + Math.sqrt(5)) / 2),
        "Φ": new ComplexNumber((1 + Math.sqrt(5)) / 2),
        "goldenratio": new ComplexNumber((1 + Math.sqrt(5)) / 2),
        "e": new ComplexNumber(Math.E),
        "i": new ComplexNumber(0, 1)
    }

    for (const [constant, value] of Object.entries(constants)) {
        if (numberString == constant) {
            return value
        }
    }
    
    if (numberString.startsWith("-")) {
        return evaluateNumberString("0" + numberString)
    }

    if (numberString == "inf") {
        throw new NumberParserError(`Infinity is not a number`)
    }

    const imaginaryRegex = /^[0123456789]+(\.[0123456789]+)?i$/
    const decimalRegex = /^[0123456789]+\.[0123456789]+$/
    const intRegex = /^[0123456789]+$/
    const hexDecimalRegex = /^0x[0123456789abcdef]+\.[0123456789abcdef]+$/
    const hexIntRegex = /^0x[0123456789abcdef]+$/
    const binDecimalRegex = /^0b[01]+\.[01]+$/
    const binIntRegex = /^0b[01]+$/
    const scientificRegex = /^\-?[0123456789]+(\.[0123456789]+)?e-?[0123456789]+$/

    const allowedFunctions = {
        "sqrt":    {compute: n => ComplexNumber.asComplexNumber(n).sqrt()},
        "abs":     {compute: n => ComplexNumber.asComplexNumber(n).abs()},
        "sin":     {compute: n => ComplexNumber.asComplexNumber(n).sin()},
        "cos":     {compute: n => ComplexNumber.asComplexNumber(n).cos()},
        "tan":     {compute: n => ComplexNumber.asComplexNumber(n).tan()},
        "arcsin":  {compute: n => ComplexNumber.asComplexNumber(n).arcsin()},
        "arccos":  {compute: n => ComplexNumber.asComplexNumber(n).arccos()},
        "arctan":  {compute: n => ComplexNumber.asComplexNumber(n).arctan()},
        "sinh":    {compute: n => ComplexNumber.asComplexNumber(n).sinh()},
        "cosh":    {compute: n => ComplexNumber.asComplexNumber(n).cosh()},
        "tanh":    {compute: n => ComplexNumber.asComplexNumber(n).tanh()},
        "arcsinh": {compute: n => ComplexNumber.asComplexNumber(n).arcsinh()},
        "arccosh": {compute: n => ComplexNumber.asComplexNumber(n).arccosh()},
        "arctanh": {compute: n => ComplexNumber.asComplexNumber(n).arctanh()},
        "ln":      {compute: n => ComplexNumber.asComplexNumber(n).ln()},
        "log10":   {compute: n => ComplexNumber.asComplexNumber(n).log10()},
        "log2":    {compute: n => ComplexNumber.asComplexNumber(n).log2()},
        "log3":    {compute: n => ComplexNumber.asComplexNumber(n).log3()},
        "":        {compute: n => ComplexNumber.asComplexNumber(n)}
    }

    for (const [functionStr, func] of Object.entries(allowedFunctions)) {
        if (numberString.startsWith(`${functionStr}(`)) {
            // if we find that we closing bracket doesn't belong to opening bracket, abort
            const numberPart = numberString.slice(functionStr.length + 1, -1)
            let openCount = 0
            let abortThisExecution = false
            for (const char of numberPart) {
                if (char == "(") {
                    openCount++
                } else if (char == ")") {
                    openCount--
                }
                if (openCount < 0) {
                    abortThisExecution = true
                    break
                }
            }
            if (abortThisExecution) {
                continue
            }

            const value = evaluateNumberString(numberPart)
            for (const constraint of (func.constraints ?? [])) {
                if (constraint.if(value)) {
                    throw constraint.err()
                }
            }
            return func.compute(value)
        }
    }

    if (intRegex.test(numberString)) {
        return new ComplexNumber(parseInt(numberString))
    } else if (hexIntRegex.test(numberString)) {
        return new ComplexNumber(parseInt(numberString.slice(2), 16))
    } else if (binIntRegex.test(numberString)) {
        return new ComplexNumber(parseInt(numberString.slice(2), 2))
    }

    if (imaginaryRegex.test(numberString)) {
        return new ComplexNumber(0, parseFloat(numberString.slice(0, -1)))
    } else if (decimalRegex.test(numberString)) {
        return new ComplexNumber(parseFloat(numberString))
    } else if (binDecimalRegex.test(numberString)) {
        const [before, after] = numberString.split(".")
        const beforeVal = parseInt(before.slice(2), 2)
        const afterVal = parseInt(after, 2)
        return new ComplexNumber(beforeVal + afterVal / (2 ** after.length))
    } else if (hexDecimalRegex.test(numberString)) {
        const [before, after] = numberString.split(".")
        const beforeVal = parseInt(before.slice(2), 16)
        const afterVal = parseInt(after, 16)
        return new ComplexNumber(beforeVal + afterVal / (16 ** after.length))
    }

    if (scientificRegex.test(numberString)) {
        let [decimal, exponent] = numberString.split("e")
        decimal = parseFloat(decimal)
        exponent = parseInt(exponent)
        return new ComplexNumber(decimal * (10 ** exponent))
    }

    // in list of anti-precedence
    const operators = [
        ["+", (a, b) => a.add(b)],
        ["-", (a, b) => a.sub(b)],
        ["*", (a, b) => a.mul(b)],
        ["/", (a, b) => a.div(b)],
        ["^", (a, b) => a.pow(b)],
    ]

    for (const [operatorName, operatorFunc] of operators) {
        let currLevel = 0
        let foundSplitIndex = null
        for (let i = 0; i < numberString.length; i++) {
            const char = numberString[i]
            if (char == "(") currLevel++
            if (char == ")") currLevel--
            if (currLevel < 0) {
                throw new NumberParserError(`Unbalanced parentheses`)
            }
            if (char == operatorName && currLevel == 0) {
                foundSplitIndex = i
            }
        }

        if (currLevel != 0) {
            throw new NumberParserError(`Unbalanced parentheses`)
        }

        if (foundSplitIndex === null) {
            continue
        }

        // split into two parts only
        const parts = [
            numberString.slice(0, foundSplitIndex),
            numberString.slice(foundSplitIndex + 1)
        ]

        for (let i = 0; i < 2; i++) {
            parts[i] = evaluateNumberString(parts[i])
        }

        if (parts[1] == 0 && operatorName == "/") {
            throw new NumberParserError(`Can't divide by zero`)
        }

        return operatorFunc(parts[0], parts[1])
    }
    
    if (numberString.startsWith("-")) {
        return -evaluateNumberString(numberString.slice(1))
    }

    throw new NumberParserError(`Invalid number`)
}

class WurzleFunction {

    constructor(termString) {
        this.termString = termString
    }

    computeAt(x) {
        const y = evaluateNumberString(this.termString.replaceAll("x", `(${x})`))
        if (!y.isReal) {
            throw new NumberParserError("Expected Real Number, got Complex")
        } else {
            return y.realPart
        }
    }

    numericToStringResult(y) {
        y = ComplexNumber.asComplexNumber(y).realPart

        const maxPositiveNumber = 10 ** (NUM_CELLS_PER_ROW - 1) - 1
        const maxNegativeNumber = -(10 ** (NUM_CELLS_PER_ROW - 2) - 1)

        if (y > maxPositiveNumber) {
            return ">" + maxPositiveNumber
        } else if (y < maxNegativeNumber) {
            return "<" + maxNegativeNumber
        } else {
            let yString = null
            for (let n = 0; n <= NUM_CELLS_PER_ROW; n++) {
                yString = (y >= 0 && y < 10) ? ("0" + y.toFixed(n)) : y.toFixed(n)

                if (yString.length == NUM_CELLS_PER_ROW - 1) {
                    break
                } else if (yString.length >= NUM_CELLS_PER_ROW) {
                    yString = yString.slice(0, NUM_CELLS_PER_ROW - 1)
                }
            }

            if (parseFloat(yString) == y) {
                return `=${yString}`
            } else {
                return `≈${yString}`
            }
        }
    }

    computeStringResultAt(x) {
        let y = null
        try {
            y = this.computeAt(x)
        } catch (e) {
            if (e instanceof NumberParserError) {
                if (e.message === "Expected Real Number, got Complex") {
                    return "unreal".slice(0, NUM_CELLS_PER_ROW).padStart(NUM_CELLS_PER_ROW, " ")
                }
                return "undefined".slice(0, NUM_CELLS_PER_ROW).padStart(NUM_CELLS_PER_ROW, " ")
            } else {
                throw e
            }
        }

        return this.numericToStringResult(y)
    }

}

// // test numericToStringResult Implementation
// for (let x of [0, -99.98764323786, 9.999896570288696, 3, 11, 12.5, 0.0001, -0.01, -0.0001, 9999, 9999.6, 99999, 99999.6, 999999, -9999, -9999.6, -10000]) {
//     let f = new WurzleFunction()
//     const str = f.numericToStringResult(x)
//     console.log(x, str)
//     console.assert(str.length == NUM_CELLS_PER_ROW)
// }