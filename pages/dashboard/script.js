var email = $.cookie("email");
var pass = $.cookie('password');

const info = {'email':email, 'password': pass}
const url = "http://localhost:8888/"

// Get cookie
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

sessionID = getCookie("sessionID")

fetch(url + "dashboard_data", {
    method: "POST",
    body: JSON.stringify({sessionID: sessionID}),
    headers: {
        'content-type':'application/json',
        'Accept': 'application/json'
    }
}).then(res => res.json()).then(data => {
    if (data.message == 'redirect'){
        window.location.href = url;
    } else {
        $("#token").text(data.token);
        console.log(data.token)
    }

});

showingInfo = false;

$(".info").click(function() {
    $('#title-content').fadeOut(500, function(){
        $("#main-content").fadeIn(500);
    });
});

$("#x").click(function() {
    $('#main-content').fadeOut(500, function(){
        $("#title-content").fadeIn(500);
    });
});