const questionsContainer = document.getElementById("questions-container")
const resultsContainer = document.getElementById("results-container")
const finishQuestionsButton = document.getElementById("finish-questions-button")
const resultFunction = document.getElementById("result-function")
const resultDescription = document.getElementById("result-description")
const resultFunctionCanvas = document.getElementById("result-function-canvas")
const resultFunctionContext = resultFunctionCanvas.getContext("2d")
const resultsTableBody = document.getElementById("results-table-body")
const shareResultsButton = document.getElementById("share-results-button")

const NUM_BUTTONS_PER_QUESTION = 7

// fischer-yates shuffle adopted from https://bost.ocks.org/mike/shuffle/
function shuffle(array) {
    let m = array.length, t, i

    while (m) {
        i = Math.floor(Math.random() * m--)

        t = array[m]
        array[m] = array[i]
        array[i] = t
    }

    return array
}