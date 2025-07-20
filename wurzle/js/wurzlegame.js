const WurzleGameState = {
    Playing: "playing",
    Results: "results"
}

class WurzleGame {

    constructor(cellsContainer, wurzleFunction) {
        this.cellsContainer = cellsContainer
        this.wurzleFunction = wurzleFunction

        this.guesses = []
        this.state = WurzleGameState.Playing
    }

    addHtmlRow(stringInput, stringOutput) {
        /* 
            <div class="wurzle-grid-row">
                <div class="wurzle-grid-row-header">
                    f(0.123)
                </div>
                <div class="wurzle-grid-row-cells">
                    <div class="wurzle-grid-cell">&lt;</div>
                    <div class="wurzle-grid-cell">-</div>
                    <div class="wurzle-grid-cell">9</div>
                    <div class="wurzle-grid-cell">9</div>
                    <div class="wurzle-grid-cell">9</div>
                </div>
            </div>
        */

        const row = document.createElement("div")
        row.classList.add("wurzle-grid-row")

        const header = document.createElement("div")
        header.classList.add("wurzle-grid-row-header")
        header.textContent = `f(${stringInput})`

        const cells = document.createElement("div")
        cells.classList.add("wurzle-grid-row-cells")

        let won = true
        for (let i = 0; i < NUM_CELLS_PER_ROW; i++) {
            const cell = document.createElement("div")
            cell.classList.add("wurzle-grid-cell")
            if (i < stringOutput.length) {
                cell.textContent = stringOutput[i]
            } else {
                cell.textContent = "_"
            }
            cells.appendChild(cell)

            cell.style.transform = "scaleY(-1)"
            cell.style.color = CELL_HIDDEN_BACKGROUND_COLOR
            cell.style.backgroundColor = CELL_HIDDEN_BACKGROUND_COLOR

            let cellColor = (
                stringOutput[i] == "0"
                || (i < NUM_CELLS_PER_ROW - 1 && stringOutput[i] == "." && stringOutput[i + 1] == "0")
                || (i < NUM_CELLS_PER_ROW - 1 && stringOutput[i] == "=" && stringOutput[i + 1] == "0")
                || (i < NUM_CELLS_PER_ROW - 2 && stringOutput[i] == "=" && stringOutput[i + 1] == "-" && stringOutput[i + 2] == "0")
                || (i < NUM_CELLS_PER_ROW - 2 && stringOutput[i] == "≈" && stringOutput[i + 1] == "-" && stringOutput[i + 2] == "0")
                || (i < NUM_CELLS_PER_ROW - 1 && stringOutput[i] == "≈" && stringOutput[i + 1] == "0")
                || (i < NUM_CELLS_PER_ROW - 1 && stringOutput[i] == "-" && stringOutput[i + 1] == "0")
                || (i == NUM_CELLS_PER_ROW - 1 && stringOutput[i] == ".")
            ) ? CELL_GOOD_BACKGROUND_COLOR : CELL_CARD_BACKGROUND_COLOR

            if (cellColor != CELL_GOOD_BACKGROUND_COLOR) {
                won = false
            }

            setTimeout(() => {
                cell.animate([
                    {transform: "scaleY(-1)", backgroundColor: CELL_HIDDEN_BACKGROUND_COLOR, color: CELL_HIDDEN_BACKGROUND_COLOR},
                    {transform: "scaleY(0)", backgroundColor: cellColor, color: CELL_FOREGROUND_COLOR},
                    {transform: "scaleY(1)", backgroundColor: cellColor, color: CELL_FOREGROUND_COLOR}
                ], {
                    duration: 500,
                    fill: "forwards",
                    easing: "ease-out"
                })
            }, NUM_CELLS_PER_ROW * 200 - i * 200)
        }

        row.appendChild(header)
        row.appendChild(cells)

        this.cellsContainer.appendChild(row)

        return won
    }

    makeResultsString() {
        const characterEmojiMap = {
            "0": "0️⃣", "1": "1️⃣", "2": "2️⃣",
            "3": "3️⃣", "4": "4️⃣", "5": "5️⃣",
            "6": "6️⃣", "7": "7️⃣", "8": "8️⃣",
            "9": "9️⃣", ".": "*️⃣", "-": "⛔"
            
        }

        let str = `Wurzle #${wurzleNumero} ${this.guesses.length}/${NUM_MAX_GUESSES}\n`
        for (const guess of this.guesses) {
            for (const char of guess.output) {
                if (characterEmojiMap[char]) {
                    str += characterEmojiMap[char]
                }
            }
            str += "\n"
        }
        
        str += `recmaths.ch/wurzle`
        return str
    }

    endgame() {
        fillDataElements("num-guesses", this.guesses.length)
        wurzlePopupBackground.style.display = "block"
        wurzleResultsPopup.style.display = "block"
        wurzleInputContainer.style.display = "none"
        wurzleShareContainer.style.display = "block"

        this.resultString = this.makeResultsString()
    }

    win() {
        this.endgame()
        wurzleGoodResultsContainer.style.display = "block"
        wurzleBadResultsContainer.style.display = "none"
    }

    lose() {
        this.endgame()
        wurzleGoodResultsContainer.style.display = "none"
        wurzleBadResultsContainer.style.display = "block"
    }

    inputNumber(number) {
        if (this.state !== WurzleGameState.Playing) {
            return false
        }

        const stringInput = number.toString()
        const stringOutput = this.wurzleFunction.computeStringResultAt(number)
        this.guesses.push({input: stringInput, output: stringOutput})
        const won = this.addHtmlRow(stringInput, stringOutput)
        if (won) {
            setTimeout(() => this.win(), 1700)
            this.state = WurzleGameState.Results
        } else if (this.guesses.length >= NUM_MAX_GUESSES) {
            setTimeout(() => this.lose(), 1700)
            this.state = WurzleGameState.Results
        }

        return won
    }

}