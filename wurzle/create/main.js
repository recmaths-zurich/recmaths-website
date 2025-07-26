const functionInput = document.getElementById("function-input")
const functionCanvas = document.getElementById("function-canvas")
const functionShowButton = document.getElementById("function-show-button")

const plotter = new FunctionPlotter(functionCanvas)
const { redraw } = plotter.makeInteractive()

functionInput.addEventListener("input", () => {
    try {
        if (!drawFunction()) {
            throw new Error()
        }
        functionInput.style.color = "var(--input-color)"
    } catch {
        functionInput.style.color = "red"
    }
})

function drawFunction() {
    const func = new WurzleFunction(functionInput.value)
    plotter.removeAllFunctions()
    plotter.addFunction(func)
    return redraw()
}

functionShowButton.addEventListener("click", () => {
    const funcStr = functionInput.value
    const funcStrBase64 = btoa(funcStr)
    location.href = `../?t=${encodeURIComponent(funcStrBase64)}`
})

drawFunction()