import React, { Component } from 'react';
import "./login.css";
import "jquery-form";
import api from "../../js/api";
import localPlayer from "../../components/LocalPlayer";
var $ = require("jquery");

class Login extends Component {

    componentDidMount() {
        $("#loginCredentials").ajaxForm((res) => {
            if (res.authtoken) {
                console.log("login authtoken: ", res.authtoken);
                // save username and authtoken to session storage
                let authtoken = ("authtoken", res.authtoken);
                let username = ("username", $("input[name='username']").val());
                sessionStorage.setItem("username", username);
                sessionStorage.setItem("authtoken", authtoken);

                // load player data
                localPlayer.load(() => {
                    console.log("loaded player: ", localPlayer);
                    localPlayer.startPinging();
                    // navigate to game lobby
                    window.location.href = "/game/lobby";
                });
            }
            else {
                console.log("login failed: ", res);
                $("#serverMessage").text(res.error);
            }
        })
    }

    render() {
        return (
            <div>
                <h3>Log in to Ethereum Go:</h3>
                {/* https://gogobackend.azurewebsites.net */}
                {/* localhost:56533 */}
                <form action="https://gogobackend.azurewebsites.net/api/user/login" id="loginCredentials" method="post" >
                    Username: <input type="text" name="username"></input> <br></br> <br></br>
                    Password: <input type="password" name="password"></input> <br></br> <br></br>
                    <button type="submit">Go!</button> <br></br>
                </form>
                <span id="serverMessage"></span>
                <p>Don't have an account?  Click <a href="/register">here</a> to create one.</p>
                <p>Or <a href="/gameoptions/offline">play offline</a>.</p>
            </div>
        )
    }
}
export default Login;
