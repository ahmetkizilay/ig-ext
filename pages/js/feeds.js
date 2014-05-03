var loginPage = (function (d) {
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

    // http://jsfiddle.net/g9hAx/2/
    var _fn_constructImage = function (parent, imgData) {
        var postDiv = document.createElement('div');
        postDiv.className = 'post';

        // start top div
        var topDiv = document.createElement('div');
        topDiv.className = 'top';
        var aUser = document.createElement('a');
        aUser.innerHTML = imgData.user.username;
        aUser.setAttribute('href', '#');
        aUser.setAttribute('data-uid', imgData.user.id);
        aUser.setAttribute('data-uname', imgData.user.username);
        aUser.className += ' link-profile';
        topDiv.appendChild(aUser);
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
            location.href = '/pages/photo.html?pid=' + pid;
        });
        aImage.appendChild(img);
        middleDiv.appendChild(aImage);

        if (imgData.type === 'video') {
            var imgVidIndicator = d.createElement('img');
            imgVidIndicator.src = 'img/v.png';
            imgVidIndicator.className = 'video-img';

            middleDiv.appendChild(imgVidIndicator);
        }
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

        var lblDate = document.createElement('label');
        lblDate.innerHTML = _fn_convertTimestamp(imgData.created_time);
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

    return {
        constructImage: _fn_constructImage
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

        // loading user feed
        chrome.extension.sendRequest({method: 'ownfeed'}, function (response) {

            if(!response.success) {
                // TODO display error message on screen
                console.log('please try again later');
                return;
            }

            var data = response.response.data;
            var divFeed = document.getElementsByClassName('feed')[0];
            
            for(var i = 0; i < data.length; i += 1) {
                loginPage.constructImage(divFeed, data[i]);
            }

            common.createProfileLinks();
        });
    });
});