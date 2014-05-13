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

                strLikes += ' and <a href=\'#\'><label class="link-likers" data-pid="' + pid + '">' + (likeCount - givenCount) + ' other' + (likeCount - givenCount > 1 ? 's' : '') + '</label></a> like this photo.';
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

    var _fn_createUserInPhotoBlock = function (taggedUser, img, parent) {
        var div = d.createElement('div');
        div.className = 'tagged-user';
        //div.innerHTML = taggedUser.user.username;
        
        var a = d.createElement('a');
        a.innerHTML = taggedUser.user.username;
        a.href = '#';
        a.setAttribute('data-uname', taggedUser.user.username);
        a.setAttribute('data-uid', taggedUser.user.id);
        a.className += ' link-profile';

        div.appendChild(a);

        parent.insertBefore(div, img);

        div.style.top = Math.floor((taggedUser.position.y * img.clientHeight) + (div.clientHeight)) + 'px';
        div.style.left = (20 + Math.floor(taggedUser.position.x * img.clientWidth) - (div.clientWidth * 0.5)) + 'px';

    };

    var _fn_setup = function (photoData) {

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

        // adding share link
        var divShare = d.getElementsByClassName('share-link')[0];
        var lblShareLink = divShare.getElementsByTagName('label')[0];
        lblShareLink.innerHTML = photoData.link;

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
            var span = d.createElement('span');
            divImageHolder.appendChild(span);

            var img = d.createElement('img');
            img.src = photoData.images.standard_resolution.url;

            span.appendChild(img);


            if(photoData.users_in_photo !== undefined) {
                for(var i = 0; i < photoData.users_in_photo.length; i += 1) {
                    _fn_createUserInPhotoBlock(photoData.users_in_photo[i], img, span);
                }
            }

        }


        // creating likes
        var spanLikes = d.getElementById('strLikes');
        spanLikes.innerHTML = _fn_createLikesInnerHTML(photoData.likes, photoData.id);

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

            if(photoData.comments.count > photoData.comments.data.length) {
                var btnMoreComments = d.createElement('button');
                btnMoreComments.innerHTML = 'all comments (' + photoData.comments.count + ')';
                btnMoreComments.setAttribute('data-pid', photoData.id);
                btnMoreComments.className += " more-comments";
                btnMoreComments.addEventListener('click', function () {
                    location.href = '/pages/comments.html?pid=' + this.getAttribute('data-pid');
                });

                var divMoreComments = d.createElement('div');
                divMoreComments.className += ' more-comments';
                divMoreComments.appendChild(btnMoreComments);


                divComments.appendChild(divMoreComments);
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

        common.createProfileLinks();

    };

    var _fn_likePost = function(pid, img) {

        chrome.extension.sendRequest({'method': 'like', 'pid': pid}, function (response) {
            if(response.success) {
                img.src = 'img/heart.png';
                NOTIFY.notify('You just liked this photo!', {
                    parent: d.getElementsByTagName('body')[0],
                    top: 60
                });

                // update like span
                chrome.extension.sendRequest({method: 'photo', 'pid': pid}, function (response) {

                    if(!response.success) {
                        NOTIFY.notify('Unable to update like info!', {
                            parent: d.getElementsByTagName('body')[0],
                            top: 60,
                            level: 'error'
                        });
                        return;
                    }

                    var spanLikes = d.getElementById('strLikes');
                    spanLikes.innerHTML = _fn_createLikesInnerHTML(response.data.likes, pid);
                    common.createLikerLinks();
                });
            }
        });

    };

    var _fn_unlikePost = function(pid, img) {

        chrome.extension.sendRequest({'method': 'unlike', 'pid': pid}, function (response) {
            if(response.success) {
                img.src = 'img/heart-gray.png';
                NOTIFY.notify('You just unliked this photo!', {
                    parent: d.getElementsByTagName('body')[0],
                    top: 60
                });

                // update like span
                chrome.extension.sendRequest({method: 'photo', 'pid': pid}, function (response) {

                    if(!response.success) {
                        NOTIFY.notify('Unable to update like info!', {
                            parent: d.getElementsByTagName('body')[0],
                            top: 60,
                            level: 'error'
                        });
                        return;
                    }

                    var spanLikes = d.getElementById('strLikes');
                    spanLikes.innerHTML = _fn_createLikesInnerHTML(response.data.likes, pid);
                    common.createLikerLinks();
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
            common.createLikerLinks();

            common.setupSearch();
        });
    });
});