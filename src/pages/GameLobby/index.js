import React, {Component} from 'react';
import { withRouter } from "react-router-dom";
import api from "../../js/api";
import "./gamelobby.css"
var $ = require("jquery");

// choosing options for the game
class GameOptions extends Component {
    state = {
        games: []
    }

    componentDidMount() {
        this.loadGames();
    }

    loadGames() {
        var self = this;
        api.loadGames(function(games) {
            // let's see what we've got
            self.setState({games: JSON.parse(games)});
            console.log("loaded games: ", self.state.games);
        })
    }

    setTab(tabname) {
        
    }

    render() {
        return (
            <div>
                <h3>Ethereum Go game lobby</h3>
                <h4>Logged in as: {sessionStorage.getItem("username")}</h4>
                <div id="tabButtons">
                    <button onClick={this.setTab("ongoing")} id="Ongoing">Ongoing</button>
                    <button onClick={this.setTab("open")} id="Open">Open</button>
                    <button onClick={this.setTab("challenge")} id="Challenge">Challenge</button>
                </div>
                <table id="gamesTable">
                    <tbody>
                        <tr>
                            <th>Host</th>
                            <th>Game Type</th>
                            <th>Online?</th>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}

export default withRouter(GameOptions);
