import "./game.css";
import React, { PureComponent } from 'react';
// import THREE from "../../js/three.js";
// import HexaBoard from "../../components/3D Board";
import StandardBoard from "../../components/Standard Board";
import api from "../../js/api";
import ScorePanel from "../../components/ScorePanel";
import HexaSphere from "../../components/3D Board";
import localPlayer from "../../components/LocalPlayer";
import go from "../../js/go";
import { resolve } from "path";

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

class Game extends PureComponent {
    state = {
        game: { Id: 0 },
        online: false,
        opponent: {}
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
                    this.setState({ game: { ...game, online: true } }, this.startGame);
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
            // TODO
            console.log('game mode 0 not ready yet');
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
                    {... data, 
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
            // default players
            localPlayer.username = "player1";
            localPlayer.color = 0;
            this.setState({opponent: {username: "player2", color: 1}, loaded: true});
        }

    }

    move = (location) => {
        if (location >= 0) {
            // add it to the virtual board
            // animate hexasphere
            if (this.state.game.gameMode === 2) {
                // add move to local board
                HexaSphere.addStone(go.turn, location);
            }

            // move will have already been validated, so I guess we don't need to again?
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

        if (!this.state.game.online) {
            // when not online, it's always localPlayer's turn
            localPlayer.isTurn = true;
            // if on hexasphere
            HexaSphere.isTurn = localPlayer.isTurn;
            // update
            this.forceUpdate();
        }

        else {
            // online game - more to do
            // we must wait for the other player to play
            localPlayer.isTurn = false;
            HexaSphere.isTurn = false;
            // update (don't let them play out of turn!)
            // since this is a pureComponent we have to update even to change props
            this.forceUpdate();

            let x = parseInt(location / 256);
            let y = parseInt(location % 256);

            let ping = location === -1 ? go.Opcodes.ping : 0;

            if (ping) console.log("waiting for opponent to move...");
            // call the api
            api.makeMove(
                this.state.game.id, x, y, ping || localPlayer.color, 
                localPlayer.username, localPlayer.authtoken,
                res => {

                    // an interesting setup here...
                    // the server sends no response until the opponent plays.
                    // that response will return here, even hours later (since there's no timeout)
                    console.log("moved, then got response: ", res);
                    if (res.error) {
                        // move failed for some reason
                        console.log("move failed:", res);
                        return;
                    }
                    else if (res.move) {
                        // other player played
                        // convert from bytes
                        console.log("other player responds with: ", res);
                        // parse string into numbers
                        let move = res.move.split(",").map(str => parseInt(str));
                        // sanity check
                        if (!go.TryPlayStone(move[0] * 256 + move[1], this.state.opponent.color)) {
                            console.log("error: illegal move ", move[0], move[1], move[2], " by opponent.")
                        }
                        else if (this.state.game.gameMode === 2) 
                            // mark hex board
                            HexaSphere.addStone(this.state.opponent.color, move[0] * 256 + move[1]);

                        go.PlayStone(move[0] * 256 + move[1], this.state.opponent.color)

                        // return control
                        localPlayer.isTurn = true;
                        HexaSphere.isTurn = true;
                        // update again
                        this.forceUpdate();
                    }
                    else {
                        // this should never happen (sanity check)
                        console.log("sanity check failed: got invalid response from server. ", res);
                    }
                }
            );
        }

    }

    componentWillUnmount() {
        // unload non-react components
        localPlayer.unload()
        HexaSphere.deconstruct();
    }

    render() {
        console.log("rendering game page: ", go.board.nodes);
        return (
            <div id='gameCanvas'>
                <ScorePanel player={localPlayer} local={this.state.game.online} turn={go.turn===localPlayer.color}/>
                {this.state.loaded
                    ?(this.state.game.gameMode === 0
                        ? <StandardBoard {...this.state.game} go={go} isTurn={localPlayer.isTurn} playFunction={this.move}/>
                        // hexaboard is not going to be a react component.
                        // it is just better that way.
                            : null)
                    : (<div>game not loaded</div>)
                }
                <ScorePanel player={this.state.opponent} turn={go.turn===this.state.opponent.color} />
            </div>
        )
    }
}

export default Game;