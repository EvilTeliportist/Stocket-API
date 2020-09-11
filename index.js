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
                userName: 'test123',
                password: 'Password123!'
            }
        },
        options: {
            // If you are on Microsoft Azure, you need encryption:
            encrypt: true,
            database: 'StockMarketData'
        }
    };  
    var connection = new Connection(config);  
    connection.on('connect', function(err) {  
        // If no error, then good to proceed.
        console.log("Connected");  
    });  

function SQLStatement(statement){
    request = new Request(statement, function(err){
        if (err) {
            console.log(err)
        }});

        var result = "";
        request.on('row', function(columns){
            columns.forEach(function(column){
                if (column.value === null){
                    console.log("NULL");
                } else {
                    result += column.value + " "
                }
            });
            console.log(result);
            result = ""
        });

        request.on('done', function(rowCount, more){
            console.log(rowCount + " rows returned");
        });

        connection.execSql(request)
}



// Server contraints and INITs
const app = express();
app.use(express.json());

// Server request pathways
app.get('/', (req, res) => {
    res.json({
        'response': 'you got a json response!'
    })
});


// Start Listening
const port = process.env.PORT || 8888;
app.listen(port, () => {
    console.log("Listening on https://localhost:" + port.toString());
  });