/**
 *Module dependencies
 */
var
    passport = require('passport'),
    config = require('./config'),
    User = require('../models/users'),
    utilities = require('../models/utilities');
/**
 *Module variables
 */
var
    host = config.host,
    errHandler = utilities.errHandler,
    LocalStrategy = require('passport-local').Strategy;
/**
 *Configuration and Settings
 */
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        if (err) {
            console.error('There was an error accessing the records of' +
                ' user with id: ' + id);
            return console.log(err.message);
        }
        return done(null, user);
    })
});
//---------------------------local login----------------------------------------
passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function(req, email, password, done) {
        User.findOne({ email: email }, function(err, user) {
            if (err) {
                return errHandler(err);
            }
            if (!user) {
                return done(null, false, {
                    errMsg: 'User does not exist, please' +
                        ' <a class="errMsg" href="/signup">signup</a>'
                });
            }
            if (!user.validPassword(password)) {
                return done(null, false, { errMsg: 'Invalid password try again' });
            }
            return done(null, user);
        });

    }));
/**
 *Export Module
 */
module.exports = passport;