

Laya.init = function(width, height, __plugins) {
    var plugins = [];
    for (var i = 2, sz = arguments.length; i < sz; i++) plugins.push(arguments[i]);
    if (Laya._isinit) return;
    ArrayBuffer.prototype.slice || (ArrayBuffer.prototype.slice = Laya._arrayBufferSlice);
    Laya._isinit = true;
    // Laya.Browser.__init__();
    // Context.__init__();
    // Graphics.__init__();
    // Laya.timer = new Timer();
    Laya.loader = new Laya.LoaderManager();
    /*for (var i = 0, n = plugins.length; i < n; i++) {
        if (plugins[i].enable) plugins[i].enable();
    }
    ResourceManager.__init__();
    CacheManger.beginCheck();*/
    Laya._currentStage = Laya.stage = {}/*new Stage()*/;
    /*Laya.stage.conchModel && Laya.stage.conchModel.setRootNode();
    var location = Browser.window.location;
    var pathName = location.pathname;
    pathName = pathName.charAt(2) == ':' ? pathName.substring(1) : pathName;
    URL.rootPath = URL.basePath = URL.getPath(location.protocol == "file:" ? pathName : location.protocol + "//" + location.host + location.pathname);
    Laya.render = new Render(0, 0);
    Laya.stage.size(width, height);
    RenderSprite.__init__();*/
    /*return Render.canvas;*/
}