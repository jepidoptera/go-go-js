import "./canvas.css";
import React, { PureComponent } from 'react';
// import THREE from "../../js/three.js";
// import HexaBoard from "../../components/3D Board";
import StandardBoard from "../../components/Standard Board";
import api from "../../js/api";
import ScorePanel from "../../components/ScorePanel";
import HexaSphere from "../../components/3D Board";
import localPlayer from "../../components/LocalPlayer";

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
        game: {},
        online: false,
        player1: {},
        player2: {},
        localPlayer: {},
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
                    mode: parseInt(query.boardType),
                    boardSize: parseInt(query.boardSize),
                    loaded: true
                }
            }, this.startGame);
        }
        // online games will have a query string that just gives the gameID,
        // and we'll ask the server for details.
        else if (query.gameId) {
            // this is an online game
            this.setState({ online: true });
            // load local player
            // don't forget to unload on componentWillUnmount
            localPlayer.load(() => {

                // load data about this game from the server
                api.loadGame(query.gameID, (game) => {
                    // and here is our data
                    this.setState({ game: { ...game, loaded: true } }, this.startGame);
                    // board components will now render (because loaded: true)
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

        // load data about players
        api.loadPlayer(this.state.game.player1, data => {
            this.setState({ player1: data });
            api.loadPlayer(this.state.player2, data => {
                this.setState({ player2: data });
                // which one is local, which is opponent?
                if (this.state.player1.username === sessionStorage.getItem("username"))
                    this.setState({ localPlayer: this.state.player1, opponent: this.state.player2 });
                else
                    this.setState({ localPlayer: this.state.player2, opponent: this.state.player1 });
            })
        })

        // if hexasphere game
        if (this.state.game.mode === 2) {
            console.log("starting hexasphere game...");
            // construct hexasphere!
            HexaSphere.construct(this.state.game.boardSize);
        }
    }

    componentWillUnmount() {
        // unload non-react components
        localPlayer.unload()
        HexaSphere.deconstruct();
    }

    render() {
        console.log("rendering game page: ", this.state);
        return (
            <div>
                <ScorePanel player={this.state.localPlayer} />
                {this.state.game.loaded
                    ?(this.state.game.mode === 0
                        ? <StandardBoard {...this.state.game} />
                        // hexaboard is not going to be a react component.
                        // it is just better that way.
                            : null)
                    : (<div>game not loaded</div>)
                }
                <ScorePanel player={this.state.opponent} />
            </div>
        )
    }
}

export default Game;