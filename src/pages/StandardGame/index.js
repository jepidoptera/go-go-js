import Board from "../../components/Standard Board";
import React, { Component } from 'react';
// import THREE from "../../js/three.js";


class Game extends Component {
    render() {
        return <div>
            <Board { ...this.props } />
        </div>
    }
}

export default Game;