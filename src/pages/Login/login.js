import "jquery-form";
import axios from "axios";
var $ = require("jquery");

$(document).ready(() => {
    // $("#loginCredentials").submit(function (event) {
    // });  
    // $("#loginCredentials").ajaxForm(function(res) {
    //     console.log("got a login response")
    //     console.log("HEres the Response Body: ", res.body);
    // })
    $("#loginCredentials").submit(event => {
        event.preventDefault();
        let formData = new FormData(document.getElementById("loginCredentials"));
        formData.keys().forEach(key => console.log(key) );
        $.ajax({
            url: "https://crossorigin.me/https://gogobackend.azurewebsites.net/api/user/login", 
            method: "post",
            data: formData,
            processData: false,
            contentType: false,
            crossDomain: true
        }).then(res => {
            console.log("got a login response")
            console.log("HEres the Response Body: ", res.body);
        })
    })
    //     // go to game window
    //     // window.location.href = "/game";
})

