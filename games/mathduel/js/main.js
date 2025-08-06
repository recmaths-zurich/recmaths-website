const game = new DuelGame()

game.initHtml()
game.start()

game.onFinish(async () => {
    await new Promise(resolve => setTimeout(resolve, 300))
    const resultStr = game.computeResults().map(num => {
        if (num === null) {
            return "Error"
        } else {
            return num.toString()
        }
    }).join("\n")

    alert(resultStr)
})