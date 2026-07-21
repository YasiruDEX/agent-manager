import { a as __toESM } from "../__23tanstack-start-server-fn-resolver-BaOM1vmh.mjs";
import { o as require_react, t as import_emotion_react_edge_light_cjs } from "./@emotion/react+[...].mjs";
import { i as require_jsx_runtime } from "./@mui/private-theming+[...].mjs";
import { t as import_emotion_cache_edge_light_cjs_default } from "./@emotion/cache+[...].mjs";
import { t as import_emotion_styled_edge_light_cjs_default } from "./emotion__styled.mjs";
import { t as import_emotion_serialize_cjs } from "./emotion__serialize.mjs";
import { t as import_emotion_sheet_cjs } from "./emotion__sheet.mjs";
//#region node_modules/@mui/styled-engine/esm/StyledEngineProvider/StyledEngineProvider.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var cacheMap = /* @__PURE__ */ new Map();
var TEST_INTERNALS_DO_NOT_USE = { 
/**
* to intercept the generated CSS before inserting to the style tag, so that we can check the generated CSS.
*
* let rule;
* TEST_INTERNALS_DO_NOT_USE.insert = (...args) => {
*    rule = args[0];
* };
*
* expect(rule).to.equal(...);
*/
insert: void 0 };
var createEmotionCache = (options, CustomSheet) => {
	const cache = (0, import_emotion_cache_edge_light_cjs_default._default)(options);
	cache.sheet = new CustomSheet({
		key: cache.key,
		nonce: cache.sheet.nonce,
		container: cache.sheet.container,
		speedy: cache.sheet.isSpeedy,
		prepend: cache.sheet.prepend,
		insertionPoint: cache.sheet.insertionPoint
	});
	return cache;
};
var insertionPoint;
if (typeof document === "object") {
	insertionPoint = document.querySelector("[name=\"emotion-insertion-point\"]");
	if (!insertionPoint) {
		insertionPoint = document.createElement("meta");
		insertionPoint.setAttribute("name", "emotion-insertion-point");
		insertionPoint.setAttribute("content", "");
		const head = document.querySelector("head");
		if (head) head.prepend(insertionPoint);
	}
}
function getCache(injectFirst, enableCssLayer) {
	if (injectFirst || enableCssLayer) {
		/**
		* This is for client-side apps only.
		* A custom sheet is required to make the GlobalStyles API injected above the insertion point.
		* This is because the [sheet](https://github.com/emotion-js/emotion/blob/main/packages/react/src/global.js#L94-L99) does not consume the options.
		*/
		class MyStyleSheet extends import_emotion_sheet_cjs.StyleSheet {
			insert(rule, options) {
				if (TEST_INTERNALS_DO_NOT_USE.insert) return TEST_INTERNALS_DO_NOT_USE.insert(rule, options);
				if (this.key && this.key.endsWith("global")) this.before = insertionPoint;
				return super.insert(rule, options);
			}
		}
		const emotionCache = createEmotionCache({
			key: "css",
			insertionPoint: injectFirst ? insertionPoint : void 0
		}, MyStyleSheet);
		if (enableCssLayer) {
			const prevInsert = emotionCache.insert;
			emotionCache.insert = (...args) => {
				if (!args[1].styles.match(/^@layer\s+[^{]*$/)) args[1].styles = `@layer mui {${args[1].styles}}`;
				return prevInsert(...args);
			};
		}
		return emotionCache;
	}
}
function StyledEngineProvider(props) {
	const { injectFirst, enableCssLayer, children } = props;
	const cache = import_react.useMemo(() => {
		const cacheKey = `${injectFirst}-${enableCssLayer}`;
		if (typeof document === "object" && cacheMap.has(cacheKey)) return cacheMap.get(cacheKey);
		const fresh = getCache(injectFirst, enableCssLayer);
		cacheMap.set(cacheKey, fresh);
		return fresh;
	}, [injectFirst, enableCssLayer]);
	return cache ? /*#__PURE__*/ (0, import_jsx_runtime.jsx)(import_emotion_react_edge_light_cjs.CacheProvider, {
		value: cache,
		children
	}) : children;
}
//#endregion
//#region node_modules/@mui/styled-engine/esm/GlobalStyles/GlobalStyles.js
function isEmpty(obj) {
	return obj === void 0 || obj === null || Object.keys(obj).length === 0;
}
function GlobalStyles(props) {
	const { styles, defaultTheme = {} } = props;
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(import_emotion_react_edge_light_cjs.Global, { styles: typeof styles === "function" ? (themeInput) => styles(isEmpty(themeInput) ? defaultTheme : themeInput) : styles });
}
//#endregion
//#region node_modules/@mui/styled-engine/esm/index.js
/**
* @mui/styled-engine v7.3.10
*
* @license MIT
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
function styled(tag, options) {
	return (0, import_emotion_styled_edge_light_cjs_default._default)(tag, options);
}
function internal_mutateStyles(tag, processor) {
	if (Array.isArray(tag.__emotion_styles)) tag.__emotion_styles = processor(tag.__emotion_styles);
}
var wrapper = [];
function internal_serializeStyles(styles) {
	wrapper[0] = styles;
	return (0, import_emotion_serialize_cjs.serializeStyles)(wrapper);
}
//#endregion
export { StyledEngineProvider as a, GlobalStyles as i, internal_serializeStyles as n, styled as r, internal_mutateStyles as t };
