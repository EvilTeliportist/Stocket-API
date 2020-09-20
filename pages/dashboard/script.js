var email = $.cookie("email");
var pass = $.cookie('password');

const info = {'email':email, 'password': pass}
const url = "https://rtstockdata.azurewebsites.net/"

if (!document.cookie.match(/^(.*;)?\s*email\s*=\s*[^;]+(.*)?$/)){
    window.location.href = url;
}

fetch(url + "/dashboard_data", {
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