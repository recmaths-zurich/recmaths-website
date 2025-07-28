const urlParams = new URLSearchParams(location.search)
let trainingModeActive = urlParams.has("training")
let oldWurzleActive = urlParams.has("w") && !isNaN(urlParams.get("w"))
let oldWurzleId = parseInt(urlParams.get("w"))
let testWurzleActive = urlParams.has("t")
let testWurzleFunctionString = urlParams.get("t")

if (trainingModeActive + oldWurzleActive + testWurzleActive > 1) {
    location.search = ""
}

let f = null
let wurzleGame = null
let secretFunctionString = null
let wurzleNumero = -1

async function init() {
    if (trainingModeActive) {
        revealElements("trainingmode")
        enableTrainingModeButton.style.display = "none"
        secretFunctionString = functionGenerator.generate()
        WurzleLoader.loadWurzles()
        revealElements("playtodayswurzle")
        fillDataElements("wurzle-author", "Random Generator")
    } else if (testWurzleActive) {
        try {
            secretFunctionString = atob(testWurzleFunctionString)
            revealElements("testmode")
        } catch (e) {
            if (e instanceof NumberParserError) {
                alert("Invalid Function String. Aborting.")
            } else {
                alert(e.message)
            }
            location.search = ""
        }
        revealElements("playtodayswurzle")
        disableTrainingModeButton.style.display = "none"
        fillDataElements("wurzle-author", "Anonymous Creator")
    } else {
        let wurzle = null
        revealElements("loading")

        try {
            if (oldWurzleActive) {
                wurzle = await WurzleLoader.getWurzleNumero(oldWurzleId)
                if (!wurzle) {
                    location.search = ""
                } else {
                    revealElements("oldwurzle")
                    revealElements("playtodayswurzle")
                }
            } else {
                wurzle = await WurzleLoader.getLatestWurzle()
            }
        } catch(e) {
            revealElements("failedtoload")
            hideElements("loading")
            throw e
        }

        hideElements("loading")

        secretFunctionString = wurzle.termString
        wurzleNumero = wurzle.numero
        disableTrainingModeButton.style.display = "none"
        
        fillDataElements("wurzle-date", wurzle.dateString)
        fillDataElements("wurzle-author", wurzle.author)
    }

    f = new WurzleFunction(secretFunctionString)
    wurzleGame = new WurzleGame(wurzleGridContainer, f)

    fillDataElements("secret-function", "f(x) = " + "#".repeat(6))
    fillDataElements("wurzle-numero", wurzleNumero)
}

wurzleInput.addEventListener("input", () => {
    wurzleInput.value = wurzleInput.value.toLowerCase()

    if (wurzleInput.value.length > 18) {
        wurzleInput.value = wurzleInput.value.slice(0, 18)
    }

    try {
        if (wurzleInput.value.length > 0) {
            evaluateNumberString(wurzleInput.value)
        }
        wurzleInput.style.color = "var(--cell-foreground-color)"
    } catch {
        wurzleInput.style.color = "var(--error-color)"
    }
})

let hasSentApiInitUpdate = false
wurzleSubmitButton.addEventListener("click", () => {
    try {
        const x = evaluateNumberString(wurzleInput.value)
        wurzleGame.inputNumber(x)
        wurzleInput.value = ""

        if (!hasSentApiInitUpdate) {
            hasSentApiInitUpdate = true
            // for usage monitoring
            fetch("https://www.noel-friedrich.de/wurzle-api/init.php")
        }
    } catch {}
})

wurzleInput.addEventListener("keydown", event => {
    if (event.key == "Enter") {
        wurzleSubmitButton.click()
    }
})

for (const button of revealFunctionButtons) {
    button.addEventListener("click", () => {
        fillDataElements("secret-function", "f(x) = " + f.termString)

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

        const { redraw } = plotter.makeInteractive()
        redrawActivePlot = redraw
    
        for (const btn of revealFunctionButtons) {
            btn.remove()
        }
    })
}

wurzleClosePopupButton.addEventListener("click", hidePopup)

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
    location.search = "training"
})

disableTrainingModeButton.addEventListener("click", () => {
    location.search = ""
})

showResultsButton.addEventListener("click", () => {
    if (wurzleGame.state != WurzleGameState.Results) {
        return
    }

    showPopup()
})

init()