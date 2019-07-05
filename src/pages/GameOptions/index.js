import React, {Component} from 'react';
import { withRouter } from "react-router-dom";
import api from "../../js/api";
var $ = require("jquery");

// choosing options for the game
class GameOptions extends Component {
    state = {
        otherPlayers: {}
    }
    componentDidMount() {
        // if this is an online game, load list of other players
        if (this.props.online) this.getPlayers();
    }
    getPlayers() {
        // load player list from the server
        api.loadAllPlayers(players => {
            this.setState({ otherPlayers: players });
        })
    }
    startGame() {
        // get board type and size from form
        let boardType = $("#boardType").val();
        let boardSize = {
            'standard': [9, 13, 19],
            'hexasphere': [1, 2, 3]
        }[boardType][$("#boardSize").val()];
        // start the game with the provided constructor
        this.props.startGame(boardType, boardSize);
        let newURL = {
            'standard': '/game/standard',
            'hexasphere': '/game/3d'
        }[boardType];
        this.props.history.push(newURL);
    }
    render() {
        return (
            <div>
                <h3>Set game options:</h3>
                <form action="" id="gameOptions" method="" >
                    Board Type: <select id="boardType">
                        <option value="standard">standard</option>
                        <option value="hexasphere">hexasphere</option>
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
                        ? (<div>
                            Opponent:
                            <select>
                            <option>open challenge</option>
                            {this.state.otherPlayers.map(player => {
                                return (
                                    <option>
                                        {player.username}
                                        {player.online
                                            // show a little icon if the player is online
                                            ? <span className="onLineIndicator"></span> : null}
                                    </option>
                                )
                            })}
                        </select></div>)
                        : null
                    }
                    <button type="submit" onClick={(event) => {
                        event.preventDefault();
                        this.startGame();
                    }}>Go!</button>
                    {/* lol */}
                </form>
            </div>
        )
    }
}

export default withRouter(GameOptions);
