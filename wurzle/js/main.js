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
}