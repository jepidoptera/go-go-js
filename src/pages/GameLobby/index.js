import React, {Component} from 'react';
import { withRouter } from "react-router-dom";
import api from "../../js/api";
import "./gamelobby.css"
import localPlayer from "../../components/LocalPlayer";
import {startGame} from '../GameOptions';
import OpponentList from '../../components/OpponentList';

var $ = require("jquery");

// choosing options for the game
class GameLobby extends Component {
    state = {
        localPlayer: {},
        allgames: [],
        games: [],
        selectedTab: "ongoing",
        loadGameInterval: null
    }

    componentDidMount() {
        // we should call localPlayer.load() at the beginning of every pages that uses it
        // also remember to call localPlayer.unload() on componentWillUnmount()
        localPlayer.load(() => {
            localPlayer.authorize(valid => {
                if (!valid) {
                    alert("you have been logged out.");
                    // booted back to the home page.
                    this.props.history.push("/");
                }
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
        })
    }

    componentWillUnmount() {
        // stop pinging for new games
        clearInterval(this.state.loadGameInterval);
        // unload localPlayer
        localPlayer.unload();
    }

    loadGames(callback) {
        // save reference to self for callback function
        var self = this;
        // ask the api for a list of all games
        api.loadAllGames(function(games) {
            // let's see what we've got
            self.setState({allgames: JSON.parse(games)});
            console.log("loaded games: ", self.state.allgames);
            // run callback if there is one
            if (callback) callback();
        })
    }

    logOut() {
        // clear login data and return to home page
        sessionStorage.setItem("username", "");
        sessionStorage.setItem("authtoken", "");
        this.props.history.push("/");
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
                    (game.player2 === "" && game.player1 !== localPlayer.username)
                )
                break;
            }
            case ("challenge"): {
                // find games which have no history, but player2 == local player
                console.log("finding challenges for: ", localPlayer.username);
                games = games.filter((game) => 
                    (game.player2 === localPlayer.username && game.history.length === 0)
                )
                break;
            }
            default: break;
        }
        this.setState({ games: games, selectedTab: tabname });
    }

    newGame() {
        startGame(true);
    }

    joinGame(gameID) {
        
    }

    dismissGame(gameID) {
        
    }

    render() {
        return (
            <div>
                <h3>Ethereum Go game lobby</h3>
                <h4 className="playerTag">Logged in as: {localPlayer.username}
                    <button
                        className="inlineBtn"
                        onClick={() => this.logOut()}>
                        Log Out
                    </button>
                </h4>

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
                        <tr className="noborder">
                            <th></th>
                            <th>Opponent</th>
                            <th>Game Type</th>
                        </tr>
                        {/* horizontal line */}
                        <tr className="noborder"><td colSpan="4"><hr></hr></td></tr>

                        {
                            this.state.selectedTab === "challenge"
                                ? (<tr>
                                    <td>
                                        <button
                                            className="gameActionBtn"
                                            onClick={() => this.newGame()}>
                                            Start a Game
                                        </button>
                                    </td>
                                    <td>
                                        <OpponentList localPlayer={localPlayer.username}/>
                                    </td>
                                    <td>
                                        <select id="boardType">
                                            <option value="0">standard</option>
                                            <option value="2">hexasphere</option>
                                        </select>
                                        <select id="boardSize">
                                            <option value="0">small</option>
                                            <option value="1">medium</option>
                                            <option value="2">large</option>
                                        </select>
                                    </td>
                                    </tr>
                                )
                                : null
                        }

                        {/* all the games in the selected list filter */}
                        {this.state.games.map((game, i) => {
                            return (
                                <tr key={i}>
                                    {this.state.selectedTab !== "challenge"
                                        ? (<td><button className="gameActionBtn" onclick={this.joinGame(game.Id)}>Join</button></td>)
                                        : (<td>
                                            <button className="gameActionBtn" onclick={this.joinGame(game.Id)}>Accept</button>
                                            <button className="gameActionBtn">Dismiss{this.dismissGame(game.ID)}</button>
                                        </td>)
                                    }
                                    <td>{game.player1}</td>
                                    <td>{game.description}</td>
                                    {/* <td>{game.online ? "yes" : "no"}</td> */}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        )
    }
}

export default withRouter(GameLobby);