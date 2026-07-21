import { a as __toESM } from "../__23tanstack-start-server-fn-resolver-BaOM1vmh.mjs";
import { D as Typography, E as TextField, F as dist_exports, T as Stack, b as Paper, f as IconButton, i as Button, lt as useSettings, r as Box, t as Alert } from "./TextField-DKN6VuT-.mjs";
import { o as require_react } from "../_libs/@emotion/react+[...].mjs";
import { i as require_jsx_runtime } from "../_libs/@mui/private-theming+[...].mjs";
import { t as Avatar } from "./Avatar-BGS3oTFu.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-C0VKld3x.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SESSION_ID_STORAGE_KEY = "agent-sample-tester:session-id";
async function sendChat({ messages, signal }) {
	const headers = { "Content-Type": "application/json" };
	const body = {
		session_id: getSessionId(),
		messages
	};
	const res = await fetch("/api/chat", {
		method: "POST",
		headers,
		body: JSON.stringify(body),
		signal
	});
	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`Request failed (${res.status}): ${text || res.statusText}`);
	}
	if ((res.headers.get("content-type") ?? "").includes("application/json")) return extractText(await res.json());
	return await res.text();
}
function getSessionId() {
	if (typeof window === "undefined") return "session";
	try {
		const existing = window.localStorage.getItem(SESSION_ID_STORAGE_KEY);
		if (existing) return existing;
		const next = crypto.randomUUID();
		window.localStorage.setItem(SESSION_ID_STORAGE_KEY, next);
		return next;
	} catch {
		return crypto.randomUUID();
	}
}
function extractText(data) {
	if (typeof data === "string") return data;
	if (!data || typeof data !== "object") return "";
	const obj = data;
	if (typeof obj.text === "string") return obj.text;
	if (typeof obj.response === "string") return obj.response;
	if (typeof obj.content === "string") return obj.content;
	if (typeof obj.message === "string") return obj.message;
	if (typeof obj.output === "string") return obj.output;
	if (typeof obj.result === "string") return obj.result;
	if (Array.isArray(obj.choices) && obj.choices.length > 0) {
		const first = obj.choices[0];
		const msg = first.message;
		if (msg && typeof msg.content === "string") return msg.content;
		if (typeof first.text === "string") return first.text;
	}
	return JSON.stringify(data);
}
var CHAT_MESSAGES_STORAGE_KEY = "agent-sample-tester:chat-messages";
function loadMessagesFromStorage() {
	if (typeof window === "undefined") return [];
	try {
		const raw = window.localStorage.getItem(CHAT_MESSAGES_STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed.filter(isChatMessage);
	} catch {
		return [];
	}
}
function isChatMessage(value) {
	if (!value || typeof value !== "object") return false;
	const message = value;
	return (message.role === "user" || message.role === "assistant" || message.role === "system") && typeof message.content === "string";
}
function ChatPage() {
	const { apiUrl, apiKey, apiHeader } = useSettings();
	const [messages, setMessages] = (0, import_react.useState)([]);
	const [isLoaded, setIsLoaded] = (0, import_react.useState)(false);
	const [input, setInput] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const scrollRef = (0, import_react.useRef)(null);
	const inputRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		setMessages(loadMessagesFromStorage());
		setIsLoaded(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!isLoaded) return;
		try {
			window.localStorage.setItem(CHAT_MESSAGES_STORAGE_KEY, JSON.stringify(messages));
		} catch {}
	}, [messages, isLoaded]);
	(0, import_react.useEffect)(() => {
		scrollRef.current?.scrollTo({
			top: scrollRef.current.scrollHeight,
			behavior: "smooth"
		});
	}, [messages, loading]);
	(0, import_react.useEffect)(() => {
		inputRef.current?.focus();
	}, []);
	async function submit() {
		const text = input.trim();
		if (!text || loading) return;
		setError(null);
		const next = [...messages, {
			role: "user",
			content: text
		}];
		setMessages(next);
		setInput("");
		setLoading(true);
		try {
			const reply = await sendChat({
				apiUrl,
				apiKey,
				apiHeader,
				messages: next
			});
			setMessages((m) => [...m, {
				role: "assistant",
				content: reply || "(empty response)"
			}]);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Something went wrong");
		} finally {
			setLoading(false);
			requestAnimationFrame(() => inputRef.current?.focus());
		}
	}
	function onKeyDown(e) {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			submit();
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
		sx: {
			display: "flex",
			flexDirection: "col",
			height: "100%",
			position: "relative"
		},
		className: "flex flex-col",
		children: [
			messages.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
				sx: {
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					px: {
						xs: 2,
						md: 3
					},
					py: 1,
					borderBottom: "1px solid",
					borderColor: "divider",
					bgcolor: "background.paper",
					zIndex: 10
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Typography, {
					variant: "caption",
					color: "text.secondary",
					children: [
						messages.length,
						" message",
						messages.length === 1 ? "" : "s"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "small",
					color: "error",
					variant: "outlined",
					startIcon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(dist_exports.Trash2, { size: 16 }),
					onClick: () => setMessages([]),
					children: "Clear Chat"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, {
				ref: scrollRef,
				sx: {
					flex: 1,
					overflowY: "auto",
					p: {
						xs: 2,
						md: 3
					},
					minHeight: 0
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stack, {
					spacing: 3,
					sx: {
						maxWidth: "48rem",
						mx: "auto",
						width: "100%",
						py: 2
					},
					children: [
						messages.length === 0 && !loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {}),
						messages.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageBubble, { message: m }, i)),
						loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TypingIndicator, {}),
						error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Alert, {
							severity: "error",
							children: error
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, {
				sx: {
					borderTop: "1px solid",
					borderColor: "divider",
					bgcolor: "background.paper",
					p: {
						xs: 2,
						md: 3
					}
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
					sx: {
						maxWidth: "48rem",
						mx: "auto",
						width: "100%"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stack, {
						direction: "row",
						spacing: 2,
						alignItems: "flex-end",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
							inputRef,
							value: input,
							onChange: (e) => setInput(e.target.value),
							onKeyDown,
							placeholder: "Message your agent…",
							multiline: true,
							maxRows: 5,
							fullWidth: true,
							variant: "outlined",
							size: "small",
							disabled: loading,
							sx: { "& .MuiOutlinedInput-root": { borderRadius: 3 } }
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
							onClick: submit,
							disabled: loading || !input.trim(),
							sx: {
								bgcolor: "primary.main",
								color: "primary.contrastText",
								"&:hover": { bgcolor: "primary.dark" },
								"&:disabled": {
									bgcolor: "action.disabledBackground",
									color: "action.disabled"
								},
								width: 40,
								height: 40
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(dist_exports.Send, { size: 18 })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Typography, {
						variant: "caption",
						color: "text.secondary",
						sx: {
							display: "block",
							textAlign: "center",
							mt: 1.5
						},
						children: ["Endpoint: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: { fontFamily: "monospace" },
							children: apiUrl
						})]
					})]
				})
			})
		]
	});
}
function EmptyState() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
		sx: {
			display: "flex",
			flexDirection: "column",
			alignItems: "center",
			textAlign: "center",
			mt: 8,
			mx: "auto",
			maxWidth: "28rem"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
				sx: {
					width: 56,
					height: 56,
					mb: 2.5,
					bgcolor: "primary.main",
					color: "primary.contrastText",
					boxShadow: "0 0 24px -6px rgba(255,94,58,0.5)"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(dist_exports.Sparkles, { size: 28 })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
				variant: "h5",
				component: "h2",
				fontWeight: "bold",
				gutterBottom: true,
				children: "How can I help today?"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Typography, {
				variant: "body2",
				color: "text.secondary",
				children: [
					"Start a conversation with your agent. Configure the endpoint and API key from",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
						component: "span",
						variant: "body2",
						fontWeight: "medium",
						color: "text.primary",
						children: "Settings"
					}),
					"."
				]
			})
		]
	});
}
function MessageBubble({ message }) {
	const isUser = message.role === "user";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stack, {
		direction: isUser ? "row-reverse" : "row",
		spacing: 2,
		sx: { width: "100%" },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
			sx: {
				width: 36,
				height: 36,
				bgcolor: isUser ? "secondary.main" : "primary.main",
				color: "white"
			},
			children: isUser ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(dist_exports.User, { size: 18 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(dist_exports.Sparkles, { size: 18 })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paper, {
			elevation: 0,
			sx: {
				p: 2,
				maxWidth: "80%",
				borderRadius: 3,
				bgcolor: isUser ? "primary.light" : "action.hover",
				color: isUser ? "primary.contrastText" : "text.primary",
				border: "1px solid",
				borderColor: isUser ? "primary.main" : "divider",
				wordBreak: "break-word"
			},
			children: message.role === "assistant" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarkdownText, { value: message.content }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlainText, { value: message.content })
		})]
	});
}
function PlainText({ value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		style: {
			whiteSpace: "pre-wrap",
			wordBreak: "break-word"
		},
		children: value
	});
}
function MarkdownText({ value }) {
	const blocks = parseMarkdownBlocks(value);
	if (blocks.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlainText, { value });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stack, {
		spacing: 1.5,
		sx: {
			whiteSpace: "normal",
			wordBreak: "break-word"
		},
		children: blocks.map((block, index) => {
			if (block.type === "list") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				style: {
					paddingLeft: "1.25rem",
					margin: 0
				},
				children: block.items.map((item, itemIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					style: { marginBottom: "0.25rem" },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InlineMarkdown, { value: item })
				}, itemIndex))
			}, index);
			if (block.type === "quote") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, {
				component: "blockquote",
				sx: {
					borderLeft: "2px solid",
					borderColor: "divider",
					pl: 1.5,
					m: 0,
					color: "text.secondary"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InlineMarkdown, { value: block.text })
			}, index);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
				variant: "body2",
				sx: { lineHeight: 1.6 },
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InlineMarkdown, { value: block.text })
			}, index);
		})
	});
}
function InlineMarkdown({ value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: parseInlineSegments(value).map((segment, index) => {
		if (segment.type === "link") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
			href: segment.href,
			target: "_blank",
			rel: "noreferrer",
			style: {
				color: "inherit",
				textDecoration: "underline",
				fontWeight: 500
			},
			children: segment.text
		}, index);
		if (segment.type === "strong") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
			component: "strong",
			variant: "body2",
			fontWeight: "bold",
			children: segment.text
		}, index);
		if (segment.type === "code") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
			style: {
				backgroundColor: "rgba(0, 0, 0, 0.05)",
				padding: "2px 6px",
				borderRadius: "4px",
				fontFamily: "monospace",
				fontSize: "0.9em"
			},
			children: segment.text
		}, index);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: segment.text }, index);
	}) });
}
function parseMarkdownBlocks(value) {
	const normalized = value.replace(/\r\n/g, "\n").trim();
	if (!normalized) return [];
	return normalized.split(/\n\s*\n/).map((rawBlock) => {
		const lines = rawBlock.split("\n").map((line) => line.trimEnd());
		const listItems = lines.map((line) => line.match(/^\s*\d+\.\s+(.*)$/)?.[1]?.trim()).filter((item) => Boolean(item));
		if (listItems.length > 0 && listItems.length === lines.length) return {
			type: "list",
			items: listItems
		};
		if (lines.length === 1 && lines[0].startsWith("> ")) return {
			type: "quote",
			text: lines[0].slice(2).trim()
		};
		return {
			type: "paragraph",
			text: lines.join(" ").trim()
		};
	});
}
function parseInlineSegments(value) {
	const segments = [];
	const pattern = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|`([^`]+)`/g;
	let lastIndex = 0;
	for (const match of value.matchAll(pattern)) {
		const index = match.index ?? 0;
		if (index > lastIndex) segments.push({
			type: "text",
			text: value.slice(lastIndex, index)
		});
		if (match[1] && match[2]) segments.push({
			type: "link",
			text: match[1],
			href: match[2]
		});
		else if (match[3]) segments.push({
			type: "strong",
			text: match[3]
		});
		else if (match[4]) segments.push({
			type: "code",
			text: match[4]
		});
		lastIndex = index + match[0].length;
	}
	if (lastIndex < value.length) segments.push({
		type: "text",
		text: value.slice(lastIndex)
	});
	return segments.length > 0 ? segments : [{
		type: "text",
		text: value
	}];
}
function TypingIndicator() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stack, {
		direction: "row",
		spacing: 2,
		sx: { width: "100%" },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
			sx: {
				width: 36,
				height: 36,
				bgcolor: "primary.main",
				color: "white"
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(dist_exports.Sparkles, { size: 18 })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Paper, {
			elevation: 0,
			sx: {
				p: 2,
				borderRadius: 3,
				bgcolor: "action.hover",
				border: "1px solid",
				borderColor: "divider",
				display: "flex",
				alignItems: "center",
				gap: .5
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dot, { delay: "0ms" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dot, { delay: "150ms" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dot, { delay: "300ms" })
			]
		})]
	});
}
function Dot({ delay }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, {
		component: "span",
		className: "animate-bounce",
		sx: {
			width: 6,
			height: 6,
			bgcolor: "text.secondary",
			borderRadius: "50%",
			display: "inline-block",
			animationDelay: delay
		}
	});
}
//#endregion
export { ChatPage as component };
