/* globals game */

const terminal = document.querySelector('.terminal');
const input = document.querySelector('.input');

function gameTextCommand(text) {
    const message = text.toLowerCase();

    console.log({
        message
    });

    // Lobby
    let goToLobby;
    game.Areas.Lobby.texts.map((word) => {
        if (message.includes(word)) goToLobby = true;
    });
    if (goToLobby) {
        game.backToLobby();
        return;
    }

    // Forest
    let goToForest;
    game.Areas.Forest.texts.map((word) => {
        if (message.includes(word)) goToForest = true;
    });
    if (goToForest) {
        game.goToForest();
        return;
    }

    // Town
    let goToTown;
    game.Areas.Town.texts.map((word) => {
        if (message.includes(word)) goToTown = true;
    });
    if (goToTown) {
        game.goToTown();
        return;
    }



    // General
    if (game.GoingTo.puzzleInProgress) {
        let passed = 0;

        game.GoingTo.area.puzzle.map((word) => {
            if (message.includes(word)) passed++;
        });

        console.log({
            Length: game.GoingTo.area.puzzle.length,
            Passed: passed
        });

        if (game.GoingTo.area.puzzle.length == passed) {
            game.GoingTo.puzzleComplete = true;
            game.goToSelectedArea();
            return;
        } else {
            gameSendTextCommand(`Come again?`);
            return;
        }
    }



    // Not recognised
    gameSendTextCommand(`Sorry, the command "${text}" was not recognised.`);
}

function onEnter() {
    if (!input.value) return;

    const value = input.value

    userSendTextCommand(value);
    gameTextCommand(value);

    terminal.scrollTop = terminal.scrollHeight;
}

function addMessage(text, user) {
    let div = document.createElement('div');
    let p = document.createElement('p');
    let span = document.createElement('span');

    if (user) p.classList = "user";

    p.textContent = text;
    div.appendChild(p);

    let time = new Date().toLocaleString('en-GB').split(', ');
    console.log({
        time
    });
    span.textContent = time;
    div.appendChild(span);

    input.value = "";
    terminal.appendChild(div);
}

function userSendTextCommand(text) {
    addMessage(text, true);
}

function gameSendTextCommand(text) {
    addMessage(text, false);
}

window.addEventListener('keydown', function (event) {
    if (event.keyCode == 13) {
        onEnter();
    }
});