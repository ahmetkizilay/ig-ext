var likesPage = (function (d) {

    // http://jsfiddle.net/g9hAx/2/
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
        img.className += " media link-photo";
        img.setAttribute('data-pid', imgData.id);
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

        var lblDate = document.createElement('label');
        lblDate.innerHTML = common.convertTimestamp(imgData.created_time);
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

    var _fn_loadLiked = function () {

        var pnlLoadMore = d.getElementsByClassName('load-more')[0];
        var btnLoadMore = pnlLoadMore.getElementsByTagName('button')[0];
        var imgWait = pnlLoadMore.getElementsByTagName('img')[0];

        btnLoadMore.disabled = true;
        imgWait.style.display = 'inline';

        var max_id = btnLoadMore.getAttribute('data-next-max-id');
        var params = {
            method: 'get-liked'
        };

        if(max_id) {
            params.max = max_id;
        }

        chrome.extension.sendRequest(params, function (response) {

            if(!response.success) {
                // TODO display error message on screen
                NOTIFY.notify('oops! please try that again', {
                    parent: d.getElementsByTagName('body')[0],
                    top: 60,
                    level: 'error'
                });

                btnLoadMore.disabled = false;
                imgWait.style.display = 'none';
                return;
            }

            console.dir(response);
            var data = response.value.data;
            var divFeed = d.getElementsByClassName('feed')[0];

            if(!btnLoadMore.getAttribute('data-next-max-id')) {
                btnLoadMore.addEventListener('click', _fn_loadLiked);
            }

            btnLoadMore.setAttribute('data-next-max-id', response.value.pagination.next_max_like_id);

            for(var i = 0; i < data.length; i += 1) {
                _fn_constructImage(divFeed, data[i]);
            }

            common.createProfileLinks();
            common.createPhotoLinks();

            btnLoadMore.disabled = false;
            imgWait.style.display = 'none';

            NOTIFY.notify('retrieved ' + data.length + ' posts', {
                parent: d.getElementsByTagName('body')[0],
                top: 60
            });

        });
    };

    return {
        loadLiked: _fn_loadLiked
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

        likesPage.loadLiked();
    });
});