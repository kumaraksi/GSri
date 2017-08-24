var api = require('./controllers/apiai');

module.exports = function(server) {
    var io = require('socket.io').listen(server);
    io.on('connection', function(socket) {
        console.log('a user connected');
        socket.on('disconnect', function() {
            console.log('user disconnected');
        });

        socket.on('askBot', function(mssg) {
            var message = api.getAnswerFromBot(mssg, io);
        });
    });
}