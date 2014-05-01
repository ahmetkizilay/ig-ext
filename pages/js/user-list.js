var user_list = (function (d) {

    var _fn_contructUserDiv = function (parent, user) {
        var div = d.createElement('div');
        div.className = 'user';

        var aImage = d.createElement('a');
        aImage.href = '#';
        aImage.className = 'link-profile';
        aImage.setAttribute('data-uid', user.id);
        aImage.setAttribute('data-uname', user.username);

        var img = d.createElement('img');
        img.src = user.profile_picture;
        aImage.appendChild(img);

        div.appendChild(aImage);

        var aUser = d.createElement('a');
        aUser.className = 'link-profile';
        aUser.href = '#';
        aUser.setAttribute('data-uid', user.id);
        aUser.setAttribute('data-uname', user.username);
        aUser.innerHTML = user.username;

        div.appendChild(aUser);

        var lblUserFullName = d.createElement('label');
        lblUserFullName.innerHTML = '(' + user.full_name + ')';
        div.appendChild(lblUserFullName);

        parent.appendChild(div);

    };

    var _fn_constructHeaderDiv = function (pid) {
        var header = d.getElementsByClassName('header')[0];
        
        var aImage = d.createElement('a');
        aImage.href = '#';
        aImage.setAttribute('data-pid', pid);
        aImage.className = 'link-photo';
        aImage.addEventListener('click', function () {
            location.href = '/pages/photo.html?pid=' + this.getAttribute('data-pid');
        });

        var img = d.createElement('img');
        
        aImage.appendChild(img);
        header.appendChild(aImage);

        var div = d.createElement('div');

        var span = d.createElement('span');
        
        var lblFirst = d.createElement('label');
        lblFirst.innerHTML = 'users who liked&nbsp;';

        var aUser = d.createElement('a');
        aUser.href = '#';
                
        var lblLast = d.createElement('label');
        lblLast.innerHTML = '\'s post';

        span.appendChild(lblFirst);
        span.appendChild(aUser);
        span.appendChild(lblLast);

        div.appendChild(span);
        header.appendChild(div);

        chrome.extension.sendRequest({method: 'photo', 'pid': pid}, function (response) {

            if(!response.success) {
                console.log('could not find the image');
                return;
            }

            var media = response.data;

            aUser.innerHTML = '@' + media.user.username;
            aUser.setAttribute('data-uname', media.user.username);
            aUser.setAttribute('data-uid', media.user.id);
            aUser.className = 'link-profile';
            common.createProfileLinks();

            img.src = media.images.standard_resolution.url;
        });
    };

    var _fn_setup = function(params) {
        var type = params.type;
        var pid =  params.pid;
        var uname = params.uname;

        _fn_constructHeaderDiv(pid, uname);

        chrome.extension.sendRequest({method: 'get-likes', 'pid': pid}, function (response) {
            if(!response.success) {
                console.log(response.err);
                var errJSON = JSON.parse(response.err);
                console.dir(errJSON);

                if(errJSON.meta && errJSON.meta.error_type == 'APINotAllowedError') {
                    NOTIFY.notify(errJSON.meta.error_message, {
                        parent: d.getElementsByTagName('body')[0],
                        top: 60,
                        level: 'error'
                    });
                }
                return;
            }

            var likers = response.data;
            var divUsers = d.getElementsByClassName('users')[0];

            likers.forEach(function (liker) {
                _fn_contructUserDiv(divUsers, liker);
            });

            common.createProfileLinks();

        });
    };

    return {
        setup: _fn_setup
    };
})(document);

document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get('user_data', function (res) {
        var user_data = res.user_data;

        if(!user_data) {
            // redirect to the login page
            location.href = '/pages/login.html';
            return;
        }
    
        common.setupNavigation();

        var lblProfile = document.getElementById("lblProfile");
        lblProfile.innerHTML = user_data.full_name;

        var imgProfile = document.getElementById('imgProfile');
        imgProfile.src = user_data.profile_picture;

        var queryParams = common.getQueryParams(location.search);
        user_list.setup(queryParams);

    });
});