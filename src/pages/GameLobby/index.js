import React, {Component} from 'react';
import { withRouter } from "react-router-dom";
import api from "../../js/api";
import "./gamelobby.css"
var $ = require("jquery");

// choosing options for the game
class GameOptions extends Component {
    state = {
        localPlayer: {},
        allgames: [],
        games: [],
        selectedTab: "ongoing",
        loadGameInterval: null
    }

    componentDidMount() {
        // load player
        let username = sessionStorage.getItem("username");
        var self = this;
        api.loadPlayer(username, player => {
            console.log("setting state ", player, " within ", this);
            this.setState({ localPlayer: player });
        })

        // load games
        this.loadGames(() => this.setTab("open"));
        // check for new games once every ten seconds.
        // save a reference to the interval so we can clear it when the user leaves the page.
        this.setState({
            loadGameInterval: 
            setInterval(() => {
                this.loadGames(() => this.setTab(this.state.selectedTab));
            }, 10000)
        })
    }

    componentWillUnmount() {
        // stop pinging for new games
        clearInterval(this.state.loadGameInterval);
    }

    loadGames(callback) {
        // save reference to self for callback function
        var self = this;
        // ask the api for a list of all games
        api.loadGames(function(games) {
            // let's see what we've got
            self.setState({allgames: JSON.parse(games)});
            console.log("loaded games: ", self.state.games);
            // run callback if there is one
            if (callback) callback();
        })
    }

    setTab(tabname) {
        let games = this.state.allgames;
        switch (tabname) {
            case ("ongoing"): {
                // find games which this player is involved in, and which have already started
                let username = sessionStorage.getItem("username");
                games = games.filter((game) => 
                    ((game.player1 === username || game.player2 === username) &&
                        game.history.length > 0)
                )
                break;
            }
            case ("open"): {
                // find games which have no player2
                games = games.filter((game) => 
                    (game.player2 === "")
                )
                break;
            }
            case ("challenge"): {
                // find games which have no history, but player2 == local player
                let username = sessionStorage.getItem("username");
                games = games.filter((game) => 
                    (game.player2 === username && game.history.length === 0)
                )
                break;
            }
        }
        this.setState({ games: games, selectedTab: tabname });
    }

    render() {
        return (
            <div>
                <h3>Ethereum Go game lobby</h3>
                <h4>Logged in as: {this.state.localPlayer.username}
                <button className="inlineBtn">Start a Game</button></h4>
                <div id="tabButtons">
                    <button className={"tabButton" + (this.state.selectedTab === "ongoing" ? " selected" : "")}
                        onClick={() => this.setTab("ongoing")} id="Ongoing">Ongoing</button>
                    <button className={"tabButton" + (this.state.selectedTab === "open" ? " selected" : "")}
                        onClick={() => this.setTab("open")} id="Open">Open</button>
                    <button className={"tabButton" + (this.state.selectedTab === "challenge" ? " selected" : "")}
                        onClick={() => this.setTab("challenge")} id="Challenge">Challenge</button>
                </div>
                <table id="gamesTable">
                    <tbody>
                        <tr>
                            <th>Host</th>
                            <th>Game Type</th>
                            <th>Online?</th>
                            <th>Action</th>
                        </tr>
                        {/* horizontal line */}
                        <tr><td colSpan="4"><hr></hr></td></tr>
                        {/* all the games in the selected list filter */}
                        {this.state.games.map(game => {
                            return (
                                <tr key={game.Id}>
                                    <td>{game.player1}</td>
                                    <td>{game.description}</td>
                                    <td>{game.online ? "yes" : "no"}</td>
                                    {this.state.selectedTab !== "challenge"
                                        ? (<td><button className="gameActionBtn">Join</button></td>)
                                        : (<td>
                                            <button className="gameActionBtn">Accept</button>
                                            <button className="gameActionBtn">Dismiss</button>
                                        </td>)
                                    }
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        )
    }
}

export default withRouter(GameOptions);