const urlParams = new URLSearchParams(window.location.search)

class PersonalityTest {

    constructor(questions) {
        this.questions = questions.map(q => {
            q.answerIndex = urlParams.has("r") ? Math.floor(Math.random() * NUM_BUTTONS_PER_QUESTION) : null
            return q
        })
        shuffle(this.questions)
    }

    initHtml() {
        this.questionContainers = []
        questionsContainer.innerHTML = ""

        let nextQuestionIndex = 0
        for (const question of this.questions) {
            nextQuestionIndex++
            const questionContainer = document.createElement("div")
            questionContainer.classList.add("question-container")

            const questionHeader = document.createElement("div")
            questionHeader.classList.add("question-header")

            for (const [langKey, langValue] of Object.entries(question.statement)) {
                const questionHeaderText = document.createElement("div")
                questionHeaderText.classList.add("question-header-text")
                questionHeaderText.textContent = `(${nextQuestionIndex}/${this.questions.length}) ${langValue}`
                questionHeaderText.setAttribute("lang", langKey)
                questionHeader.appendChild(questionHeaderText)
            }

            const questionBody = document.createElement("div")
            questionBody.classList.add("question-body")

            const questionButtonsContainer = document.createElement("div")
            questionButtonsContainer.classList.add("question-buttons-container")

            const allQuestionButtons = []

            const updateButtons = () => {
                for (let i = 0; i < NUM_BUTTONS_PER_QUESTION; i++) {
                    const button = allQuestionButtons[i]
                    if (i === question.answerIndex) {
                        button.classList.add("selected")
                        button.classList.remove("noanswer")
                    } else {
                        button.classList.remove("selected")
                        button.classList.remove("noanswer")
                    }

                    if (question.answerIndex === null) {
                        button.classList.add("noanswer")
                        button.classList.remove("selected")
                    }
                }

                if (question.answerIndex !== null) {
                    questionContainer.classList.add("answered")
                } else {
                    questionContainer.classList.remove("answered")
                }
            }

            for (let i = 0; i < NUM_BUTTONS_PER_QUESTION; i++) {
                const questionButton = document.createElement("button")
                questionButton.classList.add("question-button")
                
                allQuestionButtons.push(questionButton)
                questionButtonsContainer.appendChild(questionButton)

                questionButton.addEventListener("click", () => {
                    if (showingResults) return

                    question.answerIndex = i
                    updateButtons()

                    const smallestUnselectedIndex = this.getUnfinishedQuestionIndex()
                    if (smallestUnselectedIndex !== null && this.questionContainers[smallestUnselectedIndex]) {

                        // next question should be scrolled into view middle
                        this.questionContainers[smallestUnselectedIndex].scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                        })
                    } else if (smallestUnselectedIndex === null) {
                        finishQuestionsButton.scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                        })
                    }
                })
            }

            updateButtons()

            const questionExplainContainer = document.createElement("div")
            questionExplainContainer.classList.add("question-explain-container")
            
            const questionAgree = document.createElement("div")
            questionAgree.classList.add("agree")

            const questionDisagree = document.createElement("div")
            questionDisagree.classList.add("disagree")

            questionExplainContainer.appendChild(questionAgree)
            questionExplainContainer.appendChild(questionDisagree)
            questionBody.appendChild(questionButtonsContainer)
            questionBody.appendChild(questionExplainContainer)
            questionContainer.appendChild(questionHeader)
            questionContainer.appendChild(questionBody)

            questionsContainer.appendChild(questionContainer)

            this.questionContainers.push(questionContainer)
        }
    }

    computeResults() {
        const result = Object.fromEntries(Array.from(Object.keys(TestResultCategories)).map(key => [key, 0]))

        const halfNumButtons = Math.floor(NUM_BUTTONS_PER_QUESTION / 2)

        for (const question of this.questions) {
            if (question.answerIndex === null) continue

            // agreement: 1 (agree) to -1 (disagree)
            const agreement = (halfNumButtons - question.answerIndex) / halfNumButtons

            // agreementFactor: 1 (agree) to 0 (disagree)
            const agreementFactor = (agreement + 1) / 2
        
            const effectKeys = Object.keys(question.effect.agree)
            for (const key of effectKeys) {
                const agreeEffect = question.effect.agree[key] || 0
                const disagreeEffect = question.effect.disagree[key] || 0
                const interpolatedEffect = agreeEffect * agreementFactor + disagreeEffect * (1 - agreementFactor)
                result[key] += interpolatedEffect
            }
        }

        const sigmoid = x => 2 / (1 + Math.exp(-x)) - 1

        for (const key of Object.keys(result)) {
            result[key] = sigmoid(result[key])
            result[key] = Math.round(result[key] * 100) / 100 // round to 2 decimal places
        }

        return result
    }

    computePersonality() {
        const result = this.computeResults()
        let personality = {}
        let bestDistance = Infinity

        for (const testResult of TestResults) {
            const distance = Object.keys(result).reduce((sum, key) => {
                return sum + Math.pow(result[key] - testResult.location[key], 2)
            }, 0)

            if (distance < bestDistance) {
                bestDistance = distance
                personality = testResult
            }
        }

        return personality
    }

    computePersonalityScores() {
        const result = this.computeResults()
        // length of longest diagonal in n-d hypercube with side length 2
        const maxDistance = 2 * Math.sqrt(Object.keys(result).length)

        const results = TestResults.map(testResult => {
            const distance = Math.sqrt(Object.keys(result).reduce((sum, key) => {
                return sum + Math.pow(result[key] - testResult.location[key], 2)
            }, 0))

            return {
                name: testResult.termString,
                distance: distance
            }
        })

        // shorter distances are better
        results.sort((a, b) => a.distance - b.distance)
        const scores = results.map(result => {
            return {
                name: result.name,
                score: Math.round(((1 - result.distance / maxDistance) ** 2) * 10000) / 100
            }
        })

        return scores
    }

    getUnfinishedQuestionIndex() {
        for (let i = 0; i < this.questions.length; i++) {
            if (this.questions[i].answerIndex === null) {
                return i
            }
        }
        return null
    }

}