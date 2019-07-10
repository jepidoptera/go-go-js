import React, {Component} from 'react';
import "./infoPanel.css";
import api from '../../js/api';

class InfoPanel extends Component {
    state = {
        menuOpen: false
    }

    componentDidMount() {
        // we want to see the end of the chat, not the beginning
        this.scrollToBottom();
    }

    componentDidUpdate() {
        // keep it scrolled down
        this.scrollToBottom();
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

    sendChat = (event) => {
        event.preventDefault();
        let chat = event.target.chat.value;
        console.log("chat submitted:", chat);
        api.sendChat(this.props.game.id, chat, this.props.localPlayer.username, this.props.localPlayer.authtoken, (res) => {
            console.log("chat server responds: ", res);
        });
        // chat = "";
        event.target.chat.value = "";
        this.scrollToBottom();
    }

    scrollToBottom = () => {
        this.messagesEnd.scrollIntoView({ behavior: "smooth" });
        let chatHistory = document.getElementById("chatHistory");
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    chatFocus = () => {
        // set focus to chat input
        document.getElementsByName("chat")[0].focus();
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
            <div id="chatPanel" className="outline" >
                <div id="chatHistory" onClick={this.chatFocus}>
                    {/* chat text goes here */}
                    {this.props.game.chatHistory
                        ? this.props.game.chatHistory.map((chat, i) => <p key={i}>{chat}</p>)
                        : null}
                    <div style={{ float: "left", clear: "both" }}
                        ref={(el) => { this.messagesEnd = el; }}>
                    </div>
                </div>
                <form id="chatForm" className="textInput" onSubmit={this.sendChat}>
                    <div className="fixed-right">
                        <button type="submit" id="chatSubmitBtn" className="inlineBtn">
                            Send--></button>
                    </div>
                    <div className="expand-left">
                        <input type="text" name="chat" className="noborder chatinput"></input>
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