var hashtags = (function (d) {
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
        img.addEventListener('click', function () {
            var pid = this.getAttribute('data-pid');
            location.href = '/pages/photo.html?pid=' + pid;
        });
        aImage.appendChild(img);
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
        lblDate.innerHTML = _fn_convertTimestamp(post.created_time);
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

    var _fn_setup = function (hashtag) {
        // setup the header
        d.getElementsByClassName('tagname')[0].innerHTML = '#' + hashtag;

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

        // request the post
        chrome.extension.sendRequest({method: 'hashtags', 'hashtag': hashtag}, function (response) {
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

            var parent = d.getElementsByClassName('posts')[0];
            response.data.forEach(function (post) {
                _fn_constructImage(parent, post);
            });

            common.createProfileLinks();
        });
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

        var lblProfile = document.getElementById("lblProfile");
        lblProfile.innerHTML = user_data.full_name;

        var imgProfile = document.getElementById('imgProfile');
        imgProfile.src = user_data.profile_picture;

        var queryParams = common.getQueryParams(location.search);
        var hashtag = queryParams.hashtag;

        hashtags.setup(hashtag);

    });
});