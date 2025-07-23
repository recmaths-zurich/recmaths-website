function drawPathOnBackground(cellGrid, pathVectors) {
    const positionOfCell = cellElement => {
        const cellRect = cellElement.getBoundingClientRect()
        const canvasRect = pathMathGridBackground.getBoundingClientRect()
        return new Vector2d(
            cellRect.left - canvasRect.left + cellRect.width / 2,
            cellRect.top - canvasRect.top + cellRect.height / 2
        )
    }

    pathMathGridBackground.width = pathMathGridBackground.clientWidth
    pathMathGridBackground.height = pathMathGridBackground.clientHeight
    context.clearRect(0, 0, pathMathGridBackground.width, pathMathGridBackground.height)

    context.strokeStyle = getComputedStyle(pathMathGlobal).getPropertyValue("--mark-color")
    context.lineWidth = cellGrid[0][0].clientWidth * 0.3

    const fontSize = cellGrid[0][0].clientWidth * 0.2
    context.font = `${fontSize}px Arial`
    context.textBaseline = "center"
    context.textAlign = "center"

    for (let i = 1; i < pathVectors.length; i++) {
        const cell1 = cellGrid[pathVectors[i - 1].y][pathVectors[i - 1].x]
        const cell2 = cellGrid[pathVectors[i].y][pathVectors[i].x]
        const p1 = positionOfCell(cell1)
        const p2 = positionOfCell(cell2)
        
        context.beginPath()
        context.moveTo(p1.x, p1.y)
        context.lineTo(p2.x, p2.y)
        context.stroke()

        const delta = pathVectors[i].sub(pathVectors[i - 1])
        const manhattanLength = Math.abs(delta.x) + Math.abs(delta.y)
        const isMultiplication = manhattanLength == 2
        const operationStr = isMultiplication ? "×" : "±"

        const averagePos = p1.lerp(p2, 0.5)
        context.fillText(operationStr, averagePos.x, averagePos.y + fontSize * 0.3)
    }
}

