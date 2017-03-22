/* globals game */

const terminal = document.querySelector('.terminal');
const input = document.querySelector('.input');

const forest = {
    word: 'forest'
}

const lobby = {
    words: ['lobby','home','menu']
}

function gameTextCommand(text) {
    const message = text.toLowerCase();

    console.log({message});

    // Lobby
    let goToLobby;
    lobby.words.map((word) => {
        if(message.includes(word)) goToLobby = true;
    });
    if (goToLobby) {
        game.backToLobby();
        return;
    }

    // Forest
    if (message.includes(forest.word)) {
        game.goToForest();
        return;
    }



    // General
    



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

function userSendTextCommand(text) {
    let div = document.createElement('div');
    let p = document.createElement('p');
    let span = document.createElement('span');

    p.classList = "user";
    p.textContent = text;
    div.appendChild(p);

    let time = new Date().toLocaleString('en-GB').split(', ');
    console.log({time});
    span.textContent = time;
    div.appendChild(span);

    input.value = "";
    terminal.appendChild(div);
}

function gameSendTextCommand(text) {
    let div = document.createElement('div');
    let p = document.createElement('p');
    let span = document.createElement('span');

    p.textContent = text;
    div.appendChild(p);

    let time = new Date().toLocaleString('en-GB').split(', ');
    console.log({time});
    span.textContent = time;
    div.appendChild(span);

    input.value = "";
    terminal.appendChild(div);
}

window.addEventListener('keydown', function (event) {
    if (event.keyCode == 13) {
        onEnter();
    }
});