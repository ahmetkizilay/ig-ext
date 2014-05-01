var common = (function (d) {
    var _fn_linkifyHashtags = function (txt) {
        return txt.replace(/(#[\u00C0-\u017Ea-zA-Z0-9\']+)/g, '<a href="#" class="hashtag">$1</a>');
    };

    var _fn_createProfileLinks = function () {
        var items = d.getElementsByClassName('link-profile');

        for(var i = 0; i < items.length; i += 1) {
            var item = items[i];
            
            item.addEventListener('click', function () {
                location.href = '/pages/profile.html?uid=' + this.getAttribute('data-uid') +
                                                   '&uname=' + this.getAttribute('data-uname');
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

                    console.log(response);
                    location.href = response;
                }
        };

        btnBack.addEventListener('click', function () {
            console.log('back clicked');
            chrome.extension.sendRequest({method: 'history', params: {
                action: 'back'
            }}, fn_handleResponse);
        });

        btnFwd.addEventListener('click', function () {
            console.log('fwd clicked');
            chrome.extension.sendRequest({method: 'history', params: {
                action: 'fwd'
            }}, fn_handleResponse);
        });
    };

    return  {
        createProfileLinks: _fn_createProfileLinks,
        getQueryParams: _fn_getQueryParams,
        setupNavigation: _fn_setupNavigation,
        linkifyHashtags: _fn_linkifyHashtags
    };

})(document);