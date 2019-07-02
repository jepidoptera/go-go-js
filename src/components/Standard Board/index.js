import React, { Component } from 'react';
import "./board.css";
import goboard from "./goboard.png";
import go from "../../js/go";
import Stone from "../../components/Stone";

var $ = require("jquery");

// Here we create a component that will rotate everything we pass in over two seconds
// const CapturedStone = styled.Stone`
//   animation: ${vanish} 2s linear 1;
// `;

class Board extends Component {
    constructor(props) {
        super();
        // set up board
        go.setupBoard("square", props.boardSize);

        console.log("board generated node set: ", go.board.nodes);
    }
    componentDidMount () {
        // copy of self for use within the function
        var self = this;
        // board click event
        $("#board").click(function (event) {
            // calculate board index from mouse coordinates
            var x = Math.floor((event.pageX - this.offsetLeft + $(this).width() / 2) / $(this).width() * go.board.size);
            var y = Math.floor((event.pageY - this.offsetTop + $(this).height() / 2) / $(this).height() * go.board.size);
            // console.log("clicked at X: " + x + ", Y: " + y);
            let index = go.indexFromCoors(x, y);
            
            // try to play a stone
            if (go.TryPlayStone(index, go.turn)) {
                // that must have worked
                console.log("played stone at ", x, ", ", y);
                // console.log("board is now:", go.board);
                self.forceUpdate();
            }
            else { console.log("you can't go there.") } //failed
        });
    }

    render() {
        // console.log("rendering: ", go.board.nodes);
        let boardSize = {
            "height": (100 * (19 / (go.board.size || 1))) + "%",
            "width": (100 * (19 / (go.board.size || 1))) + "%"
        }
        return (<div id="board">
            <img src={goboard} id="boardImg" style={boardSize} alt="game board" ismap="true"></img>
            {/* either do or don't place a stone at each index */}
            {go.board.nodes.map(node => goStone(node.stone))}
            {/* place a vanishing stone for those that have been captured */}
            {go.captures.map(stone => goStone(stone, true))}
            </div>)
    }
};

function goStone(stone, captured) {
    // only draw stones which have a color
    if ([go.stone.black, go.stone.white].includes(stone.color)) {
        // get x/y coordinates
        let { x, y } = go.coorsFromIndex(stone.location)
        // adjust offset and scale
        x = (x + 0.5) / (go.board.size) * 100;
        y = (y + 0.5) / (go.board.size) * 100;
        // console.log("stone at: ", x, y);
        
        // create properties object
        let props = {
            x: x + "%",
            y: y + "%",
            size: 90 / go.board.size,
            key: stone.location,
            color: ["black", "white"][stone.color]
        }
        // if captured is set to true, the stone will immediately shrink and disappear
        return (<Stone {...props} captured={captured}/>)
    }
    // if color == -1, render nothing
    else return null;
}

export default Board;
