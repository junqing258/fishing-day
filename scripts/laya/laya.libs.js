var __un = Laya.un,
	__uns = Laya.uns,
	__static = Laya.static,
	__class = Laya.class,
	__getset = Laya.getset,
	__newvec = Laya.__newvec;
/**
 *<code>EventDispatcher</code> 类是可调度事件的所有类的基类。
 */
//class laya.events.EventDispatcher
var EventDispatcher = (function() {
	var EventHandler;

	function EventDispatcher() {
		this._events = null;
	}

	__class(EventDispatcher, 'laya.events.EventDispatcher');
	var __proto = EventDispatcher.prototype;
	/**
	 *检查 EventDispatcher 对象是否为特定事件类型注册了任何侦听器。
	 *@param type 事件的类型。
	 *@return 如果指定类型的侦听器已注册，则值为 true；否则，值为 false。
	 */
	__proto.hasListener = function(type) {
		var listener = this._events && this._events[type];
		return !!listener;
	}

	/**
	 *派发事件。
	 *@param type 事件类型。
	 *@param data （可选）回调数据。<b>注意：</b>如果是需要传递多个参数 p1,p2,p3,...可以使用数组结构如：[p1,p2,p3,...] ；如果需要回调单个参数 p ，且 p 是一个数组，则需要使用结构如：[p]，其他的单个参数 p ，可以直接传入参数 p。
	 *@return 此事件类型是否有侦听者，如果有侦听者则值为 true，否则值为 false。
	 */
	__proto.event = function(type, data) {
		if (!this._events || !this._events[type]) return false;
		var listeners = this._events[type];
		if (listeners.run) {
			if (listeners.once) delete this._events[type];
			data != null ? listeners.runWith(data) : listeners.run();
		} else {
			for (var i = 0, n = listeners.length; i < n; i++) {
				var listener = listeners[i];
				if (listener) {
					(data != null) ? listener.runWith(data): listener.run();
				}
				if (!listener || listener.once) {
					listeners.splice(i, 1);
					i--;
					n--;
				}
			}
			if (listeners.length === 0 && this._events) delete this._events[type];
		}
		return true;
	}

	/**
	 *使用 EventDispatcher 对象注册指定类型的事件侦听器对象，以使侦听器能够接收事件通知。
	 *@param type 事件的类型。
	 *@param caller 事件侦听函数的执行域。
	 *@param listener 事件侦听函数。
	 *@param args （可选）事件侦听函数的回调参数。
	 *@return 此 EventDispatcher 对象。
	 */
	__proto.on = function(type, caller, listener, args) {
		return this._createListener(type, caller, listener, args, false);
	}

	/**
	 *使用 EventDispatcher 对象注册指定类型的事件侦听器对象，以使侦听器能够接收事件通知，此侦听事件响应一次后自动移除。
	 *@param type 事件的类型。
	 *@param caller 事件侦听函数的执行域。
	 *@param listener 事件侦听函数。
	 *@param args （可选）事件侦听函数的回调参数。
	 *@return 此 EventDispatcher 对象。
	 */
	__proto.once = function(type, caller, listener, args) {
		return this._createListener(type, caller, listener, args, true);
	}

	/**@private */
	__proto._createListener = function(type, caller, listener, args, once, offBefore) {
		(offBefore === void 0) && (offBefore = true);
		offBefore && this.off(type, caller, listener, once);
		var handler = EventHandler.create(caller || this, listener, args, once);
		this._events || (this._events = {});
		var events = this._events;
		if (!events[type]) events[type] = handler;
		else {
			if (!events[type].run) events[type].push(handler);
			else events[type] = [events[type], handler];
		}
		return this;
	}

	/**
	 *从 EventDispatcher 对象中删除侦听器。
	 *@param type 事件的类型。
	 *@param caller 事件侦听函数的执行域。
	 *@param listener 事件侦听函数。
	 *@param onceOnly （可选）如果值为 true ,则只移除通过 once 方法添加的侦听器。
	 *@return 此 EventDispatcher 对象。
	 */
	__proto.off = function(type, caller, listener, onceOnly) {
		(onceOnly === void 0) && (onceOnly = false);
		if (!this._events || !this._events[type]) return this;
		var listeners = this._events[type];
		if (listener != null) {
			if (listeners.run) {
				if ((!caller || listeners.caller === caller) && listeners.method === listener && (!onceOnly || listeners.once)) {
					delete this._events[type];
					listeners.recover();
				}
			} else {
				var count = 0;
				for (var i = 0, n = listeners.length; i < n; i++) {
					var item = listeners[i];
					if (item && (!caller || item.caller === caller) && item.method === listener && (!onceOnly || item.once)) {
						count++;
						listeners[i] = null;
						item.recover();
					}
				}
				if (count === n) delete this._events[type];
			}
		}
		return this;
	}

	/**
	 *从 EventDispatcher 对象中删除指定事件类型的所有侦听器。
	 *@param type （可选）事件类型，如果值为 null，则移除本对象所有类型的侦听器。
	 *@return 此 EventDispatcher 对象。
	 */
	__proto.offAll = function(type) {
		var events = this._events;
		if (!events) return this;
		if (type) {
			this._recoverHandlers(events[type]);
			delete events[type];
		} else {
			for (var name in events) {
				this._recoverHandlers(events[name]);
			}
			this._events = null;
		}
		return this;
	}

	__proto._recoverHandlers = function(arr) {
		if (!arr) return;
		if (arr.run) {
			arr.recover();
		} else {
			for (var i = arr.length - 1; i > -1; i--) {
				if (arr[i]) {
					arr[i].recover();
					arr[i] = null;
				}
			}
		}
	}

	/**
	 *检测指定事件类型是否是鼠标事件。
	 *@param type 事件的类型。
	 *@return 如果是鼠标事件，则值为 true;否则，值为 false。
	 */
	__proto.isMouseEvent = function(type) {
		return EventDispatcher.MOUSE_EVENTS[type];
	}

	EventDispatcher.MOUSE_EVENTS = {
		"rightmousedown": true,
		"rightmouseup": true,
		"rightclick": true,
		"mousedown": true,
		"mouseup": true,
		"mousemove": true,
		"mouseover": true,
		"mouseout": true,
		"click": true,
		"doubleclick": true
	};
	EventDispatcher.__init$ = function() {
		Object.defineProperty(laya.events.EventDispatcher.prototype, "_events", {
			enumerable: false,
			writable: true
		});
		/**@private */
		//class EventHandler extends laya.utils.Handler
		EventHandler = (function(_super) {
			function EventHandler(caller, method, args, once) {
				EventHandler.__super.call(this, caller, method, args, once);
			}
			__class(EventHandler, '', _super);
			var __proto = EventHandler.prototype;
			__proto.recover = function() {
				if (this._id > 0) {
					this._id = 0;
					EventHandler._pool.push(this.clear());
				}
			}
			EventHandler.create = function(caller, method, args, once) {
				(once === void 0) && (once = true);
				if (EventHandler._pool.length) return EventHandler._pool.pop().setTo(caller, method, args, once);
				return new EventHandler(caller, method, args, once);
			}
			EventHandler._pool = [];
			return EventHandler;
		})(Handler)
	}

	return EventDispatcher;
})();


var Handler = (function() {
	function Handler(caller, method, args, once) {
		//this.caller=null;
		//this.method=null;
		//this.args=null;
		this.once = false;
		this._id = 0;
		(once === void 0) && (once = false);
		this.setTo(caller, method, args, once);
	}

	__class(Handler, 'laya.utils.Handler');
	var __proto = Handler.prototype;
	/**
	 *设置此对象的指定属性值。
	 *@param caller 执行域(this)。
	 *@param method 回调方法。
	 *@param args 携带的参数。
	 *@param once 是否只执行一次，如果为true，执行后执行recover()进行回收。
	 *@return 返回 handler 本身。
	 */
	__proto.setTo = function(caller, method, args, once) {
		this._id = Handler._gid++;
		this.caller = caller;
		this.method = method;
		this.args = args;
		this.once = once;
		return this;
	}

	/**
	 *执行处理器。
	 */
	__proto.run = function() {
		if (this.method == null) return null;
		var id = this._id;
		var result = this.method.apply(this.caller, this.args);
		this._id === id && this.once && this.recover();
		return result;
	}

	/**
	 *执行处理器，携带额外数据。
	 *@param data 附加的回调数据，可以是单数据或者Array(作为多参)。
	 */
	__proto.runWith = function(data) {
		if (this.method == null) return null;
		var id = this._id;
		if (data == null)
			var result = this.method.apply(this.caller, this.args);
		else if (!this.args && !data.unshift) result = this.method.call(this.caller, data);
		else if (this.args) result = this.method.apply(this.caller, this.args.concat(data));
		else result = this.method.apply(this.caller, data);
		this._id === id && this.once && this.recover();
		return result;
	}

	/**
	 *清理对象引用。
	 */
	__proto.clear = function() {
		this.caller = null;
		this.method = null;
		this.args = null;
		return this;
	}

	/**
	 *清理并回收到 Handler 对象池内。
	 */
	__proto.recover = function() {
		if (this._id > 0) {
			this._id = 0;
			Handler._pool.push(this.clear());
		}
	}

	Handler.create = function(caller, method, args, once) {
		(once === void 0) && (once = true);
		if (Handler._pool.length) return Handler._pool.pop().setTo(caller, method, args, once);
		return new Handler(caller, method, args, once);
	}

	Handler._pool = [];
	Handler._gid = 1;
	return Handler;
})()


/**
 *<code>Event</code> 是事件类型的集合。一般当发生事件时，<code>Event</code> 对象将作为参数传递给事件侦听器。
 */
//class laya.events.Event
var Event = (function() {
	function Event() {
		//this.type=null;
		//this.nativeEvent=null;
		//this.target=null;
		//this.currentTarget=null;
		//this._stoped=false;
		//this.touchId=0;
		//this.keyCode=0;
		//this.delta=0;
	}

	__class(Event, 'laya.events.Event');
	var __proto = Event.prototype;
	/**
	 *设置事件数据。
	 *@param type 事件类型。
	 *@param currentTarget 事件目标触发对象。
	 *@param target 事件当前冒泡对象。
	 *@return 返回当前 Event 对象。
	 */
	__proto.setTo = function(type, currentTarget, target) {
		this.type = type;
		this.currentTarget = currentTarget;
		this.target = target;
		return this;
	}

	/**
	 *阻止对事件流中当前节点的后续节点中的所有事件侦听器进行处理。此方法不会影响当前节点 (currentTarget)中的任何事件侦听器。
	 */
	__proto.stopPropagation = function() {
		this._stoped = true;
	}

	/**鼠标在 Stage 上的 Y 轴坐标*/
	__getset(0, __proto, 'stageY', function() {
		return Laya.stage.mouseY;
	});

	/**
	 *包含按下或释放的键的字符代码值。字符代码值为英文键盘值。
	 */
	__getset(0, __proto, 'charCode', function() {
		return this.nativeEvent.charCode;
	});

	/**
	 *触摸点列表。
	 */
	__getset(0, __proto, 'touches', function() {
		var arr = this.nativeEvent.touches;
		if (arr) {
			var stage = Laya.stage;
			for (var i = 0, n = arr.length; i < n; i++) {
				var e = arr[i];
				var point = Point.TEMP;
				point.setTo(e.clientX, e.clientY);
				stage._canvasTransform.invertTransformPoint(point);
				stage.transform.invertTransformPoint(point);
				e.stageX = point.x;
				e.stageY = point.y;
			}
		}
		return arr;
	});

	/**
	 *表示键在键盘上的位置。这对于区分在键盘上多次出现的键非常有用。<br>
	 *例如，您可以根据此属性的值来区分左 Shift 键和右 Shift 键：左 Shift 键的值为 KeyLocation.LEFT，右 Shift 键的值为 KeyLocation.RIGHT。另一个示例是区分标准键盘 (KeyLocation.STANDARD)与数字键盘 (KeyLocation.NUM_PAD)上按下的数字键。
	 */
	__getset(0, __proto, 'keyLocation', function() {
		return this.nativeEvent.keyLocation;
	});

	/**
	 *表示 Ctrl 键是处于活动状态 (true)还是非活动状态 (false)。
	 */
	__getset(0, __proto, 'ctrlKey', function() {
		return this.nativeEvent.ctrlKey;
	});

	/**
	 *表示 Alt 键是处于活动状态 (true)还是非活动状态 (false)。
	 */
	__getset(0, __proto, 'altKey', function() {
		return this.nativeEvent.altKey;
	});

	/**
	 *表示 Shift 键是处于活动状态 (true)还是非活动状态 (false)。
	 */
	__getset(0, __proto, 'shiftKey', function() {
		return this.nativeEvent.shiftKey;
	});

	/**鼠标在 Stage 上的 X 轴坐标*/
	__getset(0, __proto, 'stageX', function() {
		return Laya.stage.mouseX;
	});

	Event.EMPTY = new Event();
	Event.MOUSE_DOWN = "mousedown";
	Event.MOUSE_UP = "mouseup";
	Event.CLICK = "click";
	Event.RIGHT_MOUSE_DOWN = "rightmousedown";
	Event.RIGHT_MOUSE_UP = "rightmouseup";
	Event.RIGHT_CLICK = "rightclick";
	Event.MOUSE_MOVE = "mousemove";
	Event.MOUSE_OVER = "mouseover";
	Event.MOUSE_OUT = "mouseout";
	Event.MOUSE_WHEEL = "mousewheel";
	Event.ROLL_OVER = "mouseover";
	Event.ROLL_OUT = "mouseout";
	Event.DOUBLE_CLICK = "doubleclick";
	Event.CHANGE = "change";
	Event.CHANGED = "changed";
	Event.RESIZE = "resize";
	Event.ADDED = "added";
	Event.REMOVED = "removed";
	Event.DISPLAY = "display";
	Event.UNDISPLAY = "undisplay";
	Event.ERROR = "error";
	Event.COMPLETE = "complete";
	Event.LOADED = "loaded";
	Event.PROGRESS = "progress";
	Event.INPUT = "input";
	Event.RENDER = "render";
	Event.OPEN = "open";
	Event.MESSAGE = "message";
	Event.CLOSE = "close";
	Event.KEY_DOWN = "keydown";
	Event.KEY_PRESS = "keypress";
	Event.KEY_UP = "keyup";
	Event.FRAME = "enterframe";
	Event.DRAG_START = "dragstart";
	Event.DRAG_MOVE = "dragmove";
	Event.DRAG_END = "dragend";
	Event.ENTER = "enter";
	Event.SELECT = "select";
	Event.BLUR = "blur";
	Event.FOCUS = "focus";
	Event.VISIBILITY_CHANGE = "visibilitychange";
	Event.FOCUS_CHANGE = "focuschange";
	Event.PLAYED = "played";
	Event.PAUSED = "paused";
	Event.STOPPED = "stopped";
	Event.START = "start";
	Event.END = "end";
	Event.ENABLE_CHANGED = "enablechanged";
	Event.ACTIVE_IN_HIERARCHY_CHANGED = "activeinhierarchychanged";
	Event.COMPONENT_ADDED = "componentadded";
	Event.COMPONENT_REMOVED = "componentremoved";
	Event.LAYER_CHANGED = "layerchanged";
	Event.HIERARCHY_LOADED = "hierarchyloaded";
	Event.RECOVERING = "recovering";
	Event.RECOVERED = "recovered";
	Event.RELEASED = "released";
	Event.LINK = "link";
	Event.LABEL = "label";
	Event.FULL_SCREEN_CHANGE = "fullscreenchange";
	Event.DEVICE_LOST = "devicelost";
	Event.MESH_CHANGED = "meshchanged";
	Event.MATERIAL_CHANGED = "materialchanged";
	Event.RENDERQUEUE_CHANGED = "renderqueuechanged";
	Event.WORLDMATRIX_NEEDCHANGE = "worldmatrixneedchanged";
	Event.ANIMATION_CHANGED = "animationchanged";
	return Event;
})()



/**
     *<p> <code>URL</code> 类用于定义地址信息。</p>
     */
    //class laya.net.URL
    var URL = (function() {
        function URL(url) {
            this._url = null;
            this._path = null;
            this._url = URL.formatURL(url);
            this._path = URL.getPath(url);
        }

        __class(URL, 'laya.net.URL');
        var __proto = URL.prototype;
        /**地址的路径。*/
        __getset(0, __proto, 'path', function() {
            return this._path;
        });

        /**格式化后的地址。*/
        __getset(0, __proto, 'url', function() {
            return this._url;
        });

        URL.formatURL = function(url, base) {
            if (!url) return "null path";
            if (url.indexOf(":") > 0) return url;
            if (URL.customFormat != null) url = URL.customFormat(url, base);
            var char1 = url.charAt(0);
            if (char1 === ".") {
                return URL.formatRelativePath((base || URL.basePath) + url);
            } else if (char1 === '~') {
                return URL.rootPath + url.substring(1);
            } else if (char1 === "d") {
                if (url.indexOf("data:image") === 0) return url;
            } else if (char1 === "/") {
                return url;
            }
            return (base || URL.basePath) + url;
        }

        URL.formatRelativePath = function(value) {
            var parts = value.split("/");
            for (var i = 0, len = parts.length; i < len; i++) {
                if (parts[i] == '..') {
                    parts.splice(i - 1, 2);
                    i -= 2;
                }
            }
            return parts.join('/');
        }

        URL.isAbsolute = function(url) {
            return url.indexOf(":") > 0 || url.charAt(0) == '/';
        }

        URL.getPath = function(url) {
            var ofs = url.lastIndexOf('/');
            return ofs > 0 ? url.substr(0, ofs + 1) : "";
        }

        URL.getFileName = function(url) {
            var ofs = url.lastIndexOf('/');
            return ofs > 0 ? url.substr(ofs + 1) : url;
        }

        URL.version = {};
        URL.basePath = "";
        URL.rootPath = "";
        URL.customFormat = function(url) {
            var newUrl = URL.version[url];
            if (!Render.isConchApp && newUrl) url += "?v=" + newUrl;
            return url;
        }

        return URL;
    })()

/**
 *<code>Loader</code> 类可用来加载文本、JSON、XML、二进制、图像等资源。
 */
//class laya.net.Loader extends laya.events.EventDispatcher
var Loader = (function(_super) {
	function Loader() {
		this._data = null;
		this._url = null;
		this._type = null;
		this._cache = false;
		this._http = null;
		Loader.__super.call(this);
	}

	__class(Loader, 'laya.net.Loader', _super);
	var __proto = Loader.prototype;
	/**
	 *加载资源。加载错误会派发 Event.ERROR 事件，参数为错误信息。
	 *@param url 资源地址。
	 *@param type (default=null)资源类型。可选值为：Loader.TEXT、Loader.JSON、Loader.XML、Loader.BUFFER、Loader.IMAGE、Loader.SOUND、Loader.ATLAS、Loader.FONT。如果为null，则根据文件后缀分析类型。
	 *@param cache (default=true)是否缓存数据。
	 *@param group (default=null)分组名称。
	 *@param ignoreCache (default=false)是否忽略缓存，强制重新加载。
	 */
	__proto.load = function(url, type, cache, group, ignoreCache) {
		(cache === void 0) && (cache = true);
		(ignoreCache === void 0) && (ignoreCache = false);
		this._url = url;
		if (url.indexOf("data:image") === 0) this._type = type = "image";
		else {
			this._type = type || (type = this.getTypeFromUrl(url));
			url = URL.formatURL(url);
		}
		this._cache = cache;
		this._data = null;
		if (!ignoreCache && Loader.loadedMap[url]) {
			this._data = Loader.loadedMap[url];
			this.event("progress", 1);
			this.event("complete", this._data);
			return;
		}
		if (group) Loader.setGroup(url, group);
		if (Loader.parserMap[type] != null) {
			if (((Loader.parserMap[type]) instanceof laya.utils.Handler)) Loader.parserMap[type].runWith(this);
			else Loader.parserMap[type].call(null, this);
			return;
		}
		if (type === "image" || type === "htmlimage" || type === "nativeimage") return this._loadImage(url);
		if (type === "sound") return this._loadSound(url);
		if (type == "atlas") {
			if (Loader.preLoadedAtlasConfigMap[url]) {
				this.onLoaded(Loader.preLoadedAtlasConfigMap[url]);
				delete Loader.preLoadedAtlasConfigMap[url];
				return;
			}
		}
		if (!this._http) {
			this._http = new HttpRequest();
			this._http.on("progress", this, this.onProgress);
			this._http.on("error", this, this.onError);
			this._http.on("complete", this, this.onLoaded);
		};
		var contentType;
		switch (type) {
			case "atlas":
				contentType = "json";
				break;
			case "font":
				contentType = "xml";
				break;
			default:
				contentType = type;
		}
		this._http.send(url, null, "get", contentType);
	}

	/**
	 *获取指定资源地址的数据类型。
	 *@param url 资源地址。
	 *@return 数据类型。
	 */
	__proto.getTypeFromUrl = function(url) {
		var type = Utils.getFileExtension(url);
		if (type) return Loader.typeMap[type];
		console.warn("Not recognize the resources suffix", url);
		return "text";
	}

	/**
	 *@private
	 *加载图片资源。
	 *@param url 资源地址。
	 */
	__proto._loadImage = function(url) {
		url = URL.formatURL(url);
		var _this = this;
		var image;

		function clear() {
			image.onload = null;
			image.onerror = null;
			delete Loader.imgCache[url]
		};
		var onload = function() {
			clear();
			_this.onLoaded(image);
		};
		var onerror = function() {
			clear();
			_this.event("error", "Load image failed");
		}
		if (this._type === "nativeimage") {
			image = new Browser.window.Image();
			image.crossOrigin = "";
			image.onload = onload;
			image.onerror = onerror;
			image.src = url;
			Loader.imgCache[url] = image;
		} else {
			new HTMLImage.create(url, {
				onload: onload,
				onerror: onerror,
				onCreate: function(img) {
					image = img;
					Loader.imgCache[url] = img;
				}
			});
		}
	}

	/**
	 *@private
	 *加载声音资源。
	 *@param url 资源地址。
	 */
	__proto._loadSound = function(url) {
		var sound = (new SoundManager._soundClass());
		var _this = this;
		sound.on("complete", this, soundOnload);
		sound.on("error", this, soundOnErr);
		sound.load(url);

		function soundOnload() {
			clear();
			_this.onLoaded(sound);
		}

		function soundOnErr() {
			clear();
			sound.dispose();
			_this.event("error", "Load sound failed");
		}

		function clear() {
			sound.offAll();
		}
	}

	/**@private */
	__proto.onProgress = function(value) {
		if (this._type === "atlas") this.event("progress", value * 0.3);
		else this.event("progress", value);
	}

	/**@private */
	__proto.onError = function(message) {
		this.event("error", message);
	}

	/**
	 *资源加载完成的处理函数。
	 *@param data 数据。
	 */
	__proto.onLoaded = function(data) {
		var type = this._type;
		if (type === "image") {
			var tex = new Texture(data);
			tex.url = this._url;
			this.complete(tex);
		} else if (type === "sound" || type === "htmlimage" || type === "nativeimage") {
			this.complete(data);
		} else if (type === "atlas") {
			if (!data.src && !data._setContext) {
				if (!this._data) {
					this._data = data;
					if (data.meta && data.meta.image) {
						var toloadPics = data.meta.image.split(",");
						var split = this._url.indexOf("/") >= 0 ? "/" : "\\";
						var idx = this._url.lastIndexOf(split);
						var folderPath = idx >= 0 ? this._url.substr(0, idx + 1) : "";
						for (var i = 0, len = toloadPics.length; i < len; i++) {
							toloadPics[i] = folderPath + toloadPics[i];
						}
					} else {
						toloadPics = [this._url.replace(".json", ".png")];
					}
					toloadPics.reverse();
					data.toLoads = toloadPics;
					data.pics = [];
				}
				this.event("progress", 0.3 + 1 / toloadPics.length * 0.6);
				return this._loadImage(toloadPics.pop());
			} else {
				this._data.pics.push(data);
				if (this._data.toLoads.length > 0) {
					this.event("progress", 0.3 + 1 / this._data.toLoads.length * 0.6);
					return this._loadImage(this._data.toLoads.pop());
				};
				var frames = this._data.frames;
				var cleanUrl = this._url.split("?")[0];
				var directory = (this._data.meta && this._data.meta.prefix) ? this._data.meta.prefix : cleanUrl.substring(0, cleanUrl.lastIndexOf(".")) + "/";
				var pics = this._data.pics;
				var atlasURL = URL.formatURL(this._url);
				var map = Loader.atlasMap[atlasURL] || (Loader.atlasMap[atlasURL] = []);
				map.dir = directory;
				for (var name in frames) {
					var obj = frames[name];
					var tPic = pics[obj.frame.idx ? obj.frame.idx : 0];
					var url = URL.formatURL(directory + name);
					Loader.cacheRes(url, Texture.create(tPic, obj.frame.x, obj.frame.y, obj.frame.w, obj.frame.h, obj.spriteSourceSize.x, obj.spriteSourceSize.y, obj.sourceSize.w, obj.sourceSize.h));
					Loader.loadedMap[url].url = url;
					map.push(url);
				}
				delete this._data.pics;
				this.complete(this._data);
			}
		} else if (type == "font") {
			if (!data.src) {
				this._data = data;
				this.event("progress", 0.5);
				return this._loadImage(this._url.replace(".fnt", ".png"));
			} else {
				var bFont = new BitmapFont();
				bFont.parseFont(this._data, data);
				var tArr = this._url.split(".fnt")[0].split("/");
				var fontName = tArr[tArr.length - 1];
				Text.registerBitmapFont(fontName, bFont);
				this._data = bFont;
				this.complete(this._data);
			}
		} else {
			this.complete(data);
		}
	}

	/**
	 *加载完成。
	 *@param data 加载的数据。
	 */
	__proto.complete = function(data) {
		this._data = data;
		Loader._loaders.push(this);
		if (!Loader._isWorking) Loader.checkNext();
	}

	/**
	 *结束加载，处理是否缓存及派发完成事件 <code>Event.COMPLETE</code> 。
	 *@param content 加载后的数据
	 */
	__proto.endLoad = function(content) {
		content && (this._data = content);
		if (this._cache) Loader.cacheRes(this._url, this._data);
		this.event("progress", 1);
		this.event("complete", (this.data instanceof Array) ? [this.data] : this.data);
	}

	/**加载地址。*/
	__getset(0, __proto, 'url', function() {
		return this._url;
	});

	/**返回的数据。*/
	__getset(0, __proto, 'data', function() {
		return this._data;
	});

	/**是否缓存。*/
	__getset(0, __proto, 'cache', function() {
		return this._cache;
	});

	/**加载类型。*/
	__getset(0, __proto, 'type', function() {
		return this._type;
	});

	Loader.checkNext = function() {
		Loader._isWorking = true;
		var startTimer = Browser.now();
		var thisTimer = startTimer;
		while (Loader._startIndex < Loader._loaders.length) {
			thisTimer = Browser.now();
			Loader._loaders[Loader._startIndex].endLoad();
			Loader._startIndex++;
			if (Browser.now() - startTimer > Loader.maxTimeOut) {
				console.warn("loader callback cost a long time:" + (Browser.now() - startTimer) + " url=" + Loader._loaders[Loader._startIndex - 1].url);
				Laya.timer.frameOnce(1, null, Loader.checkNext);
				return;
			}
		}
		Loader._loaders.length = 0;
		Loader._startIndex = 0;
		Loader._isWorking = false;
	}

	Loader.clearRes = function(url, forceDispose) {
		(forceDispose === void 0) && (forceDispose = false);
		url = URL.formatURL(url);
		var arr = Loader.getAtlas(url);
		if (arr) {
			for (var i = 0, n = arr.length; i < n; i++) {
				var resUrl = arr[i];
				var tex = Loader.getRes(resUrl);
				if (tex) tex.destroy(forceDispose);
				delete Loader.loadedMap[resUrl];
			}
			arr.length = 0;
			delete Loader.atlasMap[url];
			delete Loader.loadedMap[url];
		} else {
			var res = Loader.loadedMap[url];
			if (res) {
				if ((res instanceof laya.resource.Texture) && res.bitmap)(res).destroy(forceDispose);
				delete Loader.loadedMap[url];
			}
		}
	}

	Loader.setAtlasConfigs = function(url, config) {
		Loader.preLoadedAtlasConfigMap[URL.formatURL(url)] = config;
	}

	Loader.getRes = function(url) {
		return Loader.loadedMap[URL.formatURL(url)];
	}

	Loader.getAtlas = function(url) {
		return Loader.atlasMap[URL.formatURL(url)];
	}

	Loader.cacheRes = function(url, data) {
		url = URL.formatURL(url);
		if (Loader.loadedMap[url] != null) {
			console.warn("Resources already exist,is repeated loading:", url);
		} else {
			Loader.loadedMap[url] = data;
		}
	}

	Loader.setGroup = function(url, group) {
		if (!Loader.groupMap[group]) Loader.groupMap[group] = [];
		Loader.groupMap[group].push(url);
	}

	Loader.clearResByGroup = function(group) {
		if (!Loader.groupMap[group]) return;
		var arr = Loader.groupMap[group],
			i = 0,
			len = arr.length;
		for (i = 0; i < len; i++) {
			Loader.clearRes(arr[i]);
		}
		arr.length = 0;
	}

	Loader.TEXT = "text";
	Loader.JSON = "json";
	Loader.XML = "xml";
	Loader.BUFFER = "arraybuffer";
	Loader.IMAGE = "image";
	Loader.SOUND = "sound";
	Loader.ATLAS = "atlas";
	Loader.FONT = "font";
	Loader.typeMap = {
		"png": "image",
		"jpg": "image",
		"jpeg": "image",
		"txt": "text",
		"json": "json",
		"xml": "xml",
		"als": "atlas",
		"atlas": "atlas",
		"mp3": "sound",
		"ogg": "sound",
		"wav": "sound",
		"part": "json",
		"fnt": "font"
	};
	Loader.parserMap = {};
	Loader.groupMap = {};
	Loader.maxTimeOut = 100;
	Loader.loadedMap = {};
	Loader.preLoadedAtlasConfigMap = {};
	Loader.atlasMap = {};
	Loader._loaders = [];
	Loader._isWorking = false;
	Loader._startIndex = 0;
	Loader.imgCache = {};
	return Loader;
})(EventDispatcher)


var Node = (function(_super) {
	function Node() {
		this._bits = 0;
		this._displayedInStage = false;
		this._parent = null;
		this.conchModel = null;
		this.name = "";
		this.destroyed = false;
		Node.__super.call(this);
		this._childs = Node.ARRAY_EMPTY;
		this._$P = Node.PROP_EMPTY;
		this.timer = Laya.timer;
		this.conchModel = Render.isConchNode ? this.createConchModel() : null;
	}

	__class(Node, 'laya.display.Node', _super);
	var __proto = Node.prototype;
	/**@private */
	__proto._setBit = function(type, value) {
		if (type == 0x1) {
			var preValue = this._getBit(type);
			if (preValue != value) {
				this._updateDisplayedInstage();
			}
		}
		if (value) {
			this._bits |= type;
		} else {
			this._bits &= ~type;
		}
	}

	/**@private */
	__proto._getBit = function(type) {
		return (this._bits & type) != 0;
	}

	/**@private */
	__proto._setUpNoticeChain = function() {
		if (this._getBit(0x1)) {
			this._setUpNoticeType(0x1);
		}
	}

	/**@private */
	__proto._setUpNoticeType = function(type) {
		var ele = this;
		ele._setBit(type, true);
		ele = ele.parent;
		while (ele) {
			if (ele._getBit(type)) return;
			ele._setBit(type, true);
			ele = ele.parent;
		}
	}

	/**
	 *<p>增加事件侦听器，以使侦听器能够接收事件通知。</p>
	 *<p>如果侦听鼠标事件，则会自动设置自己和父亲节点的属性 mouseEnabled 的值为 true(如果父节点mouseEnabled=false，则停止设置父节点mouseEnabled属性)。</p>
	 *@param type 事件的类型。
	 *@param caller 事件侦听函数的执行域。
	 *@param listener 事件侦听函数。
	 *@param args （可选）事件侦听函数的回调参数。
	 *@return 此 EventDispatcher 对象。
	 */
	__proto.on = function(type, caller, listener, args) {
		if (type === "display" || type === "undisplay") {
			if (!this._getBit(0x1)) {
				this._setUpNoticeType(0x1);
			}
		}
		return this._createListener(type, caller, listener, args, false);
	}

	/**
	 *<p>增加事件侦听器，以使侦听器能够接收事件通知，此侦听事件响应一次后则自动移除侦听。</p>
	 *<p>如果侦听鼠标事件，则会自动设置自己和父亲节点的属性 mouseEnabled 的值为 true(如果父节点mouseEnabled=false，则停止设置父节点mouseEnabled属性)。</p>
	 *@param type 事件的类型。
	 *@param caller 事件侦听函数的执行域。
	 *@param listener 事件侦听函数。
	 *@param args （可选）事件侦听函数的回调参数。
	 *@return 此 EventDispatcher 对象。
	 */
	__proto.once = function(type, caller, listener, args) {
		if (type === "display" || type === "undisplay") {
			if (!this._getBit(0x1)) {
				this._setUpNoticeType(0x1);
			}
		}
		return this._createListener(type, caller, listener, args, true);
	}

	/**@private */
	__proto.createConchModel = function() {
		return null;
	}

	/**
	 *<p>销毁此对象。destroy对象默认会把自己从父节点移除，并且清理自身引用关系，等待js自动垃圾回收机制回收。destroy后不能再使用。</p>
	 *<p>destroy时会移除自身的事情监听，自身的timer监听，移除子对象及从父节点移除自己。</p>
	 *@param destroyChild （可选）是否同时销毁子节点，若值为true,则销毁子节点，否则不销毁子节点。
	 */
	__proto.destroy = function(destroyChild) {
		(destroyChild === void 0) && (destroyChild = true);
		this.destroyed = true;
		this._parent && this._parent.removeChild(this);
		if (this._childs) {
			if (destroyChild) this.destroyChildren();
			else this.removeChildren();
		}
		this._childs = null;
		this._$P = null;
		this.offAll();
		this.timer.clearAll(this);
	}

	/**
	 *销毁所有子对象，不销毁自己本身。
	 */
	__proto.destroyChildren = function() {
		if (this._childs) {
			for (var i = this._childs.length - 1; i > -1; i--) {
				this._childs[i].destroy(true);
			}
		}
	}

	/**
	 *添加子节点。
	 *@param node 节点对象
	 *@return 返回添加的节点
	 */
	__proto.addChild = function(node) {
		if (!node || this.destroyed || node === this) return node;
		if ((node).zOrder) this._set$P("hasZorder", true);
		if (node._parent === this) {
			var index = this.getChildIndex(node);
			if (index !== this._childs.length - 1) {
				this._childs.splice(index, 1);
				this._childs.push(node);
				if (this.conchModel) {
					this.conchModel.removeChild(node.conchModel);
					this.conchModel.addChildAt(node.conchModel, this._childs.length - 1);
				}
				this._childChanged();
			}
		} else {
			node.parent && node.parent.removeChild(node);
			this._childs === Node.ARRAY_EMPTY && (this._childs = []);
			this._childs.push(node);
			this.conchModel && this.conchModel.addChildAt(node.conchModel, this._childs.length - 1);
			node.parent = this;
			this._childChanged();
		}
		return node;
	}

	/**
	 *批量增加子节点
	 *@param ...args 无数子节点。
	 */
	__proto.addChildren = function(__args) {
		var args = arguments;
		var i = 0,
			n = args.length;
		while (i < n) {
			this.addChild(args[i++]);
		}
	}

	/**
	 *添加子节点到指定的索引位置。
	 *@param node 节点对象。
	 *@param index 索引位置。
	 *@return 返回添加的节点。
	 */
	__proto.addChildAt = function(node, index) {
		if (!node || this.destroyed || node === this) return node;
		if ((node).zOrder) this._set$P("hasZorder", true);
		if (index >= 0 && index <= this._childs.length) {
			if (node._parent === this) {
				var oldIndex = this.getChildIndex(node);
				this._childs.splice(oldIndex, 1);
				this._childs.splice(index, 0, node);
				if (this.conchModel) {
					this.conchModel.removeChild(node.conchModel);
					this.conchModel.addChildAt(node.conchModel, index);
				}
				this._childChanged();
			} else {
				node.parent && node.parent.removeChild(node);
				this._childs === Node.ARRAY_EMPTY && (this._childs = []);
				this._childs.splice(index, 0, node);
				this.conchModel && this.conchModel.addChildAt(node.conchModel, index);
				node.parent = this;
			}
			return node;
		} else {
			throw new Error("appendChildAt:The index is out of bounds");
		}
	}

	/**
	 *根据子节点对象，获取子节点的索引位置。
	 *@param node 子节点。
	 *@return 子节点所在的索引位置。
	 */
	__proto.getChildIndex = function(node) {
		return this._childs.indexOf(node);
	}

	/**
	 *根据子节点的名字，获取子节点对象。
	 *@param name 子节点的名字。
	 *@return 节点对象。
	 */
	__proto.getChildByName = function(name) {
		var nodes = this._childs;
		if (nodes) {
			for (var i = 0, n = nodes.length; i < n; i++) {
				var node = nodes[i];
				if (node.name === name) return node;
			}
		}
		return null;
	}

	/**@private */
	__proto._get$P = function(key) {
		return this._$P[key];
	}

	/**@private */
	__proto._set$P = function(key, value) {
		if (!this.destroyed) {
			this._$P === Node.PROP_EMPTY && (this._$P = {});
			this._$P[key] = value;
		}
		return value;
	}

	/**
	 *根据子节点的索引位置，获取子节点对象。
	 *@param index 索引位置
	 *@return 子节点
	 */
	__proto.getChildAt = function(index) {
		return this._childs[index];
	}

	/**
	 *设置子节点的索引位置。
	 *@param node 子节点。
	 *@param index 新的索引。
	 *@return 返回子节点本身。
	 */
	__proto.setChildIndex = function(node, index) {
		var childs = this._childs;
		if (index < 0 || index >= childs.length) {
			throw new Error("setChildIndex:The index is out of bounds.");
		};
		var oldIndex = this.getChildIndex(node);
		if (oldIndex < 0) throw new Error("setChildIndex:node is must child of this object.");
		childs.splice(oldIndex, 1);
		childs.splice(index, 0, node);
		if (this.conchModel) {
			this.conchModel.removeChild(node.conchModel);
			this.conchModel.addChildAt(node.conchModel, index);
		}
		this._childChanged();
		return node;
	}

	/**
	 *@private
	 *子节点发生改变。
	 *@param child 子节点。
	 */
	__proto._childChanged = function(child) {}
	/**
	 *删除子节点。
	 *@param node 子节点
	 *@return 被删除的节点
	 */
	__proto.removeChild = function(node) {
		if (!this._childs) return node;
		var index = this._childs.indexOf(node);
		return this.removeChildAt(index);
	}

	/**
	 *从父容器删除自己，如已经被删除不会抛出异常。
	 *@return 当前节点（ Node ）对象。
	 */
	__proto.removeSelf = function() {
		this._parent && this._parent.removeChild(this);
		return this;
	}

	/**
	 *根据子节点名字删除对应的子节点对象，如果找不到不会抛出异常。
	 *@param name 对象名字。
	 *@return 查找到的节点（ Node ）对象。
	 */
	__proto.removeChildByName = function(name) {
		var node = this.getChildByName(name);
		node && this.removeChild(node);
		return node;
	}

	/**
	 *根据子节点索引位置，删除对应的子节点对象。
	 *@param index 节点索引位置。
	 *@return 被删除的节点。
	 */
	__proto.removeChildAt = function(index) {
		var node = this.getChildAt(index);
		if (node) {
			this._childs.splice(index, 1);
			this.conchModel && this.conchModel.removeChild(node.conchModel);
			node.parent = null;
		}
		return node;
	}

	/**
	 *删除指定索引区间的所有子对象。
	 *@param beginIndex 开始索引。
	 *@param endIndex 结束索引。
	 *@return 当前节点对象。
	 */
	__proto.removeChildren = function(beginIndex, endIndex) {
		(beginIndex === void 0) && (beginIndex = 0);
		(endIndex === void 0) && (endIndex = 0x7fffffff);
		if (this._childs && this._childs.length > 0) {
			var childs = this._childs;
			if (beginIndex === 0 && endIndex >= n) {
				var arr = childs;
				this._childs = Node.ARRAY_EMPTY;
			} else {
				arr = childs.splice(beginIndex, endIndex - beginIndex);
			}
			for (var i = 0, n = arr.length; i < n; i++) {
				arr[i].parent = null;
				this.conchModel && this.conchModel.removeChild(arr[i].conchModel);
			}
		}
		return this;
	}

	/**
	 *替换子节点。
	 *@internal 将传入的新节点对象替换到已有子节点索引位置处。
	 *@param newNode 新节点。
	 *@param oldNode 老节点。
	 *@return 返回新节点。
	 */
	__proto.replaceChild = function(newNode, oldNode) {
		var index = this._childs.indexOf(oldNode);
		if (index > -1) {
			this._childs.splice(index, 1, newNode);
			if (this.conchModel) {
				this.conchModel.removeChild(oldNode.conchModel);
				this.conchModel.addChildAt(newNode.conchModel, index);
			}
			oldNode.parent = null;
			newNode.parent = this;
			return newNode;
		}
		return null;
	}

	/**@private */
	__proto._updateDisplayedInstage = function() {
		var ele;
		ele = this;
		var stage = Laya.stage;
		this._displayedInStage = false;
		while (ele) {
			if (ele._getBit(0x1)) {
				this._displayedInStage = ele._displayedInStage;
				break;
			}
			if (ele == stage || ele._displayedInStage) {
				this._displayedInStage = true;
				break;
			}
			ele = ele.parent;
		}
	}

	/**@private */
	__proto._setDisplay = function(value) {
		if (this._displayedInStage !== value) {
			this._displayedInStage = value;
			if (value) this.event("display");
			else this.event("undisplay");
		}
	}

	/**
	 *@private
	 *设置指定节点对象是否可见(是否在渲染列表中)。
	 *@param node 节点。
	 *@param display 是否可见。
	 */
	__proto._displayChild = function(node, display) {
		var childs = node._childs;
		if (childs) {
			for (var i = 0, n = childs.length; i < n; i++) {
				var child = childs[i];
				if (!child._getBit(0x1)) continue;
				if (child._childs.length > 0) {
					this._displayChild(child, display);
				} else {
					child._setDisplay(display);
				}
			}
		}
		node._setDisplay(display);
	}

	/**
	 *当前容器是否包含指定的 <code>Node</code> 节点对象 。
	 *@param node 指定的 <code>Node</code> 节点对象 。
	 *@return 一个布尔值表示是否包含指定的 <code>Node</code> 节点对象 。
	 */
	__proto.contains = function(node) {
		if (node === this) return true;
		while (node) {
			if (node.parent === this) return true;
			node = node.parent;
		}
		return false;
	}

	/**
	 *定时重复执行某函数。功能同Laya.timer.timerLoop()。
	 *@param delay 间隔时间(单位毫秒)。
	 *@param caller 执行域(this)。
	 *@param method 结束时的回调方法。
	 *@param args （可选）回调参数。
	 *@param coverBefore （可选）是否覆盖之前的延迟执行，默认为true。
	 *@param jumpFrame 时钟是否跳帧。基于时间的循环回调，单位时间间隔内，如能执行多次回调，出于性能考虑，引擎默认只执行一次，设置jumpFrame=true后，则回调会连续执行多次
	 */
	__proto.timerLoop = function(delay, caller, method, args, coverBefore, jumpFrame) {
		(coverBefore === void 0) && (coverBefore = true);
		(jumpFrame === void 0) && (jumpFrame = false);
		this.timer.loop(delay, caller, method, args, coverBefore, jumpFrame);
	}

	/**
	 *定时执行某函数一次。功能同Laya.timer.timerOnce()。
	 *@param delay 延迟时间(单位毫秒)。
	 *@param caller 执行域(this)。
	 *@param method 结束时的回调方法。
	 *@param args （可选）回调参数。
	 *@param coverBefore （可选）是否覆盖之前的延迟执行，默认为true。
	 */
	__proto.timerOnce = function(delay, caller, method, args, coverBefore) {
		(coverBefore === void 0) && (coverBefore = true);
		this.timer._create(false, false, delay, caller, method, args, coverBefore);
	}

	/**
	 *定时重复执行某函数(基于帧率)。功能同Laya.timer.frameLoop()。
	 *@param delay 间隔几帧(单位为帧)。
	 *@param caller 执行域(this)。
	 *@param method 结束时的回调方法。
	 *@param args （可选）回调参数。
	 *@param coverBefore （可选）是否覆盖之前的延迟执行，默认为true。
	 */
	__proto.frameLoop = function(delay, caller, method, args, coverBefore) {
		(coverBefore === void 0) && (coverBefore = true);
		this.timer._create(true, true, delay, caller, method, args, coverBefore);
	}

	/**
	 *定时执行一次某函数(基于帧率)。功能同Laya.timer.frameOnce()。
	 *@param delay 延迟几帧(单位为帧)。
	 *@param caller 执行域(this)
	 *@param method 结束时的回调方法
	 *@param args （可选）回调参数
	 *@param coverBefore （可选）是否覆盖之前的延迟执行，默认为true
	 */
	__proto.frameOnce = function(delay, caller, method, args, coverBefore) {
		(coverBefore === void 0) && (coverBefore = true);
		this.timer._create(true, false, delay, caller, method, args, coverBefore);
	}

	/**
	 *清理定时器。功能同Laya.timer.clearTimer()。
	 *@param caller 执行域(this)。
	 *@param method 结束时的回调方法。
	 */
	__proto.clearTimer = function(caller, method) {
		this.timer.clear(caller, method);
	}

	/**
	 *子对象数量。
	 */
	__getset(0, __proto, 'numChildren', function() {
		return this._childs.length;
	});

	/**父节点。*/
	__getset(0, __proto, 'parent', function() {
		return this._parent;
	}, function(value) {
		if (this._parent !== value) {
			if (value) {
				this._parent = value;
				this.event("added");
				if (this._getBit(0x1)) {
					this._setUpNoticeChain();
					value.displayedInStage && this._displayChild(this, true);
				}
				value._childChanged(this);
			} else {
				this.event("removed");
				this._parent._childChanged();
				if (this._getBit(0x1)) this._displayChild(this, false);
				this._parent = value;
			}
		}
	});

	/**表示是否在显示列表中显示。*/
	__getset(0, __proto, 'displayedInStage', function() {
		if (this._getBit(0x1)) return this._displayedInStage;
		this._setUpNoticeType(0x1);
		return this._displayedInStage;
	});

	Node.ARRAY_EMPTY = [];
	Node.PROP_EMPTY = {};
	Node.NOTICE_DISPLAY = 0x1;
	Node.MOUSEENABLE = 0x2;
	return Node;
})(EventDispatcher)


//class laya.display.Sprite extends laya.display.Node
var Sprite = (function(_super) {
	function Sprite() {
		this._transform = null;
		this._tfChanged = false;
		this._x = 0;
		this._y = 0;
		this._width = 0;
		this._height = 0;
		this._repaint = 1;
		this._mouseEnableState = 0;
		this._zOrder = 0;
		this._graphics = null;
		this._renderType = 0;
		this._optimizeScrollRect = false;
		this._texture = null;
		this._childRenderMax = false;
		this.mouseThrough = false;
		this.autoSize = false;
		this.hitTestPrior = false;
		this.viewport = null;
		Sprite.__super.call(this);
		this._style = Style.EMPTY;
	}

	__class(Sprite, 'laya.display.Sprite', _super);
	var __proto = Sprite.prototype;
	Laya.imps(__proto, {
		"laya.display.ILayout": true
	})
	/**@private */
	__proto.createConchModel = function() {
		return new ConchNode();
	}

	/**@inheritDoc */
	__proto.destroy = function(destroyChild) {
		(destroyChild === void 0) && (destroyChild = true);
		_super.prototype.destroy.call(this, destroyChild);
		this._style && this._style.destroy();
		this._transform = null;
		this._style = null;
		this._graphics = null;
	}

	/**根据zOrder进行重新排序。*/
	__proto.updateZOrder = function() {
		Utils$1.updateOrder(this._childs) && this.repaint();
	}

	/**在设置cacheAs的情况下，调用此方法会重新刷新缓存。*/
	__proto.reCache = function() {
		if (this._$P.cacheCanvas) this._$P.cacheCanvas.reCache = true;
		this._repaint = 1;
	}

	/**
	 *<p>设置对象在自身坐标系下的边界范围。与 <code>getSelfBounds</code> 对应。当 autoSize==true 时，会影响对象宽高。设置后，当需要获取自身边界范围时，就不再需要计算，合理使用能提高性能。比如 <code>getBounds</code> 会优先使用 <code>setBounds</code> 指定的值，如果没有指定则进行计算，此计算会对性能消耗比较大。</p>
	 *<p><b>注意：</b> <code>setBounds</code> 与 <code>getBounds</code> 并非对应相等关系， <code>getBounds</code> 获取的是本对象在父容器坐标系下的边界范围，通过设置 <code>setBounds</code> 会影响 <code>getBounds</code> 的结果。</p>
	 *@param bound bounds矩形区域
	 */
	__proto.setBounds = function(bound) {
		this._set$P("uBounds", bound);
	}

	/**
	 *<p>获取本对象在父容器坐标系的矩形显示区域。</p>
	 *<p><b>注意：</b> 1.计算量较大，尽量少用，如果需要频繁使用，可以通过手动设置 <code>setBounds</code> 来缓存自身边界信息，从而避免比较消耗性能的计算。2. <code>setBounds</code> 与 <code>getBounds</code> 并非对应相等关系， <code>getBounds</code> 获取的是本对象在父容器坐标系下的边界范围，通过设置 <code>setBounds</code> 会影响 <code>getBounds</code> 的结果。</p>
	 *@return 矩形区域。
	 */
	__proto.getBounds = function() {
		if (!this._$P.mBounds) this._set$P("mBounds", new Rectangle());
		return Rectangle._getWrapRec(this._boundPointsToParent(), this._$P.mBounds);
	}

	/**
	 *获取对象在自身坐标系的边界范围。与 <code>setBounds</code> 对应。
	 *<p><b>注意：</b>计算量较大，尽量少用，如果需要频繁使用，可以提前手动设置 <code>setBounds</code> 来缓存自身边界信息，从而避免比较消耗性能的计算。</p>
	 *@return 矩形区域。
	 */
	__proto.getSelfBounds = function() {
		if (this._$P.uBounds) return this._$P.uBounds;
		if (!this._$P.mBounds) this._set$P("mBounds", new Rectangle());
		return Rectangle._getWrapRec(this._getBoundPointsM(false), this._$P.mBounds);
	}

	/**
	 *@private
	 *获取本对象在父容器坐标系的显示区域多边形顶点列表。
	 *当显示对象链中有旋转时，返回多边形顶点列表，无旋转时返回矩形的四个顶点。
	 *@param ifRotate （可选）之前的对象链中是否有旋转。
	 *@return 顶点列表。结构：[x1,y1,x2,y2,x3,y3,...]。
	 */
	__proto._boundPointsToParent = function(ifRotate) {
		(ifRotate === void 0) && (ifRotate = false);
		var pX = 0,
			pY = 0;
		if (this._style) {
			pX = this._style._tf.translateX;
			pY = this._style._tf.translateY;
			ifRotate = ifRotate || (this._style._tf.rotate !== 0);
			if (this._style.scrollRect) {
				pX += this._style.scrollRect.x;
				pY += this._style.scrollRect.y;
			}
		};
		var pList = this._getBoundPointsM(ifRotate);
		if (!pList || pList.length < 1) return pList;
		if (pList.length != 8) {
			pList = ifRotate ? GrahamScan.scanPList(pList) : Rectangle._getWrapRec(pList, Rectangle.TEMP)._getBoundPoints();
		}
		if (!this.transform) {
			Utils$1.transPointList(pList, this._x - pX, this._y - pY);
			return pList;
		};
		var tPoint = Point.TEMP;
		var i = 0,
			len = pList.length;
		for (i = 0; i < len; i += 2) {
			tPoint.x = pList[i];
			tPoint.y = pList[i + 1];
			this.toParentPoint(tPoint);
			pList[i] = tPoint.x;
			pList[i + 1] = tPoint.y;
		}
		return pList;
	}

	/**
	 *返回此实例中的绘图对象（ <code>Graphics</code> ）的显示区域，不包括子对象。
	 *@param realSize （可选）使用图片的真实大小，默认为false
	 *@return 一个 Rectangle 对象，表示获取到的显示区域。
	 */
	__proto.getGraphicBounds = function(realSize) {
		(realSize === void 0) && (realSize = false);
		if (!this._graphics) return Rectangle.TEMP.setTo(0, 0, 0, 0);
		return this._graphics.getBounds(realSize);
	}

	/**
	 *
	 *@private
	 *获取自己坐标系的显示区域多边形顶点列表
	 *@param ifRotate （可选）当前的显示对象链是否由旋转
	 *@return 顶点列表。结构：[x1,y1,x2,y2,x3,y3,...]。
	 */
	__proto._getBoundPointsM = function(ifRotate) {
		(ifRotate === void 0) && (ifRotate = false);
		if (this._$P.uBounds) return this._$P.uBounds._getBoundPoints();
		if (!this._$P.temBM) this._set$P("temBM", []);
		if (this.scrollRect) {
			var rst = Utils$1.clearArray(this._$P.temBM);
			var rec = Rectangle.TEMP;
			rec.copyFrom(this.scrollRect);
			Utils$1.concatArray(rst, rec._getBoundPoints());
			return rst;
		};
		var pList = this._graphics ? this._graphics.getBoundPoints() : Utils$1.clearArray(this._$P.temBM);
		var child;
		var cList;
		var __childs;
		__childs = this._childs;
		for (var i = 0, n = __childs.length; i < n; i++) {
			child = __childs[i];
			if ((child instanceof laya.display.Sprite) && child.visible == true) {
				cList = child._boundPointsToParent(ifRotate);
				if (cList)
					pList = pList ? Utils$1.concatArray(pList, cList) : cList;
			}
		}
		return pList;
	}

	/**
	 *@private
	 *获取样式。
	 *@return 样式 Style 。
	 */
	__proto.getStyle = function() {
		this._style === Style.EMPTY && (this._style = new Style(), this._childRenderMax = true);
		return this._style;
	}

	/**
	 *@private
	 *设置样式。
	 *@param value 样式。
	 */
	__proto.setStyle = function(value) {
		this._style = value;
	}

	/**@private */
	__proto._adjustTransform = function() {
		'use strict';
		this._tfChanged = false;
		var style = this._style;
		var tf = style._tf;
		var sx = tf.scaleX,
			sy = tf.scaleY;
		var m;
		if (tf.rotate || sx !== 1 || sy !== 1 || tf.skewX || tf.skewY) {
			m = this._transform || (this._transform = Matrix.create());
			m.bTransform = true;
			var skx = (tf.rotate - tf.skewX) * 0.0174532922222222;
			var sky = (tf.rotate + tf.skewY) * 0.0174532922222222;
			var cx = Math.cos(sky);
			var ssx = Math.sin(sky);
			var cy = Math.sin(skx);
			var ssy = Math.cos(skx);
			m.a = sx * cx;
			m.b = sx * ssx;
			m.c = -sy * cy;
			m.d = sy * ssy;
			m.tx = m.ty = 0;
			return m;
		} else {
			this._transform && this._transform.destroy();
			this._transform = null;
			this._renderType &= ~0x04;
		}
		return m;
	}

	/**
	 *<p>设置坐标位置。相当于分别设置x和y属性。</p>
	 *<p>因为返回值为Sprite对象本身，所以可以使用如下语法：spr.pos(...).scale(...);</p>
	 *@param x X轴坐标。
	 *@param y Y轴坐标。
	 *@param speedMode （可选）是否极速模式，正常是调用this.x=value进行赋值，极速模式直接调用内部函数处理，如果未重写x,y属性，建议设置为急速模式性能更高。
	 *@return 返回对象本身。
	 */
	__proto.pos = function(x, y, speedMode) {
		(speedMode === void 0) && (speedMode = false);
		if (this._x !== x || this._y !== y) {
			if (this.destroyed) return this;
			if (speedMode) {
				this._x = x;
				this._y = y;
				this.conchModel && this.conchModel.pos(this._x, this._y);
				var p = this._parent;
				if (p && p._repaint === 0) {
					p._repaint = 1;
					p.parentRepaint();
				}
				if (this._$P.maskParent && this._$P.maskParent._repaint === 0) {
					this._$P.maskParent._repaint = 1;
					this._$P.maskParent.parentRepaint();
				}
			} else {
				this.x = x;
				this.y = y;
			}
		}
		return this;
	}

	/**
	 *<p>设置轴心点。相当于分别设置pivotX和pivotY属性。</p>
	 *<p>因为返回值为Sprite对象本身，所以可以使用如下语法：spr.pivot(...).pos(...);</p>
	 *@param x X轴心点。
	 *@param y Y轴心点。
	 *@return 返回对象本身。
	 */
	__proto.pivot = function(x, y) {
		this.pivotX = x;
		this.pivotY = y;
		return this;
	}

	/**
	 *<p>设置宽高。相当于分别设置width和height属性。</p>
	 *<p>因为返回值为Sprite对象本身，所以可以使用如下语法：spr.size(...).pos(...);</p>
	 *@param width 宽度值。
	 *@param hegiht 高度值。
	 *@return 返回对象本身。
	 */
	__proto.size = function(width, height) {
		this.width = width;
		this.height = height;
		return this;
	}

	/**
	 *<p>设置缩放。相当于分别设置scaleX和scaleY属性。</p>
	 *<p>因为返回值为Sprite对象本身，所以可以使用如下语法：spr.scale(...).pos(...);</p>
	 *@param scaleX X轴缩放比例。
	 *@param scaleY Y轴缩放比例。
	 *@param speedMode （可选）是否极速模式，正常是调用this.scaleX=value进行赋值，极速模式直接调用内部函数处理，如果未重写scaleX,scaleY属性，建议设置为急速模式性能更高。
	 *@return 返回对象本身。
	 */
	__proto.scale = function(scaleX, scaleY, speedMode) {
		(speedMode === void 0) && (speedMode = false);
		var style = this.getStyle();
		var _tf = style._tf;
		if (_tf.scaleX != scaleX || _tf.scaleY != scaleY) {
			if (this.destroyed) return this;
			if (speedMode) {
				style.setScale(scaleX, scaleY);
				this._tfChanged = true;
				this.conchModel && this.conchModel.scale(scaleX, scaleY);
				this._renderType |= 0x04;
				var p = this._parent;
				if (p && p._repaint === 0) {
					p._repaint = 1;
					p.parentRepaint();
				}
			} else {
				this.scaleX = scaleX;
				this.scaleY = scaleY;
			}
		}
		return this;
	}

	/**
	 *<p>设置倾斜角度。相当于分别设置skewX和skewY属性。</p>
	 *<p>因为返回值为Sprite对象本身，所以可以使用如下语法：spr.skew(...).pos(...);</p>
	 *@param skewX 水平倾斜角度。
	 *@param skewY 垂直倾斜角度。
	 *@return 返回对象本身
	 */
	__proto.skew = function(skewX, skewY) {
		this.skewX = skewX;
		this.skewY = skewY;
		return this;
	}

	/**
	 *更新、呈现显示对象。由系统调用。
	 *@param context 渲染的上下文引用。
	 *@param x X轴坐标。
	 *@param y Y轴坐标。
	 */
	__proto.render = function(context, x, y) {
		Stat.spriteCount++;
		RenderSprite.renders[this._renderType]._fun(this, context, x + this._x, y + this._y);
		this._repaint = 0;
	}

	/**
	 *<p>绘制 当前<code>Sprite</code> 到 <code>Canvas</code> 上，并返回一个HtmlCanvas。</p>
	 *<p>绘制的结果可以当作图片源，再次绘制到其他Sprite里面，示例：</p>
	 *
	 *var htmlCanvas:HTMLCanvas=sprite.drawToCanvas(100,100,0,0);//把精灵绘制到canvas上面
	 *var texture:Texture=new Texture(htmlCanvas);//使用htmlCanvas创建Texture
	 *var sp:Sprite=new Sprite().pos(0,200);//创建精灵并把它放倒200位置
	 *sp.graphics.drawTexture(texture);//把截图绘制到精灵上
	 *Laya.stage.addChild(sp);//把精灵显示到舞台
	 *
	 *<p>也可以获取原始图片数据，分享到网上，从而实现截图效果，示例：</p>
	 *
	 *var htmlCanvas:HTMLCanvas=sprite.drawToCanvas(100,100,0,0);//把精灵绘制到canvas上面
	 *var canvas:*=htmlCanvas.getCanvas();//获取原生的canvas对象
	 *trace(canvas.toDataURL("image/png"));//打印图片base64信息，可以发给服务器或者保存为图片
	 *
	 *@param canvasWidth 画布宽度。
	 *@param canvasHeight 画布高度。
	 *@param x 绘制的 X 轴偏移量。
	 *@param y 绘制的 Y 轴偏移量。
	 *@return HTMLCanvas 对象。
	 */
	__proto.drawToCanvas = function(canvasWidth, canvasHeight, offsetX, offsetY) {
		if (Render.isConchNode) {
			var canvas = HTMLCanvas.create("2D");
			var context = new RenderContext(canvasWidth, canvasHeight, canvas);
			context.ctx.setCanvasType(1);
			this.conchModel.drawToCanvas(canvas.source, offsetX, offsetY);
			return canvas;
		} else {
			return RunDriver.drawToCanvas(this, this._renderType, canvasWidth, canvasHeight, offsetX, offsetY);
		}
	}

	/**
	 *<p>自定义更新、呈现显示对象。一般用来扩展渲染模式，请合理使用，可能会导致在加速器上无法渲染。</p>
	 *<p><b>注意</b>不要在此函数内增加或删除树节点，否则会对树节点遍历造成影响。</p>
	 *@param context 渲染的上下文引用。
	 *@param x X轴坐标。
	 *@param y Y轴坐标。
	 */
	__proto.customRender = function(context, x, y) {
		this._renderType |= 0x400;
	}

	/**
	 *@private
	 *应用滤镜。
	 */
	__proto._applyFilters = function() {
		if (Render.isWebGL) return;
		var _filters;
		_filters = this._$P.filters;
		if (!_filters || _filters.length < 1) return;
		for (var i = 0, n = _filters.length; i < n; i++) {
			_filters[i].action.apply(this._$P.cacheCanvas);
		}
	}

	/**
	 *@private
	 *查看当前原件中是否包含发光滤镜。
	 *@return 一个 Boolean 值，表示当前原件中是否包含发光滤镜。
	 */
	__proto._isHaveGlowFilter = function() {
		var i = 0,
			len = 0;
		if (this.filters) {
			for (i = 0; i < this.filters.length; i++) {
				if (this.filters[i].type == 0x08) {
					return true;
				}
			}
		}
		for (i = 0, len = this._childs.length; i < len; i++) {
			if (this._childs[i]._isHaveGlowFilter()) {
				return true;
			}
		}
		return false;
	}

	/**
	 *把本地坐标转换为相对stage的全局坐标。
	 *@param point 本地坐标点。
	 *@param createNewPoint （可选）是否创建一个新的Point对象作为返回值，默认为false，使用输入的point对象返回，减少对象创建开销。
	 *@return 转换后的坐标的点。
	 */
	__proto.localToGlobal = function(point, createNewPoint) {
		(createNewPoint === void 0) && (createNewPoint = false);
		if (createNewPoint === true) {
			point = new Point(point.x, point.y);
		};
		var ele = this;
		while (ele) {
			if (ele == Laya.stage) break;
			point = ele.toParentPoint(point);
			ele = ele.parent;
		}
		return point;
	}

	/**
	 *把stage的全局坐标转换为本地坐标。
	 *@param point 全局坐标点。
	 *@param createNewPoint （可选）是否创建一个新的Point对象作为返回值，默认为false，使用输入的point对象返回，减少对象创建开销。
	 *@return 转换后的坐标的点。
	 */
	__proto.globalToLocal = function(point, createNewPoint) {
		(createNewPoint === void 0) && (createNewPoint = false);
		if (createNewPoint) {
			point = new Point(point.x, point.y);
		};
		var ele = this;
		var list = [];
		while (ele) {
			if (ele == Laya.stage) break;
			list.push(ele);
			ele = ele.parent;
		};
		var i = list.length - 1;
		while (i >= 0) {
			ele = list[i];
			point = ele.fromParentPoint(point);
			i--;
		}
		return point;
	}

	/**
	 *将本地坐标系坐标转转换到父容器坐标系。
	 *@param point 本地坐标点。
	 *@return 转换后的点。
	 */
	__proto.toParentPoint = function(point) {
		if (!point) return point;
		point.x -= this.pivotX;
		point.y -= this.pivotY;
		if (this.transform) {
			this._transform.transformPoint(point);
		}
		point.x += this._x;
		point.y += this._y;
		var scroll = this._style.scrollRect;
		if (scroll) {
			point.x -= scroll.x;
			point.y -= scroll.y;
		}
		return point;
	}

	/**
	 *将父容器坐标系坐标转换到本地坐标系。
	 *@param point 父容器坐标点。
	 *@return 转换后的点。
	 */
	__proto.fromParentPoint = function(point) {
		if (!point) return point;
		point.x -= this._x;
		point.y -= this._y;
		var scroll = this._style.scrollRect;
		if (scroll) {
			point.x += scroll.x;
			point.y += scroll.y;
		}
		if (this.transform) {
			this._transform.invertTransformPoint(point);
		}
		point.x += this.pivotX;
		point.y += this.pivotY;
		return point;
	}

	/**
	 *<p>增加事件侦听器，以使侦听器能够接收事件通知。</p>
	 *<p>如果侦听鼠标事件，则会自动设置自己和父亲节点的属性 mouseEnabled 的值为 true(如果父节点mouseEnabled=false，则停止设置父节点mouseEnabled属性)。</p>
	 *@param type 事件的类型。
	 *@param caller 事件侦听函数的执行域。
	 *@param listener 事件侦听函数。
	 *@param args （可选）事件侦听函数的回调参数。
	 *@return 此 EventDispatcher 对象。
	 */
	__proto.on = function(type, caller, listener, args) {
		if (this._mouseEnableState !== 1 && this.isMouseEvent(type)) {
			this.mouseEnabled = true;
			this._setBit(0x2, true);
			if (this._parent) {
				this._$2__onDisplay();
			}
			return this._createListener(type, caller, listener, args, false);
		}
		return _super.prototype.on.call(this, type, caller, listener, args);
	}

	/**
	 *<p>增加事件侦听器，以使侦听器能够接收事件通知，此侦听事件响应一次后则自动移除侦听。</p>
	 *<p>如果侦听鼠标事件，则会自动设置自己和父亲节点的属性 mouseEnabled 的值为 true(如果父节点mouseEnabled=false，则停止设置父节点mouseEnabled属性)。</p>
	 *@param type 事件的类型。
	 *@param caller 事件侦听函数的执行域。
	 *@param listener 事件侦听函数。
	 *@param args （可选）事件侦听函数的回调参数。
	 *@return 此 EventDispatcher 对象。
	 */
	__proto.once = function(type, caller, listener, args) {
		if (this._mouseEnableState !== 1 && this.isMouseEvent(type)) {
			this.mouseEnabled = true;
			this._setBit(0x2, true);
			if (this._parent) {
				this._$2__onDisplay();
			}
			return this._createListener(type, caller, listener, args, true);
		}
		return _super.prototype.once.call(this, type, caller, listener, args);
	}

	/**@private */
	__proto._$2__onDisplay = function() {
		if (this._mouseEnableState !== 1) {
			var ele = this;
			ele = ele.parent;
			while (ele && ele._mouseEnableState !== 1) {
				if (ele._getBit(0x2)) break;
				ele.mouseEnabled = true;
				ele._setBit(0x2, true);
				ele = ele.parent;
			}
		}
	}

	/**
	 *<p>加载并显示一个图片。功能等同于graphics.loadImage方法。支持异步加载。</p>
	 *<p>注意：多次调用loadImage绘制不同的图片，会同时显示。</p>
	 *@param url 图片地址。
	 *@param x （可选）显示图片的x位置。
	 *@param y （可选）显示图片的y位置。
	 *@param width （可选）显示图片的宽度，设置为0表示使用图片默认宽度。
	 *@param height （可选）显示图片的高度，设置为0表示使用图片默认高度。
	 *@param complete （可选）加载完成回调。
	 *@return 返回精灵对象本身。
	 */
	__proto.loadImage = function(url, x, y, width, height, complete) {
		var _$this = this;
		(x === void 0) && (x = 0);
		(y === void 0) && (y = 0);
		(width === void 0) && (width = 0);
		(height === void 0) && (height = 0);

		function loaded(tex) {
			if (!_$this.destroyed) {
				_$this.size(x + (width || tex.width), y + (height || tex.height));
				_$this.repaint();
				complete && complete.runWith(tex);
			}
		}
		this.graphics.loadImage(url, x, y, width, height, loaded);
		return this;
	}

	/**cacheAs后，设置自己和父对象缓存失效。*/
	__proto.repaint = function() {
		this.conchModel && this.conchModel.repaint && this.conchModel.repaint();
		if (this._repaint === 0) {
			this._repaint = 1;
			this.parentRepaint();
		}
		if (this._$P && this._$P.maskParent) {
			this._$P.maskParent.repaint();
		}
	}

	/**
	 *@private
	 *获取是否重新缓存。
	 *@return 如果重新缓存值为 true，否则值为 false。
	 */
	__proto._needRepaint = function() {
		return (this._repaint !== 0) && this._$P.cacheCanvas && this._$P.cacheCanvas.reCache;
	}

	/**@private */
	__proto._childChanged = function(child) {
		if (this._childs.length) this._renderType |= 0x800;
		else this._renderType &= ~0x800;
		if (child && this._get$P("hasZorder")) Laya.timer.callLater(this, this.updateZOrder);
		this.repaint();
	}

	/**cacheAs时，设置所有父对象缓存失效。 */
	__proto.parentRepaint = function() {
		var p = this._parent;
		if (p && p._repaint === 0) {
			p._repaint = 1;
			p.parentRepaint();
		}
	}

	/**
	 *开始拖动此对象。
	 *@param area （可选）拖动区域，此区域为当前对象注册点活动区域（不包括对象宽高），可选。
	 *@param hasInertia （可选）鼠标松开后，是否还惯性滑动，默认为false，可选。
	 *@param elasticDistance （可选）橡皮筋效果的距离值，0为无橡皮筋效果，默认为0，可选。
	 *@param elasticBackTime （可选）橡皮筋回弹时间，单位为毫秒，默认为300毫秒，可选。
	 *@param data （可选）拖动事件携带的数据，可选。
	 *@param disableMouseEvent （可选）禁用其他对象的鼠标检测，默认为false，设置为true能提高性能。
	 *@param ratio （可选）惯性阻尼系数，影响惯性力度和时长。
	 */
	__proto.startDrag = function(area, hasInertia, elasticDistance, elasticBackTime, data, disableMouseEvent, ratio) {
		(hasInertia === void 0) && (hasInertia = false);
		(elasticDistance === void 0) && (elasticDistance = 0);
		(elasticBackTime === void 0) && (elasticBackTime = 300);
		(disableMouseEvent === void 0) && (disableMouseEvent = false);
		(ratio === void 0) && (ratio = 0.92);
		this._$P.dragging || (this._set$P("dragging", new Dragging()));
		this._$P.dragging.start(this, area, hasInertia, elasticDistance, elasticBackTime, data, disableMouseEvent, ratio);
	}

	/**停止拖动此对象。*/
	__proto.stopDrag = function() {
		this._$P.dragging && this._$P.dragging.stop();
	}

	/**@private */
	__proto._setDisplay = function(value) {
		if (!value) {
			var cc = this._$P.cacheCanvas;
			if (cc && cc.ctx) {
				Pool.recover("RenderContext", cc.ctx);
				cc.ctx.canvas.size(0, 0);
				cc.ctx = null;
			};
			var fc = this._$P._filterCache;
			if (fc) {
				fc.destroy();
				fc.recycle();
				this._set$P('_filterCache', null);
			}
			this._$P._isHaveGlowFilter && this._set$P('_isHaveGlowFilter', false);
		}
		_super.prototype._setDisplay.call(this, value);
	}

	/**
	 *检测某个点是否在此对象内。
	 *@param x 全局x坐标。
	 *@param y 全局y坐标。
	 *@return 表示是否在对象内。
	 */
	__proto.hitTestPoint = function(x, y) {
		var point = this.globalToLocal(Point.TEMP.setTo(x, y));
		var rect = this._$P.hitArea ? this._$P.hitArea : (this._width > 0 && this._height > 0) ? Rectangle.TEMP.setTo(0, 0, this._width, this._height) : this.getSelfBounds();
		return rect.contains(point.x, point.y);
	}

	/**获得相对于本对象上的鼠标坐标信息。*/
	__proto.getMousePoint = function() {
		return this.globalToLocal(Point.TEMP.setTo(Laya.stage.mouseX, Laya.stage.mouseY));
	}

	/**@private */
	__proto._getWords = function() {
		return null;
	}

	/**@private */
	__proto._addChildsToLayout = function(out) {
		var words = this._getWords();
		if (words == null && this._childs.length == 0) return false;
		if (words) {
			for (var i = 0, n = words.length; i < n; i++) {
				out.push(words[i]);
			}
		}
		this._childs.forEach(function(o, index, array) {
			o._style._enableLayout() && o._addToLayout(out);
		});
		return true;
	}

	/**@private */
	__proto._addToLayout = function(out) {
		if (this._style.absolute) return;
		this._style.block ? out.push(this) : (this._addChildsToLayout(out) && (this.x = this.y = 0));
	}

	/**@private */
	__proto._isChar = function() {
		return false;
	}

	/**@private */
	__proto._getCSSStyle = function() {
		return this._style.getCSSStyle();
	}

	/**
	 *@private
	 *设置指定属性名的属性值。
	 *@param name 属性名。
	 *@param value 属性值。
	 */
	__proto._setAttributes = function(name, value) {
		switch (name) {
			case 'x':
				this.x = parseFloat(value);
				break;
			case 'y':
				this.y = parseFloat(value);
				break;
			case 'width':
				this.width = parseFloat(value);
				break;
			case 'height':
				this.height = parseFloat(value);
				break;
			default:
				this[name] = value;
		}
	}

	/**
	 *@private
	 */
	__proto._layoutLater = function() {
		this.parent && (this.parent)._layoutLater();
	}

	/**
	 *<p>指定是否对使用了 scrollRect 的显示对象进行优化处理。默认为false(不优化)。</p>
	 *<p>当值为ture时：将对此对象使用了scrollRect 设定的显示区域以外的显示内容不进行渲染，以提高性能(如果子对象有旋转缩放或者中心点偏移，则显示筛选会不精确)。</p>
	 */
	__getset(0, __proto, 'optimizeScrollRect', function() {
		return this._optimizeScrollRect;
	}, function(b) {
		if (this._optimizeScrollRect != b) {
			this._optimizeScrollRect = b;
			this.conchModel && this.conchModel.optimizeScrollRect(b);
		}
	});

	/**
	 *设置是否开启自定义渲染，只有开启自定义渲染，才能使用customRender函数渲染。
	 */
	__getset(0, __proto, 'customRenderEnable', null, function(b) {
		if (b) {
			this._renderType |= 0x400;
			if (Render.isConchNode) {
				Sprite.CustomList.push(this);
				var canvas = new HTMLCanvas("2d");
				canvas._setContext(new CanvasRenderingContext2D());
				this.customContext = new RenderContext(0, 0, canvas);
				canvas.context.setCanvasType && canvas.context.setCanvasType(2);
				this.conchModel.custom(canvas.context);
			}
		}
	});

	/**
	 *指定显示对象是否缓存为静态图像。功能同cacheAs的normal模式。建议优先使用cacheAs代替。
	 */
	__getset(0, __proto, 'cacheAsBitmap', function() {
		return this.cacheAs !== "none";
	}, function(value) {
		this.cacheAs = value ? (this._$P["hasFilter"] ? "none" : "normal") : "none";
	});

	/**
	 *<p>指定显示对象是否缓存为静态图像，cacheAs时，子对象发生变化，会自动重新缓存，同时也可以手动调用reCache方法更新缓存。</p>
	 *<p>建议把不经常变化的“复杂内容”缓存为静态图像，能极大提高渲染性能。cacheAs有"none"，"normal"和"bitmap"三个值可选。
	 *<li>默认为"none"，不做任何缓存。</li>
	 *<li>当值为"normal"时，canvas模式下进行画布缓存，webgl模式下进行命令缓存。</li>
	 *<li>当值为"bitmap"时，canvas模式下进行依然是画布缓存，webgl模式下使用renderTarget缓存。</li></p>
	 *<p>webgl下renderTarget缓存模式缺点：会额外创建renderTarget对象，增加内存开销，缓存面积有最大2048限制，不断重绘时会增加CPU开销。优点：大幅减少drawcall，渲染性能最高。
	 *webgl下命令缓存模式缺点：只会减少节点遍历及命令组织，不会减少drawcall数，性能中等。优点：没有额外内存开销，无需renderTarget支持。</p>
	 */
	__getset(0, __proto, 'cacheAs', function() {
		return this._$P.cacheCanvas == null ? "none" : this._$P.cacheCanvas.type;
	}, function(value) {
		var cacheCanvas = this._$P.cacheCanvas;
		if (value === (cacheCanvas ? cacheCanvas.type : "none")) return;
		if (value !== "none") {
			if (!this._getBit(0x1)) this._setUpNoticeType(0x1);
			cacheCanvas || (cacheCanvas = this._set$P("cacheCanvas", Pool.getItemByClass("cacheCanvas", Object)));
			cacheCanvas.type = value;
			cacheCanvas.reCache = true;
			this._renderType |= 0x10;
			if (value == "bitmap") this.conchModel && this.conchModel.cacheAs(1);
			this._set$P("cacheForFilters", false);
		} else {
			if (this._$P["hasFilter"]) {
				this._set$P("cacheForFilters", true);
			} else {
				if (cacheCanvas) {
					var cc = cacheCanvas;
					if (cc && cc.ctx) {
						Pool.recover("RenderContext", cc.ctx);
						cc.ctx.canvas.size(0, 0);
						cc.ctx = null;
					}
					Pool.recover("cacheCanvas", cacheCanvas);
				}
				this._$P.cacheCanvas = null;
				this._renderType &= ~0x10;
				this.conchModel && this.conchModel.cacheAs(0);
			}
		}
		this.repaint();
	});

	/**z排序，更改此值，则会按照值的大小对同一容器的所有对象重新排序。值越大，越靠上。默认为0，则根据添加顺序排序。*/
	__getset(0, __proto, 'zOrder', function() {
		return this._zOrder;
	}, function(value) {
		if (this._zOrder != value) {
			this._zOrder = value;
			this.conchModel && this.conchModel.setZOrder && this.conchModel.setZOrder(value);
			if (this._parent) {
				value && this._parent._set$P("hasZorder", true);
				Laya.timer.callLater(this._parent, this.updateZOrder);
			}
		}
	});

	/**旋转角度，默认值为0。以角度为单位。*/
	__getset(0, __proto, 'rotation', function() {
		return this._style._tf.rotate;
	}, function(value) {
		var style = this.getStyle();
		if (style._tf.rotate !== value) {
			style.setRotate(value);
			this._tfChanged = true;
			this.conchModel && this.conchModel.rotate(value);
			this._renderType |= 0x04;
			var p = this._parent;
			if (p && p._repaint === 0) {
				p._repaint = 1;
				p.parentRepaint();
			}
		}
	});

	/**
	 *<p>显示对象的宽度，单位为像素，默认为0。</p>
	 *<p>此宽度用于鼠标碰撞检测，并不影响显示对象图像大小。需要对显示对象的图像进行缩放，请使用scale、scaleX、scaleY。</p>
	 *<p>可以通过getbounds获取显示对象图像的实际宽度。</p>
	 */
	__getset(0, __proto, 'width', function() {
		if (!this.autoSize) return this._width;
		return this.getSelfBounds().width;
	}, function(value) {
		if (this._width !== value) {
			this._width = value;
			this.conchModel && this.conchModel.size(value, this._height)
			this.repaint();
		}
	});

	/**表示显示对象相对于父容器的水平方向坐标值。*/
	__getset(0, __proto, 'x', function() {
		return this._x;
	}, function(value) {
		if (this._x !== value) {
			if (this.destroyed) return;
			this._x = value;
			this.conchModel && this.conchModel.pos(value, this._y);
			var p = this._parent;
			if (p && p._repaint === 0) {
				p._repaint = 1;
				p.parentRepaint();
			}
			if (this._$P.maskParent && this._$P.maskParent._repaint === 0) {
				this._$P.maskParent._repaint = 1;
				this._$P.maskParent.parentRepaint();
			}
		}
	});

	/**
	 *获得相对于stage的全局Y轴缩放值（会叠加父亲节点的缩放值）。
	 */
	__getset(0, __proto, 'globalScaleY', function() {
		var scale = 1;
		var ele = this;
		while (ele) {
			if (ele === Laya.stage) break;
			scale *= ele.scaleY;
			ele = ele.parent;
		}
		return scale;
	});

	/**
	 *<p>可以设置一个Rectangle区域作为点击区域，或者设置一个<code>HitArea</code>实例作为点击区域，HitArea内可以设置可点击和不可点击区域。</p>
	 *<p>如果不设置hitArea，则根据宽高形成的区域进行碰撞。</p>
	 */
	__getset(0, __proto, 'hitArea', function() {
		return this._$P.hitArea;
	}, function(value) {
		this._set$P("hitArea", value);
	});

	/**
	 *是否静态缓存此对象的当前帧的最终属性。为 true 时，子对象变化时不会自动更新缓存，但是可以通过调用 reCache 方法手动刷新。
	 *<b>注意：</b> 1. 设置 cacheAs 为非空和非"none"时才有效。 2. 由于渲染的时机在脚本执行之后，也就是说当前帧渲染的是对象的最终属性，所以如果在当前帧渲染之前、设置静态缓存之后改变对象属性，则最终渲染结果表现的是对象的最终属性。
	 */
	__getset(0, __proto, 'staticCache', function() {
		return this._$P.staticCache;
	}, function(value) {
		this._set$P("staticCache", value);
		if (!value) this.reCache();
	});

	/**设置一个Texture实例，并显示此图片（如果之前有其他绘制，则会被清除掉）。等同于graphics.clear();graphics.drawTexture()*/
	__getset(0, __proto, 'texture', function() {
		return this._texture;
	}, function(value) {
		if (this._texture != value) {
			this._texture = value;
			this.graphics.cleanByTexture(value, 0, 0);
		}
	});

	/**表示显示对象相对于父容器的垂直方向坐标值。*/
	__getset(0, __proto, 'y', function() {
		return this._y;
	}, function(value) {
		if (this._y !== value) {
			if (this.destroyed) return;
			this._y = value;
			this.conchModel && this.conchModel.pos(this._x, value);
			var p = this._parent;
			if (p && p._repaint === 0) {
				p._repaint = 1;
				p.parentRepaint();
			}
			if (this._$P.maskParent && this._$P.maskParent._repaint === 0) {
				this._$P.maskParent._repaint = 1;
				this._$P.maskParent.parentRepaint();
			}
		}
	});

	/**
	 *<p>显示对象的高度，单位为像素，默认为0。</p>
	 *<p>此高度用于鼠标碰撞检测，并不影响显示对象图像大小。需要对显示对象的图像进行缩放，请使用scale、scaleX、scaleY。</p>
	 *<p>可以通过getbounds获取显示对象图像的实际高度。</p>
	 */
	__getset(0, __proto, 'height', function() {
		if (!this.autoSize) return this._height;
		return this.getSelfBounds().height;
	}, function(value) {
		if (this._height !== value) {
			this._height = value;
			this.conchModel && this.conchModel.size(this._width, value);
			this.repaint();
		}
	});

	/**指定要使用的混合模式。目前只支持"lighter"。*/
	__getset(0, __proto, 'blendMode', function() {
		return this._style.blendMode;
	}, function(value) {
		this.getStyle().blendMode = value;
		this.conchModel && this.conchModel.blendMode(value);
		if (value && value != "source-over") this._renderType |= 0x08;
		else this._renderType &= ~0x08;
		this.parentRepaint();
	});

	/**X轴缩放值，默认值为1。设置为负数，可以实现水平反转效果，比如scaleX=-1。*/
	__getset(0, __proto, 'scaleX', function() {
		return this._style._tf.scaleX;
	}, function(value) {
		var style = this.getStyle();
		if (style._tf.scaleX !== value) {
			style.setScaleX(value);
			this._tfChanged = true;
			this.conchModel && this.conchModel.scale(value, style._tf.scaleY);
			this._renderType |= 0x04;
			var p = this._parent;
			if (p && p._repaint === 0) {
				p._repaint = 1;
				p.parentRepaint();
			}
		}
	});

	/**Y轴缩放值，默认值为1。设置为负数，可以实现垂直反转效果，比如scaleX=-1。*/
	__getset(0, __proto, 'scaleY', function() {
		return this._style._tf.scaleY;
	}, function(value) {
		var style = this.getStyle();
		if (style._tf.scaleY !== value) {
			style.setScaleY(value);
			this._tfChanged = true;
			this.conchModel && this.conchModel.scale(style._tf.scaleX, value);
			this._renderType |= 0x04;
			var p = this._parent;
			if (p && p._repaint === 0) {
				p._repaint = 1;
				p.parentRepaint();
			}
		}
	});

	/**对舞台 <code>stage</code> 的引用。*/
	__getset(0, __proto, 'stage', function() {
		return Laya.stage;
	});

	/**水平倾斜角度，默认值为0。以角度为单位。*/
	__getset(0, __proto, 'skewX', function() {
		return this._style._tf.skewX;
	}, function(value) {
		var style = this.getStyle();
		if (style._tf.skewX !== value) {
			style.setSkewX(value);
			this._tfChanged = true;
			this.conchModel && this.conchModel.skew(value, style._tf.skewY);
			this._renderType |= 0x04;
			var p = this._parent;
			if (p && p._repaint === 0) {
				p._repaint = 1;
				p.parentRepaint();
			}
		}
	});

	/**
	 *<p>显示对象的滚动矩形范围，具有裁剪效果(如果只想限制子对象渲染区域，请使用viewport)，设置optimizeScrollRect=true，可以优化裁剪区域外的内容不进行渲染。</p>
	 *<p> srollRect和viewport的区别：<br/>
	 *1.srollRect自带裁剪效果，viewport只影响子对象渲染是否渲染，不具有裁剪效果（性能更高）。<br/>
	 *2.设置rect的x,y属性均能实现区域滚动效果，但scrollRect会保持0,0点位置不变。</p>
	 */
	__getset(0, __proto, 'scrollRect', function() {
		return this._style.scrollRect;
	}, function(value) {
		this.getStyle().scrollRect = value;
		this.repaint();
		if (value) {
			this._renderType |= 0x80;
			this.conchModel && this.conchModel.scrollRect(value.x, value.y, value.width, value.height);
		} else {
			this._renderType &= ~0x80;
			if (this.conchModel) {
				if (Sprite.RUNTIMEVERION < "0.9.1")
					this.conchModel.removeType(0x40);
				else
					this.conchModel.removeType(0x80);
			}
		}
	});

	/**垂直倾斜角度，默认值为0。以角度为单位。*/
	__getset(0, __proto, 'skewY', function() {
		return this._style._tf.skewY;
	}, function(value) {
		var style = this.getStyle();
		if (style._tf.skewY !== value) {
			style.setSkewY(value);
			this._tfChanged = true;
			this.conchModel && this.conchModel.skew(style._tf.skewX, value);
			this._renderType |= 0x04;
			var p = this._parent;
			if (p && p._repaint === 0) {
				p._repaint = 1;
				p.parentRepaint();
			}
		}
	});

	/**
	 *<p>对象的矩阵信息。通过设置矩阵可以实现节点旋转，缩放，位移效果。</p>
	 *<p>矩阵更多信息请参考 <code>Matrix</code></p>
	 */
	__getset(0, __proto, 'transform', function() {
		return this._tfChanged ? this._adjustTransform() : this._transform;
	}, function(value) {
		this._tfChanged = false;
		this._transform = value;
		if (value) {
			this._x = value.tx;
			this._y = value.ty;
			value.tx = value.ty = 0;
			this.conchModel && this.conchModel.transform(value.a, value.b, value.c, value.d, this._x, this._y);
		}
		if (value) this._renderType |= 0x04;
		else {
			this._renderType &= ~0x04;
			this.conchModel && this.conchModel.removeType(0x04);
		}
		this.parentRepaint();
	});

	/**X轴 轴心点的位置，单位为像素，默认为0。轴心点会影响对象位置，缩放中心，旋转中心。*/
	__getset(0, __proto, 'pivotX', function() {
		return this._style._tf.translateX;
	}, function(value) {
		this.getStyle().setTranslateX(value);
		this.conchModel && this.conchModel.pivot(value, this._style._tf.translateY);
		this.repaint();
	});

	/**Y轴 轴心点的位置，单位为像素，默认为0。轴心点会影响对象位置，缩放中心，旋转中心。*/
	__getset(0, __proto, 'pivotY', function() {
		return this._style._tf.translateY;
	}, function(value) {
		this.getStyle().setTranslateY(value);
		this.conchModel && this.conchModel.pivot(this._style._tf.translateX, value);
		this.repaint();
	});

	/**透明度，值为0-1，默认值为1，表示不透明。更改alpha值会影响drawcall。*/
	__getset(0, __proto, 'alpha', function() {
		return this._style.alpha;
	}, function(value) {
		if (this._style && this._style.alpha !== value) {
			value = value < 0 ? 0 : (value > 1 ? 1 : value);
			this.getStyle().alpha = value;
			this.conchModel && this.conchModel.alpha(value);
			if (value !== 1) this._renderType |= 0x02;
			else this._renderType &= ~0x02;
			this.parentRepaint();
		}
	});

	/**表示是否可见，默认为true。如果设置不可见，节点将不被渲染。*/
	__getset(0, __proto, 'visible', function() {
		return this._style.visible;
	}, function(value) {
		if (this._style && this._style.visible !== value) {
			this.getStyle().visible = value;
			this.conchModel && this.conchModel.visible(value);
			this.parentRepaint();
		}
	});

	/**绘图对象。封装了绘制位图和矢量图的接口，Sprite所有的绘图操作都通过Graphics来实现的。*/
	__getset(0, __proto, 'graphics', function() {
		return this._graphics || (this.graphics = RunDriver.createGraphics());
	}, function(value) {
		if (this._graphics) this._graphics._sp = null;
		this._graphics = value;
		if (value) {
			this._renderType &= ~0x01;
			this._renderType |= 0x200;
			value._sp = this;
			this.conchModel && this.conchModel.graphics(this._graphics);
		} else {
			this._renderType &= ~0x200;
			this._renderType &= ~0x01;
			if (this.conchModel) {
				if (Sprite.RUNTIMEVERION < "0.9.1")
					this.conchModel.removeType(0x100);
				else
					this.conchModel.removeType(0x200);
			}
		}
		this.repaint();
	});

	/**滤镜集合。可以设置多个滤镜组合。*/
	__getset(0, __proto, 'filters', function() {
		return this._$P.filters;
	}, function(value) {
		value && value.length === 0 && (value = null);
		if (this._$P.filters == value) return;
		this._set$P("filters", value ? value.slice() : null);
		if (Render.isConchApp) {
			if (this.conchModel) {
				if (Sprite.RUNTIMEVERION < "0.9.1")
					this.conchModel.removeType(0x10);
				else
					this.conchModel.removeType(0x20);
			}
			if (this._$P.filters && this._$P.filters.length == 1) {
				this._$P.filters[0].callNative(this);
			}
		}
		if (Render.isWebGL) {
			if (value && value.length) {
				this._renderType |= 0x20;
			} else {
				this._renderType &= ~0x20;
			}
		}
		if (value && value.length > 0) {
			if (!this._getBit(0x1)) this._setUpNoticeType(0x1);
			if (!(Render.isWebGL && value.length == 1 && (((value[0]) instanceof laya.filters.ColorFilter)))) {
				if (this.cacheAs != "bitmap") {
					if (!Render.isConchNode) this.cacheAs = "bitmap";
					this._set$P("cacheForFilters", true);
				}
				this._set$P("hasFilter", true);
			}
		} else {
			this._set$P("hasFilter", false);
			if (this._$P["cacheForFilters"] && this.cacheAs == "bitmap") {
				this.cacheAs = "none";
			}
		}
		this.repaint();
	});

	__getset(0, __proto, 'parent', _super.prototype._$get_parent, function(value) {
		_super.prototype._$set_parent.call(this, value);
		if (value && this._getBit(0x2)) {
			this._$2__onDisplay();
		}
	});

	/**
	 *<p>遮罩，可以设置一个对象(支持位图和矢量图)，根据对象形状进行遮罩显示。</p>
	 *<p>【注意】遮罩对象坐标系是相对遮罩对象本身的，和Flash机制不同</p>
	 */
	__getset(0, __proto, 'mask', function() {
		return this._$P._mask;
	}, function(value) {
		if (value && this.mask && this.mask._$P.maskParent) return;
		if (value) {
			this.cacheAs = "bitmap";
			this._set$P("_mask", value);
			value._set$P("maskParent", this);
		} else {
			this.cacheAs = "none";
			this.mask && this.mask._set$P("maskParent", null);
			this._set$P("_mask", value);
		}
		this.conchModel && this.conchModel.mask(value ? value.conchModel : null);
		this._renderType |= 0x40;
		this.parentRepaint();
	});

	/**
	 *是否接受鼠标事件。
	 *默认为false，如果监听鼠标事件，则会自动设置本对象及父节点的属性 mouseEnable 的值都为 true（如果父节点手动设置为false，则不会更改）。
	 **/
	__getset(0, __proto, 'mouseEnabled', function() {
		return this._mouseEnableState > 1;
	}, function(value) {
		this._mouseEnableState = value ? 2 : 1;
	});

	/**
	 *获得相对于stage的全局X轴缩放值（会叠加父亲节点的缩放值）。
	 */
	__getset(0, __proto, 'globalScaleX', function() {
		var scale = 1;
		var ele = this;
		while (ele) {
			if (ele === Laya.stage) break;
			scale *= ele.scaleX;
			ele = ele.parent;
		}
		return scale;
	});

	/**
	 *返回鼠标在此对象坐标系上的 X 轴坐标信息。
	 */
	__getset(0, __proto, 'mouseX', function() {
		return this.getMousePoint().x;
	});

	/**
	 *返回鼠标在此对象坐标系上的 Y 轴坐标信息。
	 */
	__getset(0, __proto, 'mouseY', function() {
		return this.getMousePoint().y;
	});

	Sprite.fromImage = function(url) {
		return new Sprite().loadImage(url);
	}

	Sprite.CustomList = [];
	__static(Sprite, ['RUNTIMEVERION', function() {
		return this.RUNTIMEVERION = window.conch ? conchConfig.getRuntimeVersion().substr(conchConfig.getRuntimeVersion().lastIndexOf('-') + 1) : '';
	}]);
	return Sprite;
})(Node)



/**
 *@private
 *<code>MathUtil</code> 是一个数据处理工具类。
 */
//class laya.maths.MathUtil
var MathUtil = (function() {
	function MathUtil() {};
	__class(MathUtil, 'laya.maths.MathUtil');
	MathUtil.subtractVector3 = function(l, r, o) {
		o[0] = l[0] - r[0];
		o[1] = l[1] - r[1];
		o[2] = l[2] - r[2];
	}

	MathUtil.lerp = function(left, right, amount) {
		return left * (1 - amount) + right * amount;
	}

	MathUtil.scaleVector3 = function(f, b, e) {
		e[0] = f[0] * b;
		e[1] = f[1] * b;
		e[2] = f[2] * b;
	}

	MathUtil.lerpVector3 = function(l, r, t, o) {
		var ax = l[0],
			ay = l[1],
			az = l[2];
		o[0] = ax + t * (r[0] - ax);
		o[1] = ay + t * (r[1] - ay);
		o[2] = az + t * (r[2] - az);
	}

	MathUtil.lerpVector4 = function(l, r, t, o) {
		var ax = l[0],
			ay = l[1],
			az = l[2],
			aw = l[3];
		o[0] = ax + t * (r[0] - ax);
		o[1] = ay + t * (r[1] - ay);
		o[2] = az + t * (r[2] - az);
		o[3] = aw + t * (r[3] - aw);
	}

	MathUtil.slerpQuaternionArray = function(a, Offset1, b, Offset2, t, out, Offset3) {
		var ax = a[Offset1 + 0],
			ay = a[Offset1 + 1],
			az = a[Offset1 + 2],
			aw = a[Offset1 + 3],
			bx = b[Offset2 + 0],
			by = b[Offset2 + 1],
			bz = b[Offset2 + 2],
			bw = b[Offset2 + 3];
		var omega, cosom, sinom, scale0, scale1;
		cosom = ax * bx + ay * by + az * bz + aw * bw;
		if (cosom < 0.0) {
			cosom = -cosom;
			bx = -bx;
			by = -by;
			bz = -bz;
			bw = -bw;
		}
		if ((1.0 - cosom) > 0.000001) {
			omega = Math.acos(cosom);
			sinom = Math.sin(omega);
			scale0 = Math.sin((1.0 - t) * omega) / sinom;
			scale1 = Math.sin(t * omega) / sinom;
		} else {
			scale0 = 1.0 - t;
			scale1 = t;
		}
		out[Offset3 + 0] = scale0 * ax + scale1 * bx;
		out[Offset3 + 1] = scale0 * ay + scale1 * by;
		out[Offset3 + 2] = scale0 * az + scale1 * bz;
		out[Offset3 + 3] = scale0 * aw + scale1 * bw;
		return out;
	}

	MathUtil.getRotation = function(x0, y0, x1, y1) {
		return Math.atan2(y1 - y0, x1 - x0) / Math.PI * 180;
	}

	MathUtil.sortBigFirst = function(a, b) {
		if (a == b)
			return 0;
		return b > a ? 1 : -1;
	}

	MathUtil.sortSmallFirst = function(a, b) {
		if (a == b)
			return 0;
		return b > a ? -1 : 1;
	}

	MathUtil.sortNumBigFirst = function(a, b) {
		return parseFloat(b) - parseFloat(a);
	}

	MathUtil.sortNumSmallFirst = function(a, b) {
		return parseFloat(a) - parseFloat(b);
	}

	MathUtil.sortByKey = function(key, bigFirst, forceNum) {
		(bigFirst === void 0) && (bigFirst = false);
		(forceNum === void 0) && (forceNum = true);
		var _sortFun;
		if (bigFirst) {
			_sortFun = forceNum ? MathUtil.sortNumBigFirst : MathUtil.sortBigFirst;
		} else {
			_sortFun = forceNum ? MathUtil.sortNumSmallFirst : MathUtil.sortSmallFirst;
		}
		return function(a, b) {
			return _sortFun(a[key], b[key]);
		}
	}

	return MathUtil;
})()


/**
 *<p> <code>Matrix</code> 类表示一个转换矩阵，它确定如何将点从一个坐标空间映射到另一个坐标空间。</p>
 *<p>您可以对一个显示对象执行不同的图形转换，方法是设置 Matrix 对象的属性，将该 Matrix 对象应用于 Transform 对象的 matrix 属性，然后应用该 Transform 对象作为显示对象的 transform 属性。这些转换函数包括平移（x 和 y 重新定位）、旋转、缩放和倾斜。</p>
 */
//class laya.maths.Matrix
var Matrix = (function() {
	function Matrix(a, b, c, d, tx, ty) {
		//this.a=NaN;
		//this.b=NaN;
		//this.c=NaN;
		//this.d=NaN;
		//this.tx=NaN;
		//this.ty=NaN;
		this.inPool = false;
		this.bTransform = false;
		(a === void 0) && (a = 1);
		(b === void 0) && (b = 0);
		(c === void 0) && (c = 0);
		(d === void 0) && (d = 1);
		(tx === void 0) && (tx = 0);
		(ty === void 0) && (ty = 0);
		this.a = a;
		this.b = b;
		this.c = c;
		this.d = d;
		this.tx = tx;
		this.ty = ty;
		this._checkTransform();
	}

	__class(Matrix, 'laya.maths.Matrix');
	var __proto = Matrix.prototype;
	/**
	 *将本矩阵设置为单位矩阵。
	 *@return 返回当前矩形。
	 */
	__proto.identity = function() {
		this.a = this.d = 1;
		this.b = this.tx = this.ty = this.c = 0;
		this.bTransform = false;
		return this;
	}

	/**@private*/
	__proto._checkTransform = function() {
		return this.bTransform = (this.a !== 1 || this.b !== 0 || this.c !== 0 || this.d !== 1);
	}

	/**
	 *设置沿 x 、y 轴平移每个点的距离。
	 *@param x 沿 x 轴平移每个点的距离。
	 *@param y 沿 y 轴平移每个点的距离。
	 *@return 返回对象本身
	 */
	__proto.setTranslate = function(x, y) {
		this.tx = x;
		this.ty = y;
		return this;
	}

	/**
	 *沿 x 和 y 轴平移矩阵，平移的变化量由 x 和 y 参数指定。
	 *@param x 沿 x 轴向右移动的量（以像素为单位）。
	 *@param y 沿 y 轴向下移动的量（以像素为单位）。
	 *@return 返回此矩形对象。
	 */
	__proto.translate = function(x, y) {
		this.tx += x;
		this.ty += y;
		return this;
	}

	/**
	 *对矩阵应用缩放转换。
	 *@param x 用于沿 x 轴缩放对象的乘数。
	 *@param y 用于沿 y 轴缩放对象的乘数。
	 */
	__proto.scale = function(x, y) {
		this.a *= x;
		this.d *= y;
		this.c *= x;
		this.b *= y;
		this.tx *= x;
		this.ty *= y;
		this.bTransform = true;
	}

	/**
	 *对 Matrix 对象应用旋转转换。
	 *@param angle 以弧度为单位的旋转角度。
	 */
	__proto.rotate = function(angle) {
		var cos = Math.cos(angle);
		var sin = Math.sin(angle);
		var a1 = this.a;
		var c1 = this.c;
		var tx1 = this.tx;
		this.a = a1 * cos - this.b * sin;
		this.b = a1 * sin + this.b * cos;
		this.c = c1 * cos - this.d * sin;
		this.d = c1 * sin + this.d * cos;
		this.tx = tx1 * cos - this.ty * sin;
		this.ty = tx1 * sin + this.ty * cos;
		this.bTransform = true;
	}

	/**
	 *对 Matrix 对象应用倾斜转换。
	 *@param x 沿着 X 轴的 2D 倾斜弧度。
	 *@param y 沿着 Y 轴的 2D 倾斜弧度。
	 *@return 当前 Matrix 对象。
	 */
	__proto.skew = function(x, y) {
		var tanX = Math.tan(x);
		var tanY = Math.tan(y);
		var a1 = this.a;
		var b1 = this.b;
		this.a += tanY * this.c;
		this.b += tanY * this.d;
		this.c += tanX * a1;
		this.d += tanX * b1;
		return this;
	}

	/**
	 *对指定的点应用当前矩阵的逆转化并返回此点。
	 *@param out 待转化的点 Point 对象。
	 *@return 返回out
	 */
	__proto.invertTransformPoint = function(out) {
		var a1 = this.a;
		var b1 = this.b;
		var c1 = this.c;
		var d1 = this.d;
		var tx1 = this.tx;
		var n = a1 * d1 - b1 * c1;
		var a2 = d1 / n;
		var b2 = -b1 / n;
		var c2 = -c1 / n;
		var d2 = a1 / n;
		var tx2 = (c1 * this.ty - d1 * tx1) / n;
		var ty2 = -(a1 * this.ty - b1 * tx1) / n;
		return out.setTo(a2 * out.x + c2 * out.y + tx2, b2 * out.x + d2 * out.y + ty2);
	}

	/**
	 *将 Matrix 对象表示的几何转换应用于指定点。
	 *@param out 用来设定输出结果的点。
	 *@return 返回out
	 */
	__proto.transformPoint = function(out) {
		return out.setTo(this.a * out.x + this.c * out.y + this.tx, this.b * out.x + this.d * out.y + this.ty);
	}

	/**
	 *将 Matrix 对象表示的几何转换应用于指定点，忽略tx、ty。
	 *@param out 用来设定输出结果的点。
	 *@return 返回out
	 */
	__proto.transformPointN = function(out) {
		return out.setTo(this.a * out.x + this.c * out.y, this.b * out.x + this.d * out.y);
	}

	/**
	 *@private
	 *将 Matrix 对象表示的几何转换应用于指定点。
	 *@param data 点集合。
	 *@param out 存储应用转化的点的列表。
	 *@return 返回out数组
	 */
	__proto.transformPointArray = function(data, out) {
		var len = data.length;
		for (var i = 0; i < len; i += 2) {
			var x = data[i],
				y = data[i + 1];
			out[i] = this.a * x + this.c * y + this.tx;
			out[i + 1] = this.b * x + this.d * y + this.ty;
		}
		return out;
	}

	/**
	 *@private
	 *将 Matrix 对象表示的几何缩放转换应用于指定点。
	 *@param data 点集合。
	 *@param out 存储应用转化的点的列表。
	 *@return 返回out数组
	 */
	__proto.transformPointArrayScale = function(data, out) {
		var len = data.length;
		for (var i = 0; i < len; i += 2) {
			var x = data[i],
				y = data[i + 1];
			out[i] = this.a * x + this.c * y;
			out[i + 1] = this.b * x + this.d * y;
		}
		return out;
	}

	/**
	 *获取 X 轴缩放值。
	 *@return X 轴缩放值。
	 */
	__proto.getScaleX = function() {
		return this.b === 0 ? this.a : Math.sqrt(this.a * this.a + this.b * this.b);
	}

	/**
	 *获取 Y 轴缩放值。
	 *@return Y 轴缩放值。
	 */
	__proto.getScaleY = function() {
		return this.c === 0 ? this.d : Math.sqrt(this.c * this.c + this.d * this.d);
	}

	/**
	 *执行原始矩阵的逆转换。
	 *@return 当前矩阵对象。
	 */
	__proto.invert = function() {
		var a1 = this.a;
		var b1 = this.b;
		var c1 = this.c;
		var d1 = this.d;
		var tx1 = this.tx;
		var n = a1 * d1 - b1 * c1;
		this.a = d1 / n;
		this.b = -b1 / n;
		this.c = -c1 / n;
		this.d = a1 / n;
		this.tx = (c1 * this.ty - d1 * tx1) / n;
		this.ty = -(a1 * this.ty - b1 * tx1) / n;
		return this;
	}

	/**
	 *将 Matrix 的成员设置为指定值。
	 *@param a 缩放或旋转图像时影响像素沿 x 轴定位的值。
	 *@param b 旋转或倾斜图像时影响像素沿 y 轴定位的值。
	 *@param c 旋转或倾斜图像时影响像素沿 x 轴定位的值。
	 *@param d 缩放或旋转图像时影响像素沿 y 轴定位的值。
	 *@param tx 沿 x 轴平移每个点的距离。
	 *@param ty 沿 y 轴平移每个点的距离。
	 *@return 当前矩阵对象。
	 */
	__proto.setTo = function(a, b, c, d, tx, ty) {
		this.a = a, this.b = b, this.c = c, this.d = d, this.tx = tx, this.ty = ty;
		return this;
	}

	/**
	 *将指定矩阵与当前矩阵连接，从而将这两个矩阵的几何效果有效地结合在一起。
	 *@param matrix 要连接到源矩阵的矩阵。
	 *@return 当前矩阵。
	 */
	__proto.concat = function(matrix) {
		var a = this.a;
		var c = this.c;
		var tx = this.tx;
		this.a = a * matrix.a + this.b * matrix.c;
		this.b = a * matrix.b + this.b * matrix.d;
		this.c = c * matrix.a + this.d * matrix.c;
		this.d = c * matrix.b + this.d * matrix.d;
		this.tx = tx * matrix.a + this.ty * matrix.c + matrix.tx;
		this.ty = tx * matrix.b + this.ty * matrix.d + matrix.ty;
		return this;
	}

	/**
	 *@private
	 *对矩阵应用缩放转换。反向相乘
	 *@param x 用于沿 x 轴缩放对象的乘数。
	 *@param y 用于沿 y 轴缩放对象的乘数。
	 */
	__proto.scaleEx = function(x, y) {
		var ba = this.a,
			bb = this.b,
			bc = this.c,
			bd = this.d;
		if (bb !== 0 || bc !== 0) {
			this.a = x * ba;
			this.b = x * bb;
			this.c = y * bc;
			this.d = y * bd;
		} else {
			this.a = x * ba;
			this.b = 0 * bd;
			this.c = 0 * ba;
			this.d = y * bd;
		}
		this.bTransform = true;
	}

	/**
	 *@private
	 *对 Matrix 对象应用旋转转换。反向相乘
	 *@param angle 以弧度为单位的旋转角度。
	 */
	__proto.rotateEx = function(angle) {
		var cos = Math.cos(angle);
		var sin = Math.sin(angle);
		var ba = this.a,
			bb = this.b,
			bc = this.c,
			bd = this.d;
		if (bb !== 0 || bc !== 0) {
			this.a = cos * ba + sin * bc;
			this.b = cos * bb + sin * bd;
			this.c = -sin * ba + cos * bc;
			this.d = -sin * bb + cos * bd;
		} else {
			this.a = cos * ba;
			this.b = sin * bd;
			this.c = -sin * ba;
			this.d = cos * bd;
		}
		this.bTransform = true;
	}

	/**
	 *返回此 Matrix 对象的副本。
	 *@return 与原始实例具有完全相同的属性的新 Matrix 实例。
	 */
	__proto.clone = function() {
		var dec = Matrix.create();
		dec.a = this.a;
		dec.b = this.b;
		dec.c = this.c;
		dec.d = this.d;
		dec.tx = this.tx;
		dec.ty = this.ty;
		dec.bTransform = this.bTransform;
		return dec;
	}

	/**
	 *将当前 Matrix 对象中的所有矩阵数据复制到指定的 Matrix 对象中。
	 *@param dec 要复制当前矩阵数据的 Matrix 对象。
	 *@return 已复制当前矩阵数据的 Matrix 对象。
	 */
	__proto.copyTo = function(dec) {
		dec.a = this.a;
		dec.b = this.b;
		dec.c = this.c;
		dec.d = this.d;
		dec.tx = this.tx;
		dec.ty = this.ty;
		dec.bTransform = this.bTransform;
		return dec;
	}

	/**
	 *返回列出该 Matrix 对象属性的文本值。
	 *@return 一个字符串，它包含 Matrix 对象的属性值：a、b、c、d、tx 和 ty。
	 */
	__proto.toString = function() {
		return this.a + "," + this.b + "," + this.c + "," + this.d + "," + this.tx + "," + this.ty;
	}

	/**
	 *销毁此对象。
	 */
	__proto.destroy = function() {
		if (this.inPool) return;
		var cache = Matrix._cache;
		this.inPool = true;
		cache._length || (cache._length = 0);
		cache[cache._length++] = this;
		this.a = this.d = 1;
		this.b = this.c = this.tx = this.ty = 0;
		this.bTransform = false;
	}

	Matrix.mul = function(m1, m2, out) {
		var aa = m1.a,
			ab = m1.b,
			ac = m1.c,
			ad = m1.d,
			atx = m1.tx,
			aty = m1.ty;
		var ba = m2.a,
			bb = m2.b,
			bc = m2.c,
			bd = m2.d,
			btx = m2.tx,
			bty = m2.ty;
		if (bb !== 0 || bc !== 0) {
			out.a = aa * ba + ab * bc;
			out.b = aa * bb + ab * bd;
			out.c = ac * ba + ad * bc;
			out.d = ac * bb + ad * bd;
			out.tx = ba * atx + bc * aty + btx;
			out.ty = bb * atx + bd * aty + bty;
		} else {
			out.a = aa * ba;
			out.b = ab * bd;
			out.c = ac * ba;
			out.d = ad * bd;
			out.tx = ba * atx + btx;
			out.ty = bd * aty + bty;
		}
		return out;
	}

	Matrix.mul16 = function(m1, m2, out) {
		var aa = m1.a,
			ab = m1.b,
			ac = m1.c,
			ad = m1.d,
			atx = m1.tx,
			aty = m1.ty;
		var ba = m2.a,
			bb = m2.b,
			bc = m2.c,
			bd = m2.d,
			btx = m2.tx,
			bty = m2.ty;
		if (bb !== 0 || bc !== 0) {
			out[0] = aa * ba + ab * bc;
			out[1] = aa * bb + ab * bd;
			out[4] = ac * ba + ad * bc;
			out[5] = ac * bb + ad * bd;
			out[12] = ba * atx + bc * aty + btx;
			out[13] = bb * atx + bd * aty + bty;
		} else {
			out[0] = aa * ba;
			out[1] = ab * bd;
			out[4] = ac * ba;
			out[5] = ad * bd;
			out[12] = ba * atx + btx;
			out[13] = bd * aty + bty;
		}
		return out;
	}

	Matrix.mulPre = function(m1, ba, bb, bc, bd, btx, bty, out) {
		var aa = m1.a,
			ab = m1.b,
			ac = m1.c,
			ad = m1.d,
			atx = m1.tx,
			aty = m1.ty;
		if (bb !== 0 || bc !== 0) {
			out.a = aa * ba + ab * bc;
			out.b = aa * bb + ab * bd;
			out.c = ac * ba + ad * bc;
			out.d = ac * bb + ad * bd;
			out.tx = ba * atx + bc * aty + btx;
			out.ty = bb * atx + bd * aty + bty;
		} else {
			out.a = aa * ba;
			out.b = ab * bd;
			out.c = ac * ba;
			out.d = ad * bd;
			out.tx = ba * atx + btx;
			out.ty = bd * aty + bty;
		}
		return out;
	}

	Matrix.mulPos = function(m1, aa, ab, ac, ad, atx, aty, out) {
		var ba = m1.a,
			bb = m1.b,
			bc = m1.c,
			bd = m1.d,
			btx = m1.tx,
			bty = m1.ty;
		if (bb !== 0 || bc !== 0) {
			out.a = aa * ba + ab * bc;
			out.b = aa * bb + ab * bd;
			out.c = ac * ba + ad * bc;
			out.d = ac * bb + ad * bd;
			out.tx = ba * atx + bc * aty + btx;
			out.ty = bb * atx + bd * aty + bty;
		} else {
			out.a = aa * ba;
			out.b = ab * bd;
			out.c = ac * ba;
			out.d = ad * bd;
			out.tx = ba * atx + btx;
			out.ty = bd * aty + bty;
		}
		return out;
	}

	Matrix.preMul = function(parent, self, out) {
		var pa = parent.a,
			pb = parent.b,
			pc = parent.c,
			pd = parent.d;
		var na = self.a,
			nb = self.b,
			nc = self.c,
			nd = self.d,
			ntx = self.tx,
			nty = self.ty;
		out.a = na * pa;
		out.b = out.c = 0;
		out.d = nd * pd;
		out.tx = ntx * pa + parent.tx;
		out.ty = nty * pd + parent.ty;
		if (nb !== 0 || nc !== 0 || pb !== 0 || pc !== 0) {
			out.a += nb * pc;
			out.d += nc * pb;
			out.b += na * pb + nb * pd;
			out.c += nc * pa + nd * pc;
			out.tx += nty * pc;
			out.ty += ntx * pb;
		}
		return out;
	}

	Matrix.preMulXY = function(parent, x, y, out) {
		var pa = parent.a,
			pb = parent.b,
			pc = parent.c,
			pd = parent.d;
		out.a = pa;
		out.b = pb;
		out.c = pc;
		out.d = pd;
		out.tx = x * pa + parent.tx + y * pc;
		out.ty = y * pd + parent.ty + x * pb;
		return out;
	}

	Matrix.create = function() {
		var cache = Matrix._cache;
		var mat = !cache._length ? (new Matrix()) : cache[--cache._length];
		mat.inPool = false;
		return mat;
	}

	Matrix.EMPTY = new Matrix();
	Matrix.TEMP = new Matrix();
	Matrix._cache = [];
	return Matrix;
})()


/**
 *<code>Point</code> 对象表示二维坐标系统中的某个位置，其中 x 表示水平轴，y 表示垂直轴。
 */
//class laya.maths.Point
var Point = (function() {
	function Point(x, y) {
		//this.x=NaN;
		//this.y=NaN;
		(x === void 0) && (x = 0);
		(y === void 0) && (y = 0);
		this.x = x;
		this.y = y;
	}

	__class(Point, 'laya.maths.Point');
	var __proto = Point.prototype;
	/**
	 *将 <code>Point</code> 的成员设置为指定值。
	 *@param x 水平坐标。
	 *@param y 垂直坐标。
	 *@return 当前 Point 对象。
	 */
	__proto.setTo = function(x, y) {
		this.x = x;
		this.y = y;
		return this;
	}

	/**
	 *计算当前点和目标点(x，y)的距离。
	 *@param x 水平坐标。
	 *@param y 垂直坐标。
	 *@return 返回当前点和目标点之间的距离。
	 */
	__proto.distance = function(x, y) {
		return Math.sqrt((this.x - x) * (this.x - x) + (this.y - y) * (this.y - y));
	}

	/**返回包含 x 和 y 坐标的值的字符串。*/
	__proto.toString = function() {
		return this.x + "," + this.y;
	}

	/**
	 *标准化向量。
	 */
	__proto.normalize = function() {
		var d = Math.sqrt(this.x * this.x + this.y * this.y);
		if (d > 0) {
			var id = 1.0 / d;
			this.x *= id;
			this.y *= id;
		}
	}

	Point.TEMP = new Point();
	Point.EMPTY = new Point();
	return Point;
})()


/**
 *<p><code>Rectangle</code> 对象是按其位置（由它左上角的点 (x,y)确定）以及宽度和高度定义的区域。</p>
 *<p>Rectangle 类的 x、y、width 和 height 属性相互独立；更改一个属性的值不会影响其他属性。</p>
 */
//class laya.maths.Rectangle
var Rectangle = (function() {
	function Rectangle(x, y, width, height) {
		//this.x=NaN;
		//this.y=NaN;
		//this.width=NaN;
		//this.height=NaN;
		(x === void 0) && (x = 0);
		(y === void 0) && (y = 0);
		(width === void 0) && (width = 0);
		(height === void 0) && (height = 0);
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

	__class(Rectangle, 'laya.maths.Rectangle');
	var __proto = Rectangle.prototype;
	/**
	 *将 Rectangle 的属性设置为指定值。
	 *@param x x 矩形左上角的 X 轴坐标。
	 *@param y x 矩形左上角的 Y 轴坐标。
	 *@param width 矩形的宽度。
	 *@param height 矩形的高。
	 *@return 返回属性值修改后的矩形对象本身。
	 */
	__proto.setTo = function(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		return this;
	}

	/**
	 *复制 source 对象的属性值到此矩形对象中。
	 *@param sourceRect 源 Rectangle 对象。
	 *@return 返回属性值修改后的矩形对象本身。
	 */
	__proto.copyFrom = function(source) {
		this.x = source.x;
		this.y = source.y;
		this.width = source.width;
		this.height = source.height;
		return this;
	}

	/**
	 *确定由此 Rectangle 对象定义的矩形区域内是否包含指定的点。
	 *@param x 点的 X 轴坐标值（水平位置）。
	 *@param y 点的 Y 轴坐标值（垂直位置）。
	 *@return 如果 Rectangle 对象包含指定的点，则值为 true；否则为 false。
	 */
	__proto.contains = function(x, y) {
		if (this.width <= 0 || this.height <= 0) return false;
		if (x >= this.x && x < this.right) {
			if (y >= this.y && y < this.bottom) {
				return true;
			}
		}
		return false;
	}

	/**
	 *确定在 rect 参数中指定的对象是否与此 Rectangle 对象相交。此方法检查指定的 Rectangle 对象的 x、y、width 和 height 属性，以查看它是否与此 Rectangle 对象相交。
	 *@param rect Rectangle 对象。
	 *@return 如果传入的矩形对象与此对象相交，则返回 true 值，否则返回 false。
	 */
	__proto.intersects = function(rect) {
		return !(rect.x > (this.x + this.width) || (rect.x + rect.width) < this.x || rect.y > (this.y + this.height) || (rect.y + rect.height) < this.y);
	}

	/**
	 *如果在 rect 参数中指定的 Rectangle 对象与此 Rectangle 对象相交，则返回交集区域作为 Rectangle 对象。如果矩形不相交，则此方法返回null。
	 *@param rect 待比较的矩形区域。
	 *@param out （可选）待输出的矩形区域。如果为空则创建一个新的。建议：尽量复用对象，减少对象创建消耗。
	 *@return 返回相交的矩形区域对象。
	 */
	__proto.intersection = function(rect, out) {
		if (!this.intersects(rect)) return null;
		out || (out = new Rectangle());
		out.x = Math.max(this.x, rect.x);
		out.y = Math.max(this.y, rect.y);
		out.width = Math.min(this.right, rect.right) - out.x;
		out.height = Math.min(this.bottom, rect.bottom) - out.y;
		return out;
	}

	/**
	 *<p>矩形联合，通过填充两个矩形之间的水平和垂直空间，将这两个矩形组合在一起以创建一个新的 Rectangle 对象。</p>
	 *<p>注意：union()方法忽略高度或宽度值为 0 的矩形，如：var rect2:Rectangle=new Rectangle(300,300,50,0);</p>
	 *@param 要添加到此 Rectangle 对象的 Rectangle 对象。
	 *@param out 用于存储输出结果的矩形对象。如果为空，则创建一个新的。建议：尽量复用对象，减少对象创建消耗。Rectangle.TEMP对象用于对象复用。
	 *@return 充当两个矩形的联合的新 Rectangle 对象。
	 */
	__proto.union = function(source, out) {
		out || (out = new Rectangle());
		this.clone(out);
		if (source.width <= 0 || source.height <= 0) return out;
		out.addPoint(source.x, source.y);
		out.addPoint(source.right, source.bottom);
		return this;
	}

	/**
	 *返回一个 Rectangle 对象，其 x、y、width 和 height 属性的值与当前 Rectangle 对象的对应值相同。
	 *@param out （可选）用于存储结果的矩形对象。如果为空，则创建一个新的。建议：尽量复用对象，减少对象创建消耗。。Rectangle.TEMP对象用于对象复用。
	 *@return Rectangle 对象，其 x、y、width 和 height 属性的值与当前 Rectangle 对象的对应值相同。
	 */
	__proto.clone = function(out) {
		out || (out = new Rectangle());
		out.x = this.x;
		out.y = this.y;
		out.width = this.width;
		out.height = this.height;
		return out;
	}

	/**
	 *当前 Rectangle 对象的水平位置 x 和垂直位置 y 以及高度 width 和宽度 height 以逗号连接成的字符串。
	 */
	__proto.toString = function() {
		return this.x + "," + this.y + "," + this.width + "," + this.height;
	}

	/**
	 *检测传入的 Rectangle 对象的属性是否与当前 Rectangle 对象的属性 x、y、width、height 属性值都相等。
	 *@param rect 待比较的 Rectangle 对象。
	 *@return 如果判断的属性都相等，则返回 true ,否则返回 false。
	 */
	__proto.equals = function(rect) {
		if (!rect || rect.x !== this.x || rect.y !== this.y || rect.width !== this.width || rect.height !== this.height) return false;
		return true;
	}

	/**
	 *<p>为当前矩形对象加一个点，以使当前矩形扩展为包含当前矩形和此点的最小矩形。</p>
	 *<p>此方法会修改本对象。</p>
	 *@param x 点的 X 坐标。
	 *@param y 点的 Y 坐标。
	 *@return 返回此 Rectangle 对象。
	 */
	__proto.addPoint = function(x, y) {
		this.x > x && (this.width += this.x - x, this.x = x);
		this.y > y && (this.height += this.y - y, this.y = y);
		if (this.width < x - this.x) this.width = x - this.x;
		if (this.height < y - this.y) this.height = y - this.y;
		return this;
	}

	/**
	 *@private
	 *返回代表当前矩形的顶点数据。
	 *@return 顶点数据。
	 */
	__proto._getBoundPoints = function() {
		var rst = Rectangle._temB;
		rst.length = 0;
		if (this.width == 0 || this.height == 0) return rst;
		rst.push(this.x, this.y, this.x + this.width, this.y, this.x, this.y + this.height, this.x + this.width, this.y + this.height);
		return rst;
	}

	/**
	 *确定此 Rectangle 对象是否为空。
	 *@return 如果 Rectangle 对象的宽度或高度小于等于 0，则返回 true 值，否则返回 false。
	 */
	__proto.isEmpty = function() {
		if (this.width <= 0 || this.height <= 0) return true;
		return false;
	}

	/**此矩形右侧的 X 轴坐标。 x 和 width 属性的和。*/
	__getset(0, __proto, 'right', function() {
		return this.x + this.width;
	});

	/**此矩形底端的 Y 轴坐标。y 和 height 属性的和。*/
	__getset(0, __proto, 'bottom', function() {
		return this.y + this.height;
	});

	Rectangle._getBoundPointS = function(x, y, width, height) {
		var rst = Rectangle._temA;
		rst.length = 0;
		if (width == 0 || height == 0) return rst;
		rst.push(x, y, x + width, y, x, y + height, x + width, y + height);
		return rst;
	}

	Rectangle._getWrapRec = function(pointList, rst) {
		if (!pointList || pointList.length < 1) return rst ? rst.setTo(0, 0, 0, 0) : Rectangle.TEMP.setTo(0, 0, 0, 0);
		rst = rst ? rst : new Rectangle();
		var i, len = pointList.length,
			minX, maxX, minY, maxY, tPoint = Point.TEMP;
		minX = minY = 99999;
		maxX = maxY = -minX;
		for (i = 0; i < len; i += 2) {
			tPoint.x = pointList[i];
			tPoint.y = pointList[i + 1];
			minX = minX < tPoint.x ? minX : tPoint.x;
			minY = minY < tPoint.y ? minY : tPoint.y;
			maxX = maxX > tPoint.x ? maxX : tPoint.x;
			maxY = maxY > tPoint.y ? maxY : tPoint.y;
		}
		return rst.setTo(minX, minY, maxX - minX, maxY - minY);
	}

	Rectangle.EMPTY = new Rectangle();
	Rectangle.TEMP = new Rectangle();
	Rectangle._temB = [];
	Rectangle._temA = [];
	return Rectangle;
})()

/**
 *<p> <code>Byte</code> 类提供用于优化读取、写入以及处理二进制数据的方法和属性。</p>
 *<p><b>注意：</b> <code>Byte</code> 类适用于需要在字节层访问数据的高级开发人员。</p>
 */
//class laya.utils.Byte
var Byte = (function() {
	function Byte(data) {
		this._xd_ = true;
		this._allocated_ = 8;
		//this._d_=null;
		//this._u8d_=null;
		this._pos_ = 0;
		this._length = 0;
		if (data) {
			this._u8d_ = new Uint8Array(data);
			this._d_ = new DataView(this._u8d_.buffer);
			this._length = this._d_.byteLength;
		} else {
			this.___resizeBuffer(this._allocated_);
		}
	}

	__class(Byte, 'laya.utils.Byte');
	var __proto = Byte.prototype;
	/**@private */
	__proto.___resizeBuffer = function(len) {
		try {
			var newByteView = new Uint8Array(len);
			if (this._u8d_ != null) {
				if (this._u8d_.length <= len) newByteView.set(this._u8d_);
				else newByteView.set(this._u8d_.subarray(0, len));
			}
			this._u8d_ = newByteView;
			this._d_ = new DataView(newByteView.buffer);
		} catch (err) {
			throw "___resizeBuffer err:" + len;
		}
	}

	/**
	 *<p>常用于解析固定格式的字节流。</p>
	 *<p>先从字节流的当前字节偏移位置处读取一个 <code>Uint16</code> 值，然后以此值为长度，读取此长度的字符串。</p>
	 *@return 读取的字符串。
	 */
	__proto.getString = function() {
		return this.rUTF(this.getUint16());
	}

	/**
	 *<p>从字节流中 <code>start</code> 参数指定的位置开始，读取 <code>len</code> 参数指定的字节数的数据，用于创建一个 <code>Float32Array</code> 对象并返回此对象。</p>
	 *<p><b>注意：</b>返回的 Float32Array 对象，在 JavaScript 环境下，是原生的 HTML5 Float32Array 对象，对此对象的读取操作都是基于运行此程序的当前主机字节序，此顺序可能与实际数据的字节序不同，如果使用此对象进行读取，需要用户知晓实际数据的字节序和当前主机字节序，如果相同，可正常读取，否则需要用户对实际数据(Float32Array.buffer)包装一层 DataView ，使用 DataView 对象可按照指定的字节序进行读取。</p>
	 *@param start 开始位置。
	 *@param len 需要读取的字节长度。如果要读取的长度超过可读取范围，则只返回可读范围内的值。
	 *@return 读取的 Float32Array 对象。
	 */
	__proto.getFloat32Array = function(start, len) {
		var end = start + len;
		end = (end > this._length) ? this._length : end;
		var v = new Float32Array(this._d_.buffer.slice(start, end));
		this._pos_ = end;
		return v;
	}

	/**
	 *从字节流中 <code>start</code> 参数指定的位置开始，读取 <code>len</code> 参数指定的字节数的数据，用于创建一个 <code>Uint8Array</code> 对象并返回此对象。
	 *@param start 开始位置。
	 *@param len 需要读取的字节长度。如果要读取的长度超过可读取范围，则只返回可读范围内的值。
	 *@return 读取的 Uint8Array 对象。
	 */
	__proto.getUint8Array = function(start, len) {
		var end = start + len;
		end = (end > this._length) ? this._length : end;
		var v = new Uint8Array(this._d_.buffer.slice(start, end));
		this._pos_ = end;
		return v;
	}

	/**
	 *<p>从字节流中 <code>start</code> 参数指定的位置开始，读取 <code>len</code> 参数指定的字节数的数据，用于创建一个 <code>Int16Array</code> 对象并返回此对象。</p>
	 *<p><b>注意：</b>返回的 Int16Array 对象，在 JavaScript 环境下，是原生的 HTML5 Int16Array 对象，对此对象的读取操作都是基于运行此程序的当前主机字节序，此顺序可能与实际数据的字节序不同，如果使用此对象进行读取，需要用户知晓实际数据的字节序和当前主机字节序，如果相同，可正常读取，否则需要用户对实际数据(Int16Array.buffer)包装一层 DataView ，使用 DataView 对象可按照指定的字节序进行读取。</p>
	 *@param start 开始读取的字节偏移量位置。
	 *@param len 需要读取的字节长度。如果要读取的长度超过可读取范围，则只返回可读范围内的值。
	 *@return 读取的 Int16Array 对象。
	 */
	__proto.getInt16Array = function(start, len) {
		var end = start + len;
		end = (end > this._length) ? this._length : end;
		var v = new Int16Array(this._d_.buffer.slice(start, end));
		this._pos_ = end;
		return v;
	}

	/**
	 *从字节流的当前字节偏移位置处读取一个 IEEE 754 单精度（32 位）浮点数。
	 *@return 单精度（32 位）浮点数。
	 */
	__proto.getFloat32 = function() {
		if (this._pos_ + 4 > this._length) throw "getFloat32 error - Out of bounds";
		var v = this._d_.getFloat32(this._pos_, this._xd_);
		this._pos_ += 4;
		return v;
	}

	/**
	 *从字节流的当前字节偏移量位置处读取一个 IEEE 754 双精度（64 位）浮点数。
	 *@return 双精度（64 位）浮点数。
	 */
	__proto.getFloat64 = function() {
		if (this._pos_ + 8 > this._length) throw "getFloat64 error - Out of bounds";
		var v = this._d_.getFloat64(this._pos_, this._xd_);
		this._pos_ += 8;
		return v;
	}

	/**
	 *在字节流的当前字节偏移量位置处写入一个 IEEE 754 单精度（32 位）浮点数。
	 *@param value 单精度（32 位）浮点数。
	 */
	__proto.writeFloat32 = function(value) {
		this.ensureWrite(this._pos_ + 4);
		this._d_.setFloat32(this._pos_, value, this._xd_);
		this._pos_ += 4;
	}

	/**
	 *在字节流的当前字节偏移量位置处写入一个 IEEE 754 双精度（64 位）浮点数。
	 *@param value 双精度（64 位）浮点数。
	 */
	__proto.writeFloat64 = function(value) {
		this.ensureWrite(this._pos_ + 8);
		this._d_.setFloat64(this._pos_, value, this._xd_);
		this._pos_ += 8;
	}

	/**
	 *从字节流的当前字节偏移量位置处读取一个 Int32 值。
	 *@return Int32 值。
	 */
	__proto.getInt32 = function() {
		if (this._pos_ + 4 > this._length) throw "getInt32 error - Out of bounds";
		var float = this._d_.getInt32(this._pos_, this._xd_);
		this._pos_ += 4;
		return float;
	}

	/**
	 *从字节流的当前字节偏移量位置处读取一个 Uint32 值。
	 *@return Uint32 值。
	 */
	__proto.getUint32 = function() {
		if (this._pos_ + 4 > this._length) throw "getUint32 error - Out of bounds";
		var v = this._d_.getUint32(this._pos_, this._xd_);
		this._pos_ += 4;
		return v;
	}

	/**
	 *在字节流的当前字节偏移量位置处写入指定的 Int32 值。
	 *@param value 需要写入的 Int32 值。
	 */
	__proto.writeInt32 = function(value) {
		this.ensureWrite(this._pos_ + 4);
		this._d_.setInt32(this._pos_, value, this._xd_);
		this._pos_ += 4;
	}

	/**
	 *在字节流的当前字节偏移量位置处写入 Uint32 值。
	 *@param value 需要写入的 Uint32 值。
	 */
	__proto.writeUint32 = function(value) {
		this.ensureWrite(this._pos_ + 4);
		this._d_.setUint32(this._pos_, value, this._xd_);
		this._pos_ += 4;
	}

	/**
	 *从字节流的当前字节偏移量位置处读取一个 Int16 值。
	 *@return Int16 值。
	 */
	__proto.getInt16 = function() {
		if (this._pos_ + 2 > this._length) throw "getInt16 error - Out of bounds";
		var us = this._d_.getInt16(this._pos_, this._xd_);
		this._pos_ += 2;
		return us;
	}

	/**
	 *从字节流的当前字节偏移量位置处读取一个 Uint16 值。
	 *@return Uint16 值。
	 */
	__proto.getUint16 = function() {
		if (this._pos_ + 2 > this._length) throw "getUint16 error - Out of bounds";
		var us = this._d_.getUint16(this._pos_, this._xd_);
		this._pos_ += 2;
		return us;
	}

	/**
	 *在字节流的当前字节偏移量位置处写入指定的 Uint16 值。
	 *@param value 需要写入的Uint16 值。
	 */
	__proto.writeUint16 = function(value) {
		if (value > 65536) debugger;
		this.ensureWrite(this._pos_ + 2);
		this._d_.setUint16(this._pos_, value, this._xd_);
		this._pos_ += 2;
	}

	/**
	 *在字节流的当前字节偏移量位置处写入指定的 Int16 值。
	 *@param value 需要写入的 Int16 值。
	 */
	__proto.writeInt16 = function(value) {
		this.ensureWrite(this._pos_ + 2);
		this._d_.setInt16(this._pos_, value, this._xd_);
		this._pos_ += 2;
	}

	/**
	 *从字节流的当前字节偏移量位置处读取一个 Uint8 值。
	 *@return Uint8 值。
	 */
	__proto.getUint8 = function() {
		if (this._pos_ + 1 > this._length) throw "getUint8 error - Out of bounds";
		return this._d_.getUint8(this._pos_++);
	}

	/**
	 *在字节流的当前字节偏移量位置处写入指定的 Uint8 值。
	 *@param value 需要写入的 Uint8 值。
	 */
	__proto.writeUint8 = function(value) {
		if (value > 255) throw "writeUint8 error - Out of range" + value;
		this.ensureWrite(this._pos_ + 1);
		this._d_.setUint8(this._pos_, value);
		this._pos_++;
	}

	/**
	 *@private
	 *从字节流的指定字节偏移量位置处读取一个 Uint8 值。
	 *@param pos 字节读取位置。
	 *@return Uint8 值。
	 */
	__proto._getUInt8 = function(pos) {
		return this._d_.getUint8(pos);
	}

	/**
	 *@private
	 *从字节流的指定字节偏移量位置处读取一个 Uint16 值。
	 *@param pos 字节读取位置。
	 *@return Uint16 值。
	 */
	__proto._getUint16 = function(pos) {
		return this._d_.getUint16(pos, this._xd_);
	}

	/**
	 *@private
	 *使用 getFloat32()读取6个值，用于创建并返回一个 Matrix 对象。
	 *@return Matrix 对象。
	 */
	__proto._getMatrix = function() {
		var rst = new Matrix(this.getFloat32(), this.getFloat32(), this.getFloat32(), this.getFloat32(), this.getFloat32(), this.getFloat32());
		return rst;
	}

	/**
	 *@private
	 *读取指定长度的 UTF 型字符串。
	 *@param len 需要读取的长度。
	 *@return 读取的字符串。
	 */
	__proto.rUTF = function(len) {
		var v = "",
			max = this._pos_ + len,
			c = 0,
			c2 = 0,
			c3 = 0,
			f = String.fromCharCode;
		var u = this._u8d_,
			i = 0;
		while (this._pos_ < max) {
			c = u[this._pos_++];
			if (c < 0x80) {
				if (c != 0) {
					v += f(c);
				}
			} else if (c < 0xE0) {
				v += f(((c & 0x3F) << 6) | (u[this._pos_++] & 0x7F));
			} else if (c < 0xF0) {
				c2 = u[this._pos_++];
				v += f(((c & 0x1F) << 12) | ((c2 & 0x7F) << 6) | (u[this._pos_++] & 0x7F));
			} else {
				c2 = u[this._pos_++];
				c3 = u[this._pos_++];
				v += f(((c & 0x0F) << 18) | ((c2 & 0x7F) << 12) | ((c3 << 6) & 0x7F) | (u[this._pos_++] & 0x7F));
			}
			i++;
		}
		return v;
	}

	/**
	 *@private
	 *读取 <code>len</code> 参数指定的长度的字符串。
	 *@param len 要读取的字符串的长度。
	 *@return 指定长度的字符串。
	 */
	__proto.getCustomString = function(len) {
		var v = "",
			ulen = 0,
			c = 0,
			c2 = 0,
			f = String.fromCharCode;
		var u = this._u8d_,
			i = 0;
		while (len > 0) {
			c = u[this._pos_];
			if (c < 0x80) {
				v += f(c);
				this._pos_++;
				len--;
			} else {
				ulen = c - 0x80;
				this._pos_++;
				len -= ulen;
				while (ulen > 0) {
					c = u[this._pos_++];
					c2 = u[this._pos_++];
					v += f((c2 << 8) | c);
					ulen--;
				}
			}
		}
		return v;
	}

	/**
	 *清除字节数组的内容，并将 length 和 pos 属性重置为 0。调用此方法将释放 Byte 实例占用的内存。
	 */
	__proto.clear = function() {
		this._pos_ = 0;
		this.length = 0;
	}

	/**
	 *@private
	 *获取此对象的 ArrayBuffer 引用。
	 *@return
	 */
	__proto.__getBuffer = function() {
		return this._d_.buffer;
	}

	/**
	 *<p>将 UTF-8 字符串写入字节流。类似于 writeUTF()方法，但 writeUTFBytes()不使用 16 位长度的字为字符串添加前缀。</p>
	 *<p>对应的读取方法为： getUTFBytes 。</p>
	 *@param value 要写入的字符串。
	 */
	__proto.writeUTFBytes = function(value) {
		value = value + "";
		for (var i = 0, sz = value.length; i < sz; i++) {
			var c = value.charCodeAt(i);
			if (c <= 0x7F) {
				this.writeByte(c);
			} else if (c <= 0x7FF) {
				this.ensureWrite(this._pos_ + 2);
				this._u8d_.set([0xC0 | (c >> 6), 0x80 | (c & 0x3F)], this._pos_);
				this._pos_ += 2;
			} else if (c <= 0xFFFF) {
				this.ensureWrite(this._pos_ + 3);
				this._u8d_.set([0xE0 | (c >> 12), 0x80 | ((c >> 6) & 0x3F), 0x80 | (c & 0x3F)], this._pos_);
				this._pos_ += 3;
			} else {
				this.ensureWrite(this._pos_ + 4);
				this._u8d_.set([0xF0 | (c >> 18), 0x80 | ((c >> 12) & 0x3F), 0x80 | ((c >> 6) & 0x3F), 0x80 | (c & 0x3F)], this._pos_);
				this._pos_ += 4;
			}
		}
	}

	/**
	 *<p>将 UTF-8 字符串写入字节流。先写入以字节表示的 UTF-8 字符串长度（作为 16 位整数），然后写入表示字符串字符的字节。</p>
	 *<p>对应的读取方法为： getUTFString 。</p>
	 *@param value 要写入的字符串值。
	 */
	__proto.writeUTFString = function(value) {
		var tPos = this.pos;
		this.writeUint16(1);
		this.writeUTFBytes(value);
		var dPos = this.pos - tPos - 2;
		if (dPos >= 65536) {
			throw "writeUTFString byte len more than 65536";
		}
		this._d_.setUint16(tPos, dPos, this._xd_);
	}

	/**
	 *@private
	 *读取 UTF-8 字符串。
	 *@return 读取的字符串。
	 */
	__proto.readUTFString = function() {
		return this.readUTFBytes(this.getUint16());
	}

	/**
	 *<p>从字节流中读取一个 UTF-8 字符串。假定字符串的前缀是一个无符号的短整型（以此字节表示要读取的长度）。</p>
	 *<p>对应的写入方法为： writeUTFString 。</p>
	 *@return 读取的字符串。
	 */
	__proto.getUTFString = function() {
		return this.readUTFString();
	}

	/**
	 *@private
	 *读字符串，必须是 writeUTFBytes 方法写入的字符串。
	 *@param len 要读的buffer长度，默认将读取缓冲区全部数据。
	 *@return 读取的字符串。
	 */
	__proto.readUTFBytes = function(len) {
		(len === void 0) && (len = -1);
		if (len == 0) return "";
		var lastBytes = this.bytesAvailable;
		if (len > lastBytes) throw "readUTFBytes error - Out of bounds";
		len = len > 0 ? len : lastBytes;
		return this.rUTF(len);
	}

	/**
	 *<p>从字节流中读取一个由 length 参数指定的长度的 UTF-8 字节序列，并返回一个字符串。</p>
	 *<p>一般读取的是由 writeUTFBytes 方法写入的字符串。</p>
	 *@param len 要读的buffer长度，默认将读取缓冲区全部数据。
	 *@return 读取的字符串。
	 */
	__proto.getUTFBytes = function(len) {
		(len === void 0) && (len = -1);
		return this.readUTFBytes(len);
	}

	/**
	 *<p>在字节流中写入一个字节。</p>
	 *<p>使用参数的低 8 位。忽略高 24 位。</p>
	 *@param value
	 */
	__proto.writeByte = function(value) {
		this.ensureWrite(this._pos_ + 1);
		this._d_.setInt8(this._pos_, value);
		this._pos_ += 1;
	}

	/**
	 *@private
	 *从字节流中读取带符号的字节。
	 */
	__proto.readByte = function() {
		if (this._pos_ + 1 > this._length) throw "readByte error - Out of bounds";
		return this._d_.getInt8(this._pos_++);
	}

	/**
	 *<p>从字节流中读取带符号的字节。</p>
	 *<p>返回值的范围是从-128 到 127。</p>
	 *@return 介于-128 和 127 之间的整数。
	 */
	__proto.getByte = function() {
		return this.readByte();
	}

	/**
	 *<p>保证该字节流的可用长度不小于 <code>lengthToEnsure</code> 参数指定的值。</p>
	 *@param lengthToEnsure 指定的长度。
	 */
	__proto.ensureWrite = function(lengthToEnsure) {
		if (this._length < lengthToEnsure) this._length = lengthToEnsure;
		if (this._allocated_ < lengthToEnsure) this.length = lengthToEnsure;
	}

	/**
	 *<p>将指定 arraybuffer 对象中的以 offset 为起始偏移量， length 为长度的字节序列写入字节流。</p>
	 *<p>如果省略 length 参数，则使用默认长度 0，该方法将从 offset 开始写入整个缓冲区；如果还省略了 offset 参数，则写入整个缓冲区。</p>
	 *<p>如果 offset 或 length 小于0，本函数将抛出异常。</p>
	 *@param arraybuffer 需要写入的 Arraybuffer 对象。
	 *@param offset Arraybuffer 对象的索引的偏移量（以字节为单位）
	 *@param length 从 Arraybuffer 对象写入到 Byte 对象的长度（以字节为单位）
	 */
	__proto.writeArrayBuffer = function(arraybuffer, offset, length) {
		(offset === void 0) && (offset = 0);
		(length === void 0) && (length = 0);
		if (offset < 0 || length < 0) throw "writeArrayBuffer error - Out of bounds";
		if (length == 0) length = arraybuffer.byteLength - offset;
		this.ensureWrite(this._pos_ + length);
		var uint8array = new Uint8Array(arraybuffer);
		this._u8d_.set(uint8array.subarray(offset, offset + length), this._pos_);
		this._pos_ += length;
	}

	/**
	 *获取此对象的 ArrayBuffer 数据，数据只包含有效数据部分。
	 */
	__getset(0, __proto, 'buffer', function() {
		var rstBuffer = this._d_.buffer;
		if (rstBuffer.byteLength == this.length) return rstBuffer;
		return rstBuffer.slice(0, this.length);
	});

	/**
	 *<p> <code>Byte</code> 实例的字节序。取值为：<code>BIG_ENDIAN</code> 或 <code>BIG_ENDIAN</code> 。</p>
	 *<p>主机字节序，是 CPU 存放数据的两种不同顺序，包括小端字节序和大端字节序。通过 <code>getSystemEndian</code> 可以获取当前系统的字节序。</p>
	 *<p> <code>BIG_ENDIAN</code> ：大端字节序，地址低位存储值的高位，地址高位存储值的低位。有时也称之为网络字节序。<br/>
	 *<code>LITTLE_ENDIAN</code> ：小端字节序，地址低位存储值的低位，地址高位存储值的高位。</p>
	 */
	__getset(0, __proto, 'endian', function() {
		return this._xd_ ? "littleEndian" : "bigEndian";
	}, function(endianStr) {
		this._xd_ = (endianStr == "littleEndian");
	});

	/**
	 *<p> <code>Byte</code> 对象的长度（以字节为单位）。</p>
	 *<p>如果将长度设置为大于当前长度的值，则用零填充字节数组的右侧；如果将长度设置为小于当前长度的值，将会截断该字节数组。</p>
	 *<p>如果要设置的长度大于当前已分配的内存空间的字节长度，则重新分配内存空间，大小为以下两者较大者：要设置的长度、当前已分配的长度的2倍，并将原有数据拷贝到新的内存空间中；如果要设置的长度小于当前已分配的内存空间的字节长度，也会重新分配内存空间，大小为要设置的长度，并将原有数据从头截断为要设置的长度存入新的内存空间中。</p>
	 */
	__getset(0, __proto, 'length', function() {
		return this._length;
	}, function(value) {
		if (this._allocated_ < value)
			this.___resizeBuffer(this._allocated_ = Math.floor(Math.max(value, this._allocated_ * 2)));
		else if (this._allocated_ > value)
			this.___resizeBuffer(this._allocated_ = value);
		this._length = value;
	});

	/**
	 *移动或返回 Byte 对象的读写指针的当前位置（以字节为单位）。下一次调用读取方法时将在此位置开始读取，或者下一次调用写入方法时将在此位置开始写入。
	 */
	__getset(0, __proto, 'pos', function() {
		return this._pos_;
	}, function(value) {
		this._pos_ = value;
	});

	/**
	 *可从字节流的当前位置到末尾读取的数据的字节数。
	 */
	__getset(0, __proto, 'bytesAvailable', function() {
		return this._length - this._pos_;
	});

	Byte.getSystemEndian = function() {
		if (!Byte._sysEndian) {
			var buffer = new ArrayBuffer(2);
			new DataView(buffer).setInt16(0, 256, true);
			Byte._sysEndian = (new Int16Array(buffer))[0] === 256 ? "littleEndian" : "bigEndian";
		}
		return Byte._sysEndian;
	}

	Byte.BIG_ENDIAN = "bigEndian";
	Byte.LITTLE_ENDIAN = "littleEndian";
	Byte._sysEndian = null;
	return Byte;
})()



//class laya.debug.tools.enginehook.SpriteRenderForVisibleAnalyse
var SpriteRenderForVisibleAnalyse = (function() {
	function SpriteRenderForVisibleAnalyse() {
		this._repaint = 1;
		this._renderType = 1;
		this._x = 0;
		this._y = 0;
		this.target = null;
		this.isTargetRenderd = false;
		this.preFun = null;
		this._next = null;
		this.pgraphic = RenderSprite["prototype"]["_graphics"];
		this.pimage = RenderSprite["prototype"]["_image"];
		this.pimage2 = RenderSprite["prototype"]["_image2"];
	}

	__class(SpriteRenderForVisibleAnalyse, 'laya.debug.tools.enginehook.SpriteRenderForVisibleAnalyse');
	var __proto = SpriteRenderForVisibleAnalyse.prototype;
	__proto.setRenderHook = function() {
		Sprite["prototype"]["render"] = SpriteRenderForVisibleAnalyse.I.render;
	}

	/**
	 *更新、呈现显示对象。
	 *@param context 渲染的上下文引用。
	 *@param x X轴坐标。
	 *@param y Y轴坐标。
	 */
	__proto.render = function(context, x, y) {
		var me;
		me = this;
		if (DebugInfoLayer.I.isDebugItem(me)) return;
		if (me == laya.debug.tools.enginehook.SpriteRenderForVisibleAnalyse.I.target) {
			laya.debug.tools.enginehook.SpriteRenderForVisibleAnalyse.allowRendering = true;
			laya.debug.tools.enginehook.SpriteRenderForVisibleAnalyse.I.isTargetRenderd = true;
			CanvasTools.clearCanvas(SpriteRenderForVisibleAnalyse.mainCanvas);
		}
		RenderSprite.renders[this._renderType]._fun(this, context, x + this._x, y + this._y);
		if (me == laya.debug.tools.enginehook.SpriteRenderForVisibleAnalyse.I.target) {
			SpriteRenderForVisibleAnalyse.tarRec = CanvasTools.getCanvasDisRec(laya.debug.tools.enginehook.SpriteRenderForVisibleAnalyse.mainCanvas);
			console.log("rec", SpriteRenderForVisibleAnalyse.tarRec.toString());
			if (SpriteRenderForVisibleAnalyse.tarRec.width > 0 && SpriteRenderForVisibleAnalyse.tarRec.height > 0) {
				SpriteRenderForVisibleAnalyse.isTarRecOK = true;
				SpriteRenderForVisibleAnalyse.preImageData = CanvasTools.getImageDataFromCanvasByRec(SpriteRenderForVisibleAnalyse.mainCanvas, SpriteRenderForVisibleAnalyse.tarRec);
				SpriteRenderForVisibleAnalyse.tarImageData = CanvasTools.getImageDataFromCanvasByRec(SpriteRenderForVisibleAnalyse.mainCanvas, SpriteRenderForVisibleAnalyse.tarRec);
			} else {
				console.log("tarRec Not OK:", SpriteRenderForVisibleAnalyse.tarRec);
			}
		} else {
			if (SpriteRenderForVisibleAnalyse.isTarRecOK) {
				SpriteRenderForVisibleAnalyse.tImageData = CanvasTools.getImageDataFromCanvasByRec(SpriteRenderForVisibleAnalyse.mainCanvas, SpriteRenderForVisibleAnalyse.tarRec);
				var dRate = NaN;
				dRate = CanvasTools.getDifferRate(SpriteRenderForVisibleAnalyse.preImageData, SpriteRenderForVisibleAnalyse.tImageData);
				SpriteRenderForVisibleAnalyse.preImageData = SpriteRenderForVisibleAnalyse.tImageData;
				if (dRate > 0) {
					VisibleAnalyser.addCoverNode(me, dRate);
				}
			}
		}
	}

	__proto.analyseNode = function(node) {
		VisibleAnalyser.resetCoverList();
		if (Sprite["prototype"]["render"] != SpriteRenderForVisibleAnalyse.I.render) {
			this.preFun = Sprite["prototype"]["render"];
		}
		this.target = node;
		Sprite["prototype"]["render"] = this.render;
		if (!SpriteRenderForVisibleAnalyse.tarCanvas)
			SpriteRenderForVisibleAnalyse.tarCanvas = CanvasTools.createCanvas(Laya.stage.width, Laya.stage.height);
		if (!SpriteRenderForVisibleAnalyse.mainCanvas)
			SpriteRenderForVisibleAnalyse.mainCanvas = CanvasTools.createCanvas(Laya.stage.width, Laya.stage.height);
		this.isTargetRenderd = false;
		SpriteRenderForVisibleAnalyse.isVisibleTesting = true;
		SpriteRenderForVisibleAnalyse.allowRendering = false;
		CanvasTools.clearCanvas(SpriteRenderForVisibleAnalyse.mainCanvas);
		CanvasTools.clearCanvas(SpriteRenderForVisibleAnalyse.tarCanvas);
		SpriteRenderForVisibleAnalyse.isTarRecOK = false;
		var ctx = new RenderContext(SpriteRenderForVisibleAnalyse.mainCanvas.width, SpriteRenderForVisibleAnalyse.mainCanvas.height, SpriteRenderForVisibleAnalyse.mainCanvas);
		SpriteRenderForVisibleAnalyse.mainCanvas = ctx.canvas;
		this.render.call(Laya.stage, ctx, 0, 0);
		if (!SpriteRenderForVisibleAnalyse.isTarRecOK) {
			SpriteRenderForVisibleAnalyse.coverRate = 0;
		} else {
			SpriteRenderForVisibleAnalyse.coverRate = CanvasTools.getDifferRate(SpriteRenderForVisibleAnalyse.preImageData, SpriteRenderForVisibleAnalyse.tarImageData);
		}
		VisibleAnalyser.coverRate = SpriteRenderForVisibleAnalyse.coverRate;
		VisibleAnalyser.isTarRecOK = SpriteRenderForVisibleAnalyse.isTarRecOK;
		console.log("coverRate:", SpriteRenderForVisibleAnalyse.coverRate);
		this.isTargetRenderd = false;
		SpriteRenderForVisibleAnalyse.isVisibleTesting = false;
		SpriteRenderForVisibleAnalyse.allowRendering = true;
		Sprite["prototype"]["render"] = this.preFun;
	}

	__proto.noRenderMode = function() {
		return;
		RenderSprite["prototype"]["_graphics"] = this.m_graphics;
		RenderSprite["prototype"]["_image"] = this.m_image;
		RenderSprite["prototype"]["_image2"] = this.m_image2;
	}

	__proto.normalMode = function() {
		RenderSprite["prototype"]["_graphics"] = this.pgraphic;
		RenderSprite["prototype"]["_image"] = this.pimage;
		RenderSprite["prototype"]["_image2"] = this.pimage2;
	}

	__proto.inits = function() {
		this.noRenderMode();
	}

	__proto.m_graphics = function(sprite, context, x, y) {
		if (laya.debug.tools.enginehook.SpriteRenderForVisibleAnalyse.allowRendering) {
			var tf = sprite._style._tf;
			sprite._graphics && sprite._graphics._render(sprite, context, x - tf.translateX, y - tf.translateY);
		};
		var next = this._next;
		next._fun.call(next, sprite, context, x, y);
	}

	__proto.m_image = function(sprite, context, x, y) {
		if (laya.debug.tools.enginehook.SpriteRenderForVisibleAnalyse.allowRendering) {
			var style = sprite._style;
			context.ctx.drawTexture2(x, y, style._tf.translateX, style._tf.translateY, sprite.transform, style.alpha, style.blendMode, sprite._graphics._one);
		}
	}

	__proto.m_image2 = function(sprite, context, x, y) {
		if (laya.debug.tools.enginehook.SpriteRenderForVisibleAnalyse.allowRendering) {
			var tf = sprite._style._tf;
			context.ctx.drawTexture2(x, y, tf.translateX, tf.translateY, sprite.transform, 1, null, sprite._graphics._one);
		}
	}

	SpriteRenderForVisibleAnalyse.tarCanvas = null
	SpriteRenderForVisibleAnalyse.mainCanvas = null
	SpriteRenderForVisibleAnalyse.preImageData = null
	SpriteRenderForVisibleAnalyse.tImageData = null
	SpriteRenderForVisibleAnalyse.tarImageData = null
	SpriteRenderForVisibleAnalyse.tarRec = null
	SpriteRenderForVisibleAnalyse.isTarRecOK = false;
	SpriteRenderForVisibleAnalyse.isVisibleTesting = false;
	SpriteRenderForVisibleAnalyse.allowRendering = true;
	SpriteRenderForVisibleAnalyse.coverRate = NaN
	__static(SpriteRenderForVisibleAnalyse, ['I', function() {
		return this.I = new SpriteRenderForVisibleAnalyse();
	}]);
	return SpriteRenderForVisibleAnalyse;
})()


/**
 *@private
 *<code>Resource</code> 资源存取类。
 */
//class laya.resource.Resource extends laya.events.EventDispatcher
var Resource = (function(_super) {
	function Resource() {
		//this._id=0;
		//this._lastUseFrameCount=0;
		//this._memorySize=0;
		//this._name=null;
		//this._url=null;
		//this.__loaded=false;
		//this._released=false;
		//this._disposed=false;
		//this._resourceManager=null;
		//this.lock=false;
		Resource.__super.call(this);
		this._$1__id = ++Resource._uniqueIDCounter;
		this.__loaded = true;
		this._disposed = false;
		Resource._loadedResources.push(this);
		Resource._isLoadedResourcesSorted = false;
		this._released = true;
		this.lock = false;
		this._memorySize = 0;
		this._lastUseFrameCount = -1;
		(ResourceManager.currentResourceManager) && (ResourceManager.currentResourceManager.addResource(this));
	}

	__class(Resource, 'laya.resource.Resource', _super);
	var __proto = Resource.prototype;
	Laya.imps(__proto, {
		"laya.resource.ICreateResource": true,
		"laya.resource.IDispose": true
	})
	/**
	 *@private
	 */
	__proto._endLoaded = function() {
		this.__loaded = true;
		this.event("loaded", this);
	}

	/**重新创建资源,override it，同时修改memorySize属性、处理startCreate()和compoleteCreate()方法。*/
	__proto.recreateResource = function() {
		this.startCreate();
		this.completeCreate();
	}

	/**销毁资源，override it,同时修改memorySize属性。*/
	__proto.detoryResource = function() {}
	/**
	 *激活资源，使用资源前应先调用此函数激活。
	 *@param force 是否强制创建。
	 */
	__proto.activeResource = function(force) {
		(force === void 0) && (force = false);
		this._lastUseFrameCount = Stat.loopCount;
		if (this._released || force) {
			this.recreateResource();
		}
	}

	/**
	 *释放资源。
	 *@param force 是否强制释放。
	 *@return 是否成功释放。
	 */
	__proto.releaseResource = function(force) {
		(force === void 0) && (force = false);
		if (!force && this.lock)
			return false;
		if (!this._released || force) {
			this.detoryResource();
			this._released = true;
			this._lastUseFrameCount = -1;
			this.event("released", this);
			return true;
		} else {
			return false;
		}
	}

	/**
	 *设置唯一名字,如果名字重复则自动加上“-copy”。
	 *@param newName 名字。
	 */
	__proto.setUniqueName = function(newName) {
		var isUnique = true;
		for (var i = 0; i < Resource._loadedResources.length; i++) {
			if (Resource._loadedResources[i]._name !== newName || Resource._loadedResources[i] === this)
				continue;
			isUnique = false;
			return;
		}
		if (isUnique) {
			if (this.name != newName) {
				this.name = newName;
				Resource._isLoadedResourcesSorted = false;
			}
		} else {
			this.setUniqueName(newName.concat("-copy"));
		}
	}

	/**
	 *@private
	 */
	__proto.onAsynLoaded = function(url, data, params) {
		throw new Error("Resource: must override this function!");
	}

	/**
	 *<p>彻底处理资源，处理后不能恢复。</p>
	 *<p><b>注意：</b>会强制解锁清理。</p>
	 */
	__proto.dispose = function() {
		if (this._resourceManager !== null)
			throw new Error("附属于resourceManager的资源不能独立释放！");
		this._disposed = true;
		this.lock = false;
		this.releaseResource();
		var index = Resource._loadedResources.indexOf(this);
		if (index !== -1) {
			Resource._loadedResources.splice(index, 1);
			Resource._isLoadedResourcesSorted = false;
		}
		Loader.clearRes(this.url);
	}

	/**开始资源激活。*/
	__proto.startCreate = function() {
		this.event("recovering", this);
	}

	/**完成资源激活。*/
	__proto.completeCreate = function() {
		this._released = false;
		this.event("recovered", this);
	}

	/**
	 *占用内存尺寸。
	 */
	__getset(0, __proto, 'memorySize', function() {
		return this._memorySize;
	}, function(value) {
		var offsetValue = value - this._memorySize;
		this._memorySize = value;
		this.resourceManager && this.resourceManager.addSize(offsetValue);
	});

	/**
	 *@private
	 */
	__getset(0, __proto, '_loaded', null, function(value) {
		this.__loaded = value;
	});

	/**
	 *获取是否已加载完成。
	 */
	__getset(0, __proto, 'loaded', function() {
		return this.__loaded;
	});

	/**
	 *获取唯一标识ID,通常用于识别。
	 */
	__getset(0, __proto, 'id', function() {
		return this._$1__id;
	});

	/**
	 *设置名字
	 */
	/**
	 *获取名字。
	 */
	__getset(0, __proto, 'name', function() {
		return this._name;
	}, function(value) {
		if ((value || value !== "") && this.name !== value) {
			this._name = value;
			Resource._isLoadedResourcesSorted = false;
		}
	});

	/**
	 *是否已处理。
	 */
	__getset(0, __proto, 'disposed', function() {
		return this._disposed;
	});

	/**
	 *是否已释放。
	 */
	__getset(0, __proto, 'released', function() {
		return this._released;
	});

	/**
	 *资源管理员。
	 */
	__getset(0, __proto, 'resourceManager', function() {
		return this._resourceManager;
	});

	/**
	 *距离上次使用帧率。
	 */
	__getset(0, __proto, 'lastUseFrameCount', function() {
		return this._lastUseFrameCount;
	});

	/**
	 *色湖之资源的URL地址。
	 *@param value URL地址。
	 */
	/**
	 *获取资源的URL地址。
	 *@return URL地址。
	 */
	__getset(0, __proto, 'url', function() {
		return this._url;
	}, function(value) {
		this._url = value;
	});

	/**
	 *本类型排序后的已载入资源。
	 */
	__getset(1, Resource, 'sortedLoadedResourcesByName', function() {
		if (!Resource._isLoadedResourcesSorted) {
			Resource._isLoadedResourcesSorted = true;
			Resource._loadedResources.sort(Resource.compareResourcesByName);
		}
		return Resource._loadedResources;
	}, laya.events.EventDispatcher._$SET_sortedLoadedResourcesByName);

	Resource.getLoadedResourceByIndex = function(index) {
		return Resource._loadedResources[index];
	}

	Resource.getLoadedResourcesCount = function() {
		return Resource._loadedResources.length;
	}

	Resource.compareResourcesByName = function(left, right) {
		if (left === right)
			return 0;
		var x = left.name;
		var y = right.name;
		if (x === null) {
			if (y === null)
				return 0;
			else
				return -1;
		} else {
			if (y == null)
				return 1;
			else {
				var retval = x.localeCompare(y);
				if (retval != 0)
					return retval;
				else {
					right.setUniqueName(y);
					y = right.name;
					return x.localeCompare(y);
				}
			}
		}
	}

	Resource._uniqueIDCounter = 0;
	Resource._loadedResources = [];
	Resource._isLoadedResourcesSorted = false;
	return Resource;
})(EventDispatcher)

/**
 *<code>AnimationTemplet</code> 类用于动画模板资源。
 */
//class laya.ani.AnimationTemplet extends laya.resource.Resource
var AnimationTemplet = (function(_super) {
	function AnimationTemplet() {
		//this._aniVersion=null;
		this._aniMap = {};
		//this._publicExtData=null;
		//this._useParent=false;
		//this.unfixedCurrentFrameIndexes=null;
		//this.unfixedCurrentTimes=null;
		//this.unfixedKeyframes=null;
		this.unfixedLastAniIndex = -1;
		//this._aniClassName=null;
		//this._animationDatasCache=null;
		AnimationTemplet.__super.call(this);
		this._anis = new Array;
	}

	__class(AnimationTemplet, 'laya.ani.AnimationTemplet', _super);
	var __proto = AnimationTemplet.prototype;
	/**
	 *@private
	 */
	__proto.parse = function(data) {
		var reader = new Byte(data);
		this._aniVersion = reader.readUTFString();
		AnimationParser01$1.parse(this, reader);
	}

	/**
	 *@private
	 */
	__proto._calculateKeyFrame = function(node, keyframeCount, keyframeDataCount) {
		var keyFrames = node.keyFrame;
		keyFrames[keyframeCount] = keyFrames[0];
		for (var i = 0; i < keyframeCount; i++) {
			var keyFrame = keyFrames[i];
			for (var j = 0; j < keyframeDataCount; j++) {
				keyFrame.dData[j] = (keyFrame.duration === 0) ? 0 : (keyFrames[i + 1].data[j] - keyFrame.data[j]) / keyFrame.duration;
				keyFrame.nextData[j] = keyFrames[i + 1].data[j];
			}
		}
		keyFrames.length--;
	}

	/**
	 *@inheritDoc
	 */
	__proto.onAsynLoaded = function(url, data, params) {
		var reader = new Byte(data);
		this._aniVersion = reader.readUTFString();
		switch (this._aniVersion) {
			case "LAYAANIMATION:02":
				AnimationParser02.parse(this, reader);
				break;
			default:
				AnimationParser01$1.parse(this, reader);
		}
		this._endLoaded();
	}

	__proto.getAnimationCount = function() {
		return this._anis.length;
	}

	__proto.getAnimation = function(aniIndex) {
		return this._anis[aniIndex];
	}

	__proto.getAniDuration = function(aniIndex) {
		return this._anis[aniIndex].playTime;
	}

	__proto.getNodes = function(aniIndex) {
		return this._anis[aniIndex].nodes;
	}

	__proto.getNodeIndexWithName = function(aniIndex, name) {
		return this._anis[aniIndex].bone3DMap[name];
	}

	__proto.getNodeCount = function(aniIndex) {
		return this._anis[aniIndex].nodes.length;
	}

	__proto.getTotalkeyframesLength = function(aniIndex) {
		return this._anis[aniIndex].totalKeyframeDatasLength;
	}

	__proto.getPublicExtData = function() {
		return this._publicExtData;
	}

	__proto.getAnimationDataWithCache = function(key, cacheDatas, aniIndex, frameIndex) {
		var aniDatas = cacheDatas[aniIndex];
		if (!aniDatas) {
			return null;
		} else {
			var keyDatas = aniDatas[key];
			if (!keyDatas)
				return null;
			else {
				return keyDatas[frameIndex];
			}
		}
	}

	__proto.setAnimationDataWithCache = function(key, cacheDatas, aniIndex, frameIndex, data) {
		var aniDatas = (cacheDatas[aniIndex]) || (cacheDatas[aniIndex] = {});
		var aniDatasCache = (aniDatas[key]) || (aniDatas[key] = []);
		aniDatasCache[frameIndex] = data;
	}

	__proto.getOriginalData = function(aniIndex, originalData, nodesFrameIndices, frameIndex, playCurTime) {
		var oneAni = this._anis[aniIndex];
		var nodes = oneAni.nodes;
		var j = 0;
		for (var i = 0, n = nodes.length, outOfs = 0; i < n; i++) {
			var node = nodes[i];
			var key;
			key = node.keyFrame[nodesFrameIndices[i][frameIndex]];
			node.dataOffset = outOfs;
			var dt = playCurTime - key.startTime;
			var lerpType = node.lerpType;
			if (lerpType) {
				switch (lerpType) {
					case 0:
					case 1:
						for (j = 0; j < node.keyframeWidth;)
							j += node.interpolationMethod[j](node, j, originalData, outOfs + j, key.data, dt, key.dData, key.duration, key.nextData);
						break;
					case 2:
						;
						var interpolationData = key.interpolationData;
						var interDataLen = interpolationData.length;
						var dataIndex = 0;
						for (j = 0; j < interDataLen;) {
							var type = interpolationData[j];
							switch (type) {
								case 6:
									j += AnimationTemplet.interpolation[type](node, dataIndex, originalData, outOfs + dataIndex, key.data, dt, key.dData, key.duration, key.nextData, interpolationData, j + 1);
									break;
								case 7:
									j += AnimationTemplet.interpolation[type](node, dataIndex, originalData, outOfs + dataIndex, key.data, dt, key.dData, key.duration, key.nextData, interpolationData, j + 1);
									break;
								default:
									j += AnimationTemplet.interpolation[type](node, dataIndex, originalData, outOfs + dataIndex, key.data, dt, key.dData, key.duration, key.nextData);
							}
							dataIndex++;
						}
						break;
				}
			} else {
				for (j = 0; j < node.keyframeWidth;)
					j += node.interpolationMethod[j](node, j, originalData, outOfs + j, key.data, dt, key.dData, key.duration, key.nextData);
			}
			outOfs += node.keyframeWidth;
		}
	}

	__proto.getNodesCurrentFrameIndex = function(aniIndex, playCurTime) {
		var ani = this._anis[aniIndex];
		var nodes = ani.nodes;
		if (aniIndex !== this.unfixedLastAniIndex) {
			this.unfixedCurrentFrameIndexes = new Uint32Array(nodes.length);
			this.unfixedCurrentTimes = new Float32Array(nodes.length);
			this.unfixedLastAniIndex = aniIndex;
		}
		for (var i = 0, n = nodes.length, outOfs = 0; i < n; i++) {
			var node = nodes[i];
			if (playCurTime < this.unfixedCurrentTimes[i])
				this.unfixedCurrentFrameIndexes[i] = 0;
			this.unfixedCurrentTimes[i] = playCurTime;
			while ((this.unfixedCurrentFrameIndexes[i] < node.keyFrame.length)) {
				if (node.keyFrame[this.unfixedCurrentFrameIndexes[i]].startTime > this.unfixedCurrentTimes[i])
					break;
				this.unfixedCurrentFrameIndexes[i]++;
			}
			this.unfixedCurrentFrameIndexes[i]--;
		}
		return this.unfixedCurrentFrameIndexes;
	}

	__proto.getOriginalDataUnfixedRate = function(aniIndex, originalData, playCurTime) {
		var oneAni = this._anis[aniIndex];
		var nodes = oneAni.nodes;
		if (aniIndex !== this.unfixedLastAniIndex) {
			this.unfixedCurrentFrameIndexes = new Uint32Array(nodes.length);
			this.unfixedCurrentTimes = new Float32Array(nodes.length);
			this.unfixedKeyframes = __newvec(nodes.length);
			this.unfixedLastAniIndex = aniIndex;
		};
		var j = 0;
		for (var i = 0, n = nodes.length, outOfs = 0; i < n; i++) {
			var node = nodes[i];
			if (playCurTime < this.unfixedCurrentTimes[i])
				this.unfixedCurrentFrameIndexes[i] = 0;
			this.unfixedCurrentTimes[i] = playCurTime;
			while (this.unfixedCurrentFrameIndexes[i] < node.keyFrame.length) {
				if (node.keyFrame[this.unfixedCurrentFrameIndexes[i]].startTime > this.unfixedCurrentTimes[i])
					break;
				this.unfixedKeyframes[i] = node.keyFrame[this.unfixedCurrentFrameIndexes[i]];
				this.unfixedCurrentFrameIndexes[i]++;
			};
			var key = this.unfixedKeyframes[i];
			node.dataOffset = outOfs;
			var dt = playCurTime - key.startTime;
			var lerpType = node.lerpType;
			if (lerpType) {
				switch (node.lerpType) {
					case 0:
					case 1:
						for (j = 0; j < node.keyframeWidth;)
							j += node.interpolationMethod[j](node, j, originalData, outOfs + j, key.data, dt, key.dData, key.duration, key.nextData);
						break;
					case 2:
						;
						var interpolationData = key.interpolationData;
						var interDataLen = interpolationData.length;
						var dataIndex = 0;
						for (j = 0; j < interDataLen;) {
							var type = interpolationData[j];
							switch (type) {
								case 6:
									j += AnimationTemplet.interpolation[type](node, dataIndex, originalData, outOfs + dataIndex, key.data, dt, key.dData, key.duration, key.nextData, interpolationData, j + 1);
									break;
								case 7:
									j += AnimationTemplet.interpolation[type](node, dataIndex, originalData, outOfs + dataIndex, key.data, dt, key.dData, key.duration, key.nextData, interpolationData, j + 1);
									break;
								default:
									j += AnimationTemplet.interpolation[type](node, dataIndex, originalData, outOfs + dataIndex, key.data, dt, key.dData, key.duration, key.nextData);
							}
							dataIndex++;
						}
						break;
				}
			} else {
				for (j = 0; j < node.keyframeWidth;)
					j += node.interpolationMethod[j](node, j, originalData, outOfs + j, key.data, dt, key.dData, key.duration, key.nextData);
			}
			outOfs += node.keyframeWidth;
		}
	}

	__proto.dispose = function() {
		if (this.resourceManager)
			this.resourceManager.removeResource(this);
		_super.prototype.dispose.call(this);
	}

	AnimationTemplet._LinearInterpolation_0 = function(bone, index, out, outOfs, data, dt, dData, duration, nextData, interData) {
		out[outOfs] = data[index] + dt * dData[index];
		return 1;
	}

	AnimationTemplet._QuaternionInterpolation_1 = function(bone, index, out, outOfs, data, dt, dData, duration, nextData, interData) {
		var amount = duration === 0 ? 0 : dt / duration;
		MathUtil.slerpQuaternionArray(data, index, nextData, index, amount, out, outOfs);
		return 4;
	}

	AnimationTemplet._AngleInterpolation_2 = function(bone, index, out, outOfs, data, dt, dData, duration, nextData, interData) {
		return 0;
	}

	AnimationTemplet._RadiansInterpolation_3 = function(bone, index, out, outOfs, data, dt, dData, duration, nextData, interData) {
		return 0;
	}

	AnimationTemplet._Matrix4x4Interpolation_4 = function(bone, index, out, outOfs, data, dt, dData, duration, nextData, interData) {
		for (var i = 0; i < 16; i++, index++)
			out[outOfs + i] = data[index] + dt * dData[index];
		return 16;
	}

	AnimationTemplet._NoInterpolation_5 = function(bone, index, out, outOfs, data, dt, dData, duration, nextData, interData) {
		out[outOfs] = data[index];
		return 1;
	}

	AnimationTemplet._BezierInterpolation_6 = function(bone, index, out, outOfs, data, dt, dData, duration, nextData, interData, offset) {
		(offset === void 0) && (offset = 0);
		out[outOfs] = data[index] + (nextData[index] - data[index]) * BezierLerp.getBezierRate(dt / duration, interData[offset], interData[offset + 1], interData[offset + 2], interData[offset + 3]);
		return 5;
	}

	AnimationTemplet._BezierInterpolation_7 = function(bone, index, out, outOfs, data, dt, dData, duration, nextData, interData, offset) {
		(offset === void 0) && (offset = 0);
		out[outOfs] = interData[offset + 4] + interData[offset + 5] * BezierLerp.getBezierRate((dt * 0.001 + interData[offset + 6]) / interData[offset + 7], interData[offset], interData[offset + 1], interData[offset + 2], interData[offset + 3]);
		return 9;
	}

	AnimationTemplet.load = function(url) {
		return Laya.loader.create(url, null, null, AnimationTemplet);
	}

	AnimationTemplet.interpolation = [AnimationTemplet._LinearInterpolation_0, AnimationTemplet._QuaternionInterpolation_1, AnimationTemplet._AngleInterpolation_2, AnimationTemplet._RadiansInterpolation_3, AnimationTemplet._Matrix4x4Interpolation_4, AnimationTemplet._NoInterpolation_5, AnimationTemplet._BezierInterpolation_6, AnimationTemplet._BezierInterpolation_7];
	return AnimationTemplet;
})(Resource)


/**
 *动画模板类
 */
//class laya.ani.bone.Templet extends laya.ani.AnimationTemplet
var Templet = (function(_super) {
	function Templet() {
		this._mainTexture = null;
		this._textureJson = null;
		this._graphicsCache = [];
		this.srcBoneMatrixArr = [];
		this.ikArr = [];
		this.tfArr = [];
		this.pathArr = [];
		this.boneSlotDic = {};
		this.bindBoneBoneSlotDic = {};
		this.boneSlotArray = [];
		this.skinDataArray = [];
		this.skinDic = {};
		this.subTextureDic = {};
		this.isParseFail = false;
		this.yReverseMatrix = null;
		this.drawOrderAniArr = [];
		this.eventAniArr = [];
		this.attachmentNames = null;
		this.deformAniArr = [];
		this._isDestroyed = false;
		this._rate = 30;
		this.isParserComplete = false;
		this.aniSectionDic = {};
		this._skBufferUrl = null;
		this._textureDic = {};
		this._loadList = null;
		this._path = null;
		this.tMatrixDataLen = 0;
		this.mRootBone = null;
		Templet.__super.call(this);
		this.skinSlotDisplayDataArr = [];
		this.mBoneArr = [];
	}

	__class(Templet, 'laya.ani.bone.Templet', _super);
	var __proto = Templet.prototype;
	__proto.loadAni = function(url) {
		this._skBufferUrl = url;
		Laya.loader.load(url, Handler.create(this, this.onComplete), null, "arraybuffer");
	}

	__proto.onComplete = function(content) {
		if (this._isDestroyed) {
			this.destroy();
			return;
		};
		var tSkBuffer = Loader.getRes(this._skBufferUrl);
		if (!tSkBuffer) {
			this.event("error", "load failed:" + this._skBufferUrl);
			return;
		}
		this._path = this._skBufferUrl.slice(0, this._skBufferUrl.lastIndexOf("/")) + "/";
		this.parseData(null, tSkBuffer);
	}

	/**
	 *解析骨骼动画数据
	 *@param texture 骨骼动画用到的纹理
	 *@param skeletonData 骨骼动画信息及纹理分块信息
	 *@param playbackRate 缓冲的帧率数据（会根据帧率去分帧）
	 */
	__proto.parseData = function(texture, skeletonData, playbackRate) {
		(playbackRate === void 0) && (playbackRate = 30);
		if (!this._path && this.url) this._path = this.url.slice(0, this.url.lastIndexOf("/")) + "/";
		this._mainTexture = texture;
		if (this._mainTexture) {
			if (Render.isWebGL && texture.bitmap) {
				texture.bitmap.enableMerageInAtlas = false;
			}
		}
		this._rate = playbackRate;
		this.parse(skeletonData);
	}

	/**
	 *创建动画
	 *0,使用模板缓冲的数据，模板缓冲的数据，不允许修改 （内存开销小，计算开销小，不支持换装）
	 *1,使用动画自己的缓冲区，每个动画都会有自己的缓冲区，相当耗费内存 （内存开销大，计算开销小，支持换装）
	 *2,使用动态方式，去实时去画 （内存开销小，计算开销大，支持换装,不建议使用）
	 *@param aniMode 0 动画模式，0:不支持换装,1,2支持换装
	 *@return
	 */
	__proto.buildArmature = function(aniMode) {
		(aniMode === void 0) && (aniMode = 0);
		return new Skeleton(this, aniMode);
	}

	/**
	 *@private
	 *解析动画
	 *@param data 解析的二进制数据
	 *@param playbackRate 帧率
	 */
	__proto.parse = function(data) {
		_super.prototype.parse.call(this, data);
		this._endLoaded();
		if (this._aniVersion != Templet.LAYA_ANIMATION_VISION) {
			console.log("[Error] 版本不一致，请使用IDE版本配套的重新导出" + this._aniVersion + "->" + Templet.LAYA_ANIMATION_VISION);
			this._loaded = false;
		}
		if (this.loaded) {
			if (this._mainTexture) {
				this._parsePublicExtData();
			} else {
				this._parseTexturePath();
			}
		} else {
			this.event("error", this);
			this.isParseFail = true;
		}
	}

	__proto._parseTexturePath = function() {
		if (this._isDestroyed) {
			this.destroy();
			return;
		};
		var i = 0;
		this._loadList = [];
		var tByte = new Byte(this.getPublicExtData());
		var tX = 0,
			tY = 0,
			tWidth = 0,
			tHeight = 0;
		var tFrameX = 0,
			tFrameY = 0,
			tFrameWidth = 0,
			tFrameHeight = 0;
		var tTempleData = 0;
		var tTextureLen = tByte.getInt32();
		var tTextureName = tByte.readUTFString();
		var tTextureNameArr = tTextureName.split("\n");
		var tTexture;
		var tSrcTexturePath;
		for (i = 0; i < tTextureLen; i++) {
			tSrcTexturePath = this._path + tTextureNameArr[i * 2];
			tTextureName = tTextureNameArr[i * 2 + 1];
			tX = tByte.getFloat32();
			tY = tByte.getFloat32();
			tWidth = tByte.getFloat32();
			tHeight = tByte.getFloat32();
			tTempleData = tByte.getFloat32();
			tFrameX = isNaN(tTempleData) ? 0 : tTempleData;
			tTempleData = tByte.getFloat32();
			tFrameY = isNaN(tTempleData) ? 0 : tTempleData;
			tTempleData = tByte.getFloat32();
			tFrameWidth = isNaN(tTempleData) ? tWidth : tTempleData;
			tTempleData = tByte.getFloat32();
			tFrameHeight = isNaN(tTempleData) ? tHeight : tTempleData;
			if (this._loadList.indexOf(tSrcTexturePath) == -1) {
				this._loadList.push(tSrcTexturePath);
			}
		}
		Laya.loader.load(this._loadList, Handler.create(this, this._textureComplete));
	}

	/**
	 *纹理加载完成
	 */
	__proto._textureComplete = function() {
		var tTexture;
		var tTextureName;
		for (var i = 0, n = this._loadList.length; i < n; i++) {
			tTextureName = this._loadList[i];
			tTexture = this._textureDic[tTextureName] = Loader.getRes(tTextureName);
			if (Render.isWebGL && tTexture && tTexture.bitmap) {
				tTexture.bitmap.enableMerageInAtlas = false;
			}
		}
		this._parsePublicExtData();
	}

	/**
	 *解析自定义数据
	 */
	__proto._parsePublicExtData = function() {
		var i = 0,
			j = 0,
			k = 0,
			l = 0,
			n = 0;
		for (i = 0, n = this.getAnimationCount(); i < n; i++) {
			this._graphicsCache.push([]);
		};
		var isSpine = false;
		isSpine = this._aniClassName != "Dragon";
		var tByte = new Byte(this.getPublicExtData());
		var tX = 0,
			tY = 0,
			tWidth = 0,
			tHeight = 0;
		var tFrameX = 0,
			tFrameY = 0,
			tFrameWidth = 0,
			tFrameHeight = 0;
		var tTempleData = 0;
		var tTextureLen = tByte.getInt32();
		var tTextureName = tByte.readUTFString();
		var tTextureNameArr = tTextureName.split("\n");
		var tTexture;
		var tSrcTexturePath;
		for (i = 0; i < tTextureLen; i++) {
			tTexture = this._mainTexture;
			tSrcTexturePath = this._path + tTextureNameArr[i * 2];
			tTextureName = tTextureNameArr[i * 2 + 1];
			if (this._mainTexture == null) {
				tTexture = this._textureDic[tSrcTexturePath];
			}
			if (!tTexture) {
				this.event("error", this);
				this.isParseFail = true;
				return;
			}
			tX = tByte.getFloat32();
			tY = tByte.getFloat32();
			tWidth = tByte.getFloat32();
			tHeight = tByte.getFloat32();
			tTempleData = tByte.getFloat32();
			tFrameX = isNaN(tTempleData) ? 0 : tTempleData;
			tTempleData = tByte.getFloat32();
			tFrameY = isNaN(tTempleData) ? 0 : tTempleData;
			tTempleData = tByte.getFloat32();
			tFrameWidth = isNaN(tTempleData) ? tWidth : tTempleData;
			tTempleData = tByte.getFloat32();
			tFrameHeight = isNaN(tTempleData) ? tHeight : tTempleData;
			this.subTextureDic[tTextureName] = Texture.create(tTexture, tX, tY, tWidth, tHeight, -tFrameX, -tFrameY, tFrameWidth, tFrameHeight);
		}
		this._mainTexture = tTexture;
		var tAniCount = tByte.getUint16();
		var tSectionArr;
		for (i = 0; i < tAniCount; i++) {
			tSectionArr = [];
			tSectionArr.push(tByte.getUint16());
			tSectionArr.push(tByte.getUint16());
			tSectionArr.push(tByte.getUint16());
			tSectionArr.push(tByte.getUint16());
			this.aniSectionDic[i] = tSectionArr;
		};
		var tBone;
		var tParentBone;
		var tName;
		var tParentName;
		var tBoneLen = tByte.getInt16();
		var tBoneDic = {};
		var tRootBone;
		for (i = 0; i < tBoneLen; i++) {
			tBone = new Bone();
			if (i == 0) {
				tRootBone = tBone;
			} else {
				tBone.root = tRootBone;
			}
			tBone.d = isSpine ? -1 : 1;
			tName = tByte.readUTFString();
			tParentName = tByte.readUTFString();
			tBone.length = tByte.getFloat32();
			if (tByte.getByte() == 1) {
				tBone.inheritRotation = false;
			}
			if (tByte.getByte() == 1) {
				tBone.inheritScale = false;
			}
			tBone.name = tName;
			if (tParentName) {
				tParentBone = tBoneDic[tParentName];
				if (tParentBone) {
					tParentBone.addChild(tBone);
				} else {
					this.mRootBone = tBone;
				}
			}
			tBoneDic[tName] = tBone;
			this.mBoneArr.push(tBone);
		}
		this.tMatrixDataLen = tByte.getUint16();
		var tLen = tByte.getUint16();
		var parentIndex = 0;
		var boneLength = Math.floor(tLen / this.tMatrixDataLen);
		var tResultTransform;
		var tMatrixArray = this.srcBoneMatrixArr;
		for (i = 0; i < boneLength; i++) {
			tResultTransform = new Transform();
			tResultTransform.scX = tByte.getFloat32();
			tResultTransform.skX = tByte.getFloat32();
			tResultTransform.skY = tByte.getFloat32();
			tResultTransform.scY = tByte.getFloat32();
			tResultTransform.x = tByte.getFloat32();
			tResultTransform.y = tByte.getFloat32();
			if (this.tMatrixDataLen === 8) {
				tResultTransform.skewX = tByte.getFloat32();
				tResultTransform.skewY = tByte.getFloat32();
			}
			tMatrixArray.push(tResultTransform);
			tBone = this.mBoneArr[i];
			tBone.transform = tResultTransform;
		};
		var tIkConstraintData;
		var tIkLen = tByte.getUint16();
		var tIkBoneLen = 0;
		for (i = 0; i < tIkLen; i++) {
			tIkConstraintData = new IkConstraintData();
			tIkBoneLen = tByte.getUint16();
			for (j = 0; j < tIkBoneLen; j++) {
				tIkConstraintData.boneNames.push(tByte.readUTFString());
				tIkConstraintData.boneIndexs.push(tByte.getInt16());
			}
			tIkConstraintData.name = tByte.readUTFString();
			tIkConstraintData.targetBoneName = tByte.readUTFString();
			tIkConstraintData.targetBoneIndex = tByte.getInt16();
			tIkConstraintData.bendDirection = tByte.getFloat32();
			tIkConstraintData.mix = tByte.getFloat32();
			tIkConstraintData.isSpine = isSpine;
			this.ikArr.push(tIkConstraintData);
		};
		var tTfConstraintData;
		var tTfLen = tByte.getUint16();
		var tTfBoneLen = 0;
		for (i = 0; i < tTfLen; i++) {
			tTfConstraintData = new TfConstraintData();
			tTfBoneLen = tByte.getUint16();
			for (j = 0; j < tTfBoneLen; j++) {
				tTfConstraintData.boneIndexs.push(tByte.getInt16());
			}
			tTfConstraintData.name = tByte.getUTFString();
			tTfConstraintData.targetIndex = tByte.getInt16();
			tTfConstraintData.rotateMix = tByte.getFloat32();
			tTfConstraintData.translateMix = tByte.getFloat32();
			tTfConstraintData.scaleMix = tByte.getFloat32();
			tTfConstraintData.shearMix = tByte.getFloat32();
			tTfConstraintData.offsetRotation = tByte.getFloat32();
			tTfConstraintData.offsetX = tByte.getFloat32();
			tTfConstraintData.offsetY = tByte.getFloat32();
			tTfConstraintData.offsetScaleX = tByte.getFloat32();
			tTfConstraintData.offsetScaleY = tByte.getFloat32();
			tTfConstraintData.offsetShearY = tByte.getFloat32();
			this.tfArr.push(tTfConstraintData);
		};
		var tPathConstraintData;
		var tPathLen = tByte.getUint16();
		var tPathBoneLen = 0;
		for (i = 0; i < tPathLen; i++) {
			tPathConstraintData = new PathConstraintData();
			tPathConstraintData.name = tByte.readUTFString();
			tPathBoneLen = tByte.getUint16();
			for (j = 0; j < tPathBoneLen; j++) {
				tPathConstraintData.bones.push(tByte.getInt16());
			}
			tPathConstraintData.target = tByte.readUTFString();
			tPathConstraintData.positionMode = tByte.readUTFString();
			tPathConstraintData.spacingMode = tByte.readUTFString();
			tPathConstraintData.rotateMode = tByte.readUTFString();
			tPathConstraintData.offsetRotation = tByte.getFloat32();
			tPathConstraintData.position = tByte.getFloat32();
			tPathConstraintData.spacing = tByte.getFloat32();
			tPathConstraintData.rotateMix = tByte.getFloat32();
			tPathConstraintData.translateMix = tByte.getFloat32();
			this.pathArr.push(tPathConstraintData);
		};
		var tDeformSlotLen = 0;
		var tDeformSlotDisplayLen = 0;
		var tDSlotIndex = 0;
		var tDAttachment;
		var tDeformTimeLen = 0;
		var tDTime = NaN;
		var tDeformVecticesLen = 0;
		var tDeformAniData;
		var tDeformSlotData;
		var tDeformSlotDisplayData;
		var tDeformVectices;
		var tDeformAniLen = tByte.getInt16();
		for (i = 0; i < tDeformAniLen; i++) {
			var tDeformSkinLen = tByte.getUint8();
			var tSkinDic = {};
			this.deformAniArr.push(tSkinDic);
			for (var f = 0; f < tDeformSkinLen; f++) {
				tDeformAniData = new DeformAniData();
				tDeformAniData.skinName = tByte.getUTFString();
				tSkinDic[tDeformAniData.skinName] = tDeformAniData;
				tDeformSlotLen = tByte.getInt16();
				for (j = 0; j < tDeformSlotLen; j++) {
					tDeformSlotData = new DeformSlotData();
					tDeformAniData.deformSlotDataList.push(tDeformSlotData);
					tDeformSlotDisplayLen = tByte.getInt16();
					for (k = 0; k < tDeformSlotDisplayLen; k++) {
						tDeformSlotDisplayData = new DeformSlotDisplayData();
						tDeformSlotData.deformSlotDisplayList.push(tDeformSlotDisplayData);
						tDeformSlotDisplayData.slotIndex = tDSlotIndex = tByte.getInt16();
						tDeformSlotDisplayData.attachment = tDAttachment = tByte.getUTFString();
						tDeformTimeLen = tByte.getInt16();
						for (l = 0; l < tDeformTimeLen; l++) {
							if (tByte.getByte() == 1) {
								tDeformSlotDisplayData.tweenKeyList.push(true);
							} else {
								tDeformSlotDisplayData.tweenKeyList.push(false);
							}
							tDTime = tByte.getFloat32();
							tDeformSlotDisplayData.timeList.push(tDTime);
							tDeformVectices = [];
							tDeformSlotDisplayData.vectices.push(tDeformVectices);
							tDeformVecticesLen = tByte.getInt16();
							for (n = 0; n < tDeformVecticesLen; n++) {
								tDeformVectices.push(tByte.getFloat32());
							}
						}
					}
				}
			}
		};
		var tDrawOrderArr;
		var tDrawOrderAniLen = tByte.getInt16();
		var tDrawOrderLen = 0;
		var tDrawOrderData;
		var tDoLen = 0;
		for (i = 0; i < tDrawOrderAniLen; i++) {
			tDrawOrderLen = tByte.getInt16();
			tDrawOrderArr = [];
			for (j = 0; j < tDrawOrderLen; j++) {
				tDrawOrderData = new DrawOrderData();
				tDrawOrderData.time = tByte.getFloat32();
				tDoLen = tByte.getInt16();
				for (k = 0; k < tDoLen; k++) {
					tDrawOrderData.drawOrder.push(tByte.getInt16());
				}
				tDrawOrderArr.push(tDrawOrderData);
			}
			this.drawOrderAniArr.push(tDrawOrderArr);
		};
		var tEventArr;
		var tEventAniLen = tByte.getInt16();
		var tEventLen = 0;
		var tEventData;
		for (i = 0; i < tEventAniLen; i++) {
			tEventLen = tByte.getInt16();
			tEventArr = [];
			for (j = 0; j < tEventLen; j++) {
				tEventData = new EventData();
				tEventData.name = tByte.getUTFString();
				tEventData.intValue = tByte.getInt32();
				tEventData.floatValue = tByte.getFloat32();
				tEventData.stringValue = tByte.getUTFString();
				tEventData.time = tByte.getFloat32();
				tEventArr.push(tEventData);
			}
			this.eventAniArr.push(tEventArr);
		};
		var tAttachmentLen = tByte.getInt16();
		if (tAttachmentLen > 0) {
			this.attachmentNames = [];
			for (i = 0; i < tAttachmentLen; i++) {
				this.attachmentNames.push(tByte.getUTFString());
			}
		};
		var tBoneSlotLen = tByte.getInt16();
		var tDBBoneSlot;
		var tDBBoneSlotArr;
		for (i = 0; i < tBoneSlotLen; i++) {
			tDBBoneSlot = new BoneSlot();
			tDBBoneSlot.name = tByte.readUTFString();
			tDBBoneSlot.parent = tByte.readUTFString();
			tDBBoneSlot.attachmentName = tByte.readUTFString();
			tDBBoneSlot.srcDisplayIndex = tDBBoneSlot.displayIndex = tByte.getInt16();
			tDBBoneSlot.templet = this;
			this.boneSlotDic[tDBBoneSlot.name] = tDBBoneSlot;
			tDBBoneSlotArr = this.bindBoneBoneSlotDic[tDBBoneSlot.parent];
			if (tDBBoneSlotArr == null) {
				this.bindBoneBoneSlotDic[tDBBoneSlot.parent] = tDBBoneSlotArr = [];
			}
			tDBBoneSlotArr.push(tDBBoneSlot);
			this.boneSlotArray.push(tDBBoneSlot);
		};
		var tNameString = tByte.readUTFString();
		var tNameArray = tNameString.split("\n");
		var tNameStartIndex = 0;
		var tSkinDataLen = tByte.getUint8();
		var tSkinData, tSlotData, tDisplayData;
		var tSlotDataLen = 0,
			tDisplayDataLen = 0;
		var tUvLen = 0,
			tWeightLen = 0,
			tTriangleLen = 0,
			tVerticeLen = 0,
			tLengthLen = 0;
		for (i = 0; i < tSkinDataLen; i++) {
			tSkinData = new SkinData();
			tSkinData.name = tNameArray[tNameStartIndex++];
			tSlotDataLen = tByte.getUint8();
			for (j = 0; j < tSlotDataLen; j++) {
				tSlotData = new SlotData();
				tSlotData.name = tNameArray[tNameStartIndex++];
				tDBBoneSlot = this.boneSlotDic[tSlotData.name];
				tDisplayDataLen = tByte.getUint8();
				for (k = 0; k < tDisplayDataLen; k++) {
					tDisplayData = new SkinSlotDisplayData();
					this.skinSlotDisplayDataArr.push(tDisplayData);
					tDisplayData.name = tNameArray[tNameStartIndex++];
					tDisplayData.attachmentName = tNameArray[tNameStartIndex++];
					tDisplayData.transform = new Transform();
					tDisplayData.transform.scX = tByte.getFloat32();
					tDisplayData.transform.skX = tByte.getFloat32();
					tDisplayData.transform.skY = tByte.getFloat32();
					tDisplayData.transform.scY = tByte.getFloat32();
					tDisplayData.transform.x = tByte.getFloat32();
					tDisplayData.transform.y = tByte.getFloat32();
					tSlotData.displayArr.push(tDisplayData);
					tDisplayData.width = tByte.getFloat32();
					tDisplayData.height = tByte.getFloat32();
					tDisplayData.type = tByte.getUint8();
					tDisplayData.verLen = tByte.getUint16();
					tBoneLen = tByte.getUint16();
					if (tBoneLen > 0) {
						tDisplayData.bones = [];
						for (l = 0; l < tBoneLen; l++) {
							var tBoneId = tByte.getUint16();
							tDisplayData.bones.push(tBoneId);
						}
					}
					tUvLen = tByte.getUint16();
					if (tUvLen > 0) {
						tDisplayData.uvs = [];
						for (l = 0; l < tUvLen; l++) {
							tDisplayData.uvs.push(tByte.getFloat32());
						}
					}
					tWeightLen = tByte.getUint16();
					if (tWeightLen > 0) {
						tDisplayData.weights = [];
						for (l = 0; l < tWeightLen; l++) {
							tDisplayData.weights.push(tByte.getFloat32());
						}
					}
					tTriangleLen = tByte.getUint16();
					if (tTriangleLen > 0) {
						tDisplayData.triangles = [];
						for (l = 0; l < tTriangleLen; l++) {
							tDisplayData.triangles.push(tByte.getUint16());
						}
					}
					tVerticeLen = tByte.getUint16();
					if (tVerticeLen > 0) {
						tDisplayData.vertices = [];
						for (l = 0; l < tVerticeLen; l++) {
							tDisplayData.vertices.push(tByte.getFloat32());
						}
					}
					tLengthLen = tByte.getUint16();
					if (tLengthLen > 0) {
						tDisplayData.lengths = [];
						for (l = 0; l < tLengthLen; l++) {
							tDisplayData.lengths.push(tByte.getFloat32());
						}
					}
				}
				tSkinData.slotArr.push(tSlotData);
			}
			this.skinDic[tSkinData.name] = tSkinData;
			this.skinDataArray.push(tSkinData);
		};
		var tReverse = tByte.getUint8();
		if (tReverse == 1) {
			this.yReverseMatrix = new Matrix(1, 0, 0, -1, 0, 0);
			if (tRootBone) {
				tRootBone.setTempMatrix(this.yReverseMatrix);
			}
		} else {
			if (tRootBone) {
				tRootBone.setTempMatrix(new Matrix());
			}
		}
		this.showSkinByIndex(this.boneSlotDic, 0);
		this.isParserComplete = true;
		this.event("complete", this);
	}

	/**
	 *得到指定的纹理
	 *@param name 纹理的名字
	 *@return
	 */
	__proto.getTexture = function(name) {
		var tTexture = this.subTextureDic[name];
		if (!tTexture) {
			tTexture = this.subTextureDic[name.substr(0, name.length - 1)];
		}
		if (tTexture == null) {
			return this._mainTexture;
		}
		return tTexture;
	}

	/**
	 *@private
	 *显示指定的皮肤
	 *@param boneSlotDic 插糟字典的引用
	 *@param skinIndex 皮肤的索引
	 *@param freshDisplayIndex 是否重置插槽纹理
	 */
	__proto.showSkinByIndex = function(boneSlotDic, skinIndex, freshDisplayIndex) {
		(freshDisplayIndex === void 0) && (freshDisplayIndex = true);
		if (skinIndex < 0 && skinIndex >= this.skinDataArray.length) return false;
		var i = 0,
			n = 0;
		var tBoneSlot;
		var tSlotData;
		var tSkinData = this.skinDataArray[skinIndex];
		if (tSkinData) {
			for (i = 0, n = tSkinData.slotArr.length; i < n; i++) {
				tSlotData = tSkinData.slotArr[i];
				if (tSlotData) {
					tBoneSlot = boneSlotDic[tSlotData.name];
					if (tBoneSlot) {
						tBoneSlot.showSlotData(tSlotData, freshDisplayIndex);
						if (freshDisplayIndex && tBoneSlot.attachmentName != "undefined" && tBoneSlot.attachmentName != "null") {
							tBoneSlot.showDisplayByName(tBoneSlot.attachmentName);
						} else {
							tBoneSlot.showDisplayByIndex(tBoneSlot.displayIndex);
						}
					}
				}
			}
			return true;
		}
		return false;
	}

	/**
	 *通过皮肤名字得到皮肤索引
	 *@param skinName 皮肤名称
	 *@return
	 */
	__proto.getSkinIndexByName = function(skinName) {
		var tSkinData;
		for (var i = 0, n = this.skinDataArray.length; i < n; i++) {
			tSkinData = this.skinDataArray[i];
			if (tSkinData.name == skinName) {
				return i;
			}
		}
		return -1;
	}

	/**
	 *@private
	 *得到缓冲数据
	 *@param aniIndex 动画索引
	 *@param frameIndex 帧索引
	 *@return
	 */
	__proto.getGrahicsDataWithCache = function(aniIndex, frameIndex) {
		return this._graphicsCache[aniIndex][frameIndex];
	}

	/**
	 *@private
	 *保存缓冲grahpics
	 *@param aniIndex 动画索引
	 *@param frameIndex 帧索引
	 *@param graphics 要保存的数据
	 */
	__proto.setGrahicsDataWithCache = function(aniIndex, frameIndex, graphics) {
		this._graphicsCache[aniIndex][frameIndex] = graphics;
	}

	/**
	 *释放纹理
	 */
	__proto.destroy = function() {
		this._isDestroyed = true;
		var tTexture;
		for (var $each_tTexture in this.subTextureDic) {
			tTexture = this.subTextureDic[$each_tTexture];
			if (tTexture)
				tTexture.destroy();
		}
		var $each_tTexture;
		for ($each_tTexture in this._textureDic) {
			tTexture = this._textureDic[$each_tTexture];
			if (tTexture)
				tTexture.destroy();
		};
		var tSkinSlotDisplayData;
		for (var i = 0, n = this.skinSlotDisplayDataArr.length; i < n; i++) {
			tSkinSlotDisplayData = this.skinSlotDisplayDataArr[i];
			tSkinSlotDisplayData.destory();
		}
		this.skinSlotDisplayDataArr.length = 0;
		if (this.url) {
			delete Templet.TEMPLET_DICTIONARY[this.url];
		}
		this.dispose();
	}

	/**
	 *通过索引得动画名称
	 *@param index
	 *@return
	 */
	__proto.getAniNameByIndex = function(index) {
		var tAni = this.getAnimation(index);
		if (tAni) return tAni.name;
		return null;
	}

	__getset(0, __proto, 'rate', function() {
		return this._rate;
	}, function(v) {
		this._rate = v;
	});

	Templet.LAYA_ANIMATION_VISION = "LAYAANIMATION:1.6.0";
	Templet.TEMPLET_DICTIONARY = null
	return Templet;
})(AnimationTemplet)


/**
 *<code>Texture</code> 是一个纹理处理类。
 */
//class laya.resource.Texture extends laya.events.EventDispatcher
var Texture = (function(_super) {
	function Texture(bitmap, uv) {
		//this.bitmap=null;
		//this.uv=null;
		this.offsetX = 0;
		this.offsetY = 0;
		this.sourceWidth = 0;
		this.sourceHeight = 0;
		//this._loaded=false;
		this._w = 0;
		this._h = 0;
		//this.$_GID=NaN;
		//this.url=null;
		this._uvID = 0;
		Texture.__super.call(this);
		if (bitmap) {
			bitmap.useNum++;
		}
		this.setTo(bitmap, uv);
	}

	__class(Texture, 'laya.resource.Texture', _super);
	var __proto = Texture.prototype;
	/**
	 *设置此对象的位图资源、UV数据信息。
	 *@param bitmap 位图资源
	 *@param uv UV数据信息
	 */
	__proto.setTo = function(bitmap, uv) {
		this.bitmap = bitmap;
		this.uv = uv || Texture.DEF_UV;
		if (bitmap) {
			this._w = bitmap.width;
			this._h = bitmap.height;
			this.sourceWidth = this.sourceWidth || this._w;
			this.sourceHeight = this.sourceHeight || this._h
			this._loaded = this._w > 0;
			var _this = this;
			if (this._loaded) {
				RunDriver.addToAtlas && RunDriver.addToAtlas(_this);
			} else {
				var bm = bitmap;
				if ((bm instanceof laya.resource.HTMLImage) && bm.image)
					bm.image.addEventListener('load', function(e) {
						RunDriver.addToAtlas && RunDriver.addToAtlas(_this);
					}, false);
			}
		}
	}

	/**@private 激活资源。*/
	__proto.active = function() {
		if (this.bitmap) this.bitmap.activeResource();
	}

	/**
	 *销毁纹理（分直接销毁，跟计数销毁两种）。
	 *@param forceDispose (default=false)true为强制销毁主纹理，false是通过计数销毁纹理。
	 */
	__proto.destroy = function(forceDispose) {
		(forceDispose === void 0) && (forceDispose = false);
		if (this.bitmap && (this.bitmap).useNum > 0) {
			var temp = this.bitmap;
			if (forceDispose) {
				this.bitmap = null;
				temp.dispose();
				(temp).useNum = 0;
			} else {
				(temp).useNum--;
				if ((temp).useNum == 0) {
					this.bitmap = null;
					temp.dispose();
				}
			}
			if (this.url && this === Laya.loader.getRes(this.url)) Laya.loader.clearRes(this.url, forceDispose);
			this._loaded = false;
		}
	}

	/**
	 *加载指定地址的图片。
	 *@param url 图片地址。
	 */
	__proto.load = function(url) {
		var _$this = this;
		this._loaded = false;
		url = URL.customFormat(url);
		var fileBitmap = (this.bitmap || (this.bitmap = HTMLImage.create(url)));
		if (fileBitmap) fileBitmap.useNum++;
		var _this = this;
		fileBitmap.onload = function() {
			fileBitmap.onload = null;
			_this._loaded = true;
			_$this.sourceWidth = _$this._w = fileBitmap.width;
			_$this.sourceHeight = _$this._h = fileBitmap.height;
			_this.event("loaded", this);
			(RunDriver.addToAtlas) && (RunDriver.addToAtlas(_this));
		};
	}

	/**@private */
	__proto.addTextureToAtlas = function(e) {
		RunDriver.addTextureToAtlas(this);
	}

	/**
	 *获取Texture上的某个区域的像素点
	 *@param x
	 *@param y
	 *@param width
	 *@param height
	 *@return 返回像素点集合
	 */
	__proto.getPixels = function(x, y, width, height) {
		if (Render.isWebGL) {
			return RunDriver.getTexturePixels(this, x, y, width, height);
		} else {
			Browser.canvas.size(width, height);
			Browser.canvas.clear();
			Browser.context.drawTexture(this, -x, -y, this.width, this.height, 0, 0);
			var info = Browser.context.getImageData(0, 0, width, height);
		}
		return info.data;
	}

	/**@private */
	__proto.onAsynLoaded = function(url, bitmap) {
		if (bitmap) bitmap.useNum++;
		this.setTo(bitmap, this.uv);
	}

	/**激活并获取资源。*/
	__getset(0, __proto, 'source', function() {
		if (!this.bitmap) return null;
		this.bitmap.activeResource();
		return this.bitmap.source;
	});

	/**
	 *表示是否加载成功，只能表示初次载入成功（通常包含下载和载入）,并不能完全表示资源是否可立即使用（资源管理机制释放影响等）。
	 */
	__getset(0, __proto, 'loaded', function() {
		return this._loaded;
	});

	/**
	 *表示资源是否已释放。
	 */
	__getset(0, __proto, 'released', function() {
		if (!this.bitmap) return true;
		return this.bitmap.released;
	});

	/**实际宽度。*/
	__getset(0, __proto, 'width', function() {
		if (this._w) return this._w;
		return (this.uv && this.uv !== Texture.DEF_UV) ? (this.uv[2] - this.uv[0]) * this.bitmap.width : this.bitmap.width;
	}, function(value) {
		this._w = value;
		this.sourceWidth || (this.sourceWidth = value);
	});

	/**
	 *通过外部设置是否启用纹理平铺(后面要改成在着色器里计算)
	 */
	/**
	 *获取当前纹理是否启用了纹理平铺
	 */
	__getset(0, __proto, 'repeat', function() {
		if (Render.isWebGL && this.bitmap) {
			return this.bitmap.repeat;
		}
		return true;
	}, function(value) {
		if (value) {
			if (Render.isWebGL && this.bitmap) {
				this.bitmap.repeat = value;
				if (value) {
					this.bitmap.enableMerageInAtlas = false;
				}
			}
		}
	});

	/**实际高度。*/
	__getset(0, __proto, 'height', function() {
		if (this._h) return this._h;
		return (this.uv && this.uv !== Texture.DEF_UV) ? (this.uv[5] - this.uv[1]) * this.bitmap.height : this.bitmap.height;
	}, function(value) {
		this._h = value;
		this.sourceHeight || (this.sourceHeight = value);
	});

	/**
	 *设置线性采样的状态（目前只能第一次绘制前设置false生效,来关闭线性采样）。
	 */
	/**
	 *获取当前纹理是否启用了线性采样。
	 */
	__getset(0, __proto, 'isLinearSampling', function() {
		return Render.isWebGL ? (this.bitmap.minFifter != 0x2600) : true;
	}, function(value) {
		if (!value && Render.isWebGL) {
			if (!value && (this.bitmap.minFifter == -1) && (this.bitmap.magFifter == -1)) {
				this.bitmap.minFifter = 0x2600;
				this.bitmap.magFifter = 0x2600;
				this.bitmap.enableMerageInAtlas = false;
			}
		}
	});

	Texture.moveUV = function(offsetX, offsetY, uv) {
		for (var i = 0; i < 8; i += 2) {
			uv[i] += offsetX;
			uv[i + 1] += offsetY;
		}
		return uv;
	}

	Texture.create = function(source, x, y, width, height, offsetX, offsetY, sourceWidth, sourceHeight) {
		(offsetX === void 0) && (offsetX = 0);
		(offsetY === void 0) && (offsetY = 0);
		(sourceWidth === void 0) && (sourceWidth = 0);
		(sourceHeight === void 0) && (sourceHeight = 0);
		var btex = (source instanceof laya.resource.Texture);
		var uv = btex ? source.uv : Texture.DEF_UV;
		var bitmap = btex ? source.bitmap : source;
		var tex = new Texture(bitmap, null);
		if (bitmap.width && (x + width) > bitmap.width) width = bitmap.width - x;
		if (bitmap.height && (y + height) > bitmap.height) height = bitmap.height - y;
		tex.width = width;
		tex.height = height;
		tex.offsetX = offsetX;
		tex.offsetY = offsetY;
		tex.sourceWidth = sourceWidth || width;
		tex.sourceHeight = sourceHeight || height;
		var dwidth = 1 / bitmap.width;
		var dheight = 1 / bitmap.height;
		x *= dwidth;
		y *= dheight;
		width *= dwidth;
		height *= dheight;
		var u1 = tex.uv[0],
			v1 = tex.uv[1],
			u2 = tex.uv[4],
			v2 = tex.uv[5];
		var inAltasUVWidth = (u2 - u1),
			inAltasUVHeight = (v2 - v1);
		var oriUV = Texture.moveUV(uv[0], uv[1], [x, y, x + width, y, x + width, y + height, x, y + height]);
		tex.uv = [u1 + oriUV[0] * inAltasUVWidth, v1 + oriUV[1] * inAltasUVHeight, u2 - (1 - oriUV[2]) * inAltasUVWidth, v1 + oriUV[3] * inAltasUVHeight, u2 - (1 - oriUV[4]) * inAltasUVWidth, v2 - (1 - oriUV[5]) * inAltasUVHeight, u1 + oriUV[6] * inAltasUVWidth, v2 - (1 - oriUV[7]) * inAltasUVHeight];
		return tex;
	}

	Texture.createFromTexture = function(texture, x, y, width, height) {
		var rect = Rectangle.TEMP.setTo(x - texture.offsetX, y - texture.offsetY, width, height);
		var result = rect.intersection(Texture._rect1.setTo(0, 0, texture.width, texture.height), Texture._rect2);
		if (result)
			var tex = Texture.create(texture, result.x, result.y, result.width, result.height, result.x - rect.x, result.y - rect.y, width, height);
		else return null;
		tex.bitmap.useNum--;
		return tex;
	}

	Texture.DEF_UV = [0, 0, 1.0, 0, 1.0, 1.0, 0, 1.0];
	Texture.INV_UV = [0, 1, 1.0, 1, 1.0, 0.0, 0, 0.0];
	Texture._rect1 = new Rectangle();
	Texture._rect2 = new Rectangle();
	return Texture;
})(EventDispatcher)


//class laya.net.LoaderManager extends laya.events.EventDispatcher
var LoaderManager = (function(_super) {
	var ResInfo;

	function LoaderManager() {
		this.retryNum = 1;
		this.retryDelay = 0;
		this.maxLoader = 5;
		this._loaders = [];
		this._loaderCount = 0;
		this._resInfos = [];
		this._infoPool = [];
		this._maxPriority = 5;
		this._failRes = {};
		LoaderManager.__super.call(this);
		for (var i = 0; i < this._maxPriority; i++) this._resInfos[i] = [];
	}

	__class(LoaderManager, 'laya.net.LoaderManager', _super);
	var __proto = LoaderManager.prototype;
	/**
	 *<p>根据clas类型创建一个未初始化资源的对象，随后进行异步加载，资源加载完成后，初始化对象的资源，并通过此对象派发 Event.LOADED 事件，事件回调参数值为此对象本身。套嵌资源的子资源会保留资源路径"?"后的部分。</p>
	 *<p>如果url为数组，返回true；否则返回指定的资源类对象，可以通过侦听此对象的 Event.LOADED 事件来判断资源是否已经加载完毕。</p>
	 *<p><b>注意：</b>cache参数只能对文件后缀为atlas的资源进行缓存控制，其他资源会忽略缓存，强制重新加载。</p>
	 *@param url 资源地址或者数组。如果url和clas同时指定了资源类型，优先使用url指定的资源类型。参数形如：[{url:xx,clas:xx,priority:xx,params:xx},{url:xx,clas:xx,priority:xx,params:xx}]。
	 *@param progress 资源加载进度回调，回调参数值为当前资源加载的进度信息(0-1)。
	 *@param clas 资源类名。如果url和clas同时指定了资源类型，优先使用url指定的资源类型。参数形如：Texture。
	 *@param type 资源类型。参数形如：Loader.IMAGE。
	 *@param priority (default=1)加载的优先级，优先级高的优先加载。有0-4共5个优先级，0最高，4最低。
	 *@param cache 是否缓存加载的资源。
	 *@return 如果url为数组，返回true；否则返回指定的资源类对象。
	 */
	__proto.create = function(url, complete, progress, clas, params, priority, cache) {
		(priority === void 0) && (priority = 1);
		(cache === void 0) && (cache = true);
		if ((url instanceof Array)) {
			var items = url;
			var itemCount = items.length;
			var loadedCount = 0;
			if (progress) {
				var progress2 = Handler.create(progress.caller, progress.method, progress.args, false);
			}
			for (var i = 0; i < itemCount; i++) {
				var item = items[i];
				if ((typeof item == 'string')) item = items[i] = {
					url: item
				};
				item.progress = 0;
				var progressHandler = progress ? Handler.create(null, onProgress, [item], false) : null;
				var completeHandler = (progress || complete) ? Handler.create(null, onComplete, [item]) : null;
				this._create(item.url, completeHandler, progressHandler, item.clas || clas, item.params || params, item.priority || priority, cache);
			}

			function onComplete(item, content) {
				loadedCount++;
				item.progress = 1;
				if (loadedCount === itemCount && complete) {
					complete.run();
				}
			}

			function onProgress(item, value) {
				item.progress = value;
				var num = 0;
				for (var j = 0; j < itemCount; j++) {
					var item1 = items[j];
					num += item1.progress;
				};
				var v = num / itemCount;
				progress2.runWith(v);
			}
			return true;
		} else return this._create(url, complete, progress, clas, params, priority, cache);
	}

	__proto._create = function(url, complete, progress, clas, params, priority, cache) {
		(priority === void 0) && (priority = 1);
		(cache === void 0) && (cache = true);
		url = URL.formatURL(url)
		var item = this.getRes(url);
		if (!item) {
			var extension = Utils$1.getFileExtension(url);
			var creatItem = LoaderManager.createMap[extension];
			if (!clas) clas = creatItem[0];
			var type = creatItem[1];
			if (extension == "atlas") {
				this.load(url, complete, progress, type, priority, cache);
			} else {
				if (clas === Texture) type = "htmlimage";
				item = clas ? new clas() : null;
				if (item.hasOwnProperty("_loaded"))
					item._loaded = false;
				this.load(url, Handler.create(null, onLoaded), progress, type, priority, false, null, true);

				function onLoaded(data) {
					item && item.onAsynLoaded.call(item, url, data, params);
					if (complete) complete.run();
					Laya.loader.event(url);
				}
				if (cache) {
					this.cacheRes(url, item);
					item.url = url;
				}
			}
		} else {
			if (!item.hasOwnProperty("loaded") || item.loaded) {
				progress && progress.runWith(1);
				complete && complete.run();
			} else if (complete) {
				Laya.loader._createListener(url, complete.caller, complete.method, complete.args, true, false);
			}
		}
		return item;
	}

	/**
	 *<p>加载资源。资源加载错误时，本对象会派发 Event.ERROR 事件，事件回调参数值为加载出错的资源地址。</p>
	 *<p>因为返回值为 LoaderManager 对象本身，所以可以使用如下语法：Laya.loader.load(...).load(...);</p>
	 *@param url 要加载的单个资源地址或资源信息数组。比如：简单数组：["a.png","b.png"]；复杂数组[{url:"a.png",type:Loader.IMAGE,size:100,priority:1},{url:"b.json",type:Loader.JSON,size:50,priority:1}]。
	 *@param complete 加载结束回调。根据url类型不同分为2种情况：1. url为String类型，也就是单个资源地址，如果加载成功，则回调参数值为加载完成的资源，否则为null；2. url为数组类型，指定了一组要加载的资源，如果全部加载成功，则回调参数值为true，否则为false。
	 *@param progress 加载进度回调。回调参数值为当前资源的加载进度信息(0-1)。
	 *@param type 资源类型。比如：Loader.IMAGE。
	 *@param priority (default=1)加载的优先级，优先级高的优先加载。有0-4共5个优先级，0最高，4最低。
	 *@param cache 是否缓存加载结果。
	 *@param group 分组，方便对资源进行管理。
	 *@param ignoreCache 是否忽略缓存，强制重新加载。
	 *@return 此 LoaderManager 对象本身。
	 */
	__proto.load = function(url, complete, progress, type, priority, cache, group, ignoreCache) {
		(priority === void 0) && (priority = 1);
		(cache === void 0) && (cache = true);
		(ignoreCache === void 0) && (ignoreCache = false);
		if ((url instanceof Array)) return this._loadAssets(url, complete, progress, type, priority, cache, group);
		var content = Loader.getRes(url);
		if (content != null) {
			progress && progress.runWith(1);
			complete && complete.runWith(content);
			this._loaderCount || this.event("complete");
		} else {
			var info = LoaderManager._resMap[url];
			if (!info) {
				info = this._infoPool.length ? this._infoPool.pop() : new ResInfo();
				info.url = url;
				info.type = type;
				info.cache = cache;
				info.group = group;
				info.ignoreCache = ignoreCache;
				complete && info.on("complete", complete.caller, complete.method, complete.args);
				progress && info.on("progress", progress.caller, progress.method, progress.args);
				LoaderManager._resMap[url] = info;
				priority = priority < this._maxPriority ? priority : this._maxPriority - 1;
				this._resInfos[priority].push(info);
				this._next();
			} else {
				complete && info._createListener("complete", complete.caller, complete.method, complete.args, false, false);
				progress && info._createListener("progress", progress.caller, progress.method, progress.args, false, false);
			}
		}
		return this;
	}

	__proto._next = function() {
		if (this._loaderCount >= this.maxLoader) return;
		for (var i = 0; i < this._maxPriority; i++) {
			var infos = this._resInfos[i];
			if (infos.length > 0) {
				var info = infos.shift();
				if (info) return this._doLoad(info);
			}
		}
		this._loaderCount || this.event("complete");
	}

	__proto._doLoad = function(resInfo) {
		this._loaderCount++;
		var loader = this._loaders.length ? this._loaders.pop() : new Loader();
		loader.on("complete", null, onLoaded);
		loader.on("progress", null, function(num) {
			resInfo.event("progress", num);
		});
		loader.on("error", null, function(msg) {
			onLoaded(null);
		});
		var _this = this;

		function onLoaded(data) {
			loader.offAll();
			loader._data = null;
			_this._loaders.push(loader);
			_this._endLoad(resInfo, (data instanceof Array) ? [data] : data);
			_this._loaderCount--;
			_this._next();
		}
		loader.load(resInfo.url, resInfo.type, resInfo.cache, resInfo.group, resInfo.ignoreCache);
	}

	__proto._endLoad = function(resInfo, content) {
		var url = resInfo.url;
		if (content == null) {
			var errorCount = this._failRes[url] || 0;
			if (errorCount < this.retryNum) {
				console.warn("[warn]Retry to load:", url);
				this._failRes[url] = errorCount + 1;
				Laya.timer.once(this.retryDelay, this, this._addReTry, [resInfo], false);
				return;
			} else {
				console.warn("[error]Failed to load:", url);
				this.event("error", url);
			}
		}
		if (this._failRes[url]) this._failRes[url] = 0;
		delete LoaderManager._resMap[url];
		resInfo.event("complete", content);
		resInfo.offAll();
		this._infoPool.push(resInfo);
	}

	__proto._addReTry = function(resInfo) {
		this._resInfos[this._maxPriority - 1].push(resInfo);
		this._next();
	}

	/**
	 *清理指定资源地址缓存。
	 *@param url 资源地址。
	 *@param forceDispose 是否强制销毁，有些资源是采用引用计数方式销毁，如果forceDispose=true，则忽略引用计数，直接销毁，比如Texture，默认为false
	 */
	__proto.clearRes = function(url, forceDispose) {
		(forceDispose === void 0) && (forceDispose = false);
		Loader.clearRes(url, forceDispose);
	}

	/**
	 *获取指定资源地址的资源。
	 *@param url 资源地址。
	 *@return 返回资源。
	 */
	__proto.getRes = function(url) {
		return Loader.getRes(url);
	}

	/**
	 *缓存资源。
	 *@param url 资源地址。
	 *@param data 要缓存的内容。
	 */
	__proto.cacheRes = function(url, data) {
		Loader.cacheRes(url, data);
	}

	/**
	 *设置资源分组。
	 *@param url 资源地址。
	 *@param group 分组名
	 */
	__proto.setGroup = function(url, group) {
		Loader.setGroup(url, group);
	}

	/**
	 *根据分组清理资源。
	 *@param group 分组名
	 */
	__proto.clearResByGroup = function(group) {
		Loader.clearResByGroup(group);
	}

	/**清理当前未完成的加载，所有未加载的内容全部停止加载。*/
	__proto.clearUnLoaded = function() {
		for (var i = 0; i < this._maxPriority; i++) {
			var infos = this._resInfos[i];
			for (var j = infos.length - 1; j > -1; j--) {
				var info = infos[j];
				if (info) {
					info.offAll();
					this._infoPool.push(info);
				}
			}
			infos.length = 0;
		}
		this._loaderCount = 0;
		LoaderManager._resMap = {};
	}

	/**
	 *根据地址集合清理掉未加载的内容
	 *@param urls 资源地址集合
	 */
	__proto.cancelLoadByUrls = function(urls) {
		if (!urls) return;
		for (var i = 0, n = urls.length; i < n; i++) {
			this.cancelLoadByUrl(urls[i]);
		}
	}

	/**
	 *根据地址清理掉未加载的内容
	 *@param url 资源地址
	 */
	__proto.cancelLoadByUrl = function(url) {
		for (var i = 0; i < this._maxPriority; i++) {
			var infos = this._resInfos[i];
			for (var j = infos.length - 1; j > -1; j--) {
				var info = infos[j];
				if (info && info.url === url) {
					infos[j] = null;
					info.offAll();
					this._infoPool.push(info);
				}
			}
		}
		if (LoaderManager._resMap[url]) delete LoaderManager._resMap[url];
	}

	/**
	 *@private
	 *加载数组里面的资源。
	 *@param arr 简单：["a.png","b.png"]，复杂[{url:"a.png",type:Loader.IMAGE,size:100,priority:1},{url:"b.json",type:Loader.JSON,size:50,priority:1}]*/
	__proto._loadAssets = function(arr, complete, progress, type, priority, cache, group) {
		(priority === void 0) && (priority = 1);
		(cache === void 0) && (cache = true);
		var itemCount = arr.length;
		var loadedCount = 0;
		var totalSize = 0;
		var items = [];
		var success = true;
		for (var i = 0; i < itemCount; i++) {
			var item = arr[i];
			if ((typeof item == 'string')) item = {
				url: item,
				type: type,
				size: 1,
				priority: priority
			};
			if (!item.size) item.size = 1;
			item.progress = 0;
			totalSize += item.size;
			items.push(item);
			var progressHandler = progress ? Handler.create(null, loadProgress, [item], false) : null;
			var completeHandler = (complete || progress) ? Handler.create(null, loadComplete, [item]) : null;
			this.load(item.url, completeHandler, progressHandler, item.type, item.priority || 1, cache, item.group || group);
		}

		function loadComplete(item, content) {
			loadedCount++;
			item.progress = 1;
			if (!content) success = false;
			if (loadedCount === itemCount && complete) {
				complete.runWith(success);
			}
		}

		function loadProgress(item, value) {
			if (progress != null) {
				item.progress = value;
				var num = 0;
				for (var j = 0; j < items.length; j++) {
					var item1 = items[j];
					num += item1.size * item1.progress;
				};
				var v = num / totalSize;
				progress.runWith(v);
			}
		}
		return this;
	}

	LoaderManager.cacheRes = function(url, data) {
		Loader.cacheRes(url, data);
	}

	LoaderManager._resMap = {};
	__static(LoaderManager, ['createMap', function() {
		return this.createMap = {
			atlas: [null, "atlas"]
		};
	}]);
	LoaderManager.__init$ = function() {
		//class ResInfo extends laya.events.EventDispatcher
		ResInfo = (function(_super) {
			function ResInfo() {
				this.url = null;
				this.type = null;
				this.cache = false;
				this.group = null;
				this.ignoreCache = false;
				ResInfo.__super.call(this);
			}
			__class(ResInfo, '', _super);
			return ResInfo;
		})(EventDispatcher)
	}

	return LoaderManager;
})(EventDispatcher);



(function() {
	Laya.__init([EventDispatcher, LoaderManager]);
})();