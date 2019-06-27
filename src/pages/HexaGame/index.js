import HexaSphere from "../../components/3D Board";
import React, { Component } from 'react';
// import THREE from "../../js/three.js";


class Game extends Component {
    render() {
        return <div>
            {/* get "three" script for 3d modeling
            and our custom script for the game mechanics */
            HexaSphere()}
        </div>
    }
}

export default Game;