import React, { Component } from 'react';
import "./scorePanel.css";

class scorePanel extends Component {


    constructor(props) {
        super();
    }

    render() {
        return (
            <div className="scorePanel">
                <h3>{this.props.playerName}</h3>
            </div>
        );
    }
}

export default scorePanel;