import React from 'react';
import "./login.css";
import "./login.js";

export default function (props) {
    return (
        <div>
            <h3>Log in to Ethereum Go:</h3>
            {/* https://gogobackend.azurewebsites.net */}
            {/* localhost:56533 */}
            <form action= "https://gogobackend.azurewebsites.net/api/user/login" id="loginCredentials" method="post" >
                Username: <input type="text" name="username"></input> <br></br> <br></br>
                Password: <input type="password" name="password"></input> <br></br> <br></br>
                <button type="submit">Go!</button> <br></br>
            </form>
            <span id="serverMessage"></span>
            <p>Don't have an account?  Click <a href="/register">here</a> to create one.</p>
            <p>Or <a href="/game/options">play offline</a>.</p>
        </div>
    )
}
