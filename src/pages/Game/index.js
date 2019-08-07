import "./game.css";
import React, { Component } from 'react';
import StandardBoard from "../../components/Standard Board";
import api from "../../js/api";
import InfoPanel from "../../components/InfoPanel";
import HexaSphere from "../../components/3D Board";
import localPlayer from "../../components/LocalPlayer";
import ContextMenu from "../../components/ContextMenu";

import go from "../../js/go";
// import { resolve } from "path";

function parseQuery(url) {
    let queryStart = url.indexOf("?") + 1;
    // no query string present
    if (!queryStart) return "";
    // parse it
    let query = url.slice(queryStart);
    let returnval = {};
    while (query.length > 0) {
        let varname = '';
        varname = query.slice(0, query.indexOf("="));
        let valueEnd = query.indexOf("&");
        if (valueEnd < 0) valueEnd = query.length;
        let value = query.slice(varname.length + 1, valueEnd);
        returnval[varname] = value;
        query = query.slice(varname.length + value.length + 2);
    }
    return returnval;
}

class Game extends Component {
    state = {
        game: { Id: 0 },
        online: false,
        opponent: {},
        contextMenu: false,
        scoringOverlay: false
    }

    componentWillMount() {
        var query = parseQuery(window.location.href);
        console.log("loading game page with query string: ", query)
        // offline games will have query strings specifying the board type and dimensions
        if (query.boardType !== undefined && query.boardSize) {
            // set up state
            this.setState({
                game: {
                    gameMode: parseInt(query.boardType),
                    boardSize: parseInt(query.boardSize),
                }
            }, this.startGame);
        }
        // online games will have a query string that just gives the gameID,
        // and we'll ask the server for details.
        else if (query.gameId) {
            // this is an online game
            this.setState({ online: true });
            // load local player
            console.log("loading online game: ", query.gameId)
            // don't forget to unload on componentWillUnmount
            localPlayer.load(() => {

                // load data about this game from the server
                api.loadGame(query.gameId, (game) => {
                    // and here is our data
                    if (game.error) {
                        console.log("error:", game.error);
                        return;
                    }
                    console.log("loaded game: ", game);
                    this.setState({
                        game: { ...game, online: true },
                        gameRefreshInterval: setInterval(() => {
                            // refresh the game twice a second or so
                            // is this ok? probably. it's like 2kb/second tops
                            // I'll find a more efficient solution later
                            api.loadGame(query.gameId, (game) => {
                                this.setState({ game: { ...this.state.game, ...game, online: true } });
                            })
                        }, 500)
                    }, this.startGame);

                })
            })
        }
        else {
            console.log("error: invalid query string.");
        }
    }

    startGame() {
        // this will be called once the state is finished setting
        console.log("game parameters: ", this.state.game);

                // set up board -- depends strongly on game type

        // standard flat board
        if (this.state.game.gameMode === 0) {
            console.log("starting standard game...");
            // construct nodes array
            go.initialize(go.createSquareBoard(this.state.game.boardSize));
            // load game history
            go.playThrough(this.state.game.history);
        }
        // if hexasphere game
        else if (this.state.game.gameMode === 2) {
            console.log("starting hexasphere game...");
            // construct hexasphere!
            HexaSphere.construct(this.state.game.boardSize);
            // initialize go game with loaded nodes
            go.initialize(HexaSphere.nodes);
            // load game history
            go.playThrough(this.state.game.history);
            // play with this node map
            HexaSphere.loadGame(go, (location) => this.move(location));
        }
        else {
            console.log("unrecognized game mode:", this.state.game.gameMode);
        }


        // for an online game, load players
        if (this.state.game.online) {
            // which color is our local player?
            localPlayer.color = (localPlayer.username === this.state.game.white 
                ? go.stone.white : go.stone.black)
            
            // is it our turn?
            localPlayer.isTurn = (localPlayer.username === this.state.game.currentPlayer);
            HexaSphere.isTurn = localPlayer.isTurn;

            // what is opponent's name?
            let opponent = (localPlayer.username === this.state.game.white 
                ? this.state.game.black 
                : this.state.game.white);

            // load data about opponent
            api.loadPlayer(opponent, data => {
                // store as state.opponent
                this.setState({ opponent: 
                    {...data, 
                        color: (opponent === this.state.game.white 
                        ? go.stone.white : go.stone.black)} 
                    });
                console.log("loaded opponent: ", this.state.opponent);
                // start rendering the board
                this.setState({loaded: true});

                //ping the server, asking for opponent's move
                if (!localPlayer.isTurn) this.move(-1);
            })
        } 
        else {
            // if not online, there is no local stone color because both sides are local
            localPlayer.isTurn = true;
            HexaSphere.isTurn = true;
            // default players
            localPlayer.username = "player1";
            localPlayer.color = 0;
            this.setState({opponent: {username: "player2", color: 1}, loaded: true});
        }

    }

    move = (location) => {
        if (location >= 0) {
            // a move has been made
            // move will have already been validated, so I guess we don't need to again?

            // animate hexasphere
            if (this.state.game.gameMode === 2) {
                // add a visible 3d stone object
                // do this first so that it's still the correct turn
                HexaSphere.addStone(go.turn, location);
            }

            // play on the virtual board
            go.PlayStone(location, go.turn);

            // were any stones captured?
            if (this.state.game.gameMode === 2 && go.capturedStones.length > 0) {
                // animate the stones disappearing
                HexaSphere.captureStones(go.capturedStones);
            }
        }
        else {
            // "ping" move
        }

        // offline game
        if (!this.state.game.online) {
            // when not online, it's always localPlayer's turn
            localPlayer.isTurn = true;
            // if on hexasphere
            HexaSphere.isTurn = localPlayer.isTurn;
            // change whose turn it is
            this.setState({
                game: {
                    ...this.state.game,
                    currentPlayer: (go.turn === go.stone.black
                        ? localPlayer.username
                        : this.state.opponent.username
                    )
                }
            });
        }
        // online game
        else {
            // online game - more to do
            // we must wait for the other player to play
            localPlayer.isTurn = false;
            HexaSphere.isTurn = false;
            this.setState({ game: { ...this.state.game, currentPlayer: this.state.opponent.username } });
            console.log(this.state.game.currentPlayer + "'s turn.");

            // format data for broadcasting
            let x = parseInt(location / 256);
            let y = parseInt(location % 256);

            let ping = location === -1 ? go.Opcodes.ping : 0;
            let pass = location === -2 ? go.Opcodes.pass : 0;

            console.log("broadcasting move: ", x, y, ping || pass || localPlayer.color);
            // call the api
            api.makeMove(
                this.state.game.id, x, y, ping || pass || localPlayer.color, 
                localPlayer.username, localPlayer.authtoken,
                // and get the callback
                res => {
                    // an interesting setup here...
                    // the server sends no response until the opponent plays.
                    // that response will return here, even hours later (since there's no timeout)
                    if (res.error) {
                        // move failed for some reason
                        console.log("move failed:", res);
                        return;
                    }
                    else if (res.move) {
                        // other player played
                        console.log("other player responds with: ", res);
                        // parse string into numbers
                        let move = res.move.split(",").map(str => parseInt(str));
                        let location = move[0] * 256 + move[1];
                        let opcode = move[2];
                        // sanity check
                        if (!go.TryPlayStone(location, opcode)) {
                            console.log("error: illegal move ", move[0], move[1], move[2], " by opponent.")
                        }
                        else if (this.state.game.gameMode === 2 && opcode !== go.Opcodes.pass) {
                            // mark hex board while it's still the correct turn
                            HexaSphere.addStone(this.state.opponent.color, location);
                            // rotate to show the latest move
                            HexaSphere.rotateTowards(HexaSphere.nodes[location].position);
                        }
                        if (opcode !== go.Opcodes.pass)
                            // place a stone where opponent played
                            go.PlayStone(move[0] * 256 + move[1], this.state.opponent.color)
                        else
                            // opponent chose to pass
                            go.PassTurn();

                        // were any stones captured?
                        if (this.state.game.gameMode === 2 && go.capturedStones.length > 0) {
                            // animate the stones disappearing
                            HexaSphere.captureStones(go.capturedStones);
                        }

                        // re"turn" control to local
                        localPlayer.isTurn = true;
                        HexaSphere.isTurn = true;
                        this.setState({ game: { ...this.state.game, currentPlayer: localPlayer.username } });
                        console.log(this.state.game.currentPlayer + "'s turn.");

                        // compare state
                        // any deviation means we have a problem
                        api.gameState(this.state.game.id, (data) => {
                            go.compareState(data);
                        })
                    }
                    else {
                        // this should never happen (sanity check)
                        console.log("sanity check failed: got invalid response from server. ", res);
                    }
                },
                err => {
                    // probably a bad gateway response...
                    // randomly happens sometimes
                    console.log("server returned error: ", err);
                    // try to ping again
                    if (err.status === 502) {
                        console.log("attempting to re-establish connection...")
                        this.move(-1);
                    }
                }
            );
        }

    }

    contextMenu = (event) => {
        event.preventDefault();
        // right-click menu to cha nge view
        this.setState({contextMenu: {
            x: event.pageX, 
            y: event.pageY, 
            scoringOverlay: this.state.game.scoringOverlay
        }})
    }

    closeContextMenu = (event) => {
        // if context menu is open, don't receive other click events until it's closed
        if (this.state.contextMenu) {
            event.stopPropagation();
            // close the menu
            this.setState({contextMenu: false})
        }
    }

    onClickMenu = (index) => {
        // when the context menu is clicked
        console.log("context menu: ", index);
        if (index === 0) {
            // option 0: toggle scoring overlay
            this.setState({game: {
                ...this.state.game, 
                scoringOverlay: (this.state.game.scoringOverlay ? false : true)
            }});
        }
    }

    componentWillUnmount() {
        // unload non-react components
        localPlayer.unload()
        HexaSphere.deconstruct();
    }

    render() {
        // console.log("rendering game page");
        return (
            // gameCanvas contains all of everything, including the info panel
            <div id='gameCanvas' onClick={this.closeContextMenu}>
                {
                    // infoPanel shows game menu, chat, and whose turn it is
                    this.state.game.online
                    ? <InfoPanel localPlayer={localPlayer} opponent={this.state.opponent} game={this.state.game} />
                    : <button onClick={() => exitToHome(this.state.game.history.length)}>home page</button>
                }
                { /* boardContainer just contains the board */}
                <div id="boardContainer" onContextMenu={this.contextMenu} className={this.state.game.online ? "" : "offline"}>
                    {this.state.loaded
                        ?(this.state.game.gameMode === 0
                            ? <StandardBoard {...this.state.game} go={go}
                                isTurn={localPlayer.isTurn} playFunction={this.move}
                                online={this.state.game.online}/>
                            // hexaboard is not going to be a react component.
                            // it is just better that way.
                                : null)
                        : (<div>game not loaded</div>)
                        }
                </div>
                {/* show the context menu if it's open */}
                {this.state.contextMenu
                    ? <ContextMenu {...this.state.contextMenu} onClick={this.onClickMenu}></ContextMenu>
                    : null
                }
                {this.state.game.scoringOverlay}
            </div>
        )
    }
}

function exitToHome(gameStarted) {
    // check if they're ok with abandoning a game in progress
    if (!gameStarted || window.confirm("Exit this game? It will not be saved.")) {
        // go back to home page
        window.location.href = "/";
    }
} 
export default Game;
