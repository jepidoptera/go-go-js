import React, { Component } from 'react';
import "./scorePanel.css";

const scorePanel = function(props) {
    return (props.player 
        ? <div className={"scorePanel " + ["black", "white"][props.player.color]}>
            <h3 className={props.turn ? "outline" : ""}>
                {props.player.username + (props.local ? " (you)" : "")}
            </h3>
        </div>
        : null
    );
}

export default scorePanel;