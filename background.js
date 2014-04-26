Array.prototype.firstMatch = function(fn) {
    var i, len = this.length;

    for(i = 0; i < len; i += 1) {
        if(fn.call(this, this[i])) {
            return this[i];
        }
    }

    return null;
};

var config = {
    'client_id': 'dbe12e2ba0eb420f97f0a9af9ace03af',
    'access_token_link': 'http://localhost:2424/step_two'
};

var api = (function () {
    var _base_url = 'https://api.instagram.com/v1';
    var _methods = {};

    var _fn_buildParamString = function (parameters) {
        var keys = Object.keys(parameters);
        var output = '';

        keys.forEach(function (key) {
            output += key + '=' + encodeURIComponent(parameters[key]) + '&';
        });

        return output.slice(0, -1);
    };

    var _fn_sendHttpRequest = function(method, url, params, onsuccess, onfail) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, url, true);

        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        xhr.onreadystatechange = function () {

            if(xhr.readyState === 4) {
                if(xhr.status === 200) {
                    onsuccess(xhr.responseText);
                } else {
                    onfail(xhr.status, xhr.responseText);
                }
            }

        };

        xhr.send(params);
    };


    _methods._users_self_feed = function () {
        var parameters = arguments[0];
        var onsuccess = arguments[1];
        var onfail = arguments[2];

        var method = 'GET';
        var endpoint = '/users/self/feed/';
        var paramString = _fn_buildParamString(parameters);

        var url = _base_url + endpoint + '?' + paramString;

        _fn_sendHttpRequest(method, url, null, onsuccess, onfail);
    };

    return _methods;
})();

var app = (function (config) {
    var _app_id = chrome.runtime.id;
    var _redirect_uri = 'https://' + _app_id + '.chromiumapp.org/oauth-redirect.html';
    var _oauth_link = 'https://api.instagram.com/oauth/authorize/?client_id=' +
                       config.client_id + '&redirect_uri=' +
                       encodeURIComponent(_redirect_uri) +
                       '&response_type=code&scope=comments+likes';
    
    var _user_data = {};

    var _cached_data = {};
    _cached_data.feed = [];

    var _fn_extractParamFromUrl = function (url, id) {
        var exp = new RegExp(id + "=([^&#=]*)"),
            res = exp.exec(url);

        if(res.length > 1) {
            return res[1];
        }

        return null;
    };

    var _fn_authenticate = function (callback) {
        console.log('authenticate starts here');

        chrome.identity.launchWebAuthFlow({
            'url': _oauth_link,
            'interactive': true
        }, function (redirect_url) {

            if(redirect_url === undefined) {
                // TODO: Handle this later
                console.log('redirect_url is undefined');
                return;
            }

            var code = _fn_extractParamFromUrl(redirect_url, 'code');
            if(code === null) {
                console.log('code param not received');
                return;
            }

            _fn_handle_oauth_second_step(code, callback);
        });
    };

    var _fn_handle_oauth_second_step = function (code, callback) {
        var url = config.access_token_link + '?code=' + code;
        var onsuccess = function (access_data) {
            var accessJSON = JSON.parse(access_data);

            _user_data.access_token = accessJSON.access_token;
            _user_data.username = accessJSON.user.username;
            _user_data.full_name = accessJSON.user.full_name;
            _user_data.profile_picture = accessJSON.user.profile_picture;

            chrome.storage.local.set({'user_data': _user_data}, function () {
                console.log('stored user data in storage');

                if(callback) {
                    callback({'result': 'OK'});
                }

            });

        };
        var onfail = function (status, msg) {
            console.log('error: status ' + status);
            console.log('error: msg' + msg);

            if(callback) {
                callback({'result': 'ERR', 'status': status, 'msg': msg});
            }

        };

        _fn_sendHttpRequest('GET', url, null, onsuccess, onfail);
    };

    var _fn_sendHttpRequest = function(method, url, params, onsuccess, onfail) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, url, true);

        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        xhr.onreadystatechange = function () {

            if(xhr.readyState === 4) {
                if(xhr.status === 200) {
                    onsuccess(xhr.responseText);
                } else {
                    onfail(xhr.status, xhr.responseText);
                }
            }

        };

        xhr.send(params);
    };

    var _fn_getOwnFeed = function(callback) {
        var parameters = {
            'access_token': _user_data.access_token
        };

        var onsuccess = function(response) {
            var responseJSON = JSON.parse(response);
            Array.prototype.push.apply(_cached_data.feed, responseJSON.data);
            console.log('cache size: '  + _cached_data.feed.length);
            callback({'success': true, 'response': JSON.parse(response)});
        };

        var onfail = function(status, msg) {
            console.log('getOwnFeed returned error: ', status, msg);
            callback({'success': false});
        };

        api['_users_self_feed'].call(api, parameters, onsuccess, onfail);
    };

    var _fn_getCachedPhotoData = function (pid) {
        var pData = _cached_data.feed.firstMatch(function (item) {
            console.log(item.id);
            return item.id === pid;
        });

        if(pData) {
            return pData;
        }
        else {
            return {found: false};
        }
    };

    var _fn_setup = function () {
        chrome.storage.local.get('user_data', function (res) {
            if(res.user_data) {
                _user_data = res.user_data;
            }
        });
    };

    return {
        authenticate: _fn_authenticate,
        getOwnFeed: _fn_getOwnFeed,
        getCachedPhotoData: _fn_getCachedPhotoData,
        setup: _fn_setup
    };
})(config);

chrome.extension.onRequest.addListener(function (request, tab, sendRequest) {
    if(request.method === 'auth') {
        app.authenticate(function (result) {
            sendRequest(result);
        });
    }

    if(request.method === 'ownfeed') {
        app.getOwnFeed(sendRequest);
    }

    if(request.method === 'photo') {
        sendRequest(app.getCachedPhotoData(request.pid));
    }
});

app.setup();