import React, { Component } from 'react';
import "./register.css";
import "jquery-form";
// import api from "../../js/api";
// import localPlayer from "../../components/LocalPlayer";
var $ = require("jquery");

class Register extends Component {
    state = {
        message: "",
        error: false
    }

    componentDidMount() {
        $("#loginCredentials").ajaxForm((res) => {
            if (res.error) {
                console.log("register failed: ", res);
                this.setState({ message: res.error, error: true });
            }
            else if (res.message) {
                this.setState({ message: res.message, error: true });
                console.log("registered user");
                // now they will have to follow the email link to proceed
            }
            else {
                // this should never happen, so the server must have crashed
                console.log("got unexpected response: ", res);
                this.setState({ message: "internal server error", error: true });
            }
        })
    }

    render() {
        return (
            <div>
                <h3>Register an account with Js Go:</h3>
                {/* https://gogobackend.azurewebsites.net */}
                {/* localhost:56533 */}
                <form action="https://gogobackend.azurewebsites.net/api/user/new" id="loginCredentials" method="post" >
                    Username: <input type="text" name="username"></input> <br></br> <br></br>
                    Password: <input type="password" name="password"></input> <br></br> <br></br>
                    Confirm Password: <input type="password" name="confirmPassword"></input> <br></br> <br></br>
                    Email: <input type="text" name="email"></input> <br></br> <br></br>
                    Ethereum Address: <input type="text" name="ethAddress"></input> <br></br> <br></br>
                    <button type="submit">Go!</button> <br></br>
                </form>
                <span id="serverMessage" className={this.state.error ? "error" : ""}>
                    {this.state.message}
                </span>
            </div>
        )
    }
}
export default Register;
