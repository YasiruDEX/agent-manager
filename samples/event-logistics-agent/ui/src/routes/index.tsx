import { streamChat, type ChatMessage } from "@/lib/chat-api";
import type { PlaceEvaluationPayload } from "@/lib/place-types";
import { useSettings } from "@/lib/settings-context";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Send, Sparkles, User, Trash2 } from "@wso2/oxygen-ui-icons-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
  Avatar,
  Stack,
  Divider,
  Paper,
  Alert,
} from "@wso2/oxygen-ui";

const CHAT_MESSAGES_STORAGE_KEY = "agent-sample-tester:chat-messages";

function loadMessagesFromStorage(): ChatMessage[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(CHAT_MESSAGES_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isChatMessage);
  } catch {
    return [];
  }
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false;

  const message = value as Record<string, unknown>;
  return (
    (message.role === "user" ||
      message.role === "assistant" ||
      message.role === "system") &&
    typeof message.content === "string"
  );
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Conversation · Agent Testing Workspace" },
      {
        name: "description",
        content: "Talk to your AI agent from a clean, focused chat interface.",
      },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const { apiUrl, apiKey, apiHeader } = useSettings();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stageLabel, setStageLabel] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMessages(loadMessagesFromStorage());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      window.localStorage.setItem(
        CHAT_MESSAGES_STORAGE_KEY,
        JSON.stringify(messages),
      );
    } catch {
      // Ignore storage failures and keep the chat functional.
    }
  }, [messages, isLoaded]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading, streamingText]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function submit() {
    const text = input.trim();
    if (!text || loading) return;
    setError(null);
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setStageLabel(null);
    setStreamingText("");
    let placeEvaluation: PlaceEvaluationPayload | null = null;
    try {
      const reply = await streamChat({
        apiUrl,
        apiKey,
        apiHeader,
        messages: next,
        onStage: (stage) =>
          setStageLabel(stage.status === "start" ? stage.label : null),
        onToken: (accumulated) => setStreamingText(accumulated),
        onPlaceEvaluation: (evaluation) => {
          placeEvaluation = evaluation;
        },
      });

      if (placeEvaluation) {
        // Full venue evaluations are shown in chat AND saved as a card in the
        // Events tab, so the user gets both without asking twice.
        const evaluation: PlaceEvaluationPayload = placeEvaluation;
        const venueName =
          evaluation.report?.venue_name || evaluation.venue_address;
        fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ evaluation }),
        })
          .then((res) => {
            if (!res.ok) throw new Error(`Request failed (${res.status})`);
            toast.success(`Saved "${venueName}" to Events`, {
              description: evaluation.event_date,
              action: {
                label: "View",
                onClick: () => navigate({ to: "/events" }),
              },
            });
          })
          .catch(() => {
            toast.error(
              `Evaluated "${venueName}", but saving it to Events failed.`,
            );
          });

        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: `${reply || "(empty response)"}\n\nAlso saved to your [Events tab](/events) as a card.`,
          },
        ]);
      } else {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: reply || "(empty response)" },
        ]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
      setStageLabel(null);
      setStreamingText("");
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "col",
        height: "100%",
        position: "relative",
      }}
      className="flex flex-col"
    >
      {messages.length > 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: { xs: 2, md: 3 },
            py: 1,
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            zIndex: 10,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {messages.length} message{messages.length === 1 ? "" : "s"}
          </Typography>
          <Button
            size="small"
            color="error"
            variant="outlined"
            startIcon={<Trash2 size={16} />}
            onClick={() => setMessages([])}
          >
            Clear Chat
          </Button>
        </Box>
      )}

      <Box
        ref={scrollRef}
        sx={{
          flex: 1,
          overflowY: "auto",
          p: { xs: 2, md: 3 },
          minHeight: 0,
          display: messages.length === 0 && !loading ? "flex" : "block",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {messages.length === 0 && !loading ? (
          <EmptyState />
        ) : (
          <Stack
            spacing={3}
            sx={{ maxWidth: "48rem", mx: "auto", width: "100%", py: 2 }}
          >
            {messages.map((m, i) => (
              <MessageBubble key={i} message={m} />
            ))}
            {loading && streamingText && (
              <MessageBubble
                message={{ role: "assistant", content: streamingText }}
              />
            )}
            {loading && !streamingText && (
              <TypingIndicator label={stageLabel} />
            )}
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        )}
      </Box>

      <Box
        sx={{
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          p: { xs: 2, md: 3 },
        }}
      >
        <Box sx={{ maxWidth: "48rem", mx: "auto", width: "100%" }}>
          <Stack direction="row" spacing={2} alignItems="flex-end">
            <TextField
              inputRef={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Message your agent…"
              multiline
              maxRows={5}
              fullWidth
              variant="outlined"
              size="small"
              disabled={loading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                },
              }}
            />
            <IconButton
              onClick={submit}
              disabled={loading || !input.trim()}
              sx={{
                bgcolor: "primary.main",
                color: "primary.contrastText",
                "&:hover": {
                  bgcolor: "primary.dark",
                },
                "&:disabled": {
                  bgcolor: "action.disabledBackground",
                  color: "action.disabled",
                },
                width: 40,
                height: 40,
              }}
            >
              <Send size={18} />
            </IconButton>
          </Stack>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", textAlign: "center", mt: 1.5 }}
          >
            Endpoint: <span style={{ fontFamily: "monospace" }}>{apiUrl}</span>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

function EmptyState() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        mt: 8,
        mx: "auto",
        maxWidth: "28rem",
      }}
    >
      <Avatar
        sx={{
          width: 56,
          height: 56,
          mb: 2.5,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          boxShadow: "0 0 24px -6px rgba(255,94,58,0.5)",
        }}
      >
        <Sparkles size={28} />
      </Avatar>
      <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
        How can I help today?
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Start a conversation with your agent. Configure the endpoint and API key
        from{" "}
        <Typography
          component="span"
          variant="body2"
          fontWeight="medium"
          color="text.primary"
        >
          Settings
        </Typography>
        .
      </Typography>
    </Box>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <Stack
      direction={isUser ? "row-reverse" : "row"}
      spacing={2}
      sx={{ width: "100%" }}
    >
      <Avatar
        sx={{
          width: 36,
          height: 36,
          bgcolor: isUser ? "secondary.main" : "primary.main",
          color: "white",
        }}
      >
        {isUser ? <User size={18} /> : <Sparkles size={18} />}
      </Avatar>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          maxWidth: "80%",
          borderRadius: 3,
          bgcolor: isUser ? "primary.light" : "action.hover",
          color: isUser ? "primary.contrastText" : "text.primary",
          border: "1px solid",
          borderColor: isUser ? "primary.main" : "divider",
          wordBreak: "break-word",
        }}
      >
        {message.role === "assistant" ? (
          <MarkdownText value={message.content} />
        ) : (
          <PlainText value={message.content} />
        )}
      </Paper>
    </Stack>
  );
}

function PlainText({ value }: { value: string }) {
  return (
    <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
      {value}
    </div>
  );
}

function MarkdownText({ value }: { value: string }) {
  const blocks = parseMarkdownBlocks(value);

  if (blocks.length === 0) {
    return <PlainText value={value} />;
  }

  return (
    <Stack spacing={1.5} sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
      {blocks.map((block, index) => {
        if (block.type === "list") {
          return (
            <ol key={index} style={{ paddingLeft: "1.25rem", margin: 0 }}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex} style={{ marginBottom: "0.25rem" }}>
                  <InlineMarkdown value={item} />
                </li>
              ))}
            </ol>
          );
        }

        if (block.type === "quote") {
          return (
            <Box
              key={index}
              component="blockquote"
              sx={{
                borderLeft: "2px solid",
                borderColor: "divider",
                pl: 1.5,
                m: 0,
                color: "text.secondary",
              }}
            >
              <InlineMarkdown value={block.text} />
            </Box>
          );
        }

        return (
          <Typography
            key={index}
            variant="body2"
            sx={{ lineHeight: 1.6, whiteSpace: "pre-wrap" }}
          >
            <InlineMarkdown value={block.text} />
          </Typography>
        );
      })}
    </Stack>
  );
}

function InlineMarkdown({ value }: { value: string }) {
  const segments = parseInlineSegments(value);

  return (
    <>
      {segments.map((segment, index) => {
        if (segment.type === "link") {
          return (
            <a
              key={index}
              href={segment.href}
              target="_blank"
              rel="noreferrer"
              style={{
                color: "inherit",
                textDecoration: "underline",
                fontWeight: 500,
              }}
            >
              {segment.text}
            </a>
          );
        }

        if (segment.type === "strong") {
          return (
            <Typography
              key={index}
              component="strong"
              variant="body2"
              fontWeight="bold"
            >
              {segment.text}
            </Typography>
          );
        }

        if (segment.type === "code") {
          return (
            <code
              key={index}
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.05)",
                padding: "2px 6px",
                borderRadius: "4px",
                fontFamily: "monospace",
                fontSize: "0.9em",
              }}
            >
              {segment.text}
            </code>
          );
        }

        return <span key={index}>{segment.text}</span>;
      })}
    </>
  );
}

type MarkdownBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "quote"; text: string };

type InlineSegment =
  | { type: "text"; text: string }
  | { type: "link"; text: string; href: string }
  | { type: "strong"; text: string }
  | { type: "code"; text: string };

function parseMarkdownBlocks(value: string): MarkdownBlock[] {
  // Convert headers (### Text) to bold (**Text**)
  const normalized = value
    .replace(/\r\n/g, "\n")
    .replace(/^#{1,6}\s+(.*)$/gm, "**$1**")
    .trim();
  if (!normalized) return [];

  const rawBlocks = normalized.split(/\n\s*\n/);
  return rawBlocks.map((rawBlock) => {
    const lines = rawBlock.split("\n").map((line) => line.trimEnd());
    const listItems = lines
      .map((line) => line.match(/^\s*(?:\d+\.|-|\*)\s+(.*)$/)?.[1]?.trim())
      .filter((item): item is string => Boolean(item));

    if (listItems.length > 0 && listItems.length === lines.length) {
      return { type: "list", items: listItems };
    }

    if (lines.length === 1 && lines[0].startsWith("> ")) {
      return { type: "quote", text: lines[0].slice(2).trim() };
    }

    return { type: "paragraph", text: lines.join("\n").trim() };
  });
}

function parseInlineSegments(value: string): InlineSegment[] {
  const segments: InlineSegment[] = [];
  const pattern = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|`([^`]+)`/g;
  let lastIndex = 0;

  for (const match of value.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      segments.push({ type: "text", text: value.slice(lastIndex, index) });
    }

    if (match[1] && match[2]) {
      segments.push({ type: "link", text: match[1], href: match[2] });
    } else if (match[3]) {
      segments.push({ type: "strong", text: match[3] });
    } else if (match[4]) {
      segments.push({ type: "code", text: match[4] });
    }

    lastIndex = index + match[0].length;
  }

  if (lastIndex < value.length) {
    segments.push({ type: "text", text: value.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ type: "text", text: value }];
}

function TypingIndicator({ label }: { label?: string | null }) {
  return (
    <Stack direction="row" spacing={2} sx={{ width: "100%" }}>
      <Avatar
        sx={{
          width: 36,
          height: 36,
          bgcolor: "primary.main",
          color: "white",
        }}
      >
        <Sparkles size={18} />
      </Avatar>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 3,
          bgcolor: "action.hover",
          border: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        {label ? (
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
        ) : (
          <Stack direction="row" spacing={0.5}>
            <Dot delay="0ms" />
            <Dot delay="150ms" />
            <Dot delay="300ms" />
          </Stack>
        )}
      </Paper>
    </Stack>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <Box
      component="span"
      className="animate-bounce"
      sx={{
        width: 6,
        height: 6,
        bgcolor: "text.secondary",
        borderRadius: "50%",
        display: "inline-block",
        animationDelay: delay,
      }}
    />
  );
}
