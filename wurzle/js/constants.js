let secretFunctionString = "2*(x-42)"
let wurzleNumero = 4

const wurzleGameContainer = document.getElementById("wurzle-game-container")
const wurzleGridContainer = document.getElementById("wurzle-grid-container")
const wurzleGlobalContainer = document.getElementById("wurzle-global-container")

const wurzleInput = document.getElementById("wurzle-input")
const wurzleSubmitButton = document.getElementById("wurzle-submit-button")
const wurzleInputContainer = document.getElementById("wurzle-input-container")
const wurzleShareContainer = document.getElementById("wurzle-share-container")

const wurzleResultsPopup = document.getElementById("wurzle-results-popup")
const wurzleGoodResultsContainer = document.getElementById("wurzle-good-results-container")
const wurzleBadResultsContainer = document.getElementById("wurzle-bad-results-container")
const wurzlePopupBackground = document.getElementById("wurzle-popup-background")
const wurzleClosePopupButton = document.getElementById("close-popup-button")

const revealFunctionButtons = document.querySelectorAll(".function-reveal-button")
const shareResultsButtons = document.querySelectorAll(".share-results-button")
const showResultsButton = document.getElementById("show-results-button")

const enableTrainingModeButton = document.getElementById("enable-training-mode-button")
const disableTrainingModeButton = document.getElementById("disable-training-mode-button")

const NUM_CELLS_PER_ROW = 6
const NUM_MAX_GUESSES = 12

wurzleGameContainer.style.setProperty("--num-cells-per-row", NUM_CELLS_PER_ROW)

function updateCSSCellSize() {
    const cell = wurzleGridContainer.querySelector(".wurzle-grid-cell")
    if (cell) {
        const cellSize = cell.clientWidth
        wurzleGameContainer.style.setProperty("--cell-size-px", `${cellSize}px`)
    }
}

function fillDataElements(key, value) {
    for (const element of document.querySelectorAll(`[data-fill='${key}']`)) {
        element.textContent = value
    }
}

function revealElements(revealKey) {
    for (const element of document.querySelectorAll(`[data-revealwhen='${revealKey}']`)) {
        element.style.display = "block"
    }
}

fillDataElements("max-num-guesses", NUM_MAX_GUESSES)

window.addEventListener("resize", updateCSSCellSize)
window.addEventListener("DOMContentLoaded", updateCSSCellSize)

const CELL_HIDDEN_BACKGROUND_COLOR = "var(--background)"
const CELL_CARD_BACKGROUND_COLOR = "grey"
const CELL_FOREGROUND_COLOR = "white"
const CELL_GOOD_BACKGROUND_COLOR = "#6aba65"

function showPopup() {
    wurzlePopupBackground.style.display = "block"
    wurzleResultsPopup.style.display = "block"
    wurzleInputContainer.style.display = "none"
    wurzleShareContainer.style.display = "block"
}