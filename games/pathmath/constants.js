const pathMathGlobal = document.getElementById("pathmath-global")
const pathMathGrid = document.getElementById("pathmath-grid")
const pathMathGoalContainer = document.getElementById("pathmath-goal-container")
const goalOutput = document.getElementById("goal-output")

const timeLeftOutput = document.getElementById("pathmath-time-left-output")
const scoreOutput = document.getElementById("pathmath-score-output")

const pathMathGridBackground = document.getElementById("pathmath-grid-background")
const context = pathMathGridBackground.getContext("2d")

const MIN_WAYS = 200
const MAX_WAYS = Infinity
const GAME_DURATION_MS = 1000 * 60 * 2

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

function updateScoreDisplay(score) {
    scoreOutput.textContent = score.toString().padStart(2, '0')
}

function updateTimeLeftDisplay(timeLeftMs) {
    const minutes = Math.floor(timeLeftMs / 60000)
    const seconds = Math.floor((timeLeftMs % 60000) / 1000)

    const minutesStr = minutes.toString().padStart(2, '0')
    const secondsStr = seconds.toString().padStart(2, '0')

    timeLeftOutput.textContent = `${minutesStr}:${secondsStr}`
}