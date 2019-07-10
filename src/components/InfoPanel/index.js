import React, {Component} from 'react';
import "./infoPanel.css";

class InfoPanel extends Component {
    render() {
        return (<div id="infoPanel">
            <span id="localPlayerName">
                Playing as {this.props.localPlayer.username}
                <button className="inlineBtn">
                    ≡
                </button>
            </span>
            <br></br>
            <span id="gameInfo">
                {this.props.game.description} vs {this.props.opponent.username}
            </span>
            <br></br>
            <span id="turnIndicator" className={
                this.props.localPlayer.isTurn
                    // invert (black on white) when it's local player's turn
                    ? "invert"
                    : ""
            }>
                {this.props.localPlayer.isTurn
                    ? "your "
                    : this.props.game.currentPlayer + "'s "}
                turn.
            </span>
            <div id="chatPanel">
                <div id="chatHistory" className="outline">
                    {/* chat text goes here */}
                    <br></br>
                </div>
                <form id="chatForm" className="textInput">
                    <div className="fixed-right">
                        <button type="submit" className="actionBtn" style={{ "right": "0" }}>
                        Send--></button>
                    </div>
                    <div className="expand-left">
                        <input type="text" name="text" className="noborder chatinput"></input>
                    </div>
                </form>
            </div>
        </div>
        );
    }
}

export default InfoPanel;