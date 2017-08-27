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
    }

    var departmentId = $('#myTab1 li.active a').data('departmentid');

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
        var userData = {
            departmentPOC: departmentPOC,
            username: username
        }

        $.ajax({
            url: 'unreadQuestions',
            type: 'POST',
            data: userData,
            success: function(data, textStatus, jQxhr) {
                messages = data.messages;
                filterMessages(departmentId);
            },
            error: function(jqXhr, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });

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
                    _id: '1'
                }
                //messages.push(message);

            // var messageHtml = generateHTML(message, message._id)
            // $('#message-list').html(messageHtml);
            $('#mssg').val('');
        }
    });

    socket.on('sendToUser', function(data) {
        var message = {
            _id: data._id,
            question: data.question,
            answer: data.answer,
            asked_by: data.asked_by,
            answered_by: data.answered_by,
            departmentId: data.departmentId,
            read_by_user: data.read_by_user
        }
        updateMessageModel(message);
        //messages.push(message);
        filterMessages(departmentId);
    });

    socket.on('askPOC', function(data) {
        var message = {
            _id: data._id,
            question: data.question,
            answer: data.answer,
            asked_by: data.asked_by,
            answered_by: data.answered_by,
            departmentId: data.departmentId,
            read_by_user: data.read_by_user
        }
        updateMessageModel(message);
        //messages.push(message);
        filterMessages(departmentId);
    });

    function updateMessageModel(newMessage) {
        var found = 0;
        for (var index = 0; index < messages.length; index++) {
            var message = messages[index];
            if (message._id === newMessage._id) {
                messages[index] = newMessage;
                found = 1
                break;
            }
        }
        if (found === 0) {
            messages.push(newMessage);
        }
    }
    $('#message-list').on('click', '.answerBtn', function(event) {
        window.selectedQuestion = this;
        $('#answerQuestion').modal({
            show: true
        });
    });

    $('#answerQuestion').on('show.bs.modal', function(event) {
        var selectedQuestion = $(window.selectedQuestion) // Button that triggered the modal
        var title = selectedQuestion.data('question') // Extract info from data-* attributes
        var id = selectedQuestion.data('id')
        var modal = $(this)
        modal.find('.modal-title').text(title)
    });

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
                updateMessageModel(data.question);
                //messages.push(message);
                filterMessages(departmentId);

                $('#answerQuestion').modal('hide');
                socket.emit('answerSaved', data);
            },
            error: function(jqXhr, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });

    });

    $('#myTab1 a').click(function(e) {
        departmentId = this.dataset.departmentid;
        filterMessages(departmentId);
    });

    function filterMessages(departmentId) {
        var filterMessagesByDepartment = [];
        var filterMessagesByDepartmentHTML = '';
        var count = {
            hr: 0,
            it: 0,
            corp: 0,
            finance: 0,
            ess: 0
        }
        messages.forEach(function(mssg, index) {
            if (mssg.departmentId == departmentId) {
                filterMessagesByDepartment.push(mssg);
                filterMessagesByDepartmentHTML += generateHTML(mssg, index);
            }
            getUnreadMessagesCount(mssg, count);
        });
        if (filterMessagesByDepartment.length > 0) {
            $('#message-list').html(filterMessagesByDepartmentHTML);
        } else {
            $('#message-list').html(generateEmptyHTML());
        }
        updateUnreadMessagesCounter(count);
    }

    function getUnreadMessagesCount(message, count) {
        var lookupfield = typeof departmentPOC != 'undefined' && departmentPOC.length > 0 ? 'isAnswered' : 'readByUser';
        var departmentId = message.departmentId;
        if (message[lookupfield] === false) {
            switch (departmentId) {
                case 1:
                    count.hr++;
                    break;
                case 2:
                    count.it++;
                    break;
                case 3:
                    count.corp++;
                    break;
                case 4:
                    count.finance++;
                    break;
                case 5:
                    count.ess++;
                    break;
                default:
                    break;
            }
        }
    }

    function updateUnreadMessagesCounter(count) {
        $('#hr-badge').text(count.hr);
        $('#it-badge').text(count.it);
        $('#corp-badge').text(count.corp);
        $('#finance-badge').text(count.finance);
        $('#ess-badge').text(count.ess);
        $('ul#myTab1 .badge').each(function(index) {
            var el = $(this)
            if (el.text() == 0) {
                el.addClass('hidden');
            } else {
                el.removeClass('hidden');
            }
        })
    }

    function generateHTML(message, index) {
        var messageHtml = '   <li><div class="panel-group panel-group-lists collapse in">  ' +
            '   	<div class="panel">  ' +
            '   	<div class="panel-heading">  ' +
            '   		<h4 class="panel-title">  ' +
            '   		<a data-toggle="collapse" data-parent="#' + index + '" href="#' + index + '">' + message.question +
            '   		</a>  ' +
            '   		</h4>  ' +
            '   	</div>  ' +
            '   	<div id="' + index + '" class="panel-collapse collapse in">  ' +
            '   		<div class="panel-body">  ' + message.answer +
            '   		</div>  ' +
            '   	</div>  ' +
            '<div class="panel-footer">';
        if (localStorage.getItem('departmentPOC').indexOf(message.departmentId) > -1) {
            messageHtml += '<button class="btn btn-primary answerBtn btn-xs pull-right" data-id = "' + (message._id) + '" data-question="' + message.question + '">Answer Question</button>'
        }
        messageHtml += '</div>' +
            '   	</div>  ' +
            '  </div> </li>';
        // var messageHtml = "<li >" +
        //     "<div class='recieved " + message.type + "' data-id = '" + message._id + "' data-question = '" + message.question + "'> " + message.question + " </div>" +
        //     "</li>";
        return messageHtml;
    }

    function generateEmptyHTML() {
        var messageHtml = "<div class='well'<p>No messages yet</p></div>";
        return messageHtml;
    }
})();