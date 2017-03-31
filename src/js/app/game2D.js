const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');

let WIDTH = window.innerWidth;
let HEIGHT = window.innerHeight;

let images = {};

const floor = {
    height: (HEIGHT / 2) + 200
}

const scene = {
    x: 0,
    y: HEIGHT
};

const player = {
    x: 100,
    y: HEIGHT,
    width: 50,
    height: 280,
    speed: 5,
    velX: 0,
    velY: 0,
    jumping: false,
    selectingDoor: false
};

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

const keys = [];

canvas.width = WIDTH;
canvas.height = HEIGHT;

loadImage("leftArm");
loadImage("legs");
loadImage("torso");
loadImage("rightArm");
loadImage("head");
loadImage("hair");
loadImage("leftArm-jump");
loadImage("legs-jump");
loadImage("rightArm-jump");

function animatePlayer() {
    if (player.jumping) {
        ctx.drawImage(images["legs-jump"], player.x, player.y - 6);
    } else {
        ctx.drawImage(images["legs"], player.x, player.y);
    }

    ctx.drawImage(images["torso"], player.x, player.y - 50);
    ctx.drawImage(images["head"], player.x - 10, player.y - 125);
    ctx.drawImage(images["hair"], player.x - 37, player.y - 138);

    if (player.jumping) {
        ctx.drawImage(images["rightArm-jump"], player.x - 35, player.y - 42);
    } else {
        ctx.drawImage(images["rightArm"], player.x - 15, player.y - 42);
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
    if (WIDTH > (doors.two.x + doors.width + 50)) {
        if (scene.x > WIDTH) {
            scene.x = -WIDTH;
        }
        if (scene.x < -WIDTH) {
            scene.x = WIDTH;
        }
    } else {
        if (scene.x > (doors.two.x + doors.width)) {
            scene.x = -(doors.two.x + doors.width);
        }
        if (scene.x < -(doors.two.x + doors.width)) {
            scene.x = WIDTH;
        }
    }

    // Door selection on jumping in front of it
    if (player.jumping && !player.selectingDoor) {
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

    // Ceiling
    ctx.save();

    ctx.fillStyle = 'lightgrey';
    ctx.shadowColor = '#999';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 5;
    ctx.fillRect(0, 0, WIDTH, 100);
    ctx.fill();

    ctx.restore();

    
    // Lobby Floor
    ctx.save();

    ctx.fillStyle = 'brown';
    ctx.fillRect(0, floor.height, WIDTH, floor.height);
    ctx.fill();

    ctx.restore();


    // Door 1 - Forest 
    drawDoor(scene.x + doors.one.x, floor.height - doors.height - doors.border, doors.width, doors.height, 2, 'grey');


    // Door 2 - Town
    drawDoor(scene.x + doors.two.x, floor.height - doors.height - doors.border, doors.width, doors.height, 2, 'green');

}

function drawDoor(x, y, width, height, borderThickness, colour) {

    drawRectangle(x, y, width, height, borderThickness, colour);

    // Door Knob
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + 30, y + height / 2, 10, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'black';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#003300';
    ctx.stroke();
    ctx.restore();
}

function drawRectangle(x, y, width, height, borderThickness, colour) {
    ctx.save();

    // Border
    ctx.fillStyle = '#000';
    ctx.fillRect(x - (borderThickness), y - (borderThickness), width + (borderThickness * 2), height + (borderThickness * 2));

    // Rectangle
    ctx.fillStyle = colour;
    ctx.fillRect(x, y, width, height);

    ctx.restore();

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

function loadImage(name) {
    images[name] = new Image();
    images[name].src = "/images/character-2d/" + name + ".png";
}

function showPuzzle() {
    console.log('showPuzzle');


    if (game.GoingTo.area == game.Areas.Forest) {
        drawRectangle(50, 50, WIDTH - 100, HEIGHT - 100, 3, 'green');
    }

    if (game.GoingTo.area == game.Areas.Town) {
        drawRectangle(50, 50, WIDTH - 100, HEIGHT - 100, 3, 'grey');
    }

    ctx.save();

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    // ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(60, 60);
    ctx.lineTo(90, 90);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(60, 90);
    ctx.lineTo(90, 60);
    ctx.stroke();

    ctx.restore();


}

function touchTargets(pointerX, pointerY) {

    // X close button for puzzle
    if (game.GoingTo.puzzleInProgress) {
        if (pointerX >= 50 && pointerX <= 100 && pointerY >= 50 && pointerY <= 100) {
            console.log("HIIIIIT");
            game.cancelPuzzle();
        }
    }
}

function animate() {
    // Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    if (game.CurrentArea == game.Areas.Lobby) {
        lobbyObjects();
    }

    touchTargets();

    animatePlayer();

    if (game.GoingTo.puzzleInProgress) {
        showPuzzle();
    }

    requestAnimationFrame(animate);
}


window.addEventListener("keydown", function (e) {
    keys[e.keyCode] = true;
});

window.addEventListener("keyup", function (e) {
    keys[e.keyCode] = false;

    if (e.keyCode == 27) {
        game.cancelPuzzle();
    }
});

window.addEventListener("touchstart", function (e) {
    e.preventDefault();
    let pointerX = e.touches[0].clientX;
    let pointerY = e.touches[0].clientY;

    console.log(pointerX);
    console.log(pointerY);

    touchTargets(pointerX, pointerY);

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
    if (pointerX < WIDTH / 2) {
        // Left
        keys["left"] = !keys["left"];
    }
    if (pointerX > WIDTH / 2) {
        // Right
        keys["right"] = !keys["right"];
    }
});


var timeout;
var lastTap = 0;

window.addEventListener("touchend", function (e) {
    e.preventDefault();


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
});

window.onload = function () {
    animate();
};

function gameSend2DCommand(command) {
    console.log(command);
}