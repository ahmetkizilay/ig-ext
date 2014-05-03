var photo = (function (d) {

    var _fn_createUserLink = function (uid, username) {
        return '<a href="#" data-uid="' + uid + '" data-uname="' + username + '" class="link-profile">' + username + '</a>';
    };

    var _fn_createCommentBlock = function (parent, comment, isCaption) {
        var divComment = d.createElement('div');
        divComment.className = 'comment';
        if(isCaption) {
            divComment.className += ' caption';
        }

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

    var _fn_createLikesInnerHTML = function(likes, pid) {
        var likeCount = likes.count;
        var givenCount = likes.data.length;

        var strLikes = '';
        var i;

        if(!likeCount) {
            strLikes = 'Be the first one to like this beautiful picture!';
        }
        else {

            if(givenCount === 1) {
                strLikes = _fn_createUserLink(likes.data[0].id, likes.data[0].username) + ' likes this photo.';
            }
            else if(givenCount < likeCount) {
                for(i = 0; i < givenCount; i += 1) {
                    strLikes += _fn_createUserLink(likes.data[i].id, likes.data[i].username) + ', ';
                }

                strLikes = strLikes.slice(0, -2);

                strLikes += ' and <a href=\'#\'><label class="link-likers" data-pid="' + pid + '">' + (likeCount - givenCount) + ' others</label></a> like this photo.';
            }
            else {
                for(i = 0; i < (givenCount - 1); i += 1) {
                    strLikes += _fn_createUserLink(likes.data[i].id, likes.data[i].username) + ', ';
                }

                strLikes = strLikes.slice(0, -2);

                strLikes += ' and ' + _fn_createUserLink(likes.data[i].id, likes.data[i].username) + ' like this photo.';
            }
        }

        return strLikes;
    };

    var _fn_setup = function (photoData) {
        console.dir(photoData);

        // adding profile picture
        var profilePicture = d.getElementsByClassName('avatar')[0]
                              .getElementsByTagName('img')[0];
        profilePicture.src = photoData.user.profile_picture;
        profilePicture.setAttribute('data-uid', photoData.user.id);
        profilePicture.setAttribute('data-uname', photoData.user.username);
        profilePicture.className += ' link-profile';

        // adding post date
        var date = d.getElementsByClassName('userdate')[0]
                    .getElementsByTagName('label')[0];
        var dateObj = new Date(photoData.created_time * 1000);
        var dateStr = dateObj.toDateString() + ' ' + /^[0-9]{1,2}:[0-9]{1,2}/.exec(dateObj.toTimeString());
        date.innerHTML = dateStr;

        // adding username
        var username = d.getElementsByClassName('userdate')[0]
                        .getElementsByTagName('a')[0];
        username.innerHTML = photoData.user.username;
        username.setAttribute('data-uid', photoData.user.id);
        username.setAttribute('data-uname', photoData.user.username);
        username.className += ' link-profile';
        
        // adding location
        var divLocation = d.getElementsByClassName('location')[0];
        if(photoData.location && photoData.location.name) {
            divLocation.getElementsByTagName('label')[0].innerHTML = photoData.location.name;
        }
        else {
            divLocation.getElementsByTagName('label')[0].innerHTML = 'not specified';
        }

        // adding the image
        var divImageHolder = d.getElementsByClassName('imgHolder')[0];
        if(photoData.videos) { // this is a video
            var video = d.createElement('video');
            var srcVideo = d.createElement('source');
            var videoUrl = photoData.videos.standard_resolution.url;
            var videoType = videoUrl.substring(videoUrl.lastIndexOf('.') + 1);

            video.setAttribute('controls', 'controls');
            srcVideo.src = videoUrl;
            srcVideo.type = "video/" + videoType;

            video.appendChild(srcVideo);
            divImageHolder.appendChild(video);
        } else {
            var img = d.createElement('img');
            img.src = photoData.images.standard_resolution.url;
            divImageHolder.appendChild(img);
        }

        // creating likes
        var spanLikes = d.getElementById('strLikes');
        spanLikes.innerHTML = _fn_createLikesInnerHTML(photoData.likes, photoData.id);
        common.createLikerLinks();
        
        // adding the caption
        var divComments = d.getElementsByClassName('comments')[0];
        if(photoData.caption) {
           _fn_createCommentBlock(divComments, photoData.caption, true);
        }

        // adding comments
        if(photoData.comments.count) {
            for(i = 0; i < photoData.comments.data.length; i += 1) {
                _fn_createCommentBlock(divComments, photoData.comments.data[i], false);
            }
        }

        // setting up like interaction
        var imgLike = d.getElementsByClassName('likes')[0]
                     .getElementsByTagName('img')[0];

        if(photoData.user_has_liked) {
            imgLike.src = 'img/heart.png';
        }

        imgLike.addEventListener('mouseover', function () {
            this.style.cursor = 'pointer';
        }, false);

        imgLike.addEventListener('mouseout', function () {
            this.style.cursor = 'auto';
        }, false);

        imgLike.addEventListener('click', function () {
            if(this.src.indexOf('gray') !== -1) {
               _fn_likePost(photoData.id, this);
            }
            else {
                _fn_unlikePost(photoData.id, this);
            }
        }, false);

    };

    var _fn_likePost = function(pid, img) {

        chrome.extension.sendRequest({'method': 'like', 'pid': pid}, function (response) {
            console.log('like result', response.success);
            if(response.success) {
                img.src = 'img/heart.png';
                NOTIFY.notify('You just liked this photo!', {
                    parent: d.getElementsByTagName('body')[0],
                    top: 60
                });
            }
        });

    };

    var _fn_unlikePost = function(pid, img) {

        chrome.extension.sendRequest({'method': 'unlike', 'pid': pid}, function (response) {
            console.log('unlike result', response.success);
            if(response.success) {
                img.src = 'img/heart-gray.png';
                NOTIFY.notify('You just unliked this photo!', {
                    parent: d.getElementsByTagName('body')[0],
                    top: 60
                });
            }
        });

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

        var queryParams = common.getQueryParams(location.search);
        var pid = queryParams.pid;


        chrome.extension.sendRequest({method: 'photo', 'pid': pid}, function (response) {

            if(!response.success) {
                console.log('could not find the image');
                return;
            }

            photo.setup(response.data);

            common.createProfileLinks();
            common.createHashtagLinks();
        });
    });
});