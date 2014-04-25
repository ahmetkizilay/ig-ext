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

        // loading user feed
        chrome.extension.sendRequest({method: 'api', path: '/users/self/feed'}, function (feed) {

            var data = feed.data;
            var divFeed = document.getElementsByClassName('feed')[0];
            
            for(var i = 0; i < data.length; i += 1) {
                var a = document.createElement('a');
                var img = document.createElement('img');
                img.src = data[i].images.thumbnail.url;
                img.className = 'feed';

                a.setAttribute('href', data[i].link);
                a.appendChild(img);

                divFeed.appendChild(a);
            }
        });
    });
});