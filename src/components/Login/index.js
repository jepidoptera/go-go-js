import React from 'react';
import "./login.css";
import "./login.js";

export default function (props) {
    return (
        <div>
            <h3>Please enter your username and password.</h3>
            {/* https://gogobackend.azurewebsites.net */}
            {/* localhost:56533 */}
            <form action= "localhost:56533/api/user/all" id="loginCredentials" method="get" >
                <input type="text" name="username"></input> <br></br>
                <input type="password" name="password"></input> <br></br>
                <input type="submit"></input>
            </form>
            <p>Don't have an account?  Click <a href="/register">here</a> to create one.</p>
        </div>
    )
}
