var hashtags = (function (d) {
    
    var _fn_constructImage = function (parent, post) {
        var postDiv = document.createElement('div');
        postDiv.className = 'post';

        // start top div
        var topDiv = document.createElement('div');
        topDiv.className = 'top';
        var aUser = document.createElement('a');
        aUser.innerHTML = post.user.username;
        aUser.setAttribute('href', '#');
        aUser.setAttribute('data-uid', post.user.id);
        aUser.setAttribute('data-uname', post.user.username);
        aUser.className = 'link-profile';
        topDiv.appendChild(aUser);
        // end top div

        // start middle div
        var middleDiv = document.createElement('div');
        middleDiv.className = 'middle';
        
        var aImage = document.createElement('a');
        aImage.setAttribute('href', '#');
        var img = document.createElement('img');
        img.setAttribute('src', post.images.thumbnail.url);
        img.setAttribute('data-pid', post.id);
        img.className += " media";
        img.addEventListener('click', function () {
            var pid = this.getAttribute('data-pid');
            location.href = '/pages/photo.html?pid=' + pid;
        });
        aImage.appendChild(img);

        if (post.type === 'video') {
            var spanVidIndicator = d.createElement('span');
            var imgVidIndicator = d.createElement('img');
            imgVidIndicator.src = 'img/v.png';
            imgVidIndicator.className = 'video-img';

            spanVidIndicator.appendChild(imgVidIndicator);
            aImage.appendChild(spanVidIndicator);
        }
        middleDiv.appendChild(aImage);
        // end middle div

        // start bottom div
        var bottomDiv = document.createElement('div');
        bottomDiv.className = 'bottom';
        
        var imgLike = document.createElement('img');
        imgLike.setAttribute('src', 'img/heart.png');
        bottomDiv.appendChild(imgLike);
        
        var lblLikeCount = document.createElement('label');
        lblLikeCount.innerHTML = post.likes.count;
        bottomDiv.appendChild(lblLikeCount);
        
        var imgComment = document.createElement('img');
        imgComment.setAttribute('src', 'img/comment.png');
        bottomDiv.appendChild(imgComment);

        var lblCommentCount = document.createElement('label');
        lblCommentCount.innerHTML = post.comments.count;
        bottomDiv.appendChild(lblCommentCount);

        var lblDate = document.createElement('label');
        lblDate.innerHTML = common.convertTimestamp(post.created_time);
        bottomDiv.appendChild(lblDate);
        // end bottom div

        postDiv.appendChild(topDiv);
        postDiv.appendChild(middleDiv);
        postDiv.appendChild(bottomDiv);

        postDiv.addEventListener('mouseover', function () {
            bottomDiv.className += " appear-with-ease";
            topDiv.className += " appear-with-ease";
        }, false);

        postDiv.addEventListener('mouseout', function () {
            bottomDiv.className = bottomDiv.className.replace(" appear-with-ease", "");
            topDiv.className = topDiv.className.replace(" appear-with-ease", "");
        }, false);

        parent.appendChild(postDiv);
    };

    var _fn_loadMore = function (hashtag) {
        var pnlWait = d.getElementsByClassName('load-more')[0];
        var btnLoadMore = pnlWait.getElementsByTagName('button')[0];
        var imgLoadMore = pnlWait.getElementsByTagName('img')[0];
        var max_id = btnLoadMore.getAttribute('data-next-max-id');
        var parameters = {
            'method': 'hashtags',
            'hashtag': hashtag
        };

        if(max_id) {
            parameters['max'] = max_id;
        }

        btnLoadMore.disabled = true;
        imgLoadMore.style.display = 'inline';
        // request the post
        chrome.extension.sendRequest(parameters, function (response) {
            if(!response.success) {

                var errJSON = JSON.parse(response.err);
                console.dir(errJSON);

                if(errJSON.meta && errJSON.meta.error_type == 'APINotAllowedError') {
                    NOTIFY.notify(errJSON.meta.error_message, {
                        parent: d.getElementsByTagName('body')[0],
                        top: 60,
                        level: 'error'
                    });
                }

                btnLoadMore.disabled = false;
                imgLoadMore.style.display = 'none';

                return;
            }

            var data = response.value.data;
            var parent = d.getElementsByClassName('posts')[0];
            data.forEach(function (post) {
                _fn_constructImage(parent, post);
            });

            btnLoadMore.setAttribute('data-next-max-id', response.value.pagination.next_max_id);

            btnLoadMore.disabled = false;
            imgLoadMore.style.display = 'none';

            common.createProfileLinks();

            NOTIFY.notify('retrieved ' + data.length + ' posts', {
                parent: d.getElementsByTagName('body')[0],
                top: 60
            });

        });
    };

    var _fn_setup = function (hashtag) {
        // setup the header
        d.getElementsByClassName('tagname')[0].innerHTML = '#' + hashtag;
        var btnLoadMore = d.getElementsByClassName('load-more')[0].getElementsByTagName('button')[0];
        btnLoadMore.addEventListener('click', function () {
            _fn_loadMore(hashtag);
        });

        chrome.extension.sendRequest({method: 'hashtag-info', 'hashtag': hashtag}, function (response) {
            if(!response.success) {

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

            d.getElementsByClassName('media-count')[0].innerHTML = '(' + response.data.media_count + ')';
        });

        _fn_loadMore(hashtag);
    };

    return {
        setup: _fn_setup
    };
}(document));

document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get('user_data', function (res) {
        var user_data = res.user_data;

        if(!user_data) {
            // redirect to the login page
            location.href = '/pages/login.html';
            return;
        }
    
        common.setupNavigation();
        common.setupHeader(user_data);

        var queryParams = common.getQueryParams(location.search);
        var hashtag = queryParams.hashtag;

        hashtags.setup(hashtag);

    });
});