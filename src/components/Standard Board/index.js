import React, { Component } from 'react';
import "./board.css";
import goboard from "./goboard.png";
import go from "../../js/go";
import Stone from "../../components/Stone";

var $ = require("jquery");
var boardSize = 19;
class Board extends Component {
    componentDidMount() {
        // set up board

        // board click event
        $("#board").click(function (event) {
            var x = Math.floor((event.pageX - this.offsetLeft + $(this).width() / 2) / $(this).width() * boardSize);
            var y = Math.floor((event.pageY - this.offsetTop + $(this).height() / 2) / $(this).height() * boardSize);
            console.log("X Coordinate: " + x + " Y Coordinate: " + y);
            if (go.TryPlayStone(go.indexFromCoors(x, y))) {
                // play the stone
                
            }
        });
    }

    render() {
        return (<div>
            <img id="board" src={goboard} alt="game board" ismap="true"></img>
            {/* either do or don't place a stone at each index */}
            {go.board.nodes.map((node, i) => {
                return (node.stone
                    ? (<Stone
                        x={(go.coorsFromIndex(i) / go.board.size) + "%"}
                        y={(go.coorsFromIndex(i) / go.board.size) + "%"}
                        color={(
                            node.stone.color === go.Stone.black
                                ? "black"
                                : "white"
                        )}
                    />)
                    : null
                )
            })}
        </div>)
    }
};
export default Board;
