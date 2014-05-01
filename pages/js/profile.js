var profile = (function (d) {

    var _fn_toDateString = function (timestamp) {
        var date = new Date(timestamp * 1000);
        var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'November', 'December'];

        var result = date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();

        return result;
    };

    var _fn_handleCounts = function (uid) {
        chrome.extension.sendRequest({method: 'user', 'uid': uid}, function (response) {

            if(!response.success) {

                console.log(response.err);
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

            _fn_fillCounts(response.data.counts);

        });
    };

    var _fn_handleRelationship = function (uid) {
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

            _fn_fillRelationData(response);

        });
    };

    var _fn_handleFeed = function (uid) {
        chrome.extension.sendRequest({method: 'feed', 'uid': uid}, function (response) {
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
            
        });
    };

    var _fn_handleUserData = function (uname, uidUnknown) {
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

            if(uidUnknown) {
                _fn_handleRelationship(response.data[0].id);
                _fn_handleFeed(response.data[0].id);
                _fn_handleCounts(response.data[0].id);
            }

            _fn_fillUserData(response);

        });
    };

    var _fn_fillCounts = function (counts) {
        var num_posts = d.getElementById('posts_count');
        num_posts.innerHTML = counts.media;

        var num_followers = d.getElementById('followers_count');
        num_followers.innerHTML = counts.followed_by;

        var num_following = d.getElementById('following_count');
        num_following.innerHTML = counts.follows;
    };

    var _fn_setup = function (uid, uname) {

        // setting username by default in case the user is private
        d.getElementById('user_name').innerHTML = uname;

        _fn_handleUserData(uname, !uid);

        if(uid) {
            _fn_handleRelationship(uid);
            _fn_handleFeed(uid);
            _fn_handleCounts(uid);
        }

    };

    var _fn_fillRelationData = function (response) {
        console.dir(response);

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
        switch(relData.outgoing_status) {
            case 'follows':
                btnFollow.innerHTML = 'FOLLOWING';
                break;
            case 'requested':
                btnFollow.innerHTML = 'REQUESTED';
                break;
            default:
                btnFollow.innerHTML = 'FOLLOW';
            break;
        }

    };

    var _fn_fillUserData = function (response) {
        console.dir(response);

        if(!response.success) {
            NOTIFY.notify('Unable to get user data!', {
                parent: d.getElementsByTagName('body')[0],
                top: 60,
                level: 'error'
            });
        }

        var userData = response.data[0];

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
            _fn_fillCounts(userData.counts);
        }

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
        img.addEventListener('click', function () {
            var pid = this.getAttribute('data-pid');
            console.log(pid);
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
        lblLikeCount.innerHTML = imgData.likes.count;
        bottomDiv.appendChild(lblLikeCount);
        
        var imgComment = document.createElement('img');
        imgComment.setAttribute('src', 'img/comment.png');
        bottomDiv.appendChild(imgComment);

        var lblCommentCount = document.createElement('label');
        lblCommentCount.innerHTML = imgData.comments.count;
        bottomDiv.appendChild(lblCommentCount);

        // var lblDate = document.createElement('label');
        // lblDate.innerHTML = _fn_convertTimestamp(imgData.created_time);
        // bottomDiv.appendChild(lblDate);
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
    
        common.setupNavigation();

        var lblProfile = document.getElementById("lblProfile");
        lblProfile.innerHTML = user_data.full_name;

        var imgProfile = document.getElementById('imgProfile');
        imgProfile.src = user_data.profile_picture;

        var queryParams = common.getQueryParams(location.search);
        var uid = queryParams.uid;
        var uname = queryParams.uname;

        console.dir(queryParams);

        profile.setup(uid, uname);
        
        common.createProfileLinks();
        common.createHashtagLinks();

    });
});