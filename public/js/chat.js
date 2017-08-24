(function() {
    var socket = io();
    socket.emit('connection', "new user");

    $('#sendMessageBtn').on('click', function(e) {
        var mssg = $('#mssg').val();
        var departmentId = $("ul#myTab1 li.active a").data('departmentid');

        if (mssg) {
            var message = {
                content: mssg,
                departmentId: departmentId,

            }
            socket.emit("askBot", message);
            var messageHtml = "<li ><div class='sent'>" + message.content + "</div></li>"
            $('#message-list').append(messageHtml);
            $('#mssg').val('');
        }
    });

    socket.on('sendToUser', function(message) {
        var messageHtml = "<li ><div class='recieved'>" + message + "</div></li>"
        $('#message-list').append(messageHtml);
    });

})();