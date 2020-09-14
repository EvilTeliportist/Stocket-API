
const SIGN_UP_URL = 'http://localhost:8888/add_user';
const SIGN_IN_URL = 'http://localhost:8888/sign_in';

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

    if (!email.includes('@')){
        $("#signup-email").addClass('error');
        $("#signup-email").val("");
        $("#signup-email").attr("placeholder", "Invalid email.");
        return;
    }

    // Check if passwords match
    if (p1 == p2){

        info = {'email': email, 'password': p1}

        // Make fetch request
        fetch(SIGN_UP_URL, {
            method: "POST",
            body: JSON.stringify(info),
            headers: {
                'content-type':'application/json'
            }
        }).then(res => res.json()).then(data => {
            // Deal with errors and messages
            console.log(data)
            if (data.message == 'User already exists.'){ 
                $("#signup-email").addClass('error')
                $("#signup-email").val("");
                $("#signup-email").attr("placeholder", "User already exists.")
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
        }
    });

    
});