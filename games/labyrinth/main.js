const labyrinthCanvas = document.getElementById("labyrinth-canvas")
const labyrinthContext2d = labyrinthCanvas.getContext("2d")
const labyrinthSizeInput = document.getElementById("labyrinth-size-input")

class MazeCell {

    constructor(hasWallAtBottom=false, hasWallAtRight=false) {
        this.hasWallAtBottom = hasWallAtBottom
        this.hasWallAtRight = hasWallAtRight
    }

    static get packed() {
        return new MazeCell(true, true)
    }

}

class Maze {

    constructor(cellGrid) {
        // wallGrid is a grid of size (n, m) representing the walls of the maze.
        // Each cell stores whether it has a wall at its southern and/or eastern
        // edge. The bottom/estern-most row/column will have those edges ignored.
        // Each element of cellGrid is a row.
        this.cellGrid = cellGrid ?? []
        this.size = new Vector2d(this.cellGrid[0].length, this.cellGrid.length)
    }

    static* generateRandomly(size) {
        const cellGrid = Array.from({length: size.y})
            .map(() => Array.from({length: size.x})
            .map(() => MazeCell.packed))

        const positionStack = [size.scale(0.5).floor()]
        let visitCount = 0

        const directions = [
            new Vector2d(0, 1),
            new Vector2d(0, -1),
            new Vector2d(1, 0),
            new Vector2d(-1, 0),
        ]

        const visitedMap = cellGrid.map(r => r.map(() => false))

        const isInBounds = v => (
            v.x >= 0 && v.y >= 0 &&
            v.x < size.x && v.y < size.y
        )

        const maze = new Maze(cellGrid)
        
        let iterationCount = 0
        while (visitCount < size.product()) {
            const randomStackIndex = Math.floor(Math.random() * positionStack.length)
            const randomStackPosition = positionStack[randomStackIndex]
            
            if (iterationCount++ > 10_000_000) {
                throw new Error("Too many iterations")
            }

            const possibleDirections = []
            for (const direction of directions) {
                const pos = randomStackPosition.add(direction)
                if (isInBounds(pos) && !visitedMap[pos.y][pos.x]) {
                    possibleDirections.push(direction)
                }
            }

            if (possibleDirections.length == 0) {
                positionStack.splice(randomStackIndex, 1)
                continue
            }

            const randomDirection = possibleDirections[Math.floor(Math.random() * possibleDirections.length)]
            const newPosition = randomStackPosition.add(randomDirection)

            visitedMap[newPosition.y][newPosition.x] = true
            positionStack.push(newPosition)

            if (randomDirection.x > 0) {
                cellGrid[randomStackPosition.y][randomStackPosition.x].hasWallAtRight = false
            } else if (randomDirection.x < 0) {
                cellGrid[newPosition.y][newPosition.x].hasWallAtRight = false
            } else if (randomDirection.y > 0) {
                cellGrid[randomStackPosition.y][randomStackPosition.x].hasWallAtBottom = false
            } else if (randomDirection.y < 0) {
                cellGrid[newPosition.y][newPosition.x].hasWallAtBottom = false
            }

            visitCount++

            yield maze
        }

        yield maze
    }

    drawTo(context2d, {
        wallColor="black",
        sorroundingWallWidth=2,
        normalWallWidth=1,
    }={}) {
        context2d.clearRect(0, 0, context2d.canvas.width, context2d.canvas.height)
        context2d.canvas.width = context2d.canvas.clientWidth
        context2d.canvas.height = context2d.canvas.width * (this.size.y / this.size.x)

        const canvasSize = new Vector2d(context2d.canvas.width, context2d.canvas.height)
        const canvasMazeSize = canvasSize.copy()
        const cellSize = canvasMazeSize.div(this.size)
        const cellOffset = Vector2d.unit11.scale(sorroundingWallWidth)

        function drawWall(pos1, pos2, width=normalWallWidth, color=wallColor) {
            pos1.isub(Vector2d.unit11)
            pos2.isub(Vector2d.unit11)

            context2d.beginPath()
            context2d.moveTo(pos1.x, pos1.y)
            context2d.lineTo(pos2.x, pos2.y)
            context2d.lineWidth = width
            context2d.strokeStyle = color
            context2d.stroke()
        }

        for (let y = 0; y < this.size.y; y++) {
            for (let x = 0; x < this.size.x; x++) {
                const cell = this.cellGrid[y][x]
                const position = cellOffset.add(cellSize.scaleX(x).scaleY(y))
                
                if (cell.hasWallAtRight && x < this.size.x - 1) {
                    drawWall(
                        position.add(Vector2d.unit10.mul(cellSize)),
                        position.add(cellSize)
                    )
                }

                if (cell.hasWallAtBottom && y < this.size.y - 1) {
                    drawWall(
                        position.add(Vector2d.unit01.mul(cellSize)),
                        position.add(cellSize)
                    )
                }
            }
        }
    }

}

let maze = null
let running = false
let stopSignal = false
let timeoutIndex = null

async function regen() {
    if (running) {
        stopSignal = true

        if (timeoutIndex !== null) {
            clearTimeout(timeoutIndex)
        }

        timeoutIndex = setTimeout(regen, 10)
        return
    }

    running = true

    const sizeDivisor = Math.round((1 - labyrinthSizeInput.value / 100) ** 2 * 85 + 15)
    const mazeSize = new Vector2d(window.innerWidth, window.innerHeight)
        .div(Vector2d.unit11.scale(sizeDivisor)).round()
    
    maze = null
    for (const m of Maze.generateRandomly(mazeSize)) {
        maze = m

        if (Math.random() < 0.1) {
            await new Promise(resolve => setTimeout(resolve, 0))
        }

        maze.drawTo(labyrinthContext2d)
    }

    running = false
}

window.addEventListener("resize", regen)
window.addEventListener("DOMContentLoaded", regen)
labyrinthSizeInput.addEventListener("input", regen)