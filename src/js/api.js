var $ = require("jquery");
export default {
    url: "https://gogobackend.azurewebsites.net/api",
    loadGame: function (gameID, callback) {
        // load a specific game
        $.get(this.url + "/games/" + gameID).then(data => {
            callback(data);
        })
    },
    loadAllGames: function (callback) {
        // get all the info about all the games
        $.get(this.url + "/games/all")
        .then(data => {
            // console.log("api fetched: ", data);
            callback(data);
        })
        .catch(err => {
            console.log("error fetching game data: ", err);
        })
    },
    loadOpenGames: function(callback) {
        $.get(this.url + "/games/open/" + sessionStorage.getItem("username"))
        .then(data => {
            // console.log("api fetched: ", data);
            callback(data);
        })
        .catch(err => {
            console.log("error fetching open game data: ", err);
        })
    },
    loadOngoingGames: function(callback) {
        $.get(this.url + "/games/ongoing/" + sessionStorage.getItem("username"))
        .then(data => {
            // console.log("api fetched: ", data);
            callback(data);
        })
        .catch(err => {
            console.log("error fetching ongoing game data: ", err);
        })
    },
    loadChallengeGames: function(callback) {
        $.get(this.url + "/games/challenge/" + sessionStorage.getItem("username"))
        .then(data => {
            // console.log("api fetched: ", data);
            callback(data);
        })
        .catch(err => {
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
        })
    },
    loadPlayer: function (username, callback) {
        $.get(this.url + "/user/info/" + username)
            .then(data => {
                // console.log("api fetched: ", data);
                // comes back as a string, so parse it.
                callback(JSON.parse(data));
            })
            .catch(err => {
                console.log("error fetching player data: ", err);
            })
    },
    loadAllPlayers: function (callback) {
        // get me everything on everyone.
        $.get(this.url + "/user/all")
            .then(data => {
                callback(JSON.parse(data));
            })
    },
    ping: function (username, authtoken, callback) {
        $.ajax({
            url: this.url + "/user/ping",
            method: "POST",
            data: {username: username, authtoken: authtoken}
        })
            .then(data => {
                callback(data);
            })
    },
    authorizePlayer: function (username, authtoken, callback) {
        $.ajax({
            url: this.url + "/user/authorize",
            method: "POST",
            data: { username: username, authtoken: authtoken }
        })
            .then(data => {
                callback(data);
            })
    }
}