import "./canvas.css";
import React, { Component } from 'react';
// import THREE from "../../js/three.js";
import HexaSphere from "../../components/3D Board";
import Board from "../../components/Standard Board";

class Game extends Component {
    state = {
        gameType: "",
        boardSize: 0
    }
    componentDidMount() {
        if (this.props.location.query.gameType === "hex") {
            // generate hex board
            HexaSphere()
        }
        if (this.props.location.query.gameId) {
            // this is an online game
        }
    }
    render() {
        return (
            this.state.gameType === "hex"
            ? null 
            : <Board {...this.props} />
        )
    }
}

export default Game;