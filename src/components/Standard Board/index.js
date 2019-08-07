import React, { Component } from 'react';
import "./board.css";
import goboard from "./goboard.png";
import Stone from "../Stone";

var $ = require("jquery");

class Board extends Component {
    state = {
        tempstone: { location: -1 },
        contextMenu: false
    }

    componentDidMount() {
        // set up board click event
        $("#boardContainer").click((event) => {
            // close right-click menu if you click anywhere else
            this.setState({contextMenu: false});

            // can't move when it's not our turn
            if (!this.props.isTurn) return;

            // calculate board index from mouse coordinates
            // jquery is good at this
            let board = $("#boardContainer");
            let offset = board.offset();
            let width = board.width();
            let height = board.height();
            var x = Math.floor((event.pageX - offset.left) / width * this.props.go.board.size);
            var y = Math.floor((event.pageY - offset.top) / height * this.props.go.board.size);

            // console.log("clicked at X: " + x + ", Y: " + y);
            let index = this.props.go.indexFromCoors(x, y);
            
            // is the temp stone already here?
            if (this.state.tempstone.location === index) {
                // if yes, we've already checked the move and can play immediately
                console.log("played stone at ", x, ", ", y);
                // callback to Game component, which will call the go module for us
                // and broadcast the move if we're online
                this.props.playFunction(index);
                // update board image
                this.forceUpdate();
                // try the experimental scoring function
                this.props.go.experimentalScore()
            }
            // else, test the legality of this move
            else if (this.props.go.TryPlayStone(index, this.props.go.turn)) {
                // that must have worked
                console.log("temp stone at: ", index);
                // but you can still change your mind
                this.setState({ tempstone: new this.props.go.Stone(this.props.go.turn, index) })
                // console.log("board is now:", this.props.go.board);
                this.forceUpdate();
            }
            else { console.log("you can't go there.") } //failed
        })
    }

    goStone(stone, style, size = 1) {
        // only draw stones which have a color
        if ([this.props.go.stone.black, this.props.go.stone.white].includes(stone.color)) {
            // get x/y coordinates
            let { x, y } = this.props.go.coorsFromIndex(stone.location)
            // adjust offset and scale
            x = (x + 0.5) / (this.props.go.board.size) * 100;
            y = (y + 0.5) / (this.props.go.board.size) * 100;
            // console.log("stone at: ", x, y);
            
            // create properties object
            let props = {
                x: x + "%",
                y: y + "%",
                size: (style !== "marker" 
                    ? 90 / this.props.go.board.size 
                    // 'marker' image is smaller
                    : 50 / this.props.go.board.size) * size,
                key: stone.location,
                color: ["black", "white"][stone.color]
            }
            // if captured is set to true, the stone will immediately shrink and disappear
            if (style === "captured")
                return (<Stone {...props} captured={true} />)
            else if (style === "temp")
                return (<Stone {...props} temp={true}/>)
            else if (style === "marker")
                return (<Stone {...props} marker={true}/>)
            else // default
                return (<Stone {...props} />)
        }
        // if color == -1, render nothing
        else return null;
    }

    render() {
        // console.log("rendering board: ", this.props.go.board.nodes);
        let boardSize = {
            "height": (100 * (19 / (this.props.go.board.size || 1))) + "%",
            "width": (100 * (19 / (this.props.go.board.size || 1))) + "%"
        }
        return (
            <div>
                {/* board image */}
                <img src={goboard} id="boardImg" style={boardSize} alt="game board"></img>

                {/* either do or don't place a stone at each index */ }
                {this.props.go.board.nodes.map(node => this.goStone(node.stone))}
                
                {/* place a vanishing stone for those that have been captured */ }
                {this.props.go.capturedStones.map(stone => this.goStone(stone, "captured"))}
                
                {/* temp stone */}
                {this.goStone(this.state.tempstone, "temp")}

                {/* experimental scoring overlay */}
                {this.props.scoringOverlay ? 
                    this.props.go.experimentalScore(
                        this.props.go.board.nodes.map((node, i) => 
                            // drop the tempstone in there so you can see the potential effects of that play
                            (i === this.state.tempstone.location 
                            ? { stone: this.state.tempstone, neighbors: node.neighbors }
                            : node)
                        )
                    ).map((node, i) =>
                        (node ? this.goStone(
                            { 
                                color: (node > 0 ? this.props.go.stone.black : this.props.go.stone.white),
                                location: i
                            },
                            "marker",
                            Math.min(4, Math.abs(node)) / 4
                        ) : null)
                    )
                : null}
                {/* scoring overlay */}
                {/* {this.props.scoringOverlay ? 
                    this.props.go.Score().blackTerritory.map(node => 
                        this.goStone({color: this.props.go.stone.black, location: node}, "marker")
                    )
                : null}
                {this.props.scoringOverlay ? 
                    this.props.go.Score().whiteTerritory.map(node => 
                        this.goStone({color: this.props.go.stone.white, location: node}, "marker")
                    )
                : null} */}
            </div>
        )
    }
};

export default Board;
