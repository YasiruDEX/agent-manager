import { a as __toESM, n as __commonJSMin } from "../../__23tanstack-start-server-fn-resolver-BaOM1vmh.mjs";
import { o as require_react } from "../@emotion/react+[...].mjs";
//#region node_modules/react/cjs/react-jsx-runtime.production.js
/**
* @license React
* react-jsx-runtime.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_react_jsx_runtime_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element");
	var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
	function jsxProd(type, config, maybeKey) {
		var key = null;
		void 0 !== maybeKey && (key = "" + maybeKey);
		void 0 !== config.key && (key = "" + config.key);
		if ("key" in config) {
			maybeKey = {};
			for (var propName in config) "key" !== propName && (maybeKey[propName] = config[propName]);
		} else maybeKey = config;
		config = maybeKey.ref;
		return {
			$$typeof: REACT_ELEMENT_TYPE,
			type,
			key,
			ref: void 0 !== config ? config : null,
			props: maybeKey
		};
	}
	exports.Fragment = REACT_FRAGMENT_TYPE;
	exports.jsx = jsxProd;
	exports.jsxs = jsxProd;
}));
//#endregion
//#region node_modules/react/jsx-runtime.js
var require_jsx_runtime = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_react_jsx_runtime_production();
}));
//#endregion
//#region node_modules/prop-types/lib/ReactPropTypesSecret.js
/**
* Copyright (c) 2013-present, Facebook, Inc.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_ReactPropTypesSecret = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";
}));
//#endregion
//#region node_modules/prop-types/factoryWithThrowingShims.js
/**
* Copyright (c) 2013-present, Facebook, Inc.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_factoryWithThrowingShims = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var ReactPropTypesSecret = require_ReactPropTypesSecret();
	function emptyFunction() {}
	function emptyFunctionWithReset() {}
	emptyFunctionWithReset.resetWarningCache = emptyFunction;
	module.exports = function() {
		function shim(props, propName, componentName, location, propFullName, secret) {
			if (secret === ReactPropTypesSecret) return;
			var err = /* @__PURE__ */ new Error("Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types");
			err.name = "Invariant Violation";
			throw err;
		}
		shim.isRequired = shim;
		function getShim() {
			return shim;
		}
		var ReactPropTypes = {
			array: shim,
			bigint: shim,
			bool: shim,
			func: shim,
			number: shim,
			object: shim,
			string: shim,
			symbol: shim,
			any: shim,
			arrayOf: getShim,
			element: shim,
			elementType: shim,
			instanceOf: getShim,
			node: shim,
			objectOf: getShim,
			oneOf: getShim,
			oneOfType: getShim,
			shape: getShim,
			exact: getShim,
			checkPropTypes: emptyFunctionWithReset,
			resetWarningCache: emptyFunction
		};
		ReactPropTypes.PropTypes = ReactPropTypes;
		return ReactPropTypes;
	};
}));
//#endregion
//#region node_modules/prop-types/index.js
var require_prop_types = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_factoryWithThrowingShims()();
}));
//#endregion
//#region node_modules/@mui/private-theming/esm/useTheme/ThemeContext.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var ThemeContext = /*#__PURE__*/ import_react.createContext(null);
//#endregion
//#region node_modules/@mui/private-theming/esm/useTheme/useTheme.js
function useTheme() {
	return import_react.useContext(ThemeContext);
}
var nested_default = typeof Symbol === "function" && Symbol.for ? Symbol.for("mui.nested") : "__THEME_NESTED__";
//#endregion
//#region node_modules/@mui/private-theming/esm/ThemeProvider/ThemeProvider.js
var import_jsx_runtime = require_jsx_runtime();
function mergeOuterLocalTheme(outerTheme, localTheme) {
	if (typeof localTheme === "function") return localTheme(outerTheme);
	return {
		...outerTheme,
		...localTheme
	};
}
/**
* This component takes a `theme` prop.
* It makes the `theme` available down the React tree thanks to React context.
* This component should preferably be used at **the root of your component tree**.
*/
function ThemeProvider(props) {
	const { children, theme: localTheme } = props;
	const outerTheme = useTheme();
	const theme = import_react.useMemo(() => {
		const output = outerTheme === null ? { ...localTheme } : mergeOuterLocalTheme(outerTheme, localTheme);
		if (output != null) output[nested_default] = outerTheme !== null;
		return output;
	}, [localTheme, outerTheme]);
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(ThemeContext.Provider, {
		value: theme,
		children
	});
}
//#endregion
export { require_jsx_runtime as i, useTheme as n, require_prop_types as r, ThemeProvider as t };
