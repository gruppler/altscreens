var IcomaticUtils = (function() {
return {
fallbacks: [{ from: 'backlight', 'to': '\ue001' },{ from: 'nextlight', 'to': '\ue00e' },{ from: 'download', 'to': '\ue007' },{ from: 'settings', 'to': '\ue014' },{ from: 'refresh', 'to': '\ue012' },{ from: 'cancel', 'to': '\ue003' },{ from: 'delete', 'to': '\ue006' },{ from: 'folder', 'to': '\ue009' },{ from: 'alert', 'to': '\ue000' },{ from: 'check', 'to': '\ue004' },{ from: 'cloud', 'to': '\ue005' },{ from: 'error', 'to': '\ue008' },{ from: 'group', 'to': '\ue00a' },{ from: 'minus', 'to': '\ue00d' },{ from: 'back', 'to': '\ue002' },{ from: 'grid', 'to': '\ue015' },{ from: 'home', 'to': '\ue00b' },{ from: 'menu', 'to': '\ue00c' },{ from: 'next', 'to': '\ue00f' },{ from: 'page', 'to': '\ue010' },{ from: 'plus', 'to': '\ue011' },{ from: 'save', 'to': '\ue013' },{ from: 'user', 'to': '\ue016' },{ from: 'wifi', 'to': '\ue017' }],
substitute: function(el) {
    var curr = el.firstChild;
    var next, alt;
    var content;
    while (curr) {
        next = curr.nextSibling;
        if (curr.nodeType === Node.TEXT_NODE) {
            content = curr.nodeValue;
            for (var i = 0; i < IcomaticUtils.fallbacks.length; i++) {
                content = content.replace( IcomaticUtils.fallbacks[i].from, function(match) {
                    alt = document.createElement('span');
                    alt.setAttribute('class', 'icomatic-alt');
                    alt.innerHTML = match;
                    el.insertBefore(alt, curr);
                    return IcomaticUtils.fallbacks[i].to;
                });
            }
            alt = document.createTextNode(content);
            el.replaceChild(alt, curr);
        }
        curr = next;
    }
},
run: function(force) {
    force = typeof force !== 'undefined' ? force : false;
    var s = getComputedStyle(document.body);
    if (('WebkitFontFeatureSettings' in s)
        || ('MozFontFeatureSettings' in s)
        || ('MsFontFeatureSettings' in s)
        || ('OFontFeatureSettings' in s)
        || ('fontFeatureSettings' in s))
        if (!force)
            return;
    var els = document.querySelectorAll('.icomatic');
    for (var i = 0; i < els.length; i++)
        IcomaticUtils.substitute(els[i]);
}
} // end of object
} // end of fn
)()