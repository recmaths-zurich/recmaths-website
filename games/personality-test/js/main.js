const test = new PersonalityTest(TestQuestions)
test.initHtml()

let showingResults = false

finishQuestionsButton.addEventListener("click", () => {
    const unfinishedQuestionIndex = test.getUnfinishedQuestionIndex()
    if (unfinishedQuestionIndex !== null) {
        test.questionContainers[unfinishedQuestionIndex].scrollIntoView({ behavior: "smooth", block: "center" })
        return
    }

    showingResults = true

    resultsContainer.style.display = "block"
    const personality = test.computePersonality()

    resultFunction.textContent = `f(x) = ${personality.termString}`

    for (const [langKey, langValue] of Object.entries(personality.description)) {
        const resultDescriptionText = document.createElement("div")
        resultDescriptionText.classList.add("result-description-text")
        resultDescriptionText.textContent = langValue
        resultDescriptionText.setAttribute("lang", langKey)
        resultDescription.appendChild(resultDescriptionText)
    }

    setTimeout(() => {
        shareResultsButton.scrollIntoView({ behavior: "smooth", block: "end" })
    }, 100)

    finishQuestionsButton.remove()

    const f = new WurzleFunction(personality.termString)
    const plotter = new FunctionPlotter(resultFunctionCanvas, resultFunctionContext)
    plotter.viewCentre = new Vector2d(0, 0)
    plotter.viewHeight = 12
    plotter.drawGridLines = true
    plotter.addFunction(f)
    plotter.makeInteractive()

    const personalityScores = test.computePersonalityScores()
    for (const {name, score} of personalityScores) {
        const row = document.createElement("tr")
        const nameCell = document.createElement("td")
        nameCell.textContent = name
        const scoreCell = document.createElement("td")
        scoreCell.textContent = score.toFixed(2)
        row.appendChild(nameCell)
        row.appendChild(scoreCell)
        resultsTableBody.appendChild(row)
    }
})

async function shareResult() {
    if (!showingResults) {
        return
    }

    const personality = test.computePersonality()
    const scores = test.computePersonalityScores()
    const resultTerm = personality.termString
    const resultScore = scores[0].score.toFixed(2)

    let shareText = `📈 Personality Test 📉\nf(x) = ${resultTerm} (confidence=${resultScore}%)\nrecmaths.ch/games/personality-test`
    if (document.documentElement.lang.startsWith("de")) {
        shareText = `📈 Persönlichkeitstest 📉\nf(x) = ${resultTerm} (Sicherheit=${resultScore}%)\nrecmaths.ch/games/personality-test`
    }

    const fallBackShare = async () => {
        // copy to clipboard instead and show a message
        await navigator.clipboard.writeText(shareText)
        if (document.documentElement.lang.startsWith("de")) {
            alert("Ergebnis in die Zwischenablage kopiert")
        } else {
            alert("Result copied to clipboard")
        }
    }

    const imageBlob = await generateShareImage(resultTerm)
    if (!imageBlob || !window.navigator.share) {
        await fallBackShare()
        return
    }

    const shareData = {
        title: "Personality Test Result",
        text: shareText,
        files: [new File([imageBlob], "result.png", { type: "image/png" })]
    }

    try {
        await navigator.share(shareData)
    } catch (error) {
        console.error("Error sharing result:", error)
        await fallBackShare()
    }
}