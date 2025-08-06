const duelGlobalContainer = document.querySelector(".duel-global")
const duelContainer = document.querySelector(".duel-container")
const duelGridContainer = document.querySelector(".duel-grid")
const duelAvailableContainer = document.querySelector(".duel-available-container")
const duelAvailableCell = document.querySelector(".duel-available-cell")

const NUM_CELLS_PER_ROW = 6
const NUM_TOTAL_ROWS = 3
const STACK_SIZE = NUM_CELLS_PER_ROW * NUM_TOTAL_ROWS - 3

function updateCSSConstants() {
    duelGlobalContainer.style.setProperty("--duel-cells-per-row", NUM_CELLS_PER_ROW)
    
    const randomGridCell = document.querySelector(".duel-grid-cell")
    if (randomGridCell) {
        const boundingBox = randomGridCell.getBoundingClientRect()
        duelGlobalContainer.style.setProperty("--grid-cell-size", `${boundingBox.width}px`)
    }
}

function fillDataElements(key, value) {
    for (const element of document.querySelectorAll(`[data-fill='${key}']`)) {
        element.textContent = value
    }
}

window.addEventListener("resize", updateCSSConstants)
window.addEventListener("load", updateCSSConstants)