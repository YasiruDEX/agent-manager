import { a as __toESM, i as __exportAll, n as __commonJSMin } from "../../__23tanstack-start-server-fn-resolver-BaOM1vmh.mjs";
import { o as require_react } from "../@emotion/react+[...].mjs";
import { c as useLazyRef, s as useOnMount, t as useEnhancedEffect } from "../mui__utils+react-is.mjs";
import { a as _extends } from "../babel__runtime.mjs";
//#region node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.production.js
/**
* @license React
* use-sync-external-store-shim.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_use_sync_external_store_shim_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	var React = require_react();
	function is(x, y) {
		return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
	}
	var objectIs = "function" === typeof Object.is ? Object.is : is;
	var useState = React.useState;
	var useEffect = React.useEffect;
	var useLayoutEffect = React.useLayoutEffect;
	var useDebugValue = React.useDebugValue;
	function useSyncExternalStore$2(subscribe, getSnapshot) {
		var value = getSnapshot(), _useState = useState({ inst: {
			value,
			getSnapshot
		} }), inst = _useState[0].inst, forceUpdate = _useState[1];
		useLayoutEffect(function() {
			inst.value = value;
			inst.getSnapshot = getSnapshot;
			checkIfSnapshotChanged(inst) && forceUpdate({ inst });
		}, [
			subscribe,
			value,
			getSnapshot
		]);
		useEffect(function() {
			checkIfSnapshotChanged(inst) && forceUpdate({ inst });
			return subscribe(function() {
				checkIfSnapshotChanged(inst) && forceUpdate({ inst });
			});
		}, [subscribe]);
		useDebugValue(value);
		return value;
	}
	function checkIfSnapshotChanged(inst) {
		var latestGetSnapshot = inst.getSnapshot;
		inst = inst.value;
		try {
			var nextValue = latestGetSnapshot();
			return !objectIs(inst, nextValue);
		} catch (error) {
			return !0;
		}
	}
	function useSyncExternalStore$1(subscribe, getSnapshot) {
		return getSnapshot();
	}
	var shim = "undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement ? useSyncExternalStore$1 : useSyncExternalStore$2;
	exports.useSyncExternalStore = void 0 !== React.useSyncExternalStore ? React.useSyncExternalStore : shim;
}));
//#endregion
//#region node_modules/use-sync-external-store/shim/index.js
var require_shim = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_use_sync_external_store_shim_production();
}));
//#endregion
//#region node_modules/use-sync-external-store/cjs/use-sync-external-store-shim/with-selector.production.js
/**
* @license React
* use-sync-external-store-shim/with-selector.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_with_selector_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	var React = require_react();
	var shim = require_shim();
	function is(x, y) {
		return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
	}
	var objectIs = "function" === typeof Object.is ? Object.is : is;
	var useSyncExternalStore = shim.useSyncExternalStore;
	var useRef = React.useRef;
	var useEffect = React.useEffect;
	var useMemo = React.useMemo;
	var useDebugValue = React.useDebugValue;
	exports.useSyncExternalStoreWithSelector = function(subscribe, getSnapshot, getServerSnapshot, selector, isEqual) {
		var instRef = useRef(null);
		if (null === instRef.current) {
			var inst = {
				hasValue: !1,
				value: null
			};
			instRef.current = inst;
		} else inst = instRef.current;
		instRef = useMemo(function() {
			function memoizedSelector(nextSnapshot) {
				if (!hasMemo) {
					hasMemo = !0;
					memoizedSnapshot = nextSnapshot;
					nextSnapshot = selector(nextSnapshot);
					if (void 0 !== isEqual && inst.hasValue) {
						var currentSelection = inst.value;
						if (isEqual(currentSelection, nextSnapshot)) return memoizedSelection = currentSelection;
					}
					return memoizedSelection = nextSnapshot;
				}
				currentSelection = memoizedSelection;
				if (objectIs(memoizedSnapshot, nextSnapshot)) return currentSelection;
				var nextSelection = selector(nextSnapshot);
				if (void 0 !== isEqual && isEqual(currentSelection, nextSelection)) return memoizedSnapshot = nextSnapshot, currentSelection;
				memoizedSnapshot = nextSnapshot;
				return memoizedSelection = nextSelection;
			}
			var hasMemo = !1, memoizedSnapshot, memoizedSelection, maybeGetServerSnapshot = void 0 === getServerSnapshot ? null : getServerSnapshot;
			return [function() {
				return memoizedSelector(getSnapshot());
			}, null === maybeGetServerSnapshot ? void 0 : function() {
				return memoizedSelector(maybeGetServerSnapshot());
			}];
		}, [
			getSnapshot,
			getServerSnapshot,
			selector,
			isEqual
		]);
		var value = useSyncExternalStore(subscribe, instRef[0], instRef[1]);
		useEffect(function() {
			inst.hasValue = !0;
			inst.value = value;
		}, [value]);
		useDebugValue(value);
		return value;
	};
}));
//#endregion
//#region node_modules/use-sync-external-store/shim/with-selector.js
var require_with_selector = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_with_selector_production();
}));
//#endregion
//#region node_modules/@mui/x-internals/esm/reactMajor/index.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var reactMajor_default = parseInt("19.2.7", 10);
//#endregion
//#region node_modules/@mui/x-internals/esm/forwardRef/forwardRef.js
var forwardRef = (render) => {
	if (reactMajor_default >= 19) {
		const Component = (props) => render(props, props.ref ?? null);
		Component.displayName = render.displayName ?? render.name;
		return Component;
	}
	return /*#__PURE__*/ import_react.forwardRef(render);
};
//#endregion
//#region node_modules/@mui/x-internals/esm/hash/hash.js
var encoder = new TextEncoder();
var bufferLength = 2 * 1024;
var buffer = new ArrayBuffer(bufferLength);
var uint8View = new Uint8Array(buffer);
var int32View = new Int32Array(buffer);
var hash = xxh;
/**
* Returns an xxh hash of `input` formatted as a decimal string.
*/
function xxh(input) {
	const requiredLength = input.length * 2;
	if (requiredLength > bufferLength) {
		bufferLength = requiredLength + (4 - requiredLength % 4);
		buffer = new ArrayBuffer(bufferLength);
		uint8View = new Uint8Array(buffer);
		int32View = new Int32Array(buffer);
	}
	const length8 = encoder.encodeInto(input, uint8View).written;
	const seed = 0;
	const len = length8 | 0;
	let i = 0;
	let h = (seed + len | 0) + 374761393 | 0;
	if (len < 16) for (; (i + 3 | 0) < len; i = i + 4 | 0) h = Math.imul(rotl32(h + Math.imul(int32View[i] | 0, 3266489917) | 0, 17) | 0, 668265263);
	else {
		let v0 = 606290984;
		let v1 = -2048144777;
		let v2 = seed;
		let v3 = 1640531535;
		for (; (i + 15 | 0) < len; i = i + 16 | 0) {
			v0 = Math.imul(rotl32(v0 + Math.imul(int32View[i + 0 | 0] | 0, 2246822519) | 0, 13) | 0, 2654435761);
			v1 = Math.imul(rotl32(v1 + Math.imul(int32View[i + 4 | 0] | 0, 2246822519) | 0, 13) | 0, 2654435761);
			v2 = Math.imul(rotl32(v2 + Math.imul(int32View[i + 8 | 0] | 0, 2246822519) | 0, 13) | 0, 2654435761);
			v3 = Math.imul(rotl32(v3 + Math.imul(int32View[i + 12 | 0] | 0, 2246822519) | 0, 13) | 0, 2654435761);
		}
		h = (((rotl32(v0, 1) | 0 + rotl32(v1, 7) | 0) + rotl32(v2, 12) | 0) + rotl32(v3, 18) | 0) + len | 0;
		for (; (i + 3 | 0) < len; i = i + 4 | 0) h = Math.imul(rotl32(h + Math.imul(int32View[i] | 0, 3266489917) | 0, 17) | 0, 668265263);
	}
	for (; i < len; i = i + 1 | 0) h = Math.imul(rotl32(h + Math.imul(uint8View[i] | 0, 374761393) | 0, 11) | 0, 2654435761);
	h = Math.imul(h ^ h >>> 15, 2246822519);
	h = Math.imul(h ^ h >>> 13, 3266489917);
	return ((h ^ h >>> 16) >>> 0).toString();
}
function rotl32(x, r) {
	return x << r | x >>> 32 - r;
}
//#endregion
//#region node_modules/reselect/dist/reselect.mjs
var NOT_FOUND = /* @__PURE__ */ Symbol("NOT_FOUND");
function assertIsFunction(func, errorMessage = `expected a function, instead received ${typeof func}`) {
	if (typeof func !== "function") throw new TypeError(errorMessage);
}
function assertIsArrayOfFunctions(array, errorMessage = `expected all items to be functions, instead received the following types: `) {
	if (!array.every((item) => typeof item === "function")) {
		const itemTypes = array.map((item) => typeof item === "function" ? `function ${item.name || "unnamed"}()` : typeof item).join(", ");
		throw new TypeError(`${errorMessage}[${itemTypes}]`);
	}
}
var ensureIsArray = (item) => {
	return Array.isArray(item) ? item : [item];
};
function getDependencies(createSelectorArgs) {
	const dependencies = Array.isArray(createSelectorArgs[0]) ? createSelectorArgs[0] : createSelectorArgs;
	assertIsArrayOfFunctions(dependencies, `createSelector expects all input-selectors to be functions, but received the following types: `);
	return dependencies;
}
function collectInputSelectorResults(dependencies, inputSelectorArgs) {
	const inputSelectorResults = [];
	const { length } = dependencies;
	for (let i = 0; i < length; i++) inputSelectorResults.push(dependencies[i].apply(null, inputSelectorArgs));
	return inputSelectorResults;
}
function createSingletonCache(equals) {
	let entry;
	return {
		get(key) {
			if (entry && equals(entry.key, key)) return entry.value;
			return NOT_FOUND;
		},
		put(key, value) {
			entry = {
				key,
				value
			};
		},
		getEntries() {
			return entry ? [entry] : [];
		},
		clear() {
			entry = void 0;
		}
	};
}
function createLruCache(maxSize, equals) {
	let entries = [];
	function get(key) {
		const cacheIndex = entries.findIndex((entry) => equals(key, entry.key));
		if (cacheIndex > -1) {
			const entry = entries[cacheIndex];
			if (cacheIndex > 0) {
				entries.splice(cacheIndex, 1);
				entries.unshift(entry);
			}
			return entry.value;
		}
		return NOT_FOUND;
	}
	function put(key, value) {
		if (get(key) === NOT_FOUND) {
			entries.unshift({
				key,
				value
			});
			if (entries.length > maxSize) entries.pop();
		}
	}
	function getEntries() {
		return entries;
	}
	function clear() {
		entries = [];
	}
	return {
		get,
		put,
		getEntries,
		clear
	};
}
var referenceEqualityCheck = (a, b) => a === b;
function createCacheKeyComparator(equalityCheck) {
	return function areArgumentsShallowlyEqual(prev, next) {
		if (prev === null || next === null || prev.length !== next.length) return false;
		const { length } = prev;
		for (let i = 0; i < length; i++) if (!equalityCheck(prev[i], next[i])) return false;
		return true;
	};
}
function lruMemoize(func, equalityCheckOrOptions) {
	const { equalityCheck = referenceEqualityCheck, maxSize = 1, resultEqualityCheck } = typeof equalityCheckOrOptions === "object" ? equalityCheckOrOptions : { equalityCheck: equalityCheckOrOptions };
	const comparator = createCacheKeyComparator(equalityCheck);
	let resultsCount = 0;
	const cache = maxSize <= 1 ? createSingletonCache(comparator) : createLruCache(maxSize, comparator);
	function memoized() {
		let value = cache.get(arguments);
		if (value === NOT_FOUND) {
			value = func.apply(null, arguments);
			resultsCount++;
			if (resultEqualityCheck) {
				const matchingEntry = cache.getEntries().find((entry) => resultEqualityCheck(entry.value, value));
				if (matchingEntry) {
					value = matchingEntry.value;
					resultsCount !== 0 && resultsCount--;
				}
			}
			cache.put(arguments, value);
		}
		return value;
	}
	memoized.clearCache = () => {
		cache.clear();
		memoized.resetResultsCount();
	};
	memoized.resultsCount = () => resultsCount;
	memoized.resetResultsCount = () => {
		resultsCount = 0;
	};
	return memoized;
}
var StrongRef = class {
	constructor(value) {
		this.value = value;
	}
	deref() {
		return this.value;
	}
};
var getWeakRef = () => typeof WeakRef === "undefined" ? StrongRef : WeakRef;
var Ref = /* @__PURE__ */ getWeakRef();
var UNTERMINATED = 0;
var TERMINATED = 1;
function createCacheNode() {
	return {
		s: UNTERMINATED,
		v: void 0,
		o: null,
		p: null
	};
}
function maybeDeref(r) {
	if (r instanceof Ref) return r.deref();
	return r;
}
function weakMapMemoize(func, options = {}) {
	let fnNode = createCacheNode();
	const { resultEqualityCheck } = options;
	let lastResult;
	let resultsCount = 0;
	function memoized() {
		let cacheNode = fnNode;
		const { length } = arguments;
		for (let i = 0, l = length; i < l; i++) {
			const arg = arguments[i];
			if (typeof arg === "function" || typeof arg === "object" && arg !== null) {
				let objectCache = cacheNode.o;
				if (objectCache === null) cacheNode.o = objectCache = /* @__PURE__ */ new WeakMap();
				const objectNode = objectCache.get(arg);
				if (objectNode === void 0) {
					cacheNode = createCacheNode();
					objectCache.set(arg, cacheNode);
				} else cacheNode = objectNode;
			} else {
				let primitiveCache = cacheNode.p;
				if (primitiveCache === null) cacheNode.p = primitiveCache = /* @__PURE__ */ new Map();
				const primitiveNode = primitiveCache.get(arg);
				if (primitiveNode === void 0) {
					cacheNode = createCacheNode();
					primitiveCache.set(arg, cacheNode);
				} else cacheNode = primitiveNode;
			}
		}
		const terminatedNode = cacheNode;
		let result;
		if (cacheNode.s === TERMINATED) result = cacheNode.v;
		else {
			result = func.apply(null, arguments);
			resultsCount++;
			if (resultEqualityCheck) {
				const lastResultValue = maybeDeref(lastResult);
				if (lastResultValue != null && resultEqualityCheck(lastResultValue, result)) {
					result = lastResultValue;
					resultsCount !== 0 && resultsCount--;
				}
				lastResult = typeof result === "object" && result !== null || typeof result === "function" ? /* @__PURE__ */ new Ref(result) : result;
			}
		}
		terminatedNode.s = TERMINATED;
		terminatedNode.v = result;
		return result;
	}
	memoized.clearCache = () => {
		fnNode = createCacheNode();
		memoized.resetResultsCount();
	};
	memoized.resultsCount = () => resultsCount;
	memoized.resetResultsCount = () => {
		resultsCount = 0;
	};
	return memoized;
}
function createSelectorCreator(memoizeOrOptions, ...memoizeOptionsFromArgs) {
	const createSelectorCreatorOptions = typeof memoizeOrOptions === "function" ? {
		memoize: memoizeOrOptions,
		memoizeOptions: memoizeOptionsFromArgs
	} : memoizeOrOptions;
	const createSelector2 = (...createSelectorArgs) => {
		let recomputations = 0;
		let dependencyRecomputations = 0;
		let lastResult;
		let directlyPassedOptions = {};
		let resultFunc = createSelectorArgs.pop();
		if (typeof resultFunc === "object") {
			directlyPassedOptions = resultFunc;
			resultFunc = createSelectorArgs.pop();
		}
		assertIsFunction(resultFunc, `createSelector expects an output function after the inputs, but received: [${typeof resultFunc}]`);
		const { memoize, memoizeOptions = [], argsMemoize = weakMapMemoize, argsMemoizeOptions = [] } = {
			...createSelectorCreatorOptions,
			...directlyPassedOptions
		};
		const finalMemoizeOptions = ensureIsArray(memoizeOptions);
		const finalArgsMemoizeOptions = ensureIsArray(argsMemoizeOptions);
		const dependencies = getDependencies(createSelectorArgs);
		const memoizedResultFunc = memoize(function recomputationWrapper() {
			recomputations++;
			return resultFunc.apply(null, arguments);
		}, ...finalMemoizeOptions);
		const selector = argsMemoize(function dependenciesChecker() {
			dependencyRecomputations++;
			const inputSelectorResults = collectInputSelectorResults(dependencies, arguments);
			lastResult = memoizedResultFunc.apply(null, inputSelectorResults);
			return lastResult;
		}, ...finalArgsMemoizeOptions);
		return Object.assign(selector, {
			resultFunc,
			memoizedResultFunc,
			dependencies,
			dependencyRecomputations: () => dependencyRecomputations,
			resetDependencyRecomputations: () => {
				dependencyRecomputations = 0;
			},
			lastResult: () => lastResult,
			recomputations: () => recomputations,
			resetRecomputations: () => {
				recomputations = 0;
			},
			memoize,
			argsMemoize
		});
	};
	Object.assign(createSelector2, { withTypes: () => createSelector2 });
	return createSelector2;
}
//#endregion
//#region node_modules/@mui/x-internals/esm/store/createSelector.js
var reselectCreateSelector = createSelectorCreator({
	memoize: lruMemoize,
	memoizeOptions: {
		maxSize: 1,
		equalityCheck: Object.is
	}
});
var createSelector = (a, b, c, d, e, f, ...other) => {
	if (other.length > 0) throw new Error("Unsupported number of selectors");
	let selector;
	if (a && b && c && d && e && f) selector = (state, a1, a2, a3) => {
		return f(a(state, a1, a2, a3), b(state, a1, a2, a3), c(state, a1, a2, a3), d(state, a1, a2, a3), e(state, a1, a2, a3), a1, a2, a3);
	};
	else if (a && b && c && d && e) selector = (state, a1, a2, a3) => {
		return e(a(state, a1, a2, a3), b(state, a1, a2, a3), c(state, a1, a2, a3), d(state, a1, a2, a3), a1, a2, a3);
	};
	else if (a && b && c && d) selector = (state, a1, a2, a3) => {
		return d(a(state, a1, a2, a3), b(state, a1, a2, a3), c(state, a1, a2, a3), a1, a2, a3);
	};
	else if (a && b && c) selector = (state, a1, a2, a3) => {
		return c(a(state, a1, a2, a3), b(state, a1, a2, a3), a1, a2, a3);
	};
	else if (a && b) selector = (state, a1, a2, a3) => {
		return b(a(state, a1, a2, a3), a1, a2, a3);
	};
	else if (a) selector = a;
	else throw new Error("Missing arguments");
	return selector;
};
var createSelectorMemoized = (...inputs) => {
	const cache = /* @__PURE__ */ new WeakMap();
	let nextCacheId = 1;
	const combiner = inputs[inputs.length - 1];
	const nSelectors = inputs.length - 1 || 1;
	const argsLength = Math.max(combiner.length - nSelectors, 0);
	if (argsLength > 3) throw new Error("Unsupported number of arguments");
	const selector = (state, a1, a2, a3) => {
		let cacheKey = state.__cacheKey__;
		if (!cacheKey) {
			cacheKey = { id: nextCacheId };
			state.__cacheKey__ = cacheKey;
			nextCacheId += 1;
		}
		let fn = cache.get(cacheKey);
		if (!fn) {
			const selectors = inputs.length === 1 ? [(x) => x, combiner] : inputs;
			let reselectArgs = inputs;
			const selectorArgs = [
				void 0,
				void 0,
				void 0
			];
			switch (argsLength) {
				case 0: break;
				case 1:
					reselectArgs = [
						...selectors.slice(0, -1),
						() => selectorArgs[0],
						combiner
					];
					break;
				case 2:
					reselectArgs = [
						...selectors.slice(0, -1),
						() => selectorArgs[0],
						() => selectorArgs[1],
						combiner
					];
					break;
				case 3:
					reselectArgs = [
						...selectors.slice(0, -1),
						() => selectorArgs[0],
						() => selectorArgs[1],
						() => selectorArgs[2],
						combiner
					];
					break;
				default: throw new Error("Unsupported number of arguments");
			}
			fn = reselectCreateSelector(...reselectArgs);
			fn.selectorArgs = selectorArgs;
			cache.set(cacheKey, fn);
		}
		switch (argsLength) {
			case 3: fn.selectorArgs[2] = a3;
			case 2: fn.selectorArgs[1] = a2;
			case 1: fn.selectorArgs[0] = a1;
			default:
		}
		switch (argsLength) {
			case 0: return fn(state);
			case 1: return fn(state, a1);
			case 2: return fn(state, a1, a2);
			case 3: return fn(state, a1, a2, a3);
			default: throw new Error("unreachable");
		}
	};
	return selector;
};
//#endregion
//#region node_modules/@mui/x-internals/esm/store/useStore.js
var import_with_selector = require_with_selector();
function useStore(store, selector, a1, a2, a3) {
	const selectorWithArgs = (state) => selector(state, a1, a2, a3);
	return (0, import_with_selector.useSyncExternalStoreWithSelector)(store.subscribe, store.getSnapshot, store.getSnapshot, selectorWithArgs);
}
//#endregion
//#region node_modules/@mui/x-internals/esm/store/useStoreEffect.js
var noop$1 = () => {};
/**
* An Effect implementation for the Store. This should be used for side-effects only. To
* compute and store derived state, use `createSelectorMemoized` instead.
*/
function useStoreEffect(store, selector, effect) {
	const instance = useLazyRef(initialize, {
		store,
		selector
	}).current;
	instance.effect = effect;
	useOnMount(instance.onMount);
}
function initialize(params) {
	const { store, selector } = params;
	let previousState = selector(store.state);
	const instance = {
		effect: noop$1,
		dispose: null,
		subscribe: () => {
			instance.dispose ??= store.subscribe((state) => {
				const nextState = selector(state);
				instance.effect(previousState, nextState);
				previousState = nextState;
			});
		},
		onMount: () => {
			instance.subscribe();
			return () => {
				instance.dispose?.();
				instance.dispose = null;
			};
		}
	};
	instance.subscribe();
	return instance;
}
//#endregion
//#region node_modules/@mui/x-internals/esm/store/Store.js
var Store = class Store {
	static create(state) {
		return new Store(state);
	}
	constructor(state) {
		this.state = state;
		this.listeners = /* @__PURE__ */ new Set();
		this.updateTick = 0;
	}
	subscribe = (fn) => {
		this.listeners.add(fn);
		return () => {
			this.listeners.delete(fn);
		};
	};
	getSnapshot = () => {
		return this.state;
	};
	setState(newState) {
		this.state = newState;
		this.updateTick += 1;
		const currentTick = this.updateTick;
		const it = this.listeners.values();
		let result;
		while (result = it.next(), !result.done) {
			if (currentTick !== this.updateTick) return;
			const listener = result.value;
			listener(newState);
		}
	}
	update(changes) {
		for (const key in changes) if (!Object.is(this.state[key], changes[key])) {
			this.setState(_extends({}, this.state, changes));
			return;
		}
	}
	set(key, value) {
		if (!Object.is(this.state[key], value)) this.setState(_extends({}, this.state, { [key]: value }));
	}
};
//#endregion
//#region node_modules/@mui/x-internals/esm/fastObjectShallowCompare/fastObjectShallowCompare.js
var is = Object.is;
/**
* Fast shallow compare for objects.
* @returns true if objects are equal.
*/
function fastObjectShallowCompare(a, b) {
	if (a === b) return true;
	if (!(a instanceof Object) || !(b instanceof Object)) return false;
	let aLength = 0;
	let bLength = 0;
	for (const key in a) {
		aLength += 1;
		if (!is(a[key], b[key])) return false;
		if (!(key in b)) return false;
	}
	for (const _ in b) bLength += 1;
	return aLength === bLength;
}
//#endregion
//#region node_modules/@mui/x-internals/esm/fastMemo/fastMemo.js
function fastMemo(component) {
	return /*#__PURE__*/ import_react.memo(component, fastObjectShallowCompare);
}
//#endregion
//#region node_modules/@mui/x-internals/esm/warning/warning.js
/**
* Logs a message to the console on development mode. The warning will only be logged once.
*
* The message is the log's cache key. Two identical messages will only be logged once.
*
* This function is a no-op in production.
*
* @param message the message to log
* @param gravity the gravity of the warning. Defaults to `'warning'`.
* @returns
*/
function warnOnce(message, gravity = "warning") {}
//#endregion
//#region node_modules/@mui/x-internals/esm/isObjectEmpty/isObjectEmpty.js
function isObjectEmpty(object) {
	for (const _ in object) return false;
	return true;
}
//#endregion
//#region node_modules/@mui/x-internals/esm/throttle/throttle.js
function throttle(func, wait = 166) {
	let timeout;
	let lastArgs;
	const later = () => {
		timeout = void 0;
		func(...lastArgs);
	};
	function throttled(...args) {
		lastArgs = args;
		if (timeout === void 0) timeout = setTimeout(later, wait);
	}
	throttled.clear = () => {
		clearTimeout(timeout);
		timeout = void 0;
	};
	return throttled;
}
//#endregion
//#region node_modules/@mui/x-internals/esm/isDeepEqual/isDeepEqual.js
/**
* Based on `fast-deep-equal`
*
* MIT License
*
* Copyright (c) 2017 Evgeny Poberezkin
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*/
/**
* Check if two values are deeply equal.
*/
function isDeepEqual(a, b) {
	if (a === b) return true;
	if (a && b && typeof a === "object" && typeof b === "object") {
		if (a.constructor !== b.constructor) return false;
		if (Array.isArray(a)) {
			const length = a.length;
			if (length !== b.length) return false;
			for (let i = 0; i < length; i += 1) if (!isDeepEqual(a[i], b[i])) return false;
			return true;
		}
		if (a instanceof Map && b instanceof Map) {
			if (a.size !== b.size) return false;
			const entriesA = Array.from(a.entries());
			for (let i = 0; i < entriesA.length; i += 1) if (!b.has(entriesA[i][0])) return false;
			for (let i = 0; i < entriesA.length; i += 1) {
				const entryA = entriesA[i];
				if (!isDeepEqual(entryA[1], b.get(entryA[0]))) return false;
			}
			return true;
		}
		if (a instanceof Set && b instanceof Set) {
			if (a.size !== b.size) return false;
			const entries = Array.from(a.entries());
			for (let i = 0; i < entries.length; i += 1) if (!b.has(entries[i][0])) return false;
			return true;
		}
		if (ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
			const length = a.length;
			if (length !== b.length) return false;
			for (let i = 0; i < length; i += 1) if (a[i] !== b[i]) return false;
			return true;
		}
		if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
		if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
		if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();
		const keys = Object.keys(a);
		const length = keys.length;
		if (length !== Object.keys(b).length) return false;
		for (let i = 0; i < length; i += 1) if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
		for (let i = 0; i < length; i += 1) {
			const key = keys[i];
			if (!isDeepEqual(a[key], b[key])) return false;
		}
		return true;
	}
	return a !== a && b !== b;
}
//#endregion
//#region node_modules/@mui/x-internals/esm/math/index.js
function roundToDecimalPlaces(value, decimals) {
	return Math.round(value * 10 ** decimals) / 10 ** decimals;
}
var isFirefox = (typeof navigator !== "undefined" ? navigator.userAgent.toLowerCase() : "empty").includes("firefox");
var isJSDOM = typeof window !== "undefined" && /jsdom|HappyDOM/.test(window.navigator.userAgent);
//#endregion
//#region node_modules/@mui/x-internals/esm/useRunOnce/useRunOnce.js
var noop = () => {};
/**
* Runs an effect once, when `condition` is true.
*/
var useRunOnce = (condition, effect) => {
	const didRun = import_react.useRef(false);
	useEnhancedEffect(() => {
		if (didRun.current || !condition) return noop;
		didRun.current = true;
		return effect();
	}, [didRun.current || condition]);
};
//#endregion
//#region node_modules/@mui/x-internals/esm/useFirstRender/useFirstRender.js
function useFirstRender(callback) {
	const isFirstRender = import_react.useRef(true);
	if (isFirstRender.current) {
		isFirstRender.current = false;
		callback();
	}
}
//#endregion
//#region node_modules/@mui/x-internals/esm/useFirstRender/index.js
var useFirstRender_exports = /* @__PURE__ */ __exportAll({ useFirstRender: () => useFirstRender });
//#endregion
//#region node_modules/@mui/x-internals/esm/useComponentRenderer/useComponentRenderer.js
/**
* Resolves the rendering logic for a component.
* Handles three scenarios:
* 1. A render function that receives props and state
* 2. A React element
* 3. A default element
*
* @ignore - internal hook.
*/
function useComponentRenderer(defaultElement, render, props, state = {}) {
	if (typeof render === "function") return render(props, state);
	if (render) {
		if (render.props.className) props.className = mergeClassNames(render.props.className, props.className);
		if (render.props.style || props.style) props.style = _extends({}, props.style, render.props.style);
		return /*#__PURE__*/ import_react.cloneElement(render, props);
	}
	return /*#__PURE__*/ import_react.createElement(defaultElement, props);
}
function mergeClassNames(className, otherClassName) {
	if (!className || !otherClassName) return className || otherClassName;
	return `${className} ${otherClassName}`;
}
//#endregion
//#region node_modules/@mui/x-internals/esm/export/loadStyleSheets.js
/**
* Loads all stylesheets from the given root element into the document.
* @returns an array of promises that resolve when each stylesheet is loaded
* @param document Document to load stylesheets into
* @param root Document or ShadowRoot to load stylesheets from
*/
function loadStyleSheets(document, root) {
	const stylesheetLoadPromises = [];
	const headStyleElements = root.querySelectorAll("style, link[rel='stylesheet']");
	for (let i = 0; i < headStyleElements.length; i += 1) {
		const node = headStyleElements[i];
		if (node.tagName === "STYLE") {
			const newHeadStyleElements = document.createElement(node.tagName);
			const sheet = node.sheet;
			if (sheet) {
				let styleCSS = "";
				for (let j = 0; j < sheet.cssRules.length; j += 1) if (typeof sheet.cssRules[j].cssText === "string") styleCSS += `${sheet.cssRules[j].cssText}\r\n`;
				newHeadStyleElements.appendChild(document.createTextNode(styleCSS));
				document.head.appendChild(newHeadStyleElements);
			}
		} else if (node.getAttribute("href")) {
			const newHeadStyleElements = document.createElement(node.tagName);
			for (let j = 0; j < node.attributes.length; j += 1) {
				const attr = node.attributes[j];
				if (attr) newHeadStyleElements.setAttribute(attr.nodeName, attr.nodeValue || "");
			}
			stylesheetLoadPromises.push(new Promise((resolve) => {
				newHeadStyleElements.addEventListener("load", () => resolve());
			}));
			document.head.appendChild(newHeadStyleElements);
		}
	}
	return stylesheetLoadPromises;
}
//#endregion
//#region node_modules/@mui/x-internals/esm/EventManager/EventManager.js
var EventManager = class {
	maxListeners = 20;
	warnOnce = false;
	events = {};
	on(eventName, listener, options = {}) {
		let collection = this.events[eventName];
		if (!collection) {
			collection = {
				highPriority: /* @__PURE__ */ new Map(),
				regular: /* @__PURE__ */ new Map()
			};
			this.events[eventName] = collection;
		}
		if (options.isFirst) collection.highPriority.set(listener, true);
		else collection.regular.set(listener, true);
	}
	removeListener(eventName, listener) {
		if (this.events[eventName]) {
			this.events[eventName].regular.delete(listener);
			this.events[eventName].highPriority.delete(listener);
		}
	}
	removeAllListeners() {
		this.events = {};
	}
	emit(eventName, ...args) {
		const collection = this.events[eventName];
		if (!collection) return;
		const highPriorityListeners = Array.from(collection.highPriority.keys());
		const regularListeners = Array.from(collection.regular.keys());
		for (let i = highPriorityListeners.length - 1; i >= 0; i -= 1) {
			const listener = highPriorityListeners[i];
			if (collection.highPriority.has(listener)) listener.apply(this, args);
		}
		for (let i = 0; i < regularListeners.length; i += 1) {
			const listener = regularListeners[i];
			if (collection.regular.has(listener)) listener.apply(this, args);
		}
	}
	once(eventName, listener) {
		const that = this;
		this.on(eventName, function oneTimeListener(...args) {
			that.removeListener(eventName, oneTimeListener);
			listener.apply(that, args);
		});
	}
};
//#endregion
export { forwardRef as C, hash as S, require_shim as T, useStoreEffect as _, useFirstRender as a, createSelectorMemoized as b, isJSDOM as c, throttle as d, isObjectEmpty as f, Store as g, fastObjectShallowCompare as h, useFirstRender_exports as i, roundToDecimalPlaces as l, fastMemo as m, loadStyleSheets as n, useRunOnce as o, warnOnce as p, useComponentRenderer as r, isFirefox as s, EventManager as t, isDeepEqual as u, useStore as v, require_with_selector as w, lruMemoize as x, createSelector as y };
