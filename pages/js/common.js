var common = (function (d) {
    var _fn_linkifyHashtags = function (txt) {
        return txt.replace(/(#[\u00C0-\u017Ea-zA-Z0-9_\']+)/g, '<a href="#" class="hashtag">$1</a>');
    };

    var _fn_linkifyMentions = function (txt) {
        return txt.replace(/@([\u00C0-\u017Ea-zA-Z0-9_\']+)/g, '<a href="#" class="link-profile" data-uname="$1">@$1</a>');
    };

    var _fn_linkifyHashtagsAndMentions = function (txt) {
        var result = _fn_linkifyHashtags(txt);
        return _fn_linkifyMentions(result);
    };

    var _fn_createProfileLinks = function () {
        var items = d.getElementsByClassName('link-profile');

        var fn = function () {
            var redirectStr = '/pages/profile.html?';

            if (this.getAttribute('data-uid')) {
                redirectStr = redirectStr + 'uid=' + this.getAttribute('data-uid') + '&';
            }
            
            redirectStr = redirectStr + 'uname=' + this.getAttribute('data-uname');

            location.href = redirectStr;
        };

        for(var i = 0; i < items.length; i += 1) {
            var item = items[i];
            item.addEventListener('click', fn);
        }
    };

    var _fn_createLikerLinks = function () {
        var items = d.getElementsByClassName('link-likers');

        for(var i = 0; i < items.length; i += 1) {
            var item = items[i];

            item.addEventListener('click', function () {
                location.href = '/pages/user-list.html?type=like&pid=' + this.getAttribute('data-pid');
            });
        }
    };

    var _fn_createFollowedByLinks = function () {
        var items = d.getElementsByClassName('followed-by');
        var _fn_action = function() {
            location.href = '/pages/user-list.html?type=followed-by&uid=' + this.getAttribute('data-uid') + '&uname=' + this.getAttribute('data-uname');
        };

        for(var i = 0; i < items.length; i += 1) {
            var item = items[i];
            item.addEventListener('click', _fn_action);
        }
    };

    var _fn_createFollowsLinks = function () {
        var items = d.getElementsByClassName('follows');
        var _fn_action = function() {
            location.href = '/pages/user-list.html?type=follows&uid=' + this.getAttribute('data-uid') + '&uname=' + this.getAttribute('data-uname');
        };
        
        for(var i = 0; i < items.length; i += 1) {
            var item = items[i];
            item.addEventListener('click', _fn_action);
        }
    };

    var _fn_createHashtagLinks = function () {
        var items = d.getElementsByClassName('hashtag');

        for(var i = 0; i < items.length; i += 1) {
            var item = items[i];

            item.addEventListener('click', function () {
                location.href = '/pages/hashtags.html?hashtag=' + this.innerHTML.substring(1);
            });
        }
    };

    var _fn_getQueryParams = function(queryString) {
        var qs = queryString.split('+').join(' '),
            params = {},
            tokens,
            rgx = /[?&]?([^=]+)=([^&]*)/g;

        while(tokens = rgx.exec(qs)) {
            params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
        }

        return params;
    };

    var _fn_setupHeader = function (user_data) {
        
        var lblProfile = d.getElementById("lblProfile");
        lblProfile.innerHTML = user_data.full_name;
        lblProfile.setAttribute('data-uid', user_data.user_id);
        lblProfile.setAttribute('data-uname', user_data.username);
        
        var imgProfile = d.getElementById('imgProfile');
        imgProfile.src = user_data.profile_picture;
        imgProfile.parentNode.setAttribute('data-uid', user_data.user_id);
        imgProfile.parentNode.setAttribute('data-uname', user_data.username);

    };

    var _fn_setupNavigation = function () {

        var divNav = d.createElement('div');
        divNav.className = 'my-nav';

        var btnBack = d.createElement('button');
        btnBack.innerHTML = '<';

        var btnFwd = d.createElement('button');
        btnFwd.innerHTML = '>';

        divNav.appendChild(btnBack);
        divNav.appendChild(btnFwd);

        d.body.appendChild(divNav);

        if(location.href.indexOf('nav=true') === -1) {

            chrome.extension.sendRequest({method: 'history', params: {
                action: 'add', address: location.href
            }});
        }

        var fn_handleResponse = function (response) {
            if(response) {
                    
                    if(response.indexOf('?') !== -1) {
                        response += '&nav=true';
                    } else {
                        response += '?nav=true';
                    }

                    location.href = response;
                }
        };

        btnBack.addEventListener('click', function () {
            chrome.extension.sendRequest({method: 'history', params: {
                action: 'back'
            }}, fn_handleResponse);
        });

        btnFwd.addEventListener('click', function () {
            chrome.extension.sendRequest({method: 'history', params: {
                action: 'fwd'
            }}, fn_handleResponse);
        });

    };

    var _fn_convertTimestamp = function (timestamp) {
        var yearInMS = 31557600000;
        var weekInMS = 604800000;
        var dayInMS = 86400000;
        var hourInMS = 3600000;
        var minInMS = 60000;
        var secondInMS = 1000;

        var span = new Date().getTime() - new Date(timestamp * 1000).getTime();

        if(span > yearInMS) {
            return Math.floor(span / yearInMS) + 'y';
        }

        if(span > weekInMS) {
            return Math.floor(span / weekInMS) + 'w';
        }

        if(span > dayInMS) {
            return Math.floor(span / dayInMS) + 'd';
        }

        if(span > hourInMS) {
            return Math.floor(span / hourInMS) + 'h';
        }

        if(span > minInMS) {
            return Math.floor(span / minInMS) + 'm';
        }

        return Math.floor(span / secondInMS) + 's';
    };

    return  {
        createProfileLinks: _fn_createProfileLinks,
        createLikerLinks: _fn_createLikerLinks,
        createFollowedByLinks: _fn_createFollowedByLinks,
        createFollowsLinks: _fn_createFollowsLinks,
        getQueryParams: _fn_getQueryParams,
        setupNavigation: _fn_setupNavigation,
        setupHeader: _fn_setupHeader,
        linkifyHashtags: _fn_linkifyHashtags,
        linkifyMention: _fn_linkifyMentions,
        linkifyHashtagsAndMentions: _fn_linkifyHashtagsAndMentions,
        createHashtagLinks: _fn_createHashtagLinks,
        convertTimestamp: _fn_convertTimestamp
    };

})(document);