import React, {Component} from 'react';
import WhiteStone from './white stone.png'
import BlackStone from './black stone.png'
import "./stone.css";

class Stone extends Component {


    constructor(props) {
        super();
        // calculate initial style
        this.state ={
            style: {
                "top": props.y,
                "left": props.x,
                "height": props.size + "vmin",
                "width": props.size + "vmin"
            },
            // always start in a non-captured state
            captured: false,
        };
    }

    componentDidMount() {
        // after the first frame has rendered, it would be time to apply the capture mod
        if (this.props.captured) {
            this.setState({ captured: true })
        }
    }

    render() {
        return (
            <div className={"stoneContainer" + (this.state.captured ? " vanish" : "") } 
                style={this.state.style}>
                
                {this.props.color === "white"
                    // white stone
                    ? <img className="stoneImg" src={WhiteStone} alt="white stone" ></img >
                    : (
                        this.props.color === "black"
                            // black stone
                            ? < img className="stoneImg" src={BlackStone} alt="black stone" ></img >
                            // no stone here
                            : null
                    )}
            </div>
        )
    }
}

export default Stone;