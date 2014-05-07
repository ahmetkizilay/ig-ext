var tag_list = (function (d) {

    var _fn_contructTagDiv = function (parent, tag) {
        var div = d.createElement('div');
        div.className = 'tag';

        var a = d.createElement('a');
        a.innerHTML = '#' + tag.name;
        a.href= '#';
        a.className += ' hashtag';

        var label = d.createElement('label');
        label.innerHTML = '(' + tag.media_count + ')';

        div.appendChild(a);
        div.appendChild(label);

        parent.appendChild(div);
    };

    var _fn_constructTagSearchHeader = function (uname) {
        var header = d.getElementsByClassName('header')[0];

        var label = d.createElement('label');
        label.innerHTML = 'tags matching&nbsp;';
        label.className += ' tag-search';

        var label2 = d.createElement('label');
        label2.innerHTML = uname;
        label2.className += ' tag-search query';

        header.appendChild(label);
        header.appendChild(label2);
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

        var tags = response.value.data;
        var divTags = d.getElementsByClassName('tags')[0];

        tags.forEach(function (tag) {
             _fn_contructTagDiv(divTags, tag);
        });

        if(response.value.pagination && response.value.pagination.next_cursor) {
            btnLoadMore.setAttribute('data-cursor', response.value.pagination.next_cursor);
        }
        else {
            btnLoadMore.removeAttribute('data-cursor');
            btnLoadMore.disabled = true;
        }

        common.createHashtagLinks();

        NOTIFY.notify('retrieved ' + tags.length + ' tags', {
            parent: d.getElementsByTagName('body')[0],
            top: 60
        });
    };

    var _fn_buildTagSearch = function (params, callback) {
        var qTag = params.q;

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
                'method': 'search-tag',
                'tag': qTag,
                'cursor': cursor
            };

            chrome.extension.sendRequest(parameters, callback);
        });

        _fn_constructTagSearchHeader(qTag);

        chrome.extension.sendRequest({method: 'search-tag', 'tag': qTag}, callback);
    };

    var _fn_setup = function(params) {

        switch(params.type) {
            case 'search-tag':
                _fn_buildTagSearch(params, _fn_handleResponse);
                break;
            default:
                break;
        }

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
        tag_list.setup(queryParams);

    });
});