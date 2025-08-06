class DuelGame {

    constructor() {
        this.cellGrid = null
        this.cellValues = Array.from({length: NUM_TOTAL_ROWS}, () => Array.from({length: NUM_CELLS_PER_ROW}, () => null))

        this.symbolStack = []
        this.finishCallbacks = []
    }

    initHtml() {
        this.cellGrid = []
        duelGridContainer.innerHTML = ""

        for (let i = 0; i < this.cellValues.length; i++) {
            const rowContainer = document.createElement("div")
            rowContainer.classList.add("duel-grid-row")
            this.cellGrid.push([])
            
            for (let j = 0; j < this.cellValues[i].length; j++) {
                const cellElement = document.createElement("div")
                cellElement.classList.add("duel-grid-cell")
                
                this.cellGrid[i].push(cellElement)
                rowContainer.appendChild(cellElement)
            }

            duelGridContainer.appendChild(rowContainer)
        }

        this.update()

        for (const [pos, cell, _] of this.iterateCells()) {
            cell.addEventListener("click", () => {
                if (this.symbolStack.length == 0 || !cell.classList.contains("empty")) {
                    return
                }

                this.cellValues[pos.y][pos.x] = this.symbolStack.shift()
                this.update()

                if (this.symbolStack.length == 0) {
                    for (const finishCallback of this.finishCallbacks) {
                        finishCallback()
                    }
                }
            })
        }
    }

    *iterateCells() {
        if (!this.cellGrid) {
            return
        }

        for (let i = 0; i < this.cellGrid.length; i++) {
            for (let j = 0; j < this.cellGrid[i].length; j++) {
                yield [new Vector2d(j, i), this.cellGrid[i][j], this.cellValues[i][j]]
            }
        }
    }

    update() {
        const cellValueToString = v => v.toString().replace("/", "÷").replace("*", "×")

        for (const [pos, cell, value] of this.iterateCells()) {
            if (value === null) {
                cell.classList.add("empty")

                if (this.symbolStack.length > 0) {
                    cell.classList.add("clickable")
                } else {
                    cell.classList.remove("clickable")
                }

                cell.textContent = ""
            } else {
                cell.classList.remove("empty")
                cell.classList.remove("clickable")

                cell.textContent = cellValueToString(value)
            }
        }

        if (this.symbolStack.length > 0) {
            duelAvailableContainer.style.display = "flex"
            duelAvailableCell.textContent = cellValueToString(this.symbolStack[0])
        } else {
            duelAvailableContainer.style.display = "none"
        }

        fillDataElements("stack-size", this.symbolStack.length)
    }

    computeResults() {
        const results = []

        for (let i = 0; i < this.cellGrid.length; i++) {
            const termString = this.cellValues[i].filter(v => !!v).join("")
            try {
                const value = evaluateNumberString(termString)
                results.push(value)
            } catch {
                results.push(null)
            }
        }

        return results
    }

    fillStackRandomly() {
        this.symbolStack = []
        for (let i = 0; i < STACK_SIZE; i++) {
            let randomSymbol = Math.floor(Math.random() * 10).toString()

            if (i < 6) {
                randomSymbol = weightedRandomChoice(["+", "-", "*", "/", "^"])
            }

            this.symbolStack.push(randomSymbol)
        }

        shuffle(this.symbolStack)
    }

    start() {
        this.fillStackRandomly()
        this.update()
    }

    onFinish(callBack) {
        this.finishCallbacks.push(callBack)
    }

}