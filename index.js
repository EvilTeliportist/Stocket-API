const http = require('http');
const express = require('express');
const sql = require('mssql')
const SQLConnectionString = 'mssql://test123:Admin123!@rtstockproject.database.windows.net/StockMarketData?encrypt=true';
const path = require('path');
var crypto = require("crypto-js");


const app = express();
app.use(express.json());
app.use(express.static(__dirname + '/pages'));



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



// Async Functions ---------------------------------------
async function getData(res, s){
    connection = await sql.connect(SQLConnectionString);

    const result = await sql.query(s);

    res.json(result)
}

async function addData(res, data){

    for (var ticker in data){
        replacedTicker = checkTickerSwitch(ticker)
        for (var time in data[ticker]){
            try {

                s = "INSERT INTO " + replacedTicker + " (datetime, price) VALUES (\'" + time + "\', " + data[ticker][time] + ");";
                console.log(ticker + ":" + time)
                // const result = await sql.query(s);
                
            } catch (error) {
                console.log(error);
            }
        }
    }

    res.json({
        "error":"none"
    })
}

async function validateUser(res, email, pass){
    // Does user with email even exist?
    result = await sql.query("SELECT * FROM users WHERE email = \'" + email + "\';");
    doesUserExist = result.recordset.length != 0;
    if (doesUserExist){
        if (pass == result.recordset[0]['password']){
            res.json({
                success: true,
                message: "redirect to dashboard"
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
            res.json({
                success: true,
                message: "Success!"
            })
        } else {
            res.json({
                success: false,
                message: "Something failed when signing you up..."
            })
        }
    }
}

async function dashData(res, email, pass){
    s = "SELECT token FROM users WHERE email = \'" + email + "\' AND password = \'" + pass + "\';"
    result = await sql.query(s)
    console.log(result)
    res.json({
        token: result.recordset[0].token
    });
}



// Server request pathways -------------------------------
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/homepage/index.html'))
})

app.get('/request', (req, res) => {
    var ticker = req.body.ticker;
    var start = req.body.start;
    var end = req.body.end;

    console.log(ticker)

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
        getData(res, "SELECT * FROM " + checkTickerSwitch(ticker) + ";");
    }).catch((message) => {
        console.log(message);
    });
    
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
    if (p.includes("'") || p.includes('"') || p.includes(";") || email.includes("'") || email.includes('"') || email.includes(";")){
        res.json({
            success: false,
            message: 'bad chars'
        })
    } else {
        password = crypto.SHA256(p).toString(crypto.enc.Hex);
        console.log(password)

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

    if (p.includes("'") || p.includes('"') || p.includes(";") || email.includes("'") || email.includes('"') || email.includes(";")){
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
            validateUser(res, email, password);
        }).catch((message) => {
            console.log(message)
        });
    }
   
})

app.get('/dashboard', (req, res) => {
    res.send(path.join(__dirname, '/pages/dashboard/index.html'));
});

app.post('/dashboard_data', (req, res) => {
    email = req.body.email;
    password = crypto.SHA256(req.body.password).toString(crypto.enc.Hex);

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
        dashData(res, email, password);
    }).catch((message) => {
        console.log(message)
    });
});

// Start Listening -----------------------------------------
const port = process.env.PORT || 8888;
app.listen(port, () => {
    console.log("Listening on " + port.toString());
  });