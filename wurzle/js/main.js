const urlParams = new URLSearchParams(location.search)

let trainingModeActive = urlParams.has("training")
if (trainingModeActive) {
    revealElements("trainingmode")
    enableTrainingModeButton.style.display = "none"
    
    secretFunctionString = functionGenerator.generate()
} else {
    disableTrainingModeButton.style.display = "none"
}

const f = new WurzleFunction(secretFunctionString)
const wurzleGame = new WurzleGame(wurzleGridContainer, f)

fillDataElements("secret-function", "#".repeat(f.termString.length))

wurzleInput.addEventListener("input", () => {
    if (wurzleInput.value.length > 18) {
        wurzleInput.value = wurzleInput.value.slice(0, 18)
    }

    try {
        if (wurzleInput.value.length > 0) {
            evaluateNumberString(wurzleInput.value)
        }
        wurzleInput.style.color = "var(--input-color)"
    } catch {
        wurzleInput.style.color = "red"
    }
})

wurzleSubmitButton.addEventListener("click", () => {
    try {
        const x = evaluateNumberString(wurzleInput.value)
        wurzleGame.inputNumber(x)
        wurzleInput.value = ""
    } catch {}
})

wurzleInput.addEventListener("keydown", event => {
    if (event.key == "Enter") {
        wurzleSubmitButton.click()
    }
})

for (const button of revealFunctionButtons) {
    button.addEventListener("click", () => {
        fillDataElements("secret-function", " " + f.termString)

        const canvas = document.createElement("canvas")
        canvas.style.width = "100%"
        canvas.style.aspectRatio = "16 / 9"
        button.replaceWith(canvas)

        const plotter = new FunctionPlotter(canvas)
        plotter.addFunction(f)

        plotter.guessedPoints = wurzleGame.guesses.map(({input}) => {
            try {
                const x = parseFloat(input)
                const y = f.computeAt(x)
                return new Vector2d(x, y)
            } catch {
                return null
            }
        }).filter(g => g !== null)

        plotter.makeInteractive()
    
        for (const btn of revealFunctionButtons) {
            btn.remove()
        }
    })
}

wurzleClosePopupButton.addEventListener("click", () => {
    wurzlePopupBackground.style.display = "none"
    wurzleResultsPopup.style.display = "none"
})

for (const button of shareResultsButtons) {
    button.addEventListener("click", async () => {
        const shareText = wurzleGame.resultString
        const header = shareText.split("\n")[0]

        if (navigator.share) {
            navigator.share({
                title: header,
                text: shareText
            })
        } else {
            // gosh I really hate firefox
            await navigator.clipboard.writeText(shareText)
            alert("Copied Text to Clipboard!")
        }
    })

    if (trainingModeActive) {
        button.disabled = true
    }
}

enableTrainingModeButton.addEventListener("click", () => {
    location.href += "?training"
})

disableTrainingModeButton.addEventListener("click", () => {
    location.href = location.href.split("?")[0]
})

showResultsButton.addEventListener("click", () => {
    if (wurzleGame.state != WurzleGameState.Results) {
        return
    }

    showPopup()
})