import React, {Component} from 'react';
import { withRouter } from "react-router-dom";
var $ = require("jquery");

// choosing options for the game
class GameOptions extends Component {
    loadGames() {

    }

    setTab(tabname) {

    }

    render() {
        return (
            <div>
                <h3>Ethereum Go game lobby</h3>
                <div id="tabButtons">
                    <button onclick={this.setTab("ongoing")} id="Ongoing">Ongoing</button>
                    <button onclick={this.setTab("open")} id="Open">Open</button>
                    <button onclick={this.setTab("challenge")} id="Challenge">Challenge</button>
                </div>
            </div>
            <table id="gamesTable">
                <tr>
                    <th>Player1</th>
                    <th>Game Type</th>
                    <th>Player</th>
                </tr>
            </table>
        )
    }
}

export default withRouter(GameOptions);
