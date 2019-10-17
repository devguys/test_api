'use strict'

//Get ORM object
var productDetailController = require('./product_detail');
var constants               = require('../../config/constants');
var bCrypt                  = require('bcrypt-nodejs');
const ParseCSV              = require('bluebird');
const Liana                 = require('forest-express-sequelize');
const faker                 = require('faker');
const parseDataUri          = require('parse-data-uri');

const { body,validationResult } = require('express-validator');
const Sequelize             = require('sequelize');
const Op                    = Sequelize.Op;
const db                    = require('../../models');
const theModel              = db.product_details; 
const theContr              = productDetailController;
const variableDefined       = constants[0].application;
const fs                    = require('fs'),async = require('async'),csv = require('csv');
const createCsvWriter       = require('csv-writer').createObjectCsvWriter;




//-----------------------------------------------------------------------
//---------------- API Required Field Validation ------------------------
//-----------------------------------------------------------------------
exports.validate = (method) => {
  switch (method) {
    case 'create' : {
     return [ 
        // body('name', variableDefined.variables.product_name_required).not().isEmpty(),
        // body('parnet_category_id', variableDefined.variables.parnet_category_id_required).exists(),
        // body('category_id', variableDefined.variables.category_id_required).exists(),
        // body('price_value', variableDefined.variables.price_value_required).exists(),
       ]   
    }
    // case 'login' : {
    //   return [ 
    //      body('email', variableDefined.variables.email_required).exists().isEmail(),
    //      body('password', variableDefined.variables.password_required).exists(),
    //     ]   
    //  }
    // case 'update' : {
    //   return [ 
    //      body('first_name', variableDefined.variables.first_name_required).exists(),
    //      body('last_name', variableDefined.variables.last_name_required).exists(),
    //      body('username', variableDefined.variables.username_required).exists(),
    //      body('password')  
    //         .exists().withMessage(variableDefined.variables.password_required)
    //         .isLength({ min: 5, max:15 }).withMessage(variableDefined.variables.password_strength_step1)
    //         .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{5,}$/).withMessage(variableDefined.variables.password_strength_step2),
    //     //  body('password', 'Password is required')
    //     //     .isLength({min: 8, max:15})
    //     //     .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d@$.!%*#?&]/)
    //     //     .withMessage('Password should not be empty, minimum eight characters maximum fifteen, at least one letter, one number and one special character'),
    //      body('email', variableDefined.variables.email_required).exists().isEmail()
    //     ]   
    //  }
  }
}
exports.apiValidation   = function(req,resp){ //console.log(req);
  const errors          = validationResult(req);
  var validationErr     = [];
  var validationErrMesg = [];
  errors.array().forEach(error => { console.log(error);
      let found = validationErr.filter(errItem => error.param === errItem.param);
      if (!found.length) { 
        validationErr.push(error);
      }      
  });
  if(validationErr.length){
    validationErr.forEach(rec => {
       validationErrMesg.push({field: rec.param, message: rec.msg});
    })
    resp.status(422).json({ errors: validationErrMesg, status:0 });
    return true;
  }
  return false;
}

//Add List with pagination limit
/*-----------------------------------
/-------------LIST USER--------------
/---@body: NULL ---------------------
/------------------------------------
------------------------------------*/
exports.getList = function(req, res) {
  theModel.findAll().then( (result) => res.json(result))
};

/*-----------------------------------
/-------------CREATE USER -----------
/---@body: [id, email,username]------
/------------------------------------
------------------------------------*/
exports.create  = function(req, resp) {    

  //Add required validation
  var validReturn   = theContr.apiValidation(req, resp);
  if(validReturn) return;

  var getData   = req.body || null; console.log(getData);
  if(typeof getData === 'object'){

    var parentCategoryId = getData.parnet_category_id || '';
    var categoryId = getData.category_id || '';

     if(parentCategoryId){
         theModel.findOne({           
           where: {
            [Op.or]: [{parnet_category_id: parentCategoryId}, {category_id: categoryId}]
          }
         }).then(result => {
           if(result != null){
             resp.json({ message: variableDefined.variables.email_or_username_exists,record : result });
             return;
           }
           if(result === null){

            theModel.create(req.body).then((insertRecord) => {
              if(insertRecord.dataValues.id != undefined &&  insertRecord.dataValues.id > 0){
                resp.json({ message: 'Record Inserted!',status : 1, record: insertRecord });
                return;
              }
            })
          }
        });
     }
     return;
  }
};

/*-----------------------------------
/-------------UPDATE USER -----------
/---@body: [id, email,username]------
/------------------------------------
------------------------------------*/
exports.update = function(req, resp) {
  //Add required validation

  var contentType   = req.headers['content-type'];
  if(contentType  ===  variableDefined.contentType.formdata){
      //resp.setHeader('Content-Type', 'multipart/form-data');
      console.log('Content Type: form-data', req.files);
      // req.on('data', (data) => {
      //   var dataObj =  (data.toString());
      //   console.log(dataObj);
      // });
      // req.busboy.on('body', function (body) {

      //   console.log("body: ", body);
      // });
  }
  if(contentType  ===  variableDefined.contentType.urlencode){
    console.log('Content Type: urlencode');
}

  //var validReturn   = theContr.apiValidation(req, resp);
  //if(validReturn)   return;
  // if(req.headers != null){
  //   var contype = req.headers['content-type'];
  //   console.log("Headers: ",checkHeaders);
  // }
  // console.log('Check headers: ', req.headers.origin, " :: ", req.method);
  // return false;

  var getData     = req.body || null;
  var getId       = req.body.id || 0;
  var getEmail    = req.body.email || '';
  var getUserName = req.body.username || '';
  //image upload processing
  var getApiImage =  req.body.profile_pic || '';
  delete req.body.id;

  if(!getId){
    resp.json({ message: variableDefined.variables.id_not_found,status : -1 }); 
    return;
  }
  else if(getEmail != null && getUserName != null){
      theModel.findAll(
      { where: { 
        [Op.or]: [
          {email: getEmail}, {username: getUserName}
        ], 
        id:
          { [Op.ne] : getId}                        
        }}).then(result => {
          var findRec = result;
          console.log("UserRec: ",findRec);
          if(findRec.length > 0){
            resp.json({ message: variableDefined.variables.email_exists, status : 0,record: findRec }); 
            return;
          }
          if(!findRec.length){
            if(getData.password != undefined){
              var hashPassword = theContr.hashPassword(getData.password);
              if(hashPassword) getData.password = hashPassword;
            }
            //processing image
            if(getApiImage != null){
              // to declare some path to store your converted image
              var fileName      = getId + "_" + getData.first_name + variableDefined.variables.user_picture_extension;

              //old_filename    = Date.now() + variableDefined.variables.user_picture_extension
              const path        = variableDefined.serverPath.userUploadDir + fileName.toString().trim();
              const imgdata     = getApiImage;
              //const img = 'data:image/png;base64,aBdiVBORw0fKGgoAAA';
              const bufferSize    = Buffer.from(imgdata.substring(imgdata.indexOf(',') + 1));
              const bufferLength  = bufferSize.length;
              const uploadSize    = bufferSize.length / 1e+6;
              //console.log("Byte length: " + bufferSize.length);
              //console.log("MB: " + bufferSize.length / 1e+6);
              if(uploadSize != null && uploadSize >=1){
                resp.json({ message: variableDefined.variables.image_upload_max_size, status : 0 });
                return;
              }
              // to convert base64 format into random filename
              const base64Data  = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');              
              fs.writeFileSync(path, base64Data,  {encoding: variableDefined.variables.user_picture_upload_encoding});
            }
            theModel.update(getData,
            {
              where: {
                id: getId
              }
            }).then((result) => {
              if(result){
                resp.json({ message: variableDefined.variables.record_updated, status : result });
                return;
              }
              else
                resp.json({ message: variableDefined.variables.record_update_error, status : result });
                return;
              })
          }
    });
  }   
};
/*-----------------------------------
/------------- DELETE USER ----------
/---@param: id [i.e. /user?id=]------ 
/------------------------------------
------------------------------------*/
exports.delete = function(req, resp) {
  theModel.destroy({
    where: {
      id: req.query.id
    }
  }).then((result) => {
      if(result)
        resp.json({ message: variableDefined.variables.record_deleted,'status' : result });
      else
        resp.json({ message: variableDefined.variables.record_deleted_error,'status' : result });
  })
};


exports.feed_create = function(req, res){
  console.log(11);
  console.log(req.file);

  //   var fstream;
  //   req.pipe(req.busboy);

  //    console.log('Image File info: ');

  //   // let parsed = parseDataUri(req.body.data.attributes.values['CSV file']);
  //   // let productType = req.body.data.attributes.values['Type'];

  //   req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
  //     console.log("Uploading: " + filename);
  //       var importFile  = filename;
  //       //console.log('File: ', file, " :: ", filename);
  //       console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
  //       // if(filename != null && mimetype != 'text/csv'){
  //       //   res.json({ message: variableDefined.variables.csvFileImportError, status : 0 });
  //       //   return;
  //       // }

        
  // });  


};


exports.mutiple_feed_create = function(req, res){
  console.log(11);
  console.log(req);

  //   var fstream;
  //   req.pipe(req.busboy);

  //    console.log('Image File info: ');

  //   // let parsed = parseDataUri(req.body.data.attributes.values['CSV file']);
  //   // let productType = req.body.data.attributes.values['Type'];

  //   req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
  //     console.log("Uploading: " + filename);
  //       var importFile  = filename;
  //       //console.log('File: ', file, " :: ", filename);
  //       console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
  //       // if(filename != null && mimetype != 'text/csv'){
  //       //   res.json({ message: variableDefined.variables.csvFileImportError, status : 0 });
  //       //   return;
  //       // }

        
  // });  


};


exports.twoTbleRes = function(req, res){
    theModel.findOne({           
        where: {
          id: 1
        }
    }).then(result => {

      theModel.findAll().then(result_details => {   
        res.json({ message: 'Record view',status : 1, record: result_details ,record_one: result});
      });

    });
};



