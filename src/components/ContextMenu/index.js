import React from 'react';
import './menu.css';

// context menu for the game board
export default function Menu(props) {
    let Style = {
        left: props.x + "px",
        top: props.y + "px",
    }
    return (
        <div style={Style} className='contextMenu'>
            <div className="menuItem" onClick={() => props.onClick(0)}>
                {props.scoringOverlay
                    ? "✔ "
                    : "  "
                } scoring overlay
            </div>
        </div>
    )
}