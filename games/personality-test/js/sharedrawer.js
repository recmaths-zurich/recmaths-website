async function generateShareImage(termString, {imageSize=new Vector2d(600, 600)}={}) {
    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")
    canvas.width = imageSize.x
    canvas.height = imageSize.y
    
    const f = new WurzleFunction(termString)
    const plotter = new FunctionPlotter(canvas, context)
    plotter.viewCentre = new Vector2d(0, 0)
    plotter.viewHeight = Math.PI * 3
    plotter.drawGridLines = true

    plotter.clear()
    plotter.drawAxes()
    plotter.plot(f, "blue", 5)

    // load custom css font saved at --header-font
    const headerFont = getComputedStyle(document.body).getPropertyValue("--header-font").trim()

    function drawCardWithText(text, position, {fontSize=50, padding=20, color=plotter.defaultForegroundColor}={}) {
        context.font = `${fontSize}px ${headerFont}`
        context.textAlign = "center"
        context.textBaseline = "middle"

        // draw a nice lookign and fitting card with the given text
        context.fillStyle = plotter.defaultBackgroundColor
        const textDimensions = context.measureText(text)
        context.globalAlpha = 0.9
        context.fillRect(
            position.x - textDimensions.width / 2 - padding,
            position.y - fontSize / 2 - padding,
            textDimensions.width + padding * 2,
            fontSize + padding * 2
        )
        context.globalAlpha = 1
        
        context.fillStyle = color
        context.fillText(text, position.x, position.y)
    }

    const lines = [
        `f(x) = ${termString}`,
        "recmaths.ch/games/personality-test",
    ]

    drawCardWithText(lines[1], new Vector2d(canvas.width / 2, canvas.height * 0.9), {fontSize: 30})
    drawCardWithText(lines[0], new Vector2d(canvas.width / 2, canvas.height * 0.8), {fontSize: 50, color: "blue"})

    // for debugging purposes, draw the canvas to the resultFunctionCanvas
    // resultFunctionCanvas.style.aspectRatio = `${imageSize.x} / ${imageSize.y}`
    // resultFunctionCanvas.width = imageSize.x
    // resultFunctionCanvas.height = imageSize.y
    // resultFunctionContext.clearRect(0, 0, canvas.width, canvas.height)
    // resultFunctionContext.drawImage(canvas, 0, 0)

    // to blob
    return new Promise((resolve) => {
        canvas.toBlob(blob => {
            if (blob) {
                resolve(blob)
            } else {
                console.error("Failed to create blob from canvas")
                resolve(null)
            }
        }, "image/png")
    })
}