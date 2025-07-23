const pathMathGlobal = document.getElementById("pathmath-global")
const pathMathGrid = document.getElementById("pathmath-grid")
const pathMathGoalContainer = document.getElementById("pathmath-goal-container")
const goalOutput = document.getElementById("goal-output")

const pathMathGridBackground = document.getElementById("pathmath-grid-background")
const context = pathMathGridBackground.getContext("2d")

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