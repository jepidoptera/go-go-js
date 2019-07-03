var $ = require("jquery");
export default {
    url: "https://gogobackend.azurewebsites.net/api",
    loadGames: function (callback) {
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
    }
}