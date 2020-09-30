const url = 'http://localhost:8888/'
const SIGN_UP_URL = url + 'add_user';
const SIGN_IN_URL = url + 'sign_in';
const DASH_URL = url + 'dashboard';


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


// Send session ID to see if valid first
sessionID = getCookie("sessionID")
console.log(sessionID)
session_info = {
    email: "",
    password: "", 
    sessionID: sessionID
}
fetch(SIGN_IN_URL, {
    method: "POST",
    body: JSON.stringify(session_info),
    headers: {
        'content-type':'application/json',
        'Accept': 'application/json'
    }
}).then(res => res.json()).then(data => {
    if (data.success){
        document.cookie = 'sessionID='+data.sessionID;
        window.location.href = DASH_URL;
    }
})



$("form").submit(function(e){
    e.preventDefault();
});

$("#signin-text").addClass('tab-selected')

$("#signup-text").click(function () {
    if (!$("#signup-text").hasClass('tab-selected')){
        $("#signup-text").addClass('tab-selected');
        $("#signin-text").removeClass('tab-selected');
        $("#signin-content").fadeOut(function() {
            $("#signup-content").fadeIn();
        });
    }
});

$("#signin-text").click(function () {
    if (!$("#signin-text").hasClass('tab-selected')){
        $("#signin-text").addClass('tab-selected');
        $("#signup-text").removeClass('tab-selected');
        $("#signup-content").fadeOut(function() {
            $("#signin-content").fadeIn();
        });
    }
});

$("#signup-submit").click(function () {

    // Get inputted data
    const email = $("#signup-content").children()[0].value;
    const p1 = $("#signup-content").children()[1].value;
    const p2 = $("#signup-content").children()[2].value;


    // Invalid email check
    if (!email.includes('@')){
        $("#signup-email").addClass('error');
        $("#signup-email").val("");
        $("#signup-email").attr("placeholder", "Invalid email.");
        return;
    }


    // Max password length
    if (p1.length > 30){
        $("#signup-password").addClass('error')
        $("#signup-password").val("");
        $("#passconfirm").addClass('error')
        $("#passconfirm").val("");
        $("#signup-password").attr("placeholder", "Passwords must be less")
        $("#passconfirm").attr("placeholder", "than 30 characters.")
        return
    }


    // Min password length
    if (p1.length < 7){
        $("#signup-password").addClass('error')
        $("#signup-password").val("");
        $("#passconfirm").addClass('error')
        $("#passconfirm").val("");
        $("#signup-password").attr("placeholder", "Passwords must be at")
        $("#passconfirm").attr("placeholder", "least 7 characters.")
        return
    }


    // Check if passwords match
    if (p1 == p2){

        info = {'email': email, 'password': p1}

        // Make fetch request
        fetch(SIGN_UP_URL, {
            method: "POST",
            body: JSON.stringify(info),
            headers: {
                'content-type':'application/json',
                'Accept': 'application/json'
            }
        }).then(res => res.json()).then(data => {
            // Deal with errors and messages
            console.log(data)
            if (data.message == 'User already exists.'){ 
                $("#signup-email").addClass('error')
                $("#signup-email").val("");
                $("#signup-email").attr("placeholder", "User already exists.")
            } else if (data.message == 'alphanumeric') {
                $("#signup-password").addClass('error')
                $("#signup-password").val("");
                $("#passconfirm").addClass('error')
                $("#passconfirm").val("");
                $("#signup-password").attr("placeholder", "Passwords must be")
                $("#passconfirm").attr("placeholder", "alphanumeric")
            } else if(data.message == 'bad chars') {
                $("#signup-password").addClass('error')
                $("#signup-password").val("");
                $("#passconfirm").addClass('error')
                $("#passconfirm").val("");
                $("#signup-password").attr("placeholder", "We noticed some")
                $("#passconfirm").attr("placeholder", "suspicous letters...")
            } else if(data.success){
                console.log("Log in was a success!");
                document.cookie = 'sessionID='+data.sessionID;
                window.location.href = DASH_URL
            }
        });
    } else {
        // Deal with non-matching passwords
        $("#passconfirm").addClass('error')
        $("#passconfirm").val("");
        $("#passconfirm").attr("placeholder", "Passwords must match.")
        console.log("Passwords do not match.")
    }
});

$("#signin-submit").click(function () {

    
    // Get inputted data
    const email = $("#signin-content").children()[0].value;
    const p1 = $("#signin-content").children()[1].value;

    info = {'email': email, 'password': p1}

    if (!email.includes('@')){
        $("#signin-email").addClass('error');
        $("#signin-email").val("");
        $("#signin-email").attr("placeholder", "Invalid email.");
        return;
    }

    // Make fetch request
    fetch(SIGN_IN_URL, {
        method: "POST",
        body: JSON.stringify(info),
        headers: {
            'content-type':'application/json'
        }
    }).then(res => res.json()).then(data => {
        // Deal with errors and messages
        console.log(data)
        if (data.message == 'Password is incorrect.'){ 
            $("#signin-password").addClass('error');
            $("#signin-password").val("");
            $("#signin-password").attr("placeholder", "Password incorrect.");
        } else if (data.message == "No user with this email exists.") {
            $("#signin-password").val("");
            $("#signin-email").addClass('error');
            $("#signin-email").val("");
            $("#signin-email").attr("placeholder", "No user exists.");
        } else if(data.message == 'bad chars') {
            $("#signin-password").addClass('error')
            $("#signin-password").val("");
            $("#signin-email").addClass('error')
            $("#signin-email").val("");
            $("#signin-email").attr("placeholder", "We noticed some")
            $("#signin-password").attr("placeholder", "suspicous letters...")
        } else if (data.success){
            console.log("Log in was a success!");
            document.cookie = 'sessionID='+data.sessionID;
            window.location.href = DASH_URL
        }
    });

    
});