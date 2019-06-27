import React from 'react';
import WhiteStone from './white stone.png'
import BlackStone from './black stone.png'

export default function (props) {
    let style = {
        "top": props.y,
        "left": props.y
    }
    return (
        props.stoneColor == "white"
            ? <img src={WhiteStone} alt="white stone" style={style} ></img >
            : <img src={BlackStone} alt="black stone" style={style} ></img >
    )
}
