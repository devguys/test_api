'use strict'

var mysql       = require('mysql');
const env       = process.env.NODE_ENV || 'development';
const config    = require("./config/config.json")[env];

var connectionString = mysql.createConnection({
  host      : config.host,
  user      : config.username,
  password  : config.password
});

connectionString.connect(function(err) {
  if (err) throw err;
  //console.log("MYSQL Connected!");
  var theDatabase = "CREATE DATABASE IF NOT EXISTS "+config.database+" CHARACTER SET latin1 COLLATE latin1_swedish_ci";
    connectionString.connect(function(err) {
    connectionString.query(theDatabase, function (err, result) {
    if (err) throw err;
    console.log("Database created");
  });
});
//return true;
});
const runDatabase                = require("./models");
//================================================================
//---------------------Migration Start---//-------------------------
//================================================================
//CREATE Tables automatically in database - from existing models
//Run Once on the server
//const faker             = require("faker");
//const times             = require("lodash.times");
runDatabase.sequelize.sync().then(() => {
    //populate User table with dummy data if needed
    //   db.user.bulkCreate(
    //     times(10, () => ({
    //       firstName: faker.name.firstName(),
    //       lastName: faker.name.lastName()
    //     }))
    //   );
    return;
});
//================================================================
//---------------------Migration End------------------------------
//Ref Link: https://sequelize.org/master/manual/migrations.html
//================================================================