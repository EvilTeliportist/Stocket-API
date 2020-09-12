const http = require('http');
const express = require('express');
const sql = require('mssql')


// Add SQL Database Connections
const SQLConnectionString = 'mssql://test123:Admin123!@rtstockproject.database.windows.net/StockMarketData?encrypt=true';

// Data Retrieval Function
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

async function getData(res, s){
    connection = await sql.connect(SQLConnectionString);

    const result = await sql.query(s);

    res.json(result)
}


async function addData(res, data){

    for (var ticker in data){
        replacedTicker = checkTickerSwitch(ticker)
        console.log("Starting on " + ticker)
        for (var time in data[ticker]){
            try {

                s = "INSERT INTO " + replacedTicker + " (datetime, price) VALUES (\'" + time + "\', " + data[ticker][time] + ");";

                const result = await sql.query(s);
                
            } catch (error) {
                console.log(error);
            }
        }

        console.log(ticker + " Done!")
    }

    res.json({
        "error":"none"
    })
}



// Server contraints and INITs
const app = express();
app.use(express.json());

// Server request pathways
app.get('/', (req, res) => {
    res.send("HOMEPAGE")
})

app.get('/request', (req, res) => {
    var ticker = req.body.ticker;
    var start = req.body.start;
    var end = req.body.end;

    console.log(ticker)
    getData(res, "SELECT * FROM " + checkTickerSwitch(ticker) + ";")
});

app.get('/update', (req, res) => {
    var hash = req.body.hash;
    //if (hash == '7A6ECCDB792062797AA4F6BEE12199219EC8749641BA50B3138DD4857A65173D'){
    var data = req.body.data;
    
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

    establishConnection.then((message) => {
        console.log(message)
        addData(res, data)
    }).catch((message) => {
        console.log(message)
    })


    //}
})



// Start Listening
const port = process.env.PORT || 8888;
app.listen(port, () => {
    console.log("Listening on https://localhost:" + port.toString());
  });