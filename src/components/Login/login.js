import "jquery-form";
var $ = require("jquery");

$(document).ready(() => {
    // $("#loginCredentials").submit(function (event) {
    //     event.preventDefault();
    // });  
    $("#loginCredentials").ajaxForm(function(res) {
        console.log("got a login response")
        console.log(res);
    })
    //     // go to game window
    //     // window.location.href = "/game";
})

// function post(path, params, method='post') {

//     // The rest of this code assumes you are not using a library.
//     // It can be made less wordy if you use one.
//     const form = document.createElement('form');
//     form.method = method;
//     form.action = path;
  
//    Object.keys(params).forEach(key => {
//       if (params.hasOwnProperty(key)) {
//         const hiddenField = document.createElement('input');
//         hiddenField.type = 'hidden';
//         hiddenField.name = key;
//         hiddenField.value = params[key];
  
//         form.appendChild(hiddenField);
//       }
//     });
  
//     document.body.appendChild(form);
//     form.submit();
//   }