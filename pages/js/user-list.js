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
        lblUserFullName.innerHTML = user.full_name ? '(' + user.full_name + ')' : '';
        div.appendChild(lblUserFullName);

        parent.appendChild(div);

    };

    var _fn_constructUserSearchHeader = function (uname) {
        var header = d.getElementsByClassName('header')[0];

        var label = d.createElement('label');
        label.innerHTML = 'users matching&nbsp;';
        label.className += ' user-search';

        var label2 = d.createElement('label');
        label2.innerHTML = uname;
        label2.className += ' user-search query';

        header.appendChild(label);
        header.appendChild(label2);
    };

    var _fn_constructLikerHeader = function (pid) {
        var header = d.getElementsByClassName('header')[0];
        
        var aImage = d.createElement('a');
        aImage.href = '#';
        aImage.setAttribute('data-pid', pid);
        aImage.className = 'link-photo';

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

            img.src = media.images.standard_resolution.url;
        });
    };

    var _fn_constructFollowHeader = function (uid, uname, statement) {
        var header = d.getElementsByClassName('header')[0];
        
        var aImage = d.createElement('a');
        aImage.href = '#';
        aImage.setAttribute('data-uid', uid);
        aImage.setAttribute('data-uname', uname);
        aImage.className = 'link-profile';

        var img = d.createElement('img');
        
        aImage.appendChild(img);
        header.appendChild(aImage);

        var div = d.createElement('div');

        var span = d.createElement('span');

        var lblFirst = d.createElement('label');
        lblFirst.innerHTML = statement + '&nbsp;';

        var aUser = d.createElement('a');
        aUser.href = '#';

        span.appendChild(lblFirst);
        span.appendChild(aUser);

        div.appendChild(span);
        header.appendChild(div);

        chrome.extension.sendRequest({method: 'user', 'uid': uid}, function (response) {

            if(!response.success) {
                console.log('could not find the image');
                return;
            }

            var user = response.data;

            aUser.innerHTML = '@' + user.username;
            aUser.setAttribute('data-uname', user.username);
            aUser.setAttribute('data-uid', user.id);
            aUser.className = 'link-profile';

            img.src = user.profile_picture;
        });
    };

    var _fn_handleResponse = function (response) {
        var divLoadMore = d.getElementsByClassName('load-more')[0];

        var btnLoadMore = divLoadMore.getElementsByTagName('button')[0];
        var imgLoadMore = divLoadMore.getElementsByTagName('img')[0];
        imgLoadMore.style.display = 'none';
        btnLoadMore.disabled = false;

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

        var users = response.value.data;
        var divUsers = d.getElementsByClassName('users')[0];

        users.forEach(function (user) {
            _fn_contructUserDiv(divUsers, user);
        });

        common.createProfileLinks();

        if(response.value.pagination && response.value.pagination.next_cursor) {
            btnLoadMore.setAttribute('data-cursor', response.value.pagination.next_cursor);
        }
        else {
            btnLoadMore.removeAttribute('data-cursor');
            btnLoadMore.disabled = true;
        }

        NOTIFY.notify('retrieved ' + users.length + ' more users', {
            parent: d.getElementsByTagName('body')[0],
            top: 60
        });
    };

    var _fn_buildLikers = function (params, callback) {
        var uname = params.uname;
        var pid = params.pid;

        _fn_constructLikerHeader(pid, uname);

        var btnLoadMore = d.getElementsByClassName('load-more')[0].getElementsByTagName('button')[0];
        btnLoadMore.addEventListener('click', function () {
            // there is no cursor information for likes
        });

        chrome.extension.sendRequest({method: 'get-likes', 'pid': pid}, callback);
    };

    var _fn_buildFollowedBy = function (params, callback) {
        var uname = params.uname;
        var uid = params.uid;

        _fn_constructFollowHeader(uid, uname, 'users who follow');

        var btnLoadMore = d.getElementsByClassName('load-more')[0].getElementsByTagName('button')[0];
        btnLoadMore.addEventListener('click', function () {
            var cursor = this.getAttribute('data-cursor');
            if(!cursor) {
                return;
            }

            var divLoadMore = this.parentNode;
            var imgLoadMore = divLoadMore.getElementsByTagName('img')[0];
            imgLoadMore.style.display = 'inline';

            this.disabled = true;

            var parameters = {
                'method': 'get-followedby',
                'uid': uid,
                'cursor': cursor
            };

            chrome.extension.sendRequest(parameters, callback);
        });

        chrome.extension.sendRequest({method: 'get-followedby', 'uid': uid}, callback);
    };

    var _fn_buildFollows = function (params, callback) {
        var uname = params.uname;
        var uid = params.uid;

        var btnLoadMore = d.getElementsByClassName('load-more')[0].getElementsByTagName('button')[0];
        btnLoadMore.addEventListener('click', function () {
            var cursor = this.getAttribute('data-cursor');
            if(!cursor) {
                return;
            }

            var divLoadMore = this.parentNode;
            var imgLoadMore = divLoadMore.getElementsByTagName('img')[0];
            imgLoadMore.style.display = 'inline';
            
            this.disabled = true;

            var parameters = {
                'method': 'get-follows',
                'uid': uid,
                'cursor': cursor
            };

            chrome.extension.sendRequest(parameters, callback);
        });

        _fn_constructFollowHeader(uid, uname, 'users followed by');

        chrome.extension.sendRequest({method: 'get-follows', 'uid': uid}, callback);
    };

    var _fn_buildUserSearch = function (params, callback) {
        var qUname = params.q;

        var btnLoadMore = d.getElementsByClassName('load-more')[0].getElementsByTagName('button')[0];
        btnLoadMore.addEventListener('click', function () {
            var cursor = this.getAttribute('data-cursor');
            if(!cursor) {
                return;
            }

            var divLoadMore = this.parentNode;
            var imgLoadMore = divLoadMore.getElementsByTagName('img')[0];
            imgLoadMore.style.display = 'inline';
            
            this.disabled = true;

            var parameters = {
                'method': 'search-user',
                'uname': qUname,
                'cursor': cursor
            };

            chrome.extension.sendRequest(parameters, callback);
        });

        _fn_constructUserSearchHeader(qUname);

        chrome.extension.sendRequest({method: 'search-user', 'uname': qUname}, callback);
    };

    var _fn_setup = function(params) {

        switch(params.type) {
            case 'like':
                _fn_buildLikers(params, _fn_handleResponse);
                break;
            case 'followed-by':
                _fn_buildFollowedBy(params, _fn_handleResponse);
                break;
            case 'follows':
                _fn_buildFollows(params, _fn_handleResponse);
                break;
            case 'search-user':
                _fn_buildUserSearch(params, _fn_handleResponse);
                break;
            default:
                break;
        }

        common.createPhotoLinks();
        common.createProfileLinks();

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
        common.setupHeader(user_data);
        common.setupSearch();

        var queryParams = common.getQueryParams(location.search);
        user_list.setup(queryParams);

    });
});