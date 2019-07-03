import "jquery-form";
var $ = require("jquery");

$(document).ready(() => {
    // $("#loginCredentials").submit(function (event) {
    // });  
    $("#loginCredentials").ajaxForm(function(res) {
        console.log("got a login response")
        console.log("HEres the Response Body: ", res.body);
    })
    // $("#loginCredentials").submit(event => {
    //     event.preventDefault();
    //     let formData = new FormData(document.getElementById("loginCredentials"));
    //     console.log(...formData.entries())
    //     $.ajax({
    //         // https://gogobackend.azurewebsites.net
    //         // localhost:56533
    //         url: "https://gogobackend.azurewebsites.net/api/user/login", 
    //         method: "post",
    //         data: formData,
    //         processData: false,
    //         crossDomain: true
    //     }).then(res => {
    //         console.log("got a login response")
    //         console.log("Heres the Response Body: ", res.body);
    //     })
    // })
    //     // go to game window
    //     // window.location.href = "/game";
})

