const rockButton = document.getElementById("rock-button")
const paperButton = document.getElementById("paper-button")
const scissorsButton = document.getElementById("scissors-button")

const rpsResultsCanvas = document.getElementById("rps-results-canvas")
const rpsResultsContext = rpsResultsCanvas.getContext("2d")

const cheatModeContainer = document.getElementById("cheat-mode-container")
const cheatModeOutput = document.getElementById("cheat-mode-output")
const showAiPredictionButton = document.getElementById("show-ai-prediction-button")
const hideAiPredictionButton = document.getElementById("hide-ai-prediction-button")

const results = { wins: 0, ties: 11, losses: 10 }

const resultColors = {
    wins: "green",
    ties: "yellow",
    losses: "red",
}

function drawResults(results) {
    // we draw the results on the canvas by drawing a fun bar chart 
    // the borders of the bars are the same color as the bar itself,
    // the bars itself are transparent  

    rpsResultsContext.clearRect(0, 0, rpsResultsCanvas.width, rpsResultsCanvas.height)
    rpsResultsCanvas.width = rpsResultsCanvas.clientWidth
    rpsResultsCanvas.height = rpsResultsCanvas.clientWidth * 0.5

    const total = results.wins + results.losses + results.ties
    if (total === 0) {
        rpsResultsContext.fillStyle = "black"
        rpsResultsContext.font = "20px system-ui, sans-serif"
        rpsResultsContext.textAlign = "center"
        rpsResultsContext.fillText("click a button to start", rpsResultsCanvas.width / 2, rpsResultsCanvas.height / 2)
        return
    }

    const barWidth = rpsResultsCanvas.width / 3
    const barHeightScale = (rpsResultsCanvas.height - 30) / Math.max(...Object.values(results))

    const padding = 5

    let i = 0
    for (const [key, value] of Object.entries(results)) {
        const barHeight = Math.max(value * barHeightScale, 10)
        const x = i++ * barWidth
        const y = rpsResultsCanvas.height - barHeight
        rpsResultsContext.fillStyle = resultColors[key]
        // make the bar transparent
        rpsResultsContext.globalAlpha = 0.5

        rpsResultsContext.fillRect(x + padding, y + padding, barWidth - 2 * padding, barHeight - 2 * padding)
        rpsResultsContext.globalAlpha = 1

        // draw the border of the bar
        rpsResultsContext.strokeStyle = resultColors[key]
        rpsResultsContext.lineWidth = 2
        rpsResultsContext.strokeRect(x + padding, y + padding, barWidth - 2 * padding, barHeight - 2 * padding)

        // draw the label
        rpsResultsContext.fillStyle = "black"
        rpsResultsContext.font = "16px system-ui, sans-serif"
        rpsResultsContext.textAlign = "center"
        const name = key.charAt(0).toUpperCase() + key.slice(1)
        rpsResultsContext.fillText(`${value} ${name}`, x + barWidth / 2, y - 5)
    }
}

let move = {
	ROCK: 1,
	PAPER: 2,
	SCISSORS: 3
}

let allMoves = [move.ROCK, move.PAPER, move.SCISSORS]

let moveButtons = {}
moveButtons[move.ROCK] = rockButton
moveButtons[move.PAPER] = paperButton
moveButtons[move.SCISSORS] = scissorsButton

let NET_CAPACITY = 3

let urlParams = new URLSearchParams(window.location.search);

if (urlParams.has("memory")) NET_CAPACITY = parseInt(urlParams.get("memory"))

let nodeStruct = [NET_CAPACITY * 3, 8, 3]
let neuralnet = new NeuralNet(nodeStruct)
let statistics = null

function Statistics() {
	this.wins = 0
	this.losses = 0
	this.draws = 0

	this.update = () => {
        drawResults({
            wins: this.wins,
            ties: this.draws,
            losses: this.losses,
        })
	}

	this.add = score => {
		switch(score) {
			case -1: this.losses += 1; break
			case 0: this.draws += 1; break
			case 1: this.wins += 1; break
		}
		this.update()
	}
}

statistics = new Statistics()
statistics.update()

function scoreMoves(playerMove, aiMove) {
	if (playerMove == aiMove) return 0
	switch(playerMove) {
		case move.ROCK:     return (aiMove == move.PAPER)    ? -1 : 1
		case move.PAPER:    return (aiMove == move.SCISSORS) ? -1 : 1
		case move.SCISSORS: return (aiMove == move.ROCK)     ? -1 : 1
	}
	throw `Invalid Moves Given: pm=${playerMove} am=${aiMove}`
}

function getOpposingMove(playerMove) {
	switch(playerMove) {
		case move.ROCK: return move.PAPER
		case move.SCISSORS: return move.ROCK
		case move.PAPER: return move.SCISSORS
	}
}

function getAntiOpposingMove(playerMove) {
	switch(playerMove) {
		case move.ROCK: return move.SCISSORS
		case move.SCISSORS: return move.PAPER
		case move.PAPER: return move.ROCK
	}
}

function moveToArray(playerMove) {
	let tempArr = [0, 0, 0]
	tempArr[playerMove - 1] = 1
	return tempArr
}

function movesToArray(moves) {
	let converted = Array()
	for (let i = 0; i < moves.length; i++)
		converted = converted.concat(moveToArray(moves[i]))
	return converted
}

function moveToStr(playerMove) {
	switch (playerMove) {
		case move.ROCK:     return "ROCK"
		case move.PAPER:    return "PAPER"
		case move.SCISSORS: return "SCISSORS"
	}
}

function movesToStr(moves) {
	let tempOut = Array()
	for (let i = 0; i < moves.length; i++)
		tempOut.push(moveToStr(moves[i]))
	return tempOut
}

function makeTrainingData() {
	let inputs = Array()
	let outputs = Array()	
	let i = history.length - NET_CAPACITY - 1
	let iterationCount = 0
	for (; i >= 0; i--) {
		iterationCount++
		if (iterationCount > 5) break
		let tempInputs = Array()
		for (let j = 0; j < NET_CAPACITY; j++) {
			tempInputs.push(history[i + j])
		}
		inputs.push(movesToArray(tempInputs))
		let idealMove = getOpposingMove(history[i + NET_CAPACITY])
		outputs.push(moveToArray(idealMove))
	}
	return {inputs: inputs, outputs: outputs}
}

function trainNet() {
	let data = makeTrainingData()
	neuralnet.train(
		data.inputs,
		data.outputs,
		cycles = 1000,
		learning_rate = 0.01
	)
}

function randomMove() {
	function randomChoice(arr) {
	    return arr[Math.floor(arr.length * Math.random())];
	}
	return randomChoice(allMoves)
}

let history = Array()
let nextAiMove = randomMove()
let nextAiResults = null

function getAiMove() {
	if (history.length >= NET_CAPACITY) {
		let inpData = history.slice(-NET_CAPACITY)
		let results = neuralnet.input(movesToArray(inpData))
		return [allMoves[indexOfMax(results)], results]
	} else {
		return [randomMove(), null]
	}
}

function saveToHistory(playerMove) {
	history.push(playerMove)
}

function updatePredictionOutput() {
	if (nextAiResults === null) {
		cheatModeOutput.textContent = `Not enough data to predict yet (${history.length}/${NET_CAPACITY}), so playing randomly.`
	} else {
		let text = `I predict your next move to be:\n`
		const orderedMoveIndeces = Array.from({length: allMoves.length}, (_, i) => i)
		orderedMoveIndeces.sort((a, b) => nextAiResults[b] - nextAiResults[a])
		for (const i of orderedMoveIndeces) {
			const humanMove = moveToStr(getAntiOpposingMove(allMoves[i]))
			text += `${humanMove} (${(nextAiResults[i] * 100).toFixed(2)}%)\n`
		}
		text += `\nThus, I will play ${moveToStr(nextAiMove)}`
		cheatModeOutput.textContent = text
	}
}

function makeMove(playerMove) {
	saveToHistory(playerMove)
	let score = scoreMoves(playerMove, nextAiMove)
	statistics.add(score)
	if (history.length > NET_CAPACITY) {
		trainNet()
	}

	// compute next AI move
	[nextAiMove, nextAiResults] = getAiMove()
	updatePredictionOutput()
}

function registerBtn(button, move) {
	button.addEventListener("click", e => {
		makeMove(move)
		e.preventDefault()
	})
}

window.onkeydown = e => {
	if (/^[1-3]$/.test(e.key)) {
		moveButtons[parseInt(e.key)].focus()
		moveButtons[parseInt(e.key)].click()
	}
}

registerBtn(scissorsButton, move.SCISSORS)
registerBtn(rockButton, move.ROCK)
registerBtn(paperButton, move.PAPER)

window.addEventListener("resize", () => {
    statistics.update()
})

showAiPredictionButton.addEventListener("click", () => {
	cheatModeContainer.style.display = "block"
	hideAiPredictionButton.style.display = "inline-block"
	showAiPredictionButton.style.display = "none"
})

hideAiPredictionButton.addEventListener("click", () => {
	cheatModeContainer.style.display = "none"
	showAiPredictionButton.style.display = "inline-block"
	hideAiPredictionButton.style.display = "none"
})

updatePredictionOutput()