document.addEventListener('DOMContentLoaded', function() {

    var btnSignIn = document.getElementById("btnSignIn");
    var imgWait = document.getElementsByClassName('wait')[0];
    var lblError = document.getElementById('lblError');

    btnSignIn.addEventListener('click', function () {
        var origTxt = btnSignIn.innerHTML;
        btnSignIn.innerHTML = btnSignIn.getAttribute('data-wait-text');
        lblError.innerHTML = '';
        imgWait.style.display = 'inline';

        chrome.extension.sendRequest({method: 'auth'}, function (result) {
            console.dir(result);

            if(result.result === 'OK') {
                location.href = '/pages/feed.html';
            }
            else {

                lblError.innerHTML = 'oops! could not sign you in. try again later, please...';

                btnSignIn.innerHTML = origTxt;
                imgWait.style.display = 'none';

            }
        });
    });

});