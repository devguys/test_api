// server.js

// BASE SETUP
// =============================================================================


// call the packages we need
var express     = require('express');        // call express
var app         = express();                 // define our app using express
var orm         = require('orm');
var bodyParser  = require('body-parser');
var db          = require('./api/models');   
var User        = require('./api/models/userModel');

//var config = require('./api/connection/config');
//config(app);    //Bind with application
//SQL Server connection
var sql = require('./api/connection/connection.js');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
let port = process.env.PORT || 4000; // set our port

var routes = require('./api/routes/apiRoutes.js'); //importing route
routes(app); //register the route

// ROUTES FOR OUR API
// =============================================================================
/*var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);
*/

// START THE SERVER
// =============================================================================
//app.set('port',process.env.PORT || 9000);

app.listen(port);
console.log('Magic happens on port ' + port);

