import { a as __toESM } from "../__23tanstack-start-server-fn-resolver-BaOM1vmh.mjs";
import { b as Paper, et as styled$1, rt as useDefaultProps$1 } from "./TextField-DKN6VuT-.mjs";
import { o as require_react } from "../_libs/@emotion/react+[...].mjs";
import { i as require_jsx_runtime } from "../_libs/@mui/private-theming+[...].mjs";
import { F as generateUtilityClasses, I as composeClasses, z as generateUtilityClass } from "../_libs/mui__utils+react-is.mjs";
import { O as clsx } from "../_libs/@mui/system+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/CardContent-5Q2s-Lng.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function getCardUtilityClass(slot) {
	return generateUtilityClass("MuiCard", slot);
}
generateUtilityClasses("MuiCard", ["root"]);
var useUtilityClasses$1 = (ownerState) => {
	const { classes } = ownerState;
	return composeClasses({ root: ["root"] }, getCardUtilityClass, classes);
};
var CardRoot = styled$1(Paper, {
	name: "MuiCard",
	slot: "Root"
})({ overflow: "hidden" });
var Card = /*#__PURE__*/ import_react.forwardRef(function Card(inProps, ref) {
	const props = useDefaultProps$1({
		props: inProps,
		name: "MuiCard"
	});
	const { className, raised = false, ...other } = props;
	const ownerState = {
		...props,
		raised
	};
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(CardRoot, {
		className: clsx(useUtilityClasses$1(ownerState).root, className),
		elevation: raised ? 8 : void 0,
		ref,
		ownerState,
		...other
	});
});
function getCardContentUtilityClass(slot) {
	return generateUtilityClass("MuiCardContent", slot);
}
generateUtilityClasses("MuiCardContent", ["root"]);
var useUtilityClasses = (ownerState) => {
	const { classes } = ownerState;
	return composeClasses({ root: ["root"] }, getCardContentUtilityClass, classes);
};
var CardContentRoot = styled$1("div", {
	name: "MuiCardContent",
	slot: "Root"
})({
	padding: 16,
	"&:last-child": { paddingBottom: 24 }
});
var CardContent = /*#__PURE__*/ import_react.forwardRef(function CardContent(inProps, ref) {
	const props = useDefaultProps$1({
		props: inProps,
		name: "MuiCardContent"
	});
	const { className, component = "div", ...other } = props;
	const ownerState = {
		...props,
		component
	};
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(CardContentRoot, {
		as: component,
		className: clsx(useUtilityClasses(ownerState).root, className),
		ownerState,
		ref,
		...other
	});
});
//#endregion
export { CardContent as n, Card as t };
