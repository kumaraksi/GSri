/**
 *Module dependencies
 */
var
    express = require('express'),
    passport = require('../config/passport'),
    utilities = require('../models/utilities');
//==============================================================================
/**
 *Create router instance
 */
var router = express.Router();
//==============================================================================
/**
 *Module Variables
 */
//needed to protect the '/dashboard' route
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.redirect('/login');
}

var
    errHandler = utilities.errHandler,
    validationErr = utilities.validationErr,
    cr8NewUser = utilities.cr8NewUser,
    findUser = utilities.findUser,
    viewAllUsers = utilities.viewAllUsers,
    updateUser = utilities.updateUser,
    deleteUser = utilities.deleteUser;
//==============================================================================
/**
 *Middleware
 */
router.use(passport.initialize());
router.use(passport.session());
//---------------------------App routes-----------------------------------------
router.get('/', function(req, res) {
    return res.render('pages/login');
});

router.route('/login')
    .get(function(req, res) {
        return res.render('pages/login');
    })
    .post(function(req, res, next) {
        passport.authenticate('local-login', function(err, user, info) {
            if (err) {
                return next(err); // will generate a 500 error
            }
            if (!user) {
                return res.status(409).render('pages/login', { errMsg: info.errMsg });
            }
            req.login(user, function(err) {
                if (err) {
                    console.error(err);
                    return next(err);
                }
                return res.redirect('/chat');
            });
        })(req, res, next);
    });

router.get('/chat', isLoggedIn, function(req, res) {
    return res.render('pages/chat', {
        username: req.user.username,
        email: req.user.email
    });
});

router.get('/logout', function(req, res) {
    req.logout();
    req.session.destroy();
    return res.redirect('/');
});
//---------------------------API routes-----------------------------------------
router.get('/api/users', function(req, res) {
    return viewAllUsers(req, res);
});

router.route('/api/users/:email')
    .get(function(req, res) {
        return findUser(req, res);
    })
    .put(function(req, res) {
        return update(req, res);
    })
    .delete(function(req, res) {
        return deleteUser(req, res);
    });
//==============================================================================
/**
 *Export Module
 */
module.exports = router;
//==============================================================================