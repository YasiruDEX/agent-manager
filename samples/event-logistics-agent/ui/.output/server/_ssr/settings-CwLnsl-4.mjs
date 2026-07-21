import { a as __toESM } from "../__23tanstack-start-server-fn-resolver-BaOM1vmh.mjs";
import { D as Typography, E as TextField, F as dist_exports, O as capitalize_default, T as Stack, et as styled$1, i as Button, lt as useSettings, r as Box, rt as useDefaultProps$1, t as Alert } from "./TextField-DKN6VuT-.mjs";
import { o as require_react } from "../_libs/@emotion/react+[...].mjs";
import { i as require_jsx_runtime } from "../_libs/@mui/private-theming+[...].mjs";
import { r as createContainer } from "../_libs/@mui/system+[...].mjs";
import { n as CardContent, t as Card } from "./CardContent-5Q2s-Lng.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-CwLnsl-4.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Container = createContainer({
	createStyledComponent: styled$1("div", {
		name: "MuiContainer",
		slot: "Root",
		overridesResolver: (props, styles) => {
			const { ownerState } = props;
			return [
				styles.root,
				styles[`maxWidth${capitalize_default(String(ownerState.maxWidth))}`],
				ownerState.fixed && styles.fixed,
				ownerState.disableGutters && styles.disableGutters
			];
		}
	}),
	useThemeProps: (inProps) => useDefaultProps$1({
		props: inProps,
		name: "MuiContainer"
	})
});
function SettingsPage() {
	const { apiUrl, apiKey, apiHeader, updateSettings, reset, defaults } = useSettings();
	const [url, setUrl] = (0, import_react.useState)(apiUrl);
	const [key, setKey] = (0, import_react.useState)(apiKey);
	const [header, setHeader] = (0, import_react.useState)(apiHeader);
	const [saved, setSaved] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [saving, setSaving] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setUrl(apiUrl);
		setKey(apiKey);
		setHeader(apiHeader);
	}, [
		apiUrl,
		apiKey,
		apiHeader
	]);
	async function save(e) {
		e.preventDefault();
		setSaving(true);
		setError(null);
		const nextSettings = {
			apiUrl: url.trim() || defaults.apiUrl,
			apiKey: key.trim(),
			apiHeader: header.trim() || defaults.apiHeader
		};
		try {
			const response = await fetch("/api/settings", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(nextSettings)
			});
			if (!response.ok) throw new Error(await response.text());
			const savedSettings = (await response.json()).settings ?? nextSettings;
			updateSettings(savedSettings);
			setUrl(savedSettings.apiUrl);
			setKey(savedSettings.apiKey);
			setHeader(savedSettings.apiHeader);
			setSaved(true);
			setTimeout(() => setSaved(false), 1500);
		} catch (saveError) {
			setError(saveError instanceof Error ? saveError.message : "Failed to save settings");
		} finally {
			setSaving(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, {
		sx: {
			height: "100%",
			overflowY: "auto",
			py: 4
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Container, {
			maxWidth: "md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
					variant: "h4",
					component: "h1",
					fontWeight: "bold",
					gutterBottom: true,
					children: "Settings"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
					variant: "body2",
					color: "text.secondary",
					sx: { mb: 4 },
					children: "Override the agent endpoint, API key, and request header name. Values are saved to the local .env file and take precedence over any runtime defaults."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
					onSubmit: save,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						variant: "outlined",
						sx: {
							mb: 4,
							borderRadius: 2
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
							sx: { p: 4 },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stack, {
								spacing: 3,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
										label: "Agent URL",
										helperText: `Default: ${defaults.apiUrl}`,
										id: "api-url",
										value: url,
										onChange: (e) => setUrl(e.target.value),
										placeholder: "https://your-agent.example.com/v1/chat",
										fullWidth: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
										label: "API Key",
										helperText: "Sent using the request header name below. If the header is Authorization, it becomes 'Bearer <key>'.",
										id: "api-key",
										value: key,
										onChange: (e) => setKey(e.target.value),
										placeholder: "sk-...",
										type: "password",
										fullWidth: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
										label: "Request Header Name",
										helperText: `Default: ${defaults.apiHeader}. Common values: Authorization, X-API-Key.`,
										id: "api-header",
										value: header,
										onChange: (e) => setHeader(e.target.value),
										placeholder: "X-API-Key",
										fullWidth: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
										sx: {
											p: 2,
											borderRadius: 1,
											bgcolor: "action.hover",
											border: "1px solid",
											borderColor: "divider"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
											variant: "subtitle2",
											fontWeight: "bold",
											gutterBottom: true,
											children: "Outgoing request header preview"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Typography, {
											variant: "caption",
											fontFamily: "monospace",
											children: [
												header.trim() || defaults.apiHeader || "Authorization",
												":",
												" ",
												key.trim() ? header.trim().toLowerCase() === "authorization" ? `Bearer ${key.trim()}` : key.trim() : "(enter an API key)"
											]
										})]
									}),
									error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Alert, {
										severity: "error",
										children: error
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stack, {
										direction: "row",
										spacing: 2,
										alignItems: "center",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											type: "submit",
											variant: "contained",
											disabled: saving,
											startIcon: saved ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(dist_exports.Check, {}) : null,
											sx: {
												background: "linear-gradient(90deg, #ff5e3a 0%, #ff2a6d 100%)",
												color: "white",
												"&:disabled": { opacity: .7 }
											},
											children: saving ? "Saving..." : saved ? "Saved" : "Save changes"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											type: "button",
											variant: "outlined",
											color: "secondary",
											disabled: saving,
											startIcon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(dist_exports.RotateCcw, {}),
											onClick: async () => {
												setSaving(true);
												setError(null);
												try {
													const response = await fetch("/api/settings", { method: "DELETE" });
													if (!response.ok) throw new Error(await response.text());
													const resetSettings = (await response.json()).settings ?? {
														apiUrl: defaults.apiUrl,
														apiKey: defaults.apiKey,
														apiHeader: defaults.apiHeader
													};
													reset();
													updateSettings(resetSettings);
													setUrl(resetSettings.apiUrl);
													setKey(resetSettings.apiKey);
													setHeader(resetSettings.apiHeader);
													setSaved(false);
												} catch (resetError) {
													setError(resetError instanceof Error ? resetError.message : "Failed to reset settings");
												} finally {
													setSaving(false);
												}
											},
											children: "Reset to defaults"
										})]
									})
								]
							})
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					variant: "outlined",
					sx: {
						borderRadius: 2,
						bgcolor: "action.hover"
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						sx: { p: 3 },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
							variant: "subtitle2",
							fontWeight: "bold",
							gutterBottom: true,
							children: "Local .env values"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Typography, {
							variant: "body2",
							component: "div",
							fontFamily: "monospace",
							color: "text.secondary",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["AGENT_URL = ", defaults.apiUrl || "(unset)"] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["AGENT_API_KEY = ", defaults.apiKey ? "••••••" : "(unset)"] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["AGENT_API_HEADER = ", defaults.apiHeader || "(unset)"] })
							]
						})]
					})
				})
			]
		})
	});
}
//#endregion
export { SettingsPage as component };
