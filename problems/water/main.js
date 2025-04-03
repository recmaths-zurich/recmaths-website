const gridParent = document.getElementById("grid-parent")
const simulateButton = document.getElementById("simulate-button")
const optimalButton = document.getElementById("optimal-button")

const N = 8

function makeGrid(n, func=()=>0) {
    return Array.from({length: n}).map((_, i) => Array.from({length: n}).map((_, j) => func(i, j)))
}

let grid = makeGrid(N, (i, j) => (i == j) ? 1 : 0)

function initGridElements() {
    const gridElements = []
    gridParent.style.setProperty("--n", N.toString())

    for (let i = 0; i < N; i++) {
        const row = []
        for (let j = 0; j < N; j++) {
            const cellElement = document.createElement("div")
            cellElement.classList.add("cell")
            cellElement.textContent = 0
            gridParent.appendChild(cellElement)
            row.push(cellElement)

            cellElement.addEventListener("click", event => {
                stopSimulationSignal = true

                if (grid[i][j]) {
                    grid[i][j] = 0
                } else {
                    grid[i][j] = 1
                }

                event.preventDefault()
                showGrid(grid)
            })
        }
        gridElements.push(row)
    }

    return gridElements
}

const gridElements = initGridElements()

function showGrid(grid) {
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            const value = grid[i][j]
            const element = gridElements[i][j]
            if (value > 0) {
                element.textContent = value
            } else {
                element.textContent = ""
            }

            if (value > 0) {
                const transparency = Math.exp(-(0.05 * (value - 1))) * 0.6 + 0.4
                element.style.backgroundColor = `rgba(0, 0, 255, ${transparency})`
            } else {
                element.style.backgroundColor = ""
            }
        }
    }
}

let isSimulating = false
let stopSimulationSignal = false

function iteration(grid, k) {
    let madeChange = false
    const gridCopy = makeGrid(N, (i, j) => grid[i][j])
    for (let x = 0; x < N; x++) {
        for (let y = 0; y < N; y++) {
            if (grid[x][y]) continue;

            let sum = 0;
            if (x > 0) sum += grid[x - 1][y] ? 1 : 0;
            if (y > 0) sum += grid[x][y - 1] ? 1 : 0;
            if (x < N - 1) sum += grid[x + 1][y] ? 1 : 0;
            if (y < N - 1) sum += grid[x][y + 1] ? 1 : 0;

            if (sum >= 2) {
                gridCopy[x][y] = k
                madeChange = true
            }
        }
    }
    if (madeChange) {
        return gridCopy
    } else {
        return null
    }
}

async function simulate() {
    if (isSimulating) {
        stopSimulationSignal = true
        return
    }

    stopSimulationSignal = false
    isSimulating = true

    let currGrid = grid
    let k = 2
    while (true) {
        if (stopSimulationSignal) {
            isSimulating = false
            showGrid(grid)
            return
        }
    
        currGrid = iteration(currGrid, k)
        if (currGrid) {
            showGrid(currGrid)
        } else {
            break
        }

        k += 1
        await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    showGrid(grid)

    isSimulating = false
}

simulateButton.addEventListener("click", simulate)

optimalButton.addEventListener("click", () => {
    stopSimulationSignal = true

    grid = [
        [1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 1, 0, 0, 0],
        [1, 0, 1, 0, 0, 0, 1, 1],
    ]

    showGrid(grid)
})

showGrid(grid)