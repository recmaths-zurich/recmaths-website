class FunctionPlotter {

    constructor(canvas, context, viewCentre, viewHeight) {
        this.canvas = canvas
        this.context = context ?? canvas.getContext("2d")

        this.viewCentre = viewCentre ?? new Vector2d(0, 0)
        this.viewHeight = viewHeight ?? 5
        this.drawGridLines = false

        this.wurzleFunctions = []
        this.guessedPoints = []
    }

    removeAllFunctions() {
        this.wurzleFunctions = []
    }

    get defaultForegroundColor() {
        return getComputedStyle(document.body).getPropertyValue("--card-text-color")
    }

    get defaultBackgroundColor() {
        return getComputedStyle(document.body).getPropertyValue("--header-button-background")
    }

    get viewWidth() {
        return this.canvas.width / this.canvas.height * this.viewHeight
    }

    pointToScreenPos(point) {
        const relativePoint = point.sub(this.viewCentre)
        return new Vector2d(
            (relativePoint.x / (this.viewWidth) + 0.5) * this.canvas.width,
            (-relativePoint.y / (this.viewHeight) + 0.5) * this.canvas.height
        )
    }

    screenPosToPoint(screenPos) {
        const x = (screenPos.x / this.canvas.width - 0.5) * this.viewWidth
        const y = -(screenPos.y / this.canvas.height - 0.5) * this.viewHeight
        const relativePoint = new Vector2d(x, y)
        return relativePoint.add(this.viewCentre)
    }

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }

    drawPoint(point, {atScreenPos=false, radius=5, color="blue",
        label=null, labelSize=13, labelColor=null, labelOffset=null,
        labelBaseline="top", labelAlign="left"
    }={}) {
        labelColor ??= this.defaultForegroundColor
        
        this.context.beginPath()
        let screenPos = null
        if (atScreenPos) {
            screenPos = point
        } else {
            screenPos = this.pointToScreenPos(point)
        }

        this.context.arc(screenPos.x, screenPos.y, radius, 0, Math.PI * 2)
        this.context.fillStyle = color
        this.context.fill()

        if (label !== null) {
            this.context.fillStyle = labelColor
            this.context.textAlign = labelAlign
            this.context.textBaseline = labelBaseline
            this.context.font = `${labelSize}px monospace`
            const labelPos = screenPos.addX(radius).addY(radius)
            if (labelOffset !== null) {
                labelPos.iadd(labelOffset.scale(labelSize))
            }

            this.context.fillText(label, screenPos.x + radius, screenPos.y + radius)
        }
    }

    connectPoints(points, {atScreenPos=false, color=null, width=1}={}) {
        color ??= this.defaultForegroundColor

        this.context.strokeStyle = color
        this.context.lineWidth = width
        this.context.beginPath()

        for (let i = 0; i < points.length; i++) {
            const screenPos = atScreenPos ? points[i] : this.pointToScreenPos(points[i])
            if (i == 0) {
                this.context.moveTo(screenPos.x, screenPos.y)
            } else {
                this.context.lineTo(screenPos.x, screenPos.y)
            }
        }

        this.context.stroke()
    }

    drawAxes() {
        const minXY = this.screenPosToPoint(new Vector2d(0, this.canvas.height))
        const maxXY = this.screenPosToPoint(new Vector2d(this.canvas.width, 0))

        // x axis
        this.connectPoints([
            new Vector2d(Math.floor(minXY.x) - 1, 0),
            new Vector2d(Math.ceil(maxXY.x) + 1, 0)
        ])

        // y axis
        this.connectPoints([
            new Vector2d(0, Math.floor(minXY.y) - 1),
            new Vector2d(0, Math.ceil(maxXY.y) + 1)
        ])

        const pinStyling = {color: this.defaultForegroundColor, radius: 3}
        
        let stepSize = 10 ** Math.ceil(Math.log10(Math.max(
            Math.ceil(maxXY.x) - Math.floor(minXY.x),
            Math.ceil(maxXY.y) - Math.floor(minXY.y)
        )) + 1)
        let numTicksVisible = Math.max(
            Math.ceil(maxXY.x) - Math.floor(minXY.x),
            Math.ceil(maxXY.y) - Math.floor(minXY.y)
        ) / stepSize

        let i = 0
        while (numTicksVisible < 8) {
            const factor = (i % 2 == 0) ? 2 : 5
            stepSize /= factor
            numTicksVisible *= factor
            i++
        }

        let startX = Math.floor(minXY.x)
        startX -= startX % stepSize
        for (let x = startX; x <= Math.ceil(maxXY.x); x += stepSize) {
            if (x == 0) continue
            this.drawPoint(new Vector2d(x, 0), {label: Math.round(x * 10) / 10, ...pinStyling})
        }

        let startY = Math.floor(minXY.y)
        startY -= startY % stepSize
        for (let y = startY; y <= Math.ceil(maxXY.y); y += stepSize) {
            this.drawPoint(new Vector2d(0, y), {label: Math.round(y * 10) / 10, ...pinStyling})
        }

        if (!this.drawGridLines) {
            return
        }

        // draw grid lines
        for (let x = startX; x <= Math.ceil(maxXY.x); x += stepSize) {
            if (x == 0) continue
            this.connectPoints([
                new Vector2d(x, Math.floor(minXY.y)),
                new Vector2d(x, Math.ceil(maxXY.y))
            ], {color: this.defaultForegroundColor, width: 0.5})
        }
        for (let y = startY; y <= Math.ceil(maxXY.y); y += stepSize) {
            this.connectPoints([
                new Vector2d(Math.floor(minXY.x), y),
                new Vector2d(Math.ceil(maxXY.x), y)
            ], {color: this.defaultForegroundColor, width: 0.5})
        }
    }

    plot(wurzleFunction, color="blue") {
        const points = Array.from({length: this.canvas.width}) 
            .map((_, i) => this.screenPosToPoint(new Vector2d(i, 0)).x)
            .map(x => {
                try {
                    const y = wurzleFunction.computeAt(x)
                    if (isNaN(y)) {
                        throw new Error("Value may not be NaN")
                    }
                    return new Vector2d(x, y)
                } catch {
                    return null
                }
            })

        // if we experience jumps of more than maxDelta, it's very likely
        // that we've hit an asymptote. We do not want to connect asymptote ends!
        const maxDelta = 10

        const sign = x => x > 0 ? 1 : x < 0 ? -1 : 0

        let drewAtLeastOnePoint = false
        for (let i = 1; i < points.length; i++) {
            const [p1, p2] = [points[i - 1], points[i]]

            if (p1 === null || p2 === null) {
                continue
            }

            if (p1.distance(p2) < maxDelta || sign(p1.y) == sign(p2.y)) { 
                this.connectPoints([p1, p2], {color})
                drewAtLeastOnePoint = true
            }
        }

        return drewAtLeastOnePoint
    }

    addFunction(wurzleFunction) {
        this.wurzleFunctions.push(wurzleFunction)
    }

    removeFunction(wurzleFunction) {
        this.wurzleFunctions = this.wurzleFunctions.filter(f => f.termString != wurzleFunction.termString)
    }

    makeInteractive() {
        const redraw = () => {
            this.canvas.width = this.canvas.clientWidth
            this.canvas.height = this.canvas.clientHeight

            this.clear()

            this.drawAxes()
            let drewAtLeastOnePoint = false
            for (const func of this.wurzleFunctions) {
                if (this.plot(func)) {
                    drewAtLeastOnePoint = true
                }
            }

            for (let i = 0; i < this.guessedPoints.length; i++) {
                this.drawPoint(this.guessedPoints[i])
            }

            return drewAtLeastOnePoint
        }

        this.canvas.addEventListener("wheel", event => {
            this.viewHeight *= event.deltaY / 1000 + 1
            this.viewHeight = Math.max(this.viewHeight, 0.1)
            event.preventDefault()
            redraw()
        })

        let dragPoint = null
        let dragStartViewCentre = null

        const mousedown = event => {
            dragPoint = this.screenPosToPoint(Vector2d.fromEvent(event, this.canvas))
            dragStartViewCentre = this.viewCentre.copy()
        }

        const mousemove = event => {
            if (!dragPoint) {
                return
            }

            let temp = this.viewCentre.copy()
            this.viewCentre = dragStartViewCentre
            const delta = this.screenPosToPoint(Vector2d.fromEvent(event, this.canvas)).sub(dragPoint)
            this.viewCentre = temp.copy()
            event.preventDefault()

            this.viewCentre = dragStartViewCentre.sub(delta)
            redraw()

        }

        const mouseup = event => {
            dragPoint = null
            dragStartViewCentre = null
        }


        this.canvas.addEventListener("mousedown", mousedown)
        this.canvas.addEventListener("mousemove", mousemove)
        this.canvas.addEventListener("mouseup", mouseup)

        this.canvas.addEventListener("touchstart", mousedown)
        this.canvas.addEventListener("touchmove", mousemove)
        this.canvas.addEventListener("touchend", mouseup)

        window.addEventListener("resize", redraw)

        redraw()

        return {redraw}
    }

}
