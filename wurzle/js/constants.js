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

const calendarContainer = document.getElementById("wurzle-calendar-container")

const NUM_CELLS_PER_ROW = 6
const NUM_MAX_GUESSES = 12

const POPUP_ANIMATION_MS = 300
const POPUP_ANIMATION_EASING_IN = "ease-out"
const POPUP_ANIMATION_EASING_OUT = "ease-in"

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

function hideElements(revealKey) {
    for (const element of document.querySelectorAll(`[data-revealwhen='${revealKey}']`)) {
        element.style.display = "none"
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

    wurzlePopupBackground.animate([
        { opacity: 0 },
        { opacity: 1 }
    ], {duration: POPUP_ANIMATION_MS, easing: POPUP_ANIMATION_EASING_IN})

    wurzleResultsPopup.animate([
        { transform: "translate(-50%, -200vh)" },
        { transform: "translate(-50%, -50%)" }
    ], {duration: POPUP_ANIMATION_MS, easing: POPUP_ANIMATION_EASING_IN})
}

function hidePopup() {
    wurzlePopupBackground.animate([
        { opacity: 1 },
        { opacity: 0 }
    ], {duration: POPUP_ANIMATION_MS, easing: POPUP_ANIMATION_EASING_OUT}).finished.then(() => {
        wurzlePopupBackground.style.display = "none"
    })

    wurzleResultsPopup.animate([
        { transform: "translate(-50%, -50%)" },
        { transform: "translate(-50%, -200vh)" }
    ], {duration: POPUP_ANIMATION_MS, easing: POPUP_ANIMATION_EASING_OUT}).finished.then(() => {
        wurzleResultsPopup.style.display = "none"
    })
}