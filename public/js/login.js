$('#login-form').submit(function(e) {
    e.preventDefault();
    var postData = {
        email: $('#email').val(),
        password: $('#password').val()
    }

    $.ajax({
        url: 'login',
        type: 'POST',
        data: postData,
        success: function(data, textStatus, jQxhr) {
            window.location = '/chat';
        },
        error: function(jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
});