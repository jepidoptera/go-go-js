var $ = require("jquery");
export default {
    url: "https://gogobackend.azurewebsites.net/api",
    loadGame: function (gameID, callback) {
        // load a specific game
        $.get(this.url + "/games/" + gameID)
            .done(data => {
                callback(data);
            })
            .fail(err => console.log("error fetching games list...", err));
    },
    loadAllGames: function (callback) {
        // get all the info about all the games
        $.get(this.url + "/games/all")
        .done(data => {
            // console.log("api fetched: ", data);
            callback(data);
        })
        .fail(err => {
            console.log("error fetching game data: ", err);
        })
    },
    loadOpenGames: function(callback) {
        $.get(this.url + "/games/open/" + sessionStorage.getItem("username"))
        .done(data => {
            // console.log("api fetched: ", data);
            callback(data);
        })
        .fail(err => {
            console.log("error fetching open game data: ", err);
        })
    },
    loadOngoingGames: function(callback) {
        $.get(this.url + "/games/ongoing/" + sessionStorage.getItem("username"))
        .done(data => {
            // console.log("api fetched: ", data);
            callback(data);
        })
        .fail(err => {
            console.log("error fetching ongoing game data: ", err);
        })
    },
    loadChallengeGames: function(callback) {
        $.get(this.url + "/games/challenge/" + sessionStorage.getItem("username"))
        .done(data => {
            // console.log("api fetched: ", data);
            callback(data);
        })
        .fail(err => {
            console.log("error fetching challenge game data: ", err);
        })
    },
    newGame: function (game, callback) {
        // validate game data
        // don't really need to do this, the server will handle it
        if (!game.player1) {
            let message = "can't start game with no player1!"
            console.log(message);
            return {message: message };
        }
        // send new game request to server
        $.ajax({
            url: this.url + "/games/new",
            data: game,
            method: "POST"
        }).done(data => {
            // send the data to the callback
            // this will be { gameID } if success, { message } if failure
            callback(data);
        }).fail(err => {
            console.log("error starting game: ", err);
        })
    },
    joinGame: function (gameID, username, authtoken, callback) {
        // send new game request to server
        $.ajax({
            url: this.url + "/games/join/" + gameID,
            data: {username: username, authtoken: authtoken},
            method: "POST"
        }).done(data => {
            // send the data to the callback
            // this will be { gameID } if success, { message } if failure
            callback(data);
        }).fail(err => {
            console.log("error joining game: ", err);
        })
    },
    deleteGame: function (gameID, username, authtoken, callback) {
        // send new game request to server
        $.ajax({
            url: this.url + "/games/delete/" + gameID,
            data: {username: username, authtoken: authtoken},
            method: "DELETE"
        }).done(data => {
            // send the data to the callback
            // this will be { gameID } if success, { message } if failure
            callback(data);
        }).fail(err => {
            console.log("error deleting game: ", err);
        })
    },
    makeMove: function (gameID, x, y, color, username, authtoken, callback) {
        $.ajax({
            url: this.url + "/games/move/" + gameID,
            data: {username: username, authtoken: authtoken, x: x, y: y, opcode: color},
            method: "POST"
        }).done(data => {
            // send the data to the callback
            // in this case, this will be the opponent's move
            callback(data);
        }).fail(err => {
            console.log("error posting move: ", err);
        })
    },
    gameState: function (gameID, callback) {
        $.get(this.url + "/games/state/" + gameID)
            .done(data => {
                // return it as an array of ints
                callback(data.split(",").map(node => parseInt(node)));
            }).fail(err => console.log("error fetching game state: ", err));
    },
    loadPlayer: function (username, callback) {
        $.get(this.url + "/user/info/" + username)
            .done(data => {
                // console.log("api fetched: ", data);
                // comes back as a string, so parse it.
                callback(JSON.parse(data));
            })
            .fail(err => {
                console.log("error fetching player data: ", err);
            })
    },
    loadAllPlayers: function (callback) {
        // get me everything on everyone.
        $.get(this.url + "/user/all")
            .done(data => {
                callback(JSON.parse(data));
            }).fail(err => {
                console.log("error loading player list: ", err);
            })
    },
    ping: function (username, authtoken, callback) {
        $.ajax({
            url: this.url + "/user/ping",
            method: "POST",
            data: { username: username, authtoken: authtoken }
        }).done(data => {
            callback(data);
        }).fail(err => console.log("error sending ping...", err));
        
    },
    authorizePlayer: function (username, authtoken, callback) {
        $.ajax({
            url: this.url + "/user/authorize",
            method: "POST",
            data: { username: username, authtoken: authtoken }
        }).done(data => {
            callback(data);
        }).fail(err => console.log("error authorizing user...", err));
    }
}