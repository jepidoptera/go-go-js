import React, {Component} from 'react';
import "./infoPanel.css";

class InfoPanel extends Component {
    state = {
        menuOpen: false
    }
    showMenu = (event) => {
        // open or close the menu
        this.setState({ menuOpen: !this.state.menuOpen });
        event.stopPropagation();
    }
    hideMenu = () => {
        // definitely close the menu
        this.setState({ menuOpen: false });
    }
    render() {
        return (<div id="infoPanel">
            {/* this invisible thing will pop up while the menu is open so that
            if you click away from the menu, it will close.  Hides otherwise. */}
            <div className={"clickCatcher " + (this.state.menuOpen ? "show" : "hide")}
                onClick={this.hideMenu}>
            </div>
            <span id="localPlayerName">
                Playing as {this.props.localPlayer.username}
                {this.props.game.online
                    ? <button className="inlineBtn" onClick={this.showMenu}>
                        ≡
                    </button>
                    : null
                }
            </span>
            <div className={"menu " + (this.state.menuOpen ? "show" : "hide")}>
                <button onClick={backToLobby} className="inlineBtn menuItem">return to lobby</button>
                <br></br>
                <button onClick={logOut} className="inlineBtn menuItem">log out</button>
            </div>
            <br></br>
            <span id="gameInfo">
                {this.props.game.description} vs {this.props.opponent.username}
            </span>
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

function backToLobby() {
    // return to game lobby
    window.location.href = "/game/lobby"
}

function logOut() {
    // return to game lobby
    window.location.href = "/"
}

export default InfoPanel;