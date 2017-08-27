(function() {
    var socket = io();

    var messages = [];

    var messageTemplate = {
        question: '',
        answer: '',
        asked_by: '',
        answered_by: '',
        departmentId: '',
        read_by_user: false,
        type: 'question or answer'
    }

    function initializeChatSettings() {
        if (loggedInUser) {
            localStorage.setItem('username', loggedInUser.username);
            localStorage.setItem('email', loggedInUser.email);
            if (loggedInUser.departmentPOC) {
                localStorage.setItem('departmentPOC', JSON.stringify(loggedInUser.departmentPOC));
            }
        }
        var departmentPOC = JSON.parse(localStorage.getItem('departmentPOC'));
        var username = localStorage.getItem('username');
        socket.emit('connection', "new user");
        socket.emit('subscribe', {
            departmentPOC: departmentPOC,
            username: username
        });
    }


    initializeChatSettings();

    $('#sendMessageBtn').on('click', function(e) {
        var mssg = $('#mssg').val();
        var departmentId = $("ul#myTab1 li.active a").data('departmentid');
        var username = localStorage.getItem('username');

        if (mssg) {
            var message = {
                content: mssg,
                departmentId: departmentId,
                username: username
            }
            socket.emit("askBot", message);
            var message = {
                question: mssg,
                answer: '',
                asked_by: username,
                answered_by: '',
                departmentId: departmentId,
                read_by_user: true,
                type: 'question'
            }
            messages.push(message);
            var messageHtml = "<li ><div class='sent'>" + message.question + "</div></li>"
            $('#message-list').append(messageHtml);
            $('#mssg').val('');
        }
    });

    socket.on('sendToUser', function(data) {
        var message = {
            id: data._id,
            question: data.content,
            answer: data.answer,
            asked_by: data.asked_by,
            answered_by: data.answered_by,
            departmentId: data.departmentId,
            read_by_user: data.read_by_user,
            type: 'answer'
        }
        messages.push(message);

        var messageHtml = "<li ><div class='recieved'>" + message.question + "</div></li>"
        $('#message-list').append(messageHtml);
    });

    socket.on('askPOC', function(data) {
        var message = {
            id: data._id,
            question: data.question,
            answer: data.answer,
            asked_by: data.asked_by,
            answered_by: data.answered_by,
            departmentId: data.departmentId,
            read_by_user: data.read_by_user,
            type: 'question'
        }
        messages.push(message);
        var messageHtml = "<li >" +
            "<div class='recieved " + message.type + "' data-id = '" + message.id + "' data-question = '" + message.question + "'> " + message.question + " </div>" +
            "</li>";
        $('#message-list').append(messageHtml);
    });

    $('#message-list').on('click', '.question', function(event) {
        window.selectedQuestion = event.target;
        $('#answerQuestion').modal({ show: true });
    });
    $('#answerQuestion').on('show.bs.modal', function(event) {
        var selectedQuestion = $(window.selectedQuestion) // Button that triggered the modal
        var title = selectedQuestion.data('question') // Extract info from data-* attributes
        var id = selectedQuestion.data('id')
        var modal = $(this)
        modal.find('.modal-title').text(title)
    })
    $('#submitAnswer').click(function(e) {
        var replyfromPOC = {
            answer: $('#answer').val(),
            link: $('#link').val(),
            questionid: $(window.selectedQuestion).data('id'),
            answered_by: localStorage.getItem('username')
        }
        $.ajax({
            url: 'answer',
            type: 'POST',
            data: replyfromPOC,
            success: function(data, textStatus, jQxhr) {
                $('#answerQuestion').modal('hide');
                socket.emit('answerSaved', data);
            },
            error: function(jqXhr, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });

    })
})();