/**
 *Module dependencies
 */
var
    express = require('express'),
    passport = require('../config/passport'),
    utilities = require('../models/utilities'),
    knowledgeBase = require('../models/intelligenceFunctions'),
    apiai = require('../controllers/apiai');
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
    deleteUser = utilities.deleteUser,
    addAnswerToQuestion = knowledgeBase.addAnswerToQuestion,
    findQuestionById = knowledgeBase.findQuestionById,
    unreadQuestions = knowledgeBase.unreadQuestions;

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
        //cr8NewUser(req, res);
        passport.authenticate('local-login', function(err, user, info) {
            if (err) {
                return next(err); // will generate a 500 error
            }
            if (!user) {
                return res.status(409).render('pages/login', {
                    errMsg: info.errMsg
                });
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
        email: req.user.email,
        user: req.user
    });
});

router.post('/answer', isLoggedIn, function(req, res) {
    addAnswerToQuestion(req, res);
});

router.post('/unreadQuestions', isLoggedIn, function(req, res) {
    unreadQuestions(req, res);
});


router.get('/logout', function(req, res) {
    req.logout();
    req.session.destroy();
    return res.redirect('/');
});
//==============================================================================
/**
 *Export Module
 */
module.exports = router;
//==============================================================================