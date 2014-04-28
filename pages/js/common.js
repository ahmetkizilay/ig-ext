var common = (function (d) {
    var _fn_createProfileLinks = function () {
        var items = d.getElementsByClassName('link-profile');

        for(var i = 0; i < items.length; i += 1) {
            var item = items[i];
            
            item.addEventListener('click', function () {
                location.href = '/pages/profile.html#' + this.getAttribute('data-uid');
            });
        };
    };

    return  {
        createProfileLinks: _fn_createProfileLinks
    };

})(document);