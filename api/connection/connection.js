'user strict';

var config = require('./config');
var mysql  = require('mysql');

//local mysql db connection
// var connection = mysql.createConnection({
//     host     : 'localhost',
//     user     : 'root',
//     password : 'root',
//     database : 'localdb'
// });
//console.log('Connection Config: ', config.adapter[0]);
var connection = mysql.createConnection(config.adapter[0].sql);
connection.connect(function(err) {
    console.log('SQL is running...');
    if (err) throw err;
});

module.exports = connection;