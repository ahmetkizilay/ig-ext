
document.addEventListener('DOMContentLoaded', function() {
    console.log('are we even here=?');
    chrome.storage.local.get('user_data', function (res) {
        var user_data = res.user_data;

        console.dir(user_data);

        var lblProfile = document.getElementById("lblProfile");
        lblProfile.innerHTML = user_data.full_name;

        var imgProfile = document.getElementById('imgProfile');
        imgProfile.src = user_data.profile_picture;
    });
});