import React, {Component} from 'react';
import { withRouter } from "react-router-dom";
var $ = require("jquery");

// choosing options for the game
class GameOptions extends Component {
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
                    <button type="submit" onClick={(event) => {
                        event.preventDefault();
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
                    }}>Go!</button>
                    {/* lol */}
                </form>
            </div>
        )
    }
}

export default withRouter(GameOptions);
