import { n as __commonJSMin } from "../__23tanstack-start-server-fn-resolver-BaOM1vmh.mjs";
//#region node_modules/@babel/runtime/helpers/extends.js
var require_extends = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function _extends() {
		return module.exports = _extends = Object.assign ? Object.assign.bind() : function(n) {
			for (var e = 1; e < arguments.length; e++) {
				var t = arguments[e];
				for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
			}
			return n;
		}, module.exports.__esModule = true, module.exports["default"] = module.exports, _extends.apply(null, arguments);
	}
	module.exports = _extends, module.exports.__esModule = true, module.exports["default"] = module.exports;
}));
//#endregion
//#region node_modules/@babel/runtime/helpers/esm/extends.js
function _extends() {
	return _extends = Object.assign ? Object.assign.bind() : function(n) {
		for (var e = 1; e < arguments.length; e++) {
			var t = arguments[e];
			for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
		}
		return n;
	}, _extends.apply(null, arguments);
}
//#endregion
//#region node_modules/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js
function _objectWithoutPropertiesLoose(r, e) {
	if (null == r) return {};
	var t = {};
	for (var n in r) if ({}.hasOwnProperty.call(r, n)) {
		if (-1 !== e.indexOf(n)) continue;
		t[n] = r[n];
	}
	return t;
}
//#endregion
//#region node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js
function _setPrototypeOf(t, e) {
	return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(t, e) {
		return t.__proto__ = e, t;
	}, _setPrototypeOf(t, e);
}
//#endregion
//#region node_modules/@babel/runtime/helpers/esm/inheritsLoose.js
function _inheritsLoose(t, o) {
	t.prototype = Object.create(o.prototype), t.prototype.constructor = t, _setPrototypeOf(t, o);
}
//#endregion
//#region node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js
function _assertThisInitialized(e) {
	if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	return e;
}
//#endregion
//#region node_modules/@babel/runtime/helpers/esm/typeof.js
function _typeof(o) {
	"@babel/helpers - typeof";
	return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o) {
		return typeof o;
	} : function(o) {
		return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
	}, _typeof(o);
}
//#endregion
//#region node_modules/@babel/runtime/helpers/esm/toPrimitive.js
function toPrimitive(t, r) {
	if ("object" != _typeof(t) || !t) return t;
	var e = t[Symbol.toPrimitive];
	if (void 0 !== e) {
		var i = e.call(t, r || "default");
		if ("object" != _typeof(i)) return i;
		throw new TypeError("@@toPrimitive must return a primitive value.");
	}
	return ("string" === r ? String : Number)(t);
}
//#endregion
//#region node_modules/@babel/runtime/helpers/esm/toPropertyKey.js
function toPropertyKey(t) {
	var i = toPrimitive(t, "string");
	return "symbol" == _typeof(i) ? i : i + "";
}
//#endregion
export { _extends as a, _objectWithoutPropertiesLoose as i, _assertThisInitialized as n, require_extends as o, _inheritsLoose as r, toPropertyKey as t };
