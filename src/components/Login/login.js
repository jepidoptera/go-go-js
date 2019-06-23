var $ = require("jquery");
$(document).ready(() => {
    $("#loginCredentials").submit(function (event) {
        event.preventDefault();
        console.log("submitted login to https://gogobackend.azurewebsites.net/api/user/login/" + $("input[name='username'").val());
        $.ajax({
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", "Negotiate");
            },
            method: "POST",
            url: "https://gogobackend.azurewebsites.net/api/user/login/" + $("input[name='username'").val(),
            data: {
                password: $("input[name='password'").val(),
            }
        }).then(data => {
            console.log("got back data: ", data);
        });
        // go to game window
        // window.location.href = "/game";
    });  
})
