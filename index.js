const http = require('http');
const express = require('express');
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;


// Add SQL Database Connections
var Connection = require('tedious').Connection;  
    var config = {  
        server: 'rtstockproject.database.windows.net',
        authentication: {
            type: 'default',
            options: {
                userName: 'test123', // CHANGE THESE TO ENV VARIABLES BEFORE PRODUCTION
                password: 'Admin123!' // CHANGE THESE TO ENV VARIABLES BEFORE PRODUCTION
            }
        },
        options: {
            port: 1433,
            encrypt: true,
            database: 'StockMarketData',
            rowCollectionOnRequestCompletion: true
        },
        debug: {
            packet: true,
            data: true,
            payload: true,
            token: true
        }
};

var connection = new Connection(config);

connection.on('connect', function(err) {
    if (err) {
        console.log(err)
    } else {
        console.log("Connected!")
    }
})

function executeStatement(res, s){
    request = new Request(s, function(err, rowCount, rows) {
        if (err){
            console.log("SQLERROR: " + err)
        } else {
            console.log(rows)
            res.json({
                data: rows,
            })
        }})
    connection.execSql(request)
}



// Server contraints and INITs
const app = express();
app.use(express.json());

// Server request pathways
app.get('/', (req, res) => {
    executeStatement(res, "SELECT * FROM test")
});


// Start Listening
const port = process.env.PORT || 8888;
app.listen(port, () => {
    console.log("Listening on https://localhost:" + port.toString());
  });