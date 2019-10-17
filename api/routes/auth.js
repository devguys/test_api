var authController = require('../controller/auth/authController');
var userController = require('../controller/user');


const express = require('express');
const router  = express.Router();
const jwt = require('jsonwebtoken');
const passport = require("../../config/passport/passport");
/* POST login. */
router.post('/login', function (req, res, next) {
    passport.authenticate('local', {session: false}, (err, user, info) => {
        if (err || !user) {
            return res.status(400).json({
                message: 'Something is not right',
                user   : user
            });
        }
       req.login(user, {session: false}, (err) => {
           if (err) {
               res.send(err);
           }
           // generate a signed son web token with the contents of user object and return it in the response
           const token = jwt.sign(user, '123456');
           return res.json({user, token});
        });
    })(req, res);
});





/*
module.exports = function(app, passport) {
 
    app.get('/signup', authController.signup);
    app.get('/signin', authController.signin);
    app.post('/signup', passport.authenticate('local-signup', {
            successRedirect: '/dashboard',
             failureRedirect: '/signup'
        }
     ));
 
     app.route('/user')
     .get(userController.getList)
     .delete(userController.delete)
     //.put(userController.update)        
     .post(userController.validate('create'),userController.create)  
    app.put('/user', userController.validate('update'),userController.update);
}*/