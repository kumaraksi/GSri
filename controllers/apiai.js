var apiai = require('apiai');
var bot = apiai("c41c4e59a37643edb66bd3a5650a2c44");

function getAnswerFromBot(message, io) {
    var nlpRequest = bot.textRequest(message.content, {
        sessionId: 'fffff'
    });
    nlpRequest.on('response', function(nlpResponse) {
        var analyzedResponse = analyzeNlpResponse1(nlpResponse);
        io.sockets.emit("sendToUser", analyzedResponse);
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

function analyzeNlpResponse1(response) {
    console.log('[TRACE] analyzeNlpResponse');
    var result = response.result;
    //console.log(result);
    if (result.score == 0) { //ADD TO NLP
        return 'I am currently in learning phase. I do not understand your question.'
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

module.exports = {
    getAnswerFromBot: getAnswerFromBot
}