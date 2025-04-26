function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
// https://steamid.io/lookup
var STEAM_USER_ID = "";
// https://steamcommunity.com/dev/apikey
var STEAM_API_KEY = "";
// Proxy URL for CORS issues
var proxy = "https://corsproxy.io/?";

// DOM
var container = document.getElementById("game-container");
var loadingScreen = document.getElementById("loading-screen");
var loginScreen = document.getElementById("login-screen");
var errorScreen = document.getElementById("error-screen");
var sizeSelector = document.getElementById("size-options");
var sortSelector = document.getElementById("sort-options");

// UI Helpers
var showLoading = function showLoading() {
  return loadingScreen.style.visibility = "visible";
};
var hideLoading = function hideLoading() {
  return loadingScreen.style.visibility = "hidden";
};
var showError = function showError(msg) {
  errorScreen.innerHTML = "<img src=\"./icon.png\"><p>".concat(msg, "</p><a href=\"javascript:location.reload()\">Reload</a>");
  errorScreen.style.visibility = "visible";
  hideLoading();
};

// API Helpers
var fetchJson = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee(url) {
    var res;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return fetch(url);
        case 2:
          res = _context.sent;
          if (!res.ok) {
            _context.next = 9;
            break;
          }
          _context.next = 6;
          return res.json();
        case 6:
          _context.t0 = _context.sent;
          _context.next = 10;
          break;
        case 9:
          _context.t0 = null;
        case 10:
          return _context.abrupt("return", _context.t0);
        case 11:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return function fetchJson(_x) {
    return _ref.apply(this, arguments);
  };
}();
var getOwnedGames = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
    var _data$response;
    var url, data;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          url = "".concat(proxy, "https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=").concat(STEAM_API_KEY, "&steamid=").concat(STEAM_USER_ID, "&include_appinfo=true&include_played_free_games=true");
          _context2.next = 3;
          return fetchJson(url);
        case 3:
          data = _context2.sent;
          return _context2.abrupt("return", (data === null || data === void 0 || (_data$response = data.response) === null || _data$response === void 0 ? void 0 : _data$response.games) || []);
        case 5:
        case "end":
          return _context2.stop();
      }
    }, _callee2);
  }));
  return function getOwnedGames() {
    return _ref2.apply(this, arguments);
  };
}();
var getAppDetails = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3(appId) {
    var _data$appId;
    var url, data;
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          url = "".concat(proxy, "https://store.steampowered.com/api/appdetails?appids=").concat(appId);
          _context3.next = 3;
          return fetchJson(url);
        case 3:
          data = _context3.sent;
          return _context3.abrupt("return", (data === null || data === void 0 || (_data$appId = data[appId]) === null || _data$appId === void 0 ? void 0 : _data$appId.data) || {});
        case 5:
        case "end":
          return _context3.stop();
      }
    }, _callee3);
  }));
  return function getAppDetails(_x2) {
    return _ref3.apply(this, arguments);
  };
}();
var createAttachedPopout = function createAttachedPopout(parent, child) {
  var targetRect = parent.getBoundingClientRect();
  var childRect = child.getBoundingClientRect();
  var _window = window,
    scrollX = _window.scrollX,
    scrollY = _window.scrollY;
  var left = targetRect.right + scrollX + 15;
  var top = targetRect.top + scrollY;
  if (left + childRect.width > document.body.scrollWidth + scrollX) {
    left = targetRect.left - childRect.width + scrollX - 15;
  }
  if (top + childRect.height > document.body.scrollHeight + scrollY) {
    top = targetRect.bottom - childRect.height + scrollY;
  }
  left = Math.max(scrollX, Math.min(left, document.body.scrollWidth - childRect.width + scrollX));
  top = Math.max(scrollY, Math.min(top, document.body.scrollHeight - childRect.height + scrollY));
  child.style.left = "".concat(left, "px");
  child.style.top = "".concat(top, "px");
  return child;
};
var createGamePopout = function createGamePopout(parent, details, index) {
  var appid = details.appid,
    playtime_forever = details.playtime_forever,
    rtime_last_played = details.rtime_last_played,
    name = details.name,
    playtime_2weeks = details.playtime_2weeks;
  var currentPopout, popoutTimeout, hideTimeout;

  // Remove any existing popouts
  document.querySelectorAll(".popout").forEach(function (_popout) {
    return _popout.remove();
  });
  var handleMouseEnter = function handleMouseEnter() {
    clearTimeout(popoutTimeout);
    clearTimeout(hideTimeout);
    popoutTimeout = setTimeout(/*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee4() {
      var lastPlayed, recentMinutes, totalHours, totalMinutes, lastPlayedText, _yield$getAppDetails, screenshots, header_image;
      return _regeneratorRuntime().wrap(function _callee4$(_context4) {
        while (1) switch (_context4.prev = _context4.next) {
          case 0:
            if (parent.matches(":hover")) {
              _context4.next = 2;
              break;
            }
            return _context4.abrupt("return");
          case 2:
            lastPlayed = parseInt(rtime_last_played);
            recentMinutes = playtime_2weeks || 0, totalHours = (playtime_forever / 60).toFixed(1), totalMinutes = parseInt(playtime_forever), lastPlayedText = lastPlayed ? new Date(lastPlayed * 1000).toLocaleDateString() : "Never";
            _context4.next = 6;
            return getAppDetails(appid);
          case 6:
            _yield$getAppDetails = _context4.sent;
            screenshots = _yield$getAppDetails.screenshots;
            header_image = _yield$getAppDetails.header_image;
            currentPopout = document.createElement("div");
            currentPopout.className = "popout";
            currentPopout.innerHTML = "\n<div class=\"popout-name\">".concat(name, "</div>\n<div class=\"popout-cover-cover\">\n    <div class=\"popout-cover-crossfade\">\n        <div class=\"popout-cover\" style=\"background-image: url(").concat(header_image, ");\"></div>\n    </div>\n</div>\n<div class=\"popout-seperator\"></div>\n<div class=\"popout-stats-wrapper\">\n    <div class=\"popout-stats\">\n        <div class=\"popout-time-played\">Time played</div>\n        <div>Last two weeks: ").concat(recentMinutes, " min</div>\n        <div>Total: ").concat(totalHours, " hrs | ").concat(totalMinutes, " min</div>\n        <div>Most played ranking: #").concat(index + 1, "</div>\n        <div>Last played: ").concat(lastPlayedText, "</div>\n    </div>\n</div>");
            document.body.appendChild(currentPopout);
            createAttachedPopout(parent, currentPopout);
            currentPopout.classList.add("show");
            startCarousel(screenshots);
          case 16:
          case "end":
            return _context4.stop();
        }
      }, _callee4);
    })), 200);
  };
  var handleMouseLeave = function handleMouseLeave() {
    clearTimeout(popoutTimeout);
    hideTimeout = setTimeout(function () {
      if (currentPopout) {
        currentPopout.remove();
        currentPopout = null;
      }
    }, 200);
  };
  var startCarousel = function startCarousel(screenshots) {
    var _screenshots$;
    if (!screenshots || screenshots.length === 0) return;
    var crossfade = currentPopout.querySelector(".popout-cover");
    crossfade.style.backgroundImage = "url(".concat(((_screenshots$ = screenshots[0]) === null || _screenshots$ === void 0 ? void 0 : _screenshots$.path_thumbnail) || "", ")");
    var currentIndex = 0;
    setInterval(function () {
      var _screenshots$currentI;
      currentIndex = (currentIndex + 1) % screenshots.length;
      crossfade.style.backgroundImage = "url(".concat(((_screenshots$currentI = screenshots[currentIndex]) === null || _screenshots$currentI === void 0 ? void 0 : _screenshots$currentI.path_thumbnail) || "", ")");
    }, 1750);
  };
  var removePopout = function removePopout() {
    if (currentPopout) {
      currentPopout.remove();
      currentPopout = null;
    }
  };
  parent.addEventListener("mouseenter", handleMouseEnter);
  parent.addEventListener("mouseleave", handleMouseLeave);
  parent.addEventListener("mouseout", handleMouseLeave);
  document.addEventListener("mousemove", function (e) {
    if (currentPopout && !parent.contains(e.target) && !currentPopout.contains(e.target)) {
      removePopout();
    }
  });
};
var createGameModal = function createGameModal(parent, game) {
  parent.addEventListener("mousedown", function (ev) {
    if (ev.button == 1 || ev.buttons == 4) {
      var modal = document.createElement("div");
      modal.style.height = "50%";
      modal.style.width = "50%";
      modal.style.transform = "translate(50%)";
      modal.style.position = "absolute";
      modal.style.margin = "auto";
      modal.style.backgroundColor = "#fff";
      modal.style.borderRadius = "8px";
      modal.innerText = "Hello I am under de watyer please halp";
      document.body.append(modal);
    }
  });
};
var createGameCard = function createGameCard(game, index, topAppIds) {
  var appid = game.appid,
    name = game.name;
  var gameTile = document.createElement("div");
  gameTile.className = "game-tile";
  gameTile.onclick = function () {
    return window.open("steam://rungameid/".concat(appid), "_blank");
  };
  var tileInner = document.createElement("div");
  tileInner.className = "game-wrapper";
  var imageWrapper = document.createElement("div");
  imageWrapper.className = "panel-image-wrapper";
  var tileCover = new Image();
  tileCover.className = "game-art";
  tileCover.alt = name;

  // Bad fallback img code
  var fallback3 = function fallback3() {
    var altTextElm = document.createElement("div");
    altTextElm.className = "alt-text-elm";
    altTextElm.innerText = name;
    tileCover.src = "img/defaultappimage.png";
  };
  var fallback2 = function fallback2() {
    tileCover.onerror = fallback3;
    tileCover.src = "https://shared.steamstatic.com/store_item_assets/steam/apps/".concat(appid, "/portrait.png");
  };
  var fallback1 = function fallback1() {
    tileCover.onerror = fallback2;
    tileCover.src = "https://shared.steamstatic.com/store_item_assets/steam/apps/".concat(appid, "/library_600x900.jpg");
  };
  tileCover.onerror = fallback1;
  tileCover.src = "https://steamcdn-a.akamaihd.net/steam/apps/".concat(appid, "/library_600x900_2x.jpg");
  imageWrapper.appendChild(tileCover);
  if (topAppIds.includes(appid)) {
    var rank = topAppIds.indexOf(appid) + 1;
    var badge = document.createElement("div");
    badge.className = "badge rank-".concat(rank);
    badge.innerText = rank;
    tileInner.appendChild(badge);
  }
  tileInner.appendChild(imageWrapper);
  gameTile.appendChild(tileInner);
  container.appendChild(gameTile);
  createGamePopout(gameTile, game, index);
  createGameModal(gameTile, game);
};

// Display Games
var displayGames = /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee5(sortType) {
    var games, topAppIds;
    return _regeneratorRuntime().wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return getOwnedGames();
        case 2:
          games = _context5.sent;
          if (games.length) {
            _context5.next = 5;
            break;
          }
          return _context5.abrupt("return", showError("No games found, or your profile may be private."));
        case 5:
          games.sort(function (a, b) {
            return b.playtime_forever - a.playtime_forever;
          });
          switch (sortType) {
            case "name":
              games.sort(function (a, b) {
                return a.name.localeCompare(b.name);
              });
            case "recent":
              games.sort(function (a, b) {
                return b.rtime_last_played - a.rtime_last_played;
              });
            case "playtime":
            default:
              games.sort(function (a, b) {
                return b.playtime_forever - a.playtime_forever;
              });
          }
          topAppIds = games.slice(0, 3).map(function (g) {
            return g.appid;
          });
          container.innerHTML = "";
          games.forEach(function (game, index) {
            return createGameCard(game, index, topAppIds);
          });
        case 10:
        case "end":
          return _context5.stop();
      }
    }, _callee5);
  }));
  return function displayGames(_x3) {
    return _ref5.apply(this, arguments);
  };
}();

// Login Check
var validateSteamCredentials = /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee6(steamId, apiKey) {
    var _data$response2, url, data;
    return _regeneratorRuntime().wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          url = "".concat(proxy, "https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=").concat(apiKey, "&steamid=").concat(steamId);
          _context6.next = 4;
          return fetchJson(url);
        case 4:
          data = _context6.sent;
          return _context6.abrupt("return", !!(data !== null && data !== void 0 && (_data$response2 = data.response) !== null && _data$response2 !== void 0 && _data$response2.games));
        case 8:
          _context6.prev = 8;
          _context6.t0 = _context6["catch"](0);
          console.error("Error validating Steam credentials:", _context6.t0);
          return _context6.abrupt("return", false);
        case 12:
        case "end":
          return _context6.stop();
      }
    }, _callee6, null, [[0, 8]]);
  }));
  return function validateSteamCredentials(_x4, _x5) {
    return _ref6.apply(this, arguments);
  };
}();
var promptForSteamCredentials = /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee8() {
    var steamId, apiKey, rememberMe, showLogin, hideLogin, loginForm, idInput, keyInput, rememberMeCheckbox;
    return _regeneratorRuntime().wrap(function _callee8$(_context8) {
      while (1) switch (_context8.prev = _context8.next) {
        case 0:
          steamId = localStorage.getItem("steamId") || "";
          apiKey = localStorage.getItem("apiKey") || "";
          rememberMe = localStorage.getItem("rememberMe") === "true";
          showLogin = function showLogin() {
            return loginScreen.style.visibility = "visible";
          };
          hideLogin = function hideLogin() {
            return loginScreen.style.visibility = "hidden";
          };
          loginForm = document.getElementById("login-form");
          idInput = document.getElementById("accountId");
          keyInput = document.getElementById("apiKey");
          rememberMeCheckbox = document.getElementById("rememberMe");
          if (rememberMe) {
            idInput.value = steamId;
            keyInput.value = apiKey;
            rememberMeCheckbox.checked = true;
          }
          return _context8.abrupt("return", new Promise(function (resolve, reject) {
            loginForm.addEventListener("submit", /*#__PURE__*/function () {
              var _ref8 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee7(event) {
                var steamId, apiKey;
                return _regeneratorRuntime().wrap(function _callee7$(_context7) {
                  while (1) switch (_context7.prev = _context7.next) {
                    case 0:
                      event.preventDefault();
                      steamId = idInput.value.trim();
                      apiKey = keyInput.value.trim();
                      _context7.next = 5;
                      return validateSteamCredentials(steamId, apiKey);
                    case 5:
                      if (!_context7.sent) {
                        _context7.next = 11;
                        break;
                      }
                      hideLogin();
                      if (rememberMeCheckbox.checked) {
                        localStorage.setItem("steamId", steamId);
                        localStorage.setItem("apiKey", apiKey);
                        localStorage.setItem("rememberMe", "true");
                      } else {
                        localStorage.clear();
                      }
                      resolve({
                        steamId: steamId,
                        apiKey: apiKey
                      });
                      _context7.next = 13;
                      break;
                    case 11:
                      showError("Invalid credentials, or something went wrong! Please try again!");
                      return _context7.abrupt("return", reject());
                    case 13:
                    case "end":
                      return _context7.stop();
                  }
                }, _callee7);
              }));
              return function (_x6) {
                return _ref8.apply(this, arguments);
              };
            }());
            showLogin();
          }));
        case 11:
        case "end":
          return _context8.stop();
      }
    }, _callee8);
  }));
  return function promptForSteamCredentials() {
    return _ref7.apply(this, arguments);
  };
}();

// Init
(function () {
  var _Init = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee9() {
    var _yield$promptForSteam, steamId, apiKey;
    return _regeneratorRuntime().wrap(function _callee9$(_context9) {
      while (1) switch (_context9.prev = _context9.next) {
        case 0:
          showLoading();
          _context9.prev = 1;
          _context9.next = 4;
          return promptForSteamCredentials();
        case 4:
          _yield$promptForSteam = _context9.sent;
          steamId = _yield$promptForSteam.steamId;
          apiKey = _yield$promptForSteam.apiKey;
          console.log("Steam ID:", steamId);
          console.log("API Key:", apiKey);
          STEAM_USER_ID = steamId;
          STEAM_API_KEY = apiKey;
          _context9.next = 13;
          return displayGames();
        case 13:
          _context9.next = 19;
          break;
        case 15:
          _context9.prev = 15;
          _context9.t0 = _context9["catch"](1);
          console.error("Error during initialization:", _context9.t0);
          showError("An error occurred while fetching your games. <br/> Please check your Steam API Key and User ID.");
        case 19:
          _context9.prev = 19;
          hideLoading();
          return _context9.finish(19);
        case 22:
        case "end":
          return _context9.stop();
      }
    }, _callee9, null, [[1, 15, 19, 22]]);
  }));
  function Init() {
    return _Init.apply(this, arguments);
  }
  return Init;
})()();

// Event Listeners
sizeSelector.addEventListener("change", function (event) {
  var selectedSize = event.target.value;
  container.classList.remove("small", "smaller", "smallest", "umm", "wtf");
  if (selectedSize) container.classList.add(selectedSize);
});
sortSelector.addEventListener("change", function (event) {
  var selectedSort = event.target.value;
  if (selectedSort) displayGames(selectedSort);
});
