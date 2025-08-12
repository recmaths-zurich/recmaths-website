const test = new PersonalityTest(TestQuestions)
test.initHtml()

finishQuestionsButton.addEventListener("click", () => {
    const unfinishedQuestionIndex = test.getUnfinishedQuestionIndex()
    if (unfinishedQuestionIndex !== null) {
        test.questionContainers[unfinishedQuestionIndex].scrollIntoView({ behavior: "smooth" })
        return
    }

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
        resultsContainer.scrollIntoView({ behavior: "smooth" })
    }, 100)

    finishQuestionsButton.remove()

    const f = new WurzleFunction(personality.termString)
    const plotter = new FunctionPlotter(resultFunctionCanvas, resultFunctionContext)
    plotter.viewCentre = new Vector2d(0, 0)
    plotter.viewHeight = 12
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