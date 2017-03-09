/**
 * Created by lzz on 17/3/9.
 */

function loadScript(url_list) {
    var default_list = [
        "js/jquery.js",
        "js/layer/layer.js",
        "js/i18n.js",
        "js/tool.js",
        "js/util.js",
        "js/json.js",
        "js/window.js",
        "js/ajax.js",
        "js/pack.js",
        "js/smarty.js",
        "js/search_form.js",
        "js/validate.js",
        "js/static.js"
    ];
    var urls = default_list.concat(url_list);
    for(var i = 0; i < urls.length; i++ ){
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = urls[i];
        document.body.appendChild(script);
    }

}




