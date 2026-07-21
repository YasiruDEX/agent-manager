import { a as __toESM, n as __commonJSMin } from "../__23tanstack-start-server-fn-resolver-BaOM1vmh.mjs";
import { o as require_react } from "./@emotion/react+[...].mjs";
import { a as useEnhancedEffect, i as useEventCallback, n as useTimeout, o as useLazyRef, r as ownerDocument } from "./mui__utils+react-is.mjs";
import { a as _extends } from "./babel__runtime.mjs";
import { _ as useStoreEffect, a as useFirstRender, b as createSelectorMemoized, c as isJSDOM, d as throttle, g as Store, l as roundToDecimalPlaces, o as useRunOnce, s as isFirefox, u as isDeepEqual, v as useStore, y as createSelector } from "./@mui/x-internals+[...].mjs";
//#region node_modules/react-dom/cjs/react-dom.production.js
/**
* @license React
* react-dom.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_react_dom_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	var React = require_react();
	function formatProdErrorMessage(code) {
		var url = "https://react.dev/errors/" + code;
		if (1 < arguments.length) {
			url += "?args[]=" + encodeURIComponent(arguments[1]);
			for (var i = 2; i < arguments.length; i++) url += "&args[]=" + encodeURIComponent(arguments[i]);
		}
		return "Minified React error #" + code + "; visit " + url + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
	}
	function noop() {}
	var Internals = {
		d: {
			f: noop,
			r: function() {
				throw Error(formatProdErrorMessage(522));
			},
			D: noop,
			C: noop,
			L: noop,
			m: noop,
			X: noop,
			S: noop,
			M: noop
		},
		p: 0,
		findDOMNode: null
	};
	var REACT_PORTAL_TYPE = Symbol.for("react.portal");
	function createPortal$1(children, containerInfo, implementation) {
		var key = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : null;
		return {
			$$typeof: REACT_PORTAL_TYPE,
			key: null == key ? null : "" + key,
			children,
			containerInfo,
			implementation
		};
	}
	var ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
	function getCrossOriginStringAs(as, input) {
		if ("font" === as) return "";
		if ("string" === typeof input) return "use-credentials" === input ? input : "";
	}
	exports.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = Internals;
	exports.createPortal = function(children, container) {
		var key = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : null;
		if (!container || 1 !== container.nodeType && 9 !== container.nodeType && 11 !== container.nodeType) throw Error(formatProdErrorMessage(299));
		return createPortal$1(children, container, null, key);
	};
	exports.flushSync = function(fn) {
		var previousTransition = ReactSharedInternals.T, previousUpdatePriority = Internals.p;
		try {
			if (ReactSharedInternals.T = null, Internals.p = 2, fn) return fn();
		} finally {
			ReactSharedInternals.T = previousTransition, Internals.p = previousUpdatePriority, Internals.d.f();
		}
	};
	exports.preconnect = function(href, options) {
		"string" === typeof href && (options ? (options = options.crossOrigin, options = "string" === typeof options ? "use-credentials" === options ? options : "" : void 0) : options = null, Internals.d.C(href, options));
	};
	exports.prefetchDNS = function(href) {
		"string" === typeof href && Internals.d.D(href);
	};
	exports.preinit = function(href, options) {
		if ("string" === typeof href && options && "string" === typeof options.as) {
			var as = options.as, crossOrigin = getCrossOriginStringAs(as, options.crossOrigin), integrity = "string" === typeof options.integrity ? options.integrity : void 0, fetchPriority = "string" === typeof options.fetchPriority ? options.fetchPriority : void 0;
			"style" === as ? Internals.d.S(href, "string" === typeof options.precedence ? options.precedence : void 0, {
				crossOrigin,
				integrity,
				fetchPriority
			}) : "script" === as && Internals.d.X(href, {
				crossOrigin,
				integrity,
				fetchPriority,
				nonce: "string" === typeof options.nonce ? options.nonce : void 0
			});
		}
	};
	exports.preinitModule = function(href, options) {
		if ("string" === typeof href) if ("object" === typeof options && null !== options) {
			if (null == options.as || "script" === options.as) {
				var crossOrigin = getCrossOriginStringAs(options.as, options.crossOrigin);
				Internals.d.M(href, {
					crossOrigin,
					integrity: "string" === typeof options.integrity ? options.integrity : void 0,
					nonce: "string" === typeof options.nonce ? options.nonce : void 0
				});
			}
		} else options ?? Internals.d.M(href);
	};
	exports.preload = function(href, options) {
		if ("string" === typeof href && "object" === typeof options && null !== options && "string" === typeof options.as) {
			var as = options.as, crossOrigin = getCrossOriginStringAs(as, options.crossOrigin);
			Internals.d.L(href, as, {
				crossOrigin,
				integrity: "string" === typeof options.integrity ? options.integrity : void 0,
				nonce: "string" === typeof options.nonce ? options.nonce : void 0,
				type: "string" === typeof options.type ? options.type : void 0,
				fetchPriority: "string" === typeof options.fetchPriority ? options.fetchPriority : void 0,
				referrerPolicy: "string" === typeof options.referrerPolicy ? options.referrerPolicy : void 0,
				imageSrcSet: "string" === typeof options.imageSrcSet ? options.imageSrcSet : void 0,
				imageSizes: "string" === typeof options.imageSizes ? options.imageSizes : void 0,
				media: "string" === typeof options.media ? options.media : void 0
			});
		}
	};
	exports.preloadModule = function(href, options) {
		if ("string" === typeof href) if (options) {
			var crossOrigin = getCrossOriginStringAs(options.as, options.crossOrigin);
			Internals.d.m(href, {
				as: "string" === typeof options.as && "script" !== options.as ? options.as : void 0,
				crossOrigin,
				integrity: "string" === typeof options.integrity ? options.integrity : void 0
			});
		} else Internals.d.m(href);
	};
	exports.requestFormReset = function(form) {
		Internals.d.r(form);
	};
	exports.unstable_batchedUpdates = function(fn, a) {
		return fn(a);
	};
	exports.useFormState = function(action, initialState, permalink) {
		return ReactSharedInternals.H.useFormState(action, initialState, permalink);
	};
	exports.useFormStatus = function() {
		return ReactSharedInternals.H.useHostTransitionStatus();
	};
	exports.version = "19.2.7";
}));
//#endregion
//#region node_modules/react-dom/index.js
var require_react_dom = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function checkDCE() {
		if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== "function") return;
		try {
			__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
		} catch (err) {
			console.error(err);
		}
	}
	checkDCE();
	module.exports = require_react_dom_production();
}));
var Colspan = {
	initialize: initializeState$4,
	use: useColspan,
	selectors: {}
};
function initializeState$4(_params) {
	return { colspanMap: /* @__PURE__ */ new Map() };
}
function useColspan(store, params, api) {
	const getColspan = params.colspan?.getColspan;
	const resetColSpan = () => {
		store.state.colspanMap = /* @__PURE__ */ new Map();
	};
	const getCellColSpanInfo = (rowId, columnIndex) => {
		return store.state.colspanMap.get(rowId)?.[columnIndex];
	};
	const calculateColSpan = useEventCallback(getColspan ? (rowId, minFirstColumn, maxLastColumn, columns) => {
		for (let i = minFirstColumn; i < maxLastColumn; i += 1) {
			const cellProps = calculateCellColSpan(store.state.colspanMap, i, rowId, minFirstColumn, maxLastColumn, columns, getColspan);
			if (cellProps.colSpan > 1) i += cellProps.colSpan - 1;
		}
	} : () => {});
	api.calculateColSpan = calculateColSpan;
	return {
		resetColSpan,
		getCellColSpanInfo,
		calculateColSpan
	};
}
function calculateCellColSpan(lookup, columnIndex, rowId, minFirstColumnIndex, maxLastColumnIndex, columns, getColspan) {
	const columnsLength = columns.length;
	const column = columns[columnIndex];
	const colSpan = getColspan(rowId, column, columnIndex);
	if (!colSpan || colSpan === 1) {
		setCellColSpanInfo(lookup, rowId, columnIndex, {
			spannedByColSpan: false,
			cellProps: {
				colSpan: 1,
				width: column.computedWidth
			}
		});
		return { colSpan: 1 };
	}
	let width = column.computedWidth;
	for (let j = 1; j < colSpan; j += 1) {
		const nextColumnIndex = columnIndex + j;
		if (nextColumnIndex >= minFirstColumnIndex && nextColumnIndex < maxLastColumnIndex) {
			const nextColumn = columns[nextColumnIndex];
			width += nextColumn.computedWidth;
			setCellColSpanInfo(lookup, rowId, columnIndex + j, {
				spannedByColSpan: true,
				rightVisibleCellIndex: Math.min(columnIndex + colSpan, columnsLength - 1),
				leftVisibleCellIndex: columnIndex
			});
		}
		setCellColSpanInfo(lookup, rowId, columnIndex, {
			spannedByColSpan: false,
			cellProps: {
				colSpan,
				width
			}
		});
	}
	return { colSpan };
}
function setCellColSpanInfo(colspanMap, rowId, columnIndex, cellColSpanInfo) {
	let columnInfo = colspanMap.get(rowId);
	if (!columnInfo) {
		columnInfo = {};
		colspanMap.set(rowId, columnInfo);
	}
	columnInfo[columnIndex] = cellColSpanInfo;
}
//#endregion
//#region node_modules/@mui/x-virtualizer/esm/models/core.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom());
var Size = {
	EMPTY: {
		width: 0,
		height: 0
	},
	equals: (a, b) => a.width === b.width && a.height === b.height
};
var PinnedRows = { EMPTY: {
	top: [],
	bottom: []
} };
var PinnedColumns = { EMPTY: {
	left: [],
	right: []
} };
var ScrollDirection = /*#__PURE__*/ function(ScrollDirection) {
	ScrollDirection[ScrollDirection["NONE"] = 0] = "NONE";
	ScrollDirection[ScrollDirection["UP"] = 1] = "UP";
	ScrollDirection[ScrollDirection["DOWN"] = 2] = "DOWN";
	ScrollDirection[ScrollDirection["LEFT"] = 3] = "LEFT";
	ScrollDirection[ScrollDirection["RIGHT"] = 4] = "RIGHT";
	return ScrollDirection;
}({});
(function(_ScrollDirection) {
	function forDelta(dx, dy) {
		if (dx === 0 && dy === 0) return ScrollDirection.NONE;
		if (Math.abs(dy) >= Math.abs(dx)) if (dy > 0) return ScrollDirection.DOWN;
		else return ScrollDirection.UP;
		else if (dx > 0) return ScrollDirection.RIGHT;
		else return ScrollDirection.LEFT;
	}
	_ScrollDirection.forDelta = forDelta;
})(ScrollDirection || (ScrollDirection = {}));
//#endregion
//#region node_modules/@mui/x-virtualizer/esm/features/dimensions.js
var EMPTY_DIMENSIONS = {
	isReady: false,
	root: Size.EMPTY,
	viewportOuterSize: Size.EMPTY,
	viewportInnerSize: Size.EMPTY,
	contentSize: Size.EMPTY,
	minimumSize: Size.EMPTY,
	hasScrollX: false,
	hasScrollY: false,
	scrollbarSize: 0,
	rowWidth: 0,
	rowHeight: 0,
	columnsTotalWidth: 0,
	leftPinnedWidth: 0,
	rightPinnedWidth: 0,
	topContainerHeight: 0,
	bottomContainerHeight: 0
};
var selectors$3 = {
	rootSize: (state) => state.rootSize,
	dimensions: (state) => state.dimensions,
	rowHeight: (state) => state.dimensions.rowHeight,
	contentHeight: (state) => state.dimensions.contentSize.height,
	rowsMeta: (state) => state.rowsMeta,
	columnPositions: createSelectorMemoized((_, columns) => {
		const positions = [];
		let currentPosition = 0;
		for (let i = 0; i < columns.length; i += 1) {
			positions.push(currentPosition);
			currentPosition += columns[i].computedWidth;
		}
		return positions;
	}),
	needsHorizontalScrollbar: (state) => state.dimensions.viewportOuterSize.width > 0 && state.dimensions.columnsTotalWidth > state.dimensions.viewportOuterSize.width
};
var Dimensions = {
	initialize: initializeState$3,
	use: useDimensions,
	selectors: selectors$3
};
function initializeState$3(params) {
	const dimensions = _extends({}, EMPTY_DIMENSIONS, params.dimensions);
	const { rowCount } = params;
	const { rowHeight } = dimensions;
	const rowsMeta = {
		currentPageTotalHeight: rowCount * rowHeight,
		positions: Array.from({ length: rowCount }, (_, i) => i * rowHeight),
		pinnedTopRowsTotalHeight: 0,
		pinnedBottomRowsTotalHeight: 0
	};
	const rowHeights = /* @__PURE__ */ new Map();
	return {
		rootSize: Size.EMPTY,
		dimensions,
		rowsMeta,
		rowHeights
	};
}
function useDimensions(store, params, _api) {
	const isFirstSizing = import_react.useRef(true);
	const { refs, dimensions: { rowHeight, columnsTotalWidth, leftPinnedWidth, rightPinnedWidth, topPinnedHeight, bottomPinnedHeight }, onResize } = params;
	const containerNode = refs.container.current;
	const updateDimensions = import_react.useCallback(() => {
		if (isFirstSizing.current) return;
		const rootSize = selectors$3.rootSize(store.state);
		const rowsMeta = selectors$3.rowsMeta(store.state);
		const scrollbarSize = measureScrollbarSize(containerNode, params.dimensions.scrollbarSize);
		const topContainerHeight = topPinnedHeight + rowsMeta.pinnedTopRowsTotalHeight;
		const bottomContainerHeight = bottomPinnedHeight + rowsMeta.pinnedBottomRowsTotalHeight;
		const contentSize = {
			width: columnsTotalWidth,
			height: roundToDecimalPlaces(rowsMeta.currentPageTotalHeight, 1)
		};
		let viewportOuterSize;
		let viewportInnerSize;
		let hasScrollX = false;
		let hasScrollY = false;
		if (params.autoHeight) {
			hasScrollY = false;
			hasScrollX = Math.round(columnsTotalWidth) > Math.round(rootSize.width);
			viewportOuterSize = {
				width: rootSize.width,
				height: topContainerHeight + bottomContainerHeight + contentSize.height
			};
			viewportInnerSize = {
				width: Math.max(0, viewportOuterSize.width - (hasScrollY ? scrollbarSize : 0)),
				height: Math.max(0, viewportOuterSize.height - (hasScrollX ? scrollbarSize : 0))
			};
		} else {
			viewportOuterSize = {
				width: rootSize.width,
				height: rootSize.height
			};
			viewportInnerSize = {
				width: Math.max(0, viewportOuterSize.width),
				height: Math.max(0, viewportOuterSize.height - topContainerHeight - bottomContainerHeight)
			};
			const content = contentSize;
			const container = viewportInnerSize;
			const hasScrollXIfNoYScrollBar = content.width > container.width;
			const hasScrollYIfNoXScrollBar = content.height > container.height;
			if (hasScrollXIfNoYScrollBar || hasScrollYIfNoXScrollBar) {
				hasScrollY = hasScrollYIfNoXScrollBar;
				hasScrollX = content.width + (hasScrollY ? scrollbarSize : 0) > container.width;
				if (hasScrollX) hasScrollY = content.height + scrollbarSize > container.height;
			}
			if (hasScrollY) viewportInnerSize.width -= scrollbarSize;
			if (hasScrollX) viewportInnerSize.height -= scrollbarSize;
		}
		if (params.disableHorizontalScroll) hasScrollX = false;
		if (params.disableVerticalScroll) hasScrollY = false;
		const rowWidth = Math.max(viewportOuterSize.width, columnsTotalWidth + (hasScrollY ? scrollbarSize : 0));
		const minimumSize = {
			width: columnsTotalWidth,
			height: topContainerHeight + contentSize.height + bottomContainerHeight
		};
		const newDimensions = {
			isReady: true,
			root: rootSize,
			viewportOuterSize,
			viewportInnerSize,
			contentSize,
			minimumSize,
			hasScrollX,
			hasScrollY,
			scrollbarSize,
			rowWidth,
			rowHeight,
			columnsTotalWidth,
			leftPinnedWidth,
			rightPinnedWidth,
			topContainerHeight,
			bottomContainerHeight
		};
		const prevDimensions = store.state.dimensions;
		if (isDeepEqual(prevDimensions, newDimensions)) return;
		store.update({ dimensions: newDimensions });
		onResize?.(newDimensions.root);
	}, [
		store,
		containerNode,
		params.dimensions.scrollbarSize,
		params.autoHeight,
		params.disableHorizontalScroll,
		params.disableVerticalScroll,
		onResize,
		rowHeight,
		columnsTotalWidth,
		leftPinnedWidth,
		rightPinnedWidth,
		topPinnedHeight,
		bottomPinnedHeight
	]);
	const { resizeThrottleMs } = params;
	const updateDimensionCallback = useEventCallback(updateDimensions);
	const debouncedUpdateDimensions = import_react.useMemo(() => resizeThrottleMs > 0 ? throttle(updateDimensionCallback, resizeThrottleMs) : void 0, [resizeThrottleMs, updateDimensionCallback]);
	import_react.useEffect(() => debouncedUpdateDimensions?.clear, [debouncedUpdateDimensions]);
	const setRootSize = useEventCallback((rootSize) => {
		store.state.rootSize = rootSize;
		if (isFirstSizing.current || !debouncedUpdateDimensions) {
			isFirstSizing.current = false;
			updateDimensions();
		} else debouncedUpdateDimensions();
	});
	useEnhancedEffect(() => observeRootNode(containerNode, store, setRootSize), [
		containerNode,
		store,
		setRootSize
	]);
	useEnhancedEffect(updateDimensions, [updateDimensions]);
	return {
		updateDimensions,
		debouncedUpdateDimensions,
		rowsMeta: useRowsMeta(store, params, updateDimensions)
	};
}
function useRowsMeta(store, params, updateDimensions) {
	const heightCache = store.state.rowHeights;
	const { rows, getRowHeight: getRowHeightProp, getRowSpacing, getEstimatedRowHeight } = params;
	const lastMeasuredRowIndex = import_react.useRef(-1);
	const hasRowWithAutoHeight = import_react.useRef(false);
	const isHeightMetaValid = import_react.useRef(false);
	const pinnedRows = params.pinnedRows;
	const rowHeight = useStore(store, selectors$3.rowHeight);
	const getRowHeightEntry = useEventCallback((rowId) => {
		let entry = heightCache.get(rowId);
		if (entry === void 0) {
			entry = {
				content: store.state.dimensions.rowHeight,
				spacingTop: 0,
				spacingBottom: 0,
				detail: 0,
				autoHeight: false,
				needsFirstMeasurement: true
			};
			heightCache.set(rowId, entry);
		}
		return entry;
	});
	const { applyRowHeight } = params;
	const processHeightEntry = import_react.useCallback((row) => {
		const dimensions = selectors$3.dimensions(store.state);
		const baseRowHeight = dimensions.rowHeight;
		const entry = getRowHeightEntry(row.id);
		if (!getRowHeightProp) {
			entry.content = baseRowHeight;
			entry.needsFirstMeasurement = false;
		} else {
			const rowHeightFromUser = getRowHeightProp(row);
			if (rowHeightFromUser === "auto") {
				if (entry.needsFirstMeasurement) entry.content = (getEstimatedRowHeight ? getEstimatedRowHeight(row) : baseRowHeight) ?? baseRowHeight;
				hasRowWithAutoHeight.current = true;
				entry.autoHeight = true;
			} else {
				entry.content = rowHeightFromUser ?? dimensions.rowHeight;
				entry.needsFirstMeasurement = false;
				entry.autoHeight = false;
			}
		}
		if (getRowSpacing) {
			const spacing = getRowSpacing(row);
			entry.spacingTop = spacing.top ?? 0;
			entry.spacingBottom = spacing.bottom ?? 0;
		} else {
			entry.spacingTop = 0;
			entry.spacingBottom = 0;
		}
		applyRowHeight?.(entry, row);
		return entry;
	}, [
		store,
		getRowHeightProp,
		getRowHeightEntry,
		getEstimatedRowHeight,
		rowHeight,
		getRowSpacing,
		applyRowHeight
	]);
	const hydrateRowsMeta = import_react.useCallback(() => {
		hasRowWithAutoHeight.current = false;
		const pinnedTopRowsTotalHeight = pinnedRows?.top.reduce((acc, row) => {
			const entry = processHeightEntry(row);
			return acc + entry.content + entry.spacingTop + entry.spacingBottom + entry.detail;
		}, 0) ?? 0;
		const pinnedBottomRowsTotalHeight = pinnedRows?.bottom.reduce((acc, row) => {
			const entry = processHeightEntry(row);
			return acc + entry.content + entry.spacingTop + entry.spacingBottom + entry.detail;
		}, 0) ?? 0;
		const positions = [];
		const currentPageTotalHeight = rows.reduce((acc, row) => {
			positions.push(acc);
			const entry = processHeightEntry(row);
			return acc + (entry.content + entry.spacingTop + entry.spacingBottom + entry.detail);
		}, 0);
		if (!hasRowWithAutoHeight.current) lastMeasuredRowIndex.current = Infinity;
		const didHeightsChange = pinnedTopRowsTotalHeight !== store.state.rowsMeta.pinnedTopRowsTotalHeight || pinnedBottomRowsTotalHeight !== store.state.rowsMeta.pinnedBottomRowsTotalHeight || currentPageTotalHeight !== store.state.rowsMeta.currentPageTotalHeight;
		const rowsMeta = {
			currentPageTotalHeight,
			positions,
			pinnedTopRowsTotalHeight,
			pinnedBottomRowsTotalHeight
		};
		store.set("rowsMeta", rowsMeta);
		if (didHeightsChange) updateDimensions();
		isHeightMetaValid.current = true;
	}, [
		store,
		pinnedRows,
		rows,
		processHeightEntry,
		updateDimensions
	]);
	const hydrateRowsMetaLatest = useEventCallback(hydrateRowsMeta);
	const getRowHeight = (rowId) => {
		return heightCache.get(rowId)?.content ?? selectors$3.rowHeight(store.state);
	};
	const storeRowHeightMeasurement = (id, height) => {
		const entry = getRowHeightEntry(id);
		const didChange = entry.content !== height;
		entry.needsFirstMeasurement = false;
		entry.content = height;
		isHeightMetaValid.current &&= !didChange;
	};
	const rowHasAutoHeight = (id) => {
		return heightCache.get(id)?.autoHeight ?? false;
	};
	const getLastMeasuredRowIndex = () => {
		return lastMeasuredRowIndex.current;
	};
	const setLastMeasuredRowIndex = (index) => {
		if (hasRowWithAutoHeight.current && index > lastMeasuredRowIndex.current) lastMeasuredRowIndex.current = index;
	};
	const resetRowHeights = () => {
		heightCache.clear();
		hydrateRowsMeta();
	};
	const resizeObserver = useLazyRef(() => typeof ResizeObserver === "undefined" ? void 0 : new ResizeObserver((entries) => {
		for (let i = 0; i < entries.length; i += 1) {
			const entry = entries[i];
			const height = entry.borderBoxSize && entry.borderBoxSize.length > 0 ? entry.borderBoxSize[0].blockSize : entry.contentRect.height;
			const rowId = entry.target.__mui_id;
			if (params.focusedVirtualCell?.()?.id === rowId && height === 0) return;
			storeRowHeightMeasurement(rowId, height);
		}
		if (!isHeightMetaValid.current) requestAnimationFrame(() => {
			hydrateRowsMetaLatest();
		});
	})).current;
	const observeRowHeight = (element, rowId) => {
		element.__mui_id = rowId;
		resizeObserver?.observe(element);
		return () => resizeObserver?.unobserve(element);
	};
	useEnhancedEffect(() => {
		hydrateRowsMeta();
	}, [hydrateRowsMeta]);
	return {
		getRowHeight,
		setLastMeasuredRowIndex,
		storeRowHeightMeasurement,
		hydrateRowsMeta,
		observeRowHeight,
		rowHasAutoHeight,
		getRowHeightEntry,
		getLastMeasuredRowIndex,
		resetRowHeights
	};
}
function observeRootNode(node, store, setRootSize) {
	if (!node) return;
	const bounds = node.getBoundingClientRect();
	const initialSize = {
		width: roundToDecimalPlaces(bounds.width, 1),
		height: roundToDecimalPlaces(bounds.height, 1)
	};
	if (store.state.rootSize === Size.EMPTY || !Size.equals(initialSize, store.state.rootSize)) setRootSize(initialSize);
	if (typeof ResizeObserver === "undefined") return;
	const observer = new ResizeObserver(([entry]) => {
		if (!entry) return;
		const rootSize = {
			width: roundToDecimalPlaces(entry.contentRect.width, 1),
			height: roundToDecimalPlaces(entry.contentRect.height, 1)
		};
		if (!Size.equals(rootSize, store.state.rootSize)) setRootSize(rootSize);
	});
	observer.observe(node);
	return () => {
		observer.disconnect();
	};
}
var scrollbarSizeCache = /* @__PURE__ */ new WeakMap();
function measureScrollbarSize(element, scrollbarSize) {
	if (scrollbarSize !== void 0) return scrollbarSize;
	if (element === null) return 0;
	const cachedSize = scrollbarSizeCache.get(element);
	if (cachedSize !== void 0) return cachedSize;
	const scrollDiv = ownerDocument(element).createElement("div");
	scrollDiv.style.width = "99px";
	scrollDiv.style.height = "99px";
	scrollDiv.style.position = "absolute";
	scrollDiv.style.overflow = "scroll";
	scrollDiv.className = "scrollDiv";
	element.appendChild(scrollDiv);
	const size = scrollDiv.offsetWidth - scrollDiv.clientWidth;
	element.removeChild(scrollDiv);
	scrollbarSizeCache.set(element, size);
	return size;
}
//#endregion
//#region node_modules/@mui/x-virtualizer/esm/features/virtualization.js
var clamp = (value, min, max) => Math.max(min, Math.min(max, value));
var MINIMUM_COLUMN_WIDTH = 50;
var EMPTY_SCROLL_POSITION = {
	top: 0,
	left: 0
};
var EMPTY_DETAIL_PANELS = Object.freeze(/* @__PURE__ */ new Map());
var EMPTY_RENDER_CONTEXT = {
	firstRowIndex: 0,
	lastRowIndex: 0,
	firstColumnIndex: 0,
	lastColumnIndex: 0
};
var selectors$2 = {
	renderContext: createSelector((state) => state.virtualization.renderContext),
	enabledForRows: createSelector((state) => state.virtualization.enabledForRows),
	enabledForColumns: createSelector((state) => state.virtualization.enabledForColumns)
};
var Virtualization = {
	initialize: initializeState$2,
	use: useVirtualization,
	selectors: selectors$2
};
function initializeState$2(params) {
	return {
		virtualization: _extends({
			enabled: !isJSDOM,
			enabledForRows: !isJSDOM,
			enabledForColumns: !isJSDOM,
			renderContext: EMPTY_RENDER_CONTEXT
		}, params.initialState?.virtualization),
		getters: null
	};
}
/** APIs to override for colspan/rowspan */
function useVirtualization(store, params, api) {
	const { refs, dimensions: { rowHeight, columnsTotalWidth }, virtualization: { isRtl = false, rowBufferPx = 150, columnBufferPx = 150 }, colspan, initialState, rows, range, columns, pinnedRows = PinnedRows.EMPTY, pinnedColumns = PinnedColumns.EMPTY, minimalContentHeight, autoHeight, onWheel, onTouchMove, onRenderContextChange, onScrollChange, scrollReset, renderRow, renderInfiniteLoadingTrigger } = params;
	const needsHorizontalScrollbar = useStore(store, Dimensions.selectors.needsHorizontalScrollbar);
	const hasBottomPinnedRows = pinnedRows.bottom.length > 0;
	const [panels, setPanels] = import_react.useState(EMPTY_DETAIL_PANELS);
	const [, setRefTick] = import_react.useState(0);
	const isRenderContextReady = import_react.useRef(false);
	const renderContext = useStore(store, selectors$2.renderContext);
	const enabledForRows = useStore(store, selectors$2.enabledForRows);
	const enabledForColumns = useStore(store, selectors$2.enabledForColumns);
	const rowsMeta = useStore(store, Dimensions.selectors.rowsMeta);
	const contentHeight = useStore(store, Dimensions.selectors.contentHeight);
	const scrollPosition = import_react.useRef(initialState?.scroll ?? EMPTY_SCROLL_POSITION);
	const ignoreNextScrollEvent = import_react.useRef(false);
	const previousContextScrollPosition = import_react.useRef(EMPTY_SCROLL_POSITION);
	const previousRowContext = import_react.useRef(EMPTY_RENDER_CONTEXT);
	const scrollTimeout = useTimeout();
	const frozenContext = import_react.useRef(void 0);
	const scrollCache = useLazyRef(() => createScrollCache(isRtl, rowBufferPx, columnBufferPx, rowHeight * 15, MINIMUM_COLUMN_WIDTH * 6)).current;
	const updateRenderContext = import_react.useCallback((nextRenderContext) => {
		if (!areRenderContextsEqual(nextRenderContext, store.state.virtualization.renderContext)) store.set("virtualization", _extends({}, store.state.virtualization, { renderContext: nextRenderContext }));
		const isReady = Dimensions.selectors.dimensions(store.state).isReady;
		const didRowsIntervalChange = nextRenderContext.firstRowIndex !== previousRowContext.current.firstRowIndex || nextRenderContext.lastRowIndex !== previousRowContext.current.lastRowIndex;
		if (isReady && didRowsIntervalChange) {
			previousRowContext.current = nextRenderContext;
			onRenderContextChange?.(nextRenderContext);
		}
		previousContextScrollPosition.current = scrollPosition.current;
	}, [store, onRenderContextChange]);
	const triggerUpdateRenderContext = useEventCallback(() => {
		const scroller = refs.scroller.current;
		if (!scroller) return;
		const dimensions = Dimensions.selectors.dimensions(store.state);
		const maxScrollTop = Math.ceil(dimensions.contentSize.height - dimensions.viewportInnerSize.height);
		const maxScrollLeft = Math.ceil(dimensions.contentSize.width - dimensions.viewportInnerSize.width);
		const newScroll = {
			top: clamp(scroller.scrollTop, 0, maxScrollTop),
			left: isRtl ? clamp(scroller.scrollLeft, -maxScrollLeft, 0) : clamp(scroller.scrollLeft, 0, maxScrollLeft)
		};
		const dx = newScroll.left - scrollPosition.current.left;
		const dy = newScroll.top - scrollPosition.current.top;
		const isScrolling = dx !== 0 || dy !== 0;
		scrollPosition.current = newScroll;
		const direction = isScrolling ? ScrollDirection.forDelta(dx, dy) : ScrollDirection.NONE;
		const rowScroll = Math.abs(scrollPosition.current.top - previousContextScrollPosition.current.top);
		const columnScroll = Math.abs(scrollPosition.current.left - previousContextScrollPosition.current.left);
		const didCrossThreshold = rowScroll >= rowHeight || columnScroll >= MINIMUM_COLUMN_WIDTH;
		const didChangeDirection = scrollCache.direction !== direction;
		if (!(didCrossThreshold || didChangeDirection)) return renderContext;
		if (didChangeDirection) switch (direction) {
			case ScrollDirection.NONE:
			case ScrollDirection.LEFT:
			case ScrollDirection.RIGHT:
				frozenContext.current = void 0;
				break;
			default:
				frozenContext.current = renderContext;
				break;
		}
		scrollCache.direction = direction;
		scrollCache.buffer = bufferForDirection(isRtl, direction, rowBufferPx, columnBufferPx, rowHeight * 15, MINIMUM_COLUMN_WIDTH * 6);
		const nextRenderContext = computeRenderContext(inputsSelector(store, params, api, enabledForRows, enabledForColumns), scrollPosition.current, scrollCache);
		if (!areRenderContextsEqual(nextRenderContext, renderContext)) {
			import_react_dom.flushSync(() => {
				updateRenderContext(nextRenderContext);
			});
			scrollTimeout.start(1e3, triggerUpdateRenderContext);
		}
		return nextRenderContext;
	});
	const forceUpdateRenderContext = useEventCallback(() => {
		if (!Dimensions.selectors.dimensions(store.state).isReady && (enabledForRows || enabledForColumns)) return;
		const nextRenderContext = computeRenderContext(inputsSelector(store, params, api, enabledForRows, enabledForColumns), scrollPosition.current, scrollCache);
		frozenContext.current = void 0;
		updateRenderContext(nextRenderContext);
	});
	const handleScroll = useEventCallback(() => {
		if (ignoreNextScrollEvent.current) {
			ignoreNextScrollEvent.current = false;
			return;
		}
		const nextRenderContext = triggerUpdateRenderContext();
		if (nextRenderContext) onScrollChange?.(scrollPosition.current, nextRenderContext);
	});
	const getOffsetTop = () => {
		return rowsMeta.positions[renderContext.firstRowIndex] ?? 0;
	};
	/**
	* HACK: unstable_rowTree fixes the issue described below, but does it by tightly coupling this
	* section of code to the DataGrid's rowTree model. The `unstable_rowTree` param is a temporary
	* solution to decouple the code.
	*/
	const getRows = (rowParams = {}, unstable_rowTree) => {
		if (!rowParams.rows && !range) return [];
		let baseRenderContext = renderContext;
		if (rowParams.renderContext) {
			baseRenderContext = rowParams.renderContext;
			baseRenderContext.firstColumnIndex = renderContext.firstColumnIndex;
			baseRenderContext.lastColumnIndex = renderContext.lastColumnIndex;
		}
		const isLastSection = !hasBottomPinnedRows && rowParams.position === void 0 || hasBottomPinnedRows && rowParams.position === "bottom";
		const isPinnedSection = rowParams.position !== void 0;
		let rowIndexOffset;
		switch (rowParams.position) {
			case "top":
				rowIndexOffset = 0;
				break;
			case "bottom":
				rowIndexOffset = pinnedRows.top.length + rows.length;
				break;
			case void 0:
			default:
				rowIndexOffset = pinnedRows.top.length;
				break;
		}
		const rowModels = rowParams.rows ?? rows;
		const firstRowToRender = baseRenderContext.firstRowIndex;
		const lastRowToRender = Math.min(baseRenderContext.lastRowIndex, rowModels.length);
		const rowIndexes = rowParams.rows ? createRange(0, rowParams.rows.length) : createRange(firstRowToRender, lastRowToRender);
		let virtualRowIndex = -1;
		const focusedVirtualCell = params.focusedVirtualCell?.();
		if (!isPinnedSection && focusedVirtualCell) {
			if (focusedVirtualCell.rowIndex < firstRowToRender) {
				rowIndexes.unshift(focusedVirtualCell.rowIndex);
				virtualRowIndex = focusedVirtualCell.rowIndex;
			}
			if (focusedVirtualCell.rowIndex > lastRowToRender) {
				rowIndexes.push(focusedVirtualCell.rowIndex);
				virtualRowIndex = focusedVirtualCell.rowIndex;
			}
		}
		const rowElements = [];
		const columnPositions = Dimensions.selectors.columnPositions(store.state, columns);
		rowIndexes.forEach((rowIndexInPage) => {
			const { id, model } = rowModels[rowIndexInPage];
			if (unstable_rowTree && !unstable_rowTree[id]) return;
			const rowIndex = (range?.firstRowIndex || 0) + rowIndexOffset + rowIndexInPage;
			if (colspan?.enabled) {
				const minFirstColumn = pinnedColumns.left.length;
				const maxLastColumn = columns.length - pinnedColumns.right.length;
				api.calculateColSpan(id, minFirstColumn, maxLastColumn, columns);
				if (pinnedColumns.left.length > 0) api.calculateColSpan(id, 0, pinnedColumns.left.length, columns);
				if (pinnedColumns.right.length > 0) api.calculateColSpan(id, columns.length - pinnedColumns.right.length, columns.length, columns);
			}
			const baseRowHeight = !api.rowsMeta.rowHasAutoHeight(id) ? api.rowsMeta.getRowHeight(id) : "auto";
			let isFirstVisible = false;
			if (rowParams.position === void 0) isFirstVisible = rowIndexInPage === 0;
			let isLastVisible = false;
			const isLastVisibleInSection = rowIndexInPage === rowModels.length - 1;
			if (isLastSection) if (!isPinnedSection) {
				if (rowIndexInPage === rows.length - 1) isLastVisible = true;
			} else isLastVisible = isLastVisibleInSection;
			let currentRenderContext = baseRenderContext;
			if (frozenContext.current && rowIndexInPage >= frozenContext.current.firstRowIndex && rowIndexInPage < frozenContext.current.lastRowIndex) currentRenderContext = frozenContext.current;
			const isVirtualFocusRow = rowIndexInPage === virtualRowIndex;
			const isVirtualFocusColumn = focusedVirtualCell?.rowIndex === rowIndex;
			const offsetLeft = computeOffsetLeft(columnPositions, currentRenderContext, pinnedColumns.left.length);
			const showBottomBorder = isLastVisibleInSection && rowParams.position === "top";
			const firstColumnIndex = currentRenderContext.firstColumnIndex;
			const lastColumnIndex = currentRenderContext.lastColumnIndex;
			rowElements.push(renderRow({
				id,
				model,
				rowIndex,
				offsetLeft,
				columnsTotalWidth,
				baseRowHeight,
				firstColumnIndex,
				lastColumnIndex,
				focusedColumnIndex: isVirtualFocusColumn ? focusedVirtualCell.columnIndex : void 0,
				isFirstVisible,
				isLastVisible,
				isVirtualFocusRow,
				showBottomBorder
			}));
			if (isVirtualFocusRow) return;
			const panel = panels.get(id);
			if (panel) rowElements.push(panel);
			if (rowParams.position === void 0 && isLastVisibleInSection) rowElements.push(renderInfiniteLoadingTrigger(id));
		});
		return rowElements;
	};
	const scrollerStyle = import_react.useMemo(() => ({
		overflowX: !needsHorizontalScrollbar ? "hidden" : void 0,
		overflowY: autoHeight ? "hidden" : void 0
	}), [needsHorizontalScrollbar, autoHeight]);
	const contentSize = import_react.useMemo(() => {
		const size = {
			width: needsHorizontalScrollbar ? columnsTotalWidth : "auto",
			flexBasis: contentHeight,
			flexShrink: 0
		};
		if (size.flexBasis === 0) size.flexBasis = minimalContentHeight;
		return size;
	}, [
		columnsTotalWidth,
		contentHeight,
		needsHorizontalScrollbar,
		minimalContentHeight
	]);
	const scrollRestoreCallback = import_react.useRef(null);
	const contentNodeRef = import_react.useCallback((node) => {
		if (!node) return;
		scrollRestoreCallback.current?.(columnsTotalWidth, contentHeight);
	}, [columnsTotalWidth, contentHeight]);
	useEnhancedEffect(() => {
		if (!isRenderContextReady.current) return;
		forceUpdateRenderContext();
	}, [
		enabledForColumns,
		enabledForRows,
		forceUpdateRenderContext
	]);
	useEnhancedEffect(() => {
		if (refs.scroller.current) refs.scroller.current.scrollLeft = 0;
	}, [refs.scroller, scrollReset]);
	useRunOnce(renderContext !== EMPTY_RENDER_CONTEXT, () => {
		onScrollChange?.(scrollPosition.current, renderContext);
		isRenderContextReady.current = true;
		if (initialState?.scroll && refs.scroller.current) {
			const scroller = refs.scroller.current;
			const { top, left } = initialState.scroll;
			const isScrollRestored = {
				top: !(top > 0),
				left: !(left > 0)
			};
			if (!isScrollRestored.left && columnsTotalWidth) {
				scroller.scrollLeft = left;
				isScrollRestored.left = true;
				ignoreNextScrollEvent.current = true;
			}
			if (!isScrollRestored.top && contentHeight) {
				scroller.scrollTop = top;
				ignoreNextScrollEvent.current = true;
			}
			if (!isScrollRestored.top || !isScrollRestored.left) scrollRestoreCallback.current = (columnsTotalWidthCurrent, contentHeightCurrent) => {
				if (!isScrollRestored.left && columnsTotalWidthCurrent) {
					scroller.scrollLeft = left;
					isScrollRestored.left = true;
					ignoreNextScrollEvent.current = true;
				}
				if (!isScrollRestored.top && contentHeightCurrent) {
					scroller.scrollTop = top;
					isScrollRestored.top = true;
					ignoreNextScrollEvent.current = true;
				}
				if (isScrollRestored.left && isScrollRestored.top) scrollRestoreCallback.current = null;
			};
		}
	});
	useStoreEffect(store, Dimensions.selectors.dimensions, forceUpdateRenderContext);
	const refSetter = (name) => (node) => {
		if (node && refs[name].current !== node) {
			refs[name].current = node;
			setRefTick((tick) => tick + 1);
		}
	};
	const getters = {
		setPanels,
		getOffsetTop,
		getRows,
		getContainerProps: () => ({ ref: refSetter("container") }),
		getScrollerProps: () => ({
			ref: refSetter("scroller"),
			onScroll: handleScroll,
			onWheel,
			onTouchMove,
			style: scrollerStyle,
			role: "presentation",
			tabIndex: isFirefox ? -1 : void 0
		}),
		getContentProps: () => ({
			ref: contentNodeRef,
			style: contentSize,
			role: "presentation"
		}),
		getScrollbarVerticalProps: () => ({
			ref: refSetter("scrollbarVertical"),
			scrollPosition
		}),
		getScrollbarHorizontalProps: () => ({
			ref: refSetter("scrollbarHorizontal"),
			scrollPosition
		}),
		getScrollAreaProps: () => ({ scrollPosition })
	};
	useFirstRender(() => {
		store.state = _extends({}, store.state, { getters });
	});
	import_react.useEffect(() => {
		store.update({ getters });
	}, Object.values(getters));
	const getCellColSpanInfo = () => {
		throw new Error("Unimplemented: colspan feature is required");
	};
	const calculateColSpan = () => {
		throw new Error("Unimplemented: colspan feature is required");
	};
	const getHiddenCellsOrigin = () => {
		throw new Error("Unimplemented: rowspan feature is required");
	};
	return {
		getters,
		useVirtualization: () => useStore(store, (state) => state),
		setPanels,
		forceUpdateRenderContext,
		getCellColSpanInfo,
		calculateColSpan,
		getHiddenCellsOrigin
	};
}
function inputsSelector(store, params, api, enabledForRows, enabledForColumns) {
	const dimensions = Dimensions.selectors.dimensions(store.state);
	const rows = params.rows;
	const range = params.range;
	const columns = params.columns;
	const hiddenCellsOriginMap = api.getHiddenCellsOrigin();
	const lastRowId = params.rows.at(-1)?.id;
	const lastColumn = columns.at(-1);
	return {
		api,
		enabledForRows,
		enabledForColumns,
		autoHeight: params.autoHeight,
		rowBufferPx: params.virtualization.rowBufferPx,
		columnBufferPx: params.virtualization.columnBufferPx,
		leftPinnedWidth: dimensions.leftPinnedWidth,
		columnsTotalWidth: dimensions.columnsTotalWidth,
		viewportInnerWidth: dimensions.viewportInnerSize.width,
		viewportInnerHeight: dimensions.viewportInnerSize.height,
		lastRowHeight: lastRowId !== void 0 ? api.rowsMeta.getRowHeight(lastRowId) : 0,
		lastColumnWidth: lastColumn?.computedWidth ?? 0,
		rowsMeta: Dimensions.selectors.rowsMeta(store.state),
		columnPositions: Dimensions.selectors.columnPositions(store.state, params.columns),
		rows,
		range,
		pinnedColumns: params.pinnedColumns,
		columns,
		hiddenCellsOriginMap,
		virtualizeColumnsWithAutoRowHeight: params.virtualizeColumnsWithAutoRowHeight
	};
}
function computeRenderContext(inputs, scrollPosition, scrollCache) {
	const renderContext = {
		firstRowIndex: 0,
		lastRowIndex: inputs.rows.length,
		firstColumnIndex: 0,
		lastColumnIndex: inputs.columns.length
	};
	const { top, left } = scrollPosition;
	const realLeft = Math.abs(left) + inputs.leftPinnedWidth;
	if (inputs.enabledForRows) {
		let firstRowIndex = Math.min(getNearestIndexToRender(inputs, top, {
			atStart: true,
			lastPosition: inputs.rowsMeta.positions[inputs.rowsMeta.positions.length - 1] + inputs.lastRowHeight
		}), inputs.rowsMeta.positions.length - 1);
		const rowSpanHiddenCellOrigin = inputs.hiddenCellsOriginMap[firstRowIndex];
		if (rowSpanHiddenCellOrigin) {
			const minSpannedRowIndex = Math.min(...Object.values(rowSpanHiddenCellOrigin));
			firstRowIndex = Math.min(firstRowIndex, minSpannedRowIndex);
		}
		const lastRowIndex = inputs.autoHeight ? firstRowIndex + inputs.rows.length : getNearestIndexToRender(inputs, top + inputs.viewportInnerHeight);
		renderContext.firstRowIndex = firstRowIndex;
		renderContext.lastRowIndex = lastRowIndex;
	}
	if (inputs.enabledForColumns) {
		let firstColumnIndex = 0;
		let lastColumnIndex = inputs.columnPositions.length;
		let hasRowWithAutoHeight = false;
		const [firstRowToRender, lastRowToRender] = getIndexesToRender({
			firstIndex: renderContext.firstRowIndex,
			lastIndex: renderContext.lastRowIndex,
			minFirstIndex: 0,
			maxLastIndex: inputs.rows.length,
			bufferBefore: scrollCache.buffer.rowBefore,
			bufferAfter: scrollCache.buffer.rowAfter,
			positions: inputs.rowsMeta.positions,
			lastSize: inputs.lastRowHeight
		});
		if (!inputs.virtualizeColumnsWithAutoRowHeight) for (let i = firstRowToRender; i < lastRowToRender && !hasRowWithAutoHeight; i += 1) {
			const row = inputs.rows[i];
			hasRowWithAutoHeight = inputs.api.rowsMeta.rowHasAutoHeight(row.id);
		}
		if (!hasRowWithAutoHeight || inputs.virtualizeColumnsWithAutoRowHeight) {
			firstColumnIndex = binarySearch(realLeft, inputs.columnPositions, {
				atStart: true,
				lastPosition: inputs.columnsTotalWidth
			});
			lastColumnIndex = binarySearch(realLeft + inputs.viewportInnerWidth, inputs.columnPositions);
		}
		renderContext.firstColumnIndex = firstColumnIndex;
		renderContext.lastColumnIndex = lastColumnIndex;
	}
	return deriveRenderContext(inputs, renderContext, scrollCache);
}
function getNearestIndexToRender(inputs, offset, options) {
	const lastMeasuredIndexRelativeToAllRows = inputs.api.rowsMeta.getLastMeasuredRowIndex();
	let allRowsMeasured = lastMeasuredIndexRelativeToAllRows === Infinity;
	if (inputs.range?.lastRowIndex && !allRowsMeasured) allRowsMeasured = lastMeasuredIndexRelativeToAllRows >= inputs.range.lastRowIndex;
	const lastMeasuredIndexRelativeToCurrentPage = clamp(lastMeasuredIndexRelativeToAllRows - (inputs.range?.firstRowIndex || 0), 0, inputs.rowsMeta.positions.length);
	if (allRowsMeasured || inputs.rowsMeta.positions[lastMeasuredIndexRelativeToCurrentPage] >= offset) return binarySearch(offset, inputs.rowsMeta.positions, options);
	return exponentialSearch(offset, inputs.rowsMeta.positions, lastMeasuredIndexRelativeToCurrentPage, options);
}
/**
* Accepts as input a raw render context (the area visible in the viewport) and adds
* computes the actual render context based on pinned elements, buffer dimensions and
* spanning.
*/
function deriveRenderContext(inputs, nextRenderContext, scrollCache) {
	const [firstRowToRender, lastRowToRender] = getIndexesToRender({
		firstIndex: nextRenderContext.firstRowIndex,
		lastIndex: nextRenderContext.lastRowIndex,
		minFirstIndex: 0,
		maxLastIndex: inputs.rows.length,
		bufferBefore: scrollCache.buffer.rowBefore,
		bufferAfter: scrollCache.buffer.rowAfter,
		positions: inputs.rowsMeta.positions,
		lastSize: inputs.lastRowHeight
	});
	const [initialFirstColumnToRender, lastColumnToRender] = getIndexesToRender({
		firstIndex: nextRenderContext.firstColumnIndex,
		lastIndex: nextRenderContext.lastColumnIndex,
		minFirstIndex: inputs.pinnedColumns?.left.length ?? 0,
		maxLastIndex: inputs.columns.length - (inputs.pinnedColumns?.right.length ?? 0),
		bufferBefore: scrollCache.buffer.columnBefore,
		bufferAfter: scrollCache.buffer.columnAfter,
		positions: inputs.columnPositions,
		lastSize: inputs.lastColumnWidth
	});
	return {
		firstRowIndex: firstRowToRender,
		lastRowIndex: lastRowToRender,
		firstColumnIndex: getFirstNonSpannedColumnToRender({
			api: inputs.api,
			firstColumnToRender: initialFirstColumnToRender,
			firstRowToRender,
			lastRowToRender,
			visibleRows: inputs.rows
		}),
		lastColumnIndex: lastColumnToRender
	};
}
/**
* Use binary search to avoid looping through all possible positions.
* The `options.atStart` provides the possibility to match for the first element that
* intersects the screen, even if said element's start position is before `offset`. In
* other words, we search for `offset + width`.
*/
function binarySearch(offset, positions, options = void 0, sliceStart = 0, sliceEnd = positions.length) {
	if (positions.length <= 0) return -1;
	if (sliceStart >= sliceEnd) return sliceStart;
	const pivot = sliceStart + Math.floor((sliceEnd - sliceStart) / 2);
	const position = positions[pivot];
	let isBefore;
	if (options?.atStart) isBefore = offset - ((pivot === positions.length - 1 ? options.lastPosition : positions[pivot + 1]) - position) < position;
	else isBefore = offset <= position;
	return isBefore ? binarySearch(offset, positions, options, sliceStart, pivot) : binarySearch(offset, positions, options, pivot + 1, sliceEnd);
}
function exponentialSearch(offset, positions, index, options = void 0) {
	let interval = 1;
	while (index < positions.length && Math.abs(positions[index]) < offset) {
		index += interval;
		interval *= 2;
	}
	return binarySearch(offset, positions, options, Math.floor(index / 2), Math.min(index, positions.length));
}
function getIndexesToRender({ firstIndex, lastIndex, bufferBefore, bufferAfter, minFirstIndex, maxLastIndex, positions, lastSize }) {
	const firstPosition = positions[firstIndex] - bufferBefore;
	const lastPosition = positions[lastIndex] + bufferAfter;
	const firstIndexPadded = binarySearch(firstPosition, positions, {
		atStart: true,
		lastPosition: positions[positions.length - 1] + lastSize
	});
	const lastIndexPadded = binarySearch(lastPosition, positions);
	return [clamp(firstIndexPadded, minFirstIndex, maxLastIndex), clamp(lastIndexPadded, minFirstIndex, maxLastIndex)];
}
function areRenderContextsEqual(context1, context2) {
	if (context1 === context2) return true;
	return context1.firstRowIndex === context2.firstRowIndex && context1.lastRowIndex === context2.lastRowIndex && context1.firstColumnIndex === context2.firstColumnIndex && context1.lastColumnIndex === context2.lastColumnIndex;
}
function computeOffsetLeft(columnPositions, renderContext, pinnedLeftLength) {
	const left = (columnPositions[renderContext.firstColumnIndex] ?? 0) - (columnPositions[pinnedLeftLength] ?? 0);
	return Math.abs(left);
}
function bufferForDirection(isRtl, direction, rowBufferPx, columnBufferPx, verticalBuffer, horizontalBuffer) {
	if (isRtl) switch (direction) {
		case ScrollDirection.LEFT:
			direction = ScrollDirection.RIGHT;
			break;
		case ScrollDirection.RIGHT:
			direction = ScrollDirection.LEFT;
			break;
		default:
	}
	switch (direction) {
		case ScrollDirection.NONE: return {
			rowAfter: rowBufferPx,
			rowBefore: rowBufferPx,
			columnAfter: columnBufferPx,
			columnBefore: columnBufferPx
		};
		case ScrollDirection.LEFT: return {
			rowAfter: 0,
			rowBefore: 0,
			columnAfter: 0,
			columnBefore: horizontalBuffer
		};
		case ScrollDirection.RIGHT: return {
			rowAfter: 0,
			rowBefore: 0,
			columnAfter: horizontalBuffer,
			columnBefore: 0
		};
		case ScrollDirection.UP: return {
			rowAfter: 0,
			rowBefore: verticalBuffer,
			columnAfter: 0,
			columnBefore: 0
		};
		case ScrollDirection.DOWN: return {
			rowAfter: verticalBuffer,
			rowBefore: 0,
			columnAfter: 0,
			columnBefore: 0
		};
		default: throw new Error("unreachable");
	}
}
function createScrollCache(isRtl, rowBufferPx, columnBufferPx, verticalBuffer, horizontalBuffer) {
	return {
		direction: ScrollDirection.NONE,
		buffer: bufferForDirection(isRtl, ScrollDirection.NONE, rowBufferPx, columnBufferPx, verticalBuffer, horizontalBuffer)
	};
}
function createRange(from, to) {
	return Array.from({ length: to - from }).map((_, i) => from + i);
}
function getFirstNonSpannedColumnToRender({ api, firstColumnToRender, firstRowToRender, lastRowToRender, visibleRows }) {
	let firstNonSpannedColumnToRender = firstColumnToRender;
	let foundStableColumn = false;
	while (!foundStableColumn && firstNonSpannedColumnToRender >= 0) {
		foundStableColumn = true;
		for (let i = firstRowToRender; i < lastRowToRender; i += 1) if (visibleRows[i]) {
			const rowId = visibleRows[i].id;
			const cellColSpanInfo = api.getCellColSpanInfo(rowId, firstNonSpannedColumnToRender);
			if (cellColSpanInfo && cellColSpanInfo.spannedByColSpan && cellColSpanInfo.leftVisibleCellIndex < firstNonSpannedColumnToRender) {
				firstNonSpannedColumnToRender = cellColSpanInfo.leftVisibleCellIndex;
				foundStableColumn = false;
				break;
			}
		}
	}
	return firstNonSpannedColumnToRender;
}
var Keyboard = {
	initialize: initializeState$1,
	use: useKeyboard,
	selectors: {}
};
function initializeState$1(_params) {
	return {};
}
function useKeyboard(store, params, _api) {
	const getViewportPageSize = () => {
		const dimensions = Dimensions.selectors.dimensions(store.state);
		if (!dimensions.isReady) return 0;
		if (params.getRowHeight) {
			const renderContext = Virtualization.selectors.renderContext(store.state);
			const viewportPageSize = renderContext.lastRowIndex - renderContext.firstRowIndex;
			return Math.min(viewportPageSize - 1, params.rows.length);
		}
		const maximumPageSizeWithoutScrollBar = Math.floor(dimensions.viewportInnerSize.height / dimensions.rowHeight);
		return Math.min(maximumPageSizeWithoutScrollBar, params.rows.length);
	};
	return { getViewportPageSize };
}
//#endregion
//#region node_modules/@mui/x-virtualizer/esm/features/rowspan.js
var EMPTY_RANGE = {
	firstRowIndex: 0,
	lastRowIndex: 0
};
var EMPTY_CACHES = {
	spannedCells: {},
	hiddenCells: {},
	hiddenCellOriginMap: {}
};
var selectors = {
	state: (state) => state.rowSpanning,
	hiddenCells: (state) => state.rowSpanning.caches.hiddenCells,
	spannedCells: (state) => state.rowSpanning.caches.spannedCells,
	hiddenCellsOriginMap: (state) => state.rowSpanning.caches.hiddenCellOriginMap
};
var Rowspan = {
	initialize: initializeState,
	use: useRowspan,
	selectors
};
function initializeState(params) {
	return { rowSpanning: params.initialState?.rowSpanning ?? {
		caches: EMPTY_CACHES,
		processedRange: EMPTY_RANGE
	} };
}
function useRowspan(store, _params, _api) {
	const getHiddenCellsOrigin = () => selectors.hiddenCellsOriginMap(store.state);
	return { getHiddenCellsOrigin };
}
//#endregion
//#region node_modules/@mui/x-virtualizer/esm/useVirtualizer.js
var FEATURES = [
	Dimensions,
	Virtualization,
	Colspan,
	Rowspan,
	Keyboard
];
var useVirtualizer = (params) => {
	const store = useLazyRef(() => {
		return new Store(FEATURES.map((f) => f.initialize(params)).reduce((state, partial) => Object.assign(state, partial), {}));
	}).current;
	const api = {};
	for (const feature of FEATURES) Object.assign(api, feature.use(store, params, api));
	return {
		store,
		api
	};
};
//#endregion
export { Dimensions as a, computeOffsetLeft as i, Rowspan as n, require_react_dom as o, EMPTY_RENDER_CONTEXT as r, useVirtualizer as t };
