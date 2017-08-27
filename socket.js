var api = require('./controllers/apiai');

module.exports = function(server) {
    var io = require('socket.io').listen(server);
    io.on('connection', function(socket) {
        console.log('a user connected');
        socket.on('subscribe', function(data) {
            socket.join(data.username);
            if (data.departmentPOC.length) {
                data.departmentPOC.forEach(function(department) {
                    socket.join(department)
                }, this);
            }
        })
        socket.on('disconnect', function() {
            console.log('user disconnected');
        });
        socket.on('answerSaved', function(data) {
            api.sendAnswerToUser(data, io);
        })
        socket.on('askBot', function(mssg) {
            var message = api.getAnswerFromBot(mssg, io);
        });
    });
}