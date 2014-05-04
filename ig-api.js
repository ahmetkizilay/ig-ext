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

    _methods.get_users_userid_media_recent = function () {
        var user_id = arguments[0];
        var parameters = arguments[1];
        var onsuccess = arguments[2];
        var onfail = arguments[3];

        var method = 'GET';
        var endpoint = '/users/' + user_id + '/media/recent/';
        var paramString = _fn_buildParamString(parameters);

        var url = _base_url + endpoint + '?' + paramString;

        _fn_sendHttpRequest(method, url, null, onsuccess, onfail);
    };

    _methods.post_media_mediaid_likes = function() {
        var media_id = arguments[0];
        var parameters = arguments[1];
        var onsuccess = arguments[2];
        var onfail = arguments[3];

        var method = 'POST';
        var endpoint = '/media/' + media_id + '/likes';
        var paramString = _fn_buildParamString(parameters);

        var url = _base_url + endpoint;

        _fn_sendHttpRequest(method, url, paramString, onsuccess, onfail);
    };

    _methods.del_media_mediaid_likes = function() {
        var media_id = arguments[0];
        var parameters = arguments[1];
        var onsuccess = arguments[2];
        var onfail = arguments[3];

        var method = 'DELETE';
        var endpoint = '/media/' + media_id + '/likes';
        var paramString = _fn_buildParamString(parameters);

        var url = _base_url + endpoint + '?' + paramString;

        _fn_sendHttpRequest(method, url, paramString, onsuccess, onfail);
    };

    _methods.get_users_userid = function() {
        var user_id = arguments[0];
        var parameters = arguments[1];
        var onsuccess = arguments[2];
        var onfail = arguments[3];

        var method = 'GET';
        var endpoint = '/users/' + user_id + '/';
        var paramString = _fn_buildParamString(parameters);

        var url = _base_url + endpoint + '?' + paramString;

        _fn_sendHttpRequest(method, url, paramString, onsuccess, onfail);
    };

    _methods.get_media_mediaid_likes = function() {
        var media_id = arguments[0];
        var parameters = arguments[1];
        var onsuccess = arguments[2];
        var onfail = arguments[3];

        var method = 'GET';
        var endpoint = '/media/' + media_id + '/likes';
        var paramString = _fn_buildParamString(parameters);

        var url = _base_url + endpoint + '?' + paramString;

        _fn_sendHttpRequest(method, url, null, onsuccess, onfail);
    };

    _methods.get_users_userid_relationship = function() {
        var user_id = arguments[0];
        var parameters = arguments[1];
        var onsuccess = arguments[2];
        var onfail = arguments[3];

        var method = 'GET';
        var endpoint = '/users/' + user_id + '/relationship';
        var paramString = _fn_buildParamString(parameters);

        var url = _base_url + endpoint + '?' + paramString;

        _fn_sendHttpRequest(method, url, paramString, onsuccess, onfail);
    };

    _methods.get_media_mediaid = function() {
        var media_id = arguments[0];
        var parameters = arguments[1];
        var onsuccess = arguments[2];
        var onfail = arguments[3];

        var method = 'GET';
        var endpoint = '/media/' + media_id + '/';
        var paramString = _fn_buildParamString(parameters);

        var url = _base_url + endpoint + '?' + paramString;

        _fn_sendHttpRequest(method, url, paramString, onsuccess, onfail);
    };

    _methods.get_tags_tagname_media_recent = function() {
        var tag_name = arguments[0];
        var parameters = arguments[1];
        var onsuccess = arguments[2];
        var onfail = arguments[3];

        var method = 'GET';
        var endpoint = '/tags/' + tag_name + '/media/recent';
        var paramString = _fn_buildParamString(parameters);

        var url = _base_url + endpoint + '?' + paramString;

        _fn_sendHttpRequest(method, url, paramString, onsuccess, onfail);
    };

    _methods.get_tags_tagname = function() {
        var tag_name = arguments[0];
        var parameters = arguments[1];
        var onsuccess = arguments[2];
        var onfail = arguments[3];

        var method = 'GET';
        var endpoint = '/tags/' + tag_name;
        var paramString = _fn_buildParamString(parameters);

        var url = _base_url + endpoint + '?' + paramString;

        _fn_sendHttpRequest(method, url, paramString, onsuccess, onfail);
    };

    _methods.get_users_search = function() {
        var parameters = arguments[0];
        var onsuccess = arguments[1];
        var onfail = arguments[2];

        var method = 'GET';
        var endpoint = '/users/search';
        var paramString = _fn_buildParamString(parameters);

        var url = _base_url + endpoint + '?' + paramString;

        _fn_sendHttpRequest(method, url, null, onsuccess, onfail);
    };

    _methods.get_users_userid_followedby = function() {
        var user_id = arguments[0];
        var parameters = arguments[1];
        var onsuccess = arguments[2];
        var onfail = arguments[3];

        var method = 'GET';
        var endpoint = '/users/' + user_id + '/followed-by';
        var paramString = _fn_buildParamString(parameters);

        var url = _base_url + endpoint + '?' + paramString;

        _fn_sendHttpRequest(method, url, null, onsuccess, onfail);
    };

    _methods.get_users_userid_follows = function() {
        var user_id = arguments[0];
        var parameters = arguments[1];
        var onsuccess = arguments[2];
        var onfail = arguments[3];

        var method = 'GET';
        var endpoint = '/users/' + user_id + '/follows';
        var paramString = _fn_buildParamString(parameters);

        var url = _base_url + endpoint + '?' + paramString;

        _fn_sendHttpRequest(method, url, null, onsuccess, onfail);
    };

    return _methods;
})();