class NumberParserError extends Error {
    constructor(message) {
        super(message)
        this.name = "NumberParserError"
    }
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
        "pi": Math.PI,
        "π": Math.PI,
        "tau": 2 * Math.PI,
        "phi": (1 + Math.sqrt(5)) / 2,
        "Φ": (1 + Math.sqrt(5)) / 2,
        "goldenratio": (1 + Math.sqrt(5)) / 2,
        "e": Math.E,
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

    const decimalRegex = /^[0123456789]+\.[0123456789]+$/
    const intRegex = /^[0123456789]+$/
    const hexDecimalRegex = /^0x[0123456789abcdef]+\.[0123456789abcdef]+$/
    const hexIntRegex = /^0x[0123456789abcdef]+$/
    const binDecimalRegex = /^0b[01]+\.[01]+$/
    const binIntRegex = /^0b[01]+$/
    const scientificRegex = /^\-?[0123456789]+(\.[0123456789]+)?e-?[0123456789]+$/

    const allowedFunctions = {
        "sqrt": {
            compute: n => Math.sqrt(n),
            constraints: [
                {
                    if: n => (n < 0),
                    err: () => new NumberParserError(`sqrt is only defined on [0, inf)`)
                }
            ]
        },
        "abs":     {compute: n => Math.abs(n)},
        "sin":     {compute: n => Math.sin(n)},
        "cos":     {compute: n => Math.cos(n)},
        "tan":     {compute: n => Math.tan(n)},
        "arcsin":  {
            compute: n => Math.asin(n),
            constraints: [
                {
                    if: n => (n < -1) || (n > 1),
                    err: () => new NumberParserError(`arcsin is only defined on [-1, 1]`)
                }
            ]
        },
        "arccos":  {
            compute: n => Math.acos(n),
            constraints: [
                {
                    if: n => (n < -1) || (n > 1),
                    err: () => new NumberParserError(`arccos is only defined on [-1, 1]`)
                }
            ]
        },
        "arctan":  {compute: n => Math.atan(n)},
        "sinh":    {compute: n => Math.sinh(n)},
        "cosh":    {compute: n => Math.cosh(n)},
        "tanh":    {compute: n => Math.tanh(n)},
        "arcsinh": {compute: n => Math.asinh(n)},
        "ln":      {
            compute: n => Math.log(n),
            constraints: [{
                if: n => (n <= 0),
                err: () => new NumberParserError("ln is only defined on (0, inf)")
            }]
        },
        "log10":   {
            compute: n => Math.log10(n),
            constraints: [{
                if: n => (n <= 0),
                err: () => new NumberParserError("log10 is only defined on (0, inf)")
            }]
        },
        "log2":    {
            compute: n => Math.log2(n),
            constraints: [{
                if: n => (n <= 0),
                err: () => new NumberParserError("log2 is only defined on (0, inf)")
            }]
        },
        "log3":    {
            compute: n => Math.log(n) / Math.log(3),
            constraints: [{
                if: n => (n <= 0),
                err: () => new NumberParserError("log3 is only defined on (0, inf)")
            }]
        },
        "arccosh": {
            compute: n => Math.acosh(n),
            constraints: [
                {
                    if: n => (n < 1),
                    err: () => new NumberParserError(`arccosh is only defined on [1, inf)`)
                }
            ]
        },
        "arctanh": {
            compute: n => Math.atanh(n),
            constraints: [
                {
                    if: n => (n <= -1) || (n >= 1),
                    err: () => new NumberParserError(`arctanh is only defined on (-1, 1)`)
                }
            ]
        },
        "": {compute: n => n}
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
        return parseInt(numberString)
    } else if (hexIntRegex.test(numberString)) {
        return parseInt(numberString.slice(2), 16)
    } else if (binIntRegex.test(numberString)) {
        return parseInt(numberString.slice(2), 2)
    }

    if (decimalRegex.test(numberString)) {
        return parseFloat(numberString)
    } else if (binDecimalRegex.test(numberString)) {
        const [before, after] = numberString.split(".")
        const beforeVal = parseInt(before.slice(2), 2)
        const afterVal = parseInt(after, 2)
        return beforeVal + afterVal / (2 ** after.length)
    } else if (hexDecimalRegex.test(numberString)) {
        const [before, after] = numberString.split(".")
        const beforeVal = parseInt(before.slice(2), 16)
        const afterVal = parseInt(after, 16)
        return beforeVal + afterVal / (16 ** after.length)
    }

    if (scientificRegex.test(numberString)) {
        let [decimal, exponent] = numberString.split("e")
        decimal = parseFloat(decimal)
        exponent = parseInt(exponent)
        return decimal * (10 ** exponent)
    }

    // in list of anti-precedence
    const operators = [
        ["+", (a, b) => a + b],
        ["-", (a, b) => a - b],
        ["*", (a, b) => a * b],
        ["/", (a, b) => a / b],
        ["^", (a, b) => a ** b],
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
        return evaluateNumberString(this.termString.replaceAll("x", `(${x})`))
    }

    numericToStringResult(y) {
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