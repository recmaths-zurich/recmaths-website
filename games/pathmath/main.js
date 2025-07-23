class PathMathGame {

    constructor(numberMatrix, goalNumber) {
        this.numberMatrix = numberMatrix
        this.goalNumber = goalNumber
        this.cellGrid = []
    }

    get size() {
        return new Vector2d(this.numberMatrix[0].length, this.numberMatrix.length)
    }

    initHtml() {
        pathMathGrid.style.setProperty("--grid-size-x", this.size.x)
        pathMathGrid.style.setProperty("--grid-size-y", this.size.y)

        let lastCell = null

        this.cellGrid = []
        for (let i = 0; i < this.numberMatrix.length; i++) {
            const cellRow = []
            for (let j = 0; j < this.numberMatrix[i].length; j++) {
                const cellElement = document.createElement("div")
                cellElement.classList.add("pathmath-cell")
                cellElement.textContent = this.numberMatrix[i][j]
                cellElement.dataset.x = j
                cellElement.dataset.y = i
                pathMathGrid.appendChild(cellElement)
                
                lastCell = cellElement
                cellRow.push(cellElement)
            }
            this.cellGrid.push(cellRow)
        }

        goalOutput.textContent = this.goalNumber

        const updateGridSize = () => pathMathGlobal.style.setProperty("--grid-cell-size-px", `${lastCell.clientWidth}px`)
        
        addEventListener("resize", updateGridSize)
        updateGridSize()
    }

    submitNumberPath(numbers, positionDeltas) {
        const MovementType = {
            Addition: 0,
            Multiplication: 1
        }

        const movements = positionDeltas.map(delta => {
            const manhattanLength = Math.abs(delta.x) + Math.abs(delta.y)
            if (manhattanLength == 2) {
                return MovementType.Multiplication
            } else {
                return MovementType.Addition
            }
        })

        const possibleResults = new Set()
        function recurse(currValue, numbersLeft, movementsLeft) {
            if (numbersLeft.length == 0) {
                possibleResults.add(currValue)
                return
            }

            const number = numbersLeft.shift()
            const movement = movementsLeft.shift()
            
            if (movement == MovementType.Addition) {
                recurse(currValue + number, numbersLeft.slice(), movementsLeft.slice())
                recurse(currValue - number, numbersLeft.slice(), movementsLeft.slice())
            } else {
                recurse(currValue * number, numbersLeft.slice(), movementsLeft.slice())
            }
        }

        recurse(numbers[0], numbers.slice(1), movements)

        if (possibleResults.has(this.goalNumber)) {
            alert("You won!")
        }
    }

    makeInteractive() {
        let isDragging = false

        let currPath = []
        let currNumbers = []

        const canAddToPath = v => {
            if (currPath.length == 0) {
                return true
            }

            for (const other of currPath) {
                if (other.x == v.x && other.y == v.y) {
                    return false
                }
            }

            const lastPathVector = currPath[currPath.length - 1]
            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    if (x + v.x == lastPathVector.x && y + v.y == lastPathVector.y) {
                        if (x == 0 && y == 0) {
                            return false 
                        } else {
                            return true
                        }
                    }
                }
            }

            return false
        }

        const globalMouseup = () => {
            const positionDeltas = currPath.slice(1).map((p, i) => p.sub(currPath[i]))
            this.submitNumberPath(currNumbers, positionDeltas)

            currPath = []
            currNumbers = []
            isDragging = false

            redrawPath()
        }

        const redrawPath = () => {
            for (const cell of this.cellGrid.flat()) {
                cell.classList.remove("pathstart")
                cell.classList.remove("inpath")
            }

            for (const v of currPath) {
                this.cellGrid[v.y][v.x].classList.add("inpath")
            }

            if (currPath.length > 0) {
                const v = currPath[0]
                this.cellGrid[v.y][v.x].classList.add("pathstart")
            }

            drawPathOnBackground(this.cellGrid, currPath)
        }

        addEventListener("mouseup", globalMouseup)
        addEventListener("touchend", globalMouseup)

        // use numberMatrix as template for size
        const infoGrid = JSON.parse(JSON.stringify(this.numberMatrix))

        for (let x = 0; x < this.size.x; x++) {
            for (let y = 0; y < this.size.y; y++) {
                const position = new Vector2d(x, y)
                const cell = this.cellGrid[y][x]
                const num = this.numberMatrix[y][x]

                const mousedown = event => {
                    event.preventDefault()

                    isDragging = true
                    if (!canAddToPath(position)) {
                        return
                    }

                    currPath.push(position)
                    currNumbers.push(num)
                    
                    redrawPath()
                }

                const mousemove = event => {
                    event.preventDefault()

                    if (!isDragging || !canAddToPath(position)) {
                        return
                    }

                    currPath.push(position)
                    currNumbers.push(num)

                    redrawPath()
                }

                const touchmove = event => {
                    const touch = event.touches[0]
                    const pageCoords = new Vector2d(touch.clientX, touch.clientY)
                    const target = document.elementFromPoint(pageCoords.x, pageCoords.y)
                    if (target.classList.contains("pathmath-cell")) {
                        const v = new Vector2d(target.dataset.x, target.dataset.y)
                        infoGrid[v.y][v.x].mousemove(event)
                    }
                }

                infoGrid[y][x] = {mousemove, mousedown, touchmove}

                cell.addEventListener("mousedown", mousedown)
                cell.addEventListener("mousemove", mousemove)
                cell.addEventListener("touchstart", mousedown)
                cell.addEventListener("touchmove", touchmove)
            }
        }
    }

}

const game = new PathMathGame([
    [2, 3, 8],
    [6, 1, 10],
    [1, 7, 3]
], 36)

document.body.onload = () => {
    game.initHtml()
    game.makeInteractive()
}