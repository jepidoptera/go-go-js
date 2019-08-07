import React, {Component} from 'react';
import { withRouter } from "react-router-dom";
import api from "../../js/api";
import "./gamelobby.css"
import localPlayer from "../../components/LocalPlayer";
import {startGame} from '../GameOptions';
import OpponentList from '../../components/OpponentList';

// choosing options for the game
class GameLobby extends Component {
    state = {
        localPlayer: {},
        allgames: [],
        games: [],
        challengeGames: 0,
        selectedTab: "ongoing",
        loadGameInterval: null
    }

    // filtering different types of games
    ongoingFilter = (game) =>
        (game.white === localPlayer.username || game.black === localPlayer.username)
            && game.history.length > 0
    // anyone can join an open game
    openFilter = (game) =>
        (game.black === "" && game.white !== localPlayer.username)
    // a challenge is issued directly to this player and already has their name filled in
    challengeFilter = (game) =>
        (game.black === localPlayer.username && game.history.length === 0)

    componentDidMount() {
        // we should call localPlayer.load() at the beginning of every pages that uses it
        // also remember to call localPlayer.unload() on componentWillUnmount()
        localPlayer.load(() => {
            // load games
            this.loadGames(() => {
                // count all ongoing games
                let ongoingGames = this.state.allgames.filter(this.ongoingFilter).length;
                // count all direct challenge games
                let challengeGames = this.state.allgames.filter(this.challengeFilter).length;
                // select tab in this priority:
                // challenge games first, if there are any.
                // if not, then ongoing games, if there are any.
                // if not, fall back to open games
                this.setTab(challengeGames ? "challenge"
                    : (ongoingGames
                    ? "ongoing" : "open"))
            });
            // check for new games once every ten seconds.
            // save a reference to the interval so we can clear it when the user leaves the page.
            this.setState({
                loadGameInterval:
                    setInterval(() => {
                        this.loadGames(() => this.setTab(this.state.selectedTab));
                    }, 1000)
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
                games = games.filter(this.ongoingFilter)
                break;
            }
            case ("open"): {
                // find games which have no player2
                games = games.filter(this.openFilter)
                break;
            }
            case ("challenge"): {
                // find games which have no history, but player2 == local player
                console.log("finding challenges for: ", localPlayer.username);
                games = games.filter(this.challengeFilter)
                break;
            }
            default: break;
        }
        // challenge games get their own special little icon
        this.setState({ challengeGames: this.state.allgames.filter(this.challengeFilter).length })
        this.setState({ games: games, selectedTab: tabname });
    }

    createGame() {
        startGame(true);
    }

    joinGame(gameID) {
        // we will try to join this game
        api.joinGame(gameID, localPlayer.username, localPlayer.authtoken, data => {
            if (data.error) {
                // failed. express reason
                console.log(data.error);
                return;
            }
            // joined the game
            // go to game page
            this.props.history.push("/game?gameId=" + gameID)
        })
    }

    dismissGame(gameID) {
        api.deleteGame(gameID, localPlayer.username, localPlayer.authtoken, data => {
            if (data.error) {
                // failed. express reason
                console.log(data.error);
                return;
            }
            // we have received confirmation of delete
            // remove it from games list
            this.setState({games: this.state.games.filter(
                game => game.Id !== gameID
            )})
        })
    }

    render() {
        return (
            <div id="gameLobby">
                <h3>Ethereum Go game lobby
                    <div className="playerTag">Logged in as: {localPlayer.username}
                        <button
                            className="inlineBtn"
                            onClick={() => this.logOut()}>
                            Log Out
                        </button>
                    </div>
                </h3>

                <div id="tabButtons">
                    <button className={"tabButton" + (this.state.selectedTab === "ongoing" ? " selected" : "")}
                        onClick={() => this.setTab("ongoing")} id="Ongoing">Ongoing</button>
                    <button className={"tabButton" + (this.state.selectedTab === "open" ? " selected" : "")}
                        onClick={() => this.setTab("open")} id="Open">Open</button>
                    <button className={"tabButton" + (this.state.selectedTab === "challenge" ? " selected" : "")}
                        onClick={() => this.setTab("challenge")} id="Challenge">
                            Challenge
                            {
                                this.state.challengeGames > 0
                                ? <span className="challengeIcon">{this.state.challengeGames}</span>
                                : ''
                            }
                        </button>
                </div>
                <table id="gamesTable">
                    <tbody>
                        {/* headers: game type, opponent, game history */}
                        <tr className="noborder">
                            <th></th>
                            <th>Opponent</th>
                            <th>Status</th>
                            <th>Game Type</th>
                        </tr>
                        {/* horizontal line */}
                        <tr className="noborder"><td colSpan="3"><hr></hr></td></tr>

                        {
                            this.state.selectedTab === "challenge"
                // in challenge mode, the first row
                // is a menu for creating a new challenge game
                                ? (<tr>
                                    <td>
                                        <button
                                            className="actionBtn"
                                            onClick={() => this.createGame()}>
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

                                // in other tabs, don't show that part
                                : null
                        }

                        {/* all the games in the selected list filter */}
                        {this.state.games.map((game, i) => {
                            return (
                                <tr key={i}>
                                    {this.state.selectedTab !== "challenge"
                                        ? (<td><button className="actionBtn" onClick={() => this.joinGame(game.Id)}>Join</button></td>)
                                        : (<td>
                                             <button className="actionBtn" onClick={() => this.joinGame(game.Id)}>Accept</button>
                                            <button className="actionBtn" onClick={() => this.dismissGame(game.Id)}>Dismiss</button>
                                        </td>)
                                    }
                                    {/* for an ongoing game, show whichever player is not you */}
                                    <td>{(game.white !== localPlayer.username ? game.white : game.black)}</td>
                                    <td>{
                                        this.state.selectedTab !== "challenge"
                                            ? (
                                                this.state.selectedTab === "ongoing"
                                                ? `move ${game.history.length / 3 - 1} - ${game.currentPlayer}'s turn.`
                                                : "waiting for opponent."
                                            )
                                            : "gauntlet thrown."
                                    }</td>
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