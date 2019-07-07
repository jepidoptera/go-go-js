import React, { PureComponent } from 'react';
import "./board.css";
import goboard from "./goboard.png";
import go from "../../js/go";
import Stone from "../../components/Stone";

var $ = require("jquery");

class Board extends PureComponent {
    state = {
        tempstone: { location: -1 }
    }

    constructor(props) {
        super();
        // initialize board
        go.initialize(go.createSquareBoard(props.boardSize));
    }

    componentDidMount() {
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
                // is there already a tempstone here?
                if (self.state.tempstone.location === index) {
                    // do it for real
                    go.PlayStone(index, go.turn);
                    console.log("played stone at ", x, ", ", y);
                }
                else {
                    console.log("temp stone at: ", index);
                    // you can still change your mind
                    self.setState({ tempstone: new go.Stone(go.turn, index) })
                }
                // console.log("board is now:", go.board);
                self.forceUpdate();
            }
            else { console.log("you can't go there.") } //failed
        });
    }

    tempStone() {

    }

    render() {
        // console.log("rendering board: ", go.board.nodes);
        let boardSize = {
            "height": (100 * (19 / (go.board.size || 1))) + "%",
            "width": (100 * (19 / (go.board.size || 1))) + "%"
        }
        let tempStone = {
            "opacity": "0.5",
        }
        return  <div id="board">
                    <img src={goboard} id="boardImg" style={boardSize} alt="game board"></img>
                    {/* either do or don't place a stone at each index */ }
                    { go.board.nodes.map(node => goStone(node.stone)) }
                    {/* place a vanishing stone for those that have been captured */ }
                    { go.capturedStones.map(stone => goStone(stone, "captured")) }
                    {/* temp stone */}
                    {goStone(this.state.tempstone, "temp")}
                </div>
        // return < div id="board" >
        //             <img src={goboard} id="boardImg" style={boardSize} alt="game board"></img>
        //         </div >
    }
};

function goStone(stone, style) {
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
        if (style === "captured")
            return (<Stone {...props} captured={true} />)
        else if (style === "temp")
            return (<Stone {...props} temp={true}/>)
        else // default
            return (<Stone {...props} />)
    }
    // if color == -1, render nothing
    else return null;
}

export default Board;
