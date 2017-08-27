/**
 *Module dependencies
 */
var IntelligenceModel = require('./intelligence');
// var apiai = require('../controllers/apiai');
//==============================================================================
/**
 *User Model Utility functions
 */
function errHandler(err) {
    console.error('There was an error performing the operation');
    console.log(err);
    console.log(err.code);
    return console.error(err.message);
}

function validationErr(err, res) {
    Object.keys(err.errors).forEach(function(k) {
        var msg = err.errors[k].message;
        console.error('Validation error for \'%s' + ': %s', k, msg);
        return res.status(404).json({
            msg: 'Please ensure required fields are filled'
        });
    });
}

function storeQuestion(message) {
    return IntelligenceModel.create({
        question: message.content,
        departmentId: message.departmentId,
        asked_by: message.username,
        answer: message.answer
    }, function(err, question) {
        if (err) {
            console.error('There was an error storing Question');
            console.error(err.code);
            console.error(err.name);
            if (err.name == 'ValidationError') {
                return validationErr(err, res);
            } else {
                return errHandler(err);
            }
        }
        console.log('Question successfully stored');
        return { 'question': question }
    })
}

function addAnswerToQuestion(req, res) {
    var message = req.body;
    return IntelligenceModel.where({ _id: message.questionid }).update({
        answer: message.answer,
        answered_by: message.answered_by,
        isAnswered: true
    }, function(err) {
        if (err) {
            console.error('There was an error storing Question');
            console.error(err.code);
            console.error(err.name);
            if (err.name == 'ValidationError') {
                return validationErr(err, res);
            } else {
                return errHandler(err);
            }
        }
        findQuestionById(req, res).then(function(data) {
            res.status(200).json({
                question: data._doc
            });
        })
    });
}

function unreadQuestions(req, res) {
    var username = req.body.username;
    var message = req.body;
    var whereClause = [];
    var unreadQuestions = {
        asked_by: username,
        readByUser: false
    }
    whereClause.push(unreadQuestions);
    if (req.body.departmentPOC) {
        var unansweredQuestions = {
            departmentId: { "$in": req.body.departmentPOC },
            isAnswered: false
        }
        whereClause.push(unansweredQuestions);
    }
    return IntelligenceModel.find({ $or: whereClause },
        function(err, data) {
            if (err) return errHandler(err);
            res.status(200).json({
                messages: data
            });
        });
}

function findQuestionById(req, res) {
    return IntelligenceModel.findById(req.body.questionid);
}
//==============================================================================
/**
 * Export module
 */
module.exports = {
    errHandler: errHandler,
    validationErr: validationErr,
    storeQuestion: storeQuestion,
    addAnswerToQuestion: addAnswerToQuestion,
    findQuestionById: findQuestionById,
    unreadQuestions: unreadQuestions
};
//==============================================================================