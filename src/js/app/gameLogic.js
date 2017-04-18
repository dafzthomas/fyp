// This should be grabbed from an external data source if saving user data i.e. Firebase user data
const GameConfig = {
    Areas: {
        Lobby: {
            name: 'lobby',
            texts: ['lobby', 'home', 'menu'],
            description: `An empty room with not much going on... a lobby you could say. There's two doors. Where do they lead?`
        },
        Forest: {
            name: 'forest',
            texts: ['forest'],
            puzzle: ['trees', 'wood', 'grass', 'green'],
            description: 'Many trees and a light fog etc...'
        },
        Town: {
            name: 'town',
            texts: ['town'],
            puzzle: ['house', 'road', 'concrete', 'lights'],
            description: `Small urban looking area. Some buildings and trees are around. `
        }
    },
    CurrentArea: null,
    GoingTo: {
        area: null,
        puzzleInProgress: false,
        puzzleComplete: false
    },
    GameType: null
}

class Game {
    constructor({
        CurrentArea = this.CurrentArea,
        Areas = this.Areas,
        GoingTo = this.GoingTo,
        GameType = this.GameType
    } = {}) {
        this.CurrentArea = CurrentArea;
        this.Areas = Areas;
        this.GoingTo = GoingTo;
        this.GameType = GameType;
    }

    gameSendMessage(text) {
        // Text
        if (this.GameType == 'text') {
            gameSendTextCommand(text);
        }

    }

    whereAmI() {
        this.gameSendMessage(`You are now in the ${this.CurrentArea.name}. ${this.CurrentArea.description}`);
    }

    goToSelectedArea() {
        if (this.GoingTo.area.name == "town") {
            this.goToTown();
        } else if (this.GoingTo.area.name == "forest") {
            this.goToForest();
        }
    }

    cancelPuzzle() {
        this.GoingTo.area = null;
        this.GoingTo.puzzleInProgress = false;
        this.GoingTo.puzzleComplete = false;

        console.log(`Puzzle and travel cancelled.`);
    }

    goToPuzzleCheck(area) {
        this.GoingTo.area = this.GoingTo.area || area;

        if (this.CurrentArea == this.Areas.Lobby) {
            if (this.GoingTo.puzzleComplete) {
                this.CurrentArea = this.GoingTo.area;
                this.cancelPuzzle();
                this.whereAmI();
                return;
            } else {
                this.GoingTo.puzzleInProgress = true;
                this.gameSendMessage(`Enter the following commands to go through the door: ${this.GoingTo.area.puzzle.map(word => word)}`);
                return;
            }


        } else {
            this.gameSendMessage(`You cannot jump areas! Try going back to the lobby first.`);
            return;
        }
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
        console.log('goToForest');
        if (this.CurrentArea == this.Areas.Forest) {
            this.gameSendMessage(`You are already in the ${this.CurrentArea.name}!`);
            return;
        }
        this.goToPuzzleCheck(this.Areas.Forest);
    }

    goToTown() {
        console.log('goToTown');
        if (this.CurrentArea == this.Areas.Town) {
            this.gameSendMessage(`You are already in the ${this.CurrentArea.name}!`);
            return;
        }
        this.goToPuzzleCheck(this.Areas.Town);
    }
}

const game = new Game(GameConfig);