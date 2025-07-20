function weightedRandomChoice(items, weights) {
    console.assert(items.length == weights.length)

    const sum = weights.reduce((p, c) => p + c, 0)
    let r = Math.random() * sum

    for (let i = 0; i < items.length; i++) {
        r -= weights[i]
        if (r <= 0) {
            return items[i]
        }
    }
}

class FunctionGenerator {

    generate() {
        const functionTypes = {
            "polynomial": 3,
            "exponential": 2,
            "trigonometric": 1,
            "inverse-trigonometric": 1 / 3,
            "radical": 2,
            "rational": 1,
            "abs": 1
        }

        const randomIntegerCoefficient = () => weightedRandomChoice(
            [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5],
            [ 1,  1,  1,  1,  3, 4, 3, 1, 1, 1]
        )

        const chosenType = weightedRandomChoice(Object.keys(functionTypes), Object.values(functionTypes))
        let termString = ""

        if (chosenType == "polynomial") {
            const degree = weightedRandomChoice([1, 2, 3], [2, 3, 1])
            const coefficients = [0, 0, 0, 0]
            
            const randomiseCoefficients = () => {
                for (let i = 0; i <= degree; i++) {
                    if (i != 0 && i != degree && Math.random() < 1 / 3) {
                        coefficients[i] = 0
                    } else {
                        coefficients[i] = randomIntegerCoefficient()
                    }
                }
            }

            const hasRealRoot = () => {
                // ax^3+bx^2+cx+d
                const [d, c, b, a] = coefficients

                // all degree 3 functions have a root
                if (a != 0) {
                    return true
                }
            
                // use quadratic discriminant
                if (b != 0) {
                    return (c * c - 4 * b * d) >= 0
                }

                // linear
                if (c != 0) {
                    return true
                }

                return d == 0
            }

            randomiseCoefficients()
            while (!hasRealRoot()) {
                randomiseCoefficients()
            }

            for (let d = coefficients.length - 1; d >= 0; d--) {
                const coefficient = coefficients[d]
                if (coefficient == 0) {
                    continue
                }

                let xStr = `x^${d}`
                if (d == 0) {
                    termString += `${coefficient}+`
                    continue
                } else if (d == 1) {
                    xStr = `x`
                }

                if (coefficient == 1) {
                    termString += `${xStr}+`
                } else if (coefficient == -1) {
                    termString += `-${xStr}+`
                } else {
                    termString += `${coefficient}*${xStr}+`
                }
            }

            termString = termString.slice(0, -1)
        }

        else if (chosenType == "exponential") {
            // a*base^(bx)-c

            const base = weightedRandomChoice(["2", "e", "3"], [1, 3, 1])
            const a = randomIntegerCoefficient()
            const b = randomIntegerCoefficient()

            // make sure a and c are different ins absolute so that 0 is not a root (that'd be boring)
            let c = randomIntegerCoefficient()
            while (Math.abs(a) == Math.abs(c)) {
                c = randomIntegerCoefficient()
            }
            
            // make sure a and c have different signs to ensure a root
            if (Math.sign(a) == Math.sign(c)) {
                c *= -1
            }
            
            if (a == 1) {
            } else if (a == -1) {
                termString += "-"
            } else {
                termString += `${a}*`
            }

            termString += `${base}^`

            if (b == 1) {
                termString += "x"
            } else if (b == -1) {
                termString += "(-x)"
            } else {
                termString += `(${b}*x)`
            }

            termString += `+${c}`
        }

        else if (chosenType == "trigonometric" || chosenType == "radical" || chosenType == "abs") {
            // a*f(b*x+c)+d
            let f = weightedRandomChoice(["sin", "cos", "tan"], [2, 2, 3])

            let a = randomIntegerCoefficient()
            let b = randomIntegerCoefficient()
            let c = randomIntegerCoefficient()
            let d = randomIntegerCoefficient()

            if (chosenType == "radical") {
                f = "sqrt"
                
                if (Math.sign(a) == Math.sign(d)) {
                    d *= -1
                }

            } else if (chosenType == "abs") {
                f = "abs"
                
                if (Math.sign(a) == Math.sign(d)) {
                    d *= -1
                }
            }

            // negative b results in the same, so let's simplify
            if (f == "cos") {
                b = Math.abs(b)
            }

            // ensure a root
            while ((f == "sin" || f == "cos") && Math.abs(a) < Math.abs(d)) {
                a = randomIntegerCoefficient()
                d = randomIntegerCoefficient()
            }

            if (a == 1) {
            } else if (a == -1) {
                termString += `-`
            } else {
                termString += `${a}*`
            }

            termString += `${f}(`

            if (b == 1) {
                termString += "x+"
            } else if (b == -1) {
                termString += "-x+"
            } else {
                termString += `${b}*x+`
            }

            termString += `${c})+${d}`
        }

        else if (chosenType == "inverse-trigonometric") {
            // a * arctan(x + b)
            // other inverse trigs are boring because their domain is too small to be fun

            let a = randomIntegerCoefficient()
            let b = randomIntegerCoefficient() * 2 + 1
            
            if (a == 1) {
            } else if (a == -1) {
                termString += "-"
            } else {
                termString += `${a}*`
            }

            termString += `arctan(x+${b})`
        }

        else if (chosenType == "rational") {
            // a / x^b + c

            let a = randomIntegerCoefficient()
            let b = weightedRandomChoice([1, 2], [2, 1])
            let c = randomIntegerCoefficient()

            if (Math.sign(a) == Math.sign(c)) {
                c *= -1
            }

            termString += `${a}/`
            
            if (b == 1) {
                termString += "x"
            } else {
                termString += `(x^${b})`
            }

            termString += `+${c}`
        }

        else {
            throw new Error("Unknown function type: " + chosenType)
        }

        termString = termString.replaceAll("+-", "-")
        return termString
    }

}

const functionGenerator = new FunctionGenerator()