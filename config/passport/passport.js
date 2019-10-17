//load bcrypt
var bCrypt = require('bcrypt-nodejs');
 
const passportJWT = require("passport-jwt");
const JWTStrategy   = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const passport = require('passport')
const db                    = require("../../api/models");
const UserModel             = db.user; 


// passport.use(new JWTStrategy({
//         jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
//         secretOrKey   : '123456'
//     },
//     function (jwtPayload, cb) {

//         //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
//         return UserModel.findOneById(jwtPayload.id)
//             .then(user => {
//                 return cb(null, user);
//             })
//             .catch(err => {
//                 return cb(err);
//             });
//     }
// ));


const LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, 
    function (email, password, cb) {
        //this one is typically a DB call. Assume that the returned user object is pre-formatted and ready for storing in JWT
        console.log('check password....');
        return UserModel.findOne({email, password})
           .then(user => {
               if (!user) {
                   return cb(null, false, {message: 'Incorrect email or password.'});
               }
               return cb(null, user, {message: 'Logged In Successfully'});
          })
          .catch(err => cb(err));
    }
));




/*
module.exports = function(passport, user) {
  
    var User = user;
    var LocalStrategy = require('passport-local').Strategy;


    


  
    passport.use('local-signup', new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) {
             var generateHash = function(password) {
                 return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);
             };
 
            User.findOne({
                where: {
                    email: email
                }
            }).then(function(user) {
 
                if (user)
                {
                    return done(null, false, {
                        message: 'That email is already taken'
                    });
                }else
                {
 
                    var userPassword = generateHash(password);
 
                    var data =
 
                        {
                            email: email,
 
                            password: userPassword,
 
                            firstname: req.body.firstname,
 
                            lastname: req.body.lastname
 
                        };
 
                    User.create(data).then(function(newUser, created) {
 
                        if (!newUser) {
 
                            return done(null, false);
 
                        }
 
                        if (newUser) {
 
                            return done(null, newUser);
 
                        }
 
                    });
 
                }
 
            });
 
        }
 
    ));
 
}
*/