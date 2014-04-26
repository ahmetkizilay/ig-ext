var NOTIFY = (function (d, w) {
    var _fn_createNotification = function(text) {
        var divNotification = d.createElement('div');
        var spanMessage = d.createElement('span');
        var options = arguments[1] || {};
        var scrollTop = d.documentElement.scrollTop || d.body.scrollTop;
        scrollTop += options.top ? options.top : 0;

        spanMessage.innerHTML = text;
        divNotification.appendChild(spanMessage);
        
        divNotification.className = 'notification';
        divNotification.className += ' ' + (options.level !== undefined ?options.level : 'info');
        
        divNotification.style.top = scrollTop + 'px';
        
        setTimeout(function () {
            divNotification.parentNode.removeChild(divNotification);
        }, options.lifetime ? lifeTime : 2500);
    
        if(options.parent) {
            options.parent.appendChild(divNotification);
        }
        
        return divNotification;
    };
    
    return {
        notify: _fn_createNotification
    };
})(document, window);
