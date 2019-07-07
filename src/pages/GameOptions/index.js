import React, {Component} from 'react';
import { withRouter } from "react-router-dom";
import api from "../../js/api";
import localPlayer from "../../components/LocalPlayer";
import OpponentList from "../../components/OpponentList";
import Game from '../Game';

var $ = require("jquery");

// choosing options for the game
class GameOptions extends Component {
    state = {
        otherPlayers: []
    }

    componentDidMount() {
        // if this is an online game, our player, then all the other players
        console.log("local player:", localPlayer);
        if (!localPlayer.authorize) {
            alert("you have been logged out.");
            // back to the home page
            this.props.history.push("/");
        }
    }

    render() {
        return (
            <div>
                <h3>Set game options:</h3>
                <form action="" id="gameOptions" method="" >
                    Board Type: <select id="boardType">
                        <option value="0">standard</option>
                        <option value="2">hexasphere</option>
                    </select>
                    <br></br><br></br>
                    Board Size: <select id="boardSize">
                        <option value="0">small</option>
                        <option value="1">medium</option>
                        <option value="2">large</option>
                    </select>
                    <br></br><br></br>
                    {/* if this is an online game, show the other players you can challenge */}
                    {this.props.online
                        ? <OpponentList localPlayer={localPlayer.username}/>
                        : null
                    }
                    <br></br><br></br>
                    <button type="submit" onClick={(event) => {
                        event.preventDefault();
                        startGame(this.props.online);
                    }}>Go!</button>
                    {/* lol */}
                </form>
            </div>
        )
    }
}

const startGame = (online) => {
    // get board type and size from form
    let boardType = $("#boardType").val();
    let boardSize = {
        0: [9, 13, 19],
        2: [1, 2, 3]
    }[boardType][$("#boardSize").val()];
    // navigate to game page
    let newURL = "/game";
    if (online) {
        // generate a new game with API
        let newGame = {
            player1: localPlayer.username,
            player2: $("select[name='otherPlayer'").val(),
            authtoken: sessionStorage.getItem("authtoken"),
            boardsize: boardSize,
            mode: boardType
        };
        console.log("creating game...", newGame);
        api.newGame(newGame, (data) => {
            // if (data.gameID) {
            //     newURL += "?gameID=" + data.gameID;
            //     // start online game!
            //     this.props.history.push(newURL);
            // }
            console.log("Created game", data);
            alert("The gauntlet has been thrown.  You'll be alerted when "
                + (Game.player2 || "someone") + " responds.");
        })
    }
    else {
        // add game type and board size as query parameters
        newURL += "?boardType=" + boardType + "&boardSize=" + boardSize;
        window.location.href = (newURL);
    }
}

export default withRouter(GameOptions);

export { startGame }
