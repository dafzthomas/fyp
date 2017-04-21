const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
const stats = new Stats();

game.GameType = '2D';

let WIDTH = window.innerWidth;
let HEIGHT = window.innerHeight;

let images = {};

const floor = {
    height: (HEIGHT / 6) * 5
}

const ceiling = {
    height: (HEIGHT / 7)
}

const scene = {
    x: 0,
    y: HEIGHT,
    width: 1200
};

const properties = {
    rain: game.CurrentArea == game.Areas.Town ? true : false
}

const colours = {
    sky: "#0375B4",
    lobby: {
        floor: "brown"
    },
    town: {
        floor: "lightgrey",
        puzzle: {
            one: "#000",
            two: "#062F4F",
            three: "#813772",
            four: "#B82601"
        }
    },
    forest: {
        floor: "#007849",
        puzzle: {
            one: "#FFCE00",
            two: "#0375B4",
            three: "#007849",
            four: "#262228"
        }
    }
}

let particles = [];
let rainCount = 500;

const cloud = {
    one: {
        x: 0,
        y: 0
    },
    two: {
        x: 300,
        y: 50
    },
    three: {
        x: 700,
        y: 80
    }
}

const player = {
    x: 100,
    y: floor.height,
    width: 50,
    height: 280,
    speed: 5,
    velX: 0,
    velY: 0,
    jumping: false,
    selectingDoor: false
};


const margin = 20;
const padding = 20;

const puzzle = {
    x: margin,
    y: margin,
    innerPosition: margin + padding,
    width: WIDTH - (margin + padding),
    height: HEIGHT - (margin + padding)
}

const friction = 0.8;
const gravity = 0.6;

const doors = {
    height: 350,
    width: 200,
    border: 2,
    one: {
        x: 300
    },
    two: {
        x: 700
    }
};

const house = {
    height: 380,
    width: 380,
    one: {
        x: 50
    },
    two: {
        x: 450
    }
}

class PuzzleSquare {
    constructor(x, y, width, height, borderThickness, colour) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.borderThickness = borderThickness;
        this.colour = colour;
    }
}

const forestPuzzle = {
    squares: {
        one: new PuzzleSquare(puzzle.innerPosition, puzzle.innerPosition + 100, 80, 80, 3, colours.forest.puzzle.one),
        two: new PuzzleSquare(puzzle.innerPosition, puzzle.innerPosition + 200, 80, 80, 3, colours.forest.puzzle.two),
        three: new PuzzleSquare(puzzle.innerPosition, puzzle.innerPosition + 300, 80, 80, 3, colours.forest.puzzle.three),
        four: new PuzzleSquare(puzzle.innerPosition, puzzle.innerPosition + 400, 80, 80, 3, colours.forest.puzzle.four)
    },
    passed: 0
}

const townPuzzle = {
    squares: {
        one: new PuzzleSquare(puzzle.innerPosition, puzzle.innerPosition + 100, 80, 80, 3, colours.town.puzzle.one),
        two: new PuzzleSquare(puzzle.innerPosition, puzzle.innerPosition + 200, 80, 80, 3, colours.town.puzzle.two),
        three: new PuzzleSquare(puzzle.innerPosition, puzzle.innerPosition + 300, 80, 80, 3, colours.town.puzzle.three),
        four: new PuzzleSquare(puzzle.innerPosition, puzzle.innerPosition + 400, 80, 80, 3, colours.town.puzzle.four)
    },
    passed: 0
}

const keys = [];

canvas.width = WIDTH;
canvas.height = HEIGHT;

loadImage("character-2d/leftArm", "png");
loadImage("character-2d/legs", "png");
loadImage("character-2d/torso", "png");
loadImage("character-2d/rightArm", "png");
loadImage("character-2d/head", "png");
loadImage("character-2d/hair", "png");
loadImage("character-2d/leftArm-jump", "png");
loadImage("character-2d/legs-jump", "png");
loadImage("character-2d/rightArm-jump", "png");

loadImage("cloud", "png");
loadImage("house", "svg");
loadImage("house-two", "svg");

loadImage("tree", "svg");

function animatePlayer() {
    if (player.jumping) {
        ctx.drawImage(images["character-2d/legs-jump"], player.x, player.y - 6);
    } else {
        ctx.drawImage(images["character-2d/legs"], player.x, player.y);
    }

    ctx.drawImage(images["character-2d/torso"], player.x, player.y - 50);
    ctx.drawImage(images["character-2d/head"], player.x - 10, player.y - 125);
    ctx.drawImage(images["character-2d/hair"], player.x - 37, player.y - 138);

    if (player.jumping) {
        ctx.drawImage(images["character-2d/rightArm-jump"], player.x - 35, player.y - 42);
    } else {
        ctx.drawImage(images["character-2d/rightArm"], player.x - 15, player.y - 42);
    }

    drawEllipse(player.x + 47, player.y - 68, 8, 14); // Left Eye
    drawEllipse(player.x + 58, player.y - 68, 8, 14); // Right Eye

    if (keys[39] || keys["right"]) {
        // right arrow
        if (player.velX < player.speed) {
            player.velX++;
        }
    }
    if (keys[37] || keys["left"]) {
        // left arrow                  
        if (player.velX > -player.speed) {
            player.velX--;
        }
    }

    if (keys[38] || keys[32] || keys["jump"]) {
        // up arrow or space
        if (!player.jumping) {
            player.jumping = true;
            player.velY = -player.speed * 2;
        }
    }

    player.velX *= friction;
    player.velY += gravity;

    player.x += player.velX;
    player.y += player.velY;

    if (player.x >= (WIDTH - player.width) - 10) {
        player.x = (WIDTH - player.width) - 11;
        scene.x -= player.velX;
    } else if (player.x <= 10) {
        player.x = 11;
        scene.x -= player.velX;

    }

    if (player.y >= floor.height) {
        player.y = floor.height;
        player.jumping = false;
        player.selectingDoor = false;
    }

    // Keep going left/right and it loop around
    if (scene.x > WIDTH + 10) {
        scene.x = -scene.width;
    }
    if (scene.x < -scene.width - 10) {
        scene.x = WIDTH;
    }

    console.log()

    // Door selection on jumping in front of it
    if (game.CurrentArea == game.Areas.Lobby && player.jumping && !player.selectingDoor) {
        player.selectingDoor = true;

        if (player.x >= (scene.x + doors.one.x) && player.x <= (scene.x + doors.one.x + doors.width)) {
            console.log("Player in door 1");
            game.goToTown();
        }

        if (player.x >= (scene.x + doors.two.x) && player.x <= (scene.x + doors.two.x + doors.width)) {
            console.log("Player in door 2");
            game.goToForest();
        }
    }

    ctx.restore();
}

function lobbyObjects() {
    // (x,y,width,height)

    // Ceiling -------------------------
    ctx.save();

    ctx.fillStyle = 'lightgrey';
    ctx.shadowColor = '#999';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 5;
    ctx.fillRect(0, 0, WIDTH, ceiling.height);
    ctx.fill();

    ctx.restore();
    // Ceiling -------------------------


    // Lobby Floor ---------------------------------------
    ctx.save();

    drawRectangle(0, floor.height, WIDTH, floor.height, 0, colours.lobby.floor);

    ctx.restore();
    // Lobby Floor ---------------------------------------


    // Door 1 - Town 
    drawDoor(scene.x + doors.one.x, floor.height - doors.height - doors.border, doors.width, doors.height, 2, 'grey');


    // Door 2 - Forest
    drawDoor(scene.x + doors.two.x, floor.height - doors.height - doors.border, doors.width, doors.height, 2, colours.forest.floor);

}

function clouds() {
    ctx.drawImage(images["cloud"], cloud.one.x, cloud.one.y);
    ctx.drawImage(images["cloud"], cloud.two.x, cloud.two.y);
    ctx.drawImage(images["cloud"], cloud.three.x, cloud.three.y);

    cloud.one.x += .5;
    cloud.two.x += 1;
    cloud.three.x += .1;

    if (cloud.one.x > WIDTH) {
        cloud.one.x = -400;
    }
    if (cloud.two.x > WIDTH) {
        cloud.two.x = -400;
    }
    if (cloud.three.x > WIDTH) {
        cloud.three.x = -400;
    }
}

function setupRain(parts) {
    let init = [];
    particles = [];

    let maxParts = parts;

    for (let a = 0; a < maxParts; a++) {
        init.push({
            x: Math.random() * WIDTH,
            y: Math.random() * HEIGHT,
            l: Math.random() * 1,
            xs: -4 + Math.random() * 4 + 2,
            ys: Math.random() * 10
        })
    }

    for (let b = 0; b < maxParts; b++) {
        particles[b] = init[b];
    }
}

function rain() {
    ctx.save();

    ctx.strokeStyle = 'rgba(174,194,224,0.5)';
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';

    for (var c = 0; c < particles.length; c++) {
        var p = particles[c];
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.l * p.xs, p.y + p.l * p.ys);
        ctx.stroke();
    }

    for (var b = 0; b < particles.length; b++) {
        var p = particles[b];
        p.x += p.xs;
        p.y += p.ys;
        if (p.x > WIDTH || p.y > HEIGHT) {
            p.x = Math.random() * WIDTH;
            p.y = -20;
        }
    }

    ctx.restore();
}

function forestObjects() {
    properties.rain = true;
    setupRain(rainCount);

    // Forest Sky ---------------------------------------
    drawRectangle(0, 0, WIDTH, HEIGHT, 0, colours.sky);
    // Forest Sky ---------------------------------------


    // Forest Floor -------------------------------------
    drawRectangle(0, floor.height, WIDTH, floor.height, 0, colours.forest.floor);
    // Forest Floor -------------------------------------

    // Trees
    ctx.drawImage(images["tree"], scene.x + house.one.x, floor.height - house.height, house.width * images["tree"].width / images["tree"].height, house.height);
    ctx.drawImage(images["tree"], scene.x + house.two.x, floor.height - house.height, house.width * images["tree"].width / images["tree"].height, house.height);

    // Rain ----------------------------------------------
    rain();

    // Rain ----------------------------------------------

    clouds();

}

function townObjects() {
    // Forest Sky ---------------------------------------
    drawRectangle(0, 0, WIDTH, HEIGHT, 0, colours.sky);
    // Forest Sky ---------------------------------------

    clouds();

    // Town Floor ---------------------------------------
    drawRectangle(0, floor.height, WIDTH, floor.height, 0, colours.town.floor);
    // Town Floor ---------------------------------------

    // Houses --------------------------------------------
    ctx.drawImage(images["house"], scene.x + house.one.x, floor.height - house.height, house.width * images["house"].width / images["house"].height, house.height);
    ctx.drawImage(images["house-two"], scene.x + house.two.x, floor.height - house.height, house.width * images["house-two"].width / images["house-two"].height, house.height);
    // Houses --------------------------------------------

}

function drawDoor(x, y, width, height, borderThickness, colour) {

    drawRectangle(x, y, width, height, borderThickness, colour);

    // Door Knob -----------------------------------------------
    ctx.save();

    ctx.beginPath();
    ctx.arc(x + 30, y + height / 2, 10, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'black';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#003300';
    ctx.stroke();

    ctx.restore();
    // Door Knob -----------------------------------------------
}

function drawRectangle(x, y, width, height, borderThickness, colour) {

    // Border ----------------------------
    ctx.save();

    ctx.fillStyle = '#000';
    ctx.fillRect(x - (borderThickness), y - (borderThickness), width + (borderThickness * 2), height + (borderThickness * 2));

    ctx.restore();
    // Border ----------------------------

    // Rectangle -------------------------
    ctx.save();

    ctx.fillStyle = colour;
    ctx.fillRect(x, y, width, height);

    ctx.restore();
    // Rectangle -------------------------

}

function drawEllipse(centerX, centerY, width, height) {
    ctx.save();

    ctx.beginPath();
    ctx.moveTo(centerX, centerY - height / 2);

    ctx.bezierCurveTo(
        centerX + width / 2, centerY - height / 2,
        centerX + width / 2, centerY + height / 2,
        centerX, centerY + height / 2);

    ctx.bezierCurveTo(
        centerX - width / 2, centerY + height / 2,
        centerX - width / 2, centerY - height / 2,
        centerX, centerY - height / 2);

    ctx.fillStyle = "black";
    ctx.fill();

    ctx.restore();
}

function loadImage(name, type) {
    images[name] = new Image();
    images[name].src = "/images/" + name + "." + type;
}

function showPuzzle() {

    drawRectangle(puzzle.x, puzzle.y, puzzle.width, puzzle.height, 3, '#FFF');

    if (game.GoingTo.area == game.Areas.Town) {

        // First block
        drawRectangle(townPuzzle.squares.one.x, townPuzzle.squares.one.y, townPuzzle.squares.one.width, townPuzzle.squares.one.height, townPuzzle.squares.one.borderThickness, townPuzzle.squares.one.colour);

        // Second Block
        drawRectangle(townPuzzle.squares.two.x, townPuzzle.squares.two.y, townPuzzle.squares.two.width, townPuzzle.squares.two.height, townPuzzle.squares.two.borderThickness, townPuzzle.squares.two.colour);

        // Third Block
        drawRectangle(townPuzzle.squares.three.x, townPuzzle.squares.three.y, townPuzzle.squares.three.width, townPuzzle.squares.three.height, townPuzzle.squares.three.borderThickness, townPuzzle.squares.three.colour);

        // Fourth Block
        drawRectangle(townPuzzle.squares.four.x, townPuzzle.squares.four.y, townPuzzle.squares.four.width, townPuzzle.squares.four.height, townPuzzle.squares.four.borderThickness, townPuzzle.squares.four.colour);

        if (townPuzzle.passed == 4) {
            game.GoingTo.puzzleComplete = true;

            game.goToPuzzleCheck();

            player.x = 100;
        }
    }

    if (game.GoingTo.area == game.Areas.Forest) {

        // First block
        drawRectangle(forestPuzzle.squares.one.x, forestPuzzle.squares.one.y, forestPuzzle.squares.one.width, forestPuzzle.squares.one.height, forestPuzzle.squares.one.borderThickness, forestPuzzle.squares.one.colour);

        // Second Block
        drawRectangle(forestPuzzle.squares.two.x, forestPuzzle.squares.two.y, forestPuzzle.squares.two.width, forestPuzzle.squares.two.height, forestPuzzle.squares.two.borderThickness, forestPuzzle.squares.two.colour);

        // Third Block
        drawRectangle(forestPuzzle.squares.three.x, forestPuzzle.squares.three.y, forestPuzzle.squares.three.width, forestPuzzle.squares.three.height, forestPuzzle.squares.three.borderThickness, forestPuzzle.squares.three.colour);

        // Fourth Block
        drawRectangle(forestPuzzle.squares.four.x, forestPuzzle.squares.four.y, forestPuzzle.squares.four.width, forestPuzzle.squares.four.height, forestPuzzle.squares.four.borderThickness, forestPuzzle.squares.four.colour);

        if (forestPuzzle.passed == 4) {
            game.GoingTo.puzzleComplete = true;

            game.goToPuzzleCheck();

            player.x = 100;
            scene.x = 0;
        }



    }


    // Close button --------------------------------------
    ctx.save();

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(puzzle.innerPosition, puzzle.innerPosition);
    ctx.lineTo(puzzle.innerPosition * 2, puzzle.innerPosition * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(puzzle.innerPosition, puzzle.innerPosition * 2);
    ctx.lineTo(puzzle.innerPosition * 2, puzzle.innerPosition);
    ctx.stroke();

    ctx.restore();
    // Close button --------------------------------------


}

function touchTargets(pointer) {
    // X close button for puzzle
    if (game.GoingTo.area != null) {
        let cross = {
            x: 40,
            y: 40,
            width: 40,
            height: 40
        }

        if (clickOnTarget(pointer, cross)) {
            game.cancelPuzzle();
        }

        if (game.GoingTo.area == game.Areas.Town) {
            // blue
            if (clickOnTarget(pointer, townPuzzle.squares.one)) {
                console.log(`Hit ${townPuzzle.squares.one.colour}`);

                if (townPuzzle.passed == 0) {
                    townPuzzle.passed++;
                } else {
                    townPuzzle.passed = 0;
                }
            }


            // green
            if (clickOnTarget(pointer, townPuzzle.squares.two)) {
                console.log(`Hit ${townPuzzle.squares.two.colour}`);

                if (townPuzzle.passed == 2) {
                    townPuzzle.passed++;
                } else {
                    townPuzzle.passed = 0;
                }
            }


            // pink
            if (clickOnTarget(pointer, townPuzzle.squares.three)) {
                console.log(`Hit ${townPuzzle.squares.three.colour}`);

                if (townPuzzle.passed == 3) {
                    townPuzzle.passed++;
                } else {
                    townPuzzle.passed = 0;
                }
            }


            // purple
            if (clickOnTarget(pointer, townPuzzle.squares.four)) {
                console.log(`Hit ${townPuzzle.squares.four.colour}`);

                if (townPuzzle.passed == 1) {
                    townPuzzle.passed++;
                } else {
                    townPuzzle.passed = 0;
                }
            }

        }

        if (game.GoingTo.area == game.Areas.Forest) {
            // blue
            if (clickOnTarget(pointer, forestPuzzle.squares.one)) {
                console.log(`Hit ${forestPuzzle.squares.one.colour}`);

                if (forestPuzzle.passed == 0) {
                    forestPuzzle.passed++;
                } else {
                    forestPuzzle.passed = 0;
                }
            }


            // green
            if (clickOnTarget(pointer, forestPuzzle.squares.two)) {
                console.log(`Hit ${forestPuzzle.squares.two.colour}`);

                if (forestPuzzle.passed == 2) {
                    forestPuzzle.passed++;
                } else {
                    forestPuzzle.passed = 0;
                }
            }


            // pink
            if (clickOnTarget(pointer, forestPuzzle.squares.three)) {
                console.log(`Hit ${forestPuzzle.squares.three.colour}`);

                if (forestPuzzle.passed == 1) {
                    forestPuzzle.passed++;
                } else {
                    forestPuzzle.passed = 0;
                }
            }


            // purple
            if (clickOnTarget(pointer, forestPuzzle.squares.four)) {
                console.log(`Hit ${forestPuzzle.squares.four.colour}`);

                if (forestPuzzle.passed == 3) {
                    forestPuzzle.passed++;
                } else {
                    forestPuzzle.passed = 0;
                }
            }

        }
    }
}

function clickOnTarget(pointer, target) {
    if (pointer.x >= target.x && pointer.x <= (target.x + target.width) &&
        pointer.y >= target.y && pointer.y <= (target.y + target.height)) return true;

    return false;
}

function animate() {
    properties.rain = false;

    stats.begin();

    // Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    if (game.CurrentArea == game.Areas.Lobby) {
        lobbyObjects();
    } else if (game.CurrentArea == game.Areas.Forest) {
        forestObjects();
    } else if (game.CurrentArea == game.Areas.Town) {
        townObjects();
    }


    if (!game.GoingTo.puzzleInProgress) animatePlayer();

    if (game.GoingTo.puzzleInProgress) {
        showPuzzle();
    }

    adapt();

    stats.end();
    requestAnimationFrame(animate);
}

window.addEventListener("keydown", (e) => {
    keys[e.keyCode] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.keyCode] = false;

    if (e.keyCode == 27) {
        game.cancelPuzzle();

        if (game.CurrentArea != game.Areas.Lobby) {
            game.backToLobby();
        }
    }
});

window.addEventListener("touchstart", (e) => {
    e.preventDefault();
    onPointerDown(e);
}, true);

window.addEventListener("mousedown", (e) => {
    e.preventDefault();
    onPointerDown(e);
});

window.addEventListener("touchend", (e) => {
    e.preventDefault();
    onPointerUp(e);
}, true);

window.addEventListener("mouseup", (e) => {
    e.preventDefault();
    onPointerUp(e);
});

var timeout;
var lastTap = 0;

function onPointerDown(e) {
    let pointer = {
        x: e.clientX || e.touches[0].clientX,
        y: e.clientY || e.touches[0].clientY
    }

    touchTargets(pointer);

    var currentTime = new Date().getTime();
    var tapLength = currentTime - lastTap;
    clearTimeout(timeout);
    if (tapLength < 500 && tapLength > 0) {
        // Double tap
        keys["jump"] = true;
    }
    lastTap = currentTime;

    if (keys["left"]) {
        keys["left"] = false;
        return;
    }
    if (keys["right"]) {
        keys["right"] = false;
        return;
    }

    // Touch controls
    if (pointer.x < WIDTH / 2) {
        // Left
        keys["left"] = !keys["left"];
    }
    if (pointer.x > WIDTH / 2) {
        // Right
        keys["right"] = !keys["right"];
    }
}

function onPointerUp(e) {
    if (keys["jump"]) {
        keys["jump"] = false;
    }
    if (keys["left"]) {
        keys["left"] = false;
        return;
    }
    if (keys["right"]) {
        keys["right"] = false;
        return;
    }
}

window.onload = function () {
    game.backToLobby();
    requestAnimationFrame(animate);
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom);

    setInterval(function () {
        if (fps < 30) {
            let yes = confirm("Performance seems a little low, would you like to try a version which may run faster?");
            if (yes) {
                window.location.href = '/game-text.html';
            }
        }
    }, 8000);
};

function gameSend2DCommand(command) {
    console.log(command);
}

function adapt() {
    var fps = stats.getFPS();
    console.log(fps);

    if (properties.rain) {
        if (fps < 58) {
            if (rainCount > 0) {
                rainCount--;
            }
        } else {
            rainCount++;
        }
        console.log(`rainCount ${rainCount}`);

        setupRain(rainCount);
    }
}