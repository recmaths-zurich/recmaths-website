const stage = document.getElementById("stage");
const canvas = document.getElementById("canvas");
const gameCtx = canvas.getContext("2d", { alpha: false });
const controls = document.getElementById("controls");
const controlCtx = controls.getContext("2d");
const offscreen = document.getElementById("offscreen");
const offscreenCtx = offscreen.getContext("2d");

const grid = document.getElementById("game-grid");

const displayA = document.getElementById("A");
const displayL = document.getElementById("L");

const R = 950;
const R2 = R * R;
const root2 = Math.sqrt(2);
const r = (1000 * root2 - R) / (1 + root2);
const delta = (r + R) / root2;
const rr2 = 0.9 * 0.9 * r * r;

function toScreen(x, y) {
    return [x + 1000, y + 1000];
}

function fromScreen(x, y) {
    return [x - 1000, y - 1000];
}

function isInTriang(x, y, triang) {
    let [[x0, y0], [x1, y1], [x2, y2]] = triang;
    doubleA = -y1 * x2 + y0 * (-x1 + x2) + x0 * (y1 - y2) + x1 * y2;
    if (doubleA == 0) return false;
    s = (y0 * x2 - x0 * y2 + (y2 - y0) * x + (x0 - x2) * y) / doubleA;
    t = (x0 * y1 - y0 * x1 + (y0 - y1) * x + (x1 - x0) * y) / doubleA;
    return 0 <= s && 0 <= t && s + t <= 1;
}

/*
Control Modes are
- Place Poles
- Move Poles
- Remove Poles
- Set Start
- (play)
*/

let mode = "PLACE";

const poles = [];
let poleOnMouse = -1;
let currentPoles = [];
let turnDirs = [];
let oldX = 0;
let oldY = 0;
let L = 0;
let started = false;
let touching = false;

function drawControlButton(x, y, r, style, selected, ...textLines) {
    controlCtx.fillStyle = style;
    controlCtx.strokeStyle = "#000000";
    controlCtx.lineWidth = 10;

    const gradient = controlCtx.createRadialGradient(
        ...toScreen(x, y),
        0,
        ...toScreen(x, y),
        r,
    );

    gradient.addColorStop(
        0,
        "color-mix(in hsl," +
            style +
            " 70%, " +
            (selected ? "#ffffff" : "#000000") +
            " 30%)",
    );
    gradient.addColorStop(1, style);
    controlCtx.fillStyle = gradient;

    controlCtx.beginPath();

    controlCtx.arc(...toScreen(x, y), r, 0, Math.PI * 2);

    controlCtx.fill();

    controlCtx.font = "80px ubuntu";

    controlCtx.textBaseline = "middle";
    controlCtx.textAlign = "center";
    controlCtx.fillStyle = selected ? "#ffffff" : "#000000";
    controlCtx.strokeStyle = "#000000";
    for (let i = 0; i < textLines.length; i++) {
        controlCtx.fillText(
            textLines[i],
            ...toScreen(x, y + 80 * (i - (textLines.length - 1) / 2)),
        );
    }
}

function drawControls() {
    drawControlButton(
        -delta,
        -delta,
        0.9 * r,
        "#90e979",
        mode == "PLACE",
        "Place",
        "Poles",
    );
    drawControlButton(
        delta,
        -delta,
        0.9 * r,
        "#62db3d",
        mode == "MOVE",
        "Move",
        "Poles",
    );
    drawControlButton(
        -delta,
        delta,
        0.9 * r,
        "#c22ff1",
        mode == "REMOVE",
        "Remove",
        "Poles",
    );
    drawControlButton(
        delta,
        delta,
        0.9 * r,
        "#4273b5",
        mode == "PLAY",
        ...(mode != "PLAY"
            ? ["Start"]
            : started
              ? ["Reset"]
              : ["Move to", "middle", "to start"]),
    );
}

function xyFromEvent(e) {
    let rect = controls.getBoundingClientRect(); // abs. size of element
    let scaleX = controls.width / rect.width; // relationship bitmap vs. element for x
    let scaleY = controls.height / rect.height; // relationship bitmap vs. element for y

    let x = (e.clientX - rect.left) * scaleX;
    let y = (e.clientY - rect.top) * scaleY;

    return fromScreen(x, y);
}

function d2(x0, y0, x1, y1) {
    return (x0 - x1) * (x0 - x1) + (y0 - y1) * (y0 - y1);
}

function findNearestPoleIndex(x, y) {
    let res = -1;
    let minD2 = Infinity;
    for (const i in poles) {
        const pole = poles[i];

        if (d2(x, y, ...pole) < minD2) {
            res = i;
            minD2 = d2(x, y, ...pole);
        }
    }
    return res;
}

function addArea(p1, p2, p3) {
    offscreenCtx.fillStyle = "#00ff77";
    offscreenCtx.strokeStyle = "#00ff77";
    offscreenCtx.lineWidth = 5;
    offscreenCtx.lineJoin = "round";
    offscreenCtx.beginPath();
    offscreenCtx.moveTo(...toScreen(...p1));
    offscreenCtx.lineTo(...toScreen(...p2));
    offscreenCtx.lineTo(...toScreen(...p3));
    offscreenCtx.lineTo(...toScreen(...p1));
    offscreenCtx.fill();
    offscreenCtx.stroke();
}

function getArea() {
    const data = offscreenCtx.getImageData(
        0,
        0,
        offscreen.width,
        offscreen.height,
    ).data;

    let A = 0;

    for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 0) A++;
    }

    return A;
}

function getAreaPercent() {
    return Math.min(Math.floor((99.7 * getArea()) / (Math.PI * R2)), 100);
}

function downListener(event, touch) {
    let [x, y] = xyFromEvent(event);

    if (!touch && event.button != 0) return;

    if (x * x + y * y > R2) {
        if ((x + delta) * (x + delta) + (y + delta) * (y + delta) <= rr2)
            mode = "PLACE";
        else if ((x - delta) * (x - delta) + (y + delta) * (y + delta) <= rr2)
            mode = "MOVE";
        else if ((x + delta) * (x + delta) + (y - delta) * (y - delta) <= rr2)
            mode = "REMOVE";
        else if ((x - delta) * (x - delta) + (y - delta) * (y - delta) <= rr2) {
            mode = "PLAY";
            currentPoles = [];
            turnDirs = [];
            offscreenCtx.clearRect(0, 0, 2000, 2000);
            L = 0;
            started = false;
        }
        drawControls();

        if (mode != "MOVE") poleOnMouse = -1;

        return;
    }

    if (mode == "PLACE") {
        poles.push([x, y]);
    } else if (mode == "REMOVE") {
        let i = findNearestPoleIndex(x, y);
        if (i != -1 && d2(x, y, ...poles[i]) <= 1000 + 40000*touch) {
            poles[i] = poles[0];
            poles.shift();
        }
    } else if (mode == "MOVE") {
        let i = findNearestPoleIndex(x, y);
        if (i != -1 && d2(x, y, ...poles[i]) <= 1000  + 40000*touch) {
            poleOnMouse = i;
            poles[i] = [x, y];
        }
    }
}

controls.addEventListener("mousedown", (e) => {
    downListener(e, false);
});

window.addEventListener("mouseup", (event) => {
    let [x, y] = xyFromEvent(event);

    poleOnMouse = -1;
});

function dot(start, to1, to2) {
    return (
        (start[0] - to1[0]) * (start[0] - to2[0]) +
        (start[1] - to1[1]) * (start[1] - to2[1])
    );
}

function getCurrentAnchorPoint() {
    return currentPoles.length >= 1
        ? poles[currentPoles[currentPoles.length - 1]]
        : [0, 0];
}

function getPreAnchorPoint() {
    for (i = currentPoles.length - 2; i >= 0; i--) {
        if (currentPoles[i] != currentPoles[currentPoles.length - 1])
            return poles[currentPoles[i]];
    }
    return [0, 0];
}

function turnDir(x, y, z) {
    return (
        Math.sign(
            (x[0] - y[0]) * (y[1] - z[1]) - (x[1] - y[1]) * (y[0] - z[0]),
        ) == 1
    );
}

function moveListener(event, touch) {
    let [x, y] = xyFromEvent(event);

    f = Math.min(1, Math.sqrt(R2 / (x * x + y * y)));
    x *= f;
    y *= f;

    if (poleOnMouse != -1) poles[poleOnMouse] = [x, y];

    if (mode == "PLAY" && !started) {
        if (x * x + y * y <= 400 || (touch && x * x + y * y <= 40000)) {
            oldX = 0;
            oldY = 0;
            started = true;
            drawControls();
        }
    }

    if (mode == "PLAY" && started) {
        while (true) {
            let hitPoles = [];
            const triang = [getCurrentAnchorPoint(), [oldX, oldY], [x, y]];
            for (const i in poles) {
                const pole = poles[+i];
                if (
                    (currentPoles.length == 0 ||
                        currentPoles[currentPoles.length - 1] != +i) &&
                    isInTriang(...pole, triang)
                ) {
                    hitPoles.push(+i);
                }
            }
            if (hitPoles.length == 0) break;
            let firstHit = -1;
            let maxK = -Infinity;
            for (const i of hitPoles) {
                const pole = poles[i];

                let k =
                    Math.pow(
                        dot(getCurrentAnchorPoint(), [oldX, oldY], pole),
                        2,
                    ) / d2(...getCurrentAnchorPoint(), ...pole);
                if (k > maxK) {
                    firstHit = i;
                    maxK = k;
                }
            }

            if (firstHit == -1) console.log("Hä");
            turnDirs.push(
                turnDir(getCurrentAnchorPoint(), poles[firstHit], [x, y]),
            );
            addArea(getCurrentAnchorPoint(), poles[firstHit], [oldX, oldY]);
            currentPoles.push(firstHit);
        }

        while (
            turnDirs.length != 0 &&
            turnDirs[turnDirs.length - 1] !=
                turnDir(getPreAnchorPoint(), getCurrentAnchorPoint(), [x, y])
        ) {
            console.log("test");
            l = 0;
            for (
                i = currentPoles.length - 1;
                0 <= i &&
                currentPoles[i] == currentPoles[currentPoles.length - 1];
                i--
            ) {
                l++;
            }
            if (
                0 <
                dot(getCurrentAnchorPoint(), getPreAnchorPoint(), [x, y]) *
                    (l & 1 ? 1 : -1)
            ) {
                turnDirs.push(
                    turnDir(getPreAnchorPoint(), getCurrentAnchorPoint(), [
                        x,
                        y,
                    ]),
                );
                currentPoles.push(currentPoles[currentPoles.length - 1]);
                break;
            } else {
                turnDirs.pop();
                currentPoles.pop();
            }
        }
        addArea(getCurrentAnchorPoint(), [x, y], [oldX, oldY]);
        L += Math.sqrt(d2(oldX, oldY, x, y));
    }

    oldX = x;
    oldY = y;
}

window.addEventListener("mousemove", (e) => {
    moveListener(e, false);
});

controls.addEventListener("touchstart", (event) => {
    console.log("test");
    const touch = event.touches?.[0];
    if (!touch) {
        return;
    }

    touching = true;
    downListener(touch, true);
    event.preventDefault();
    return false;
});

window.addEventListener("touchend", (event) => {
    poleOnMouse = -1;
    if (touching) {
        event.preventDefault();
        touching = false;
        return false;
    }
    touching = false;
});

window.addEventListener("touchmove", (event) => {
    if (!touching) return true;

    const touch = event.touches?.[0];
    if (!touch) {
        return true;
    }

    event.preventDefault();

    moveListener(touch, true);

    return false;
});

function drawGame() {
    gameCtx.lineWidth = 10;

    // grab color of card behind the game canvas, draw that as background
    const mainElement = document.querySelector("main");
    const mainComputedStyles = getComputedStyle(mainElement)
    const mainBackgroundColor = mainComputedStyles.getPropertyValue("--card-background")
    gameCtx.fillStyle = mainBackgroundColor;
    gameCtx.fillRect(-10, -10, canvas.width + 10, canvas.height + 10);

    gameCtx.beginPath();

    gameCtx.arc(...toScreen(0, 0), R, 0, Math.PI * 2);

    gameCtx.fillStyle = "#CCCCCC";
    gameCtx.fill();
    gameCtx.strokeStyle = "#000000";
    gameCtx.stroke();

    if (mode == "PLAY" && started) {
        gameCtx.drawImage(offscreen, 0, 0);

        gameCtx.beginPath();
        gameCtx.lineWidth = 10;
        gameCtx.strokeStyle = "#ff0000";
        gameCtx.moveTo(...toScreen(0, 0));

        for (i of currentPoles) {
            gameCtx.lineTo(...toScreen(...poles[i]));
            gameCtx.stroke();
            gameCtx.beginPath();
            gameCtx.moveTo(...toScreen(...poles[i]));
        }

        gameCtx.lineTo(...toScreen(oldX, oldY));
        gameCtx.stroke();
    }

    gameCtx.fillStyle = "#ff0000";
    gameCtx.beginPath();
    gameCtx.arc(...toScreen(0, 0), 5, 0, Math.PI * 2);
    gameCtx.fill();

    gameCtx.fillStyle = "#000044";
    for (let pole of poles) {
        gameCtx.beginPath();
        gameCtx.arc(...toScreen(...pole), 20, 0, Math.PI * 2);
        gameCtx.fill();
    }

    gameCtx.beginPath();

    gameCtx.arc(...toScreen(0, 0), R, 0, Math.PI * 2);

    gameCtx.strokeStyle = "#000000";
    gameCtx.stroke();

    displayA.innerText = getAreaPercent();
    displayL.innerText = ("" + L / R).substring(0, 5);
}

function mainloop(timestamp) {
    drawGame();
    requestAnimationFrame(mainloop);
}

function adaptGrid() {
    // this function used to determine whether we wanted
    // a landscape or portrait layout but we don't need
    // that anymore. So assume portrait (single-column).
    grid.style.gridTemplateColumns = "auto";
}

window.addEventListener("resize", (e) => {
    adaptGrid();
});

adaptGrid();
drawGame();
drawControls();
mainloop();
