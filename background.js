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
    'client_id': '4ae44a7ca27d4c32b73a2a00793cbaf7',
    'access_token_link': 'http://localhost:2424/step_two'
};

var app = (function (config) {
    var _app_id = chrome.runtime.id;
    var _redirect_uri = 'https://' + _app_id + '.chromiumapp.org/oauth-redirect.html';
    var _oauth_link = 'https://api.instagram.com/oauth/authorize/?client_id=' +
                       config.client_id + '&redirect_uri=' +
                       encodeURIComponent(_redirect_uri) +
                       '&response_type=code&scope=comments+likes+relationships';
    
    var _user_data = {};

    var _cached_data = {
        feed: [],
        users: [],
        follows: [],
        saved_tags: []
    };

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
            console.dir(accessJSON);

            _user_data.access_token = accessJSON.access_token;
            _user_data.username = accessJSON.user.username;
            _user_data.full_name = accessJSON.user.full_name;
            _user_data.profile_picture = accessJSON.user.profile_picture;
            _user_data.user_id = accessJSON.user.id;
            
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

    var _fn_getOwnFeed = function(max_id, callback) {
        var parameters = {
            'access_token': _user_data.access_token,
            'count': 21
        };

        if(max_id) {
            parameters['max_id'] = max_id;
        }

        var onsuccess = function(response) {
            var responseJSON = JSON.parse(response);
            callback({'success': true, 'response': JSON.parse(response)});
        };

        var onfail = function(status, msg) {
            console.log('getOwnFeed returned error: ', status, msg);
            callback({'success': false, 'msg': msg});
        };

        api['get_users_self_feed'].call(api, parameters, onsuccess, onfail);
    };

    var _fn_getUserFeed = function (uid, max_id, callback) {
        var parameters = {
            'access_token': _user_data.access_token,
            'count': 21
        };

        if(max_id) {
            parameters['max_id'] = max_id;
        }

        var onsuccess = function(response) {
            var responseJSON = JSON.parse(response);

            callback({'success': true, 'value': responseJSON });
        };

        var onfail = function(status, msg) {
            console.log('getUserFeed response: ', status, msg);
            callback({'success': false, 'err': msg});
        };

        api['get_users_userid_media_recent'].call(api, uid, parameters, onsuccess, onfail);
    };

    var _fn_getPostsWithHashtag = function (hashtag, max_id, callback) {
        var parameters = {
            'access_token': _user_data.access_token,
            'count': 22
        };
        
        if(max_id) {
            parameters['max_id'] = max_id;
        }

        var onsuccess = function(response) {
            var responseJSON = JSON.parse(response);
            console.dir(responseJSON.data);

            callback({'success': true, 'value': responseJSON });
        };

        var onfail = function(status, msg) {
            console.log('getPostsWithHashtag response: ', status, msg);
            callback({'success': false, 'err': msg});
        };

        api['get_tags_tagname_media_recent'].call(api, hashtag, parameters, onsuccess, onfail);
    };

    var _fn_getHashtagInfo = function (hashtag, callback) {
        var parameters = {
            'access_token': _user_data.access_token
        };

        var onsuccess = function(response) {
            var responseJSON = JSON.parse(response);
            console.dir(responseJSON.data);

            callback({'success': true, 'data': responseJSON.data });
        };

        var onfail = function(status, msg) {
            console.log('getHashtagInfo response: ', status, msg);
            callback({'success': false, 'err': msg});
        };

        api['get_tags_tagname'].call(api, hashtag, parameters, onsuccess, onfail);
    };

    var _fn_getUser = function (uid, callback) {
        var parameters = {
            'access_token': _user_data.access_token
        };

        var onsuccess = function(response) {
            var responseJSON = JSON.parse(response);
            callback({'success': true, 'data': responseJSON.data });
        };

        var onfail = function(status, msg) {
            console.log('getUser response: ', status, msg);
            callback({'success': false, 'err': msg});
        };

        api['get_users_userid'].call(api, uid, parameters, onsuccess, onfail);
    };

    var _fn_getRelationship = function (uid, callback) {
        var parameters = {
            'access_token': _user_data.access_token
        };

        var onsuccess = function(response) {
            var responseJSON = JSON.parse(response);
            console.dir(responseJSON.data);

            callback({'success': true, 'data': responseJSON.data });
        };

        var onfail = function(status, msg) {
            console.log('getRelationship response: ', status, msg);
            callback({'success': false, 'err': msg});
        };

        api['get_users_userid_relationship'].call(api, uid, parameters, onsuccess, onfail);
    };

    var _fn_getMedia = function (pid, callback) {
        var parameters = {
            'access_token': _user_data.access_token
        };

        var onsuccess = function(response) {
            var responseJSON = JSON.parse(response);
            callback({'success': true, 'data': responseJSON.data });
        };

        var onfail = function(status, msg) {
            console.log('getMedia returned error: ', status, msg);
            callback({'success': false});
        };

        api['get_media_mediaid'].call(api, pid, parameters, onsuccess, onfail);
    };

    var _fn_getCachedPhotoData = function (pid) {
        var pData = _cached_data.feed.firstMatch(function (item) {
            return item.id === pid;
        });

        if(pData) {
            return pData;
        }
        else {
            return {found: false};
        }
    };

    var _fn_likePhoto = function (pid, callback) {
        var parameters = {
            'access_token': _user_data.access_token
        };

        var onsuccess = function(response) {
            var responseJSON = JSON.parse(response);
            callback({'success': true});
        };

        var onfail = function(status, msg) {
            console.log('likePhoto return error: ', status, msg);
            callback({'success': false});
        };

        api['post_media_mediaid_likes'].call(api, pid, parameters, onsuccess, onfail);
    };

    var _fn_unlikePhoto = function (pid, callback) {
        var parameters = {
            'access_token': _user_data.access_token
        };

        var onsuccess = function(response) {
            var responseJSON = JSON.parse(response);
            callback({'success': true});
        };

        var onfail = function(status, msg) {
            console.log('unlikePhoto return error: ', status, msg);
            callback({'success': false});
        };

        api['del_media_mediaid_likes'].call(api, pid, parameters, onsuccess, onfail);
    };

    var _fn_history = function (params, callback) {
        var address;
        switch(params.action) {
            case 'add':
                History.add(params.address);
                address = params.address;
                break;
            case 'back':
                address = History.back();
                callback(address);
                break;
            case 'fwd':
                address = History.fwd();
                callback(address);
                break;
            default:
                break;
        }

        address = address.replace('chrome-extension://' + _app_id, '');
        chrome.browserAction.setPopup({ popup: address });
    };

    var _fn_searchUser = function (username, callback) {
        var parameters = {
            'access_token': _user_data.access_token,
            'q': username
        };

        var onsuccess = function(response) {
            var responseJSON = JSON.parse(response);
            callback({'success': true, 'value': responseJSON });
        };

        var onfail = function(status, msg) {
            console.log('searchUser returned error: ', status, msg);
            callback({'success': false});
        };

        api['get_users_search'].call(api, parameters, onsuccess, onfail);
    };

    var _fn_searchTag = function (tag, callback) {
        var parameters = {
            'access_token': _user_data.access_token,
            'q': tag
        };

        var onsuccess = function(response) {
            var responseJSON = JSON.parse(response);
            callback({'success': true, 'value': responseJSON });
        };

        var onfail = function(status, msg) {
            console.log('searchTag returned error: ', status, msg);
            callback({'success': false});
        };

        api['get_tags_search'].call(api, parameters, onsuccess, onfail);
    };

    var _fn_getFollowedBy = function (user_id, cursor, callback) {
        var parameters = {
            'access_token': _user_data.access_token
        };

        if(cursor) {
            parameters['cursor'] = cursor;
        }

        var onsuccess = function(response) {
            var responseJSON = JSON.parse(response);
            console.dir(responseJSON);

            callback({'success': true, 'value': responseJSON });
        };

        var onfail = function(status, msg) {
            console.log('getLikes returned error: ', status, msg);
            callback({'success': false});
        };

        api['get_users_userid_followedby'].call(api, user_id, parameters, onsuccess, onfail);
    };

    var _fn_getFollows = function (user_id, cursor, callback) {
        var parameters = {
            'access_token': _user_data.access_token
        };

        if(cursor) {
            parameters['cursor'] = cursor;
        }

        var onsuccess = function(response) {
            var responseJSON = JSON.parse(response);

            callback({'success': true, 'value': responseJSON });
        };

        var onfail = function(status, msg) {
            console.log('getFollows returned error: ', status, msg);
            callback({'success': false});
        };

        api['get_users_userid_follows'].call(api, user_id, parameters, onsuccess, onfail);
    };

    var _fn_getPostsUserLiked = function (max_id, callback) {
        var parameters = {
            'access_token': _user_data.access_token,
            'count': 22
        };

        if(max_id) {
            parameters['max_like_id'] = max_id;
        }

        var onsuccess = function(response) {
            var responseJSON = JSON.parse(response);
            callback({'success': true, 'value': responseJSON });
        };

        var onfail = function(status, msg) {
            console.log('getPostsUserLiked returned error: ', status, msg);
            callback({'success': false});
        };

        api['get_users_self_media_liked'].call(api, parameters, onsuccess, onfail);
    };

    var _fn_getLikes = function (media_id, cursor, callback) {
        var parameters = {
            'access_token': _user_data.access_token
        };

        if(cursor) {
            parameters['cursor'] = cursor;
        }

        var onsuccess = function(response) {
            var responseJSON = JSON.parse(response);
            console.dir(responseJSON.data);

            callback({'success': true, 'value': responseJSON });
        };

        var onfail = function(status, msg) {
            console.log('getLikes returned error: ', status, msg);
            callback({'success': false});
        };

        api['get_media_mediaid_likes'].call(api, media_id, parameters, onsuccess, onfail);
    };

    var _fn_getComments = function (media_id, cursor, callback) {
        var parameters = {
            'access_token': _user_data.access_token
        };

        if(cursor) {
            parameters['cursor'] = cursor;
        }

        var onsuccess = function(response) {
            var responseJSON = JSON.parse(response);
            console.dir(responseJSON.data);

            callback({'success': true, 'value': responseJSON });
        };

        var onfail = function(status, msg) {
            console.log('getComments returned error: ', status, msg);
            callback({'success': false});
        };

        api['get_media_mediaid_comments'].call(api, media_id, parameters, onsuccess, onfail);
    };

    var _fn_modifyFollow = function (user_id, action, callback) {
        var parameters = {
            'access_token': _user_data.access_token,
            'action': action
        };

        var onsuccess = function(response) {
            var responseJSON = JSON.parse(response);
            console.dir(responseJSON.data);

            callback({'success': true, 'data': responseJSON.data });
        };

        var onfail = function(status, msg) {
            console.log('modifyFollow returned error: ', status, msg);
            callback({'success': false});
        };

        api['post_users_userid_relationship'].call(api, user_id, parameters, onsuccess, onfail);
    };

    var _fn_cacheFollows = function (user_id, cursor) {

        _fn_getFollows(user_id, cursor, function (response) {
            if(!response.success) {
                return;
            }

            var users = response.value.data;

            _cached_data.follows = _cached_data.follows || [];

            for(var i = 0; i < users.length; i += 1) {
                _cached_data.follows.push(users[i].username);
            }

            if(response.value.pagination && response.value.pagination.next_cursor) {
                _fn_cacheFollows(user_id, response.value.pagination.next_cursor);
            }
        });
    };

    var _fn_searchCachedFollowsAndTags = function (filter, callback) {
        var reg = new RegExp(filter, 'i');
        var fn_reg = function (item) {
            return reg.test(item);
        };

        var resFollows = _cached_data.follows.filter(fn_reg).map(function (item) {
            return '@' + item;
        });

        var resTags = _cached_data.saved_tags.filter(fn_reg).map(function (item) {
            return '#' + item;
        });

        //console.dir(res);
        callback({success: true, data: resFollows.concat(resTags)});
    };

    var _fn_setup = function () {

        chrome.storage.local.get('user_data', function (res) {
            if(res.user_data) {
                _user_data = res.user_data;
            }

            if(res.cached_data) {
                _cached_data.saved_tags = res.cached_data.saved_tags;
            }

            _fn_cacheFollows(_user_data.user_id, 0);
        });

        chrome.storage.local.get('saved_tags', function (res) {
                
            if(res.saved_tags) {
                _cached_data.saved_tags = res.saved_tags;
            }

        });

    };

    var _fn_getSavedTags = function (check, callback) {
        if(check) {
            callback({found: _cached_data.saved_tags.indexOf(check) > -1});
        }

        callback({data: _cached_data.saved_tags});
    };

    var _fn_saveTag = function (tag, callback) {
        if(_cached_data.saved_tags.indexOf(tag) < 0) {
            _cached_data.saved_tags.push(tag);
            chrome.storage.local.set({'saved_tags': _cached_data.saved_tags});
        }

        callback({success: true});
    };

    var _fn_unsaveTag = function (tag, callback) {
        var index = _cached_data.saved_tags.indexOf(tag);
        if(index > -1 ) {
            _cached_data.saved_tags.splice(index, 1);
            chrome.storage.local.set({'saved_tags': _cached_data.saved_tags});
        }

        callback({success: true});
    };

    return {
        authenticate: _fn_authenticate,
        getOwnFeed: _fn_getOwnFeed,
        likePhoto: _fn_likePhoto,
        unlikePhoto: _fn_unlikePhoto,
        getUser: _fn_getUser,
        getPostsUserLiked: _fn_getPostsUserLiked,
        getRelationship: _fn_getRelationship,
        getUserFeed: _fn_getUserFeed,
        getCachedPhotoData: _fn_getCachedPhotoData,
        getMedia: _fn_getMedia,
        getPostsWithHashtag: _fn_getPostsWithHashtag,
        getHashtagInfo: _fn_getHashtagInfo,
        searchUser: _fn_searchUser,
        searchTag: _fn_searchTag,
        getLikes: _fn_getLikes,
        getComments: _fn_getComments,
        getFollowedBy: _fn_getFollowedBy,
        getFollows: _fn_getFollows,
        modifyFollow: _fn_modifyFollow,
        history: _fn_history,
        searchCachedFollowsAndTags: _fn_searchCachedFollowsAndTags,
        getSavedTags: _fn_getSavedTags,
        saveTag: _fn_saveTag,
        unsaveTag: _fn_unsaveTag,
        setup: _fn_setup
    };
})(config);

chrome.extension.onRequest.addListener(function (request, tab, sendRequest) {
    if(request.method === "history") {
        app.history(request.params, sendRequest);
    }

    if(request.method === 'auth') {
        app.authenticate(function (result) {
            sendRequest(result);
        });
    }

    if(request.method === 'ownfeed') {
        app.getOwnFeed(request.max, sendRequest);
    }

    if(request.method === 'feed') {
        app.getUserFeed(request.uid, request.max, sendRequest);
    }

    if(request.method === 'photo') {
        app.getMedia(request.pid, sendRequest);
    }

    if(request.method === 'like') {
        app.likePhoto(request.pid, sendRequest);
    }

    if(request.method === 'unlike') {
        app.unlikePhoto(request.pid, sendRequest);
    }

    if(request.method === 'user') {
        app.getUser(request.uid, sendRequest);
    }

    if(request.method === 'relationship') {
        app.getRelationship(request.uid, sendRequest);
    }

    if(request.method === 'hashtags') {
        app.getPostsWithHashtag(request.hashtag, request.max, sendRequest);
    }

    if(request.method === 'hashtag-info') {
        app.getHashtagInfo(request.hashtag, sendRequest);
    }

    if(request.method === 'search-tag') {
        app.searchTag(request.tag, sendRequest);
    }

    if(request.method  === 'search-user') {
        app.searchUser(request.uname, sendRequest);
    }

    if(request.method === 'get-likes') {
        app.getLikes(request.pid, request.cursor, sendRequest);
    }

    if(request.method == 'get-comments') {
        app.getComments(request.pid, request.cursor, sendRequest);
    }

    if(request.method === 'get-followedby') {
        app.getFollowedBy(request.uid, request.cursor, sendRequest);
    }

    if(request.method === 'get-follows') {
        app.getFollows(request.uid, request.cursor, sendRequest);
    }

    if(request.method === 'follow') {
        app.modifyFollow(request.uid, request.action, sendRequest);
    }

    if(request.method === 'get-liked') {
        app.getPostsUserLiked(request.max, sendRequest);
    }

    if(request.method === 'cached-follows') {
        app.getCachedFollows(request.filter, sendRequest);
    }

    if(request.method === 'search-cached') {
        app.searchCachedFollowsAndTags(request.filter, sendRequest);
    }

    if(request.method === 'saved-tags') {
        app.getSavedTags(request.check, sendRequest);
    }

    if(request.method === 'save-tag') {
        app.saveTag(request.tag, sendRequest);
    }

    if(request.method === 'unsave-tag') {
        app.unsaveTag(request.tag, sendRequest);
    }


});

app.setup();