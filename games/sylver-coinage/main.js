const numInput = document.getElementById("num-input")
const numInputSubmitButton = document.getElementById("submit-num-button")
const gamesContainer = document.getElementById("games-container")
const errorOutput = document.getElementById("error-out")

let gameCounter = 1

class SylverCoinageGame {

    initElements() {
        const gameContainer = document.createElement("p")

        const titleContainer = document.createElement("div")
        const spanEn = document.createElement("en")
        const spanDe = document.createElement("de")
        spanEn.textContent = `Game #${this.gameNumber}: `
        spanDe.textContent = `Spiel #${this.gameNumber}: `
        spanEn.lang = "en"
        spanDe.lang = "de"
        spanEn.style.fontStyle = "italic"
        spanDe.style.fontStyle = "italic"
        
        titleContainer.appendChild(spanEn)
        titleContainer.appendChild(spanDe)
        titleContainer.style.display = "inline"
        gameContainer.appendChild(titleContainer)

        const outContainer = document.createElement("div")
        outContainer.classList.add("nums")
        this.outContainer = outContainer
        gameContainer.appendChild(outContainer)

        outContainer.style.font = "monospace"

        const firstGame = gamesContainer.children[0]
        if (firstGame) {
            gamesContainer.insertBefore(gameContainer, firstGame)
        } else {
            gamesContainer.appendChild(gameContainer)
        }
    }

    constructor(gameNumber) {
        this.enteredNumbers = []
        this.gameNumber = gameNumber
        this.initElements()

        this.finished = false
    }

    computeLinearCombinationString(target, numbers) {
        if (target < 0) return null
        if (target === 0) return "0 = 0"
        
        const nums = [...new Set(numbers)]
            .filter(n => Number.isInteger(n) && n > 0 && n <= target)
        
        if (nums.length === 0) return null
        
        const reachable = new Uint8Array(target + 1)
        const previous = new Int32Array(target + 1)
        previous.fill(-1)
        
        reachable[0] = 1
        
        for (const n of nums) {
            for (let x = n; x <= target; x++) {
                if (!reachable[x] && reachable[x - n]) {
                    reachable[x] = 1
                    previous[x] = n
                }
            }
        }
        
        if (!reachable[target]) return null
        
        // Reconstruct coefficients
        const counts = new Map()
        let x = target
        
        while (x > 0) {
            const n = previous[x]
            counts.set(n, (counts.get(n) ?? 0) + 1)
            x -= n
        }
        
        const expression = [...counts.entries()]
            .map(([n, count]) => `${n} * ${count}`)
            .join(" + ")
        
        return `${expression} = ${target}`
    }

    submitNumber(num) {
        if (this.finished) {
            return {ok: false, error: "Game has already finished."}
        }
        
        if (num >= 1e8) {
            return {ok: false, error: "Please enter numbers below 10 million"}
        }
        
        if (num < 1 || !Number.isInteger(num)) {
            return {ok: false, error: "Number must be positive integer"}
        }
        
        const combStr = this.computeLinearCombinationString(num, this.enteredNumbers)
        if (combStr) {
            return {ok: false, error: `Number is a linear combination (${combStr})`}
        }

        this.enteredNumbers.push(num)

        if (num == 1) {
            this.finished = true
        }
        
        return {ok: true}
    }

    render() {
        if (this.enteredNumbers.length == 0) {
            this.outContainer.innerHTML = "/"
        } else {
            this.outContainer.innerHTML = ""
            
            const elements = game.enteredNumbers.map(n => {
                const elem = document.createElement("div")
                elem.textContent = n
                return elem
            })

            for (const elem of elements) {
                this.outContainer.appendChild(elem)
            }
        }
    }
    
}

let game = new SylverCoinageGame(gameCounter++)
game.render()

numInput.addEventListener("keydown", event => {
    if (event.key == "Enter") {
        numInputSubmitButton.click()
    }
})

numInputSubmitButton.addEventListener("click", () => {
    const result = game.submitNumber(parseFloat(numInput.value))
    if (result.ok) {
        errorOutput.style.display = "none"
        numInput.value = ""
        numInput.focus()
    } else {
        errorOutput.style.display = "block"
        errorOutput.textContent = result.error
    }
    game.render()

    if (game.finished) {
        game = new SylverCoinageGame(gameCounter++)
        game.render()
    }
})