var common = (function (d) {
    var _fn_createProfileLinks = function () {
        var items = d.getElementsByClassName('link-profile');

        for(var i = 0; i < items.length; i += 1) {
            var item = items[i];
            
            item.addEventListener('click', function () {
                location.href = '/pages/profile.html?uid=' + this.getAttribute('data-uid') +
                                                   '&uname=' + this.getAttribute('data-uname');
            });
        };
    };

    var _fn_getQueryParams = function(queryString) {
        var qs = queryString.split('+').join(' '),
            params = {},
            tokens,
            rgx = /[?&]?([^=]+)=([^&]*)/g;

        while(tokens = rgx.exec(qs)) {
            params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
        }

        return params;
    };

    return  {
        createProfileLinks: _fn_createProfileLinks,
        getQueryParams: _fn_getQueryParams
    };

})(document);