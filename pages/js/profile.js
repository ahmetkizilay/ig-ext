var profile = (function (d) {

    var _fn_toDateString = function (timestamp) {
        var date = new Date(timestamp * 1000);
        var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'November', 'December'];

        var result = date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();

        return result;
    };

    var _fn_handleCounts = function (uid, uname) {
        chrome.extension.sendRequest({method: 'user', 'uid': uid}, function (response) {

            if(!response.success) {

                console.log(response.err);
                var errJSON = JSON.parse(response.err);

                if(errJSON.meta) {
                    NOTIFY.notify(errJSON.meta.error_message, {
                        parent: d.getElementsByTagName('body')[0],
                        top: 60,
                        level: 'error'
                    });
                }
                return;
            }

            _fn_fillCounts(response.data.counts, uid, uname);

        });
    };

    var _fn_handleRelationship = function (uid, isSelf) {
        if(isSelf) {
            var btnFollow = d.getElementById('btnFollow');
            btnFollow.innerHTML = 'YOU';
            btnFollow.disabled = true;
            return;
        }

        chrome.extension.sendRequest({method: 'relationship', 'uid': uid}, function (response) {

            if(!response.success) {

                var errJSON = JSON.parse(response.err);
                console.dir(errJSON);

                if(errJSON.meta) {
                    NOTIFY.notify(errJSON.meta.error_message, {
                        parent: d.getElementsByTagName('body')[0],
                        top: 60,
                        level: 'error'
                    });
                }
                return;
            }

            _fn_fillRelationData(uid, response);

        });
    };

    var _fn_handleFeed = function (uid) {
        var pnlWait = d.getElementsByClassName('load-more')[0];
        var btnLoadMore = pnlWait.getElementsByTagName('button')[0];
        var imgLoadMore = pnlWait.getElementsByTagName('img')[0];
        var max_id = btnLoadMore.getAttribute('data-next-max-id');
        var parameters = {
            'method': 'feed',
            'uid': uid
        };

        if(max_id) {
            parameters.max = max_id;
        }

        imgLoadMore.style.display = 'inline';
        btnLoadMore.disabled = true;

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

                imgLoadMore.style.display = 'none';
                btnLoadMore.disabled = false;

                return;
            }

            
            btnLoadMore.setAttribute('data-next-max-id', response.value.pagination.next_max_id);

            var data = response.value.data;
            var parent = d.getElementsByClassName('posts')[0];
            
            data.forEach(function (post) {
                _fn_constructImage(parent, post);
            });

            imgLoadMore.style.display = 'none';
            btnLoadMore.disabled = false;

            NOTIFY.notify('retrieved ' + data.length + ' posts', {
                parent: d.getElementsByTagName('body')[0],
                top: 60
            });


        });
    };

    var _fn_handleNonExistentProfile = function () {
        var lblPrivate = d.createElement('label');
        lblPrivate.className = 'private';
        lblPrivate.innerHTML = 'It looks like this user does not exist!';

        var container = d.getElementsByClassName('posts')[0];
        container.className += ' center-text';
        container.appendChild(lblPrivate);

        var avatar = d.getElementById('avatar');
        avatar.src = 'img/ig-black.jpg';

        var btnFollow = d.getElementById('btnFollow');
        btnFollow.style.display = 'none';
    };

    var _fn_handleUserData = function (uname, uidUnknown, isSelf) {
        chrome.extension.sendRequest({method: 'search-user', 'uname': uname}, function (response) {

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

            if(response.value.data.length === 0) {

                NOTIFY.notify('user does not exist!', {
                    parent: d.getElementsByTagName('body')[0],
                    top: 60,
                    level: 'error'
                });

                _fn_handleNonExistentProfile();

                return;
            }

            if(uidUnknown) {
                _fn_handleRelationship(response.value.data[0].id, isSelf);
                _fn_handleFeed(response.value.data[0].id);
                _fn_handleCounts(response.value.data[0].id, response.value.data[0].username);
            }

            _fn_fillUserData(response);

        });
    };

    var _fn_fillCounts = function (counts, uid, uname) {
        var num_posts = d.getElementById('posts_count');
        num_posts.innerHTML = counts.media;

        var num_followers = d.getElementById('followers_count');
        num_followers.innerHTML = counts.followed_by;
        num_followers.setAttribute('data-uid', uid);
        num_followers.setAttribute('data-uname', uname);
        num_followers.className += " followed-by";

        var num_following = d.getElementById('following_count');
        num_following.innerHTML = counts.follows;
        num_following.setAttribute('data-uid', uid);
        num_following.setAttribute('data-uname', uname);
        num_following.className += " follows";

        common.createFollowedByLinks();
        common.createFollowsLinks();

    };

    var _fn_setup = function (uid, uname, isSelf) {

        // setting username by default in case the user is private
        d.getElementById('user_name').innerHTML = uname;

        var btnLoadMore = d.getElementsByClassName('load-more')[0].getElementsByTagName('button')[0];
        btnLoadMore.addEventListener('click', function () {
            _fn_handleFeed(uid);
        });

        _fn_handleUserData(uname, !uid, isSelf);

        if(uid) {
            _fn_handleRelationship(uid, isSelf);
            _fn_handleFeed(uid);
            _fn_handleCounts(uid, uname);
        }

    };

    var _fn_setFollowAction = function () {
        var thisButton = this;
        var action = this.getAttribute('data-action');
        var uid = this.getAttribute('data-uid');
        if(!action) {
            return;
        }

        chrome.extension.sendRequest({'method': 'follow', 'action': action, 'uid': uid}, function (response) {

            if(!response.success) {

                var errJSON = JSON.parse(response.err);
                console.dir(errJSON);

                NOTIFY.notify('oops! please try that again later', {
                    parent: d.getElementsByTagName('body')[0],
                    top: 60,
                    level: 'error'
                });

                return;
            }

            var notify_message = '';
            switch(response.data.outgoing_status) {
                case 'requested':
                    thisButton.innerHTML = 'REQUESTED';
                    thisButton.disabled = true;
                    thisButton.setAttribute('title', 'Waiting For Their Response');
                    thisButton.removeAttribute('data-action');
                    notify_message = 'request sent to the user';
                    break;
                case 'follows':
                    thisButton.innerHTML = 'FOLLOWING';
                    thisButton.setAttribute('data-action', 'unfollow');
                    thisButton.setAttribute('title', 'Click To Unfollow Them');
                    notify_message = 'now you are following them';
                    break;
                case 'none':
                    thisButton.innerHTML = 'FOLLOW';
                    thisButton.setAttribute('data-action', 'follow');
                    thisButton.setAttribute('title', 'Click To Follow Them');
                    notify_message = 'you no longer follow them';
                    break;
            }

            NOTIFY.notify(notify_message, {
                parent: d.getElementsByTagName('body')[0],
                top: 60,
                level: 'info'
            });

        });
    };

    var _fn_fillRelationData = function (uid, response) {

        if(!response.success) {
            NOTIFY.notify('Unable to get user data!', {
                parent: d.getElementsByTagName('body')[0],
                top: 60,
                level: 'error'
            });
        }

        var relData = response.data;

        if(relData.target_user_is_private && relData.outgoing_status !== 'follows') {

            var lblPrivate = d.createElement('label');
            lblPrivate.className = 'private';
            lblPrivate.innerHTML = 'This user is private';

            var lblPrivate2 = d.createElement('label');
            lblPrivate2.className = 'private';
            lblPrivate2.innerHTML = 'You need to follow this person to view their posts.';

            var container = d.getElementsByClassName('posts')[0];
            container.className += ' center-text';
            container.appendChild(lblPrivate);
            container.appendChild(lblPrivate2);

            var avatar = d.getElementById('avatar');
            avatar.src = 'img/ig-black.jpg';
        }

        var btnFollow = d.getElementById('btnFollow');
        btnFollow.setAttribute('data-uid', uid);

        btnFollow.addEventListener('click', _fn_setFollowAction);
        switch(relData.outgoing_status) {
            case 'follows':
                btnFollow.innerHTML = 'FOLLOWING';
                btnFollow.setAttribute('title', 'Click To Unfollow Them');
                btnFollow.setAttribute('data-action', 'unfollow');
                break;
            case 'requested':
                btnFollow.innerHTML = 'REQUESTED';
                btnFollow.setAttribute('title', 'Waiting For Their Response');
                btnFollow.disabled = true;
                break;
            default:
                btnFollow.innerHTML = 'FOLLOW';
                btnFollow.setAttribute('title', 'Click To Follow Them');
                btnFollow.setAttribute('data-action', 'follow');
            break;
        }

    };

    var _fn_fillUserData = function (response) {

        if(!response.success) {
            NOTIFY.notify('Unable to get user data!', {
                parent: d.getElementsByTagName('body')[0],
                top: 60,
                level: 'error'
            });
        }

        var userData = response.value.data[0];

        // profile picture
        var profile_picture = d.getElementsByClassName('avatar')[0].getElementsByTagName('img')[0];
        profile_picture.src = userData.profile_picture;

        // user name
        var user_name = d.getElementById('user_name');
        user_name.innerHTML = userData.username;
        user_name.addEventListener('click', function (e) {
            e.preventDefault();
        });

        if(userData.full_name) {
            var user_full_name = d.getElementById('user_full_name');
            user_full_name.innerHTML = '(' + userData.full_name + ')';
        }

        if(userData.bio) {
            var user_bio = d.getElementById('bio');
            user_bio.innerHTML = common.linkifyHashtagsAndMentions(userData.bio);
        }

        if(userData.counts) {
            _fn_fillCounts(userData.counts, userData.id, userData.username);
        }

        common.createProfileLinks();
        common.createHashtagLinks();

    };

    var _fn_constructImage = function (parent, imgData) {
        var postDiv = document.createElement('div');
        postDiv.className = 'post';

        // start top div
        var topDiv = document.createElement('div');
        topDiv.className = 'top';
        var lblDate = document.createElement('label');
        lblDate.className = 'date';
        lblDate.innerHTML = _fn_toDateString(imgData.created_time);
        topDiv.appendChild(lblDate);
        // end top div

        // start middle div
        var middleDiv = document.createElement('div');
        middleDiv.className = 'middle';
        
        var aImage = document.createElement('a');
        aImage.setAttribute('href', '#');
        var img = document.createElement('img');
        img.setAttribute('src', imgData.images.thumbnail.url);
        img.setAttribute('data-pid', imgData.id);
        img.className += " media";
        img.addEventListener('click', function () {
            var pid = this.getAttribute('data-pid');
            location.href = '/pages/photo.html?pid=' + pid;
        });
        aImage.appendChild(img);

        if (imgData.type === 'video') {
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
        lblLikeCount.innerHTML = imgData.likes.count;
        bottomDiv.appendChild(lblLikeCount);
        
        var imgComment = document.createElement('img');
        imgComment.setAttribute('src', 'img/comment.png');
        bottomDiv.appendChild(imgComment);

        var lblCommentCount = document.createElement('label');
        lblCommentCount.innerHTML = imgData.comments.count;
        bottomDiv.appendChild(lblCommentCount);

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
    return {
        setup: _fn_setup
    };

})(document);

document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get('user_data', function (res) {
        var user_data = res.user_data;

        if(!user_data) {
            // redirect to the login page
            location.href = '/pages/login.html';
            return;
        }

        common.setupHeader(user_data);
        common.setupNavigation();
        common.setupSearch();

        var queryParams = common.getQueryParams(location.search);
        var uid = queryParams.uid;
        var uname = queryParams.uname;

        profile.setup(uid, uname, uid === user_data.user_id);

    });
});