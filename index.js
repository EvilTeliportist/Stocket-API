const http = require('http');
const express = require('express');
const sql = require('mssql')
const SQLConnectionString = 'mssql://test123:Admin123!@rtstockproject.database.windows.net/StockMarketData?encrypt=true';
const path = require('path');
const crypto = require("crypto-js");
const rateLimit = require('express-rate-limit');
const favicon = require('serve-favicon');


const apiLimiter = rateLimit({
    windowMs: 1000 * 15,
    max: 1,
    message: {
        success: false,
        message: "Too many requests"
    }
})

const app = express();
app.use(express.json());
app.use(express.static(__dirname + '/pages'));
app.use("/request", apiLimiter)
app.use(favicon(__dirname + "/pages/resources/logo.ico")); 

sessions = {}
MAX_SESSION_TIMEOUT = 1000 * 60 * 30 // 30 minute timeout


// Functions --------------------------------------------
function checkTickerSwitch(ticker){
    switch(ticker){
        case "ALL":
            return "ALL1";
        case "BRK-B":
            return "BRKB";
        case "BF-B":
            return "BFB";
        case "KEY":
            return "KEY1";
        default:
            return ticker;
    }
}

function generate_token(length){
    //edit the token allowed characters
    var a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split("");
    var b = [];  
    for (var i=0; i<length; i++) {
        var j = (Math.random() * (a.length-1)).toFixed(0);
        b[i] = a[j];
    }
    return b.join("");
}

function isSQL(p){
    return p.includes("'") || p.includes('"') || p.includes(";") 
}

function getAllValidSessionIDs(){
    temp = []
    for (var email in sessions){
        if (Date.now() - sessions[email][0] > MAX_SESSION_TIMEOUT){
            delete sessions[email];
        } else {
            temp.push(sessions[email][1])
        }
    }

    return temp
}

function getEmailFromSessions(id){
    for (var email in sessions){
        if (sessions[email][1] == id){
            return email;
        }
    }

    return '';
}


// Async Functions ---------------------------------------
async function getData(res, s){
    connection = await sql.connect(SQLConnectionString);

    try {
        const result = await sql.query(s);

        res.json({
            success: true,
            message: "Success!",
            data: result
        })

    } catch (UnhandledPromiseRejectionWarning){
        res.json({
            success: false,
            message: "Invalid Ticker",
            data: {}
        })
    }
    
}

async function addData(res, data){

    sqlError = false;

    for (var ticker in data){
        replacedTicker = checkTickerSwitch(ticker)
        for (var time in data[ticker]){
            try {

                s = "INSERT INTO " + replacedTicker + " (dt, price) VALUES (CONVERT(SMALLDATETIME, \'" + time + "\'), " + data[ticker][time] + ");";
                console.log(ticker + ":" + time + ":" + data[ticker][time])
                const result = await sql.query(s);
                
            } catch (error) {
                console.log(error);
                sqlError = true;
            }
        }
    }

    if (sqlError){
        res.json({
            "error":"sql"
        })
    } else {
        res.json({
            "error":"none"
        })
    }
}

async function validateUser(res, email, pass, sessionIDFromClient){

    allSessionIDs = getAllValidSessionIDs();
    if (allSessionIDs.includes(sessionIDFromClient)){
        // Log in if session ID is valid
        res.json({
            success: true,
            message: "redirect to dashboard",
            sessionID: sessionIDFromClient
        })

    } else {

        // Does user with email even exist?
        result = await sql.query("SELECT * FROM users WHERE email = \'" + email + "\';");
        doesUserExist = result.recordset.length != 0;
        if (doesUserExist){
            if (pass == result.recordset[0]['password']){
                
                sessionID = generate_token(40)
                now = Date.now()
                sessions[email] = [now, sessionID];
                
                res.json({
                    success: true,
                    message: "redirect to dashboard",
                    sessionID: sessionID
                })

            } else {
                res.json({
                    success: false,
                    message: "Password is incorrect."
                })
            }
        } else {
            res.json({
                success: false,
                message: "No user with this email exists."
            })
        }

    }  
}

async function addUser(res, email, pass){
    token = generate_token(40)
    s = "SELECT * FROM users WHERE email = \'" + email + "\';"
    result = await sql.query(s)

    if (result.recordset.length != 0){
        res.json({
            success: false,
            message: "User already exists."
        });
    } else {
        s = "INSERT INTO users (email, password, token) VALUES (\'" + email + "\', \'" + password + "\', \'" + token + "\');"
        result = await sql.query(s)
        s = "SELECT * FROM users WHERE email = \'" + email + "\';"
        result = await sql.query(s)
        if (result.recordset.length != 0){

            sessionID = generate_token(40);
            now = Date.now();
            sessions[email] = [now, sessionID];

            res.json({
                success: true,
                message: "Success!",
                sessionID: sessionID
            })

        } else {
            res.json({
                success: false,
                message: "Something failed when signing you up..."
            })
        }
    }
}

async function dashData(res, sessionIDFromClient){

    if (getAllValidSessionIDs().includes(sessionIDFromClient)){
        email = getEmailFromSessions(sessionIDFromClient)
        s = "SELECT token FROM users WHERE email = \'" + email + "\';"
        result = await sql.query(s)
        res.json({
            token: result.recordset[0].token
        });
    } else {
        res.json({
            success: false,
            message: 'redirect'
        })
    }

    
}

async function checkToken(token){
    s = "SELECT * FROM users WHERE token = '" + token + "';"
    result = await sql.query(s)


    if (result.recordset.length > 0){
        return true;
    } else {
        return false;
    }
}


// Server request pathways -------------------------------
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/homepage/index.html'))
})

app.get('/request', (req, res) => {
    var ticker = req.body.ticker;
    var start = req.body.start;
    var end = req.body.end;
    var token = req.body.token;


    if (isSQL(ticker) || isSQL(start) || isSQL(end) || isSQL(token)){
        res.json({
            success: false,
            message: "bad chars"
        })
    } else {


        // Establish a connection to the database first
        let establishConnection = new Promise((resolve, reject) => {
            sql.connect(SQLConnectionString, function (err){
                if (err) {
                    console.log(err)
                    reject("Connection Failed");
                } else {
                    resolve('Connection Succeeded');
                }
            });
        })

        // Execute query after promise
        establishConnection.then((message) => {
            console.log(message);
            checkToken(token).then(tokenValid => {
                if (tokenValid){
                    getData(res, "SELECT * FROM " + checkTickerSwitch(ticker) + " WHERE dt BETWEEN \'" + start + "\' AND \'" + end + "\';");
                } else {
                    res.json({
                        success: false,
                        message: "Invalid Token",
                        data: {}
                    })
                }
            }).catch((message) => {
                console.log(message);
            });
        })
    }
});

app.post('/update', (req, res) => {
    var hash = req.body.hash;
    var data = req.body.data;

    if (hash == '7A6ECCDB792062797AA4F6BEE12199219EC8749641BA50B3138DD4857A65173D'){
        
        var data = req.body.data;
        
        // Establish a connection to the database first
        let establishConnection = new Promise((resolve, reject) => {
            sql.connect(SQLConnectionString, function (err){
                if (err) {
                    console.log(err)
                    reject("Connection Failed");
                } else {
                    resolve('Connection Succeeded');
                }
            });
        })

        // Execute query after promise
        establishConnection.then((message) => {
            console.log(message)
            addData(res, data)
        }).catch((message) => {
            console.log(message)
        });
    }
})

app.post('/add_user', (req, res) => {
    email = req.body.email;
    p = req.body.password;

    // Check if anything includes bad characters
    if (isSQL(p) || isSQL(email)){
        res.json({
            success: false,
            message: 'bad chars'
        })
    } else {
        password = crypto.SHA256(p).toString(crypto.enc.Hex);

        let establishConnection = new Promise((resolve, reject) => {
            sql.connect(SQLConnectionString, function (err){
                if (err) {
                    console.log(err)
                    reject("Connection Failed");
                } else {
                    resolve('Connection Succeeded');
                }
            });
        })

        // Execute query after promise
        establishConnection.then((message) => {
            console.log(message)
            addUser(res, email, password);
        }).catch((message) => {
            console.log(message)
        });
    }
});

app.post('/sign_in', (req, res) => {
    email = req.body.email;
    p = req.body.password;
    sessionID = req.body.sessionID;


    if (isSQL(p) || isSQL(email)){
        res.json({
            success: false,
            message: 'bad chars'
        })
    } else {
        password = crypto.SHA256(p).toString(crypto.enc.Hex);

        let establishConnection = new Promise((resolve, reject) => {
            sql.connect(SQLConnectionString, function (err){
                if (err) {
                    console.log(err)
                    reject("Connection Failed");
                } else {
                    resolve('Connection Succeeded');
                }
            });
        })

        // Execute query after promise
        establishConnection.then((message) => {
            console.log(message)
            validateUser(res, email, password, sessionID);
        }).catch((message) => {
            console.log(message)
        });
    }
   
})

app.get('/dashboard', (req, res) => {
    res.send(path.join(__dirname, '/pages/dashboard/index.html'));
});

app.post('/dashboard_data', (req, res) => {
    sessionIDFromClient = req.body.sessionID;

    let establishConnection = new Promise((resolve, reject) => {
        sql.connect(SQLConnectionString, function (err){
            if (err) {
                console.log(err)
                reject("Connection Failed");
            } else {
                resolve('Connection Succeeded');
            }
        });
    })

     // Execute query after promise
     establishConnection.then((message) => {
        dashData(res, sessionIDFromClient);
    }).catch((message) => {
        console.log(message)
    });
});


// Start Listening -----------------------------------------
const port = process.env.PORT || 8888;
app.listen(port, () => {
    console.log("Listening on " + port.toString());
  });