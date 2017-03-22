// This should be grabbed from an external data source i.e. Firebase user data
const GameConfig = {
    Areas: {
        Lobby: {
            name: 'lobby',
            description: 'An empty room with not much going on. There are two doors.'
        },
        Forest: {
            name: 'forest',
            description: 'Many trees and a light fog etc...'
        },
        Town: {
            name: 'town',
            description: 'Small urban area etc...'
        }
    },
    CurrentArea: () => this.Areas.Lobby
}

class Game {
    constructor({
        CurrentArea = this.CurrentArea,
        Areas = this.Areas,
        QuestionPhrases = this.QuestionPhrases
    } = {}) {
        this.CurrentArea = CurrentArea;
        this.Areas = Areas;
    }

    get genericTextResponse() {
        if (this.CurrentArea.name == 'lobby') {

        }
    }

    gameSendMessage(text) {
        // Text
        gameSendTextCommand(text);

        // 2D

        // 3D
    }

    whereAmI() {
        this.gameSendMessage(`You are now in the ${this.CurrentArea.name}. ${this.CurrentArea.description}`);
    }

    backToLobby() {
        if (this.CurrentArea == this.Areas.Lobby) {
            this.gameSendMessage(`You are already in the ${this.CurrentArea.name}!`);
            return;
        }
        this.CurrentArea = this.Areas.Lobby;
        this.whereAmI();
    }

    goToForest() {
        this.CurrentArea = this.Areas.Forest;
        this.whereAmI();
    }

    goToTown() {
        this.whereAmI();
    }
}

const game = new Game(GameConfig);

game.gameSendMessage(`Welcome to the game.`);
game.gameSendMessage(`You awake in a waiting room of sorts, there are 3 doors.`);