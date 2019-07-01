/* get "three" script for 3d modeling
and our custom script for the game mechanics */
import HexaSphere from "../../components/3D Board";
import React, { Component } from 'react';
// import THREE from "../../js/three.js";


class Game extends Component {
    componentDidMount() {
        HexaSphere.construct(this.props)
    }
    componentWillUnmount() {
        HexaSphere.deconstruct();
    }
    render() {
        return <div>
            {}
        </div>
    }
}

export default Game;