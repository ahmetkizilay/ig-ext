document.addEventListener('DOMContentLoaded', function() {

    var btnSignIn = document.getElementById("btnSignIn");
    btnSignIn.addEventListener('click', function () {
        var btn = $(this);
        btn.button('loading');

        $('.wait').show();

        chrome.extension.sendRequest({method: 'auth'}, function (result) {
            console.dir(result);

            if(result.result === 'OK') {
                location.href = '/pages/feed.html';
            }
            else {

                console.log('auth result is not OK');
                document.getElementById('lblError').innerHTML = 'oops! could not sign you in. try again later, please...';

                btn.button('reset');
                $('.wait').hide();

            }
        });
    });

});