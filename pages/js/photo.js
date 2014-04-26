var photo = (function (d) {

    var _fn_createCommentBlock = function (parent, comment, isCaption) {
        var divComment = d.createElement('div');
        divComment.className = 'comment';
        if(isCaption) {
            divComment.className += ' caption';
        }

        var aCommenter = d.createElement('a');
        aCommenter.setAttribute('href', '#');
        aCommenter.innerHTML = comment.from.username;
        divComment.appendChild(aCommenter);

        var spanComment = d.createElement('span');
        spanComment.innerHTML = comment.text;
        divComment.appendChild(spanComment);

        parent.appendChild(divComment);
    };

    var _fn_createLikesInnerHTML = function(likes) {
        var likeCount = likes.count;
        var givenCount = likes.data.length;

        var strLikes = '';
        var i;

        if(!likeCount) {
            strLikes = 'Be the first one to like this beautiful picture!';
        }
        else {

            if(givenCount === 1) {
                strLikes = '<a href=\'#\'><label>' + likes.data[0].username + '</label></a> likes this photo.';
            }
            else if(givenCount < likeCount) {
                for(i = 0; i < givenCount; i += 1) {
                    strLikes += '<a href="#"><label>' + likes.data[i].username + '</label></a>' + ', ';
                }

                strLikes = strLikes.slice(0, -2);

                strLikes += ' and <a href=\'#\'><label>' + (likeCount - givenCount) + ' others</label></a> like this photo.';
            }
            else {
                for(i = 0; i < (givenCount - 1); i += 1) {
                    strLikes += '<a href="#"><label>' + likes.data[i].username + '</label></a>' + ', ';
                }

                strLikes = strLikes.slice(0, -2);

                strLikes += ' and <a href=\'#\'><label>' + likes.data[givenCount - 1] + '</label></a> like this photo.';
            }
        }

        return strLikes;
    };

    var _fn_fillTemplate = function (photoData) {
        console.dir(photoData);

        // adding profile picture
        var profilePicture = d.getElementsByClassName('avatar')[0]
                              .getElementsByTagName('a')[0]
                              .getElementsByTagName('img')[0];
        profilePicture.src = photoData.user.profile_picture;

        // adding post date
        var date = d.getElementsByClassName('userdate')[0]
                    .getElementsByTagName('label')[0];
        date.innerHTML = new Date(photoData.created_time * 1000).toDateString();

        // adding username
        var username = d.getElementsByClassName('userdate')[0]
                        .getElementsByTagName('a')[0];
        username.innerHTML = photoData.user.username;

        // adding location
        var divLocation = d.getElementsByClassName('location')[0];
        if(photoData.location && photoData.location.name) {
            divLocation.getElementsByTagName('label')[0].innerHTML = photoData.location.name;
        }
        else {
            divLocation.getElementsByTagName('label')[0].innerHTML = 'not specified';
        }

        // adding the image
        var img = d.getElementsByClassName('imgHolder')[0]
                   .getElementsByTagName('img')[0];
        img.src = photoData.images.standard_resolution.url;

        // creating likes
        var spanLikes = d.getElementById('strLikes');
        spanLikes.innerHTML = _fn_createLikesInnerHTML(photoData.likes);

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

    };

    return {
        fillTemplate: _fn_fillTemplate
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

        var lblProfile = document.getElementById("lblProfile");
        lblProfile.innerHTML = user_data.full_name;

        var imgProfile = document.getElementById('imgProfile');
        imgProfile.src = user_data.profile_picture;

        var pid = location.href.substring(location.href.indexOf('#') + 1);
        console.log('this is the pid', pid);
        chrome.extension.sendRequest({method: 'photo', 'pid': pid}, function (response) {

            if(response.found) {
                console.log('could not find the image');
                return;
            }

            photo.fillTemplate(response);
        });
    });
});