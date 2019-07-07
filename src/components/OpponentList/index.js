import React, { Component } from 'react';
import api from "../../js/api";

class OpponentList extends Component {

    state = {
        otherPlayers: []
    }

    componentDidMount() {
        // load player list from the server
        api.loadAllPlayers(players => {
            console.log("loaded player list: ", players);
            this.setState({ otherPlayers: players });
        })
    }

    render() {
        // return a dropdown list of all existing opponents
        return (<div>
            Opponent: <br></br>
            <select name="otherPlayer">
                <option value="">open challenge</option>
                {this.state.otherPlayers.map(player => {
                    return (
                        // don't show player's own username in the dropdown
                        player.username != (this.props.localPlayer.username || this.props.localPlayer)
                            // but do show all other players
                            ? (<option key={player.username} value={player.username}>
                                {player.username}
                                {player.online
                                    // show a little icon if the player is online
                                    ? <span className="onLineIndicator"></span> : null}
                            </option>)
                            : null
                    )
                })}
        </select></div>)
    }
}

export default OpponentList;