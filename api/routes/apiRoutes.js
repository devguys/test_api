'use strict'

var userController = require('../controller/user');
var authController = require('../controller/auth/authController');
var productDetailController = require('../controller/product_detail');
var constants      = require('../../config/constants');
const variableDefined = constants[0].application;
const Liana = require('forest-express-sequelize');

const bodyParser        = require("body-parser");
var multer  = require('multer');
// define multer storage configuration     
// const storage = multer.diskStorage({
//     destination : function(req,file,callback){
//         callback(null, '../../public/uploads/');
//     },
//     filename: function(req,file,callback){
//         callback(null, file.fieldname + '-' + Date.now());
//     }
// });
//const upload = multer({ storage : storage});

//const upload = multer({ dest: '../../public/uploads/'});


var upload = multer({ dest: './uploads'}); 
var type = upload.single('imagepic');console.log(upload);


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
    /*app.route('/user/import').post('/products/actions/import-data', Liana.ensureAuthenticated,
    (req, res) => {
      let parsed = parseDataUri(req.body.data.attributes.values['CSV file']);
      let productType = req.body.data.attributes.values['Type'];
  
      csv.parse(parsed.data, { delimiter: ';' }, function (err, rows) {
        if (err) {
          res.status(400).send({
            error: `Cannot import data: ${err.message}` });
        } else {
          return P
            .each(rows, (row) => {
              // Random price for the example purpose. In a real situation, the price 
              // should certainly be available in the CSV file.
              let price = faker.commerce.price(5, 1000) * 100;
  
              return models.products.create({
                label: row[0],
                price: price,
                picture: row[1]
              });
            })
            .then(() => {
              res.send({ success: 'Data successfuly imported!' });
            });
        }
      });
    });*/

//-------------------- PRODUCT DETAILS SECTION ROUTE ---------------------------------    

app.route('/product')
     .get(isAuth, productDetailController.getList)
     .post(isAuth, productDetailController.validate('create'), productDetailController.create)



app.route('/feed')
     .post( upload.single("imagepic"), productDetailController.feed_create)

app.route('/mutiple_feed')
     .post( upload.array('photos', 3), productDetailController.mutiple_feed_create)



// app.route('/two_tble_res')
//      .get( productDetailController.two_tble_res)


app.route('/two_tble_res')
    .get( productDetailController.twoTbleRes)     


// app.route('/feed')
//     .post( type, productDetailController.feed_create)


// app.route('/feed')
//     .post( multer({ dest: '../../public/uploads/'}).single('pic'), productDetailController.feed_create)




//-------------------- DO OTHER SECTION ROUTE ---------------------------------



};