import React from 'react';
import "./login.css";
import "./login.js";

export default function (props) {
    return (
        <div>
            <h3>Please enter your username and password.</h3>
            <form id="loginCredentials">
                <input type="text" name="username"></input> <br></br>
                <input type="password" name="password"></input> <br></br>
                <input type="submit"></input>
            </form>
            <p>Don't have an account?  Click <a href="/register">here</a> to create one.</p>
        </div>
    )
}