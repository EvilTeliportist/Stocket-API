var email = $.cookie("email");
var pass = $.cookie('password');

const info = {'email':email, 'password': pass}


fetch("http://localhost:8888/dashboard_data", {
    method: "POST",
    body: JSON.stringify(info),
    headers: {
        'content-type':'application/json',
        'Accept': 'application/json'
    }
}).then(res => res.json()).then(data => {
    $("#token").text(data.token);
    console.log(data.token)
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