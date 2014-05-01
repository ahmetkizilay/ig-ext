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

        for(var i = 0; i < items.length; i += 1) {
            var item = items[i];
            
            item.addEventListener('click', function () {
                var redirectStr = '/pages/profile.html?';

                if (this.getAttribute('data-uid')) {
                    redirectStr = redirectStr + 'uid=' + this.getAttribute('data-uid') + '&';
                }
                
                redirectStr = redirectStr + 'uname=' + this.getAttribute('data-uname');

                location.href = redirectStr;
            });
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

    return  {
        createProfileLinks: _fn_createProfileLinks,
        getQueryParams: _fn_getQueryParams,
        setupNavigation: _fn_setupNavigation,
        linkifyHashtags: _fn_linkifyHashtags,
        linkifyMention: _fn_linkifyMentions,
        linkifyHashtagsAndMentions: _fn_linkifyHashtagsAndMentions,
        createHashtagLinks: _fn_createHashtagLinks
    };

})(document);