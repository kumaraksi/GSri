var apiai = require('apiai');
var bot = apiai("c41c4e59a37643edb66bd3a5650a2c44");
var request = require('request');
var knowledgeBase = require('../models/intelligenceFunctions');

function sendAnswerToUser(message, io) {
    var messageToUser = message.question;
    storeIntent(message);
    io.to(message.question.asked_by).emit("sendToUser", messageToUser);
}

function storeIntent(message, io) {
    var intentData = {
        "name": message.question.question,
        "auto": true,
        "userSays": [{
            "data": [{
                "text": message.question.question
            }],
        }],
        "responses": [{
            "resetContexts": false,
            "speech": message.question.answer
        }],
        "priority": 500000
    }

    var headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': 'Bearer 65d0f774434f4e00a986d278909300b5'
    };


    var options = {
        url: 'https://api.api.ai/v1/intents?v=20150910',
        method: 'POST',
        headers: headers,
        body: JSON.stringify(intentData)
    };

    function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body);
        }
    }

    request(options, callback);

}

function getAnswerFromBot(message, io) {
    var nlpRequest = bot.textRequest(message.content, {
        sessionId: 'fffff'
    });
    nlpRequest.on('response', function(nlpResponse) {
        var analyzedResponse = analyzeNlpResponse1(nlpResponse, message);
        var messageToPOC = {},
            messageToUser = {};
        messageToUser.question = message.content;
        messageToUser.departmentId = message.departmentId;
        messageToUser.asked_by = message.username;

        if (analyzedResponse.status === 404) {
            analyzedResponse.savedQuestion.then(function(data) {
                messageToPOC = data._doc;
                io.to(message.departmentId).emit('askPOC', messageToPOC);

                messageToUser = data._doc;
                io.to(message.username).emit("sendToUser", messageToUser);
            })
        } else {
            messageToUser.answer = analyzedResponse;
            io.to(message.username).emit("sendToUser", messageToUser);
        }
    });

    nlpRequest.on('error', function(error) {
        console.log("error : ::::::::::::::::::");
        console.log("response ::: ");
        console.log(error);
        return error;
        // console.log("request ::: ");
        // console.log(nlpRequest);
    });
    nlpRequest.end();
}

function analyzeNlpResponse1(response, question) {
    console.log('[TRACE] analyzeNlpResponse');
    var result = response.result;
    //console.log(result);
    if (result.score == 0) { //ADD TO NLP
        return {
            savedQuestion: sendQuestionToPOC(question),
            status: 404
        }
    } else {
        if (result.fulfillment.messages && result.fulfillment.messages.length > 0) {
            var messages = result.fulfillment.messages;
            var sendAnswers = [];
            messages.forEach(function(mssg) {
                sendAnswers.push(checkforMessageType(mssg));
            });
            return sendAnswers;
        } else {
            //amqpServer.publish("", "answer", new Buffer(response.result.fulfillment.speech));
            return response.result.fulfillment.speech != '' ? response.result.fulfillment.speech : 'I do not understand your question.';
        }
        //amqpServer.publish("", "answer", new Buffer(nlpResponse.toString()));
    }
}

function checkforMessageType(message) {
    console.log('[TRACE] checkforMessageType')


    switch (message.type) {
        case 0:
            //amqpServer.publish("", "answer", new Buffer(message.speech));
            return message.speech;
            break;
        case 3:
            //amqpServer.publish("", "answer", new Buffer(message.imageUrl));
            return message.imageUrl;
            break;

        case 2:
            //	amqpServer.publish("", "answer", new Buffer(message.speech));
            return message.speech;
            break;
        default:
            //amqpServer.publish("", "answer", new Buffer("Bhaag Bhosdike"));
            return "not found";

    }
}

function sendQuestionToPOC(question) {
    question.answer = "Stay tight. Calling in an expert for help. ";
    return knowledgeBase.storeQuestion(question);
}
module.exports = {
    getAnswerFromBot: getAnswerFromBot,
    sendAnswerToUser: sendAnswerToUser
}