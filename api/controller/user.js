'use strict'

//Get ORM object
var userController          = require('./user');
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
const theModel              = db.user; 
const theContr              = userController;
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
        body('first_name', variableDefined.variables.validation_required.first_name_required).exists(),
        body('last_name', variableDefined.variables.validation_required.last_name_required).exists(),
        body('username', variableDefined.variables.validation_required.username_required).exists(),
        body('email', variableDefined.variables.validation_required.email_required).exists().isEmail(),
        body('password')  
            .exists().withMessage(variableDefined.variables.validation_required.password_required)
            .isLength({ min: 5, max:15 }).withMessage(variableDefined.variables.validation_required.password_strength_step1),
            //.matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{5,}$/).withMessage(variableDefined.variables.validation_required.password_strength_step2),
       ]   
    }
    case 'login' : {
      return [ 
         body('email', variableDefined.variables.validation_required.email_required).exists().isEmail(),
         body('password', variableDefined.variables.validation_required.password_required).exists(),
        ]   
     }
    case 'update' : {
      return [ 
         body('first_name', variableDefined.variables.validation_required.first_name_required).exists(),
         body('last_name', variableDefined.variables.validation_required.last_name_required).exists(),
         body('username', variableDefined.variables.validation_required.username_required).exists(),
         body('password')  
            .exists().withMessage(variableDefined.variables.validation_required.password_required)
            .isLength({ min: 5, max:15 }).withMessage(variableDefined.variables.validation_required.password_strength_step1)
            .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{5,15}$/).withMessage(variableDefined.variables.validation_required.password_strength_step2),
         body('email', variableDefined.variables.validation_required.email_required).exists().isEmail()
        ]   
     }
  }
}
exports.apiValidation   = function(req,resp){
  const errors          = validationResult(req);
  var validationErr     = [];
  var validationErrMesg = [];
  errors.array().forEach(error => {
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
//-----------------------------------------------------------------------
//-----------------API Required Field Validation ------------------------
//-----------------------******** END ********** ------------------------
//-----------------------------------------------------------------------
exports.hashPassword  = function(password){
  return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);
}
exports.isLoggedIn  = function (req, res, next) {
    // if user is authenticated in the session, carry on 
    var curSession  = req.session;
    if(curSession.userRec !=  undefined && curSession.userRec.id > 0){
        res.json({ message: variableDefined.variables.logged_in, status:1 });
        return next();
    }
    res.json({ message: variableDefined.variables.logged_out, status:0 });
    return;
}
/*-----------------------------------
/-------------LOGOUT USER------------
/---@body: NULL
/------------------------------------
------------------------------------*/
exports.logout   = function(req, res){
  req.session.destroy((err) => {
    if(err) {
      return console.log({message: variableDefined.variables.logout_unSuccess, status:0, error:err});
    }
    res.json({message: variableDefined.variables.logout_success, status:0});    
  });
}

/*-----------------------------------
/-------------LOGIN USER-------------
/---@body: [email, password] --------
/------------------------------------
------------------------------------*/
exports.login  = function(req, resp){
    var postBody  = req.body || null;
    //Add required validation
    theContr.apiValidation(req, resp);
    if(postBody.email != undefined && postBody.password != undefined){
      if(postBody.email){
        theModel.findOne({           
          where: {
           email: postBody.email
         }
        }).then(result => {
            if(result === null || result === undefined){
              resp.json({ message: variableDefined.variables.validation_required.email_not_exists,status : 0 });
              return;
            }
            if(result.dataValues.id > 0){
               var getRecord  = result;
               var dbPassword = getRecord.password;              
               
              if(!theModel.validPassword(postBody.password, dbPassword)){
                result = null;
                resp.json({ message: variableDefined.variables.validation_required.password_invalid,status : 0 });
                return;
              }
              var userRec = result.dataValues;
              if(req.session != undefined){
                var curSession  = req.session;  
                curSession.userRec = userRec;
                var userRec     = result;
                //Show picture image
                var picPath     = variableDefined.serverPath.userUploadDir +  userRec.dataValues.filename;
                //delete userRec.dataValues.profile_pic;
                userRec.dataValues.profile_pic = picPath;
                resp.json({ message: variableDefined.variables.login_success, status : 1, loggedUser: userRec.dataValues});
              }
           }
        });
      }      
    }
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

  var getData   = req.body || null;
  if(typeof getData === 'object'){
     var getEmail       = getData.email || '';
     var getUserName    = getData.username || '';
     var getApiImage =  req.body.profile_pic || null;
     if(getEmail){
         theModel.findOne({           
           where: {
            [Op.or]: [{email: getEmail}, {username: getUserName}]
          }
         }).then(result => {
           if(result != null){
             resp.json({ message: variableDefined.variables.validation_required.email_or_username_exists,record : result });
             return;
           }
           if(result === null){
            if(getData.password != undefined){
               var hashPassword = theContr.hashPassword(getData.password);
               if(hashPassword) getData.password = hashPassword;
            }            
            theModel.create(req.body).then((insertRecord) => {
              if(insertRecord.dataValues.id != undefined &&  insertRecord.dataValues.id > 0){
                var getId = insertRecord.dataValues.id;
                //processing image
            if(getApiImage != null){
              theModel.findAll(
              { where: { 
                  id: getId                                            
                  }}).then(result => {
                    var recordData = result[0].dataValues;
                    if(result.length > 0){
                      var oldFileName     = recordData.filename;
                      if(oldFileName != null){
                        var filePath = variableDefined.serverPath.userUploadDir + oldFileName;
                        fs.unlinkSync(filePath);
                      }
                      var fileName        = getId + "_" + getData.first_name.toString().replace(/ +/g, "") + variableDefined.variables.user_picture_extension;
                      const path          = variableDefined.serverPath.userUploadDir + fileName;
                      const imgdata       = getApiImage;
                      const bufferSize    = Buffer.from(imgdata.substring(imgdata.indexOf(',') + 1));
                      const bufferLength  = bufferSize.length;
                      const uploadSize    = bufferSize.length / 1e+6;
                      if(uploadSize != null && uploadSize >= variableDefined.variables.user_picture_max_size){
                        resp.json({ message: variableDefined.variables.image_upload_max_size, status : 0 });
                        return;
                      }
                      // to convert base64 format into random filename
                      const base64Data  = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');
                      fs.writeFileSync(path, base64Data,  {encoding: variableDefined.variables.user_picture_upload_encoding});
                      //Add file name
                      getData.filename  = fileName;
                      //Update record with update profile photo
                      theModel.update(getData,
                      {
                          where: {
                            id: getId
                          }
                        }).then((result) => { 
                          
                          // if(result){
                          //   resp.json({ message: variableDefined.variables.record_updated, status : result });
                          //   return;
                          // }
                          // else
                            //resp.json({ message: variableDefined.variables.record_update_error, status : result });
                            //return;
                            resp.json({ message: 'Record Inserted!',status : 1, record: insertRecord });
                            return;
                        }).catch( (err) => {
                          resp.json({ message: variableDefined.variables.unhandledError, status : 0 });
                          return;
                        });
                    }                    
              }).catch( (err) => {
                resp.json({ message: variableDefined.variables.unhandledError, error: err, status : 0 });
                return;
              });              
            }else{
               resp.json({ message: 'Record Inserted!',status : 1, record: insertRecord });
                return;
            }
                
              }
            })
          }
        });
     }
     return;
  }
};
/*-----------------------------------
/-------------EXPORT USER -----------
/---@body: NULL----------------------
/---@output:  Export .csv file-------
/------------------------------------
------------------------------------*/
exports.export  = function(req, res){
  var csvExportFile   = new Date().getTime() + '_user.csv';
  var csvFilePath     = variableDefined.serverPath.userExport + csvExportFile;
  var userRec = [];
  const csvWriter = createCsvWriter({
    path: csvFilePath,
    header: variableDefined.exportTable.userCsvHeader
  });
  theModel.findAll().then( (result) => {
      var theRecord   = result;
      theRecord.forEach(rec => {
        userRec.push(rec.dataValues);
      })
      csvWriter
        .writeRecords(userRec)
        .then(()=> res.json({ message: variableDefined.variables.csvFileCreated, status : 1 }));
  });
}

exports.import  = function(req, res, next){ 
    var fstream;
    req.pipe(req.busboy);

     console.log('CSV File info: ');

    // let parsed = parseDataUri(req.body.data.attributes.values['CSV file']);
    // let productType = req.body.data.attributes.values['Type'];

    req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
      console.log("Uploading: " + filename);
        var importFile  = filename;
        //console.log('File: ', file, " :: ", filename);
        console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
        if(filename != null && mimetype != 'text/csv'){
          res.json({ message: variableDefined.variables.csvFileImportError, status : 0 });
          return;
        }
        //Path where file will be uploaded
        //var fileName        = new Date().getTime() + fileName;
        const importPath    = variableDefined.serverPath.userImport + filename;
        fstream = fs.createWriteStream(importPath); 
        file.pipe(fstream);
        fstream.on('close', function () {     
           console.log("Upload Finished of " + filename); 
           res.json({ message: variableDefined.variables.csvFileUploaded, status : 1 });             
        });
        var input = fs.createReadStream(importPath);
        var parser = csv.parse({
          columns: true,
          relax: true
        });  
        var inserter = async.cargo(function(user, inserterCallback) {
          theModel.bulkCreate(user).then(function() {
              inserterCallback();
            }
          )
          .catch((err) => {
             console.log('DB Insert Error: ',err);
          })
        },1000);
        var line;
        parser.on('readable', function () {
          while(line = parser.read()) {
            var row   = line;
            if(line.status != undefined){
              line.status  = (line.status);
            }
            if(line.password != undefined){
              line.password  = theContr.hashPassword(line.password);
            }
            console.log('Line fetch: ', line);
            inserter.push(line);
          }
        });
        input.pipe(parser);
        var inserterCallback = () => {           
        }
        
  });  
}

/*-----------------------------------
/-------------UPDATE USER -----------
/---@body: [id, email,username]------
/------------------------------------
------------------------------------*/
exports.update = function(req, resp) {
  //Add required validation
  var contentType = req.headers['content-type'];
  var getData     = req.body || null;
  var getId       = req.body.id || 0;
  var getEmail    = req.body.email || '';
  var getUserName = req.body.username || '';
  //image upload processing
  var getApiImage =  req.body.profile_pic || null;
  delete req.body.id;
  var curSession  = req.session;

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
              theModel.findAll(
              { where: { 
                  id: getId                                            
                  }}).then(result => {
                    var recordData = result[0].dataValues;
                    if(result.length > 0){
                      var oldFileName     = recordData.filename;
                      if(oldFileName != null){
                        var filePath = variableDefined.serverPath.userUploadDir + oldFileName;
                        fs.unlinkSync(filePath);
                      }
                      var fileName        = getId + "_" + getData.first_name.toString().replace(/ +/g, "") + variableDefined.variables.user_picture_extension;
                      const path          = variableDefined.serverPath.userUploadDir + fileName;
                      const imgdata       = getApiImage;
                      const bufferSize    = Buffer.from(imgdata.substring(imgdata.indexOf(',') + 1));
                      const bufferLength  = bufferSize.length;
                      const uploadSize    = bufferSize.length / 1e+6;
                      if(uploadSize != null && uploadSize >= variableDefined.variables.user_picture_max_size){
                        resp.json({ message: variableDefined.variables.image_upload_max_size, status : 0 });
                        return;
                      }
                      // to convert base64 format into random filename
                      const base64Data  = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');
                      fs.writeFileSync(path, base64Data,  {encoding: variableDefined.variables.user_picture_upload_encoding});
                      //Add file name
                      getData.filename  = fileName;
                      //Update record with update profile photo
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
                        }).catch( (err) => {
                          resp.json({ message: variableDefined.variables.unhandledError, status : 0 });
                          return;
                        });
                    }                    
              }).catch( (err) => {
                resp.json({ message: variableDefined.variables.unhandledError, error: err, status : 0 });
                return;
              });              
            }else{
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
                }).catch( (err) => {
                  resp.json({ message: variableDefined.variables.unhandledError, error: err, status : 0 });
                  return;
                });
            }
          }
    }).catch( (err) => {
      resp.json({ message: variableDefined.variables.unhandledError, error: err, status : 0 });
      return;
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
  }).catch( (err) => {
    resp.json({ message: variableDefined.variables.unhandledError, error: err, status : 0 });
    return;
  });
};
