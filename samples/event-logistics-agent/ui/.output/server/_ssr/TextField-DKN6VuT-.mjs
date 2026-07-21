import { a as __toESM, t as getServerFnById } from "../__23tanstack-start-server-fn-resolver-BaOM1vmh.mjs";
import { s as performance_default } from "../_libs/h3+rou3+srvx+unenv.mjs";
import { c as createServerFn, i as TSS_SERVER_FUNCTION } from "./createServerFn-CIHAFgYl.mjs";
import { o as require_react, t as import_emotion_react_edge_light_cjs } from "../_libs/@emotion/react+[...].mjs";
import { i as require_jsx_runtime } from "../_libs/@mui/private-theming+[...].mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { r as createLucideIcon, t as lucide_react_exports } from "../_libs/lucide-react.mjs";
import { A as setRef, B as ClassNameGenerator, D as useControlled, E as useEventCallback, F as generateUtilityClasses, H as isPlainObject, I as composeClasses, L as createChainedFunction, M as ownerDocument, N as isMuiElement, O as useId, P as debounce, R as capitalize, S as useTimeout, T as useForkRef, U as formatMuiErrorMessage, V as deepmerge, _ as extractEventHandlers, b as isHostComponent, d as getScrollbarSize, f as resolveProps, g as mergeSlotProps, h as isFocusVisible, j as ownerWindow, k as useEnhancedEffect, m as useSlotProps, p as getReactElementRef, v as resolveComponentProps, w as useLazyRef, y as appendOwnerState, z as generateUtilityClass } from "../_libs/mui__utils+react-is.mjs";
import { A as GlobalStyles, D as createBox, E as createStyled, F as createSpacing, I as createUnarySpacing, M as createTheme$1, N as styleFunctionSx, O as clsx, P as defaultSxConfig, S as private_safeLighten, _ as lighten, a as prepareCssVars, b as private_safeDarken, c as unstable_memoTheme, d as useRtl, f as alpha, g as hslToRgb, h as getContrastRatio, i as createGetColorSchemeSelector, j as useTheme, k as extendSxProp, n as createStack, o as createGetCssVar$1, p as darken, t as prepareTypographyVars, u as useDefaultProps, v as private_safeAlpha, x as private_safeEmphasize, y as private_safeColorChannel } from "../_libs/@mui/system+[...].mjs";
import { o as require_react_dom } from "../_libs/mui__x-virtualizer+react-dom.mjs";
import { n as Transition, t as TransitionGroup } from "../_libs/react-transition-group.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/rolldown-runtime-BBjsoOtd.js
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/TextField-DKN6VuT-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom());
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var getAgentDefaults = createServerFn({ method: "GET" }).handler(createSsrRpc("e5d664a604c33258e250f02dfb469b9b7687bef2d8bd545f876e0e6ae9aa548f"));
var FALLBACK_DEFAULTS = {
	apiUrl: "/api/chat",
	apiKey: "",
	apiHeader: "Authorization"
};
var SettingsContext = (0, import_react.createContext)(null);
function SettingsProvider({ children }) {
	const { data: defaults, isSuccess } = useQuery({
		queryKey: ["agent-defaults"],
		queryFn: () => getAgentDefaults(),
		staleTime: Infinity
	});
	const activeDefaults = defaults ?? FALLBACK_DEFAULTS;
	const [overrides, setOverrides] = (0, import_react.useState)({});
	const merged = {
		...activeDefaults,
		...overrides
	};
	const value = (0, import_react.useMemo)(() => ({
		...merged,
		defaults: activeDefaults,
		ready: isSuccess,
		updateSettings: (next) => {
			setOverrides((prev) => ({
				...prev,
				...next
			}));
		},
		reset: () => {
			setOverrides({});
		}
	}), [
		merged.apiUrl,
		merged.apiKey,
		merged.apiHeader,
		activeDefaults,
		isSuccess
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsContext.Provider, {
		value,
		children
	});
}
function useSettings() {
	const ctx = (0, import_react.useContext)(SettingsContext);
	if (!ctx) throw new Error("useSettings must be used inside <SettingsProvider>");
	return ctx;
}
var BitbucketIcon = createLucideIcon("Bitbucket", [["path", {
	fill: "currentColor",
	stroke: "none",
	d: "M24.9352 10.6331L22.9629 22.6811C22.8343 23.41 22.3197 23.8387 21.5909 23.8387H4.86944C4.14064 23.8387 3.62614 23.41 3.49744 22.6811L0.0245436 1.2005C-0.104056 0.4716 0.281844 0 0.967844 0H25.4925C26.1785 0 26.5644 0.4716 26.4358 1.2005L25.4925 6.86C25.3639 7.6747 24.8923 8.0177 24.1205 8.0177H9.37144C9.15704 8.0177 9.02844 8.1463 9.07124 8.4035L10.2289 15.5209C10.2717 15.6924 10.4004 15.821 10.5719 15.821H15.8884C16.0599 15.821 16.1886 15.6924 16.2314 15.5209L17.0461 10.3758C17.1318 9.7327 17.5606 9.4754 18.1608 9.4754H23.949C24.8065 9.4754 25.0638 9.9042 24.9352 10.6331Z",
	key: "path-0"
}]]);
var Bitbucket = import_react.forwardRef(({ className = "lucide-logo", viewBox = "0 0 27 24", ...props }, ref) => import_react.createElement(BitbucketIcon, {
	ref,
	className,
	viewBox,
	...props
}));
Bitbucket.displayName = "Bitbucket";
var FacebookIcon = createLucideIcon("Facebook", [["path", {
	fill: "currentColor",
	stroke: "none",
	d: "M22.9998 11.9319C22.9741 9.82279 22.3498 7.76495 21.2006 6.00078C20.0513 4.23662 18.425 2.8396 16.5132 1.97425C14.6012 1.10891 12.4834 0.811293 10.409 1.11643C8.33463 1.42157 6.3901 2.31676 4.80445 3.6966C3.21878 5.07642 2.05801 6.88342 1.45884 8.90477C0.85968 10.9261 0.847057 13.0776 1.42248 15.106C1.99791 17.1343 3.13741 18.9549 4.70678 20.3535C6.27614 21.7521 8.21004 22.6703 10.2807 23V15.1555H7.53062V11.9319H10.2807V9.48314C10.217 8.91377 10.2783 8.33725 10.4604 7.79431C10.6425 7.25136 10.9407 6.75524 11.3341 6.34095C11.7275 5.92664 12.2064 5.60427 12.7372 5.39659C13.268 5.1889 13.8376 5.10095 14.4058 5.13897C15.2306 5.15033 16.0534 5.22433 16.8671 5.36033V8.12734H15.4921C15.255 8.09725 15.0141 8.12116 14.7875 8.19729C14.5608 8.27343 14.354 8.39984 14.1824 8.56719C14.0108 8.73454 13.8787 8.93855 13.7961 9.1641C13.7133 9.38975 13.6821 9.63118 13.7045 9.87052V11.9596H16.7571L16.2621 15.1832H13.7183V22.9308C16.317 22.5173 18.6823 21.1803 20.3852 19.1623C22.088 17.1443 23.0156 14.5791 22.9998 11.9319Z",
	key: "path-0"
}]]);
var Facebook = import_react.forwardRef(({ className = "lucide-logo", viewBox = "0 0 24 24", ...props }, ref) => import_react.createElement(FacebookIcon, {
	ref,
	className,
	viewBox,
	...props
}));
Facebook.displayName = "Facebook";
var GitHubIcon = createLucideIcon("GitHub", [["path", {
	fill: "currentColor",
	stroke: "none",
	d: "M12 1.5C17.7875 1.5 22.5 6.31333 22.5 12.2783C22.5 17.0311 19.5066 21.0544 15.3623 22.4902C15.2924 22.5018 15.255 22.4992 15.2412 22.4961C15.2396 22.4957 15.2384 22.4945 15.2373 22.4941C15.2369 22.4932 15.2368 22.4915 15.2363 22.4902C15.2318 22.4778 15.2275 22.4591 15.2275 22.4375C15.2275 22.2536 15.2311 21.8605 15.2344 21.3193C15.2377 20.7801 15.2412 20.0977 15.2412 19.3418C15.2411 18.6521 15.1023 18.0771 14.8799 17.626C15.8886 17.4377 16.9157 17.0868 17.75 16.3711C18.8379 15.4377 19.5176 13.9607 19.5176 11.6895C19.5176 10.444 19.1178 9.39705 18.4453 8.55371C18.6056 7.99467 18.7804 6.88661 18.2441 5.49707L18.1582 5.27637L17.9326 5.20215L17.8252 5.53027C17.9206 5.23894 17.9308 5.20597 17.9316 5.20215L17.9307 5.20117H17.9287C17.9274 5.20075 17.9262 5.19966 17.9248 5.19922C17.9217 5.19826 17.9176 5.19733 17.9141 5.19629C17.9071 5.19427 17.8994 5.1917 17.8906 5.18945C17.8725 5.18482 17.85 5.18055 17.8242 5.17578C17.7726 5.16625 17.7061 5.15715 17.624 5.15332C17.4592 5.14566 17.2346 5.15773 16.9482 5.21973C16.4108 5.33614 15.6592 5.62915 14.666 6.29199C13.8065 6.06986 12.8999 5.95833 12.002 5.9541H11.998C11.1001 5.95833 10.1944 6.06986 9.33594 6.29199C8.3416 5.62907 7.58894 5.3361 7.05078 5.21973C6.76427 5.15779 6.53998 5.1457 6.375 5.15332C6.29273 5.15714 6.2255 5.16529 6.17383 5.1748C6.14801 5.17956 6.12553 5.18483 6.10742 5.18945C6.09866 5.19169 6.09093 5.19427 6.08398 5.19629C6.08042 5.19732 6.07632 5.19827 6.07324 5.19922C6.07192 5.19963 6.07057 5.1998 6.06934 5.2002L6.06738 5.20117H6.06641C6.06591 5.20133 6.06538 5.20185 6.2207 5.67676L6.06543 5.20215L5.83887 5.27539L5.75391 5.49805C5.21954 6.88785 5.39336 7.99583 5.55273 8.55371C4.88335 9.39607 4.48049 10.4432 4.48047 11.6895C4.48047 13.9553 5.15962 15.4321 6.24414 16.3682C7.07713 17.0871 8.10273 17.4426 9.11035 17.6338C8.99885 17.8623 8.90983 18.1228 8.84863 18.4131C8.57845 18.5102 8.22883 18.5921 7.87207 18.5596C7.43529 18.5197 6.93684 18.3063 6.52734 17.5869L6.49316 17.5283C6.47014 17.4904 6.43711 17.4389 6.39453 17.3779C6.30966 17.2564 6.18341 17.0939 6.01562 16.9277C5.68403 16.5993 5.15674 16.2241 4.44238 16.1729L4.42773 16.1719H4.39062C4.37901 16.172 4.36336 16.1722 4.34473 16.1729C4.30791 16.1742 4.25639 16.177 4.19824 16.1836C4.10193 16.1945 3.91026 16.2227 3.74316 16.3203C3.65339 16.3728 3.52795 16.4705 3.45703 16.6377C3.38036 16.8186 3.40074 17 3.45996 17.1445C3.55923 17.3868 3.79 17.5878 4.04492 17.7666L4.07812 17.79L4.11426 17.8066V17.8076L4.11328 17.8066L4.11133 17.8057C4.11036 17.8052 4.10908 17.805 4.1084 17.8047L4.1123 17.8066C4.12119 17.8118 4.13951 17.8229 4.16504 17.8408C4.21623 17.8767 4.29819 17.9409 4.39648 18.042C4.56744 18.2178 4.79454 18.5115 5 18.9766L5.08594 19.1865C5.08791 19.192 5.0902 19.1982 5.09277 19.2051C5.10129 19.2277 5.11317 19.2582 5.12891 19.2939C5.16032 19.3653 5.20754 19.4614 5.27441 19.5713C5.40813 19.791 5.62408 20.0716 5.9541 20.3252C6.54641 20.7801 7.44637 21.102 8.7627 20.9326C8.76799 21.637 8.77441 22.2271 8.77441 22.4375C8.77441 22.457 8.77103 22.4746 8.7666 22.4863C8.76519 22.4901 8.76357 22.4926 8.7627 22.4941C8.76795 22.4893 8.76974 22.4921 8.75684 22.4951C8.74292 22.4983 8.70777 22.5008 8.64355 22.4912C4.49636 21.0574 1.50005 17.0319 1.5 12.2783C1.5 6.31337 6.2136 1.5 12 1.5Z",
	key: "path-0"
}]]);
var GitHub = import_react.forwardRef(({ className = "lucide-logo", viewBox = "0 0 24 24", ...props }, ref) => import_react.createElement(GitHubIcon, {
	ref,
	className,
	viewBox,
	...props
}));
GitHub.displayName = "GitHub";
var GitLabIcon = createLucideIcon("GitLab", [["path", {
	fill: "currentColor",
	stroke: "none",
	d: "M188.857 73.2127L188.587 72.5227L162.447 4.30274C161.915 2.96566 160.973 1.83142 159.757 1.06274C158.54 0.307128 157.12 -0.0568007 155.689 0.020095C154.259 0.0969907 152.886 0.611008 151.757 1.49274C150.64 2.39979 149.83 3.62888 149.437 5.01274L131.787 59.0127H60.3168L42.6668 5.01274C42.284 3.62134 41.4721 2.3861 40.3468 1.48274C39.2176 0.601006 37.845 0.0869885 36.4144 0.0100929C34.9837 -0.0668028 33.564 0.297126 32.3468 1.05274C31.133 1.82452 30.1921 2.95777 29.6568 4.29274L3.46676 72.4827L3.20676 73.1727C-0.556211 83.0048 -1.02069 93.7937 1.88336 103.913C4.78741 114.032 10.9025 122.933 19.3068 129.273L19.3968 129.343L19.6368 129.513L59.4568 159.333L79.1568 174.243L91.1568 183.303C92.5604 184.368 94.2744 184.945 96.0368 184.945C97.7992 184.945 99.5131 184.368 100.917 183.303L112.917 174.243L132.617 159.333L172.677 129.333L172.777 129.253C181.162 122.911 187.263 114.02 190.163 103.914C193.062 93.809 192.604 83.0355 188.857 73.2127Z",
	key: "path-0"
}]]);
var GitLab = import_react.forwardRef(({ className = "lucide-logo", viewBox = "0 0 193 185", ...props }, ref) => import_react.createElement(GitLabIcon, {
	ref,
	className,
	viewBox,
	...props
}));
GitLab.displayName = "GitLab";
var GoogleIcon = createLucideIcon("Google", [["path", {
	fill: "currentColor",
	stroke: "none",
	d: "M21.8037 8.80435H11.2324C11.2324 9.90374 11.2324 12.1023 11.2257 13.2017H17.3515C17.1167 14.3011 16.2844 15.8405 15.1085 16.6156C15.1085 16.6156 15.1062 16.622 15.104 16.6209C13.5405 17.6533 11.4773 17.8875 9.94528 17.5797C7.54395 17.1026 5.64353 15.361 4.87191 13.1491C4.8764 13.1458 4.87979 13.1153 4.88316 13.1131C4.4002 11.741 4.4002 9.90374 4.88316 8.80435H4.88203C5.50427 6.78369 7.46194 4.9401 9.86665 4.43548C11.8007 4.02541 13.9831 4.46932 15.5881 5.97109C15.8015 5.76221 18.542 3.08641 18.7475 2.86873C13.2642 -2.09721 4.48443 -0.35033 1.19916 6.06239H1.19803C1.19803 6.06239 1.19917 6.06266 1.19243 6.07475C-0.4328 9.22449 -0.365411 12.9359 1.20366 15.9351C1.19916 15.9383 1.1958 15.9403 1.19243 15.9436C2.61436 18.7031 5.20214 20.8194 8.32006 21.6252C11.6323 22.4937 15.8475 21.9001 18.6712 19.3463L18.6746 19.3495C21.0669 17.1947 22.5562 13.524 21.8037 8.80435Z",
	key: "path-0"
}]]);
var Google = import_react.forwardRef(({ className = "lucide-logo", viewBox = "0 0 24 24", ...props }, ref) => import_react.createElement(GoogleIcon, {
	ref,
	className,
	viewBox,
	...props
}));
Google.displayName = "Google";
var LambdaIcon = createLucideIcon("Lambda", [["path", {
	d: "M11.38 10 5 20",
	key: "path-0"
}], ["path", {
	d: "M19 18a2 2 0 0 1-2 2c-4.87-.003-5.052-16-10-16a2 2 0 0 0-2 2",
	key: "path-1"
}]]);
var Lambda = import_react.forwardRef(({ className = "lucide-logo", viewBox = "0 0 24 24", ...props }, ref) => import_react.createElement(LambdaIcon, {
	ref,
	className,
	viewBox,
	...props
}));
Lambda.displayName = "Lambda";
var MCPIcon = createLucideIcon("MCP", [
	["path", {
		d: "M6 80.9117L73.8822 13.0294C83.255 3.65685 98.451 3.65685 107.823 13.0294C117.196 22.4019 117.196 37.598 107.823 46.9706L56.5581 98.2359",
		stroke: "currentColor",
		strokeWidth: "12",
		strokeLinecap: "round",
		key: "path-0"
	}],
	["path", {
		d: "M57.2652 97.5289L107.823 46.9706C117.196 37.598 132.392 37.598 141.765 46.9706L142.118 47.324C151.491 56.6966 151.491 71.8926 142.118 81.2651L80.7248 142.659C77.6006 145.783 77.6006 150.848 80.7248 153.972L93.331 166.579",
		stroke: "currentColor",
		strokeWidth: "12",
		strokeLinecap: "round",
		key: "path-1"
	}],
	["path", {
		d: "M90.853 30L40.6482 80.2046C31.2756 89.5769 31.2756 104.773 40.6482 114.146C50.0208 123.518 65.2167 123.518 74.5893 114.146L124.794 63.9411",
		stroke: "currentColor",
		strokeWidth: "12",
		strokeLinecap: "round",
		key: "path-2"
	}]
]);
var MCP = import_react.forwardRef(({ className = "lucide-logo", viewBox = "0 0 156 173", ...props }, ref) => import_react.createElement(MCPIcon, {
	ref,
	className,
	viewBox,
	...props
}));
MCP.displayName = "MCP";
var WSO2Icon = createLucideIcon("WSO2", [["path", {
	fill: "currentColor",
	stroke: "none",
	d: "M11.7972 0.00354566C11.9766 0.00378361 12.1561 0.002008 12.3355 9.8704e-05C13.4 -0.00437346 14.4171 0.143032 15.4357 0.461512C15.4986 0.480898 15.5615 0.500284 15.6262 0.520257C17.4305 1.09309 18.9658 2.05158 20.3371 3.34943C20.399 3.40744 20.461 3.46545 20.5249 3.52521C21.3025 4.27532 21.9185 5.12822 22.4505 6.06748C22.4751 6.11089 22.4998 6.1543 22.5252 6.19901C23.2273 7.45415 23.694 8.87049 23.8845 10.2956C23.8949 10.3705 23.8949 10.3705 23.9054 10.4471C24.3026 13.5927 23.4378 16.764 21.5278 19.282C20.8881 20.1039 20.1905 20.8433 19.3559 21.4698C19.2779 21.53 19.1999 21.5902 19.1197 21.6523C16.6418 23.5273 13.4307 24.2997 10.359 23.8955C7.88794 23.5194 5.65017 22.4797 3.80743 20.7903C3.76678 20.753 3.72612 20.7157 3.68423 20.6774C2.14431 19.2463 1.09253 17.4471 0.472266 15.4438C0.454291 15.3866 0.436315 15.3295 0.417795 15.2706C0.0992863 14.1952 -0.00861615 13.1342 0.000530625 12.0179C0.000785265 11.9571 0.0010399 11.8964 0.00130226 11.8337C0.0210519 8.56584 1.32732 5.6415 3.61373 3.31497C4.61248 2.33054 5.77988 1.58602 7.05297 1.00889C7.09925 0.987889 7.14552 0.966877 7.1932 0.94523C7.75352 0.695758 8.3202 0.506769 8.91165 0.34826C8.96742 0.333253 9.0232 0.318247 9.08064 0.302786C9.98441 0.0726044 10.8686 0.000984053 11.7972 0.00354566ZM9.24186 1.76391C9.15846 1.78637 9.15846 1.78637 9.07347 1.80929C7.36755 2.27722 5.91468 3.199 4.63769 4.40645C4.57649 4.4628 4.51529 4.51916 4.45224 4.57722C3.06614 5.89823 2.19499 7.63333 1.69406 9.46506C1.67967 9.51588 1.66529 9.56661 1.65046 9.61901C1.22693 11.1892 1.31144 13.2031 1.76954 14.7502C1.78571 14.8053 1.80189 14.8604 1.81855 14.9172C2.25601 16.358 2.98251 17.6817 3.95839 18.8272C4.01881 18.8987 4.07923 18.9703 4.14148 19.044C5.90225 21.0506 8.47282 22.3088 11.1288 22.5268C13.9727 22.6727 16.7502 21.8652 18.8965 19.9474C18.9743 19.8762 19.0519 19.8048 19.1294 19.7332C19.1872 19.6804 19.1872 19.6804 19.246 19.6266C21.1588 17.8588 22.4037 15.2875 22.5353 12.6756C22.6262 9.58073 21.617 6.83891 19.5068 4.55745C17.7809 2.77419 15.2124 1.48534 12.7061 1.44392C11.5201 1.42657 10.3912 1.43421 9.24186 1.76391Z",
	key: "path-0"
}], ["path", {
	fill: "currentColor",
	stroke: "none",
	d: "M11.4236 6.07489C11.7738 6.41239 11.8588 6.80149 11.9787 7.25308C12.0007 7.33295 12.0228 7.41282 12.0455 7.49511C12.1179 7.75858 12.189 8.02232 12.2601 8.28614C12.3102 8.46926 12.3604 8.65238 12.4106 8.83549C12.5427 9.31711 12.6736 9.79902 12.8042 10.2809C12.9635 10.8675 13.1238 11.4537 13.2842 12.0399C13.4089 12.4958 13.5332 12.9517 13.6571 13.4078C13.6912 13.5332 13.6912 13.5332 13.726 13.6612C13.7686 13.8179 13.8111 13.9745 13.8534 14.1312C13.8722 14.1999 13.8909 14.2685 13.9102 14.3394C13.9345 14.4293 13.9345 14.4293 13.9594 14.5209C14.0003 14.6716 14.0003 14.6716 14.0818 14.8203C14.1085 14.7522 14.1353 14.6841 14.1629 14.6139C14.2629 14.3602 14.364 14.107 14.4654 13.8539C14.509 13.7445 14.5524 13.635 14.5955 13.5253C14.6576 13.3673 14.7207 13.2098 14.7841 13.0523C14.8031 13.0035 14.822 12.9547 14.8414 12.9046C14.9827 12.5578 15.1428 12.3052 15.489 12.1353C15.6142 12.1265 15.7398 12.1223 15.8653 12.1205C15.9436 12.1193 16.0219 12.118 16.1026 12.1168C16.4613 12.1133 16.8199 12.1102 17.1786 12.1084C17.3677 12.1072 17.5568 12.1051 17.7459 12.1021C18.0186 12.098 18.291 12.0963 18.5637 12.0952C18.648 12.0934 18.7324 12.0917 18.8192 12.0899C19.4749 12.0917 19.4749 12.0917 19.7641 12.3187C19.9495 12.5235 20.0082 12.5956 19.9991 12.8641C19.9994 12.9203 19.9997 12.9764 20 13.0343C19.9143 13.3087 19.7852 13.417 19.5544 13.5928C19.2959 13.6455 19.0439 13.6376 18.7808 13.6304C18.6697 13.6295 18.6697 13.6295 18.5564 13.6287C18.3206 13.6265 18.0849 13.6218 17.8491 13.6169C17.6889 13.6149 17.5288 13.6132 17.3686 13.6116C16.9765 13.6074 16.5846 13.6007 16.1927 13.5928C16.1837 13.6461 16.1747 13.6993 16.1654 13.7541C16.1081 14.0045 16.0213 14.228 15.9236 14.4661C15.9046 14.5127 15.8856 14.5594 15.8659 14.6075C15.8042 14.7584 15.7419 14.9093 15.6796 15.06C15.6368 15.1639 15.594 15.2677 15.5513 15.3715C15.4663 15.5778 15.3809 15.784 15.2954 15.9902C15.1911 16.2416 15.0884 16.4936 14.986 16.7456C14.9322 16.8758 14.8784 17.006 14.8245 17.1361C14.801 17.1947 14.7774 17.2533 14.7531 17.3137C14.6295 17.6074 14.5328 17.8174 14.2381 17.9656C13.7021 18.024 13.7021 18.024 13.417 17.8378C13.191 17.6305 13.1403 17.5017 13.0606 17.2112C13.0349 17.1205 13.0093 17.0297 12.9828 16.9362C12.9563 16.8368 12.9298 16.7373 12.9033 16.6378C12.8745 16.534 12.8456 16.4303 12.8166 16.3266C12.7395 16.0498 12.6641 15.7726 12.5891 15.4952C12.5116 15.2098 12.4326 14.9248 12.3537 14.6397C12.2294 14.19 12.106 13.74 11.9833 13.2898C11.8406 12.7663 11.6954 12.2436 11.5485 11.7212C11.494 11.5268 11.4396 11.3323 11.3852 11.1379C11.3524 11.0205 11.3195 10.903 11.2864 10.7856C11.242 10.627 11.198 10.4682 11.1542 10.3095C11.1185 10.1811 11.1185 10.1811 11.0821 10.0502C11.0327 9.83385 11.0327 9.83385 11.0327 9.527C10.9811 9.527 10.9295 9.527 10.8763 9.527C10.8676 9.60095 10.8588 9.67498 10.8498 9.75115C10.7985 10.102 10.699 10.4351 10.5963 10.7742C10.5763 10.8406 10.5563 10.9071 10.5358 10.9756C10.4936 11.1153 10.4512 11.2549 10.4086 11.3945C10.3438 11.6075 10.2804 11.8209 10.2171 12.0343C10.1758 12.1705 10.1345 12.3067 10.093 12.4427C10.0743 12.5062 10.0557 12.5697 10.0364 12.6351C9.92729 12.987 9.81408 13.246 9.54725 13.5161C9.33468 13.6205 9.16518 13.6044 8.9272 13.6064C8.82986 13.6074 8.73252 13.6084 8.63222 13.6094C8.52542 13.6101 8.4187 13.6106 8.31191 13.6112C8.2582 13.6115 8.20449 13.6118 8.14914 13.6121C7.86487 13.6137 7.58052 13.6148 7.29618 13.6156C7.00278 13.6164 6.70943 13.619 6.41604 13.6221C6.19021 13.6241 5.96439 13.6247 5.73855 13.625C5.63043 13.6254 5.52229 13.6262 5.41417 13.6277C5.26262 13.6295 5.11105 13.6293 4.95949 13.6289C4.83025 13.6296 4.83025 13.6296 4.6984 13.6303C4.41119 13.5842 4.28169 13.4825 4.07455 13.286C3.97887 13.0983 3.99509 12.9996 4.01592 12.7922C4.02115 12.7321 4.02639 12.6721 4.03179 12.6103C4.08271 12.4101 4.14452 12.3377 4.30909 12.212C4.54392 12.1352 4.69823 12.126 4.94346 12.1266C5.02483 12.1266 5.10621 12.1266 5.19005 12.1266C5.27776 12.127 5.36548 12.1274 5.45585 12.1278C5.54576 12.1279 5.63566 12.1281 5.72829 12.1281C6.01586 12.1286 6.30343 12.1295 6.59101 12.1305C6.7858 12.1309 6.98059 12.1313 7.17538 12.1316C7.65331 12.1324 8.13115 12.1337 8.60908 12.1353C8.61893 12.0576 8.62878 11.9799 8.63894 11.8998C8.68483 11.6135 8.75144 11.3493 8.83471 11.0716C8.84948 11.022 8.86418 10.9724 8.87943 10.9214C8.92782 10.7591 8.97684 10.5971 9.02594 10.435C9.0601 10.3214 9.09435 10.2079 9.12851 10.0944C9.20005 9.8571 9.27197 9.61997 9.34398 9.38293C9.43608 9.07975 9.527 8.77619 9.61761 8.47264C9.68774 8.23827 9.75873 8.00414 9.82995 7.77009C9.86381 7.65831 9.89735 7.54646 9.93057 7.43448C9.97725 7.27783 10.025 7.12154 10.0731 6.96531C10.0999 6.87647 10.1267 6.78763 10.1544 6.6961C10.2576 6.44183 10.3718 6.27273 10.5636 6.07489C10.8565 5.97909 11.1335 5.97107 11.4236 6.07489Z",
	key: "path-1"
}]]);
var WSO2 = import_react.forwardRef(({ className = "lucide-logo", viewBox = "0 0 24 24", ...props }, ref) => import_react.createElement(WSO2Icon, {
	ref,
	className,
	viewBox,
	...props
}));
WSO2.displayName = "WSO2";
var dist_exports = /* @__PURE__ */ __exportAll({
	Bitbucket: () => Bitbucket,
	Facebook: () => Facebook,
	GitHub: () => GitHub,
	GitLab: () => GitLab,
	Google: () => Google,
	Lambda: () => Lambda,
	MCP: () => MCP,
	WSO2: () => WSO2
});
__reExport(dist_exports, lucide_react_exports);
var identifier_default = "$$material";
var common = {
	black: "#000",
	white: "#fff"
};
var grey = {
	50: "#fafafa",
	100: "#f5f5f5",
	200: "#eeeeee",
	300: "#e0e0e0",
	400: "#bdbdbd",
	500: "#9e9e9e",
	600: "#757575",
	700: "#616161",
	800: "#424242",
	900: "#212121",
	A100: "#f5f5f5",
	A200: "#eeeeee",
	A400: "#bdbdbd",
	A700: "#616161"
};
var purple = {
	50: "#f3e5f5",
	100: "#e1bee7",
	200: "#ce93d8",
	300: "#ba68c8",
	400: "#ab47bc",
	500: "#9c27b0",
	600: "#8e24aa",
	700: "#7b1fa2",
	800: "#6a1b9a",
	900: "#4a148c",
	A100: "#ea80fc",
	A200: "#e040fb",
	A400: "#d500f9",
	A700: "#aa00ff"
};
var red = {
	50: "#ffebee",
	100: "#ffcdd2",
	200: "#ef9a9a",
	300: "#e57373",
	400: "#ef5350",
	500: "#f44336",
	600: "#e53935",
	700: "#d32f2f",
	800: "#c62828",
	900: "#b71c1c",
	A100: "#ff8a80",
	A200: "#ff5252",
	A400: "#ff1744",
	A700: "#d50000"
};
var orange = {
	50: "#fff3e0",
	100: "#ffe0b2",
	200: "#ffcc80",
	300: "#ffb74d",
	400: "#ffa726",
	500: "#ff9800",
	600: "#fb8c00",
	700: "#f57c00",
	800: "#ef6c00",
	900: "#e65100",
	A100: "#ffd180",
	A200: "#ffab40",
	A400: "#ff9100",
	A700: "#ff6d00"
};
var blue = {
	50: "#e3f2fd",
	100: "#bbdefb",
	200: "#90caf9",
	300: "#64b5f6",
	400: "#42a5f5",
	500: "#2196f3",
	600: "#1e88e5",
	700: "#1976d2",
	800: "#1565c0",
	900: "#0d47a1",
	A100: "#82b1ff",
	A200: "#448aff",
	A400: "#2979ff",
	A700: "#2962ff"
};
var lightBlue = {
	50: "#e1f5fe",
	100: "#b3e5fc",
	200: "#81d4fa",
	300: "#4fc3f7",
	400: "#29b6f6",
	500: "#03a9f4",
	600: "#039be5",
	700: "#0288d1",
	800: "#0277bd",
	900: "#01579b",
	A100: "#80d8ff",
	A200: "#40c4ff",
	A400: "#00b0ff",
	A700: "#0091ea"
};
var green = {
	50: "#e8f5e9",
	100: "#c8e6c9",
	200: "#a5d6a7",
	300: "#81c784",
	400: "#66bb6a",
	500: "#4caf50",
	600: "#43a047",
	700: "#388e3c",
	800: "#2e7d32",
	900: "#1b5e20",
	A100: "#b9f6ca",
	A200: "#69f0ae",
	A400: "#00e676",
	A700: "#00c853"
};
function getLight() {
	return {
		text: {
			primary: "rgba(0, 0, 0, 0.87)",
			secondary: "rgba(0, 0, 0, 0.6)",
			disabled: "rgba(0, 0, 0, 0.38)"
		},
		divider: "rgba(0, 0, 0, 0.12)",
		background: {
			paper: common.white,
			default: common.white
		},
		action: {
			active: "rgba(0, 0, 0, 0.54)",
			hover: "rgba(0, 0, 0, 0.04)",
			hoverOpacity: .04,
			selected: "rgba(0, 0, 0, 0.08)",
			selectedOpacity: .08,
			disabled: "rgba(0, 0, 0, 0.26)",
			disabledBackground: "rgba(0, 0, 0, 0.12)",
			disabledOpacity: .38,
			focus: "rgba(0, 0, 0, 0.12)",
			focusOpacity: .12,
			activatedOpacity: .12
		}
	};
}
var light = getLight();
function getDark() {
	return {
		text: {
			primary: common.white,
			secondary: "rgba(255, 255, 255, 0.7)",
			disabled: "rgba(255, 255, 255, 0.5)",
			icon: "rgba(255, 255, 255, 0.5)"
		},
		divider: "rgba(255, 255, 255, 0.12)",
		background: {
			paper: "#121212",
			default: "#121212"
		},
		action: {
			active: common.white,
			hover: "rgba(255, 255, 255, 0.08)",
			hoverOpacity: .08,
			selected: "rgba(255, 255, 255, 0.16)",
			selectedOpacity: .16,
			disabled: "rgba(255, 255, 255, 0.3)",
			disabledBackground: "rgba(255, 255, 255, 0.12)",
			disabledOpacity: .38,
			focus: "rgba(255, 255, 255, 0.12)",
			focusOpacity: .12,
			activatedOpacity: .24
		}
	};
}
var dark = getDark();
function addLightOrDark(intent, direction, shade, tonalOffset) {
	const tonalOffsetLight = tonalOffset.light || tonalOffset;
	const tonalOffsetDark = tonalOffset.dark || tonalOffset * 1.5;
	if (!intent[direction]) {
		if (intent.hasOwnProperty(shade)) intent[direction] = intent[shade];
		else if (direction === "light") intent.light = lighten(intent.main, tonalOffsetLight);
		else if (direction === "dark") intent.dark = darken(intent.main, tonalOffsetDark);
	}
}
function mixLightOrDark(colorSpace, intent, direction, shade, tonalOffset) {
	const tonalOffsetLight = tonalOffset.light || tonalOffset;
	const tonalOffsetDark = tonalOffset.dark || tonalOffset * 1.5;
	if (!intent[direction]) {
		if (intent.hasOwnProperty(shade)) intent[direction] = intent[shade];
		else if (direction === "light") intent.light = `color-mix(in ${colorSpace}, ${intent.main}, #fff ${(tonalOffsetLight * 100).toFixed(0)}%)`;
		else if (direction === "dark") intent.dark = `color-mix(in ${colorSpace}, ${intent.main}, #000 ${(tonalOffsetDark * 100).toFixed(0)}%)`;
	}
}
function getDefaultPrimary(mode = "light") {
	if (mode === "dark") return {
		main: blue[200],
		light: blue[50],
		dark: blue[400]
	};
	return {
		main: blue[700],
		light: blue[400],
		dark: blue[800]
	};
}
function getDefaultSecondary(mode = "light") {
	if (mode === "dark") return {
		main: purple[200],
		light: purple[50],
		dark: purple[400]
	};
	return {
		main: purple[500],
		light: purple[300],
		dark: purple[700]
	};
}
function getDefaultError(mode = "light") {
	if (mode === "dark") return {
		main: red[500],
		light: red[300],
		dark: red[700]
	};
	return {
		main: red[700],
		light: red[400],
		dark: red[800]
	};
}
function getDefaultInfo(mode = "light") {
	if (mode === "dark") return {
		main: lightBlue[400],
		light: lightBlue[300],
		dark: lightBlue[700]
	};
	return {
		main: lightBlue[700],
		light: lightBlue[500],
		dark: lightBlue[900]
	};
}
function getDefaultSuccess(mode = "light") {
	if (mode === "dark") return {
		main: green[400],
		light: green[300],
		dark: green[700]
	};
	return {
		main: green[800],
		light: green[500],
		dark: green[900]
	};
}
function getDefaultWarning(mode = "light") {
	if (mode === "dark") return {
		main: orange[400],
		light: orange[300],
		dark: orange[700]
	};
	return {
		main: "#ed6c02",
		light: orange[500],
		dark: orange[900]
	};
}
function contrastColor(background) {
	return `oklch(from ${background} var(--__l) 0 h / var(--__a))`;
}
function createPalette(palette) {
	const { mode = "light", contrastThreshold = 3, tonalOffset = .2, colorSpace, ...other } = palette;
	const primary = palette.primary || getDefaultPrimary(mode);
	const secondary = palette.secondary || getDefaultSecondary(mode);
	const error = palette.error || getDefaultError(mode);
	const info = palette.info || getDefaultInfo(mode);
	const success = palette.success || getDefaultSuccess(mode);
	const warning = palette.warning || getDefaultWarning(mode);
	function getContrastText(background) {
		if (colorSpace) return contrastColor(background);
		return getContrastRatio(background, dark.text.primary) >= contrastThreshold ? dark.text.primary : light.text.primary;
	}
	const augmentColor = ({ color, name, mainShade = 500, lightShade = 300, darkShade = 700 }) => {
		color = { ...color };
		if (!color.main && color[mainShade]) color.main = color[mainShade];
		if (!color.hasOwnProperty("main")) throw new Error(formatMuiErrorMessage(11, name ? ` (${name})` : "", mainShade));
		if (typeof color.main !== "string") throw new Error(formatMuiErrorMessage(12, name ? ` (${name})` : "", JSON.stringify(color.main)));
		if (colorSpace) {
			mixLightOrDark(colorSpace, color, "light", lightShade, tonalOffset);
			mixLightOrDark(colorSpace, color, "dark", darkShade, tonalOffset);
		} else {
			addLightOrDark(color, "light", lightShade, tonalOffset);
			addLightOrDark(color, "dark", darkShade, tonalOffset);
		}
		if (!color.contrastText) color.contrastText = getContrastText(color.main);
		return color;
	};
	let modeHydrated;
	if (mode === "light") modeHydrated = getLight();
	else if (mode === "dark") modeHydrated = getDark();
	return deepmerge({
		common: { ...common },
		mode,
		primary: augmentColor({
			color: primary,
			name: "primary"
		}),
		secondary: augmentColor({
			color: secondary,
			name: "secondary",
			mainShade: "A400",
			lightShade: "A200",
			darkShade: "A700"
		}),
		error: augmentColor({
			color: error,
			name: "error"
		}),
		warning: augmentColor({
			color: warning,
			name: "warning"
		}),
		info: augmentColor({
			color: info,
			name: "info"
		}),
		success: augmentColor({
			color: success,
			name: "success"
		}),
		grey,
		contrastThreshold,
		getContrastText,
		augmentColor,
		tonalOffset,
		...modeHydrated
	}, other);
}
function createMixins(breakpoints, mixins) {
	return {
		toolbar: {
			minHeight: 56,
			[breakpoints.up("xs")]: { "@media (orientation: landscape)": { minHeight: 48 } },
			[breakpoints.up("sm")]: { minHeight: 64 }
		},
		...mixins
	};
}
function round(value) {
	return Math.round(value * 1e5) / 1e5;
}
var caseAllCaps = { textTransform: "uppercase" };
var defaultFontFamily = "\"Roboto\", \"Helvetica\", \"Arial\", sans-serif";
/**
* @see @link{https://m2.material.io/design/typography/the-type-system.html}
* @see @link{https://m2.material.io/design/typography/understanding-typography.html}
*/
function createTypography(palette, typography) {
	const { fontFamily = defaultFontFamily, fontSize = 14, fontWeightLight = 300, fontWeightRegular = 400, fontWeightMedium = 500, fontWeightBold = 700, htmlFontSize = 16, allVariants, pxToRem: pxToRem2, ...other } = typeof typography === "function" ? typography(palette) : typography;
	const coef = fontSize / 14;
	const pxToRem = pxToRem2 || ((size) => `${size / htmlFontSize * coef}rem`);
	const buildVariant = (fontWeight, size, lineHeight, letterSpacing, casing) => ({
		fontFamily,
		fontWeight,
		fontSize: pxToRem(size),
		lineHeight,
		...fontFamily === defaultFontFamily ? { letterSpacing: `${round(letterSpacing / size)}em` } : {},
		...casing,
		...allVariants
	});
	return deepmerge({
		htmlFontSize,
		pxToRem,
		fontFamily,
		fontSize,
		fontWeightLight,
		fontWeightRegular,
		fontWeightMedium,
		fontWeightBold,
		h1: buildVariant(fontWeightLight, 96, 1.167, -1.5),
		h2: buildVariant(fontWeightLight, 60, 1.2, -.5),
		h3: buildVariant(fontWeightRegular, 48, 1.167, 0),
		h4: buildVariant(fontWeightRegular, 34, 1.235, .25),
		h5: buildVariant(fontWeightRegular, 24, 1.334, 0),
		h6: buildVariant(fontWeightMedium, 20, 1.6, .15),
		subtitle1: buildVariant(fontWeightRegular, 16, 1.75, .15),
		subtitle2: buildVariant(fontWeightMedium, 14, 1.57, .1),
		body1: buildVariant(fontWeightRegular, 16, 1.5, .15),
		body2: buildVariant(fontWeightRegular, 14, 1.43, .15),
		button: buildVariant(fontWeightMedium, 14, 1.75, .4, caseAllCaps),
		caption: buildVariant(fontWeightRegular, 12, 1.66, .4),
		overline: buildVariant(fontWeightRegular, 12, 2.66, 1, caseAllCaps),
		inherit: {
			fontFamily: "inherit",
			fontWeight: "inherit",
			fontSize: "inherit",
			lineHeight: "inherit",
			letterSpacing: "inherit"
		}
	}, other, { clone: false });
}
var shadowKeyUmbraOpacity = .2;
var shadowKeyPenumbraOpacity = .14;
var shadowAmbientShadowOpacity = .12;
function createShadow(...px) {
	return [
		`${px[0]}px ${px[1]}px ${px[2]}px ${px[3]}px rgba(0,0,0,${shadowKeyUmbraOpacity})`,
		`${px[4]}px ${px[5]}px ${px[6]}px ${px[7]}px rgba(0,0,0,${shadowKeyPenumbraOpacity})`,
		`${px[8]}px ${px[9]}px ${px[10]}px ${px[11]}px rgba(0,0,0,${shadowAmbientShadowOpacity})`
	].join(",");
}
var shadows = [
	"none",
	createShadow(0, 2, 1, -1, 0, 1, 1, 0, 0, 1, 3, 0),
	createShadow(0, 3, 1, -2, 0, 2, 2, 0, 0, 1, 5, 0),
	createShadow(0, 3, 3, -2, 0, 3, 4, 0, 0, 1, 8, 0),
	createShadow(0, 2, 4, -1, 0, 4, 5, 0, 0, 1, 10, 0),
	createShadow(0, 3, 5, -1, 0, 5, 8, 0, 0, 1, 14, 0),
	createShadow(0, 3, 5, -1, 0, 6, 10, 0, 0, 1, 18, 0),
	createShadow(0, 4, 5, -2, 0, 7, 10, 1, 0, 2, 16, 1),
	createShadow(0, 5, 5, -3, 0, 8, 10, 1, 0, 3, 14, 2),
	createShadow(0, 5, 6, -3, 0, 9, 12, 1, 0, 3, 16, 2),
	createShadow(0, 6, 6, -3, 0, 10, 14, 1, 0, 4, 18, 3),
	createShadow(0, 6, 7, -4, 0, 11, 15, 1, 0, 4, 20, 3),
	createShadow(0, 7, 8, -4, 0, 12, 17, 2, 0, 5, 22, 4),
	createShadow(0, 7, 8, -4, 0, 13, 19, 2, 0, 5, 24, 4),
	createShadow(0, 7, 9, -4, 0, 14, 21, 2, 0, 5, 26, 4),
	createShadow(0, 8, 9, -5, 0, 15, 22, 2, 0, 6, 28, 5),
	createShadow(0, 8, 10, -5, 0, 16, 24, 2, 0, 6, 30, 5),
	createShadow(0, 8, 11, -5, 0, 17, 26, 2, 0, 6, 32, 5),
	createShadow(0, 9, 11, -5, 0, 18, 28, 2, 0, 7, 34, 6),
	createShadow(0, 9, 12, -6, 0, 19, 29, 2, 0, 7, 36, 6),
	createShadow(0, 10, 13, -6, 0, 20, 31, 3, 0, 8, 38, 7),
	createShadow(0, 10, 13, -6, 0, 21, 33, 3, 0, 8, 40, 7),
	createShadow(0, 10, 14, -6, 0, 22, 35, 3, 0, 8, 42, 7),
	createShadow(0, 11, 14, -7, 0, 23, 36, 3, 0, 9, 44, 8),
	createShadow(0, 11, 15, -7, 0, 24, 38, 3, 0, 9, 46, 8)
];
var easing = {
	easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
	easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
	easeIn: "cubic-bezier(0.4, 0, 1, 1)",
	sharp: "cubic-bezier(0.4, 0, 0.6, 1)"
};
var duration = {
	shortest: 150,
	shorter: 200,
	short: 250,
	standard: 300,
	complex: 375,
	enteringScreen: 225,
	leavingScreen: 195
};
function formatMs(milliseconds) {
	return `${Math.round(milliseconds)}ms`;
}
function getAutoHeightDuration(height) {
	if (!height) return 0;
	const constant = height / 36;
	return Math.min(Math.round((4 + 15 * constant ** .25 + constant / 5) * 10), 3e3);
}
function createTransitions(inputTransitions) {
	const mergedEasing = {
		...easing,
		...inputTransitions.easing
	};
	const mergedDuration = {
		...duration,
		...inputTransitions.duration
	};
	const create = (props = ["all"], options = {}) => {
		const { duration: durationOption = mergedDuration.standard, easing: easingOption = mergedEasing.easeInOut, delay = 0, ...other } = options;
		return (Array.isArray(props) ? props : [props]).map((animatedProp) => `${animatedProp} ${typeof durationOption === "string" ? durationOption : formatMs(durationOption)} ${easingOption} ${typeof delay === "string" ? delay : formatMs(delay)}`).join(",");
	};
	return {
		getAutoHeightDuration,
		create,
		...inputTransitions,
		easing: mergedEasing,
		duration: mergedDuration
	};
}
var zIndex = {
	mobileStepper: 1e3,
	fab: 1050,
	speedDial: 1050,
	appBar: 1100,
	drawer: 1200,
	modal: 1300,
	snackbar: 1400,
	tooltip: 1500
};
function isSerializable(val) {
	return isPlainObject(val) || typeof val === "undefined" || typeof val === "string" || typeof val === "boolean" || typeof val === "number" || Array.isArray(val);
}
/**
* `baseTheme` usually comes from `createTheme()` or `extendTheme()`.
*
* This function is intended to be used with zero-runtime CSS-in-JS like Pigment CSS
* For example, in a Next.js project:
*
* ```js
* // next.config.js
* const { extendTheme } = require('@mui/material/styles');
*
* const theme = extendTheme();
* // `.toRuntimeSource` is Pigment CSS specific to create a theme that is available at runtime.
* theme.toRuntimeSource = stringifyTheme;
*
* module.exports = withPigment({
*  theme,
* });
* ```
*/
function stringifyTheme(baseTheme = {}) {
	const serializableTheme = { ...baseTheme };
	function serializeTheme(object) {
		const array = Object.entries(object);
		for (let index = 0; index < array.length; index++) {
			const [key, value] = array[index];
			if (!isSerializable(value) || key.startsWith("unstable_")) delete object[key];
			else if (isPlainObject(value)) {
				object[key] = { ...value };
				serializeTheme(object[key]);
			}
		}
	}
	serializeTheme(serializableTheme);
	return `import { unstable_createBreakpoints as createBreakpoints, createTransitions } from '@mui/material/styles';

const theme = ${JSON.stringify(serializableTheme, null, 2)};

theme.breakpoints = createBreakpoints(theme.breakpoints || {});
theme.transitions = createTransitions(theme.transitions || {});

export default theme;`;
}
function coefficientToPercentage(coefficient) {
	if (typeof coefficient === "number") return `${(coefficient * 100).toFixed(0)}%`;
	return `calc((${coefficient}) * 100%)`;
}
var parseAddition = (str) => {
	if (!Number.isNaN(+str)) return +str;
	const numbers = str.match(/\d*\.?\d+/g);
	if (!numbers) return 0;
	let sum = 0;
	for (let i = 0; i < numbers.length; i += 1) sum += +numbers[i];
	return sum;
};
function attachColorManipulators(theme) {
	Object.assign(theme, {
		alpha(color, coefficient) {
			const obj = this || theme;
			if (obj.colorSpace) return `oklch(from ${color} l c h / ${typeof coefficient === "string" ? `calc(${coefficient})` : coefficient})`;
			if (obj.vars) return `rgba(${color.replace(/var\(--([^,\s)]+)(?:,[^)]+)?\)+/g, "var(--$1Channel)")} / ${typeof coefficient === "string" ? `calc(${coefficient})` : coefficient})`;
			return alpha(color, parseAddition(coefficient));
		},
		lighten(color, coefficient) {
			const obj = this || theme;
			if (obj.colorSpace) return `color-mix(in ${obj.colorSpace}, ${color}, #fff ${coefficientToPercentage(coefficient)})`;
			return lighten(color, coefficient);
		},
		darken(color, coefficient) {
			const obj = this || theme;
			if (obj.colorSpace) return `color-mix(in ${obj.colorSpace}, ${color}, #000 ${coefficientToPercentage(coefficient)})`;
			return darken(color, coefficient);
		}
	});
}
function createThemeNoVars(options = {}, ...args) {
	const { breakpoints: breakpointsInput, mixins: mixinsInput = {}, spacing: spacingInput, palette: paletteInput = {}, transitions: transitionsInput = {}, typography: typographyInput = {}, shape: shapeInput, colorSpace, ...other } = options;
	if (options.vars && options.generateThemeVars === void 0) throw new Error(formatMuiErrorMessage(20));
	const palette = createPalette({
		...paletteInput,
		colorSpace
	});
	const systemTheme = createTheme$1(options);
	let muiTheme = deepmerge(systemTheme, {
		mixins: createMixins(systemTheme.breakpoints, mixinsInput),
		palette,
		shadows: shadows.slice(),
		typography: createTypography(palette, typographyInput),
		transitions: createTransitions(transitionsInput),
		zIndex: { ...zIndex }
	});
	muiTheme = deepmerge(muiTheme, other);
	muiTheme = args.reduce((acc, argument) => deepmerge(acc, argument), muiTheme);
	muiTheme.unstable_sxConfig = {
		...defaultSxConfig,
		...other?.unstable_sxConfig
	};
	muiTheme.unstable_sx = function sx(props) {
		return styleFunctionSx({
			sx: props,
			theme: this
		});
	};
	muiTheme.toRuntimeSource = stringifyTheme;
	attachColorManipulators(muiTheme);
	return muiTheme;
}
function getOverlayAlpha(elevation) {
	let alphaValue;
	if (elevation < 1) alphaValue = 5.11916 * elevation ** 2;
	else alphaValue = 4.5 * Math.log(elevation + 1) + 2;
	return Math.round(alphaValue * 10) / 1e3;
}
var defaultDarkOverlays = [...Array(25)].map((_, index) => {
	if (index === 0) return "none";
	const overlay = getOverlayAlpha(index);
	return `linear-gradient(rgba(255 255 255 / ${overlay}), rgba(255 255 255 / ${overlay}))`;
});
function getOpacity(mode) {
	return {
		inputPlaceholder: mode === "dark" ? .5 : .42,
		inputUnderline: mode === "dark" ? .7 : .42,
		switchTrackDisabled: mode === "dark" ? .2 : .12,
		switchTrack: mode === "dark" ? .3 : .38
	};
}
function getOverlays(mode) {
	return mode === "dark" ? defaultDarkOverlays : [];
}
function createColorScheme(options) {
	const { palette: paletteInput = { mode: "light" }, opacity, overlays, colorSpace, ...other } = options;
	const palette = createPalette({
		...paletteInput,
		colorSpace
	});
	return {
		palette,
		opacity: {
			...getOpacity(palette.mode),
			...opacity
		},
		overlays: overlays || getOverlays(palette.mode),
		...other
	};
}
function shouldSkipGeneratingVar(keys) {
	return !!keys[0].match(/(cssVarPrefix|colorSchemeSelector|modularCssLayers|rootSelector|typography|mixins|breakpoints|direction|transitions)/) || !!keys[0].match(/sxConfig$/) || keys[0] === "palette" && !!keys[1]?.match(/(mode|contrastThreshold|tonalOffset)/);
}
/**
* @internal These variables should not appear in the :root stylesheet when the `defaultColorScheme="dark"`
*/
var excludeVariablesFromRoot = (cssVarPrefix) => [
	...[...Array(25)].map((_, index) => `--${cssVarPrefix ? `${cssVarPrefix}-` : ""}overlays-${index}`),
	`--${cssVarPrefix ? `${cssVarPrefix}-` : ""}palette-AppBar-darkBg`,
	`--${cssVarPrefix ? `${cssVarPrefix}-` : ""}palette-AppBar-darkColor`
];
var createGetSelector_default = (theme) => (colorScheme, css) => {
	const root = theme.rootSelector || ":root";
	const selector = theme.colorSchemeSelector;
	let rule = selector;
	if (selector === "class") rule = ".%s";
	if (selector === "data") rule = "[data-%s]";
	if (selector?.startsWith("data-") && !selector.includes("%s")) rule = `[${selector}="%s"]`;
	if (theme.defaultColorScheme === colorScheme) {
		if (colorScheme === "dark") {
			const excludedVariables = {};
			excludeVariablesFromRoot(theme.cssVarPrefix).forEach((cssVar) => {
				excludedVariables[cssVar] = css[cssVar];
				delete css[cssVar];
			});
			if (rule === "media") return {
				[root]: css,
				[`@media (prefers-color-scheme: dark)`]: { [root]: excludedVariables }
			};
			if (rule) return {
				[rule.replace("%s", colorScheme)]: excludedVariables,
				[`${root}, ${rule.replace("%s", colorScheme)}`]: css
			};
			return { [root]: {
				...css,
				...excludedVariables
			} };
		}
		if (rule && rule !== "media") return `${root}, ${rule.replace("%s", String(colorScheme))}`;
	} else if (colorScheme) {
		if (rule === "media") return { [`@media (prefers-color-scheme: ${String(colorScheme)})`]: { [root]: css } };
		if (rule) return rule.replace("%s", String(colorScheme));
	}
	return root;
};
function assignNode(obj, keys) {
	keys.forEach((k) => {
		if (!obj[k]) obj[k] = {};
	});
}
function setColor(obj, key, defaultValue) {
	if (!obj[key] && defaultValue) obj[key] = defaultValue;
}
function toRgb(color) {
	if (typeof color !== "string" || !color.startsWith("hsl")) return color;
	return hslToRgb(color);
}
function setColorChannel(obj, key) {
	if (!(`${key}Channel` in obj)) obj[`${key}Channel`] = private_safeColorChannel(toRgb(obj[key]), `MUI: Can't create \`palette.${key}Channel\` because \`palette.${key}\` is not one of these formats: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color().
To suppress this warning, you need to explicitly provide the \`palette.${key}Channel\` as a string (in rgb format, for example "12 12 12") or undefined if you want to remove the channel token.`);
}
function getSpacingVal(spacingInput) {
	if (typeof spacingInput === "number") return `${spacingInput}px`;
	if (typeof spacingInput === "string" || typeof spacingInput === "function" || Array.isArray(spacingInput)) return spacingInput;
	return "8px";
}
var silent = (fn) => {
	try {
		return fn();
	} catch (error) {}
};
var createGetCssVar = (cssVarPrefix = "mui") => createGetCssVar$1(cssVarPrefix);
function attachColorScheme$1(colorSpace, colorSchemes, scheme, restTheme, colorScheme) {
	if (!scheme) return;
	scheme = scheme === true ? {} : scheme;
	const mode = colorScheme === "dark" ? "dark" : "light";
	if (!restTheme) {
		colorSchemes[colorScheme] = createColorScheme({
			...scheme,
			palette: {
				mode,
				...scheme?.palette
			},
			colorSpace
		});
		return;
	}
	const { palette, ...muiTheme } = createThemeNoVars({
		...restTheme,
		palette: {
			mode,
			...scheme?.palette
		},
		colorSpace
	});
	colorSchemes[colorScheme] = {
		...scheme,
		palette,
		opacity: {
			...getOpacity(mode),
			...scheme?.opacity
		},
		overlays: scheme?.overlays || getOverlays(mode)
	};
	return muiTheme;
}
/**
* A default `createThemeWithVars` comes with a single color scheme, either `light` or `dark` based on the `defaultColorScheme`.
* This is better suited for apps that only need a single color scheme.
*
* To enable built-in `light` and `dark` color schemes, either:
* 1. provide a `colorSchemeSelector` to define how the color schemes will change.
* 2. provide `colorSchemes.dark` will set `colorSchemeSelector: 'media'` by default.
*/
function createThemeWithVars(options = {}, ...args) {
	const { colorSchemes: colorSchemesInput = { light: true }, defaultColorScheme: defaultColorSchemeInput, disableCssColorScheme = false, cssVarPrefix = "mui", nativeColor = false, shouldSkipGeneratingVar: shouldSkipGeneratingVar$1 = shouldSkipGeneratingVar, colorSchemeSelector: selector = colorSchemesInput.light && colorSchemesInput.dark ? "media" : void 0, rootSelector = ":root", ...input } = options;
	const firstColorScheme = Object.keys(colorSchemesInput)[0];
	const defaultColorScheme = defaultColorSchemeInput || (colorSchemesInput.light && firstColorScheme !== "light" ? "light" : firstColorScheme);
	const getCssVar = createGetCssVar(cssVarPrefix);
	const { [defaultColorScheme]: defaultSchemeInput, light: builtInLight, dark: builtInDark, ...customColorSchemes } = colorSchemesInput;
	const colorSchemes = { ...customColorSchemes };
	let defaultScheme = defaultSchemeInput;
	if (defaultColorScheme === "dark" && !("dark" in colorSchemesInput) || defaultColorScheme === "light" && !("light" in colorSchemesInput)) defaultScheme = true;
	if (!defaultScheme) throw new Error(formatMuiErrorMessage(21, defaultColorScheme));
	let colorSpace;
	if (nativeColor) colorSpace = "oklch";
	const muiTheme = attachColorScheme$1(colorSpace, colorSchemes, defaultScheme, input, defaultColorScheme);
	if (builtInLight && !colorSchemes.light) attachColorScheme$1(colorSpace, colorSchemes, builtInLight, void 0, "light");
	if (builtInDark && !colorSchemes.dark) attachColorScheme$1(colorSpace, colorSchemes, builtInDark, void 0, "dark");
	let theme = {
		defaultColorScheme,
		...muiTheme,
		cssVarPrefix,
		colorSchemeSelector: selector,
		rootSelector,
		getCssVar,
		colorSchemes,
		font: {
			...prepareTypographyVars(muiTheme.typography),
			...muiTheme.font
		},
		spacing: getSpacingVal(input.spacing)
	};
	Object.keys(theme.colorSchemes).forEach((key) => {
		const palette = theme.colorSchemes[key].palette;
		const setCssVarColor = (cssVar) => {
			const tokens = cssVar.split("-");
			const color = tokens[1];
			const colorToken = tokens[2];
			return getCssVar(cssVar, palette[color][colorToken]);
		};
		if (palette.mode === "light") {
			setColor(palette.common, "background", "#fff");
			setColor(palette.common, "onBackground", "#000");
		}
		if (palette.mode === "dark") {
			setColor(palette.common, "background", "#000");
			setColor(palette.common, "onBackground", "#fff");
		}
		function colorMix(method, color, coefficient) {
			if (colorSpace) {
				let mixer;
				if (method === private_safeAlpha) mixer = `transparent ${((1 - coefficient) * 100).toFixed(0)}%`;
				if (method === private_safeDarken) mixer = `#000 ${(coefficient * 100).toFixed(0)}%`;
				if (method === private_safeLighten) mixer = `#fff ${(coefficient * 100).toFixed(0)}%`;
				return `color-mix(in ${colorSpace}, ${color}, ${mixer})`;
			}
			return method(color, coefficient);
		}
		assignNode(palette, [
			"Alert",
			"AppBar",
			"Avatar",
			"Button",
			"Chip",
			"FilledInput",
			"LinearProgress",
			"Skeleton",
			"Slider",
			"SnackbarContent",
			"SpeedDialAction",
			"StepConnector",
			"StepContent",
			"Switch",
			"TableCell",
			"Tooltip"
		]);
		if (palette.mode === "light") {
			setColor(palette.Alert, "errorColor", colorMix(private_safeDarken, palette.error.light, .6));
			setColor(palette.Alert, "infoColor", colorMix(private_safeDarken, palette.info.light, .6));
			setColor(palette.Alert, "successColor", colorMix(private_safeDarken, palette.success.light, .6));
			setColor(palette.Alert, "warningColor", colorMix(private_safeDarken, palette.warning.light, .6));
			setColor(palette.Alert, "errorFilledBg", setCssVarColor("palette-error-main"));
			setColor(palette.Alert, "infoFilledBg", setCssVarColor("palette-info-main"));
			setColor(palette.Alert, "successFilledBg", setCssVarColor("palette-success-main"));
			setColor(palette.Alert, "warningFilledBg", setCssVarColor("palette-warning-main"));
			setColor(palette.Alert, "errorFilledColor", silent(() => palette.getContrastText(palette.error.main)));
			setColor(palette.Alert, "infoFilledColor", silent(() => palette.getContrastText(palette.info.main)));
			setColor(palette.Alert, "successFilledColor", silent(() => palette.getContrastText(palette.success.main)));
			setColor(palette.Alert, "warningFilledColor", silent(() => palette.getContrastText(palette.warning.main)));
			setColor(palette.Alert, "errorStandardBg", colorMix(private_safeLighten, palette.error.light, .9));
			setColor(palette.Alert, "infoStandardBg", colorMix(private_safeLighten, palette.info.light, .9));
			setColor(palette.Alert, "successStandardBg", colorMix(private_safeLighten, palette.success.light, .9));
			setColor(palette.Alert, "warningStandardBg", colorMix(private_safeLighten, palette.warning.light, .9));
			setColor(palette.Alert, "errorIconColor", setCssVarColor("palette-error-main"));
			setColor(palette.Alert, "infoIconColor", setCssVarColor("palette-info-main"));
			setColor(palette.Alert, "successIconColor", setCssVarColor("palette-success-main"));
			setColor(palette.Alert, "warningIconColor", setCssVarColor("palette-warning-main"));
			setColor(palette.AppBar, "defaultBg", setCssVarColor("palette-grey-100"));
			setColor(palette.Avatar, "defaultBg", setCssVarColor("palette-grey-400"));
			setColor(palette.Button, "inheritContainedBg", setCssVarColor("palette-grey-300"));
			setColor(palette.Button, "inheritContainedHoverBg", setCssVarColor("palette-grey-A100"));
			setColor(palette.Chip, "defaultBorder", setCssVarColor("palette-grey-400"));
			setColor(palette.Chip, "defaultAvatarColor", setCssVarColor("palette-grey-700"));
			setColor(palette.Chip, "defaultIconColor", setCssVarColor("palette-grey-700"));
			setColor(palette.FilledInput, "bg", "rgba(0, 0, 0, 0.06)");
			setColor(palette.FilledInput, "hoverBg", "rgba(0, 0, 0, 0.09)");
			setColor(palette.FilledInput, "disabledBg", "rgba(0, 0, 0, 0.12)");
			setColor(palette.LinearProgress, "primaryBg", colorMix(private_safeLighten, palette.primary.main, .62));
			setColor(palette.LinearProgress, "secondaryBg", colorMix(private_safeLighten, palette.secondary.main, .62));
			setColor(palette.LinearProgress, "errorBg", colorMix(private_safeLighten, palette.error.main, .62));
			setColor(palette.LinearProgress, "infoBg", colorMix(private_safeLighten, palette.info.main, .62));
			setColor(palette.LinearProgress, "successBg", colorMix(private_safeLighten, palette.success.main, .62));
			setColor(palette.LinearProgress, "warningBg", colorMix(private_safeLighten, palette.warning.main, .62));
			setColor(palette.Skeleton, "bg", colorSpace ? colorMix(private_safeAlpha, palette.text.primary, .11) : `rgba(${setCssVarColor("palette-text-primaryChannel")} / 0.11)`);
			setColor(palette.Slider, "primaryTrack", colorMix(private_safeLighten, palette.primary.main, .62));
			setColor(palette.Slider, "secondaryTrack", colorMix(private_safeLighten, palette.secondary.main, .62));
			setColor(palette.Slider, "errorTrack", colorMix(private_safeLighten, palette.error.main, .62));
			setColor(palette.Slider, "infoTrack", colorMix(private_safeLighten, palette.info.main, .62));
			setColor(palette.Slider, "successTrack", colorMix(private_safeLighten, palette.success.main, .62));
			setColor(palette.Slider, "warningTrack", colorMix(private_safeLighten, palette.warning.main, .62));
			const snackbarContentBackground = colorSpace ? colorMix(private_safeDarken, palette.background.default, .6825) : private_safeEmphasize(palette.background.default, .8);
			setColor(palette.SnackbarContent, "bg", snackbarContentBackground);
			setColor(palette.SnackbarContent, "color", silent(() => colorSpace ? dark.text.primary : palette.getContrastText(snackbarContentBackground)));
			setColor(palette.SpeedDialAction, "fabHoverBg", private_safeEmphasize(palette.background.paper, .15));
			setColor(palette.StepConnector, "border", setCssVarColor("palette-grey-400"));
			setColor(palette.StepContent, "border", setCssVarColor("palette-grey-400"));
			setColor(palette.Switch, "defaultColor", setCssVarColor("palette-common-white"));
			setColor(palette.Switch, "defaultDisabledColor", setCssVarColor("palette-grey-100"));
			setColor(palette.Switch, "primaryDisabledColor", colorMix(private_safeLighten, palette.primary.main, .62));
			setColor(palette.Switch, "secondaryDisabledColor", colorMix(private_safeLighten, palette.secondary.main, .62));
			setColor(palette.Switch, "errorDisabledColor", colorMix(private_safeLighten, palette.error.main, .62));
			setColor(palette.Switch, "infoDisabledColor", colorMix(private_safeLighten, palette.info.main, .62));
			setColor(palette.Switch, "successDisabledColor", colorMix(private_safeLighten, palette.success.main, .62));
			setColor(palette.Switch, "warningDisabledColor", colorMix(private_safeLighten, palette.warning.main, .62));
			setColor(palette.TableCell, "border", colorMix(private_safeLighten, colorMix(private_safeAlpha, palette.divider, 1), .88));
			setColor(palette.Tooltip, "bg", colorMix(private_safeAlpha, palette.grey[700], .92));
		}
		if (palette.mode === "dark") {
			setColor(palette.Alert, "errorColor", colorMix(private_safeLighten, palette.error.light, .6));
			setColor(palette.Alert, "infoColor", colorMix(private_safeLighten, palette.info.light, .6));
			setColor(palette.Alert, "successColor", colorMix(private_safeLighten, palette.success.light, .6));
			setColor(palette.Alert, "warningColor", colorMix(private_safeLighten, palette.warning.light, .6));
			setColor(palette.Alert, "errorFilledBg", setCssVarColor("palette-error-dark"));
			setColor(palette.Alert, "infoFilledBg", setCssVarColor("palette-info-dark"));
			setColor(palette.Alert, "successFilledBg", setCssVarColor("palette-success-dark"));
			setColor(palette.Alert, "warningFilledBg", setCssVarColor("palette-warning-dark"));
			setColor(palette.Alert, "errorFilledColor", silent(() => palette.getContrastText(palette.error.dark)));
			setColor(palette.Alert, "infoFilledColor", silent(() => palette.getContrastText(palette.info.dark)));
			setColor(palette.Alert, "successFilledColor", silent(() => palette.getContrastText(palette.success.dark)));
			setColor(palette.Alert, "warningFilledColor", silent(() => palette.getContrastText(palette.warning.dark)));
			setColor(palette.Alert, "errorStandardBg", colorMix(private_safeDarken, palette.error.light, .9));
			setColor(palette.Alert, "infoStandardBg", colorMix(private_safeDarken, palette.info.light, .9));
			setColor(palette.Alert, "successStandardBg", colorMix(private_safeDarken, palette.success.light, .9));
			setColor(palette.Alert, "warningStandardBg", colorMix(private_safeDarken, palette.warning.light, .9));
			setColor(palette.Alert, "errorIconColor", setCssVarColor("palette-error-main"));
			setColor(palette.Alert, "infoIconColor", setCssVarColor("palette-info-main"));
			setColor(palette.Alert, "successIconColor", setCssVarColor("palette-success-main"));
			setColor(palette.Alert, "warningIconColor", setCssVarColor("palette-warning-main"));
			setColor(palette.AppBar, "defaultBg", setCssVarColor("palette-grey-900"));
			setColor(palette.AppBar, "darkBg", setCssVarColor("palette-background-paper"));
			setColor(palette.AppBar, "darkColor", setCssVarColor("palette-text-primary"));
			setColor(palette.Avatar, "defaultBg", setCssVarColor("palette-grey-600"));
			setColor(palette.Button, "inheritContainedBg", setCssVarColor("palette-grey-800"));
			setColor(palette.Button, "inheritContainedHoverBg", setCssVarColor("palette-grey-700"));
			setColor(palette.Chip, "defaultBorder", setCssVarColor("palette-grey-700"));
			setColor(palette.Chip, "defaultAvatarColor", setCssVarColor("palette-grey-300"));
			setColor(palette.Chip, "defaultIconColor", setCssVarColor("palette-grey-300"));
			setColor(palette.FilledInput, "bg", "rgba(255, 255, 255, 0.09)");
			setColor(palette.FilledInput, "hoverBg", "rgba(255, 255, 255, 0.13)");
			setColor(palette.FilledInput, "disabledBg", "rgba(255, 255, 255, 0.12)");
			setColor(palette.LinearProgress, "primaryBg", colorMix(private_safeDarken, palette.primary.main, .5));
			setColor(palette.LinearProgress, "secondaryBg", colorMix(private_safeDarken, palette.secondary.main, .5));
			setColor(palette.LinearProgress, "errorBg", colorMix(private_safeDarken, palette.error.main, .5));
			setColor(palette.LinearProgress, "infoBg", colorMix(private_safeDarken, palette.info.main, .5));
			setColor(palette.LinearProgress, "successBg", colorMix(private_safeDarken, palette.success.main, .5));
			setColor(palette.LinearProgress, "warningBg", colorMix(private_safeDarken, palette.warning.main, .5));
			setColor(palette.Skeleton, "bg", colorSpace ? colorMix(private_safeAlpha, palette.text.primary, .13) : `rgba(${setCssVarColor("palette-text-primaryChannel")} / 0.13)`);
			setColor(palette.Slider, "primaryTrack", colorMix(private_safeDarken, palette.primary.main, .5));
			setColor(palette.Slider, "secondaryTrack", colorMix(private_safeDarken, palette.secondary.main, .5));
			setColor(palette.Slider, "errorTrack", colorMix(private_safeDarken, palette.error.main, .5));
			setColor(palette.Slider, "infoTrack", colorMix(private_safeDarken, palette.info.main, .5));
			setColor(palette.Slider, "successTrack", colorMix(private_safeDarken, palette.success.main, .5));
			setColor(palette.Slider, "warningTrack", colorMix(private_safeDarken, palette.warning.main, .5));
			const snackbarContentBackground = colorSpace ? colorMix(private_safeLighten, palette.background.default, .985) : private_safeEmphasize(palette.background.default, .98);
			setColor(palette.SnackbarContent, "bg", snackbarContentBackground);
			setColor(palette.SnackbarContent, "color", silent(() => colorSpace ? light.text.primary : palette.getContrastText(snackbarContentBackground)));
			setColor(palette.SpeedDialAction, "fabHoverBg", private_safeEmphasize(palette.background.paper, .15));
			setColor(palette.StepConnector, "border", setCssVarColor("palette-grey-600"));
			setColor(palette.StepContent, "border", setCssVarColor("palette-grey-600"));
			setColor(palette.Switch, "defaultColor", setCssVarColor("palette-grey-300"));
			setColor(palette.Switch, "defaultDisabledColor", setCssVarColor("palette-grey-600"));
			setColor(palette.Switch, "primaryDisabledColor", colorMix(private_safeDarken, palette.primary.main, .55));
			setColor(palette.Switch, "secondaryDisabledColor", colorMix(private_safeDarken, palette.secondary.main, .55));
			setColor(palette.Switch, "errorDisabledColor", colorMix(private_safeDarken, palette.error.main, .55));
			setColor(palette.Switch, "infoDisabledColor", colorMix(private_safeDarken, palette.info.main, .55));
			setColor(palette.Switch, "successDisabledColor", colorMix(private_safeDarken, palette.success.main, .55));
			setColor(palette.Switch, "warningDisabledColor", colorMix(private_safeDarken, palette.warning.main, .55));
			setColor(palette.TableCell, "border", colorMix(private_safeDarken, colorMix(private_safeAlpha, palette.divider, 1), .68));
			setColor(palette.Tooltip, "bg", colorMix(private_safeAlpha, palette.grey[700], .92));
		}
		setColorChannel(palette.background, "default");
		setColorChannel(palette.background, "paper");
		setColorChannel(palette.common, "background");
		setColorChannel(palette.common, "onBackground");
		setColorChannel(palette, "divider");
		Object.keys(palette).forEach((color) => {
			const colors = palette[color];
			if (color !== "tonalOffset" && colors && typeof colors === "object") {
				if (colors.main) setColor(palette[color], "mainChannel", private_safeColorChannel(toRgb(colors.main)));
				if (colors.light) setColor(palette[color], "lightChannel", private_safeColorChannel(toRgb(colors.light)));
				if (colors.dark) setColor(palette[color], "darkChannel", private_safeColorChannel(toRgb(colors.dark)));
				if (colors.contrastText) setColor(palette[color], "contrastTextChannel", private_safeColorChannel(toRgb(colors.contrastText)));
				if (color === "text") {
					setColorChannel(palette[color], "primary");
					setColorChannel(palette[color], "secondary");
				}
				if (color === "action") {
					if (colors.active) setColorChannel(palette[color], "active");
					if (colors.selected) setColorChannel(palette[color], "selected");
				}
			}
		});
	});
	theme = args.reduce((acc, argument) => deepmerge(acc, argument), theme);
	const parserConfig = {
		prefix: cssVarPrefix,
		disableCssColorScheme,
		shouldSkipGeneratingVar: shouldSkipGeneratingVar$1,
		getSelector: createGetSelector_default(theme),
		enableContrastVars: nativeColor
	};
	const { vars, generateThemeVars, generateStyleSheets } = prepareCssVars(theme, parserConfig);
	theme.vars = vars;
	Object.entries(theme.colorSchemes[theme.defaultColorScheme]).forEach(([key, value]) => {
		theme[key] = value;
	});
	theme.generateThemeVars = generateThemeVars;
	theme.generateStyleSheets = generateStyleSheets;
	theme.generateSpacing = function generateSpacing() {
		return createSpacing(input.spacing, createUnarySpacing(this));
	};
	theme.getColorSchemeSelector = createGetColorSchemeSelector(selector);
	theme.spacing = theme.generateSpacing();
	theme.shouldSkipGeneratingVar = shouldSkipGeneratingVar$1;
	theme.unstable_sxConfig = {
		...defaultSxConfig,
		...input?.unstable_sxConfig
	};
	theme.unstable_sx = function sx(props) {
		return styleFunctionSx({
			sx: props,
			theme: this
		});
	};
	theme.toRuntimeSource = stringifyTheme;
	return theme;
}
function attachColorScheme(theme, scheme, colorScheme) {
	if (!theme.colorSchemes) return;
	if (colorScheme) theme.colorSchemes[scheme] = {
		...colorScheme !== true && colorScheme,
		palette: createPalette({
			...colorScheme === true ? {} : colorScheme.palette,
			mode: scheme
		})
	};
}
/**
* Generate a theme base on the options received.
* @param options Takes an incomplete theme object and adds the missing parts.
* @param args Deep merge the arguments with the about to be returned theme.
* @returns A complete, ready-to-use theme object.
*/
function createTheme(options = {}, ...args) {
	const { palette, cssVariables = false, colorSchemes: initialColorSchemes = !palette ? { light: true } : void 0, defaultColorScheme: initialDefaultColorScheme = palette?.mode, ...other } = options;
	const defaultColorSchemeInput = initialDefaultColorScheme || "light";
	const defaultScheme = initialColorSchemes?.[defaultColorSchemeInput];
	const colorSchemesInput = {
		...initialColorSchemes,
		...palette ? { [defaultColorSchemeInput]: {
			...typeof defaultScheme !== "boolean" && defaultScheme,
			palette
		} } : void 0
	};
	if (cssVariables === false) {
		if (!("colorSchemes" in options)) return createThemeNoVars(options, ...args);
		let paletteOptions = palette;
		if (!("palette" in options)) {
			if (colorSchemesInput[defaultColorSchemeInput]) {
				if (colorSchemesInput[defaultColorSchemeInput] !== true) paletteOptions = colorSchemesInput[defaultColorSchemeInput].palette;
				else if (defaultColorSchemeInput === "dark") paletteOptions = { mode: "dark" };
			}
		}
		const theme = createThemeNoVars({
			...options,
			palette: paletteOptions
		}, ...args);
		theme.defaultColorScheme = defaultColorSchemeInput;
		theme.colorSchemes = colorSchemesInput;
		if (theme.palette.mode === "light") {
			theme.colorSchemes.light = {
				...colorSchemesInput.light !== true && colorSchemesInput.light,
				palette: theme.palette
			};
			attachColorScheme(theme, "dark", colorSchemesInput.dark);
		}
		if (theme.palette.mode === "dark") {
			theme.colorSchemes.dark = {
				...colorSchemesInput.dark !== true && colorSchemesInput.dark,
				palette: theme.palette
			};
			attachColorScheme(theme, "light", colorSchemesInput.light);
		}
		return theme;
	}
	if (!palette && !("light" in colorSchemesInput) && defaultColorSchemeInput === "light") colorSchemesInput.light = true;
	return createThemeWithVars({
		...other,
		colorSchemes: colorSchemesInput,
		defaultColorScheme: defaultColorSchemeInput,
		...typeof cssVariables !== "boolean" && cssVariables
	}, ...args);
}
var defaultTheme = createTheme();
function useTheme$1() {
	const theme = useTheme(defaultTheme);
	return theme["$$material"] || theme;
}
function slotShouldForwardProp(prop) {
	return prop !== "ownerState" && prop !== "theme" && prop !== "sx" && prop !== "as";
}
var rootShouldForwardProp = (prop) => slotShouldForwardProp(prop) && prop !== "classes";
var styled$1 = createStyled({
	themeId: identifier_default,
	defaultTheme,
	rootShouldForwardProp
});
var capitalize_default = capitalize;
function GlobalStyles$1(props) {
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(GlobalStyles, {
		...props,
		defaultTheme,
		themeId: identifier_default
	});
}
function globalCss(styles) {
	return function GlobalStylesWrapper(props) {
		return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(GlobalStyles$1, { styles: typeof styles === "function" ? (theme) => styles({
			theme,
			...props
		}) : styles });
	};
}
function internal_createExtendSxProp() {
	return extendSxProp;
}
var memoTheme = unstable_memoTheme;
function useDefaultProps$1(params) {
	return useDefaultProps(params);
}
function getSvgIconUtilityClass(slot) {
	return generateUtilityClass("MuiSvgIcon", slot);
}
generateUtilityClasses("MuiSvgIcon", [
	"root",
	"colorPrimary",
	"colorSecondary",
	"colorAction",
	"colorError",
	"colorDisabled",
	"fontSizeInherit",
	"fontSizeSmall",
	"fontSizeMedium",
	"fontSizeLarge"
]);
var useUtilityClasses$24 = (ownerState) => {
	const { color, fontSize, classes } = ownerState;
	return composeClasses({ root: [
		"root",
		color !== "inherit" && `color${capitalize_default(color)}`,
		`fontSize${capitalize_default(fontSize)}`
	] }, getSvgIconUtilityClass, classes);
};
var SvgIconRoot = styled$1("svg", {
	name: "MuiSvgIcon",
	slot: "Root",
	overridesResolver: (props, styles) => {
		const { ownerState } = props;
		return [
			styles.root,
			ownerState.color !== "inherit" && styles[`color${capitalize_default(ownerState.color)}`],
			styles[`fontSize${capitalize_default(ownerState.fontSize)}`]
		];
	}
})(memoTheme(({ theme }) => ({
	userSelect: "none",
	width: "1em",
	height: "1em",
	display: "inline-block",
	flexShrink: 0,
	transition: theme.transitions?.create?.("fill", { duration: (theme.vars ?? theme).transitions?.duration?.shorter }),
	variants: [
		{
			props: (props) => !props.hasSvgAsChild,
			style: { fill: "currentColor" }
		},
		{
			props: { fontSize: "inherit" },
			style: { fontSize: "inherit" }
		},
		{
			props: { fontSize: "small" },
			style: { fontSize: theme.typography?.pxToRem?.(20) || "1.25rem" }
		},
		{
			props: { fontSize: "medium" },
			style: { fontSize: theme.typography?.pxToRem?.(24) || "1.5rem" }
		},
		{
			props: { fontSize: "large" },
			style: { fontSize: theme.typography?.pxToRem?.(35) || "2.1875rem" }
		},
		...Object.entries((theme.vars ?? theme).palette).filter(([, value]) => value && value.main).map(([color]) => ({
			props: { color },
			style: { color: (theme.vars ?? theme).palette?.[color]?.main }
		})),
		{
			props: { color: "action" },
			style: { color: (theme.vars ?? theme).palette?.action?.active }
		},
		{
			props: { color: "disabled" },
			style: { color: (theme.vars ?? theme).palette?.action?.disabled }
		},
		{
			props: { color: "inherit" },
			style: { color: void 0 }
		}
	]
})));
var SvgIcon = /*#__PURE__*/ import_react.forwardRef(function SvgIcon(inProps, ref) {
	const props = useDefaultProps$1({
		props: inProps,
		name: "MuiSvgIcon"
	});
	const { children, className, color = "inherit", component = "svg", fontSize = "medium", htmlColor, inheritViewBox = false, titleAccess, viewBox = "0 0 24 24", ...other } = props;
	const hasSvgAsChild = /*#__PURE__*/ import_react.isValidElement(children) && children.type === "svg";
	const ownerState = {
		...props,
		color,
		component,
		fontSize,
		instanceFontSize: inProps.fontSize,
		inheritViewBox,
		viewBox,
		hasSvgAsChild
	};
	const more = {};
	if (!inheritViewBox) more.viewBox = viewBox;
	return /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(SvgIconRoot, {
		as: component,
		className: clsx(useUtilityClasses$24(ownerState).root, className),
		focusable: "false",
		color: htmlColor,
		"aria-hidden": titleAccess ? void 0 : true,
		role: titleAccess ? "img" : void 0,
		ref,
		...more,
		...other,
		...hasSvgAsChild && children.props,
		ownerState,
		children: [hasSvgAsChild ? children.props.children : children, titleAccess ? /*#__PURE__*/ (0, import_jsx_runtime.jsx)("title", { children: titleAccess }) : null]
	});
});
SvgIcon.muiName = "SvgIcon";
/**
* Private module reserved for @mui packages.
*/
function createSvgIcon(path, displayName) {
	function Component(props, ref) {
		return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(SvgIcon, {
			"data-testid": void 0,
			ref,
			...props,
			children: path
		});
	}
	Component.muiName = SvgIcon.muiName;
	return /*#__PURE__*/ import_react.memo(/*#__PURE__*/ import_react.forwardRef(Component));
}
var debounce_default = debounce;
var isMuiElement_default = isMuiElement;
var ownerDocument_default = ownerDocument;
var ownerWindow_default = ownerWindow;
var useEnhancedEffect_default = useEnhancedEffect;
var useId_default = useId;
var useControlled_default = useControlled;
var useEventCallback_default = useEventCallback;
var useForkRef_default = useForkRef;
function isEventHandler(key, value) {
	const thirdCharCode = key.charCodeAt(2);
	return key[0] === "o" && key[1] === "n" && thirdCharCode >= 65 && thirdCharCode <= 90 && typeof value === "function";
}
function mergeSlotProps$1(externalSlotProps, defaultSlotProps) {
	if (!externalSlotProps) return defaultSlotProps;
	function extractHandlers(externalSlotPropsValue, defaultSlotPropsValue) {
		const handlers = {};
		Object.keys(defaultSlotPropsValue).forEach((key) => {
			if (isEventHandler(key, defaultSlotPropsValue[key]) && typeof externalSlotPropsValue[key] === "function") handlers[key] = (...args) => {
				externalSlotPropsValue[key](...args);
				defaultSlotPropsValue[key](...args);
			};
		});
		return handlers;
	}
	if (typeof externalSlotProps === "function" || typeof defaultSlotProps === "function") return (ownerState) => {
		const defaultSlotPropsValue = typeof defaultSlotProps === "function" ? defaultSlotProps(ownerState) : defaultSlotProps;
		const externalSlotPropsValue = typeof externalSlotProps === "function" ? externalSlotProps({
			...ownerState,
			...defaultSlotPropsValue
		}) : externalSlotProps;
		const className = clsx(ownerState?.className, defaultSlotPropsValue?.className, externalSlotPropsValue?.className);
		const handlers = extractHandlers(externalSlotPropsValue, defaultSlotPropsValue);
		return {
			...defaultSlotPropsValue,
			...externalSlotPropsValue,
			...handlers,
			...!!className && { className },
			...defaultSlotPropsValue?.style && externalSlotPropsValue?.style && { style: {
				...defaultSlotPropsValue.style,
				...externalSlotPropsValue.style
			} },
			...defaultSlotPropsValue?.sx && externalSlotPropsValue?.sx && { sx: [...Array.isArray(defaultSlotPropsValue.sx) ? defaultSlotPropsValue.sx : [defaultSlotPropsValue.sx], ...Array.isArray(externalSlotPropsValue.sx) ? externalSlotPropsValue.sx : [externalSlotPropsValue.sx]] }
		};
	};
	const typedDefaultSlotProps = defaultSlotProps;
	const handlers = extractHandlers(externalSlotProps, typedDefaultSlotProps);
	const className = clsx(typedDefaultSlotProps?.className, externalSlotProps?.className);
	return {
		...defaultSlotProps,
		...externalSlotProps,
		...handlers,
		...!!className && { className },
		...typedDefaultSlotProps?.style && externalSlotProps?.style && { style: {
			...typedDefaultSlotProps.style,
			...externalSlotProps.style
		} },
		...typedDefaultSlotProps?.sx && externalSlotProps?.sx && { sx: [...Array.isArray(typedDefaultSlotProps.sx) ? typedDefaultSlotProps.sx : [typedDefaultSlotProps.sx], ...Array.isArray(externalSlotProps.sx) ? externalSlotProps.sx : [externalSlotProps.sx]] }
	};
}
var reflow = (node) => node.scrollTop;
function getTransitionProps(props, options) {
	const { timeout, easing, style = {} } = props;
	return {
		duration: style.transitionDuration ?? (typeof timeout === "number" ? timeout : timeout[options.mode] || 0),
		easing: style.transitionTimingFunction ?? (typeof easing === "object" ? easing[options.mode] : easing),
		delay: style.transitionDelay
	};
}
function getPaperUtilityClass(slot) {
	return generateUtilityClass("MuiPaper", slot);
}
generateUtilityClasses("MuiPaper", [
	"root",
	"rounded",
	"outlined",
	"elevation",
	"elevation0",
	"elevation1",
	"elevation2",
	"elevation3",
	"elevation4",
	"elevation5",
	"elevation6",
	"elevation7",
	"elevation8",
	"elevation9",
	"elevation10",
	"elevation11",
	"elevation12",
	"elevation13",
	"elevation14",
	"elevation15",
	"elevation16",
	"elevation17",
	"elevation18",
	"elevation19",
	"elevation20",
	"elevation21",
	"elevation22",
	"elevation23",
	"elevation24"
]);
var useUtilityClasses$23 = (ownerState) => {
	const { square, elevation, variant, classes } = ownerState;
	return composeClasses({ root: [
		"root",
		variant,
		!square && "rounded",
		variant === "elevation" && `elevation${elevation}`
	] }, getPaperUtilityClass, classes);
};
var PaperRoot = styled$1("div", {
	name: "MuiPaper",
	slot: "Root",
	overridesResolver: (props, styles) => {
		const { ownerState } = props;
		return [
			styles.root,
			styles[ownerState.variant],
			!ownerState.square && styles.rounded,
			ownerState.variant === "elevation" && styles[`elevation${ownerState.elevation}`]
		];
	}
})(memoTheme(({ theme }) => ({
	backgroundColor: (theme.vars || theme).palette.background.paper,
	color: (theme.vars || theme).palette.text.primary,
	transition: theme.transitions.create("box-shadow"),
	variants: [
		{
			props: ({ ownerState }) => !ownerState.square,
			style: { borderRadius: theme.shape.borderRadius }
		},
		{
			props: { variant: "outlined" },
			style: { border: `1px solid ${(theme.vars || theme).palette.divider}` }
		},
		{
			props: { variant: "elevation" },
			style: {
				boxShadow: "var(--Paper-shadow)",
				backgroundImage: "var(--Paper-overlay)"
			}
		}
	]
})));
var Paper = /*#__PURE__*/ import_react.forwardRef(function Paper(inProps, ref) {
	const props = useDefaultProps$1({
		props: inProps,
		name: "MuiPaper"
	});
	const theme = useTheme$1();
	const { className, component = "div", elevation = 1, square = false, variant = "elevation", ...other } = props;
	const ownerState = {
		...props,
		component,
		elevation,
		square,
		variant
	};
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(PaperRoot, {
		as: component,
		ownerState,
		className: clsx(useUtilityClasses$23(ownerState).root, className),
		ref,
		...other,
		style: {
			...variant === "elevation" && {
				"--Paper-shadow": (theme.vars || theme).shadows[elevation],
				...theme.vars && { "--Paper-overlay": theme.vars.overlays?.[elevation] },
				...!theme.vars && theme.palette.mode === "dark" && { "--Paper-overlay": `linear-gradient(${alpha("#fff", getOverlayAlpha(elevation))}, ${alpha("#fff", getOverlayAlpha(elevation))})` }
			},
			...other.style
		}
	});
});
/**
* An internal function to create a Material UI slot.
*
* This is an advanced version of Base UI `useSlotProps` because Material UI allows leaf component to be customized via `component` prop
* while Base UI does not need to support leaf component customization.
*
* @param {string} name: name of the slot
* @param {object} parameters
* @returns {[Slot, slotProps]} The slot's React component and the slot's props
*
* Note: the returned slot's props
* - will never contain `component` prop.
* - might contain `as` prop.
*/
function useSlot(name, parameters) {
	const { className, elementType: initialElementType, ownerState, externalForwardedProps, internalForwardedProps, shouldForwardComponentProp = false, ...useSlotPropsParams } = parameters;
	const { component: rootComponent, slots = { [name]: void 0 }, slotProps = { [name]: void 0 }, ...other } = externalForwardedProps;
	const elementType = slots[name] || initialElementType;
	const resolvedComponentsProps = resolveComponentProps(slotProps[name], ownerState);
	const { props: { component: slotComponent, ...mergedProps }, internalRef } = mergeSlotProps({
		className,
		...useSlotPropsParams,
		externalForwardedProps: name === "root" ? other : void 0,
		externalSlotProps: resolvedComponentsProps
	});
	const ref = useForkRef(internalRef, resolvedComponentsProps?.ref, parameters.ref);
	const LeafComponent = name === "root" ? slotComponent || rootComponent : slotComponent;
	return [elementType, appendOwnerState(elementType, {
		...name === "root" && !rootComponent && !slots[name] && internalForwardedProps,
		...name !== "root" && !slots[name] && internalForwardedProps,
		...mergedProps,
		...LeafComponent && !shouldForwardComponentProp && { as: LeafComponent },
		...LeafComponent && shouldForwardComponentProp && { component: LeafComponent },
		ref
	}, ownerState)];
}
/**
* Lazy initialization container for the Ripple instance. This improves
* performance by delaying mounting the ripple until it's needed.
*/
var LazyRipple = class LazyRipple {
	/** React ref to the ripple instance */
	/** If the ripple component should be mounted */
	/** Promise that resolves when the ripple component is mounted */
	/** If the ripple component has been mounted */
	/** React state hook setter */
	static create() {
		return new LazyRipple();
	}
	static use() {
		const ripple = useLazyRef(LazyRipple.create).current;
		const [shouldMount, setShouldMount] = import_react.useState(false);
		ripple.shouldMount = shouldMount;
		ripple.setShouldMount = setShouldMount;
		import_react.useEffect(ripple.mountEffect, [shouldMount]);
		return ripple;
	}
	constructor() {
		this.ref = { current: null };
		this.mounted = null;
		this.didMount = false;
		this.shouldMount = false;
		this.setShouldMount = null;
	}
	mount() {
		if (!this.mounted) {
			this.mounted = createControlledPromise();
			this.shouldMount = true;
			this.setShouldMount(this.shouldMount);
		}
		return this.mounted;
	}
	mountEffect = () => {
		if (this.shouldMount && !this.didMount) {
			if (this.ref.current !== null) {
				this.didMount = true;
				this.mounted.resolve();
			}
		}
	};
	start(...args) {
		this.mount().then(() => this.ref.current?.start(...args));
	}
	stop(...args) {
		this.mount().then(() => this.ref.current?.stop(...args));
	}
	pulsate(...args) {
		this.mount().then(() => this.ref.current?.pulsate(...args));
	}
};
function useLazyRipple() {
	return LazyRipple.use();
}
function createControlledPromise() {
	let resolve;
	let reject;
	const p = new Promise((resolveFn, rejectFn) => {
		resolve = resolveFn;
		reject = rejectFn;
	});
	p.resolve = resolve;
	p.reject = reject;
	return p;
}
/**
* @ignore - internal component.
*/
function Ripple(props) {
	const { className, classes, pulsate = false, rippleX, rippleY, rippleSize, in: inProp, onExited, timeout } = props;
	const [leaving, setLeaving] = import_react.useState(false);
	const rippleClassName = clsx(className, classes.ripple, classes.rippleVisible, pulsate && classes.ripplePulsate);
	const rippleStyles = {
		width: rippleSize,
		height: rippleSize,
		top: -(rippleSize / 2) + rippleY,
		left: -(rippleSize / 2) + rippleX
	};
	const childClassName = clsx(classes.child, leaving && classes.childLeaving, pulsate && classes.childPulsate);
	if (!inProp && !leaving) setLeaving(true);
	import_react.useEffect(() => {
		if (!inProp && onExited != null) {
			const timeoutId = setTimeout(onExited, timeout);
			return () => {
				clearTimeout(timeoutId);
			};
		}
	}, [
		onExited,
		inProp,
		timeout
	]);
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)("span", {
		className: rippleClassName,
		style: rippleStyles,
		children: /*#__PURE__*/ (0, import_jsx_runtime.jsx)("span", { className: childClassName })
	});
}
var touchRippleClasses = generateUtilityClasses("MuiTouchRipple", [
	"root",
	"ripple",
	"rippleVisible",
	"ripplePulsate",
	"child",
	"childLeaving",
	"childPulsate"
]);
var DURATION = 550;
var enterKeyframe = import_emotion_react_edge_light_cjs.keyframes`
  0% {
    transform: scale(0);
    opacity: 0.1;
  }

  100% {
    transform: scale(1);
    opacity: 0.3;
  }
`;
var exitKeyframe = import_emotion_react_edge_light_cjs.keyframes`
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
`;
var pulsateKeyframe = import_emotion_react_edge_light_cjs.keyframes`
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(0.92);
  }

  100% {
    transform: scale(1);
  }
`;
var TouchRippleRoot = styled$1("span", {
	name: "MuiTouchRipple",
	slot: "Root"
})({
	overflow: "hidden",
	pointerEvents: "none",
	position: "absolute",
	zIndex: 0,
	top: 0,
	right: 0,
	bottom: 0,
	left: 0,
	borderRadius: "inherit"
});
var TouchRippleRipple = styled$1(Ripple, {
	name: "MuiTouchRipple",
	slot: "Ripple"
})`
  opacity: 0;
  position: absolute;

  &.${touchRippleClasses.rippleVisible} {
    opacity: 0.3;
    transform: scale(1);
    animation-name: ${enterKeyframe};
    animation-duration: ${DURATION}ms;
    animation-timing-function: ${({ theme }) => theme.transitions.easing.easeInOut};
  }

  &.${touchRippleClasses.ripplePulsate} {
    animation-duration: ${({ theme }) => theme.transitions.duration.shorter}ms;
  }

  & .${touchRippleClasses.child} {
    opacity: 1;
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: currentColor;
  }

  & .${touchRippleClasses.childLeaving} {
    opacity: 0;
    animation-name: ${exitKeyframe};
    animation-duration: ${DURATION}ms;
    animation-timing-function: ${({ theme }) => theme.transitions.easing.easeInOut};
  }

  & .${touchRippleClasses.childPulsate} {
    position: absolute;
    /* @noflip */
    left: 0px;
    top: 0;
    animation-name: ${pulsateKeyframe};
    animation-duration: 2500ms;
    animation-timing-function: ${({ theme }) => theme.transitions.easing.easeInOut};
    animation-iteration-count: infinite;
    animation-delay: 200ms;
  }
`;
/**
* @ignore - internal component.
*
* TODO v5: Make private
*/
var TouchRipple = /*#__PURE__*/ import_react.forwardRef(function TouchRipple(inProps, ref) {
	const { center: centerProp = false, classes = {}, className, ...other } = useDefaultProps$1({
		props: inProps,
		name: "MuiTouchRipple"
	});
	const [ripples, setRipples] = import_react.useState([]);
	const nextKey = import_react.useRef(0);
	const rippleCallback = import_react.useRef(null);
	import_react.useEffect(() => {
		if (rippleCallback.current) {
			rippleCallback.current();
			rippleCallback.current = null;
		}
	}, [ripples]);
	const ignoringMouseDown = import_react.useRef(false);
	const startTimer = useTimeout();
	const startTimerCommit = import_react.useRef(null);
	const container = import_react.useRef(null);
	const startCommit = import_react.useCallback((params) => {
		const { pulsate, rippleX, rippleY, rippleSize, cb } = params;
		setRipples((oldRipples) => [...oldRipples, /*#__PURE__*/ (0, import_jsx_runtime.jsx)(TouchRippleRipple, {
			classes: {
				ripple: clsx(classes.ripple, touchRippleClasses.ripple),
				rippleVisible: clsx(classes.rippleVisible, touchRippleClasses.rippleVisible),
				ripplePulsate: clsx(classes.ripplePulsate, touchRippleClasses.ripplePulsate),
				child: clsx(classes.child, touchRippleClasses.child),
				childLeaving: clsx(classes.childLeaving, touchRippleClasses.childLeaving),
				childPulsate: clsx(classes.childPulsate, touchRippleClasses.childPulsate)
			},
			timeout: DURATION,
			pulsate,
			rippleX,
			rippleY,
			rippleSize
		}, nextKey.current)]);
		nextKey.current += 1;
		rippleCallback.current = cb;
	}, [classes]);
	const start = import_react.useCallback((event = {}, options = {}, cb = () => {}) => {
		const { pulsate = false, center = centerProp || options.pulsate, fakeElement = false } = options;
		if (event?.type === "mousedown" && ignoringMouseDown.current) {
			ignoringMouseDown.current = false;
			return;
		}
		if (event?.type === "touchstart") ignoringMouseDown.current = true;
		const element = fakeElement ? null : container.current;
		const rect = element ? element.getBoundingClientRect() : {
			width: 0,
			height: 0,
			left: 0,
			top: 0
		};
		let rippleX;
		let rippleY;
		let rippleSize;
		if (center || event === void 0 || event.clientX === 0 && event.clientY === 0 || !event.clientX && !event.touches) {
			rippleX = Math.round(rect.width / 2);
			rippleY = Math.round(rect.height / 2);
		} else {
			const { clientX, clientY } = event.touches && event.touches.length > 0 ? event.touches[0] : event;
			rippleX = Math.round(clientX - rect.left);
			rippleY = Math.round(clientY - rect.top);
		}
		if (center) {
			rippleSize = Math.sqrt((2 * rect.width ** 2 + rect.height ** 2) / 3);
			if (rippleSize % 2 === 0) rippleSize += 1;
		} else {
			const sizeX = Math.max(Math.abs((element ? element.clientWidth : 0) - rippleX), rippleX) * 2 + 2;
			const sizeY = Math.max(Math.abs((element ? element.clientHeight : 0) - rippleY), rippleY) * 2 + 2;
			rippleSize = Math.sqrt(sizeX ** 2 + sizeY ** 2);
		}
		if (event?.touches) {
			if (startTimerCommit.current === null) {
				startTimerCommit.current = () => {
					startCommit({
						pulsate,
						rippleX,
						rippleY,
						rippleSize,
						cb
					});
				};
				startTimer.start(80, () => {
					if (startTimerCommit.current) {
						startTimerCommit.current();
						startTimerCommit.current = null;
					}
				});
			}
		} else startCommit({
			pulsate,
			rippleX,
			rippleY,
			rippleSize,
			cb
		});
	}, [
		centerProp,
		startCommit,
		startTimer
	]);
	const pulsate = import_react.useCallback(() => {
		start({}, { pulsate: true });
	}, [start]);
	const stop = import_react.useCallback((event, cb) => {
		startTimer.clear();
		if (event?.type === "touchend" && startTimerCommit.current) {
			startTimerCommit.current();
			startTimerCommit.current = null;
			startTimer.start(0, () => {
				stop(event, cb);
			});
			return;
		}
		startTimerCommit.current = null;
		setRipples((oldRipples) => {
			if (oldRipples.length > 0) return oldRipples.slice(1);
			return oldRipples;
		});
		rippleCallback.current = cb;
	}, [startTimer]);
	import_react.useImperativeHandle(ref, () => ({
		pulsate,
		start,
		stop
	}), [
		pulsate,
		start,
		stop
	]);
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(TouchRippleRoot, {
		className: clsx(touchRippleClasses.root, classes.root, className),
		ref: container,
		...other,
		children: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(TransitionGroup, {
			component: null,
			exit: true,
			children: ripples
		})
	});
});
function getButtonBaseUtilityClass(slot) {
	return generateUtilityClass("MuiButtonBase", slot);
}
var buttonBaseClasses = generateUtilityClasses("MuiButtonBase", [
	"root",
	"disabled",
	"focusVisible"
]);
var useUtilityClasses$22 = (ownerState) => {
	const { disabled, focusVisible, focusVisibleClassName, classes } = ownerState;
	const composedClasses = composeClasses({ root: [
		"root",
		disabled && "disabled",
		focusVisible && "focusVisible"
	] }, getButtonBaseUtilityClass, classes);
	if (focusVisible && focusVisibleClassName) composedClasses.root += ` ${focusVisibleClassName}`;
	return composedClasses;
};
var ButtonBaseRoot = styled$1("button", {
	name: "MuiButtonBase",
	slot: "Root"
})({
	display: "inline-flex",
	alignItems: "center",
	justifyContent: "center",
	position: "relative",
	boxSizing: "border-box",
	WebkitTapHighlightColor: "transparent",
	backgroundColor: "transparent",
	outline: 0,
	border: 0,
	margin: 0,
	borderRadius: 0,
	padding: 0,
	cursor: "pointer",
	userSelect: "none",
	verticalAlign: "middle",
	MozAppearance: "none",
	WebkitAppearance: "none",
	textDecoration: "none",
	color: "inherit",
	"&::-moz-focus-inner": { borderStyle: "none" },
	[`&.${buttonBaseClasses.disabled}`]: {
		pointerEvents: "none",
		cursor: "default"
	},
	"@media print": { colorAdjust: "exact" }
});
/**
* `ButtonBase` contains as few styles as possible.
* It aims to be a simple building block for creating a button.
* It contains a load of style reset and some focus/ripple logic.
*/
var ButtonBase = /*#__PURE__*/ import_react.forwardRef(function ButtonBase(inProps, ref) {
	const props = useDefaultProps$1({
		props: inProps,
		name: "MuiButtonBase"
	});
	const { action, centerRipple = false, children, className, component = "button", disabled = false, disableRipple = false, disableTouchRipple = false, focusRipple = false, focusVisibleClassName, LinkComponent = "a", onBlur, onClick, onContextMenu, onDragLeave, onFocus, onFocusVisible, onKeyDown, onKeyUp, onMouseDown, onMouseLeave, onMouseUp, onTouchEnd, onTouchMove, onTouchStart, tabIndex = 0, TouchRippleProps, touchRippleRef, type, ...other } = props;
	const buttonRef = import_react.useRef(null);
	const ripple = useLazyRipple();
	const handleRippleRef = useForkRef_default(ripple.ref, touchRippleRef);
	const [focusVisible, setFocusVisible] = import_react.useState(false);
	if (disabled && focusVisible) setFocusVisible(false);
	import_react.useImperativeHandle(action, () => ({ focusVisible: () => {
		setFocusVisible(true);
		buttonRef.current.focus();
	} }), []);
	const enableTouchRipple = ripple.shouldMount && !disableRipple && !disabled;
	import_react.useEffect(() => {
		if (focusVisible && focusRipple && !disableRipple) ripple.pulsate();
	}, [
		disableRipple,
		focusRipple,
		focusVisible,
		ripple
	]);
	const handleMouseDown = useRippleHandler(ripple, "start", onMouseDown, disableTouchRipple);
	const handleContextMenu = useRippleHandler(ripple, "stop", onContextMenu, disableTouchRipple);
	const handleDragLeave = useRippleHandler(ripple, "stop", onDragLeave, disableTouchRipple);
	const handleMouseUp = useRippleHandler(ripple, "stop", onMouseUp, disableTouchRipple);
	const handleMouseLeave = useRippleHandler(ripple, "stop", (event) => {
		if (focusVisible) event.preventDefault();
		if (onMouseLeave) onMouseLeave(event);
	}, disableTouchRipple);
	const handleTouchStart = useRippleHandler(ripple, "start", onTouchStart, disableTouchRipple);
	const handleTouchEnd = useRippleHandler(ripple, "stop", onTouchEnd, disableTouchRipple);
	const handleTouchMove = useRippleHandler(ripple, "stop", onTouchMove, disableTouchRipple);
	const handleBlur = useRippleHandler(ripple, "stop", (event) => {
		if (!isFocusVisible(event.target)) setFocusVisible(false);
		if (onBlur) onBlur(event);
	}, false);
	const handleFocus = useEventCallback_default((event) => {
		if (!buttonRef.current) buttonRef.current = event.currentTarget;
		if (isFocusVisible(event.target)) {
			setFocusVisible(true);
			if (onFocusVisible) onFocusVisible(event);
		}
		if (onFocus) onFocus(event);
	});
	const isNonNativeButton = () => {
		const button = buttonRef.current;
		return component && component !== "button" && !(button.tagName === "A" && button.href);
	};
	const handleKeyDown = useEventCallback_default((event) => {
		if (focusRipple && !event.repeat && focusVisible && event.key === " ") ripple.stop(event, () => {
			ripple.start(event);
		});
		if (event.target === event.currentTarget && isNonNativeButton() && event.key === " ") event.preventDefault();
		if (onKeyDown) onKeyDown(event);
		if (event.target === event.currentTarget && isNonNativeButton() && event.key === "Enter" && !disabled) {
			event.preventDefault();
			if (onClick) onClick(event);
		}
	});
	const handleKeyUp = useEventCallback_default((event) => {
		if (focusRipple && event.key === " " && focusVisible && !event.defaultPrevented) ripple.stop(event, () => {
			ripple.pulsate(event);
		});
		if (onKeyUp) onKeyUp(event);
		if (onClick && event.target === event.currentTarget && isNonNativeButton() && event.key === " " && !event.defaultPrevented) onClick(event);
	});
	let ComponentProp = component;
	if (ComponentProp === "button" && (other.href || other.to)) ComponentProp = LinkComponent;
	const buttonProps = {};
	if (ComponentProp === "button") {
		buttonProps.type = type === void 0 ? "button" : type;
		buttonProps.disabled = disabled;
	} else {
		if (!other.href && !other.to) buttonProps.role = "button";
		if (disabled) buttonProps["aria-disabled"] = disabled;
	}
	const handleRef = useForkRef_default(ref, buttonRef);
	const ownerState = {
		...props,
		centerRipple,
		component,
		disabled,
		disableRipple,
		disableTouchRipple,
		focusRipple,
		tabIndex,
		focusVisible
	};
	const classes = useUtilityClasses$22(ownerState);
	return /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(ButtonBaseRoot, {
		as: ComponentProp,
		className: clsx(classes.root, className),
		ownerState,
		onBlur: handleBlur,
		onClick,
		onContextMenu: handleContextMenu,
		onFocus: handleFocus,
		onKeyDown: handleKeyDown,
		onKeyUp: handleKeyUp,
		onMouseDown: handleMouseDown,
		onMouseLeave: handleMouseLeave,
		onMouseUp: handleMouseUp,
		onDragLeave: handleDragLeave,
		onTouchEnd: handleTouchEnd,
		onTouchMove: handleTouchMove,
		onTouchStart: handleTouchStart,
		ref: handleRef,
		tabIndex: disabled ? -1 : tabIndex,
		type,
		...buttonProps,
		...other,
		children: [children, enableTouchRipple ? /*#__PURE__*/ (0, import_jsx_runtime.jsx)(TouchRipple, {
			ref: handleRippleRef,
			center: centerRipple,
			...TouchRippleProps
		}) : null]
	});
});
function useRippleHandler(ripple, rippleAction, eventCallback, skipRippleAction = false) {
	return useEventCallback_default((event) => {
		if (eventCallback) eventCallback(event);
		if (!skipRippleAction) ripple[rippleAction](event);
		return true;
	});
}
/**
* Type guard to check if the object has a "main" property of type string.
*
* @param obj - the object to check
* @returns boolean
*/
function hasCorrectMainProperty(obj) {
	return typeof obj.main === "string";
}
/**
* Checks if the object conforms to the SimplePaletteColorOptions type.
* The minimum requirement is that the object has a "main" property of type string, this is always checked.
* Optionally, you can pass additional properties to check.
*
* @param obj - The object to check
* @param additionalPropertiesToCheck - Array containing "light", "dark", and/or "contrastText"
* @returns boolean
*/
function checkSimplePaletteColorValues(obj, additionalPropertiesToCheck = []) {
	if (!hasCorrectMainProperty(obj)) return false;
	for (const value of additionalPropertiesToCheck) if (!obj.hasOwnProperty(value) || typeof obj[value] !== "string") return false;
	return true;
}
/**
* Creates a filter function used to filter simple palette color options.
* The minimum requirement is that the object has a "main" property of type string, this is always checked.
* Optionally, you can pass additional properties to check.
*
* @param additionalPropertiesToCheck - Array containing "light", "dark", and/or "contrastText"
* @returns ([, value]: [any, PaletteColorOptions]) => boolean
*/
function createSimplePaletteValueFilter(additionalPropertiesToCheck = []) {
	return ([, value]) => value && checkSimplePaletteColorValues(value, additionalPropertiesToCheck);
}
function getAlertUtilityClass(slot) {
	return generateUtilityClass("MuiAlert", slot);
}
var alertClasses = generateUtilityClasses("MuiAlert", [
	"root",
	"action",
	"icon",
	"message",
	"filled",
	"colorSuccess",
	"colorInfo",
	"colorWarning",
	"colorError",
	"filledSuccess",
	"filledInfo",
	"filledWarning",
	"filledError",
	"outlined",
	"outlinedSuccess",
	"outlinedInfo",
	"outlinedWarning",
	"outlinedError",
	"standard",
	"standardSuccess",
	"standardInfo",
	"standardWarning",
	"standardError"
]);
function getCircularProgressUtilityClass(slot) {
	return generateUtilityClass("MuiCircularProgress", slot);
}
generateUtilityClasses("MuiCircularProgress", [
	"root",
	"determinate",
	"indeterminate",
	"colorPrimary",
	"colorSecondary",
	"svg",
	"track",
	"circle",
	"circleDeterminate",
	"circleIndeterminate",
	"circleDisableShrink"
]);
var SIZE = 44;
var circularRotateKeyframe = import_emotion_react_edge_light_cjs.keyframes`
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
`;
var circularDashKeyframe = import_emotion_react_edge_light_cjs.keyframes`
  0% {
    stroke-dasharray: 1px, 200px;
    stroke-dashoffset: 0;
  }

  50% {
    stroke-dasharray: 100px, 200px;
    stroke-dashoffset: -15px;
  }

  100% {
    stroke-dasharray: 1px, 200px;
    stroke-dashoffset: -126px;
  }
`;
var rotateAnimation = typeof circularRotateKeyframe !== "string" ? import_emotion_react_edge_light_cjs.css`
        animation: ${circularRotateKeyframe} 1.4s linear infinite;
      ` : null;
var dashAnimation = typeof circularDashKeyframe !== "string" ? import_emotion_react_edge_light_cjs.css`
        animation: ${circularDashKeyframe} 1.4s ease-in-out infinite;
      ` : null;
var useUtilityClasses$21 = (ownerState) => {
	const { classes, variant, color, disableShrink } = ownerState;
	return composeClasses({
		root: [
			"root",
			variant,
			`color${capitalize_default(color)}`
		],
		svg: ["svg"],
		track: ["track"],
		circle: [
			"circle",
			`circle${capitalize_default(variant)}`,
			disableShrink && "circleDisableShrink"
		]
	}, getCircularProgressUtilityClass, classes);
};
var CircularProgressRoot = styled$1("span", {
	name: "MuiCircularProgress",
	slot: "Root",
	overridesResolver: (props, styles) => {
		const { ownerState } = props;
		return [
			styles.root,
			styles[ownerState.variant],
			styles[`color${capitalize_default(ownerState.color)}`]
		];
	}
})(memoTheme(({ theme }) => ({
	display: "inline-block",
	variants: [
		{
			props: { variant: "determinate" },
			style: { transition: theme.transitions.create("transform") }
		},
		{
			props: { variant: "indeterminate" },
			style: rotateAnimation || { animation: `${circularRotateKeyframe} 1.4s linear infinite` }
		},
		...Object.entries(theme.palette).filter(createSimplePaletteValueFilter()).map(([color]) => ({
			props: { color },
			style: { color: (theme.vars || theme).palette[color].main }
		}))
	]
})));
var CircularProgressSVG = styled$1("svg", {
	name: "MuiCircularProgress",
	slot: "Svg"
})({ display: "block" });
var CircularProgressCircle = styled$1("circle", {
	name: "MuiCircularProgress",
	slot: "Circle",
	overridesResolver: (props, styles) => {
		const { ownerState } = props;
		return [
			styles.circle,
			styles[`circle${capitalize_default(ownerState.variant)}`],
			ownerState.disableShrink && styles.circleDisableShrink
		];
	}
})(memoTheme(({ theme }) => ({
	stroke: "currentColor",
	variants: [
		{
			props: { variant: "determinate" },
			style: { transition: theme.transitions.create("stroke-dashoffset") }
		},
		{
			props: { variant: "indeterminate" },
			style: {
				strokeDasharray: "80px, 200px",
				strokeDashoffset: 0
			}
		},
		{
			props: ({ ownerState }) => ownerState.variant === "indeterminate" && !ownerState.disableShrink,
			style: dashAnimation || { animation: `${circularDashKeyframe} 1.4s ease-in-out infinite` }
		}
	]
})));
var CircularProgressTrack = styled$1("circle", {
	name: "MuiCircularProgress",
	slot: "Track"
})(memoTheme(({ theme }) => ({
	stroke: "currentColor",
	opacity: (theme.vars || theme).palette.action.activatedOpacity
})));
/**
* ## ARIA
*
* If the progress bar is describing the loading progress of a particular region of a page,
* you should use `aria-describedby` to point to the progress bar, and set the `aria-busy`
* attribute to `true` on that region until it has finished loading.
*/
var CircularProgress = /*#__PURE__*/ import_react.forwardRef(function CircularProgress(inProps, ref) {
	const props = useDefaultProps$1({
		props: inProps,
		name: "MuiCircularProgress"
	});
	const { className, color = "primary", disableShrink = false, enableTrackSlot = false, size = 40, style, thickness = 3.6, value = 0, variant = "indeterminate", ...other } = props;
	const ownerState = {
		...props,
		color,
		disableShrink,
		size,
		thickness,
		value,
		variant,
		enableTrackSlot
	};
	const classes = useUtilityClasses$21(ownerState);
	const circleStyle = {};
	const rootStyle = {};
	const rootProps = {};
	if (variant === "determinate") {
		const circumference = 2 * Math.PI * ((SIZE - thickness) / 2);
		circleStyle.strokeDasharray = circumference.toFixed(3);
		rootProps["aria-valuenow"] = Math.round(value);
		circleStyle.strokeDashoffset = `${((100 - value) / 100 * circumference).toFixed(3)}px`;
		rootStyle.transform = "rotate(-90deg)";
	}
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(CircularProgressRoot, {
		className: clsx(classes.root, className),
		style: {
			width: size,
			height: size,
			...rootStyle,
			...style
		},
		ownerState,
		ref,
		role: "progressbar",
		...rootProps,
		...other,
		children: /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(CircularProgressSVG, {
			className: classes.svg,
			ownerState,
			viewBox: `${SIZE / 2} ${SIZE / 2} ${SIZE} ${SIZE}`,
			children: [enableTrackSlot ? /*#__PURE__*/ (0, import_jsx_runtime.jsx)(CircularProgressTrack, {
				className: classes.track,
				ownerState,
				cx: SIZE,
				cy: SIZE,
				r: (SIZE - thickness) / 2,
				fill: "none",
				strokeWidth: thickness,
				"aria-hidden": "true"
			}) : null, /*#__PURE__*/ (0, import_jsx_runtime.jsx)(CircularProgressCircle, {
				className: classes.circle,
				style: circleStyle,
				ownerState,
				cx: SIZE,
				cy: SIZE,
				r: (SIZE - thickness) / 2,
				fill: "none",
				strokeWidth: thickness
			})]
		})
	});
});
function getIconButtonUtilityClass(slot) {
	return generateUtilityClass("MuiIconButton", slot);
}
var iconButtonClasses = generateUtilityClasses("MuiIconButton", [
	"root",
	"disabled",
	"colorInherit",
	"colorPrimary",
	"colorSecondary",
	"colorError",
	"colorInfo",
	"colorSuccess",
	"colorWarning",
	"edgeStart",
	"edgeEnd",
	"sizeSmall",
	"sizeMedium",
	"sizeLarge",
	"loading",
	"loadingIndicator",
	"loadingWrapper"
]);
var useUtilityClasses$20 = (ownerState) => {
	const { classes, disabled, color, edge, size, loading } = ownerState;
	return composeClasses({
		root: [
			"root",
			loading && "loading",
			disabled && "disabled",
			color !== "default" && `color${capitalize_default(color)}`,
			edge && `edge${capitalize_default(edge)}`,
			`size${capitalize_default(size)}`
		],
		loadingIndicator: ["loadingIndicator"],
		loadingWrapper: ["loadingWrapper"]
	}, getIconButtonUtilityClass, classes);
};
var IconButtonRoot = styled$1(ButtonBase, {
	name: "MuiIconButton",
	slot: "Root",
	overridesResolver: (props, styles) => {
		const { ownerState } = props;
		return [
			styles.root,
			ownerState.loading && styles.loading,
			ownerState.color !== "default" && styles[`color${capitalize_default(ownerState.color)}`],
			ownerState.edge && styles[`edge${capitalize_default(ownerState.edge)}`],
			styles[`size${capitalize_default(ownerState.size)}`]
		];
	}
})(memoTheme(({ theme }) => ({
	textAlign: "center",
	flex: "0 0 auto",
	fontSize: theme.typography.pxToRem(24),
	padding: 8,
	borderRadius: "50%",
	color: (theme.vars || theme).palette.action.active,
	transition: theme.transitions.create("background-color", { duration: theme.transitions.duration.shortest }),
	variants: [
		{
			props: (props) => !props.disableRipple,
			style: {
				"--IconButton-hoverBg": theme.alpha((theme.vars || theme).palette.action.active, (theme.vars || theme).palette.action.hoverOpacity),
				"&:hover": {
					backgroundColor: "var(--IconButton-hoverBg)",
					"@media (hover: none)": { backgroundColor: "transparent" }
				}
			}
		},
		{
			props: { edge: "start" },
			style: { marginLeft: -12 }
		},
		{
			props: {
				edge: "start",
				size: "small"
			},
			style: { marginLeft: -3 }
		},
		{
			props: { edge: "end" },
			style: { marginRight: -12 }
		},
		{
			props: {
				edge: "end",
				size: "small"
			},
			style: { marginRight: -3 }
		}
	]
})), memoTheme(({ theme }) => ({
	variants: [
		{
			props: { color: "inherit" },
			style: { color: "inherit" }
		},
		...Object.entries(theme.palette).filter(createSimplePaletteValueFilter()).map(([color]) => ({
			props: { color },
			style: { color: (theme.vars || theme).palette[color].main }
		})),
		...Object.entries(theme.palette).filter(createSimplePaletteValueFilter()).map(([color]) => ({
			props: { color },
			style: { "--IconButton-hoverBg": theme.alpha((theme.vars || theme).palette[color].main, (theme.vars || theme).palette.action.hoverOpacity) }
		})),
		{
			props: { size: "small" },
			style: {
				padding: 5,
				fontSize: theme.typography.pxToRem(18)
			}
		},
		{
			props: { size: "large" },
			style: {
				padding: 12,
				fontSize: theme.typography.pxToRem(28)
			}
		}
	],
	[`&.${iconButtonClasses.disabled}`]: {
		backgroundColor: "transparent",
		color: (theme.vars || theme).palette.action.disabled
	},
	[`&.${iconButtonClasses.loading}`]: { color: "transparent" }
})));
var IconButtonLoadingIndicator = styled$1("span", {
	name: "MuiIconButton",
	slot: "LoadingIndicator"
})(({ theme }) => ({
	display: "none",
	position: "absolute",
	visibility: "visible",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	color: (theme.vars || theme).palette.action.disabled,
	variants: [{
		props: { loading: true },
		style: { display: "flex" }
	}]
}));
/**
* Refer to the [Icons](/material-ui/icons/) section of the documentation
* regarding the available icon options.
*/
var IconButton = /*#__PURE__*/ import_react.forwardRef(function IconButton(inProps, ref) {
	const props = useDefaultProps$1({
		props: inProps,
		name: "MuiIconButton"
	});
	const { edge = false, children, className, color = "default", disabled = false, disableFocusRipple = false, size = "medium", id: idProp, loading = null, loadingIndicator: loadingIndicatorProp, ...other } = props;
	const loadingId = useId_default(idProp);
	const loadingIndicator = loadingIndicatorProp ?? /*#__PURE__*/ (0, import_jsx_runtime.jsx)(CircularProgress, {
		"aria-labelledby": loadingId,
		color: "inherit",
		size: 16
	});
	const ownerState = {
		...props,
		edge,
		color,
		disabled,
		disableFocusRipple,
		loading,
		loadingIndicator,
		size
	};
	const classes = useUtilityClasses$20(ownerState);
	return /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(IconButtonRoot, {
		id: loading ? loadingId : idProp,
		className: clsx(classes.root, className),
		centerRipple: true,
		focusRipple: !disableFocusRipple,
		disabled: disabled || loading,
		ref,
		...other,
		ownerState,
		children: [typeof loading === "boolean" && /*#__PURE__*/ (0, import_jsx_runtime.jsx)("span", {
			className: classes.loadingWrapper,
			style: { display: "contents" },
			children: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(IconButtonLoadingIndicator, {
				className: classes.loadingIndicator,
				ownerState,
				children: loading && loadingIndicator
			})
		}), children]
	});
});
/**
* @ignore - internal component.
*/
var SuccessOutlined_default = createSvgIcon(/*#__PURE__*/ (0, import_jsx_runtime.jsx)("path", { d: "M20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4C12.76,4 13.5,4.11 14.2, 4.31L15.77,2.74C14.61,2.26 13.34,2 12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0, 0 22,12M7.91,10.08L6.5,11.5L11,16L21,6L19.59,4.58L11,13.17L7.91,10.08Z" }), "SuccessOutlined");
/**
* @ignore - internal component.
*/
var ReportProblemOutlined_default = createSvgIcon(/*#__PURE__*/ (0, import_jsx_runtime.jsx)("path", { d: "M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z" }), "ReportProblemOutlined");
/**
* @ignore - internal component.
*/
var ErrorOutline_default = createSvgIcon(/*#__PURE__*/ (0, import_jsx_runtime.jsx)("path", { d: "M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" }), "ErrorOutline");
/**
* @ignore - internal component.
*/
var InfoOutlined_default = createSvgIcon(/*#__PURE__*/ (0, import_jsx_runtime.jsx)("path", { d: "M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20, 12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10, 10 0 0,0 12,2M11,17H13V11H11V17Z" }), "InfoOutlined");
/**
* @ignore - internal component.
*
* Alias to `Clear`.
*/
var Close_default = createSvgIcon(/*#__PURE__*/ (0, import_jsx_runtime.jsx)("path", { d: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" }), "Close");
var useUtilityClasses$19 = (ownerState) => {
	const { variant, color, severity, classes } = ownerState;
	return composeClasses({
		root: [
			"root",
			`color${capitalize_default(color || severity)}`,
			`${variant}${capitalize_default(color || severity)}`,
			`${variant}`
		],
		icon: ["icon"],
		message: ["message"],
		action: ["action"]
	}, getAlertUtilityClass, classes);
};
var AlertRoot = styled$1(Paper, {
	name: "MuiAlert",
	slot: "Root",
	overridesResolver: (props, styles) => {
		const { ownerState } = props;
		return [
			styles.root,
			styles[ownerState.variant],
			styles[`${ownerState.variant}${capitalize_default(ownerState.color || ownerState.severity)}`]
		];
	}
})(memoTheme(({ theme }) => {
	const getColor = theme.palette.mode === "light" ? theme.darken : theme.lighten;
	const getBackgroundColor = theme.palette.mode === "light" ? theme.lighten : theme.darken;
	return {
		...theme.typography.body2,
		backgroundColor: "transparent",
		display: "flex",
		padding: "6px 16px",
		variants: [
			...Object.entries(theme.palette).filter(createSimplePaletteValueFilter(["light"])).map(([color]) => ({
				props: {
					colorSeverity: color,
					variant: "standard"
				},
				style: {
					color: theme.vars ? theme.vars.palette.Alert[`${color}Color`] : getColor(theme.palette[color].light, .6),
					backgroundColor: theme.vars ? theme.vars.palette.Alert[`${color}StandardBg`] : getBackgroundColor(theme.palette[color].light, .9),
					[`& .${alertClasses.icon}`]: theme.vars ? { color: theme.vars.palette.Alert[`${color}IconColor`] } : { color: theme.palette[color].main }
				}
			})),
			...Object.entries(theme.palette).filter(createSimplePaletteValueFilter(["light"])).map(([color]) => ({
				props: {
					colorSeverity: color,
					variant: "outlined"
				},
				style: {
					color: theme.vars ? theme.vars.palette.Alert[`${color}Color`] : getColor(theme.palette[color].light, .6),
					border: `1px solid ${(theme.vars || theme).palette[color].light}`,
					[`& .${alertClasses.icon}`]: theme.vars ? { color: theme.vars.palette.Alert[`${color}IconColor`] } : { color: theme.palette[color].main }
				}
			})),
			...Object.entries(theme.palette).filter(createSimplePaletteValueFilter(["dark"])).map(([color]) => ({
				props: {
					colorSeverity: color,
					variant: "filled"
				},
				style: {
					fontWeight: theme.typography.fontWeightMedium,
					...theme.vars ? {
						color: theme.vars.palette.Alert[`${color}FilledColor`],
						backgroundColor: theme.vars.palette.Alert[`${color}FilledBg`]
					} : {
						backgroundColor: theme.palette.mode === "dark" ? theme.palette[color].dark : theme.palette[color].main,
						color: theme.palette.getContrastText(theme.palette[color].main)
					}
				}
			}))
		]
	};
}));
var AlertIcon = styled$1("div", {
	name: "MuiAlert",
	slot: "Icon"
})({
	marginRight: 12,
	padding: "7px 0",
	display: "flex",
	fontSize: 22,
	opacity: .9
});
var AlertMessage = styled$1("div", {
	name: "MuiAlert",
	slot: "Message"
})({
	padding: "8px 0",
	minWidth: 0,
	overflow: "auto"
});
var AlertAction = styled$1("div", {
	name: "MuiAlert",
	slot: "Action"
})({
	display: "flex",
	alignItems: "flex-start",
	padding: "4px 0 0 16px",
	marginLeft: "auto",
	marginRight: -8
});
var defaultIconMapping = {
	success: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(SuccessOutlined_default, { fontSize: "inherit" }),
	warning: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(ReportProblemOutlined_default, { fontSize: "inherit" }),
	error: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(ErrorOutline_default, { fontSize: "inherit" }),
	info: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(InfoOutlined_default, { fontSize: "inherit" })
};
var Alert = /*#__PURE__*/ import_react.forwardRef(function Alert(inProps, ref) {
	const props = useDefaultProps$1({
		props: inProps,
		name: "MuiAlert"
	});
	const { action, children, className, closeText = "Close", color, components = {}, componentsProps = {}, icon, iconMapping = defaultIconMapping, onClose, role = "alert", severity = "success", slotProps = {}, slots = {}, variant = "standard", ...other } = props;
	const ownerState = {
		...props,
		color,
		severity,
		variant,
		colorSeverity: color || severity
	};
	const classes = useUtilityClasses$19(ownerState);
	const externalForwardedProps = {
		slots: {
			closeButton: components.CloseButton,
			closeIcon: components.CloseIcon,
			...slots
		},
		slotProps: {
			...componentsProps,
			...slotProps
		}
	};
	const [RootSlot, rootSlotProps] = useSlot("root", {
		ref,
		shouldForwardComponentProp: true,
		className: clsx(classes.root, className),
		elementType: AlertRoot,
		externalForwardedProps: {
			...externalForwardedProps,
			...other
		},
		ownerState,
		additionalProps: {
			role,
			elevation: 0
		}
	});
	const [IconSlot, iconSlotProps] = useSlot("icon", {
		className: classes.icon,
		elementType: AlertIcon,
		externalForwardedProps,
		ownerState
	});
	const [MessageSlot, messageSlotProps] = useSlot("message", {
		className: classes.message,
		elementType: AlertMessage,
		externalForwardedProps,
		ownerState
	});
	const [ActionSlot, actionSlotProps] = useSlot("action", {
		className: classes.action,
		elementType: AlertAction,
		externalForwardedProps,
		ownerState
	});
	const [CloseButtonSlot, closeButtonProps] = useSlot("closeButton", {
		elementType: IconButton,
		externalForwardedProps,
		ownerState
	});
	const [CloseIconSlot, closeIconProps] = useSlot("closeIcon", {
		elementType: Close_default,
		externalForwardedProps,
		ownerState
	});
	return /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(RootSlot, {
		...rootSlotProps,
		children: [
			icon !== false ? /*#__PURE__*/ (0, import_jsx_runtime.jsx)(IconSlot, {
				...iconSlotProps,
				children: icon || iconMapping[severity] || defaultIconMapping[severity]
			}) : null,
			/*#__PURE__*/ (0, import_jsx_runtime.jsx)(MessageSlot, {
				...messageSlotProps,
				children
			}),
			action != null ? /*#__PURE__*/ (0, import_jsx_runtime.jsx)(ActionSlot, {
				...actionSlotProps,
				children: action
			}) : null,
			action == null && onClose ? /*#__PURE__*/ (0, import_jsx_runtime.jsx)(ActionSlot, {
				...actionSlotProps,
				children: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(CloseButtonSlot, {
					size: "small",
					"aria-label": closeText,
					title: closeText,
					color: "inherit",
					onClick: onClose,
					...closeButtonProps,
					children: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(CloseIconSlot, {
						fontSize: "small",
						...closeIconProps
					})
				})
			}) : null
		]
	});
});
function getTypographyUtilityClass(slot) {
	return generateUtilityClass("MuiTypography", slot);
}
var typographyClasses = generateUtilityClasses("MuiTypography", [
	"root",
	"h1",
	"h2",
	"h3",
	"h4",
	"h5",
	"h6",
	"subtitle1",
	"subtitle2",
	"body1",
	"body2",
	"inherit",
	"button",
	"caption",
	"overline",
	"alignLeft",
	"alignRight",
	"alignCenter",
	"alignJustify",
	"noWrap",
	"gutterBottom",
	"paragraph"
]);
var v6Colors = {
	primary: true,
	secondary: true,
	error: true,
	info: true,
	success: true,
	warning: true,
	textPrimary: true,
	textSecondary: true,
	textDisabled: true
};
var extendSxProp$1 = internal_createExtendSxProp();
var useUtilityClasses$18 = (ownerState) => {
	const { align, gutterBottom, noWrap, paragraph, variant, classes } = ownerState;
	return composeClasses({ root: [
		"root",
		variant,
		ownerState.align !== "inherit" && `align${capitalize_default(align)}`,
		gutterBottom && "gutterBottom",
		noWrap && "noWrap",
		paragraph && "paragraph"
	] }, getTypographyUtilityClass, classes);
};
var TypographyRoot = styled$1("span", {
	name: "MuiTypography",
	slot: "Root",
	overridesResolver: (props, styles) => {
		const { ownerState } = props;
		return [
			styles.root,
			ownerState.variant && styles[ownerState.variant],
			ownerState.align !== "inherit" && styles[`align${capitalize_default(ownerState.align)}`],
			ownerState.noWrap && styles.noWrap,
			ownerState.gutterBottom && styles.gutterBottom,
			ownerState.paragraph && styles.paragraph
		];
	}
})(memoTheme(({ theme }) => ({
	margin: 0,
	variants: [
		{
			props: { variant: "inherit" },
			style: {
				font: "inherit",
				lineHeight: "inherit",
				letterSpacing: "inherit"
			}
		},
		...Object.entries(theme.typography).filter(([variant, value]) => variant !== "inherit" && value && typeof value === "object").map(([variant, value]) => ({
			props: { variant },
			style: value
		})),
		...Object.entries(theme.palette).filter(createSimplePaletteValueFilter()).map(([color]) => ({
			props: { color },
			style: { color: (theme.vars || theme).palette[color].main }
		})),
		...Object.entries(theme.palette?.text || {}).filter(([, value]) => typeof value === "string").map(([color]) => ({
			props: { color: `text${capitalize_default(color)}` },
			style: { color: (theme.vars || theme).palette.text[color] }
		})),
		{
			props: ({ ownerState }) => ownerState.align !== "inherit",
			style: { textAlign: "var(--Typography-textAlign)" }
		},
		{
			props: ({ ownerState }) => ownerState.noWrap,
			style: {
				overflow: "hidden",
				textOverflow: "ellipsis",
				whiteSpace: "nowrap"
			}
		},
		{
			props: ({ ownerState }) => ownerState.gutterBottom,
			style: { marginBottom: "0.35em" }
		},
		{
			props: ({ ownerState }) => ownerState.paragraph,
			style: { marginBottom: 16 }
		}
	]
})));
var defaultVariantMapping = {
	h1: "h1",
	h2: "h2",
	h3: "h3",
	h4: "h4",
	h5: "h5",
	h6: "h6",
	subtitle1: "h6",
	subtitle2: "h6",
	body1: "p",
	body2: "p",
	inherit: "p"
};
var Typography = /*#__PURE__*/ import_react.forwardRef(function Typography(inProps, ref) {
	const { color, ...themeProps } = useDefaultProps$1({
		props: inProps,
		name: "MuiTypography"
	});
	const isSxColor = !v6Colors[color];
	const props = extendSxProp$1({
		...themeProps,
		...isSxColor && { color }
	});
	const { align = "inherit", className, component, gutterBottom = false, noWrap = false, paragraph = false, variant = "body1", variantMapping = defaultVariantMapping, ...other } = props;
	const ownerState = {
		...props,
		align,
		color,
		className,
		component,
		gutterBottom,
		noWrap,
		paragraph,
		variant,
		variantMapping
	};
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(TypographyRoot, {
		as: component || (paragraph ? "p" : variantMapping[variant] || defaultVariantMapping[variant]) || "span",
		ref,
		className: clsx(useUtilityClasses$18(ownerState).root, className),
		...other,
		ownerState,
		style: {
			...align !== "inherit" && { "--Typography-textAlign": align },
			...other.style
		}
	});
});
function getContainer$1(container) {
	return typeof container === "function" ? container() : container;
}
/**
* Portals provide a first-class way to render children into a DOM node
* that exists outside the DOM hierarchy of the parent component.
*
* Demos:
*
* - [Portal](https://mui.com/material-ui/react-portal/)
*
* API:
*
* - [Portal API](https://mui.com/material-ui/api/portal/)
*/
var Portal = /*#__PURE__*/ import_react.forwardRef(function Portal(props, forwardedRef) {
	const { children, container, disablePortal = false } = props;
	const [mountNode, setMountNode] = import_react.useState(null);
	const handleRef = useForkRef(/*#__PURE__*/ import_react.isValidElement(children) ? getReactElementRef(children) : null, forwardedRef);
	useEnhancedEffect(() => {
		if (!disablePortal) setMountNode(getContainer$1(container) || document.body);
	}, [container, disablePortal]);
	useEnhancedEffect(() => {
		if (mountNode && !disablePortal) {
			setRef(forwardedRef, mountNode);
			return () => {
				setRef(forwardedRef, null);
			};
		}
	}, [
		forwardedRef,
		mountNode,
		disablePortal
	]);
	if (disablePortal) {
		if (/*#__PURE__*/ import_react.isValidElement(children)) {
			const newProps = { ref: handleRef };
			return /*#__PURE__*/ import_react.cloneElement(children, newProps);
		}
		return children;
	}
	return mountNode ? /*#__PURE__*/ import_react_dom.createPortal(children, mountNode) : mountNode;
});
function getStyleValue(value) {
	return parseInt(value, 10) || 0;
}
var styles$2 = { shadow: {
	visibility: "hidden",
	position: "absolute",
	overflow: "hidden",
	height: 0,
	top: 0,
	left: 0,
	transform: "translateZ(0)"
} };
function isObjectEmpty(object) {
	for (const _ in object) return false;
	return true;
}
function isEmpty$1(obj) {
	return isObjectEmpty(obj) || obj.outerHeightStyle === 0 && !obj.overflowing;
}
/**
*
* Demos:
*
* - [Textarea Autosize](https://mui.com/material-ui/react-textarea-autosize/)
*
* API:
*
* - [TextareaAutosize API](https://mui.com/material-ui/api/textarea-autosize/)
*/
var TextareaAutosize = /*#__PURE__*/ import_react.forwardRef(function TextareaAutosize(props, forwardedRef) {
	const { onChange, maxRows, minRows = 1, style, value, ...other } = props;
	const { current: isControlled } = import_react.useRef(value != null);
	const textareaRef = import_react.useRef(null);
	const handleRef = useForkRef(forwardedRef, textareaRef);
	const heightRef = import_react.useRef(null);
	const hiddenTextareaRef = import_react.useRef(null);
	const calculateTextareaStyles = import_react.useCallback(() => {
		const textarea = textareaRef.current;
		const hiddenTextarea = hiddenTextareaRef.current;
		if (!textarea || !hiddenTextarea) return;
		const computedStyle = ownerWindow(textarea).getComputedStyle(textarea);
		if (computedStyle.width === "0px") return {
			outerHeightStyle: 0,
			overflowing: false
		};
		hiddenTextarea.style.width = computedStyle.width;
		hiddenTextarea.value = textarea.value || props.placeholder || "x";
		if (hiddenTextarea.value.slice(-1) === "\n") hiddenTextarea.value += " ";
		const boxSizing = computedStyle.boxSizing;
		const padding = getStyleValue(computedStyle.paddingBottom) + getStyleValue(computedStyle.paddingTop);
		const border = getStyleValue(computedStyle.borderBottomWidth) + getStyleValue(computedStyle.borderTopWidth);
		const innerHeight = hiddenTextarea.scrollHeight;
		hiddenTextarea.value = "x";
		const singleRowHeight = hiddenTextarea.scrollHeight;
		let outerHeight = innerHeight;
		if (minRows) outerHeight = Math.max(Number(minRows) * singleRowHeight, outerHeight);
		if (maxRows) outerHeight = Math.min(Number(maxRows) * singleRowHeight, outerHeight);
		outerHeight = Math.max(outerHeight, singleRowHeight);
		return {
			outerHeightStyle: outerHeight + (boxSizing === "border-box" ? padding + border : 0),
			overflowing: Math.abs(outerHeight - innerHeight) <= 1
		};
	}, [
		maxRows,
		minRows,
		props.placeholder
	]);
	const didHeightChange = useEventCallback(() => {
		const textarea = textareaRef.current;
		const textareaStyles = calculateTextareaStyles();
		if (!textarea || !textareaStyles || isEmpty$1(textareaStyles)) return false;
		const outerHeightStyle = textareaStyles.outerHeightStyle;
		return heightRef.current != null && heightRef.current !== outerHeightStyle;
	});
	const syncHeight = import_react.useCallback(() => {
		const textarea = textareaRef.current;
		const textareaStyles = calculateTextareaStyles();
		if (!textarea || !textareaStyles || isEmpty$1(textareaStyles)) return;
		const outerHeightStyle = textareaStyles.outerHeightStyle;
		if (heightRef.current !== outerHeightStyle) {
			heightRef.current = outerHeightStyle;
			textarea.style.height = `${outerHeightStyle}px`;
		}
		textarea.style.overflow = textareaStyles.overflowing ? "hidden" : "";
	}, [calculateTextareaStyles]);
	const frameRef = import_react.useRef(-1);
	useEnhancedEffect(() => {
		const debouncedHandleResize = debounce(syncHeight);
		const textarea = textareaRef?.current;
		if (!textarea) return;
		const containerWindow = ownerWindow(textarea);
		containerWindow.addEventListener("resize", debouncedHandleResize);
		let resizeObserver;
		if (typeof ResizeObserver !== "undefined") {
			resizeObserver = new ResizeObserver(() => {
				if (didHeightChange()) {
					resizeObserver.unobserve(textarea);
					cancelAnimationFrame(frameRef.current);
					syncHeight();
					frameRef.current = requestAnimationFrame(() => {
						resizeObserver.observe(textarea);
					});
				}
			});
			resizeObserver.observe(textarea);
		}
		return () => {
			debouncedHandleResize.clear();
			cancelAnimationFrame(frameRef.current);
			containerWindow.removeEventListener("resize", debouncedHandleResize);
			if (resizeObserver) resizeObserver.disconnect();
		};
	}, [
		calculateTextareaStyles,
		syncHeight,
		didHeightChange
	]);
	useEnhancedEffect(() => {
		syncHeight();
	});
	const handleChange = (event) => {
		if (!isControlled) syncHeight();
		const textarea = event.target;
		const countOfCharacters = textarea.value.length;
		const isLastCharacterNewLine = textarea.value.endsWith("\n");
		const isEndOfTheLine = textarea.selectionStart === countOfCharacters;
		if (isLastCharacterNewLine && isEndOfTheLine) textarea.setSelectionRange(countOfCharacters, countOfCharacters);
		if (onChange) onChange(event);
	};
	return /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [/*#__PURE__*/ (0, import_jsx_runtime.jsx)("textarea", {
		value,
		onChange: handleChange,
		ref: handleRef,
		rows: minRows,
		style,
		...other
	}), /*#__PURE__*/ (0, import_jsx_runtime.jsx)("textarea", {
		"aria-hidden": true,
		className: props.className,
		readOnly: true,
		ref: hiddenTextareaRef,
		tabIndex: -1,
		style: {
			...styles$2.shadow,
			...style,
			paddingTop: 0,
			paddingBottom: 0
		}
	})] });
});
function formControlState({ props, states, muiFormControl }) {
	return states.reduce((acc, state) => {
		acc[state] = props[state];
		if (muiFormControl) {
			if (typeof props[state] === "undefined") acc[state] = muiFormControl[state];
		}
		return acc;
	}, {});
}
/**
* @ignore - internal component.
*/
var FormControlContext = /*#__PURE__*/ import_react.createContext(void 0);
function useFormControl() {
	return import_react.useContext(FormControlContext);
}
function hasValue(value) {
	return value != null && !(Array.isArray(value) && value.length === 0);
}
function isFilled(obj, SSR = false) {
	return obj && (hasValue(obj.value) && obj.value !== "" || SSR && hasValue(obj.defaultValue) && obj.defaultValue !== "");
}
function isAdornedStart(obj) {
	return obj.startAdornment;
}
function getInputBaseUtilityClass(slot) {
	return generateUtilityClass("MuiInputBase", slot);
}
var inputBaseClasses = generateUtilityClasses("MuiInputBase", [
	"root",
	"formControl",
	"focused",
	"disabled",
	"adornedStart",
	"adornedEnd",
	"error",
	"sizeSmall",
	"multiline",
	"colorSecondary",
	"fullWidth",
	"hiddenLabel",
	"readOnly",
	"input",
	"inputSizeSmall",
	"inputMultiline",
	"inputTypeSearch",
	"inputAdornedStart",
	"inputAdornedEnd",
	"inputHiddenLabel"
]);
var _InputGlobalStyles;
var rootOverridesResolver = (props, styles) => {
	const { ownerState } = props;
	return [
		styles.root,
		ownerState.formControl && styles.formControl,
		ownerState.startAdornment && styles.adornedStart,
		ownerState.endAdornment && styles.adornedEnd,
		ownerState.error && styles.error,
		ownerState.size === "small" && styles.sizeSmall,
		ownerState.multiline && styles.multiline,
		ownerState.color && styles[`color${capitalize_default(ownerState.color)}`],
		ownerState.fullWidth && styles.fullWidth,
		ownerState.hiddenLabel && styles.hiddenLabel
	];
};
var inputOverridesResolver = (props, styles) => {
	const { ownerState } = props;
	return [
		styles.input,
		ownerState.size === "small" && styles.inputSizeSmall,
		ownerState.multiline && styles.inputMultiline,
		ownerState.type === "search" && styles.inputTypeSearch,
		ownerState.startAdornment && styles.inputAdornedStart,
		ownerState.endAdornment && styles.inputAdornedEnd,
		ownerState.hiddenLabel && styles.inputHiddenLabel
	];
};
var useUtilityClasses$17 = (ownerState) => {
	const { classes, color, disabled, error, endAdornment, focused, formControl, fullWidth, hiddenLabel, multiline, readOnly, size, startAdornment, type } = ownerState;
	return composeClasses({
		root: [
			"root",
			`color${capitalize_default(color)}`,
			disabled && "disabled",
			error && "error",
			fullWidth && "fullWidth",
			focused && "focused",
			formControl && "formControl",
			size && size !== "medium" && `size${capitalize_default(size)}`,
			multiline && "multiline",
			startAdornment && "adornedStart",
			endAdornment && "adornedEnd",
			hiddenLabel && "hiddenLabel",
			readOnly && "readOnly"
		],
		input: [
			"input",
			disabled && "disabled",
			type === "search" && "inputTypeSearch",
			multiline && "inputMultiline",
			size === "small" && "inputSizeSmall",
			hiddenLabel && "inputHiddenLabel",
			startAdornment && "inputAdornedStart",
			endAdornment && "inputAdornedEnd",
			readOnly && "readOnly"
		]
	}, getInputBaseUtilityClass, classes);
};
var InputBaseRoot = styled$1("div", {
	name: "MuiInputBase",
	slot: "Root",
	overridesResolver: rootOverridesResolver
})(memoTheme(({ theme }) => ({
	...theme.typography.body1,
	color: (theme.vars || theme).palette.text.primary,
	lineHeight: "1.4375em",
	boxSizing: "border-box",
	position: "relative",
	cursor: "text",
	display: "inline-flex",
	alignItems: "center",
	[`&.${inputBaseClasses.disabled}`]: {
		color: (theme.vars || theme).palette.text.disabled,
		cursor: "default"
	},
	variants: [
		{
			props: ({ ownerState }) => ownerState.multiline,
			style: { padding: "4px 0 5px" }
		},
		{
			props: ({ ownerState, size }) => ownerState.multiline && size === "small",
			style: { paddingTop: 1 }
		},
		{
			props: ({ ownerState }) => ownerState.fullWidth,
			style: { width: "100%" }
		}
	]
})));
var InputBaseInput = styled$1("input", {
	name: "MuiInputBase",
	slot: "Input",
	overridesResolver: inputOverridesResolver
})(memoTheme(({ theme }) => {
	const light = theme.palette.mode === "light";
	const placeholder = {
		color: "currentColor",
		...theme.vars ? { opacity: theme.vars.opacity.inputPlaceholder } : { opacity: light ? .42 : .5 },
		transition: theme.transitions.create("opacity", { duration: theme.transitions.duration.shorter })
	};
	const placeholderHidden = { opacity: "0 !important" };
	const placeholderVisible = theme.vars ? { opacity: theme.vars.opacity.inputPlaceholder } : { opacity: light ? .42 : .5 };
	return {
		font: "inherit",
		letterSpacing: "inherit",
		color: "currentColor",
		padding: "4px 0 5px",
		border: 0,
		boxSizing: "content-box",
		background: "none",
		height: "1.4375em",
		margin: 0,
		WebkitTapHighlightColor: "transparent",
		display: "block",
		minWidth: 0,
		width: "100%",
		"&::-webkit-input-placeholder": placeholder,
		"&::-moz-placeholder": placeholder,
		"&::-ms-input-placeholder": placeholder,
		"&:focus": { outline: 0 },
		"&:invalid": { boxShadow: "none" },
		"&::-webkit-search-decoration": { WebkitAppearance: "none" },
		[`label[data-shrink=false] + .${inputBaseClasses.formControl} &`]: {
			"&::-webkit-input-placeholder": placeholderHidden,
			"&::-moz-placeholder": placeholderHidden,
			"&::-ms-input-placeholder": placeholderHidden,
			"&:focus::-webkit-input-placeholder": placeholderVisible,
			"&:focus::-moz-placeholder": placeholderVisible,
			"&:focus::-ms-input-placeholder": placeholderVisible
		},
		[`&.${inputBaseClasses.disabled}`]: {
			opacity: 1,
			WebkitTextFillColor: (theme.vars || theme).palette.text.disabled
		},
		variants: [
			{
				props: ({ ownerState }) => !ownerState.disableInjectingGlobalStyles,
				style: {
					animationName: "mui-auto-fill-cancel",
					animationDuration: "10ms",
					"&:-webkit-autofill": {
						animationDuration: "5000s",
						animationName: "mui-auto-fill"
					}
				}
			},
			{
				props: { size: "small" },
				style: { paddingTop: 1 }
			},
			{
				props: ({ ownerState }) => ownerState.multiline,
				style: {
					height: "auto",
					resize: "none",
					padding: 0,
					paddingTop: 0
				}
			},
			{
				props: { type: "search" },
				style: { MozAppearance: "textfield" }
			}
		]
	};
}));
var InputGlobalStyles = globalCss({
	"@keyframes mui-auto-fill": { from: { display: "block" } },
	"@keyframes mui-auto-fill-cancel": { from: { display: "block" } }
});
/**
* `InputBase` contains as few styles as possible.
* It aims to be a simple building block for creating an input.
* It contains a load of style reset and some state logic.
*/
var InputBase = /*#__PURE__*/ import_react.forwardRef(function InputBase(inProps, ref) {
	const props = useDefaultProps$1({
		props: inProps,
		name: "MuiInputBase"
	});
	const { "aria-describedby": ariaDescribedby, autoComplete, autoFocus, className, color, components = {}, componentsProps = {}, defaultValue, disabled, disableInjectingGlobalStyles, endAdornment, error, fullWidth = false, id, inputComponent = "input", inputProps: inputPropsProp = {}, inputRef: inputRefProp, margin, maxRows, minRows, multiline = false, name, onBlur, onChange, onClick, onFocus, onKeyDown, onKeyUp, placeholder, readOnly, renderSuffix, rows, size, slotProps = {}, slots = {}, startAdornment, type = "text", value: valueProp, ...other } = props;
	const value = inputPropsProp.value != null ? inputPropsProp.value : valueProp;
	const { current: isControlled } = import_react.useRef(value != null);
	const inputRef = import_react.useRef();
	const handleInputRefWarning = import_react.useCallback((instance) => {}, []);
	const handleInputRef = useForkRef_default(inputRef, inputRefProp, inputPropsProp.ref, handleInputRefWarning);
	const [focused, setFocused] = import_react.useState(false);
	const muiFormControl = useFormControl();
	const fcs = formControlState({
		props,
		muiFormControl,
		states: [
			"color",
			"disabled",
			"error",
			"hiddenLabel",
			"size",
			"required",
			"filled"
		]
	});
	fcs.focused = muiFormControl ? muiFormControl.focused : focused;
	import_react.useEffect(() => {
		if (!muiFormControl && disabled && focused) {
			setFocused(false);
			if (onBlur) onBlur();
		}
	}, [
		muiFormControl,
		disabled,
		focused,
		onBlur
	]);
	const onFilled = muiFormControl && muiFormControl.onFilled;
	const onEmpty = muiFormControl && muiFormControl.onEmpty;
	const checkDirty = import_react.useCallback((obj) => {
		if (isFilled(obj)) {
			if (onFilled) onFilled();
		} else if (onEmpty) onEmpty();
	}, [onFilled, onEmpty]);
	useEnhancedEffect_default(() => {
		if (isControlled) checkDirty({ value });
	}, [
		value,
		checkDirty,
		isControlled
	]);
	const handleFocus = (event) => {
		if (onFocus) onFocus(event);
		if (inputPropsProp.onFocus) inputPropsProp.onFocus(event);
		if (muiFormControl && muiFormControl.onFocus) muiFormControl.onFocus(event);
		else setFocused(true);
	};
	const handleBlur = (event) => {
		if (onBlur) onBlur(event);
		if (inputPropsProp.onBlur) inputPropsProp.onBlur(event);
		if (muiFormControl && muiFormControl.onBlur) muiFormControl.onBlur(event);
		else setFocused(false);
	};
	const handleChange = (event, ...args) => {
		if (!isControlled) {
			const element = event.target || inputRef.current;
			if (element == null) throw new Error(formatMuiErrorMessage(1));
			checkDirty({ value: element.value });
		}
		if (inputPropsProp.onChange) inputPropsProp.onChange(event, ...args);
		if (onChange) onChange(event, ...args);
	};
	import_react.useEffect(() => {
		checkDirty(inputRef.current);
	}, []);
	const handleClick = (event) => {
		if (inputRef.current && event.currentTarget === event.target) inputRef.current.focus();
		if (onClick) onClick(event);
	};
	let InputComponent = inputComponent;
	let inputProps = inputPropsProp;
	if (multiline && InputComponent === "input") {
		if (rows) inputProps = {
			type: void 0,
			minRows: rows,
			maxRows: rows,
			...inputProps
		};
		else inputProps = {
			type: void 0,
			maxRows,
			minRows,
			...inputProps
		};
		InputComponent = TextareaAutosize;
	}
	const handleAutoFill = (event) => {
		checkDirty(event.animationName === "mui-auto-fill-cancel" ? inputRef.current : { value: "x" });
	};
	import_react.useEffect(() => {
		if (muiFormControl) muiFormControl.setAdornedStart(Boolean(startAdornment));
	}, [muiFormControl, startAdornment]);
	const ownerState = {
		...props,
		color: fcs.color || "primary",
		disabled: fcs.disabled,
		endAdornment,
		error: fcs.error,
		focused: fcs.focused,
		formControl: muiFormControl,
		fullWidth,
		hiddenLabel: fcs.hiddenLabel,
		multiline,
		size: fcs.size,
		startAdornment,
		type
	};
	const classes = useUtilityClasses$17(ownerState);
	const Root = slots.root || components.Root || InputBaseRoot;
	const rootProps = slotProps.root || componentsProps.root || {};
	const Input = slots.input || components.Input || InputBaseInput;
	inputProps = {
		...inputProps,
		...slotProps.input ?? componentsProps.input
	};
	return /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [!disableInjectingGlobalStyles && typeof InputGlobalStyles === "function" && (_InputGlobalStyles || (_InputGlobalStyles = /*#__PURE__*/ (0, import_jsx_runtime.jsx)(InputGlobalStyles, {}))), /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(Root, {
		...rootProps,
		ref,
		onClick: handleClick,
		...other,
		...!isHostComponent(Root) && { ownerState: {
			...ownerState,
			...rootProps.ownerState
		} },
		className: clsx(classes.root, rootProps.className, className, readOnly && "MuiInputBase-readOnly"),
		children: [
			startAdornment,
			/*#__PURE__*/ (0, import_jsx_runtime.jsx)(FormControlContext.Provider, {
				value: null,
				children: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(Input, {
					"aria-invalid": fcs.error,
					"aria-describedby": ariaDescribedby,
					autoComplete,
					autoFocus,
					defaultValue,
					disabled: fcs.disabled,
					id,
					onAnimationStart: handleAutoFill,
					name,
					placeholder,
					readOnly,
					required: fcs.required,
					rows,
					value,
					onKeyDown,
					onKeyUp,
					type,
					...inputProps,
					...!isHostComponent(Input) && {
						as: InputComponent,
						ownerState: {
							...ownerState,
							...inputProps.ownerState
						}
					},
					ref: handleInputRef,
					className: clsx(classes.input, inputProps.className, readOnly && "MuiInputBase-readOnly"),
					onBlur: handleBlur,
					onChange: handleChange,
					onFocus: handleFocus
				})
			}),
			endAdornment,
			renderSuffix ? renderSuffix({
				...fcs,
				startAdornment
			}) : null
		]
	})] });
});
function getInputUtilityClass(slot) {
	return generateUtilityClass("MuiInput", slot);
}
var inputClasses = {
	...inputBaseClasses,
	...generateUtilityClasses("MuiInput", [
		"root",
		"underline",
		"input"
	])
};
function getOutlinedInputUtilityClass(slot) {
	return generateUtilityClass("MuiOutlinedInput", slot);
}
var outlinedInputClasses = {
	...inputBaseClasses,
	...generateUtilityClasses("MuiOutlinedInput", [
		"root",
		"notchedOutline",
		"input"
	])
};
function getFilledInputUtilityClass(slot) {
	return generateUtilityClass("MuiFilledInput", slot);
}
var filledInputClasses = {
	...inputBaseClasses,
	...generateUtilityClasses("MuiFilledInput", [
		"root",
		"underline",
		"input",
		"adornedStart",
		"adornedEnd",
		"sizeSmall",
		"multiline",
		"hiddenLabel"
	])
};
/**
* @ignore - internal component.
*/
var ArrowDropDown_default = createSvgIcon(/*#__PURE__*/ (0, import_jsx_runtime.jsx)("path", { d: "M7 10l5 5 5-5z" }), "ArrowDropDown");
var styles$1 = {
	entering: { opacity: 1 },
	entered: { opacity: 1 }
};
/**
* The Fade transition is used by the [Modal](/material-ui/react-modal/) component.
* It uses [react-transition-group](https://github.com/reactjs/react-transition-group) internally.
*/
var Fade = /*#__PURE__*/ import_react.forwardRef(function Fade(props, ref) {
	const theme = useTheme$1();
	const defaultTimeout = {
		enter: theme.transitions.duration.enteringScreen,
		exit: theme.transitions.duration.leavingScreen
	};
	const { addEndListener, appear = true, children, easing, in: inProp, onEnter, onEntered, onEntering, onExit, onExited, onExiting, style, timeout = defaultTimeout, TransitionComponent = Transition, ...other } = props;
	const nodeRef = import_react.useRef(null);
	const handleRef = useForkRef_default(nodeRef, getReactElementRef(children), ref);
	const normalizedTransitionCallback = (callback) => (maybeIsAppearing) => {
		if (callback) {
			const node = nodeRef.current;
			if (maybeIsAppearing === void 0) callback(node);
			else callback(node, maybeIsAppearing);
		}
	};
	const handleEntering = normalizedTransitionCallback(onEntering);
	const handleEnter = normalizedTransitionCallback((node, isAppearing) => {
		reflow(node);
		const transitionProps = getTransitionProps({
			style,
			timeout,
			easing
		}, { mode: "enter" });
		node.style.webkitTransition = theme.transitions.create("opacity", transitionProps);
		node.style.transition = theme.transitions.create("opacity", transitionProps);
		if (onEnter) onEnter(node, isAppearing);
	});
	const handleEntered = normalizedTransitionCallback(onEntered);
	const handleExiting = normalizedTransitionCallback(onExiting);
	const handleExit = normalizedTransitionCallback((node) => {
		const transitionProps = getTransitionProps({
			style,
			timeout,
			easing
		}, { mode: "exit" });
		node.style.webkitTransition = theme.transitions.create("opacity", transitionProps);
		node.style.transition = theme.transitions.create("opacity", transitionProps);
		if (onExit) onExit(node);
	});
	const handleExited = normalizedTransitionCallback(onExited);
	const handleAddEndListener = (next) => {
		if (addEndListener) addEndListener(nodeRef.current, next);
	};
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(TransitionComponent, {
		appear,
		in: inProp,
		nodeRef,
		onEnter: handleEnter,
		onEntered: handleEntered,
		onEntering: handleEntering,
		onExit: handleExit,
		onExited: handleExited,
		onExiting: handleExiting,
		addEndListener: handleAddEndListener,
		timeout,
		...other,
		children: (state, { ownerState, ...restChildProps }) => {
			return /*#__PURE__*/ import_react.cloneElement(children, {
				style: {
					opacity: 0,
					visibility: state === "exited" && !inProp ? "hidden" : void 0,
					...styles$1[state],
					...style,
					...children.props.style
				},
				ref: handleRef,
				...restChildProps
			});
		}
	});
});
function getBackdropUtilityClass(slot) {
	return generateUtilityClass("MuiBackdrop", slot);
}
generateUtilityClasses("MuiBackdrop", ["root", "invisible"]);
var useUtilityClasses$16 = (ownerState) => {
	const { classes, invisible } = ownerState;
	return composeClasses({ root: ["root", invisible && "invisible"] }, getBackdropUtilityClass, classes);
};
var BackdropRoot = styled$1("div", {
	name: "MuiBackdrop",
	slot: "Root",
	overridesResolver: (props, styles) => {
		const { ownerState } = props;
		return [styles.root, ownerState.invisible && styles.invisible];
	}
})({
	position: "fixed",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	right: 0,
	bottom: 0,
	top: 0,
	left: 0,
	backgroundColor: "rgba(0, 0, 0, 0.5)",
	WebkitTapHighlightColor: "transparent",
	variants: [{
		props: { invisible: true },
		style: { backgroundColor: "transparent" }
	}]
});
var Backdrop = /*#__PURE__*/ import_react.forwardRef(function Backdrop(inProps, ref) {
	const props = useDefaultProps$1({
		props: inProps,
		name: "MuiBackdrop"
	});
	const { children, className, component = "div", invisible = false, open, components = {}, componentsProps = {}, slotProps = {}, slots = {}, TransitionComponent: TransitionComponentProp, transitionDuration, ...other } = props;
	const ownerState = {
		...props,
		component,
		invisible
	};
	const classes = useUtilityClasses$16(ownerState);
	const externalForwardedProps = {
		component,
		slots: {
			transition: TransitionComponentProp,
			root: components.Root,
			...slots
		},
		slotProps: {
			...componentsProps,
			...slotProps
		}
	};
	const [RootSlot, rootProps] = useSlot("root", {
		elementType: BackdropRoot,
		externalForwardedProps,
		className: clsx(classes.root, className),
		ownerState
	});
	const [TransitionSlot, transitionProps] = useSlot("transition", {
		elementType: Fade,
		externalForwardedProps,
		ownerState
	});
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(TransitionSlot, {
		in: open,
		timeout: transitionDuration,
		...other,
		...transitionProps,
		children: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(RootSlot, {
			"aria-hidden": true,
			...rootProps,
			classes,
			ref,
			children
		})
	});
});
var boxClasses = generateUtilityClasses("MuiBox", ["root"]);
var Box = createBox({
	themeId: identifier_default,
	defaultTheme: createTheme(),
	defaultClassName: boxClasses.root,
	generateClassName: ClassNameGenerator.generate
});
function getButtonUtilityClass(slot) {
	return generateUtilityClass("MuiButton", slot);
}
var buttonClasses = generateUtilityClasses("MuiButton", [
	"root",
	"text",
	"textInherit",
	"textPrimary",
	"textSecondary",
	"textSuccess",
	"textError",
	"textInfo",
	"textWarning",
	"outlined",
	"outlinedInherit",
	"outlinedPrimary",
	"outlinedSecondary",
	"outlinedSuccess",
	"outlinedError",
	"outlinedInfo",
	"outlinedWarning",
	"contained",
	"containedInherit",
	"containedPrimary",
	"containedSecondary",
	"containedSuccess",
	"containedError",
	"containedInfo",
	"containedWarning",
	"disableElevation",
	"focusVisible",
	"disabled",
	"colorInherit",
	"colorPrimary",
	"colorSecondary",
	"colorSuccess",
	"colorError",
	"colorInfo",
	"colorWarning",
	"textSizeSmall",
	"textSizeMedium",
	"textSizeLarge",
	"outlinedSizeSmall",
	"outlinedSizeMedium",
	"outlinedSizeLarge",
	"containedSizeSmall",
	"containedSizeMedium",
	"containedSizeLarge",
	"sizeMedium",
	"sizeSmall",
	"sizeLarge",
	"fullWidth",
	"startIcon",
	"endIcon",
	"icon",
	"iconSizeSmall",
	"iconSizeMedium",
	"iconSizeLarge",
	"loading",
	"loadingWrapper",
	"loadingIconPlaceholder",
	"loadingIndicator",
	"loadingPositionCenter",
	"loadingPositionStart",
	"loadingPositionEnd"
]);
/**
* @ignore - internal component.
*/
var ButtonGroupContext = /*#__PURE__*/ import_react.createContext({});
/**
* @ignore - internal component.
*/
var ButtonGroupButtonContext = /*#__PURE__*/ import_react.createContext(void 0);
var useUtilityClasses$15 = (ownerState) => {
	const { color, disableElevation, fullWidth, size, variant, loading, loadingPosition, classes } = ownerState;
	const composedClasses = composeClasses({
		root: [
			"root",
			loading && "loading",
			variant,
			`${variant}${capitalize_default(color)}`,
			`size${capitalize_default(size)}`,
			`${variant}Size${capitalize_default(size)}`,
			`color${capitalize_default(color)}`,
			disableElevation && "disableElevation",
			fullWidth && "fullWidth",
			loading && `loadingPosition${capitalize_default(loadingPosition)}`
		],
		startIcon: [
			"icon",
			"startIcon",
			`iconSize${capitalize_default(size)}`
		],
		endIcon: [
			"icon",
			"endIcon",
			`iconSize${capitalize_default(size)}`
		],
		loadingIndicator: ["loadingIndicator"],
		loadingWrapper: ["loadingWrapper"]
	}, getButtonUtilityClass, classes);
	return {
		...classes,
		...composedClasses
	};
};
var commonIconStyles = [
	{
		props: { size: "small" },
		style: { "& > *:nth-of-type(1)": { fontSize: 18 } }
	},
	{
		props: { size: "medium" },
		style: { "& > *:nth-of-type(1)": { fontSize: 20 } }
	},
	{
		props: { size: "large" },
		style: { "& > *:nth-of-type(1)": { fontSize: 22 } }
	}
];
var ButtonRoot = styled$1(ButtonBase, {
	shouldForwardProp: (prop) => rootShouldForwardProp(prop) || prop === "classes",
	name: "MuiButton",
	slot: "Root",
	overridesResolver: (props, styles) => {
		const { ownerState } = props;
		return [
			styles.root,
			styles[ownerState.variant],
			styles[`${ownerState.variant}${capitalize_default(ownerState.color)}`],
			styles[`size${capitalize_default(ownerState.size)}`],
			styles[`${ownerState.variant}Size${capitalize_default(ownerState.size)}`],
			ownerState.color === "inherit" && styles.colorInherit,
			ownerState.disableElevation && styles.disableElevation,
			ownerState.fullWidth && styles.fullWidth,
			ownerState.loading && styles.loading
		];
	}
})(memoTheme(({ theme }) => {
	const inheritContainedBackgroundColor = theme.palette.mode === "light" ? theme.palette.grey[300] : theme.palette.grey[800];
	const inheritContainedHoverBackgroundColor = theme.palette.mode === "light" ? theme.palette.grey.A100 : theme.palette.grey[700];
	return {
		...theme.typography.button,
		minWidth: 64,
		padding: "6px 16px",
		border: 0,
		borderRadius: (theme.vars || theme).shape.borderRadius,
		transition: theme.transitions.create([
			"background-color",
			"box-shadow",
			"border-color",
			"color"
		], { duration: theme.transitions.duration.short }),
		"&:hover": { textDecoration: "none" },
		[`&.${buttonClasses.disabled}`]: { color: (theme.vars || theme).palette.action.disabled },
		variants: [
			{
				props: { variant: "contained" },
				style: {
					color: `var(--variant-containedColor)`,
					backgroundColor: `var(--variant-containedBg)`,
					boxShadow: (theme.vars || theme).shadows[2],
					"&:hover": {
						boxShadow: (theme.vars || theme).shadows[4],
						"@media (hover: none)": { boxShadow: (theme.vars || theme).shadows[2] }
					},
					"&:active": { boxShadow: (theme.vars || theme).shadows[8] },
					[`&.${buttonClasses.focusVisible}`]: { boxShadow: (theme.vars || theme).shadows[6] },
					[`&.${buttonClasses.disabled}`]: {
						color: (theme.vars || theme).palette.action.disabled,
						boxShadow: (theme.vars || theme).shadows[0],
						backgroundColor: (theme.vars || theme).palette.action.disabledBackground
					}
				}
			},
			{
				props: { variant: "outlined" },
				style: {
					padding: "5px 15px",
					border: "1px solid currentColor",
					borderColor: `var(--variant-outlinedBorder, currentColor)`,
					backgroundColor: `var(--variant-outlinedBg)`,
					color: `var(--variant-outlinedColor)`,
					[`&.${buttonClasses.disabled}`]: { border: `1px solid ${(theme.vars || theme).palette.action.disabledBackground}` }
				}
			},
			{
				props: { variant: "text" },
				style: {
					padding: "6px 8px",
					color: `var(--variant-textColor)`,
					backgroundColor: `var(--variant-textBg)`
				}
			},
			...Object.entries(theme.palette).filter(createSimplePaletteValueFilter()).map(([color]) => ({
				props: { color },
				style: {
					"--variant-textColor": (theme.vars || theme).palette[color].main,
					"--variant-outlinedColor": (theme.vars || theme).palette[color].main,
					"--variant-outlinedBorder": theme.alpha((theme.vars || theme).palette[color].main, .5),
					"--variant-containedColor": (theme.vars || theme).palette[color].contrastText,
					"--variant-containedBg": (theme.vars || theme).palette[color].main,
					"@media (hover: hover)": { "&:hover": {
						"--variant-containedBg": (theme.vars || theme).palette[color].dark,
						"--variant-textBg": theme.alpha((theme.vars || theme).palette[color].main, (theme.vars || theme).palette.action.hoverOpacity),
						"--variant-outlinedBorder": (theme.vars || theme).palette[color].main,
						"--variant-outlinedBg": theme.alpha((theme.vars || theme).palette[color].main, (theme.vars || theme).palette.action.hoverOpacity)
					} }
				}
			})),
			{
				props: { color: "inherit" },
				style: {
					color: "inherit",
					borderColor: "currentColor",
					"--variant-containedBg": theme.vars ? theme.vars.palette.Button.inheritContainedBg : inheritContainedBackgroundColor,
					"@media (hover: hover)": { "&:hover": {
						"--variant-containedBg": theme.vars ? theme.vars.palette.Button.inheritContainedHoverBg : inheritContainedHoverBackgroundColor,
						"--variant-textBg": theme.alpha((theme.vars || theme).palette.text.primary, (theme.vars || theme).palette.action.hoverOpacity),
						"--variant-outlinedBg": theme.alpha((theme.vars || theme).palette.text.primary, (theme.vars || theme).palette.action.hoverOpacity)
					} }
				}
			},
			{
				props: {
					size: "small",
					variant: "text"
				},
				style: {
					padding: "4px 5px",
					fontSize: theme.typography.pxToRem(13)
				}
			},
			{
				props: {
					size: "large",
					variant: "text"
				},
				style: {
					padding: "8px 11px",
					fontSize: theme.typography.pxToRem(15)
				}
			},
			{
				props: {
					size: "small",
					variant: "outlined"
				},
				style: {
					padding: "3px 9px",
					fontSize: theme.typography.pxToRem(13)
				}
			},
			{
				props: {
					size: "large",
					variant: "outlined"
				},
				style: {
					padding: "7px 21px",
					fontSize: theme.typography.pxToRem(15)
				}
			},
			{
				props: {
					size: "small",
					variant: "contained"
				},
				style: {
					padding: "4px 10px",
					fontSize: theme.typography.pxToRem(13)
				}
			},
			{
				props: {
					size: "large",
					variant: "contained"
				},
				style: {
					padding: "8px 22px",
					fontSize: theme.typography.pxToRem(15)
				}
			},
			{
				props: { disableElevation: true },
				style: {
					boxShadow: "none",
					"&:hover": { boxShadow: "none" },
					[`&.${buttonClasses.focusVisible}`]: { boxShadow: "none" },
					"&:active": { boxShadow: "none" },
					[`&.${buttonClasses.disabled}`]: { boxShadow: "none" }
				}
			},
			{
				props: { fullWidth: true },
				style: { width: "100%" }
			},
			{
				props: { loadingPosition: "center" },
				style: {
					transition: theme.transitions.create([
						"background-color",
						"box-shadow",
						"border-color"
					], { duration: theme.transitions.duration.short }),
					[`&.${buttonClasses.loading}`]: { color: "transparent" }
				}
			}
		]
	};
}));
var ButtonStartIcon = styled$1("span", {
	name: "MuiButton",
	slot: "StartIcon",
	overridesResolver: (props, styles) => {
		const { ownerState } = props;
		return [
			styles.startIcon,
			ownerState.loading && styles.startIconLoadingStart,
			styles[`iconSize${capitalize_default(ownerState.size)}`]
		];
	}
})(({ theme }) => ({
	display: "inherit",
	marginRight: 8,
	marginLeft: -4,
	variants: [
		{
			props: { size: "small" },
			style: { marginLeft: -2 }
		},
		{
			props: {
				loadingPosition: "start",
				loading: true
			},
			style: {
				transition: theme.transitions.create(["opacity"], { duration: theme.transitions.duration.short }),
				opacity: 0
			}
		},
		{
			props: {
				loadingPosition: "start",
				loading: true,
				fullWidth: true
			},
			style: { marginRight: -8 }
		},
		...commonIconStyles
	]
}));
var ButtonEndIcon = styled$1("span", {
	name: "MuiButton",
	slot: "EndIcon",
	overridesResolver: (props, styles) => {
		const { ownerState } = props;
		return [
			styles.endIcon,
			ownerState.loading && styles.endIconLoadingEnd,
			styles[`iconSize${capitalize_default(ownerState.size)}`]
		];
	}
})(({ theme }) => ({
	display: "inherit",
	marginRight: -4,
	marginLeft: 8,
	variants: [
		{
			props: { size: "small" },
			style: { marginRight: -2 }
		},
		{
			props: {
				loadingPosition: "end",
				loading: true
			},
			style: {
				transition: theme.transitions.create(["opacity"], { duration: theme.transitions.duration.short }),
				opacity: 0
			}
		},
		{
			props: {
				loadingPosition: "end",
				loading: true,
				fullWidth: true
			},
			style: { marginLeft: -8 }
		},
		...commonIconStyles
	]
}));
var ButtonLoadingIndicator = styled$1("span", {
	name: "MuiButton",
	slot: "LoadingIndicator"
})(({ theme }) => ({
	display: "none",
	position: "absolute",
	visibility: "visible",
	variants: [
		{
			props: { loading: true },
			style: { display: "flex" }
		},
		{
			props: { loadingPosition: "start" },
			style: { left: 14 }
		},
		{
			props: {
				loadingPosition: "start",
				size: "small"
			},
			style: { left: 10 }
		},
		{
			props: {
				variant: "text",
				loadingPosition: "start"
			},
			style: { left: 6 }
		},
		{
			props: { loadingPosition: "center" },
			style: {
				left: "50%",
				transform: "translate(-50%)",
				color: (theme.vars || theme).palette.action.disabled
			}
		},
		{
			props: { loadingPosition: "end" },
			style: { right: 14 }
		},
		{
			props: {
				loadingPosition: "end",
				size: "small"
			},
			style: { right: 10 }
		},
		{
			props: {
				variant: "text",
				loadingPosition: "end"
			},
			style: { right: 6 }
		},
		{
			props: {
				loadingPosition: "start",
				fullWidth: true
			},
			style: {
				position: "relative",
				left: -10
			}
		},
		{
			props: {
				loadingPosition: "end",
				fullWidth: true
			},
			style: {
				position: "relative",
				right: -10
			}
		}
	]
}));
var ButtonLoadingIconPlaceholder = styled$1("span", {
	name: "MuiButton",
	slot: "LoadingIconPlaceholder"
})({
	display: "inline-block",
	width: "1em",
	height: "1em"
});
var Button = /*#__PURE__*/ import_react.forwardRef(function Button(inProps, ref) {
	const contextProps = import_react.useContext(ButtonGroupContext);
	const buttonGroupButtonContextPositionClassName = import_react.useContext(ButtonGroupButtonContext);
	const props = useDefaultProps$1({
		props: resolveProps(contextProps, inProps),
		name: "MuiButton"
	});
	const { children, color = "primary", component = "button", className, disabled = false, disableElevation = false, disableFocusRipple = false, endIcon: endIconProp, focusVisibleClassName, fullWidth = false, id: idProp, loading = null, loadingIndicator: loadingIndicatorProp, loadingPosition = "center", size = "medium", startIcon: startIconProp, type, variant = "text", ...other } = props;
	const loadingId = useId_default(idProp);
	const loadingIndicator = loadingIndicatorProp ?? /*#__PURE__*/ (0, import_jsx_runtime.jsx)(CircularProgress, {
		"aria-labelledby": loadingId,
		color: "inherit",
		size: 16
	});
	const ownerState = {
		...props,
		color,
		component,
		disabled,
		disableElevation,
		disableFocusRipple,
		fullWidth,
		loading,
		loadingIndicator,
		loadingPosition,
		size,
		type,
		variant
	};
	const classes = useUtilityClasses$15(ownerState);
	const startIcon = (startIconProp || loading && loadingPosition === "start") && /*#__PURE__*/ (0, import_jsx_runtime.jsx)(ButtonStartIcon, {
		className: classes.startIcon,
		ownerState,
		children: startIconProp || /*#__PURE__*/ (0, import_jsx_runtime.jsx)(ButtonLoadingIconPlaceholder, {
			className: classes.loadingIconPlaceholder,
			ownerState
		})
	});
	const endIcon = (endIconProp || loading && loadingPosition === "end") && /*#__PURE__*/ (0, import_jsx_runtime.jsx)(ButtonEndIcon, {
		className: classes.endIcon,
		ownerState,
		children: endIconProp || /*#__PURE__*/ (0, import_jsx_runtime.jsx)(ButtonLoadingIconPlaceholder, {
			className: classes.loadingIconPlaceholder,
			ownerState
		})
	});
	const positionClassName = buttonGroupButtonContextPositionClassName || "";
	const loader = typeof loading === "boolean" ? /*#__PURE__*/ (0, import_jsx_runtime.jsx)("span", {
		className: classes.loadingWrapper,
		style: { display: "contents" },
		children: loading && /*#__PURE__*/ (0, import_jsx_runtime.jsx)(ButtonLoadingIndicator, {
			className: classes.loadingIndicator,
			ownerState,
			children: loadingIndicator
		})
	}) : null;
	return /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(ButtonRoot, {
		ownerState,
		className: clsx(contextProps.className, classes.root, className, positionClassName),
		component,
		disabled: disabled || loading,
		focusRipple: !disableFocusRipple,
		focusVisibleClassName: clsx(classes.focusVisible, focusVisibleClassName),
		ref,
		type,
		id: loading ? loadingId : idProp,
		...other,
		classes,
		children: [
			startIcon,
			loadingPosition !== "end" && loader,
			children,
			loadingPosition === "end" && loader,
			endIcon
		]
	});
});
function isOverflowing(container) {
	const doc = ownerDocument(container);
	if (doc.body === container) return ownerWindow(container).innerWidth > doc.documentElement.clientWidth;
	return container.scrollHeight > container.clientHeight;
}
function ariaHidden(element, hide) {
	if (hide) element.setAttribute("aria-hidden", "true");
	else element.removeAttribute("aria-hidden");
}
function getPaddingRight(element) {
	return parseInt(ownerWindow(element).getComputedStyle(element).paddingRight, 10) || 0;
}
function isAriaHiddenForbiddenOnElement(element) {
	const isForbiddenTagName = [
		"TEMPLATE",
		"SCRIPT",
		"STYLE",
		"LINK",
		"MAP",
		"META",
		"NOSCRIPT",
		"PICTURE",
		"COL",
		"COLGROUP",
		"PARAM",
		"SLOT",
		"SOURCE",
		"TRACK"
	].includes(element.tagName);
	const isInputHidden = element.tagName === "INPUT" && element.getAttribute("type") === "hidden";
	return isForbiddenTagName || isInputHidden;
}
function ariaHiddenSiblings(container, mountElement, currentElement, elementsToExclude, hide) {
	const blacklist = [
		mountElement,
		currentElement,
		...elementsToExclude
	];
	[].forEach.call(container.children, (element) => {
		const isNotExcludedElement = !blacklist.includes(element);
		const isNotForbiddenElement = !isAriaHiddenForbiddenOnElement(element);
		if (isNotExcludedElement && isNotForbiddenElement) ariaHidden(element, hide);
	});
}
function findIndexOf(items, callback) {
	let idx = -1;
	items.some((item, index) => {
		if (callback(item)) {
			idx = index;
			return true;
		}
		return false;
	});
	return idx;
}
function handleContainer(containerInfo, props) {
	const restoreStyle = [];
	const container = containerInfo.container;
	if (!props.disableScrollLock) {
		if (isOverflowing(container)) {
			const scrollbarSize = getScrollbarSize(ownerWindow(container));
			restoreStyle.push({
				value: container.style.paddingRight,
				property: "padding-right",
				el: container
			});
			container.style.paddingRight = `${getPaddingRight(container) + scrollbarSize}px`;
			const fixedElements = ownerDocument(container).querySelectorAll(".mui-fixed");
			[].forEach.call(fixedElements, (element) => {
				restoreStyle.push({
					value: element.style.paddingRight,
					property: "padding-right",
					el: element
				});
				element.style.paddingRight = `${getPaddingRight(element) + scrollbarSize}px`;
			});
		}
		let scrollContainer;
		if (container.parentNode instanceof DocumentFragment) scrollContainer = ownerDocument(container).body;
		else {
			const parent = container.parentElement;
			const containerWindow = ownerWindow(container);
			scrollContainer = parent?.nodeName === "HTML" && containerWindow.getComputedStyle(parent).overflowY === "scroll" ? parent : container;
		}
		restoreStyle.push({
			value: scrollContainer.style.overflow,
			property: "overflow",
			el: scrollContainer
		}, {
			value: scrollContainer.style.overflowX,
			property: "overflow-x",
			el: scrollContainer
		}, {
			value: scrollContainer.style.overflowY,
			property: "overflow-y",
			el: scrollContainer
		});
		scrollContainer.style.overflow = "hidden";
	}
	const restore = () => {
		restoreStyle.forEach(({ value, el, property }) => {
			if (value) el.style.setProperty(property, value);
			else el.style.removeProperty(property);
		});
	};
	return restore;
}
function getHiddenSiblings(container) {
	const hiddenSiblings = [];
	[].forEach.call(container.children, (element) => {
		if (element.getAttribute("aria-hidden") === "true") hiddenSiblings.push(element);
	});
	return hiddenSiblings;
}
/**
* @ignore - do not document.
*
* Proper state management for containers and the modals in those containers.
* Simplified, but inspired by react-overlay's ModalManager class.
* Used by the Modal to ensure proper styling of containers.
*/
var ModalManager = class {
	constructor() {
		this.modals = [];
		this.containers = [];
	}
	add(modal, container) {
		let modalIndex = this.modals.indexOf(modal);
		if (modalIndex !== -1) return modalIndex;
		modalIndex = this.modals.length;
		this.modals.push(modal);
		if (modal.modalRef) ariaHidden(modal.modalRef, false);
		const hiddenSiblings = getHiddenSiblings(container);
		ariaHiddenSiblings(container, modal.mount, modal.modalRef, hiddenSiblings, true);
		const containerIndex = findIndexOf(this.containers, (item) => item.container === container);
		if (containerIndex !== -1) {
			this.containers[containerIndex].modals.push(modal);
			return modalIndex;
		}
		this.containers.push({
			modals: [modal],
			container,
			restore: null,
			hiddenSiblings
		});
		return modalIndex;
	}
	mount(modal, props) {
		const containerIndex = findIndexOf(this.containers, (item) => item.modals.includes(modal));
		const containerInfo = this.containers[containerIndex];
		if (!containerInfo.restore) containerInfo.restore = handleContainer(containerInfo, props);
	}
	remove(modal, ariaHiddenState = true) {
		const modalIndex = this.modals.indexOf(modal);
		if (modalIndex === -1) return modalIndex;
		const containerIndex = findIndexOf(this.containers, (item) => item.modals.includes(modal));
		const containerInfo = this.containers[containerIndex];
		containerInfo.modals.splice(containerInfo.modals.indexOf(modal), 1);
		this.modals.splice(modalIndex, 1);
		if (containerInfo.modals.length === 0) {
			if (containerInfo.restore) containerInfo.restore();
			if (modal.modalRef) ariaHidden(modal.modalRef, ariaHiddenState);
			ariaHiddenSiblings(containerInfo.container, modal.mount, modal.modalRef, containerInfo.hiddenSiblings, false);
			this.containers.splice(containerIndex, 1);
		} else {
			const nextTop = containerInfo.modals[containerInfo.modals.length - 1];
			if (nextTop.modalRef) ariaHidden(nextTop.modalRef, false);
		}
		return modalIndex;
	}
	isTopModal(modal) {
		return this.modals.length > 0 && this.modals[this.modals.length - 1] === modal;
	}
};
var candidatesSelector = [
	"input",
	"select",
	"textarea",
	"a[href]",
	"button",
	"[tabindex]",
	"audio[controls]",
	"video[controls]",
	"[contenteditable]:not([contenteditable=\"false\"])"
].join(",");
function getTabIndex(node) {
	const tabindexAttr = parseInt(node.getAttribute("tabindex") || "", 10);
	if (!Number.isNaN(tabindexAttr)) return tabindexAttr;
	if (node.contentEditable === "true" || (node.nodeName === "AUDIO" || node.nodeName === "VIDEO" || node.nodeName === "DETAILS") && node.getAttribute("tabindex") === null) return 0;
	return node.tabIndex;
}
function isNonTabbableRadio(node) {
	if (node.tagName !== "INPUT" || node.type !== "radio") return false;
	if (!node.name) return false;
	const getRadio = (selector) => node.ownerDocument.querySelector(`input[type="radio"]${selector}`);
	let roving = getRadio(`[name="${node.name}"]:checked`);
	if (!roving) roving = getRadio(`[name="${node.name}"]`);
	return roving !== node;
}
function isNodeMatchingSelectorFocusable(node) {
	if (node.disabled || node.tagName === "INPUT" && node.type === "hidden" || isNonTabbableRadio(node)) return false;
	return true;
}
function defaultGetTabbable(root) {
	const regularTabNodes = [];
	const orderedTabNodes = [];
	Array.from(root.querySelectorAll(candidatesSelector)).forEach((node, i) => {
		const nodeTabIndex = getTabIndex(node);
		if (nodeTabIndex === -1 || !isNodeMatchingSelectorFocusable(node)) return;
		if (nodeTabIndex === 0) regularTabNodes.push(node);
		else orderedTabNodes.push({
			documentOrder: i,
			tabIndex: nodeTabIndex,
			node
		});
	});
	return orderedTabNodes.sort((a, b) => a.tabIndex === b.tabIndex ? a.documentOrder - b.documentOrder : a.tabIndex - b.tabIndex).map((a) => a.node).concat(regularTabNodes);
}
function defaultIsEnabled() {
	return true;
}
/**
* @ignore - internal component.
*/
function FocusTrap(props) {
	const { children, disableAutoFocus = false, disableEnforceFocus = false, disableRestoreFocus = false, getTabbable = defaultGetTabbable, isEnabled = defaultIsEnabled, open } = props;
	const ignoreNextEnforceFocus = import_react.useRef(false);
	const sentinelStart = import_react.useRef(null);
	const sentinelEnd = import_react.useRef(null);
	const nodeToRestore = import_react.useRef(null);
	const reactFocusEventTarget = import_react.useRef(null);
	const activated = import_react.useRef(false);
	const rootRef = import_react.useRef(null);
	const handleRef = useForkRef(getReactElementRef(children), rootRef);
	const lastKeydown = import_react.useRef(null);
	import_react.useEffect(() => {
		if (!open || !rootRef.current) return;
		activated.current = !disableAutoFocus;
	}, [disableAutoFocus, open]);
	import_react.useEffect(() => {
		if (!open || !rootRef.current) return;
		const doc = ownerDocument(rootRef.current);
		if (!rootRef.current.contains(doc.activeElement)) {
			if (!rootRef.current.hasAttribute("tabIndex")) rootRef.current.setAttribute("tabIndex", "-1");
			if (activated.current) rootRef.current.focus();
		}
		return () => {
			if (!disableRestoreFocus) {
				if (nodeToRestore.current && nodeToRestore.current.focus) {
					ignoreNextEnforceFocus.current = true;
					nodeToRestore.current.focus();
				}
				nodeToRestore.current = null;
			}
		};
	}, [open]);
	import_react.useEffect(() => {
		if (!open || !rootRef.current) return;
		const doc = ownerDocument(rootRef.current);
		const loopFocus = (nativeEvent) => {
			lastKeydown.current = nativeEvent;
			if (disableEnforceFocus || !isEnabled() || nativeEvent.key !== "Tab") return;
			if (doc.activeElement === rootRef.current && nativeEvent.shiftKey) {
				ignoreNextEnforceFocus.current = true;
				if (sentinelEnd.current) sentinelEnd.current.focus();
			}
		};
		const contain = () => {
			const rootElement = rootRef.current;
			if (rootElement === null) return;
			if (!doc.hasFocus() || !isEnabled() || ignoreNextEnforceFocus.current) {
				ignoreNextEnforceFocus.current = false;
				return;
			}
			if (rootElement.contains(doc.activeElement)) return;
			if (disableEnforceFocus && doc.activeElement !== sentinelStart.current && doc.activeElement !== sentinelEnd.current) return;
			if (doc.activeElement !== reactFocusEventTarget.current) reactFocusEventTarget.current = null;
			else if (reactFocusEventTarget.current !== null) return;
			if (!activated.current) return;
			let tabbable = [];
			if (doc.activeElement === sentinelStart.current || doc.activeElement === sentinelEnd.current) tabbable = getTabbable(rootRef.current);
			if (tabbable.length > 0) {
				const isShiftTab = Boolean(lastKeydown.current?.shiftKey && lastKeydown.current?.key === "Tab");
				const focusNext = tabbable[0];
				const focusPrevious = tabbable[tabbable.length - 1];
				if (typeof focusNext !== "string" && typeof focusPrevious !== "string") if (isShiftTab) focusPrevious.focus();
				else focusNext.focus();
			} else rootElement.focus();
		};
		doc.addEventListener("focusin", contain);
		doc.addEventListener("keydown", loopFocus, true);
		const interval = setInterval(() => {
			if (doc.activeElement && doc.activeElement.tagName === "BODY") contain();
		}, 50);
		return () => {
			clearInterval(interval);
			doc.removeEventListener("focusin", contain);
			doc.removeEventListener("keydown", loopFocus, true);
		};
	}, [
		disableAutoFocus,
		disableEnforceFocus,
		disableRestoreFocus,
		isEnabled,
		open,
		getTabbable
	]);
	const onFocus = (event) => {
		if (nodeToRestore.current === null) nodeToRestore.current = event.relatedTarget;
		activated.current = true;
		reactFocusEventTarget.current = event.target;
		const childrenPropsHandler = children.props.onFocus;
		if (childrenPropsHandler) childrenPropsHandler(event);
	};
	const handleFocusSentinel = (event) => {
		if (nodeToRestore.current === null) nodeToRestore.current = event.relatedTarget;
		activated.current = true;
	};
	return /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [
		/*#__PURE__*/ (0, import_jsx_runtime.jsx)("div", {
			tabIndex: open ? 0 : -1,
			onFocus: handleFocusSentinel,
			ref: sentinelStart,
			"data-testid": "sentinelStart"
		}),
		/*#__PURE__*/ import_react.cloneElement(children, {
			ref: handleRef,
			onFocus
		}),
		/*#__PURE__*/ (0, import_jsx_runtime.jsx)("div", {
			tabIndex: open ? 0 : -1,
			onFocus: handleFocusSentinel,
			ref: sentinelEnd,
			"data-testid": "sentinelEnd"
		})
	] });
}
function getContainer(container) {
	return typeof container === "function" ? container() : container;
}
function getHasTransition(children) {
	return children ? children.props.hasOwnProperty("in") : false;
}
var noop = () => {};
var manager = new ModalManager();
function useModal(parameters) {
	const { container, disableEscapeKeyDown = false, disableScrollLock = false, closeAfterTransition = false, onTransitionEnter, onTransitionExited, children, onClose, open, rootRef } = parameters;
	const modal = import_react.useRef({});
	const mountNodeRef = import_react.useRef(null);
	const modalRef = import_react.useRef(null);
	const handleRef = useForkRef(modalRef, rootRef);
	const [exited, setExited] = import_react.useState(!open);
	const hasTransition = getHasTransition(children);
	let ariaHiddenProp = true;
	if (parameters["aria-hidden"] === "false" || parameters["aria-hidden"] === false) ariaHiddenProp = false;
	const getDoc = () => ownerDocument(mountNodeRef.current);
	const getModal = () => {
		modal.current.modalRef = modalRef.current;
		modal.current.mount = mountNodeRef.current;
		return modal.current;
	};
	const handleMounted = () => {
		manager.mount(getModal(), { disableScrollLock });
		if (modalRef.current) modalRef.current.scrollTop = 0;
	};
	const handleOpen = useEventCallback(() => {
		const resolvedContainer = getContainer(container) || getDoc().body;
		manager.add(getModal(), resolvedContainer);
		if (modalRef.current) handleMounted();
	});
	const isTopModal = () => manager.isTopModal(getModal());
	const handlePortalRef = useEventCallback((node) => {
		mountNodeRef.current = node;
		if (!node) return;
		if (open && isTopModal()) handleMounted();
		else if (modalRef.current) ariaHidden(modalRef.current, ariaHiddenProp);
	});
	const handleClose = import_react.useCallback(() => {
		manager.remove(getModal(), ariaHiddenProp);
	}, [ariaHiddenProp]);
	import_react.useEffect(() => {
		return () => {
			handleClose();
		};
	}, [handleClose]);
	import_react.useEffect(() => {
		if (open) handleOpen();
		else if (!hasTransition || !closeAfterTransition) handleClose();
	}, [
		open,
		handleClose,
		hasTransition,
		closeAfterTransition,
		handleOpen
	]);
	const createHandleKeyDown = (otherHandlers) => (event) => {
		otherHandlers.onKeyDown?.(event);
		if (event.key !== "Escape" || event.which === 229 || !isTopModal()) return;
		if (!disableEscapeKeyDown) {
			event.stopPropagation();
			if (onClose) onClose(event, "escapeKeyDown");
		}
	};
	const createHandleBackdropClick = (otherHandlers) => (event) => {
		otherHandlers.onClick?.(event);
		if (event.target !== event.currentTarget) return;
		if (onClose) onClose(event, "backdropClick");
	};
	const getRootProps = (otherHandlers = {}) => {
		const propsEventHandlers = extractEventHandlers(parameters);
		delete propsEventHandlers.onTransitionEnter;
		delete propsEventHandlers.onTransitionExited;
		const externalEventHandlers = {
			...propsEventHandlers,
			...otherHandlers
		};
		return {
			role: "presentation",
			...externalEventHandlers,
			onKeyDown: createHandleKeyDown(externalEventHandlers),
			ref: handleRef
		};
	};
	const getBackdropProps = (otherHandlers = {}) => {
		const externalEventHandlers = otherHandlers;
		return {
			"aria-hidden": true,
			...externalEventHandlers,
			onClick: createHandleBackdropClick(externalEventHandlers),
			open
		};
	};
	const getTransitionProps = () => {
		const handleEnter = () => {
			setExited(false);
			if (onTransitionEnter) onTransitionEnter();
		};
		const handleExited = () => {
			setExited(true);
			if (onTransitionExited) onTransitionExited();
			if (closeAfterTransition) handleClose();
		};
		return {
			onEnter: createChainedFunction(handleEnter, children?.props.onEnter ?? noop),
			onExited: createChainedFunction(handleExited, children?.props.onExited ?? noop)
		};
	};
	return {
		getRootProps,
		getBackdropProps,
		getTransitionProps,
		rootRef: handleRef,
		portalRef: handlePortalRef,
		isTopModal,
		exited,
		hasTransition
	};
}
function getModalUtilityClass(slot) {
	return generateUtilityClass("MuiModal", slot);
}
generateUtilityClasses("MuiModal", [
	"root",
	"hidden",
	"backdrop"
]);
var useUtilityClasses$14 = (ownerState) => {
	const { open, exited, classes } = ownerState;
	return composeClasses({
		root: ["root", !open && exited && "hidden"],
		backdrop: ["backdrop"]
	}, getModalUtilityClass, classes);
};
var ModalRoot = styled$1("div", {
	name: "MuiModal",
	slot: "Root",
	overridesResolver: (props, styles) => {
		const { ownerState } = props;
		return [styles.root, !ownerState.open && ownerState.exited && styles.hidden];
	}
})(memoTheme(({ theme }) => ({
	position: "fixed",
	zIndex: (theme.vars || theme).zIndex.modal,
	right: 0,
	bottom: 0,
	top: 0,
	left: 0,
	variants: [{
		props: ({ ownerState }) => !ownerState.open && ownerState.exited,
		style: { visibility: "hidden" }
	}]
})));
var ModalBackdrop = styled$1(Backdrop, {
	name: "MuiModal",
	slot: "Backdrop"
})({ zIndex: -1 });
/**
* Modal is a lower-level construct that is leveraged by the following components:
*
* - [Dialog](/material-ui/api/dialog/)
* - [Drawer](/material-ui/api/drawer/)
* - [Menu](/material-ui/api/menu/)
* - [Popover](/material-ui/api/popover/)
*
* If you are creating a modal dialog, you probably want to use the [Dialog](/material-ui/api/dialog/) component
* rather than directly using Modal.
*
* This component shares many concepts with [react-overlays](https://react-bootstrap.github.io/react-overlays/#modals).
*/
var Modal = /*#__PURE__*/ import_react.forwardRef(function Modal(inProps, ref) {
	const props = useDefaultProps$1({
		name: "MuiModal",
		props: inProps
	});
	const { BackdropComponent = ModalBackdrop, BackdropProps, classes: classesProp, className, closeAfterTransition = false, children, container, component, components = {}, componentsProps = {}, disableAutoFocus = false, disableEnforceFocus = false, disableEscapeKeyDown = false, disablePortal = false, disableRestoreFocus = false, disableScrollLock = false, hideBackdrop = false, keepMounted = false, onClose, onTransitionEnter, onTransitionExited, open, slotProps = {}, slots = {}, theme, ...other } = props;
	const propsWithDefaults = {
		...props,
		closeAfterTransition,
		disableAutoFocus,
		disableEnforceFocus,
		disableEscapeKeyDown,
		disablePortal,
		disableRestoreFocus,
		disableScrollLock,
		hideBackdrop,
		keepMounted
	};
	const { getRootProps, getBackdropProps, getTransitionProps, portalRef, isTopModal, exited, hasTransition } = useModal({
		...propsWithDefaults,
		rootRef: ref
	});
	const ownerState = {
		...propsWithDefaults,
		exited
	};
	const classes = useUtilityClasses$14(ownerState);
	const childProps = {};
	if (children.props.tabIndex === void 0) childProps.tabIndex = "-1";
	if (hasTransition) {
		const { onEnter, onExited } = getTransitionProps();
		childProps.onEnter = onEnter;
		childProps.onExited = onExited;
	}
	const externalForwardedProps = {
		slots: {
			root: components.Root,
			backdrop: components.Backdrop,
			...slots
		},
		slotProps: {
			...componentsProps,
			...slotProps
		}
	};
	const [RootSlot, rootProps] = useSlot("root", {
		ref,
		elementType: ModalRoot,
		externalForwardedProps: {
			...externalForwardedProps,
			...other,
			component
		},
		getSlotProps: getRootProps,
		ownerState,
		className: clsx(className, classes?.root, !ownerState.open && ownerState.exited && classes?.hidden)
	});
	const [BackdropSlot, backdropProps] = useSlot("backdrop", {
		ref: BackdropProps?.ref,
		elementType: BackdropComponent,
		externalForwardedProps,
		shouldForwardComponentProp: true,
		additionalProps: BackdropProps,
		getSlotProps: (otherHandlers) => {
			return getBackdropProps({
				...otherHandlers,
				onClick: (event) => {
					if (otherHandlers?.onClick) otherHandlers.onClick(event);
				}
			});
		},
		className: clsx(BackdropProps?.className, classes?.backdrop),
		ownerState
	});
	if (!keepMounted && !open && (!hasTransition || exited)) return null;
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(Portal, {
		ref: portalRef,
		container,
		disablePortal,
		children: /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(RootSlot, {
			...rootProps,
			children: [!hideBackdrop && BackdropComponent ? /*#__PURE__*/ (0, import_jsx_runtime.jsx)(BackdropSlot, { ...backdropProps }) : null, /*#__PURE__*/ (0, import_jsx_runtime.jsx)(FocusTrap, {
				disableEnforceFocus,
				disableAutoFocus,
				disableRestoreFocus,
				isEnabled: isTopModal,
				open,
				children: /*#__PURE__*/ import_react.cloneElement(children, childProps)
			})]
		})
	});
});
var useUtilityClasses$13 = (ownerState) => {
	const { classes, disableUnderline, startAdornment, endAdornment, size, hiddenLabel, multiline } = ownerState;
	const composedClasses = composeClasses({
		root: [
			"root",
			!disableUnderline && "underline",
			startAdornment && "adornedStart",
			endAdornment && "adornedEnd",
			size === "small" && `size${capitalize_default(size)}`,
			hiddenLabel && "hiddenLabel",
			multiline && "multiline"
		],
		input: ["input"]
	}, getFilledInputUtilityClass, classes);
	return {
		...classes,
		...composedClasses
	};
};
var FilledInputRoot = styled$1(InputBaseRoot, {
	shouldForwardProp: (prop) => rootShouldForwardProp(prop) || prop === "classes",
	name: "MuiFilledInput",
	slot: "Root",
	overridesResolver: (props, styles) => {
		const { ownerState } = props;
		return [...rootOverridesResolver(props, styles), !ownerState.disableUnderline && styles.underline];
	}
})(memoTheme(({ theme }) => {
	const light = theme.palette.mode === "light";
	const bottomLineColor = light ? "rgba(0, 0, 0, 0.42)" : "rgba(255, 255, 255, 0.7)";
	const backgroundColor = light ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.09)";
	const hoverBackground = light ? "rgba(0, 0, 0, 0.09)" : "rgba(255, 255, 255, 0.13)";
	const disabledBackground = light ? "rgba(0, 0, 0, 0.12)" : "rgba(255, 255, 255, 0.12)";
	return {
		position: "relative",
		backgroundColor: theme.vars ? theme.vars.palette.FilledInput.bg : backgroundColor,
		borderTopLeftRadius: (theme.vars || theme).shape.borderRadius,
		borderTopRightRadius: (theme.vars || theme).shape.borderRadius,
		transition: theme.transitions.create("background-color", {
			duration: theme.transitions.duration.shorter,
			easing: theme.transitions.easing.easeOut
		}),
		"&:hover": {
			backgroundColor: theme.vars ? theme.vars.palette.FilledInput.hoverBg : hoverBackground,
			"@media (hover: none)": { backgroundColor: theme.vars ? theme.vars.palette.FilledInput.bg : backgroundColor }
		},
		[`&.${filledInputClasses.focused}`]: { backgroundColor: theme.vars ? theme.vars.palette.FilledInput.bg : backgroundColor },
		[`&.${filledInputClasses.disabled}`]: { backgroundColor: theme.vars ? theme.vars.palette.FilledInput.disabledBg : disabledBackground },
		variants: [
			{
				props: ({ ownerState }) => !ownerState.disableUnderline,
				style: {
					"&::after": {
						left: 0,
						bottom: 0,
						content: "\"\"",
						position: "absolute",
						right: 0,
						transform: "scaleX(0)",
						transition: theme.transitions.create("transform", {
							duration: theme.transitions.duration.shorter,
							easing: theme.transitions.easing.easeOut
						}),
						pointerEvents: "none"
					},
					[`&.${filledInputClasses.focused}:after`]: { transform: "scaleX(1) translateX(0)" },
					[`&.${filledInputClasses.error}`]: { "&::before, &::after": { borderBottomColor: (theme.vars || theme).palette.error.main } },
					"&::before": {
						borderBottom: `1px solid ${theme.vars ? theme.alpha(theme.vars.palette.common.onBackground, theme.vars.opacity.inputUnderline) : bottomLineColor}`,
						left: 0,
						bottom: 0,
						content: "\"\\00a0\"",
						position: "absolute",
						right: 0,
						transition: theme.transitions.create("border-bottom-color", { duration: theme.transitions.duration.shorter }),
						pointerEvents: "none"
					},
					[`&:hover:not(.${filledInputClasses.disabled}, .${filledInputClasses.error}):before`]: { borderBottom: `1px solid ${(theme.vars || theme).palette.text.primary}` },
					[`&.${filledInputClasses.disabled}:before`]: { borderBottomStyle: "dotted" }
				}
			},
			...Object.entries(theme.palette).filter(createSimplePaletteValueFilter()).map(([color]) => ({
				props: {
					disableUnderline: false,
					color
				},
				style: { "&::after": { borderBottom: `2px solid ${(theme.vars || theme).palette[color]?.main}` } }
			})),
			{
				props: ({ ownerState }) => ownerState.startAdornment,
				style: { paddingLeft: 12 }
			},
			{
				props: ({ ownerState }) => ownerState.endAdornment,
				style: { paddingRight: 12 }
			},
			{
				props: ({ ownerState }) => ownerState.multiline,
				style: { padding: "25px 12px 8px" }
			},
			{
				props: ({ ownerState, size }) => ownerState.multiline && size === "small",
				style: {
					paddingTop: 21,
					paddingBottom: 4
				}
			},
			{
				props: ({ ownerState }) => ownerState.multiline && ownerState.hiddenLabel,
				style: {
					paddingTop: 16,
					paddingBottom: 17
				}
			},
			{
				props: ({ ownerState }) => ownerState.multiline && ownerState.hiddenLabel && ownerState.size === "small",
				style: {
					paddingTop: 8,
					paddingBottom: 9
				}
			}
		]
	};
}));
var FilledInputInput = styled$1(InputBaseInput, {
	name: "MuiFilledInput",
	slot: "Input",
	overridesResolver: inputOverridesResolver
})(memoTheme(({ theme }) => ({
	paddingTop: 25,
	paddingRight: 12,
	paddingBottom: 8,
	paddingLeft: 12,
	...!theme.vars && { "&:-webkit-autofill": {
		WebkitBoxShadow: theme.palette.mode === "light" ? null : "0 0 0 100px #266798 inset",
		WebkitTextFillColor: theme.palette.mode === "light" ? null : "#fff",
		caretColor: theme.palette.mode === "light" ? null : "#fff",
		borderTopLeftRadius: "inherit",
		borderTopRightRadius: "inherit"
	} },
	...theme.vars && {
		"&:-webkit-autofill": {
			borderTopLeftRadius: "inherit",
			borderTopRightRadius: "inherit"
		},
		[theme.getColorSchemeSelector("dark")]: { "&:-webkit-autofill": {
			WebkitBoxShadow: "0 0 0 100px #266798 inset",
			WebkitTextFillColor: "#fff",
			caretColor: "#fff"
		} }
	},
	variants: [
		{
			props: { size: "small" },
			style: {
				paddingTop: 21,
				paddingBottom: 4
			}
		},
		{
			props: ({ ownerState }) => ownerState.hiddenLabel,
			style: {
				paddingTop: 16,
				paddingBottom: 17
			}
		},
		{
			props: ({ ownerState }) => ownerState.startAdornment,
			style: { paddingLeft: 0 }
		},
		{
			props: ({ ownerState }) => ownerState.endAdornment,
			style: { paddingRight: 0 }
		},
		{
			props: ({ ownerState }) => ownerState.hiddenLabel && ownerState.size === "small",
			style: {
				paddingTop: 8,
				paddingBottom: 9
			}
		},
		{
			props: ({ ownerState }) => ownerState.multiline,
			style: {
				paddingTop: 0,
				paddingBottom: 0,
				paddingLeft: 0,
				paddingRight: 0
			}
		}
	]
})));
var FilledInput = /*#__PURE__*/ import_react.forwardRef(function FilledInput(inProps, ref) {
	const props = useDefaultProps$1({
		props: inProps,
		name: "MuiFilledInput"
	});
	const { disableUnderline = false, components = {}, componentsProps: componentsPropsProp, fullWidth = false, hiddenLabel, inputComponent = "input", multiline = false, slotProps, slots = {}, type = "text", ...other } = props;
	const ownerState = {
		...props,
		disableUnderline,
		fullWidth,
		inputComponent,
		multiline,
		type
	};
	const classes = useUtilityClasses$13(props);
	const filledInputComponentsProps = {
		root: { ownerState },
		input: { ownerState }
	};
	const componentsProps = slotProps ?? componentsPropsProp ? deepmerge(filledInputComponentsProps, slotProps ?? componentsPropsProp) : filledInputComponentsProps;
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(InputBase, {
		slots: {
			root: slots.root ?? components.Root ?? FilledInputRoot,
			input: slots.input ?? components.Input ?? FilledInputInput
		},
		slotProps: componentsProps,
		fullWidth,
		inputComponent,
		multiline,
		ref,
		type,
		...other,
		classes
	});
});
FilledInput.muiName = "Input";
function getFormControlUtilityClasses(slot) {
	return generateUtilityClass("MuiFormControl", slot);
}
generateUtilityClasses("MuiFormControl", [
	"root",
	"marginNone",
	"marginNormal",
	"marginDense",
	"fullWidth",
	"disabled"
]);
var useUtilityClasses$12 = (ownerState) => {
	const { classes, margin, fullWidth } = ownerState;
	return composeClasses({ root: [
		"root",
		margin !== "none" && `margin${capitalize_default(margin)}`,
		fullWidth && "fullWidth"
	] }, getFormControlUtilityClasses, classes);
};
var FormControlRoot = styled$1("div", {
	name: "MuiFormControl",
	slot: "Root",
	overridesResolver: (props, styles) => {
		const { ownerState } = props;
		return [
			styles.root,
			styles[`margin${capitalize_default(ownerState.margin)}`],
			ownerState.fullWidth && styles.fullWidth
		];
	}
})({
	display: "inline-flex",
	flexDirection: "column",
	position: "relative",
	minWidth: 0,
	padding: 0,
	margin: 0,
	border: 0,
	verticalAlign: "top",
	variants: [
		{
			props: { margin: "normal" },
			style: {
				marginTop: 16,
				marginBottom: 8
			}
		},
		{
			props: { margin: "dense" },
			style: {
				marginTop: 8,
				marginBottom: 4
			}
		},
		{
			props: { fullWidth: true },
			style: { width: "100%" }
		}
	]
});
/**
* Provides context such as filled/focused/error/required for form inputs.
* Relying on the context provides high flexibility and ensures that the state always stays
* consistent across the children of the `FormControl`.
* This context is used by the following components:
*
*  - FormLabel
*  - FormHelperText
*  - Input
*  - InputLabel
*
* You can find one composition example below and more going to [the demos](/material-ui/react-text-field/#components).
*
* ```jsx
* <FormControl>
*   <InputLabel htmlFor="my-input">Email address</InputLabel>
*   <Input id="my-input" aria-describedby="my-helper-text" />
*   <FormHelperText id="my-helper-text">We'll never share your email.</FormHelperText>
* </FormControl>
* ```
*
* ⚠️ Only one `InputBase` can be used within a FormControl because it creates visual inconsistencies.
* For instance, only one input can be focused at the same time, the state shouldn't be shared.
*/
var FormControl = /*#__PURE__*/ import_react.forwardRef(function FormControl(inProps, ref) {
	const props = useDefaultProps$1({
		props: inProps,
		name: "MuiFormControl"
	});
	const { children, className, color = "primary", component = "div", disabled = false, error = false, focused: visuallyFocused, fullWidth = false, hiddenLabel = false, margin = "none", required = false, size = "medium", variant = "outlined", ...other } = props;
	const ownerState = {
		...props,
		color,
		component,
		disabled,
		error,
		fullWidth,
		hiddenLabel,
		margin,
		required,
		size,
		variant
	};
	const classes = useUtilityClasses$12(ownerState);
	const [adornedStart, setAdornedStart] = import_react.useState(() => {
		let initialAdornedStart = false;
		if (children) import_react.Children.forEach(children, (child) => {
			if (!isMuiElement_default(child, ["Input", "Select"])) return;
			const input = isMuiElement_default(child, ["Select"]) ? child.props.input : child;
			if (input && isAdornedStart(input.props)) initialAdornedStart = true;
		});
		return initialAdornedStart;
	});
	const [filled, setFilled] = import_react.useState(() => {
		let initialFilled = false;
		if (children) import_react.Children.forEach(children, (child) => {
			if (!isMuiElement_default(child, ["Input", "Select"])) return;
			if (isFilled(child.props, true) || isFilled(child.props.inputProps, true)) initialFilled = true;
		});
		return initialFilled;
	});
	const [focusedState, setFocused] = import_react.useState(false);
	if (disabled && focusedState) setFocused(false);
	const focused = visuallyFocused !== void 0 && !disabled ? visuallyFocused : focusedState;
	let registerEffect;
	import_react.useRef(false);
	const onFilled = import_react.useCallback(() => {
		setFilled(true);
	}, []);
	const onEmpty = import_react.useCallback(() => {
		setFilled(false);
	}, []);
	const childContext = import_react.useMemo(() => {
		return {
			adornedStart,
			setAdornedStart,
			color,
			disabled,
			error,
			filled,
			focused,
			fullWidth,
			hiddenLabel,
			size,
			onBlur: () => {
				setFocused(false);
			},
			onFocus: () => {
				setFocused(true);
			},
			onEmpty,
			onFilled,
			registerEffect,
			required,
			variant
		};
	}, [
		adornedStart,
		color,
		disabled,
		error,
		filled,
		focused,
		fullWidth,
		hiddenLabel,
		registerEffect,
		onEmpty,
		onFilled,
		required,
		size,
		variant
	]);
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(FormControlContext.Provider, {
		value: childContext,
		children: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(FormControlRoot, {
			as: component,
			ownerState,
			className: clsx(classes.root, className),
			ref,
			...other,
			children
		})
	});
});
function getFormHelperTextUtilityClasses(slot) {
	return generateUtilityClass("MuiFormHelperText", slot);
}
var formHelperTextClasses = generateUtilityClasses("MuiFormHelperText", [
	"root",
	"error",
	"disabled",
	"sizeSmall",
	"sizeMedium",
	"contained",
	"focused",
	"filled",
	"required"
]);
var _span$2;
var useUtilityClasses$11 = (ownerState) => {
	const { classes, contained, size, disabled, error, filled, focused, required } = ownerState;
	return composeClasses({ root: [
		"root",
		disabled && "disabled",
		error && "error",
		size && `size${capitalize_default(size)}`,
		contained && "contained",
		focused && "focused",
		filled && "filled",
		required && "required"
	] }, getFormHelperTextUtilityClasses, classes);
};
var FormHelperTextRoot = styled$1("p", {
	name: "MuiFormHelperText",
	slot: "Root",
	overridesResolver: (props, styles) => {
		const { ownerState } = props;
		return [
			styles.root,
			ownerState.size && styles[`size${capitalize_default(ownerState.size)}`],
			ownerState.contained && styles.contained,
			ownerState.filled && styles.filled
		];
	}
})(memoTheme(({ theme }) => ({
	color: (theme.vars || theme).palette.text.secondary,
	...theme.typography.caption,
	textAlign: "left",
	marginTop: 3,
	marginRight: 0,
	marginBottom: 0,
	marginLeft: 0,
	[`&.${formHelperTextClasses.disabled}`]: { color: (theme.vars || theme).palette.text.disabled },
	[`&.${formHelperTextClasses.error}`]: { color: (theme.vars || theme).palette.error.main },
	variants: [{
		props: { size: "small" },
		style: { marginTop: 4 }
	}, {
		props: ({ ownerState }) => ownerState.contained,
		style: {
			marginLeft: 14,
			marginRight: 14
		}
	}]
})));
var FormHelperText = /*#__PURE__*/ import_react.forwardRef(function FormHelperText(inProps, ref) {
	const props = useDefaultProps$1({
		props: inProps,
		name: "MuiFormHelperText"
	});
	const { children, className, component = "p", disabled, error, filled, focused, margin, required, variant, ...other } = props;
	const fcs = formControlState({
		props,
		muiFormControl: useFormControl(),
		states: [
			"variant",
			"size",
			"disabled",
			"error",
			"filled",
			"focused",
			"required"
		]
	});
	const ownerState = {
		...props,
		component,
		contained: fcs.variant === "filled" || fcs.variant === "outlined",
		variant: fcs.variant,
		size: fcs.size,
		disabled: fcs.disabled,
		error: fcs.error,
		filled: fcs.filled,
		focused: fcs.focused,
		required: fcs.required
	};
	delete ownerState.ownerState;
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(FormHelperTextRoot, {
		as: component,
		className: clsx(useUtilityClasses$11(ownerState).root, className),
		ref,
		...other,
		ownerState,
		children: children === " " ? _span$2 || (_span$2 = /*#__PURE__*/ (0, import_jsx_runtime.jsx)("span", {
			className: "notranslate",
			"aria-hidden": true,
			children: "​"
		})) : children
	});
});
function getFormLabelUtilityClasses(slot) {
	return generateUtilityClass("MuiFormLabel", slot);
}
var formLabelClasses = generateUtilityClasses("MuiFormLabel", [
	"root",
	"colorSecondary",
	"focused",
	"disabled",
	"error",
	"filled",
	"required",
	"asterisk"
]);
var useUtilityClasses$10 = (ownerState) => {
	const { classes, color, focused, disabled, error, filled, required } = ownerState;
	return composeClasses({
		root: [
			"root",
			`color${capitalize_default(color)}`,
			disabled && "disabled",
			error && "error",
			filled && "filled",
			focused && "focused",
			required && "required"
		],
		asterisk: ["asterisk", error && "error"]
	}, getFormLabelUtilityClasses, classes);
};
var FormLabelRoot = styled$1("label", {
	name: "MuiFormLabel",
	slot: "Root",
	overridesResolver: (props, styles) => {
		const { ownerState } = props;
		return [
			styles.root,
			ownerState.color === "secondary" && styles.colorSecondary,
			ownerState.filled && styles.filled
		];
	}
})(memoTheme(({ theme }) => ({
	color: (theme.vars || theme).palette.text.secondary,
	...theme.typography.body1,
	lineHeight: "1.4375em",
	padding: 0,
	position: "relative",
	variants: [...Object.entries(theme.palette).filter(createSimplePaletteValueFilter()).map(([color]) => ({
		props: { color },
		style: { [`&.${formLabelClasses.focused}`]: { color: (theme.vars || theme).palette[color].main } }
	})), {
		props: {},
		style: {
			[`&.${formLabelClasses.disabled}`]: { color: (theme.vars || theme).palette.text.disabled },
			[`&.${formLabelClasses.error}`]: { color: (theme.vars || theme).palette.error.main }
		}
	}]
})));
var AsteriskComponent = styled$1("span", {
	name: "MuiFormLabel",
	slot: "Asterisk"
})(memoTheme(({ theme }) => ({ [`&.${formLabelClasses.error}`]: { color: (theme.vars || theme).palette.error.main } })));
var FormLabel = /*#__PURE__*/ import_react.forwardRef(function FormLabel(inProps, ref) {
	const props = useDefaultProps$1({
		props: inProps,
		name: "MuiFormLabel"
	});
	const { children, className, color, component = "label", disabled, error, filled, focused, required, ...other } = props;
	const fcs = formControlState({
		props,
		muiFormControl: useFormControl(),
		states: [
			"color",
			"required",
			"focused",
			"disabled",
			"error",
			"filled"
		]
	});
	const ownerState = {
		...props,
		color: fcs.color || "primary",
		component,
		disabled: fcs.disabled,
		error: fcs.error,
		filled: fcs.filled,
		focused: fcs.focused,
		required: fcs.required
	};
	const classes = useUtilityClasses$10(ownerState);
	return /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(FormLabelRoot, {
		as: component,
		ownerState,
		className: clsx(classes.root, className),
		ref,
		...other,
		children: [children, fcs.required && /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(AsteriskComponent, {
			ownerState,
			"aria-hidden": true,
			className: classes.asterisk,
			children: [" ", "*"]
		})]
	});
});
function getScale(value) {
	return `scale(${value}, ${value ** 2})`;
}
var styles = {
	entering: {
		opacity: 1,
		transform: getScale(1)
	},
	entered: {
		opacity: 1,
		transform: "none"
	}
};
var isWebKit154 = typeof navigator !== "undefined" && /^((?!chrome|android).)*(safari|mobile)/i.test(navigator.userAgent) && /(os |version\/)15(.|_)4/i.test(navigator.userAgent);
/**
* The Grow transition is used by the [Tooltip](/material-ui/react-tooltip/) and
* [Popover](/material-ui/react-popover/) components.
* It uses [react-transition-group](https://github.com/reactjs/react-transition-group) internally.
*/
var Grow = /*#__PURE__*/ import_react.forwardRef(function Grow(props, ref) {
	const { addEndListener, appear = true, children, easing, in: inProp, onEnter, onEntered, onEntering, onExit, onExited, onExiting, style, timeout = "auto", TransitionComponent = Transition, ...other } = props;
	const timer = useTimeout();
	const autoTimeout = import_react.useRef();
	const theme = useTheme$1();
	const nodeRef = import_react.useRef(null);
	const handleRef = useForkRef_default(nodeRef, getReactElementRef(children), ref);
	const normalizedTransitionCallback = (callback) => (maybeIsAppearing) => {
		if (callback) {
			const node = nodeRef.current;
			if (maybeIsAppearing === void 0) callback(node);
			else callback(node, maybeIsAppearing);
		}
	};
	const handleEntering = normalizedTransitionCallback(onEntering);
	const handleEnter = normalizedTransitionCallback((node, isAppearing) => {
		reflow(node);
		const { duration: transitionDuration, delay, easing: transitionTimingFunction } = getTransitionProps({
			style,
			timeout,
			easing
		}, { mode: "enter" });
		let duration;
		if (timeout === "auto") {
			duration = theme.transitions.getAutoHeightDuration(node.clientHeight);
			autoTimeout.current = duration;
		} else duration = transitionDuration;
		node.style.transition = [theme.transitions.create("opacity", {
			duration,
			delay
		}), theme.transitions.create("transform", {
			duration: isWebKit154 ? duration : duration * .666,
			delay,
			easing: transitionTimingFunction
		})].join(",");
		if (onEnter) onEnter(node, isAppearing);
	});
	const handleEntered = normalizedTransitionCallback(onEntered);
	const handleExiting = normalizedTransitionCallback(onExiting);
	const handleExit = normalizedTransitionCallback((node) => {
		const { duration: transitionDuration, delay, easing: transitionTimingFunction } = getTransitionProps({
			style,
			timeout,
			easing
		}, { mode: "exit" });
		let duration;
		if (timeout === "auto") {
			duration = theme.transitions.getAutoHeightDuration(node.clientHeight);
			autoTimeout.current = duration;
		} else duration = transitionDuration;
		node.style.transition = [theme.transitions.create("opacity", {
			duration,
			delay
		}), theme.transitions.create("transform", {
			duration: isWebKit154 ? duration : duration * .666,
			delay: isWebKit154 ? delay : delay || duration * .333,
			easing: transitionTimingFunction
		})].join(",");
		node.style.opacity = 0;
		node.style.transform = getScale(.75);
		if (onExit) onExit(node);
	});
	const handleExited = normalizedTransitionCallback(onExited);
	const handleAddEndListener = (next) => {
		if (timeout === "auto") timer.start(autoTimeout.current || 0, next);
		if (addEndListener) addEndListener(nodeRef.current, next);
	};
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(TransitionComponent, {
		appear,
		in: inProp,
		nodeRef,
		onEnter: handleEnter,
		onEntered: handleEntered,
		onEntering: handleEntering,
		onExit: handleExit,
		onExited: handleExited,
		onExiting: handleExiting,
		addEndListener: handleAddEndListener,
		timeout: timeout === "auto" ? null : timeout,
		...other,
		children: (state, { ownerState, ...restChildProps }) => {
			return /*#__PURE__*/ import_react.cloneElement(children, {
				style: {
					opacity: 0,
					transform: getScale(.75),
					visibility: state === "exited" && !inProp ? "hidden" : void 0,
					...styles[state],
					...style,
					...children.props.style
				},
				ref: handleRef,
				...restChildProps
			});
		}
	});
});
if (Grow) Grow.muiSupportAuto = true;
var useUtilityClasses$9 = (ownerState) => {
	const { classes, disableUnderline } = ownerState;
	const composedClasses = composeClasses({
		root: ["root", !disableUnderline && "underline"],
		input: ["input"]
	}, getInputUtilityClass, classes);
	return {
		...classes,
		...composedClasses
	};
};
var InputRoot = styled$1(InputBaseRoot, {
	shouldForwardProp: (prop) => rootShouldForwardProp(prop) || prop === "classes",
	name: "MuiInput",
	slot: "Root",
	overridesResolver: (props, styles) => {
		const { ownerState } = props;
		return [...rootOverridesResolver(props, styles), !ownerState.disableUnderline && styles.underline];
	}
})(memoTheme(({ theme }) => {
	let bottomLineColor = theme.palette.mode === "light" ? "rgba(0, 0, 0, 0.42)" : "rgba(255, 255, 255, 0.7)";
	if (theme.vars) bottomLineColor = theme.alpha(theme.vars.palette.common.onBackground, theme.vars.opacity.inputUnderline);
	return {
		position: "relative",
		variants: [
			{
				props: ({ ownerState }) => ownerState.formControl,
				style: { "label + &": { marginTop: 16 } }
			},
			{
				props: ({ ownerState }) => !ownerState.disableUnderline,
				style: {
					"&::after": {
						left: 0,
						bottom: 0,
						content: "\"\"",
						position: "absolute",
						right: 0,
						transform: "scaleX(0)",
						transition: theme.transitions.create("transform", {
							duration: theme.transitions.duration.shorter,
							easing: theme.transitions.easing.easeOut
						}),
						pointerEvents: "none"
					},
					[`&.${inputClasses.focused}:after`]: { transform: "scaleX(1) translateX(0)" },
					[`&.${inputClasses.error}`]: { "&::before, &::after": { borderBottomColor: (theme.vars || theme).palette.error.main } },
					"&::before": {
						borderBottom: `1px solid ${bottomLineColor}`,
						left: 0,
						bottom: 0,
						content: "\"\\00a0\"",
						position: "absolute",
						right: 0,
						transition: theme.transitions.create("border-bottom-color", { duration: theme.transitions.duration.shorter }),
						pointerEvents: "none"
					},
					[`&:hover:not(.${inputClasses.disabled}, .${inputClasses.error}):before`]: {
						borderBottom: `2px solid ${(theme.vars || theme).palette.text.primary}`,
						"@media (hover: none)": { borderBottom: `1px solid ${bottomLineColor}` }
					},
					[`&.${inputClasses.disabled}:before`]: { borderBottomStyle: "dotted" }
				}
			},
			...Object.entries(theme.palette).filter(createSimplePaletteValueFilter()).map(([color]) => ({
				props: {
					color,
					disableUnderline: false
				},
				style: { "&::after": { borderBottom: `2px solid ${(theme.vars || theme).palette[color].main}` } }
			}))
		]
	};
}));
var InputInput = styled$1(InputBaseInput, {
	name: "MuiInput",
	slot: "Input",
	overridesResolver: inputOverridesResolver
})({});
var Input = /*#__PURE__*/ import_react.forwardRef(function Input(inProps, ref) {
	const props = useDefaultProps$1({
		props: inProps,
		name: "MuiInput"
	});
	const { disableUnderline = false, components = {}, componentsProps: componentsPropsProp, fullWidth = false, inputComponent = "input", multiline = false, slotProps, slots = {}, type = "text", ...other } = props;
	const classes = useUtilityClasses$9(props);
	const inputComponentsProps = { root: { ownerState: { disableUnderline } } };
	const componentsProps = slotProps ?? componentsPropsProp ? deepmerge(slotProps ?? componentsPropsProp, inputComponentsProps) : inputComponentsProps;
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(InputBase, {
		slots: {
			root: slots.root ?? components.Root ?? InputRoot,
			input: slots.input ?? components.Input ?? InputInput
		},
		slotProps: componentsProps,
		fullWidth,
		inputComponent,
		multiline,
		ref,
		type,
		...other,
		classes
	});
});
Input.muiName = "Input";
function getInputLabelUtilityClasses(slot) {
	return generateUtilityClass("MuiInputLabel", slot);
}
generateUtilityClasses("MuiInputLabel", [
	"root",
	"focused",
	"disabled",
	"error",
	"required",
	"asterisk",
	"formControl",
	"sizeSmall",
	"shrink",
	"animated",
	"standard",
	"filled",
	"outlined"
]);
var useUtilityClasses$8 = (ownerState) => {
	const { classes, formControl, size, shrink, disableAnimation, variant, required } = ownerState;
	const composedClasses = composeClasses({
		root: [
			"root",
			formControl && "formControl",
			!disableAnimation && "animated",
			shrink && "shrink",
			size && size !== "medium" && `size${capitalize_default(size)}`,
			variant
		],
		asterisk: [required && "asterisk"]
	}, getInputLabelUtilityClasses, classes);
	return {
		...classes,
		...composedClasses
	};
};
var InputLabelRoot = styled$1(FormLabel, {
	shouldForwardProp: (prop) => rootShouldForwardProp(prop) || prop === "classes",
	name: "MuiInputLabel",
	slot: "Root",
	overridesResolver: (props, styles) => {
		const { ownerState } = props;
		return [
			{ [`& .${formLabelClasses.asterisk}`]: styles.asterisk },
			styles.root,
			ownerState.formControl && styles.formControl,
			ownerState.size === "small" && styles.sizeSmall,
			ownerState.shrink && styles.shrink,
			!ownerState.disableAnimation && styles.animated,
			ownerState.focused && styles.focused,
			styles[ownerState.variant]
		];
	}
})(memoTheme(({ theme }) => ({
	display: "block",
	transformOrigin: "top left",
	whiteSpace: "nowrap",
	overflow: "hidden",
	textOverflow: "ellipsis",
	maxWidth: "100%",
	variants: [
		{
			props: ({ ownerState }) => ownerState.formControl,
			style: {
				position: "absolute",
				left: 0,
				top: 0,
				transform: "translate(0, 20px) scale(1)"
			}
		},
		{
			props: { size: "small" },
			style: { transform: "translate(0, 17px) scale(1)" }
		},
		{
			props: ({ ownerState }) => ownerState.shrink,
			style: {
				transform: "translate(0, -1.5px) scale(0.75)",
				transformOrigin: "top left",
				maxWidth: "133%"
			}
		},
		{
			props: ({ ownerState }) => !ownerState.disableAnimation,
			style: { transition: theme.transitions.create([
				"color",
				"transform",
				"max-width"
			], {
				duration: theme.transitions.duration.shorter,
				easing: theme.transitions.easing.easeOut
			}) }
		},
		{
			props: { variant: "filled" },
			style: {
				zIndex: 1,
				pointerEvents: "none",
				transform: "translate(12px, 16px) scale(1)",
				maxWidth: "calc(100% - 24px)"
			}
		},
		{
			props: {
				variant: "filled",
				size: "small"
			},
			style: { transform: "translate(12px, 13px) scale(1)" }
		},
		{
			props: ({ variant, ownerState }) => variant === "filled" && ownerState.shrink,
			style: {
				userSelect: "none",
				pointerEvents: "auto",
				transform: "translate(12px, 7px) scale(0.75)",
				maxWidth: "calc(133% - 24px)"
			}
		},
		{
			props: ({ variant, ownerState, size }) => variant === "filled" && ownerState.shrink && size === "small",
			style: { transform: "translate(12px, 4px) scale(0.75)" }
		},
		{
			props: { variant: "outlined" },
			style: {
				zIndex: 1,
				pointerEvents: "none",
				transform: "translate(14px, 16px) scale(1)",
				maxWidth: "calc(100% - 24px)"
			}
		},
		{
			props: {
				variant: "outlined",
				size: "small"
			},
			style: { transform: "translate(14px, 9px) scale(1)" }
		},
		{
			props: ({ variant, ownerState }) => variant === "outlined" && ownerState.shrink,
			style: {
				userSelect: "none",
				pointerEvents: "auto",
				maxWidth: "calc(133% - 32px)",
				transform: "translate(14px, -9px) scale(0.75)"
			}
		}
	]
})));
var InputLabel = /*#__PURE__*/ import_react.forwardRef(function InputLabel(inProps, ref) {
	const props = useDefaultProps$1({
		name: "MuiInputLabel",
		props: inProps
	});
	const { disableAnimation = false, margin, shrink: shrinkProp, variant, className, ...other } = props;
	const muiFormControl = useFormControl();
	let shrink = shrinkProp;
	if (typeof shrink === "undefined" && muiFormControl) shrink = muiFormControl.filled || muiFormControl.focused || muiFormControl.adornedStart;
	const fcs = formControlState({
		props,
		muiFormControl,
		states: [
			"size",
			"variant",
			"required",
			"focused"
		]
	});
	const ownerState = {
		...props,
		disableAnimation,
		formControl: muiFormControl,
		shrink,
		size: fcs.size,
		variant: fcs.variant,
		required: fcs.required,
		focused: fcs.focused
	};
	const classes = useUtilityClasses$8(ownerState);
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(InputLabelRoot, {
		"data-shrink": shrink,
		ref,
		className: clsx(classes.root, className),
		...other,
		ownerState,
		classes
	});
});
/**
* @ignore - internal component.
*/
var ListContext = /*#__PURE__*/ import_react.createContext({});
function getListUtilityClass(slot) {
	return generateUtilityClass("MuiList", slot);
}
generateUtilityClasses("MuiList", [
	"root",
	"padding",
	"dense",
	"subheader"
]);
var useUtilityClasses$7 = (ownerState) => {
	const { classes, disablePadding, dense, subheader } = ownerState;
	return composeClasses({ root: [
		"root",
		!disablePadding && "padding",
		dense && "dense",
		subheader && "subheader"
	] }, getListUtilityClass, classes);
};
var ListRoot = styled$1("ul", {
	name: "MuiList",
	slot: "Root",
	overridesResolver: (props, styles) => {
		const { ownerState } = props;
		return [
			styles.root,
			!ownerState.disablePadding && styles.padding,
			ownerState.dense && styles.dense,
			ownerState.subheader && styles.subheader
		];
	}
})({
	listStyle: "none",
	margin: 0,
	padding: 0,
	position: "relative",
	variants: [{
		props: ({ ownerState }) => !ownerState.disablePadding,
		style: {
			paddingTop: 8,
			paddingBottom: 8
		}
	}, {
		props: ({ ownerState }) => ownerState.subheader,
		style: { paddingTop: 0 }
	}]
});
var List = /*#__PURE__*/ import_react.forwardRef(function List(inProps, ref) {
	const props = useDefaultProps$1({
		props: inProps,
		name: "MuiList"
	});
	const { children, className, component = "ul", dense = false, disablePadding = false, subheader, ...other } = props;
	const context = import_react.useMemo(() => ({ dense }), [dense]);
	const ownerState = {
		...props,
		component,
		dense,
		disablePadding
	};
	const classes = useUtilityClasses$7(ownerState);
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(ListContext.Provider, {
		value: context,
		children: /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(ListRoot, {
			as: component,
			className: clsx(classes.root, className),
			ref,
			ownerState,
			...other,
			children: [subheader, children]
		})
	});
});
var getScrollbarSize_default = getScrollbarSize;
function nextItem(list, item, disableListWrap) {
	if (list === item) return list.firstChild;
	if (item && item.nextElementSibling) return item.nextElementSibling;
	return disableListWrap ? null : list.firstChild;
}
function previousItem(list, item, disableListWrap) {
	if (list === item) return disableListWrap ? list.firstChild : list.lastChild;
	if (item && item.previousElementSibling) return item.previousElementSibling;
	return disableListWrap ? null : list.lastChild;
}
function textCriteriaMatches(nextFocus, textCriteria) {
	if (textCriteria === void 0) return true;
	let text = nextFocus.innerText;
	if (text === void 0) text = nextFocus.textContent;
	text = text.trim().toLowerCase();
	if (text.length === 0) return false;
	if (textCriteria.repeating) return text[0] === textCriteria.keys[0];
	return text.startsWith(textCriteria.keys.join(""));
}
function moveFocus(list, currentFocus, disableListWrap, disabledItemsFocusable, traversalFunction, textCriteria) {
	let wrappedOnce = false;
	let nextFocus = traversalFunction(list, currentFocus, currentFocus ? disableListWrap : false);
	while (nextFocus) {
		if (nextFocus === list.firstChild) {
			if (wrappedOnce) return false;
			wrappedOnce = true;
		}
		const nextFocusDisabled = disabledItemsFocusable ? false : nextFocus.disabled || nextFocus.getAttribute("aria-disabled") === "true";
		if (!nextFocus.hasAttribute("tabindex") || !textCriteriaMatches(nextFocus, textCriteria) || nextFocusDisabled) nextFocus = traversalFunction(list, nextFocus, disableListWrap);
		else {
			nextFocus.focus();
			return true;
		}
	}
	return false;
}
/**
* A permanently displayed menu following https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/.
* It's exposed to help customization of the [`Menu`](/material-ui/api/menu/) component if you
* use it separately you need to move focus into the component manually. Once
* the focus is placed inside the component it is fully keyboard accessible.
*/
var MenuList = /*#__PURE__*/ import_react.forwardRef(function MenuList(props, ref) {
	const { actions, autoFocus = false, autoFocusItem = false, children, className, disabledItemsFocusable = false, disableListWrap = false, onKeyDown, variant = "selectedMenu", ...other } = props;
	const listRef = import_react.useRef(null);
	const textCriteriaRef = import_react.useRef({
		keys: [],
		repeating: true,
		previousKeyMatched: true,
		lastTime: null
	});
	useEnhancedEffect_default(() => {
		if (autoFocus) listRef.current.focus();
	}, [autoFocus]);
	import_react.useImperativeHandle(actions, () => ({ adjustStyleForScrollbar: (containerElement, { direction }) => {
		const noExplicitWidth = !listRef.current.style.width;
		if (containerElement.clientHeight < listRef.current.clientHeight && noExplicitWidth) {
			const scrollbarSize = `${getScrollbarSize_default(ownerWindow_default(containerElement))}px`;
			listRef.current.style[direction === "rtl" ? "paddingLeft" : "paddingRight"] = scrollbarSize;
			listRef.current.style.width = `calc(100% + ${scrollbarSize})`;
		}
		return listRef.current;
	} }), []);
	const handleKeyDown = (event) => {
		const list = listRef.current;
		const key = event.key;
		if (event.ctrlKey || event.metaKey || event.altKey) {
			if (onKeyDown) onKeyDown(event);
			return;
		}
		/**
		* @type {Element} - will always be defined since we are in a keydown handler
		* attached to an element. A keydown event is either dispatched to the activeElement
		* or document.body or document.documentElement. Only the first case will
		* trigger this specific handler.
		*/
		const currentFocus = ownerDocument_default(list).activeElement;
		if (key === "ArrowDown") {
			event.preventDefault();
			moveFocus(list, currentFocus, disableListWrap, disabledItemsFocusable, nextItem);
		} else if (key === "ArrowUp") {
			event.preventDefault();
			moveFocus(list, currentFocus, disableListWrap, disabledItemsFocusable, previousItem);
		} else if (key === "Home") {
			event.preventDefault();
			moveFocus(list, null, disableListWrap, disabledItemsFocusable, nextItem);
		} else if (key === "End") {
			event.preventDefault();
			moveFocus(list, null, disableListWrap, disabledItemsFocusable, previousItem);
		} else if (key.length === 1) {
			const criteria = textCriteriaRef.current;
			const lowerKey = key.toLowerCase();
			const currTime = performance_default.now();
			if (criteria.keys.length > 0) {
				if (currTime - criteria.lastTime > 500) {
					criteria.keys = [];
					criteria.repeating = true;
					criteria.previousKeyMatched = true;
				} else if (criteria.repeating && lowerKey !== criteria.keys[0]) criteria.repeating = false;
			}
			criteria.lastTime = currTime;
			criteria.keys.push(lowerKey);
			const keepFocusOnCurrent = currentFocus && !criteria.repeating && textCriteriaMatches(currentFocus, criteria);
			if (criteria.previousKeyMatched && (keepFocusOnCurrent || moveFocus(list, currentFocus, false, disabledItemsFocusable, nextItem, criteria))) event.preventDefault();
			else criteria.previousKeyMatched = false;
		}
		if (onKeyDown) onKeyDown(event);
	};
	const handleRef = useForkRef_default(listRef, ref);
	/**
	* the index of the item should receive focus
	* in a `variant="selectedMenu"` it's the first `selected` item
	* otherwise it's the very first item.
	*/
	let activeItemIndex = -1;
	import_react.Children.forEach(children, (child, index) => {
		if (!/*#__PURE__*/ import_react.isValidElement(child)) {
			if (activeItemIndex === index) {
				activeItemIndex += 1;
				if (activeItemIndex >= children.length) activeItemIndex = -1;
			}
			return;
		}
		if (!child.props.disabled) {
			if (variant === "selectedMenu" && child.props.selected) activeItemIndex = index;
			else if (activeItemIndex === -1) activeItemIndex = index;
		}
		if (activeItemIndex === index && (child.props.disabled || child.props.muiSkipListHighlight || child.type.muiSkipListHighlight)) {
			activeItemIndex += 1;
			if (activeItemIndex >= children.length) activeItemIndex = -1;
		}
	});
	const items = import_react.Children.map(children, (child, index) => {
		if (index === activeItemIndex) {
			const newChildProps = {};
			if (autoFocusItem) newChildProps.autoFocus = true;
			if (child.props.tabIndex === void 0 && variant === "selectedMenu") newChildProps.tabIndex = 0;
			return /*#__PURE__*/ import_react.cloneElement(child, newChildProps);
		}
		return child;
	});
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(List, {
		role: "menu",
		ref: handleRef,
		className,
		onKeyDown: handleKeyDown,
		tabIndex: autoFocus ? 0 : -1,
		...other,
		children: items
	});
});
function getPopoverUtilityClass(slot) {
	return generateUtilityClass("MuiPopover", slot);
}
generateUtilityClasses("MuiPopover", ["root", "paper"]);
function getOffsetTop(rect, vertical) {
	let offset = 0;
	if (typeof vertical === "number") offset = vertical;
	else if (vertical === "center") offset = rect.height / 2;
	else if (vertical === "bottom") offset = rect.height;
	return offset;
}
function getOffsetLeft(rect, horizontal) {
	let offset = 0;
	if (typeof horizontal === "number") offset = horizontal;
	else if (horizontal === "center") offset = rect.width / 2;
	else if (horizontal === "right") offset = rect.width;
	return offset;
}
function getTransformOriginValue(transformOrigin) {
	return [transformOrigin.horizontal, transformOrigin.vertical].map((n) => typeof n === "number" ? `${n}px` : n).join(" ");
}
function resolveAnchorEl(anchorEl) {
	return typeof anchorEl === "function" ? anchorEl() : anchorEl;
}
var useUtilityClasses$6 = (ownerState) => {
	const { classes } = ownerState;
	return composeClasses({
		root: ["root"],
		paper: ["paper"]
	}, getPopoverUtilityClass, classes);
};
var PopoverRoot = styled$1(Modal, {
	name: "MuiPopover",
	slot: "Root"
})({});
var PopoverPaper = styled$1(Paper, {
	name: "MuiPopover",
	slot: "Paper"
})({
	position: "absolute",
	overflowY: "auto",
	overflowX: "hidden",
	minWidth: 16,
	minHeight: 16,
	maxWidth: "calc(100% - 32px)",
	maxHeight: "calc(100% - 32px)",
	outline: 0
});
var Popover = /*#__PURE__*/ import_react.forwardRef(function Popover(inProps, ref) {
	const props = useDefaultProps$1({
		props: inProps,
		name: "MuiPopover"
	});
	const { action, anchorEl, anchorOrigin = {
		vertical: "top",
		horizontal: "left"
	}, anchorPosition, anchorReference = "anchorEl", children, className, container: containerProp, elevation = 8, marginThreshold = 16, open, PaperProps: PaperPropsProp = {}, slots = {}, slotProps = {}, transformOrigin = {
		vertical: "top",
		horizontal: "left"
	}, TransitionComponent, transitionDuration: transitionDurationProp = "auto", TransitionProps = {}, disableScrollLock = false, ...other } = props;
	const paperRef = import_react.useRef();
	const ownerState = {
		...props,
		anchorOrigin,
		anchorReference,
		elevation,
		marginThreshold,
		transformOrigin,
		TransitionComponent,
		transitionDuration: transitionDurationProp,
		TransitionProps
	};
	const classes = useUtilityClasses$6(ownerState);
	const getAnchorOffset = import_react.useCallback(() => {
		if (anchorReference === "anchorPosition") return anchorPosition;
		const resolvedAnchorEl = resolveAnchorEl(anchorEl);
		const anchorRect = (resolvedAnchorEl && resolvedAnchorEl.nodeType === 1 ? resolvedAnchorEl : ownerDocument_default(paperRef.current).body).getBoundingClientRect();
		return {
			top: anchorRect.top + getOffsetTop(anchorRect, anchorOrigin.vertical),
			left: anchorRect.left + getOffsetLeft(anchorRect, anchorOrigin.horizontal)
		};
	}, [
		anchorEl,
		anchorOrigin.horizontal,
		anchorOrigin.vertical,
		anchorPosition,
		anchorReference
	]);
	const getTransformOrigin = import_react.useCallback((elemRect) => {
		return {
			vertical: getOffsetTop(elemRect, transformOrigin.vertical),
			horizontal: getOffsetLeft(elemRect, transformOrigin.horizontal)
		};
	}, [transformOrigin.horizontal, transformOrigin.vertical]);
	const getPositioningStyle = import_react.useCallback((element) => {
		const elemRect = {
			width: element.offsetWidth,
			height: element.offsetHeight
		};
		const elemTransformOrigin = getTransformOrigin(elemRect);
		if (anchorReference === "none") return {
			top: null,
			left: null,
			transformOrigin: getTransformOriginValue(elemTransformOrigin)
		};
		const anchorOffset = getAnchorOffset();
		let top = anchorOffset.top - elemTransformOrigin.vertical;
		let left = anchorOffset.left - elemTransformOrigin.horizontal;
		const bottom = top + elemRect.height;
		const right = left + elemRect.width;
		const containerWindow = ownerWindow_default(resolveAnchorEl(anchorEl));
		const heightThreshold = containerWindow.innerHeight - marginThreshold;
		const widthThreshold = containerWindow.innerWidth - marginThreshold;
		if (marginThreshold !== null && top < marginThreshold) {
			const diff = top - marginThreshold;
			top -= diff;
			elemTransformOrigin.vertical += diff;
		} else if (marginThreshold !== null && bottom > heightThreshold) {
			const diff = bottom - heightThreshold;
			top -= diff;
			elemTransformOrigin.vertical += diff;
		}
		if (marginThreshold !== null && left < marginThreshold) {
			const diff = left - marginThreshold;
			left -= diff;
			elemTransformOrigin.horizontal += diff;
		} else if (right > widthThreshold) {
			const diff = right - widthThreshold;
			left -= diff;
			elemTransformOrigin.horizontal += diff;
		}
		return {
			top: `${Math.round(top)}px`,
			left: `${Math.round(left)}px`,
			transformOrigin: getTransformOriginValue(elemTransformOrigin)
		};
	}, [
		anchorEl,
		anchorReference,
		getAnchorOffset,
		getTransformOrigin,
		marginThreshold
	]);
	const [isPositioned, setIsPositioned] = import_react.useState(open);
	const setPositioningStyles = import_react.useCallback(() => {
		const element = paperRef.current;
		if (!element) return;
		const positioning = getPositioningStyle(element);
		if (positioning.top !== null) element.style.setProperty("top", positioning.top);
		if (positioning.left !== null) element.style.left = positioning.left;
		element.style.transformOrigin = positioning.transformOrigin;
		setIsPositioned(true);
	}, [getPositioningStyle]);
	import_react.useEffect(() => {
		if (disableScrollLock) window.addEventListener("scroll", setPositioningStyles);
		return () => window.removeEventListener("scroll", setPositioningStyles);
	}, [
		anchorEl,
		disableScrollLock,
		setPositioningStyles
	]);
	const handleEntering = () => {
		setPositioningStyles();
	};
	const handleExited = () => {
		setIsPositioned(false);
	};
	import_react.useEffect(() => {
		if (open) setPositioningStyles();
	});
	import_react.useImperativeHandle(action, () => open ? { updatePosition: () => {
		setPositioningStyles();
	} } : null, [open, setPositioningStyles]);
	import_react.useEffect(() => {
		if (!open) return;
		const handleResize = debounce_default(() => {
			setPositioningStyles();
		});
		const containerWindow = ownerWindow_default(resolveAnchorEl(anchorEl));
		containerWindow.addEventListener("resize", handleResize);
		return () => {
			handleResize.clear();
			containerWindow.removeEventListener("resize", handleResize);
		};
	}, [
		anchorEl,
		open,
		setPositioningStyles
	]);
	let transitionDuration = transitionDurationProp;
	const externalForwardedProps = {
		slots: {
			transition: TransitionComponent,
			...slots
		},
		slotProps: {
			transition: TransitionProps,
			paper: PaperPropsProp,
			...slotProps
		}
	};
	const [TransitionSlot, transitionSlotProps] = useSlot("transition", {
		elementType: Grow,
		externalForwardedProps,
		ownerState,
		getSlotProps: (handlers) => ({
			...handlers,
			onEntering: (element, isAppearing) => {
				handlers.onEntering?.(element, isAppearing);
				handleEntering();
			},
			onExited: (element) => {
				handlers.onExited?.(element);
				handleExited();
			}
		}),
		additionalProps: {
			appear: true,
			in: open
		}
	});
	if (transitionDurationProp === "auto" && !TransitionSlot.muiSupportAuto) transitionDuration = void 0;
	const container = containerProp || (anchorEl ? ownerDocument_default(resolveAnchorEl(anchorEl)).body : void 0);
	const [RootSlot, { slots: rootSlotsProp, slotProps: rootSlotPropsProp, ...rootProps }] = useSlot("root", {
		ref,
		elementType: PopoverRoot,
		externalForwardedProps: {
			...externalForwardedProps,
			...other
		},
		shouldForwardComponentProp: true,
		additionalProps: {
			slots: { backdrop: slots.backdrop },
			slotProps: { backdrop: mergeSlotProps$1(typeof slotProps.backdrop === "function" ? slotProps.backdrop(ownerState) : slotProps.backdrop, { invisible: true }) },
			container,
			open
		},
		ownerState,
		className: clsx(classes.root, className)
	});
	const [PaperSlot, paperProps] = useSlot("paper", {
		ref: paperRef,
		className: classes.paper,
		elementType: PopoverPaper,
		externalForwardedProps,
		shouldForwardComponentProp: true,
		additionalProps: {
			elevation,
			style: isPositioned ? void 0 : { opacity: 0 }
		},
		ownerState
	});
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(RootSlot, {
		...rootProps,
		...!isHostComponent(RootSlot) && {
			slots: rootSlotsProp,
			slotProps: rootSlotPropsProp,
			disableScrollLock
		},
		children: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(TransitionSlot, {
			...transitionSlotProps,
			timeout: transitionDuration,
			children: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(PaperSlot, {
				...paperProps,
				children
			})
		})
	});
});
function getMenuUtilityClass(slot) {
	return generateUtilityClass("MuiMenu", slot);
}
generateUtilityClasses("MuiMenu", [
	"root",
	"paper",
	"list"
]);
var RTL_ORIGIN = {
	vertical: "top",
	horizontal: "right"
};
var LTR_ORIGIN = {
	vertical: "top",
	horizontal: "left"
};
var useUtilityClasses$5 = (ownerState) => {
	const { classes } = ownerState;
	return composeClasses({
		root: ["root"],
		paper: ["paper"],
		list: ["list"]
	}, getMenuUtilityClass, classes);
};
var MenuRoot = styled$1(Popover, {
	shouldForwardProp: (prop) => rootShouldForwardProp(prop) || prop === "classes",
	name: "MuiMenu",
	slot: "Root"
})({});
var MenuPaper = styled$1(PopoverPaper, {
	name: "MuiMenu",
	slot: "Paper"
})({
	maxHeight: "calc(100% - 96px)",
	WebkitOverflowScrolling: "touch"
});
var MenuMenuList = styled$1(MenuList, {
	name: "MuiMenu",
	slot: "List"
})({ outline: 0 });
var Menu = /*#__PURE__*/ import_react.forwardRef(function Menu(inProps, ref) {
	const props = useDefaultProps$1({
		props: inProps,
		name: "MuiMenu"
	});
	const { autoFocus = true, children, className, disableAutoFocusItem = false, MenuListProps = {}, onClose, open, PaperProps = {}, PopoverClasses, transitionDuration = "auto", TransitionProps: { onEntering, ...TransitionProps } = {}, variant = "selectedMenu", slots = {}, slotProps = {}, ...other } = props;
	const isRtl = useRtl();
	const ownerState = {
		...props,
		autoFocus,
		disableAutoFocusItem,
		MenuListProps,
		onEntering,
		PaperProps,
		transitionDuration,
		TransitionProps,
		variant
	};
	const classes = useUtilityClasses$5(ownerState);
	const autoFocusItem = autoFocus && !disableAutoFocusItem && open;
	const menuListActionsRef = import_react.useRef(null);
	const handleEntering = (element, isAppearing) => {
		if (menuListActionsRef.current) menuListActionsRef.current.adjustStyleForScrollbar(element, { direction: isRtl ? "rtl" : "ltr" });
		if (onEntering) onEntering(element, isAppearing);
	};
	const handleListKeyDown = (event) => {
		if (event.key === "Tab") {
			event.preventDefault();
			if (onClose) onClose(event, "tabKeyDown");
		}
	};
	/**
	* the index of the item should receive focus
	* in a `variant="selectedMenu"` it's the first `selected` item
	* otherwise it's the very first item.
	*/
	let activeItemIndex = -1;
	import_react.Children.map(children, (child, index) => {
		if (!/*#__PURE__*/ import_react.isValidElement(child)) return;
		if (!child.props.disabled) {
			if (variant === "selectedMenu" && child.props.selected) activeItemIndex = index;
			else if (activeItemIndex === -1) activeItemIndex = index;
		}
	});
	const externalForwardedProps = {
		slots,
		slotProps: {
			list: MenuListProps,
			transition: TransitionProps,
			paper: PaperProps,
			...slotProps
		}
	};
	const rootSlotProps = useSlotProps({
		elementType: slots.root,
		externalSlotProps: slotProps.root,
		ownerState,
		className: [classes.root, className]
	});
	const [PaperSlot, paperSlotProps] = useSlot("paper", {
		className: classes.paper,
		elementType: MenuPaper,
		externalForwardedProps,
		shouldForwardComponentProp: true,
		ownerState
	});
	const [ListSlot, listSlotProps] = useSlot("list", {
		className: clsx(classes.list, MenuListProps.className),
		elementType: MenuMenuList,
		shouldForwardComponentProp: true,
		externalForwardedProps,
		getSlotProps: (handlers) => ({
			...handlers,
			onKeyDown: (event) => {
				handleListKeyDown(event);
				handlers.onKeyDown?.(event);
			}
		}),
		ownerState
	});
	const resolvedTransitionProps = typeof externalForwardedProps.slotProps.transition === "function" ? externalForwardedProps.slotProps.transition(ownerState) : externalForwardedProps.slotProps.transition;
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(MenuRoot, {
		onClose,
		anchorOrigin: {
			vertical: "bottom",
			horizontal: isRtl ? "right" : "left"
		},
		transformOrigin: isRtl ? RTL_ORIGIN : LTR_ORIGIN,
		slots: {
			root: slots.root,
			paper: PaperSlot,
			backdrop: slots.backdrop,
			...slots.transition && { transition: slots.transition }
		},
		slotProps: {
			root: rootSlotProps,
			paper: paperSlotProps,
			backdrop: typeof slotProps.backdrop === "function" ? slotProps.backdrop(ownerState) : slotProps.backdrop,
			transition: {
				...resolvedTransitionProps,
				onEntering: (...args) => {
					handleEntering(...args);
					resolvedTransitionProps?.onEntering?.(...args);
				}
			}
		},
		open,
		ref,
		transitionDuration,
		ownerState,
		...other,
		classes: PopoverClasses,
		children: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(ListSlot, {
			actions: menuListActionsRef,
			autoFocus: autoFocus && (activeItemIndex === -1 || disableAutoFocusItem),
			autoFocusItem,
			variant,
			...listSlotProps,
			children
		})
	});
});
function getNativeSelectUtilityClasses(slot) {
	return generateUtilityClass("MuiNativeSelect", slot);
}
var nativeSelectClasses = generateUtilityClasses("MuiNativeSelect", [
	"root",
	"select",
	"multiple",
	"filled",
	"outlined",
	"standard",
	"disabled",
	"icon",
	"iconOpen",
	"iconFilled",
	"iconOutlined",
	"iconStandard",
	"nativeInput",
	"error"
]);
var useUtilityClasses$4 = (ownerState) => {
	const { classes, variant, disabled, multiple, open, error } = ownerState;
	return composeClasses({
		select: [
			"select",
			variant,
			disabled && "disabled",
			multiple && "multiple",
			error && "error"
		],
		icon: [
			"icon",
			`icon${capitalize_default(variant)}`,
			open && "iconOpen",
			disabled && "disabled"
		]
	}, getNativeSelectUtilityClasses, classes);
};
var StyledSelectSelect = styled$1("select", { name: "MuiNativeSelect" })(({ theme }) => ({
	MozAppearance: "none",
	WebkitAppearance: "none",
	userSelect: "none",
	borderRadius: 0,
	cursor: "pointer",
	"&:focus": { borderRadius: 0 },
	[`&.${nativeSelectClasses.disabled}`]: { cursor: "default" },
	"&[multiple]": { height: "auto" },
	"&:not([multiple]) option, &:not([multiple]) optgroup": { backgroundColor: (theme.vars || theme).palette.background.paper },
	variants: [
		{
			props: ({ ownerState }) => ownerState.variant !== "filled" && ownerState.variant !== "outlined",
			style: { "&&&": {
				paddingRight: 24,
				minWidth: 16
			} }
		},
		{
			props: { variant: "filled" },
			style: { "&&&": { paddingRight: 32 } }
		},
		{
			props: { variant: "outlined" },
			style: {
				borderRadius: (theme.vars || theme).shape.borderRadius,
				"&:focus": { borderRadius: (theme.vars || theme).shape.borderRadius },
				"&&&": { paddingRight: 32 }
			}
		}
	]
}));
var NativeSelectSelect = styled$1(StyledSelectSelect, {
	name: "MuiNativeSelect",
	slot: "Select",
	shouldForwardProp: rootShouldForwardProp,
	overridesResolver: (props, styles) => {
		const { ownerState } = props;
		return [
			styles.select,
			styles[ownerState.variant],
			ownerState.error && styles.error,
			{ [`&.${nativeSelectClasses.multiple}`]: styles.multiple }
		];
	}
})({});
var StyledSelectIcon = styled$1("svg", { name: "MuiNativeSelect" })(({ theme }) => ({
	position: "absolute",
	right: 0,
	top: "calc(50% - .5em)",
	pointerEvents: "none",
	color: (theme.vars || theme).palette.action.active,
	[`&.${nativeSelectClasses.disabled}`]: { color: (theme.vars || theme).palette.action.disabled },
	variants: [
		{
			props: ({ ownerState }) => ownerState.open,
			style: { transform: "rotate(180deg)" }
		},
		{
			props: { variant: "filled" },
			style: { right: 7 }
		},
		{
			props: { variant: "outlined" },
			style: { right: 7 }
		}
	]
}));
var NativeSelectIcon = styled$1(StyledSelectIcon, {
	name: "MuiNativeSelect",
	slot: "Icon",
	overridesResolver: (props, styles) => {
		const { ownerState } = props;
		return [
			styles.icon,
			ownerState.variant && styles[`icon${capitalize_default(ownerState.variant)}`],
			ownerState.open && styles.iconOpen
		];
	}
})({});
/**
* @ignore - internal component.
*/
var NativeSelectInput = /*#__PURE__*/ import_react.forwardRef(function NativeSelectInput(props, ref) {
	const { className, disabled, error, IconComponent, inputRef, variant = "standard", ...other } = props;
	const ownerState = {
		...props,
		disabled,
		variant,
		error
	};
	const classes = useUtilityClasses$4(ownerState);
	return /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [/*#__PURE__*/ (0, import_jsx_runtime.jsx)(NativeSelectSelect, {
		ownerState,
		className: clsx(classes.select, className),
		disabled,
		ref: inputRef || ref,
		...other
	}), props.multiple ? null : /*#__PURE__*/ (0, import_jsx_runtime.jsx)(NativeSelectIcon, {
		as: IconComponent,
		ownerState,
		className: classes.icon
	})] });
});
var _span$1;
var NotchedOutlineRoot$1 = styled$1("fieldset", {
	name: "MuiNotchedOutlined",
	shouldForwardProp: rootShouldForwardProp
})({
	textAlign: "left",
	position: "absolute",
	bottom: 0,
	right: 0,
	top: -5,
	left: 0,
	margin: 0,
	padding: "0 8px",
	pointerEvents: "none",
	borderRadius: "inherit",
	borderStyle: "solid",
	borderWidth: 1,
	overflow: "hidden",
	minWidth: "0%"
});
var NotchedOutlineLegend = styled$1("legend", {
	name: "MuiNotchedOutlined",
	shouldForwardProp: rootShouldForwardProp
})(memoTheme(({ theme }) => ({
	float: "unset",
	width: "auto",
	overflow: "hidden",
	variants: [
		{
			props: ({ ownerState }) => !ownerState.withLabel,
			style: {
				padding: 0,
				lineHeight: "11px",
				transition: theme.transitions.create("width", {
					duration: 150,
					easing: theme.transitions.easing.easeOut
				})
			}
		},
		{
			props: ({ ownerState }) => ownerState.withLabel,
			style: {
				display: "block",
				padding: 0,
				height: 11,
				fontSize: "0.75em",
				visibility: "hidden",
				maxWidth: .01,
				transition: theme.transitions.create("max-width", {
					duration: 50,
					easing: theme.transitions.easing.easeOut
				}),
				whiteSpace: "nowrap",
				"& > span": {
					paddingLeft: 5,
					paddingRight: 5,
					display: "inline-block",
					opacity: 0,
					visibility: "visible"
				}
			}
		},
		{
			props: ({ ownerState }) => ownerState.withLabel && ownerState.notched,
			style: {
				maxWidth: "100%",
				transition: theme.transitions.create("max-width", {
					duration: 100,
					easing: theme.transitions.easing.easeOut,
					delay: 50
				})
			}
		}
	]
})));
/**
* @ignore - internal component.
*/
function NotchedOutline(props) {
	const { children, classes, className, label, notched, ...other } = props;
	const withLabel = label != null && label !== "";
	const ownerState = {
		...props,
		notched,
		withLabel
	};
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(NotchedOutlineRoot$1, {
		"aria-hidden": true,
		className,
		ownerState,
		...other,
		children: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(NotchedOutlineLegend, {
			ownerState,
			children: withLabel ? /*#__PURE__*/ (0, import_jsx_runtime.jsx)("span", { children: label }) : _span$1 || (_span$1 = /*#__PURE__*/ (0, import_jsx_runtime.jsx)("span", {
				className: "notranslate",
				"aria-hidden": true,
				children: "​"
			}))
		})
	});
}
var useUtilityClasses$3 = (ownerState) => {
	const { classes } = ownerState;
	const composedClasses = composeClasses({
		root: ["root"],
		notchedOutline: ["notchedOutline"],
		input: ["input"]
	}, getOutlinedInputUtilityClass, classes);
	return {
		...classes,
		...composedClasses
	};
};
var OutlinedInputRoot = styled$1(InputBaseRoot, {
	shouldForwardProp: (prop) => rootShouldForwardProp(prop) || prop === "classes",
	name: "MuiOutlinedInput",
	slot: "Root",
	overridesResolver: rootOverridesResolver
})(memoTheme(({ theme }) => {
	const borderColor = theme.palette.mode === "light" ? "rgba(0, 0, 0, 0.23)" : "rgba(255, 255, 255, 0.23)";
	return {
		position: "relative",
		borderRadius: (theme.vars || theme).shape.borderRadius,
		[`&:hover .${outlinedInputClasses.notchedOutline}`]: { borderColor: (theme.vars || theme).palette.text.primary },
		"@media (hover: none)": { [`&:hover .${outlinedInputClasses.notchedOutline}`]: { borderColor: theme.vars ? theme.alpha(theme.vars.palette.common.onBackground, .23) : borderColor } },
		[`&.${outlinedInputClasses.focused} .${outlinedInputClasses.notchedOutline}`]: { borderWidth: 2 },
		variants: [
			...Object.entries(theme.palette).filter(createSimplePaletteValueFilter()).map(([color]) => ({
				props: { color },
				style: { [`&.${outlinedInputClasses.focused} .${outlinedInputClasses.notchedOutline}`]: { borderColor: (theme.vars || theme).palette[color].main } }
			})),
			{
				props: {},
				style: {
					[`&.${outlinedInputClasses.error} .${outlinedInputClasses.notchedOutline}`]: { borderColor: (theme.vars || theme).palette.error.main },
					[`&.${outlinedInputClasses.disabled} .${outlinedInputClasses.notchedOutline}`]: { borderColor: (theme.vars || theme).palette.action.disabled }
				}
			},
			{
				props: ({ ownerState }) => ownerState.startAdornment,
				style: { paddingLeft: 14 }
			},
			{
				props: ({ ownerState }) => ownerState.endAdornment,
				style: { paddingRight: 14 }
			},
			{
				props: ({ ownerState }) => ownerState.multiline,
				style: { padding: "16.5px 14px" }
			},
			{
				props: ({ ownerState, size }) => ownerState.multiline && size === "small",
				style: { padding: "8.5px 14px" }
			}
		]
	};
}));
var NotchedOutlineRoot = styled$1(NotchedOutline, {
	name: "MuiOutlinedInput",
	slot: "NotchedOutline"
})(memoTheme(({ theme }) => {
	const borderColor = theme.palette.mode === "light" ? "rgba(0, 0, 0, 0.23)" : "rgba(255, 255, 255, 0.23)";
	return { borderColor: theme.vars ? theme.alpha(theme.vars.palette.common.onBackground, .23) : borderColor };
}));
var OutlinedInputInput = styled$1(InputBaseInput, {
	name: "MuiOutlinedInput",
	slot: "Input",
	overridesResolver: inputOverridesResolver
})(memoTheme(({ theme }) => ({
	padding: "16.5px 14px",
	...!theme.vars && { "&:-webkit-autofill": {
		WebkitBoxShadow: theme.palette.mode === "light" ? null : "0 0 0 100px #266798 inset",
		WebkitTextFillColor: theme.palette.mode === "light" ? null : "#fff",
		caretColor: theme.palette.mode === "light" ? null : "#fff",
		borderRadius: "inherit"
	} },
	...theme.vars && {
		"&:-webkit-autofill": { borderRadius: "inherit" },
		[theme.getColorSchemeSelector("dark")]: { "&:-webkit-autofill": {
			WebkitBoxShadow: "0 0 0 100px #266798 inset",
			WebkitTextFillColor: "#fff",
			caretColor: "#fff"
		} }
	},
	variants: [
		{
			props: { size: "small" },
			style: { padding: "8.5px 14px" }
		},
		{
			props: ({ ownerState }) => ownerState.multiline,
			style: { padding: 0 }
		},
		{
			props: ({ ownerState }) => ownerState.startAdornment,
			style: { paddingLeft: 0 }
		},
		{
			props: ({ ownerState }) => ownerState.endAdornment,
			style: { paddingRight: 0 }
		}
	]
})));
var OutlinedInput = /*#__PURE__*/ import_react.forwardRef(function OutlinedInput(inProps, ref) {
	const props = useDefaultProps$1({
		props: inProps,
		name: "MuiOutlinedInput"
	});
	const { components = {}, fullWidth = false, inputComponent = "input", label, multiline = false, notched, slots = {}, slotProps = {}, type = "text", ...other } = props;
	const classes = useUtilityClasses$3(props);
	const muiFormControl = useFormControl();
	const fcs = formControlState({
		props,
		muiFormControl,
		states: [
			"color",
			"disabled",
			"error",
			"focused",
			"hiddenLabel",
			"size",
			"required"
		]
	});
	const ownerState = {
		...props,
		color: fcs.color || "primary",
		disabled: fcs.disabled,
		error: fcs.error,
		focused: fcs.focused,
		formControl: muiFormControl,
		fullWidth,
		hiddenLabel: fcs.hiddenLabel,
		multiline,
		size: fcs.size,
		type
	};
	const RootSlot = slots.root ?? components.Root ?? OutlinedInputRoot;
	const InputSlot = slots.input ?? components.Input ?? OutlinedInputInput;
	const [NotchedSlot, notchedProps] = useSlot("notchedOutline", {
		elementType: NotchedOutlineRoot,
		className: classes.notchedOutline,
		shouldForwardComponentProp: true,
		ownerState,
		externalForwardedProps: {
			slots,
			slotProps
		},
		additionalProps: { label: label != null && label !== "" && fcs.required ? /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [
			label,
			" ",
			"*"
		] }) : label }
	});
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(InputBase, {
		slots: {
			root: RootSlot,
			input: InputSlot
		},
		slotProps,
		renderSuffix: (state) => /*#__PURE__*/ (0, import_jsx_runtime.jsx)(NotchedSlot, {
			...notchedProps,
			notched: typeof notched !== "undefined" ? notched : Boolean(state.startAdornment || state.filled || state.focused)
		}),
		fullWidth,
		inputComponent,
		multiline,
		ref,
		type,
		...other,
		classes: {
			...classes,
			notchedOutline: null
		}
	});
});
OutlinedInput.muiName = "Input";
function getSelectUtilityClasses(slot) {
	return generateUtilityClass("MuiSelect", slot);
}
var selectClasses = generateUtilityClasses("MuiSelect", [
	"root",
	"select",
	"multiple",
	"filled",
	"outlined",
	"standard",
	"disabled",
	"focused",
	"icon",
	"iconOpen",
	"iconFilled",
	"iconOutlined",
	"iconStandard",
	"nativeInput",
	"error"
]);
var _span;
var SelectSelect = styled$1(StyledSelectSelect, {
	name: "MuiSelect",
	slot: "Select",
	overridesResolver: (props, styles) => {
		const { ownerState } = props;
		return [
			{ [`&.${selectClasses.select}`]: styles.select },
			{ [`&.${selectClasses.select}`]: styles[ownerState.variant] },
			{ [`&.${selectClasses.error}`]: styles.error },
			{ [`&.${selectClasses.multiple}`]: styles.multiple }
		];
	}
})({ [`&.${selectClasses.select}`]: {
	height: "auto",
	minHeight: "1.4375em",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
	overflow: "hidden"
} });
var SelectIcon = styled$1(StyledSelectIcon, {
	name: "MuiSelect",
	slot: "Icon",
	overridesResolver: (props, styles) => {
		const { ownerState } = props;
		return [
			styles.icon,
			ownerState.variant && styles[`icon${capitalize_default(ownerState.variant)}`],
			ownerState.open && styles.iconOpen
		];
	}
})({});
var SelectNativeInput = styled$1("input", {
	shouldForwardProp: (prop) => slotShouldForwardProp(prop) && prop !== "classes",
	name: "MuiSelect",
	slot: "NativeInput"
})({
	bottom: 0,
	left: 0,
	position: "absolute",
	opacity: 0,
	pointerEvents: "none",
	width: "100%",
	boxSizing: "border-box"
});
function areEqualValues(a, b) {
	if (typeof b === "object" && b !== null) return a === b;
	return String(a) === String(b);
}
function isEmpty(display) {
	return display == null || typeof display === "string" && !display.trim();
}
var useUtilityClasses$2 = (ownerState) => {
	const { classes, variant, disabled, multiple, open, error } = ownerState;
	return composeClasses({
		select: [
			"select",
			variant,
			disabled && "disabled",
			multiple && "multiple",
			error && "error"
		],
		icon: [
			"icon",
			`icon${capitalize_default(variant)}`,
			open && "iconOpen",
			disabled && "disabled"
		],
		nativeInput: ["nativeInput"]
	}, getSelectUtilityClasses, classes);
};
/**
* @ignore - internal component.
*/
var SelectInput = /*#__PURE__*/ import_react.forwardRef(function SelectInput(props, ref) {
	const { "aria-describedby": ariaDescribedby, "aria-label": ariaLabel, autoFocus, autoWidth, children, className, defaultOpen, defaultValue, disabled, displayEmpty, error = false, IconComponent, inputRef: inputRefProp, labelId, MenuProps = {}, multiple, name, onBlur, onChange, onClose, onFocus, onOpen, open: openProp, readOnly, renderValue, required, SelectDisplayProps = {}, tabIndex: tabIndexProp, type, value: valueProp, variant = "standard", ...other } = props;
	const [value, setValueState] = useControlled_default({
		controlled: valueProp,
		default: defaultValue,
		name: "Select"
	});
	const [openState, setOpenState] = useControlled_default({
		controlled: openProp,
		default: defaultOpen,
		name: "Select"
	});
	const inputRef = import_react.useRef(null);
	const displayRef = import_react.useRef(null);
	const [displayNode, setDisplayNode] = import_react.useState(null);
	const { current: isOpenControlled } = import_react.useRef(openProp != null);
	const [menuMinWidthState, setMenuMinWidthState] = import_react.useState();
	const handleRef = useForkRef_default(ref, inputRefProp);
	const handleDisplayRef = import_react.useCallback((node) => {
		displayRef.current = node;
		if (node) setDisplayNode(node);
	}, []);
	const anchorElement = displayNode?.parentNode;
	import_react.useImperativeHandle(handleRef, () => ({
		focus: () => {
			displayRef.current.focus();
		},
		node: inputRef.current,
		value
	}), [value]);
	import_react.useEffect(() => {
		if (defaultOpen && openState && displayNode && !isOpenControlled) {
			setMenuMinWidthState(autoWidth ? null : anchorElement.clientWidth);
			displayRef.current.focus();
		}
	}, [displayNode, autoWidth]);
	import_react.useEffect(() => {
		if (autoFocus) displayRef.current.focus();
	}, [autoFocus]);
	import_react.useEffect(() => {
		if (!labelId) return;
		const label = ownerDocument_default(displayRef.current).getElementById(labelId);
		if (label) {
			const handler = () => {
				if (getSelection().isCollapsed) displayRef.current.focus();
			};
			label.addEventListener("click", handler);
			return () => {
				label.removeEventListener("click", handler);
			};
		}
	}, [labelId]);
	const update = (open, event) => {
		if (open) {
			if (onOpen) onOpen(event);
		} else if (onClose) onClose(event);
		if (!isOpenControlled) {
			setMenuMinWidthState(autoWidth ? null : anchorElement.clientWidth);
			setOpenState(open);
		}
	};
	const handleMouseDown = (event) => {
		if (event.button !== 0) return;
		event.preventDefault();
		displayRef.current.focus();
		update(true, event);
	};
	const handleClose = (event) => {
		update(false, event);
	};
	const childrenArray = import_react.Children.toArray(children);
	const handleChange = (event) => {
		const child = childrenArray.find((childItem) => childItem.props.value === event.target.value);
		if (child === void 0) return;
		setValueState(child.props.value);
		if (onChange) onChange(event, child);
	};
	const handleItemClick = (child) => (event) => {
		let newValue;
		if (!event.currentTarget.hasAttribute("tabindex")) return;
		if (multiple) {
			newValue = Array.isArray(value) ? value.slice() : [];
			const itemIndex = value.indexOf(child.props.value);
			if (itemIndex === -1) newValue.push(child.props.value);
			else newValue.splice(itemIndex, 1);
		} else newValue = child.props.value;
		if (child.props.onClick) child.props.onClick(event);
		if (value !== newValue) {
			setValueState(newValue);
			if (onChange) {
				const nativeEvent = event.nativeEvent || event;
				const clonedEvent = new nativeEvent.constructor(nativeEvent.type, nativeEvent);
				Object.defineProperty(clonedEvent, "target", {
					writable: true,
					value: {
						value: newValue,
						name
					}
				});
				onChange(clonedEvent, child);
			}
		}
		if (!multiple) update(false, event);
	};
	const handleKeyDown = (event) => {
		if (!readOnly) {
			if ([
				" ",
				"ArrowUp",
				"ArrowDown",
				"Enter"
			].includes(event.key)) {
				event.preventDefault();
				update(true, event);
			}
		}
	};
	const open = displayNode !== null && openState;
	const handleBlur = (event) => {
		if (!open && onBlur) {
			Object.defineProperty(event, "target", {
				writable: true,
				value: {
					value,
					name
				}
			});
			onBlur(event);
		}
	};
	delete other["aria-invalid"];
	let display;
	let displaySingle;
	const displayMultiple = [];
	let computeDisplay = false;
	if (isFilled({ value }) || displayEmpty) if (renderValue) display = renderValue(value);
	else computeDisplay = true;
	const items = childrenArray.map((child) => {
		if (!/*#__PURE__*/ import_react.isValidElement(child)) return null;
		let selected;
		if (multiple) {
			if (!Array.isArray(value)) throw new Error(formatMuiErrorMessage(2));
			selected = value.some((v) => areEqualValues(v, child.props.value));
			if (selected && computeDisplay) displayMultiple.push(child.props.children);
		} else {
			selected = areEqualValues(value, child.props.value);
			if (selected && computeDisplay) displaySingle = child.props.children;
		}
		if (selected);
		return /*#__PURE__*/ import_react.cloneElement(child, {
			"aria-selected": selected ? "true" : "false",
			onClick: handleItemClick(child),
			onKeyUp: (event) => {
				if (event.key === " ") event.preventDefault();
				if (child.props.onKeyUp) child.props.onKeyUp(event);
			},
			role: "option",
			selected,
			value: void 0,
			"data-value": child.props.value
		});
	});
	if (computeDisplay) if (multiple) if (displayMultiple.length === 0) display = null;
	else display = displayMultiple.reduce((output, child, index) => {
		output.push(child);
		if (index < displayMultiple.length - 1) output.push(", ");
		return output;
	}, []);
	else display = displaySingle;
	let menuMinWidth = menuMinWidthState;
	if (!autoWidth && isOpenControlled && displayNode) menuMinWidth = anchorElement.clientWidth;
	let tabIndex;
	if (typeof tabIndexProp !== "undefined") tabIndex = tabIndexProp;
	else tabIndex = disabled ? null : 0;
	const buttonId = SelectDisplayProps.id || (name ? `mui-component-select-${name}` : void 0);
	const ownerState = {
		...props,
		variant,
		value,
		open,
		error
	};
	const classes = useUtilityClasses$2(ownerState);
	const paperProps = {
		...MenuProps.PaperProps,
		...typeof MenuProps.slotProps?.paper === "function" ? MenuProps.slotProps.paper(ownerState) : MenuProps.slotProps?.paper
	};
	const listProps = {
		...MenuProps.MenuListProps,
		...typeof MenuProps.slotProps?.list === "function" ? MenuProps.slotProps.list(ownerState) : MenuProps.slotProps?.list
	};
	const listboxId = useId();
	return /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [
		/*#__PURE__*/ (0, import_jsx_runtime.jsx)(SelectSelect, {
			as: "div",
			ref: handleDisplayRef,
			tabIndex,
			role: "combobox",
			"aria-controls": open ? listboxId : void 0,
			"aria-disabled": disabled ? "true" : void 0,
			"aria-expanded": open ? "true" : "false",
			"aria-haspopup": "listbox",
			"aria-label": ariaLabel,
			"aria-labelledby": [labelId, buttonId].filter(Boolean).join(" ") || void 0,
			"aria-describedby": ariaDescribedby,
			"aria-required": required ? "true" : void 0,
			"aria-invalid": error ? "true" : void 0,
			onKeyDown: handleKeyDown,
			onMouseDown: disabled || readOnly ? null : handleMouseDown,
			onBlur: handleBlur,
			onFocus,
			...SelectDisplayProps,
			ownerState,
			className: clsx(SelectDisplayProps.className, classes.select, className),
			id: buttonId,
			children: isEmpty(display) ? _span || (_span = /*#__PURE__*/ (0, import_jsx_runtime.jsx)("span", {
				className: "notranslate",
				"aria-hidden": true,
				children: "​"
			})) : display
		}),
		/*#__PURE__*/ (0, import_jsx_runtime.jsx)(SelectNativeInput, {
			"aria-invalid": error,
			value: Array.isArray(value) ? value.join(",") : value,
			name,
			ref: inputRef,
			"aria-hidden": true,
			onChange: handleChange,
			tabIndex: -1,
			disabled,
			className: classes.nativeInput,
			autoFocus,
			required,
			...other,
			ownerState
		}),
		/*#__PURE__*/ (0, import_jsx_runtime.jsx)(SelectIcon, {
			as: IconComponent,
			className: classes.icon,
			ownerState
		}),
		/*#__PURE__*/ (0, import_jsx_runtime.jsx)(Menu, {
			id: `menu-${name || ""}`,
			anchorEl: anchorElement,
			open,
			onClose: handleClose,
			anchorOrigin: {
				vertical: "bottom",
				horizontal: "center"
			},
			transformOrigin: {
				vertical: "top",
				horizontal: "center"
			},
			...MenuProps,
			slotProps: {
				...MenuProps.slotProps,
				list: {
					"aria-labelledby": labelId,
					role: "listbox",
					"aria-multiselectable": multiple ? "true" : void 0,
					disableListWrap: true,
					id: listboxId,
					...listProps
				},
				paper: {
					...paperProps,
					style: {
						minWidth: menuMinWidth,
						...paperProps != null ? paperProps.style : null
					}
				}
			},
			children: items
		})
	] });
});
var useUtilityClasses$1 = (ownerState) => {
	const { classes } = ownerState;
	const composedClasses = composeClasses({ root: ["root"] }, getSelectUtilityClasses, classes);
	return {
		...classes,
		...composedClasses
	};
};
var styledRootConfig = {
	name: "MuiSelect",
	slot: "Root",
	shouldForwardProp: (prop) => rootShouldForwardProp(prop) && prop !== "variant"
};
var StyledInput = styled$1(Input, styledRootConfig)("");
var StyledOutlinedInput = styled$1(OutlinedInput, styledRootConfig)("");
var StyledFilledInput = styled$1(FilledInput, styledRootConfig)("");
var Select = /*#__PURE__*/ import_react.forwardRef(function Select(inProps, ref) {
	const props = useDefaultProps$1({
		name: "MuiSelect",
		props: inProps
	});
	const { autoWidth = false, children, classes: classesProp = {}, className, defaultOpen = false, displayEmpty = false, IconComponent = ArrowDropDown_default, id, input, inputProps, label, labelId, MenuProps, multiple = false, native = false, onClose, onOpen, open, renderValue, SelectDisplayProps, variant: variantProp = "outlined", ...other } = props;
	const inputComponent = native ? NativeSelectInput : SelectInput;
	const fcs = formControlState({
		props,
		muiFormControl: useFormControl(),
		states: ["variant", "error"]
	});
	const variant = fcs.variant || variantProp;
	const ownerState = {
		...props,
		variant,
		classes: classesProp
	};
	const classes = useUtilityClasses$1(ownerState);
	const { root, ...restOfClasses } = classes;
	const InputComponent = input || {
		standard: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(StyledInput, { ownerState }),
		outlined: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(StyledOutlinedInput, {
			label,
			ownerState
		}),
		filled: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(StyledFilledInput, { ownerState })
	}[variant];
	const inputComponentRef = useForkRef_default(ref, getReactElementRef(InputComponent));
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(import_react.Fragment, { children: /*#__PURE__*/ import_react.cloneElement(InputComponent, {
		inputComponent,
		inputProps: {
			children,
			error: fcs.error,
			IconComponent,
			variant,
			type: void 0,
			multiple,
			...native ? { id } : {
				autoWidth,
				defaultOpen,
				displayEmpty,
				labelId,
				MenuProps,
				onClose,
				onOpen,
				open,
				renderValue,
				SelectDisplayProps: {
					id,
					...SelectDisplayProps
				}
			},
			...inputProps,
			classes: inputProps ? deepmerge(restOfClasses, inputProps.classes) : restOfClasses,
			...input ? input.props.inputProps : {}
		},
		...(multiple && native || displayEmpty) && variant === "outlined" ? { notched: true } : {},
		ref: inputComponentRef,
		className: clsx(InputComponent.props.className, className, classes.root),
		...!input && { variant },
		...other
	}) });
});
Select.muiName = "Select";
var Stack = createStack({
	createStyledComponent: styled$1("div", {
		name: "MuiStack",
		slot: "Root"
	}),
	useThemeProps: (inProps) => useDefaultProps$1({
		props: inProps,
		name: "MuiStack"
	})
});
function getTextFieldUtilityClass(slot) {
	return generateUtilityClass("MuiTextField", slot);
}
generateUtilityClasses("MuiTextField", ["root"]);
var variantComponent = {
	standard: Input,
	filled: FilledInput,
	outlined: OutlinedInput
};
var useUtilityClasses = (ownerState) => {
	const { classes } = ownerState;
	return composeClasses({ root: ["root"] }, getTextFieldUtilityClass, classes);
};
var TextFieldRoot = styled$1(FormControl, {
	name: "MuiTextField",
	slot: "Root"
})({});
/**
* The `TextField` is a convenience wrapper for the most common cases (80%).
* It cannot be all things to all people, otherwise the API would grow out of control.
*
* ## Advanced Configuration
*
* It's important to understand that the text field is a simple abstraction
* on top of the following components:
*
* - [FormControl](/material-ui/api/form-control/)
* - [InputLabel](/material-ui/api/input-label/)
* - [FilledInput](/material-ui/api/filled-input/)
* - [OutlinedInput](/material-ui/api/outlined-input/)
* - [Input](/material-ui/api/input/)
* - [FormHelperText](/material-ui/api/form-helper-text/)
*
* If you wish to alter the props applied to the `input` element, you can do so as follows:
*
* ```jsx
* const inputProps = {
*   step: 300,
* };
*
* return <TextField id="time" type="time" inputProps={inputProps} />;
* ```
*
* For advanced cases, please look at the source of TextField by clicking on the
* "Edit this page" button above. Consider either:
*
* - using the upper case props for passing values directly to the components
* - using the underlying components directly as shown in the demos
*/
var TextField = /*#__PURE__*/ import_react.forwardRef(function TextField(inProps, ref) {
	const props = useDefaultProps$1({
		props: inProps,
		name: "MuiTextField"
	});
	const { autoComplete, autoFocus = false, children, className, color = "primary", defaultValue, disabled = false, error = false, FormHelperTextProps: FormHelperTextPropsProp, fullWidth = false, helperText, id: idOverride, InputLabelProps: InputLabelPropsProp, inputProps: inputPropsProp, InputProps: InputPropsProp, inputRef, label, maxRows, minRows, multiline = false, name, onBlur, onChange, onFocus, placeholder, required = false, rows, select = false, SelectProps: SelectPropsProp, slots = {}, slotProps = {}, type, value, variant = "outlined", ...other } = props;
	const ownerState = {
		...props,
		autoFocus,
		color,
		disabled,
		error,
		fullWidth,
		multiline,
		required,
		select,
		variant
	};
	const classes = useUtilityClasses(ownerState);
	const id = useId(idOverride);
	const helperTextId = helperText && id ? `${id}-helper-text` : void 0;
	const inputLabelId = label && id ? `${id}-label` : void 0;
	const InputComponent = variantComponent[variant];
	const externalForwardedProps = {
		slots,
		slotProps: {
			input: InputPropsProp,
			inputLabel: InputLabelPropsProp,
			htmlInput: inputPropsProp,
			formHelperText: FormHelperTextPropsProp,
			select: SelectPropsProp,
			...slotProps
		}
	};
	const inputAdditionalProps = {};
	const inputLabelSlotProps = externalForwardedProps.slotProps.inputLabel;
	if (variant === "outlined") {
		if (inputLabelSlotProps && typeof inputLabelSlotProps.shrink !== "undefined") inputAdditionalProps.notched = inputLabelSlotProps.shrink;
		inputAdditionalProps.label = label;
	}
	if (select) {
		if (!SelectPropsProp || !SelectPropsProp.native) inputAdditionalProps.id = void 0;
		inputAdditionalProps["aria-describedby"] = void 0;
	}
	const [RootSlot, rootProps] = useSlot("root", {
		elementType: TextFieldRoot,
		shouldForwardComponentProp: true,
		externalForwardedProps: {
			...externalForwardedProps,
			...other
		},
		ownerState,
		className: clsx(classes.root, className),
		ref,
		additionalProps: {
			disabled,
			error,
			fullWidth,
			required,
			color,
			variant
		}
	});
	const [InputSlot, inputProps] = useSlot("input", {
		elementType: InputComponent,
		externalForwardedProps,
		additionalProps: inputAdditionalProps,
		ownerState
	});
	const [InputLabelSlot, inputLabelProps] = useSlot("inputLabel", {
		elementType: InputLabel,
		externalForwardedProps,
		ownerState
	});
	const [HtmlInputSlot, htmlInputProps] = useSlot("htmlInput", {
		elementType: "input",
		externalForwardedProps,
		ownerState
	});
	const [FormHelperTextSlot, formHelperTextProps] = useSlot("formHelperText", {
		elementType: FormHelperText,
		externalForwardedProps,
		ownerState
	});
	const [SelectSlot, selectProps] = useSlot("select", {
		elementType: Select,
		externalForwardedProps,
		ownerState
	});
	const InputElement = /*#__PURE__*/ (0, import_jsx_runtime.jsx)(InputSlot, {
		"aria-describedby": helperTextId,
		autoComplete,
		autoFocus,
		defaultValue,
		fullWidth,
		multiline,
		name,
		rows,
		maxRows,
		minRows,
		type,
		value,
		id,
		inputRef,
		onBlur,
		onChange,
		onFocus,
		placeholder,
		inputProps: htmlInputProps,
		slots: { input: slots.htmlInput ? HtmlInputSlot : void 0 },
		...inputProps
	});
	return /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(RootSlot, {
		...rootProps,
		children: [
			label != null && label !== "" && /*#__PURE__*/ (0, import_jsx_runtime.jsx)(InputLabelSlot, {
				htmlFor: id,
				id: inputLabelId,
				...inputLabelProps,
				children: label
			}),
			select ? /*#__PURE__*/ (0, import_jsx_runtime.jsx)(SelectSlot, {
				"aria-describedby": helperTextId,
				id,
				labelId: inputLabelId,
				value,
				input: InputElement,
				...selectProps,
				children
			}) : InputElement,
			helperText && /*#__PURE__*/ (0, import_jsx_runtime.jsx)(FormHelperTextSlot, {
				id: helperTextId,
				...formHelperTextProps,
				children: helperText
			})
		]
	});
});
//#endregion
export { selectClasses as $, createSvgIcon as A, globalCss as B, Select as C, Typography as D, TextField as E, dist_exports as F, isMuiElement_default as G, identifier_default as H, duration as I, outlinedInputClasses as J, memoTheme as K, filledInputClasses as L, createThemeWithVars as M, createTypography as N, capitalize_default as O, debounce_default as P, rootShouldForwardProp as Q, formControlState as R, Portal as S, Stack as T, inputBaseClasses as U, iconButtonClasses as V, inputClasses as W, ownerWindow_default as X, ownerDocument_default as Y, reflow as Z, Menu as _, ButtonBase as a, useEventCallback_default as at, Paper as b, FocusTrap as c, useId_default as ct, Grow as d, useTheme$1 as dt, styled$1 as et, IconButton as f, __exportAll as ft, ListContext as g, List as h, Button as i, useEnhancedEffect_default as it, createTheme as j, createSimplePaletteValueFilter as k, FormControl as l, useSettings as lt, InputLabel as m, ArrowDropDown_default as n, useControlled_default as nt, CircularProgress as o, useForkRef_default as ot, InputBase as p, __reExport as pt, mergeSlotProps$1 as q, Box as r, useDefaultProps$1 as rt, Close_default as s, useFormControl as st, Alert as t, typographyClasses as tt, FormControlContext as u, useSlot as ut, MenuList as v, SettingsProvider as w, Popover as x, Modal as y, getTransitionProps as z };
