"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.settings = void 0;

var _react = _interopRequireDefault(require("react"));

var _useGlobalHook = _interopRequireDefault(require("use-global-hook"));

var _lodash = require("lodash");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var settings = {
  root_url: '',
  disabled: false,
  getInitialState: function getInitialState() {
    return {};
  }
};
exports.settings = settings;

var noop = function noop(a) {
  return a;
};

var _default = function _default(url_template) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var stale_at = new Date().valueOf();
  var last_url;
  var fetch_times = {};
  var _options$prepData = options.prepData,
      prepData = _options$prepData === void 0 ? noop : _options$prepData,
      _options$fetch = options.fetch,
      fetch = _options$fetch === void 0 ? window.fetch : _options$fetch,
      _options$propName = options.propName,
      propName = _options$propName === void 0 ? 'api' : _options$propName,
      _options$use_last = options.use_last,
      use_last = _options$use_last === void 0 ? false : _options$use_last,
      _options$processReque = options.processRequest,
      processRequest = _options$processReque === void 0 ? function (r) {
    return r.json();
  } : _options$processReque;

  var makeUrl = function makeUrl(props) {
    try {
      return settings.root_url + (0, _lodash.template)(url_template)(props);
    } catch (e) {
      // errors from _.template can be tricky without access to props
      console.error("An error occurred trying to make a url \"".concat(url_template, "\" with the following props"), props);
      throw e;
    }
  };

  var is_loading = {};
  var __meta = {
    fetch_count: 0,
    logs: []
  };

  var refetch = function refetch(store) {
    var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var url = makeUrl(props);
    is_loading[url] = true;
    fetch(url).then(processRequest).then(function (data) {
      fetch_times[url] = new Date().valueOf();
      data = prepData(data, props) || data;
      is_loading[url] = false;
      __meta.fetch_count += 1;

      __meta.logs.push(url);

      store.setState(_defineProperty({}, url, data));
    });
  };

  var getData = function getData(store) {
    var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (settings.disabled) {
      return;
    }

    var url = makeUrl(props);

    if (RestHook.fakeState) {
      return RestHook.fakeState[url];
    }

    var data = store.state[url];
    var needs_fetch = !data || fetch_times[url] < stale_at;

    if (needs_fetch && !is_loading[url]) {
      refetch(store, props); // sets is_loading[url]
    } // sometimes you want a component to continue rendering last data while fetching new data, eg pagination


    if (!data && use_last) {
      data = store.state[last_url];
    }

    last_url = url;
    return _objectSpread({
      loading: is_loading[url]
    }, data);
  };

  var clearData = function clearData(store) {
    var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var url = makeUrl(props);
    delete store.state[url];
  };

  var actions = {
    refetch: refetch,
    getData: getData,
    clearData: clearData
  };
  var makeHook = (0, _useGlobalHook["default"])(_react["default"], settings.getInitialState(), actions);
  var og_prop_name = propName;

  var use = function use(props) {
    var _makeHook = makeHook(),
        _makeHook2 = _slicedToArray(_makeHook, 2),
        _ = _makeHook2[0],
        stateActions = _makeHook2[1];

    var data = stateActions.getData(props);
    return _objectSpread(_objectSpread({
      makeUrl: makeUrl
    }, data), {}, {
      refetch: stateActions.refetch,
      clearData: stateActions.clearData
    });
  };

  var RestHook = function RestHook(Component) {
    var extraOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var _extraOptions$propNam = extraOptions.propName,
        propName = _extraOptions$propNam === void 0 ? og_prop_name : _extraOptions$propNam,
        extraProps = _objectWithoutProperties(extraOptions, ["propName"]);

    return function APIProvider(props) {
      var connectedProps = _objectSpread(_objectSpread(_objectSpread({}, props), extraProps), {}, _defineProperty({}, propName, use(props)));

      return /*#__PURE__*/_react["default"].createElement(Component, connectedProps);
    };
  };

  RestHook.markStale = function () {
    return stale_at = new Date();
  };

  RestHook.use = use;
  return RestHook;
};

exports["default"] = _default;
