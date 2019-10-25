'use strict'

var userController = require('../controller/user');
var authController = require('../controller/auth/authController');
var productDetailController = require('../controller/product_detail');
var feedDetailController = require('../controller/feed_detail');
var constants      = require('../../config/constants');
const variableDefined = constants[0].application;
const Liana = require('forest-express-sequelize');

const bodyParser        = require("body-parser");
var multer  = require('multer');
var fs  = require('fs');
var path=require('path');
// define multer storage configuration     

// var Storage = multer.diskStorage({
//   destination: function (req, file, callback) {
//     fs.mkdir(path.join(__dirname, 'uploads', req.ui), function(){
//        callback(null, path.join(__dirname, 'uploads', req.ui));
//     });
//   },
//   filename: function (req, file, callback) {
//     callback(null, req.ui + file.originalname.substring(file.originalname.indexOf('.'), file.originalname.length));
//   }
// });


//var upload = multer({ dest: './uploads'}); 

//var upload = multer({  storage: Storage });

var upload = multer({ dest: './uploads'}); 
var type = upload.single('imagepic');


// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

module.exports = function(app) {
//Check Express Middleware
function isAuth(req, res, next){
    var curSession  = req.session;
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    if(curSession.userRec ===  undefined ){
        res.json({message: variableDefined.variables.logged_out, status:0});
    return; // return undefined
    }
    return next();  //HTTP request handlers
}
//-------------------- AUTH Route ---------------------------------
app.route('/logout')
    .post(isAuth, userController.logout)
app.route('/login')
     .post(userController.validate('login'), userController.login)
//-------------------- AUTH Route ---------------------------------

//-------------------- USER SECTION ROUTE ---------------------------------

app.route('/user')
    .get(isAuth, userController.getList)
    .delete(isAuth, userController.delete)
    .post(userController.validate('create'),userController.create)
app.put('/user', isAuth, userController.validate('update'),userController.update);  //PUT requires a callback
app.route('/user/export')
    .post(isAuth, userController.export)  //Need a csv file mandatory
app.route('/user/import')
    .post(isAuth, userController.import)


//-------------------- PRODUCT DETAILS SECTION ROUTE ---------------------------------    

app.route('/product')
     .get(isAuth, productDetailController.getList)
     .post(isAuth, productDetailController.validate('create'), productDetailController.create)



app.route('/feed')
     .post( upload.single("imagepic"), productDetailController.feed_create)

app.route('/mutiple_feed')
     .post( upload.array('photos', 3), productDetailController.mutiple_feed_create)

app.route('/two_tble_res')
    .get( productDetailController.twoTbleRes)     


app.route('/feed_comment_view')
    .get( productDetailController.feedCommentView) 

//-------------------- DO OTHER SECTION ROUTE ---------------------------------





//--------------------- FEED DETAILS ROUTE ------------------------------------

//--------------------- FEED DETAILS ROUTE ------------------------------------

app.route('/feed_data')
    .get(isAuth, feedDetailController.getList)
    .delete(isAuth, feedDetailController.delete)
    .post(upload.array('photos', 2) , feedDetailController.validate('create'),feedDetailController.create)
//app.put('/feed', upload.array('photos', 3), isAuth, feedDetailController.validate('update'),feedDetailController.update);  //PUT requires a callback




    //post(upload.array('photos', 2) , feedDetailController.validate('create'),feedDetailController.create)







};