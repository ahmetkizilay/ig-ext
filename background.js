var config = {
    'client_id': 'dbe12e2ba0eb420f97f0a9af9ace03af',
    'access_token_link': 'http://localhost:2424/step_two'
};

var app = (function (config) {
    var _app_id = chrome.runtime.id;
    var _redirect_uri = 'https://' + _app_id + '.chromiumapp.org/oauth-redirect.html';
    var _oauth_link = 'https://api.instagram.com/oauth/authorize/?client_id=' + config.client_id + '&redirect_uri=' + encodeURIComponent(_redirect_uri) + '&response_type=code';
    
    var _user_data = {};

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

    var _fn_api = function (path, callback) {
        var method = 'GET';
        var url = 'https://api.instagram.com/v1' + path;
        params = 'access_token=' + encodeURIComponent(_user_data.access_token);
        url += '?' + params;

        var onsuccess = function(response) {
            var responseJSON = JSON.parse(response);
            callback(responseJSON);
        };
        var onfail = function (status, response) {
            console.log(status, response);
        };
        
        _fn_sendHttpRequest(method, url, null, onsuccess, onfail);
    };

    var _fn_setup = function () {
        chrome.storage.local.get('user_data', function (res) {
            _user_data = res.user_data;
        });
    };

    return {
        authenticate: _fn_authenticate,
        api: _fn_api,
        setup: _fn_setup
    };
})(config);

chrome.extension.onRequest.addListener(function (request, tab, sendRequest) {
    if(request.method === 'auth') {
        app.authenticate(function (result) {
            sendRequest(result);
        });
    }

    if(request.method === 'api') {
        var path = request.path;
        app.api(path, function (result) {
            sendRequest(result);
        });
    }
});

app.setup();