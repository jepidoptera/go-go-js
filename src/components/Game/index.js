import "./canvas.css";
import React, { Component } from 'react';
// import THREE from "../../js/three.js";
import GameCanvas from "./controller.js";


class Game extends Component {
    render() {
        return <div>
            <style>
            </style>
            {/* get "three" script for 3d modeling
            and our custom script for the game mechanics */
            GameCanvas()}
        </div>
    }
}

export default Game;