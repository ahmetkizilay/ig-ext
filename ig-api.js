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

    /*
     * Get basic information about a user.
     */
    _methods.get_users_userid = function() {
        var user_id = arguments[0];
        var parameters = arguments[1];
        var onsuccess = arguments[2];
        var onfail = arguments[3];

        var method = 'GET';
        var endpoint = '/users/' + user_id + '/';
        var paramString = _fn_buildParamString(parameters);

        var url = _base_url + endpoint + '?' + paramString;

        _fn_sendHttpRequest(method, url, null, onsuccess, onfail);
    };

    /*
     * See the authenticated user's feed. May return a mix of both image and video types.
     */
    _methods.get_users_self_feed = function () {
        var argParams = arguments[0];
        var onsuccess = arguments[1];
        var onfail = arguments[2];
        
        var parameters = {};
        if(argParams['access_token']) {
            parameters['access_token'] = argParams['access_token'];
        }
        if(argParams['count']) {
            parameters['count'] = argParams['count'];
        }
        if(argParams['min_id']) {
            parameters['min_id'] = argParams['min_id'];
        }
        if(argParams['max_id']) {
            parameters['max_id'] = argParams['max_id'];
        }

        var method = 'GET';
        var endpoint = '/users/self/feed/';
        var paramString = _fn_buildParamString(parameters);

        var url = _base_url + endpoint + '?' + paramString;

        _fn_sendHttpRequest(method, url, null, onsuccess, onfail);
    };

    /*
     * Get the most recent media published by a user. May return a mix of both image and video types.
     */
    _methods.get_users_userid_media_recent = function () {
        var user_id = arguments[0];
        var argParams = arguments[1];
        var onsuccess = arguments[2];
        var onfail = arguments[3];

        var parameters = {};
        if(argParams['count']) {
            parameters['count'] = argParams['count'];
        }
        if(argParams['max_timestamp']) {
            parameters['max_timestamp'] = argParams['max_timestamp'];
        }
        if(argParams['access_token']) {
            parameters['access_token'] = argParams['access_token'];
        }
        if(argParams['min_timestamp']) {
            parameters['min_timestamp'] = argParams['min_timestamp'];
        }
        if(argParams['min_id']) {
            parameters['min_id'] = argParams['min_id'];
        }
        if(argParams['max_id']) {
            parameters['max_id'] = argParams['max_id'];
        }

        var method = 'GET';
        var endpoint = '/users/' + user_id + '/media/recent/';
        var paramString = _fn_buildParamString(parameters);

        var url = _base_url + endpoint + '?' + paramString;

        _fn_sendHttpRequest(method, url, null, onsuccess, onfail);
    };

    /*
     * See the authenticated user's list of media they've liked. May return a mix of both
     * image and video types. 
     * Note: This list is ordered by the order in which the user liked the media. Private media
     * is returned as long as the authenticated user has permission to view that media. Liked
     * media lists are only available for the currently authenticated user.
     */
    _methods.get_users_self_media_liked = function() {
        var argParams = arguments[0];
        var onsuccess = arguments[1];
        var onfail = arguments[2];

        var parameters = {};
        if(argParams['access_token']) {
            parameters['access_token'] = argParams['access_token'];
        }
        if(argParams['count']) {
            parameters['count'] = argParams['count'];
        }
        if(argParams['max_like_id']) {
            parameters['max_like_id'] = argParams['max_like_id'];
        }

        var method = 'GET';
        var endpoint = '/users/self/media/liked';
        var paramString = _fn_buildParamString(parameters);

        var url = _base_url + endpoint + '?' + paramString;

        _fn_sendHttpRequest(method, url, null, onsuccess, onfail);
    };

    /*
     * Search for a user by name.
     */
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

    /*
     * Get the list of users this user follows.
     * Required scope: relationships
     */
    _methods.get_users_userid_follows = function() {
        var user_id = arguments[0];
        var argParams = arguments[1];
        var onsuccess = arguments[2];
        var onfail = arguments[3];

        var parameters = {};
        if(argParams['access_token']) {
            parameters['access_token'] = argParams['access_token'];
        }
        if(argParams['cursor']) {
            parameters['cursor'] = argParams['cursor'];
        }

        var method = 'GET';
        var endpoint = '/users/' + user_id + '/follows';
        var paramString = _fn_buildParamString(parameters);

        var url = _base_url + endpoint + '?' + paramString;

        _fn_sendHttpRequest(method, url, null, onsuccess, onfail);
    };

    /*
     * Get the list of users this user is followed by.
     * Required scope: relationships
     */
    _methods.get_users_userid_followedby = function() {
        var user_id = arguments[0];
        var argParams = arguments[1];
        var onsuccess = arguments[2];
        var onfail = arguments[3];

        var parameters = {};
        if(argParams['access_token']) {
            parameters['access_token'] = argParams['access_token'];
        }
        if(argParams['cursor']) {
            parameters['cursor'] = argParams['cursor'];
        }

        var method = 'GET';
        var endpoint = '/users/' + user_id + '/followed-by';
        var paramString = _fn_buildParamString(parameters);

        var url = _base_url + endpoint + '?' + paramString;

        _fn_sendHttpRequest(method, url, null, onsuccess, onfail);
    };

    /*
     * List the users who have requested this user's permission to follow.
     * Required scope: relationships
     */
    _methods.get_users_self_requestedby = function() {
        var user_id = arguments[0];
        var parameters = arguments[1];
        var onsuccess = arguments[2];
        var onfail = arguments[3];

        var method = 'GET';
        var endpoint = '/users/self/requested-by';
        var paramString = _fn_buildParamString(parameters);

        var url = _base_url + endpoint + '?' + paramString;

        _fn_sendHttpRequest(method, url, null, onsuccess, onfail);
    };

    /*
     * Get information about a relationship to another user.
     * Required scope: relationships
     */
    _methods.get_users_userid_relationship = function() {
        var user_id = arguments[0];
        var parameters = arguments[1];
        var onsuccess = arguments[2];
        var onfail = arguments[3];

        var method = 'GET';
        var endpoint = '/users/' + user_id + '/relationship';
        var paramString = _fn_buildParamString(parameters);

        var url = _base_url + endpoint + '?' + paramString;

        _fn_sendHttpRequest(method, url, null, onsuccess, onfail);
    };

    /*
     * Modify the relationship between the current user and the target user.
     * Required scope: relationships
     */
    _methods.post_users_userid_relationship = function() {
        var user_id = arguments[0];
        var argParams = arguments[1];
        var onsuccess = arguments[2];
        var onfail = arguments[3];

        var parameters = {};
        if(argParams['access_token']) {
            parameters['access_token'] = argParams['access_token'];
        }
        if(argParams['action']) {
            parameters['action'] = argParams['action'];
        }
        
        var method = 'POST';
        var endpoint = '/users/' + user_id + '/relationship';
        var paramString = _fn_buildParamString(parameters);

        var url = _base_url + endpoint;

        _fn_sendHttpRequest(method, url, paramString, onsuccess, onfail);
    };

    /*
     * Get information about a media object. The returned type key will
     * allow you to differentiate between image and video media. 
     * Note: if you authenticate with an OAuth Token, you will receive the
     * user_has_liked key which quickly tells you whether the current user has liked this media item.
     */
    _methods.get_media_mediaid = function() {
        var media_id = arguments[0];
        var parameters = arguments[1];
        var onsuccess = arguments[2];
        var onfail = arguments[3];

        var method = 'GET';
        var endpoint = '/media/' + media_id + '/';
        var paramString = _fn_buildParamString(parameters);

        var url = _base_url + endpoint + '?' + paramString;

        _fn_sendHttpRequest(method, url, null, onsuccess, onfail);
    };

    /*
     * Search for media in a given area. The default time span is set to 5 days.
     * The time span must not exceed 7 days. Defaults time stamps cover the last 5 days.
     * Can return mix of image and video types.
     */
    _methods.get_media_search = function() {
        var parameters = arguments[0];
        var onsuccess = arguments[1];
        var onfail = arguments[2];

        var method = 'GET';
        var endpoint = '/media/search';
        var paramString = _fn_buildParamString(parameters);

        var url = _base_url + endpoint + '?' + paramString;

        _fn_sendHttpRequest(method, url, null, onsuccess, onfail);
    };

    /*
     * Get a list of what media is most popular at the moment. Can return mix of image and video types.
     */
    _methods.get_media_popular = function() {
        var parameters = arguments[0];
        var onsuccess = arguments[1];
        var onfail = arguments[2];

        var method = 'GET';
        var endpoint = '/media/popular';
        var paramString = _fn_buildParamString(parameters);

        var url = _base_url + endpoint + '?' + paramString;

        _fn_sendHttpRequest(method, url, null, onsuccess, onfail);
    };

    /*
     * Get a full list of comments on a media.
     * Required scope: comments
     */
    _methods.get_media_mediaid_comments = function() {
        var media_id = arguments[0];
        var parameters = arguments[1];
        var onsuccess = arguments[2];
        var onfail = arguments[3];

        var method = 'GET';
        var endpoint = '/media/' + media_id + '/comments';
        var paramString = _fn_buildParamString(parameters);

        var url = _base_url + endpoint + '?' + paramString;

        _fn_sendHttpRequest(method, url, null, onsuccess, onfail);
    };

    /*
     * Create a comment on a media. Please email apidevelopers[at]instagram.com for access.
     * Required scope: comments
     */
    _methods.post_media_mediaid_comments = function() {
        var media_id = arguments[0];
        var parameters = arguments[1];
        var onsuccess = arguments[2];
        var onfail = arguments[3];

        var method = 'POST';
        var endpoint = '/media/' + media_id + '/comments';
        var paramString = _fn_buildParamString(parameters);

        var url = _base_url + endpoint;

        _fn_sendHttpRequest(method, url, paramsString, onsuccess, onfail);
    };

    /*
     * Remove a comment either on the authenticated user's media or authored by the authenticated user.
     * Required scope: comments
     */
    _methods.del_media_mediaid_comments_commentid = function() {
        var media_id = arguments[0];
        var comment_id = arguments[1];
        var parameters = arguments[2];
        var onsuccess = arguments[3];
        var onfail = arguments[4];

        var method = 'DELETE';
        var endpoint = '/media/' + media_id + '/comments/' + comment_id;
        var paramString = _fn_buildParamString(parameters);

        var url = _base_url + endpoint;

        _fn_sendHttpRequest(method, url, paramsString, onsuccess, onfail);
    };

    /*
     * Get a list of users who have liked this media.
     * Required scope: likes
     */
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

    /*
     * Set a like on this media by the currently authenticated user.
     * Required scope: likes
     */
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

    /*
     * Remove a like on this media by the currently authenticated user.
     * Required scope: likes
     */
    _methods.del_media_mediaid_likes = function() {
        var media_id = arguments[0];
        var parameters = arguments[1];
        var onsuccess = arguments[2];
        var onfail = arguments[3];

        var method = 'DELETE';
        var endpoint = '/media/' + media_id + '/likes';
        var paramString = _fn_buildParamString(parameters);

        var url = _base_url + endpoint + '?' + paramString;

        _fn_sendHttpRequest(method, url, null, onsuccess, onfail);
    };

    /*
     * Get information about a tag object.
     */
    _methods.get_tags_tagname = function() {
        var tag_name = arguments[0];
        var parameters = arguments[1];
        var onsuccess = arguments[2];
        var onfail = arguments[3];

        var method = 'GET';
        var endpoint = '/tags/' + tag_name;
        var paramString = _fn_buildParamString(parameters);

        var url = _base_url + endpoint + '?' + paramString;

        _fn_sendHttpRequest(method, url, null, onsuccess, onfail);
    };

    /*
     * Get a list of recently tagged media. Note that this media is ordered
     * by when the media was tagged with this tag, rather than the order it
     * was posted. Use the max_tag_id and min_tag_id parameters in the pagination
     * response to paginate through these objects. Can return a mix of image and video types.
     */
    _methods.get_tags_tagname_media_recent = function() {
        var tag_name = arguments[0];
        var argParams = arguments[1];
        var onsuccess = arguments[2];
        var onfail = arguments[3];

        var parameters = {};
        if(argParams['access_token']) {
            parameters['access_token'] = argParams['access_token'];
        }
        if(argParams['max_id']) {
            parameters['max_id'] = argParams['max_id'];
        }
        if(argParams['min_id']) {
            parameters['min_id'] = argParams['min_id'];
        }
        
        var method = 'GET';
        var endpoint = '/tags/' + tag_name + '/media/recent';
        var paramString = _fn_buildParamString(parameters);

        var url = _base_url + endpoint + '?' + paramString;

        _fn_sendHttpRequest(method, url, null, onsuccess, onfail);
    };

    /*
     * Search for tags by name. Results are ordered first as an exact match,
     * then by popularity. Short tags will be treated as exact matches.
     */
    _methods.get_tags_search = function() {
        var tag_name = arguments[0];
        var parameters = arguments[1];
        var onsuccess = arguments[2];
        var onfail = arguments[3];

        var method = 'GET';
        var endpoint = '/tags/search';
        var paramString = _fn_buildParamString(parameters);

        var url = _base_url + endpoint + '?' + paramString;

        _fn_sendHttpRequest(method, url, null, onsuccess, onfail);
    };

    /*
     * Get information about a location.
     */
    _methods.get_locations_locationid = function() {
        var location_id = arguments[0];
        var parameters = arguments[1];
        var onsuccess = arguments[2];
        var onfail = arguments[3];

        var method = 'GET';
        var endpoint = '/locations/' + location_id;
        var paramString = _fn_buildParamString(parameters);

        var url = _base_url + endpoint + '?' + paramString;

        _fn_sendHttpRequest(method, url, null, onsuccess, onfail);
    };

    /*
     * Get a list of recent media objects from a given location. May return
     * a mix of both image and video types.
     */
    _methods.get_locations_locationid_media_recent = function() {
        var location_id = arguments[0];
        var parameters = arguments[1];
        var onsuccess = arguments[2];
        var onfail = arguments[3];

        var method = 'GET';
        var endpoint = '/locations/' + location_id + '/media/recent';
        var paramString = _fn_buildParamString(parameters);

        var url = _base_url + endpoint + '?' + paramString;

        _fn_sendHttpRequest(method, url, null, onsuccess, onfail);
    };

    /*
     * Search for a location by geographic coordinate.
     */
    _methods.get_locations_search= function() {
        var parameters = arguments[0];
        var onsuccess = arguments[1];
        var onfail = arguments[2];

        var method = 'GET';
        var endpoint = '/locations/search';
        var paramString = _fn_buildParamString(parameters);

        var url = _base_url + endpoint + '?' + paramString;

        _fn_sendHttpRequest(method, url, null, onsuccess, onfail);
    };

    /*
     * Get recent media from a geography subscription that you created.
     * Note: You can only access Geographies that were explicitly created by
     * your OAuth client. Check the Geography Subscriptions section of the real-time
     * updates page. When you create a subscription to some geography that you define,
     * you will be returned a unique geo-id that can be used in this query. To backfill
     * photos from the location covered by this geography, use the media search endpoint.
     */
    _methods.get_geographies_geoid_media_recent = function() {
        var geo_id = arguments[0];
        var parameters = arguments[1];
        var onsuccess = arguments[2];
        var onfail = arguments[3];

        var method = 'GET';
        var endpoint = '/geographies/' + geo_id + '/media/recent';
        var paramString = _fn_buildParamString(parameters);

        var url = _base_url + endpoint + '?' + paramString;

        _fn_sendHttpRequest(method, url, null, onsuccess, onfail);
    };

    return _methods;
})();