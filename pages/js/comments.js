var commentsPage = (function (d) {

    var _fn_constructHeader = function (pid) {
        var header = d.getElementsByClassName('header')[0];
        
        var aImage = d.createElement('a');
        aImage.href = '#';
        aImage.setAttribute('data-pid', pid);
        aImage.className = 'link-photo';
        aImage.addEventListener('click', function () {
            location.href = '/pages/photo.html?pid=' + this.getAttribute('data-pid');
        });

        var img = d.createElement('img');
        
        aImage.appendChild(img);
        header.appendChild(aImage);

        var div = d.createElement('div');

        var span = d.createElement('span');
        
        var lblFirst = d.createElement('label');
        lblFirst.innerHTML = 'comments on&nbsp;';

        var aUser = d.createElement('a');
        aUser.href = '#';
        aUser.className += ' link-profile';

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

            img.src = media.images.standard_resolution.url;
        });
    };

    var _fn_createCommentBlock = function (parent, comment) {
        var divComment = d.createElement('div');
        divComment.className = 'comment';

        var aCommenter = d.createElement('a');
        aCommenter.setAttribute('href', '#');
        aCommenter.innerHTML = comment.from.username;
        aCommenter.setAttribute('data-uid', comment.from.id);
        aCommenter.setAttribute('data-uname', comment.from.username);
        aCommenter.className += ' link-profile';
        divComment.appendChild(aCommenter);

        var spanComment = d.createElement('span');
        spanComment.innerHTML = common.linkifyHashtagsAndMentions(comment.text);
        divComment.appendChild(spanComment);

        parent.appendChild(divComment);
    };

    var _fn_handleResponse = function (response) {
        console.log('debugging comments response');
        console.dir(response);
        
        var divLoadMore = d.getElementsByClassName('load-more')[0];

        var btnLoadMore = divLoadMore.getElementsByTagName('button')[0];
        var imgLoadMore = divLoadMore.getElementsByTagName('img')[0];
        imgLoadMore.style.display = 'none';
        btnLoadMore.disabled = false;

        if(!response.success) {
            console.log(response.err);
            var errJSON = JSON.parse(response.err);
            console.dir(errJSON);

            NOTIFY.notify('oops! please try that again', {
                parent: d.getElementsByTagName('body')[0],
                top: 60,
                level: 'error'
            });

            return;
        }

        var comments = response.value.data;
        var divComments = d.getElementsByClassName('comments')[0];

        comments.forEach(function (comment) {
            _fn_createCommentBlock(divComments, comment);
        });

        common.createProfileLinks();
        common.createHashtagLinks();

        if(response.value.pagination && response.value.pagination.next_cursor) {
             btnLoadMore.setAttribute('data-cursor', response.value.pagination.next_cursor);
        }
        else {
            btnLoadMore.removeAttribute('data-cursor');
            btnLoadMore.disabled = true;
        }

        NOTIFY.notify('retrieved ' + comments.length + ' comments', {
            parent: d.getElementsByTagName('body')[0],
            top: 60
        });
    };

    var _fn_setup = function(params) {

        var uname = params.uname;
        var pid = params.pid;

        _fn_constructHeader(pid, uname);

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
                'method': 'get-comments',
                'pid': pid,
                'cursor': cursor
            };

            chrome.extension.sendRequest(parameters, _fn_handleResponse);
        });

        chrome.extension.sendRequest({method: 'get-comments', 'pid': pid}, _fn_handleResponse);

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
        commentsPage.setup(queryParams);

    });
});