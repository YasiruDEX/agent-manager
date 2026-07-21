"""
app.py
------
FastAPI application for the Google Maps Agent + Outdoor Event Logistics Pipeline.

Endpoints:
  POST /chat     – Original OpenAI + Google Maps MCP general-purpose assistant
  POST /analyze  – LangGraph multi-agent Outdoor Event Logistics risk pipeline
  GET  /health   – Health / configuration check
"""

from __future__ import annotations

import json
import logging
import os
import traceback
from typing import Any, AsyncIterator

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.responses import JSONResponse, StreamingResponse
from langchain_core.messages import AIMessage, AIMessageChunk, HumanMessage, SystemMessage
from mcp.client.session import ClientSession
from mcp.client.streamable_http import streamablehttp_client
from openai import AsyncOpenAI
from pydantic import BaseModel

from agent import build_graph
from agent.config import settings

load_dotenv()

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("event-logistics-agent")

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Event Logistics Agent",
    description=(
        "Exposes a LangGraph multi-agent pipeline for outdoor event & wedding logistics "
        "risk assessment, integrating Google Maps MCP and weather services."
    ),
    version="2.0.0",
)


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.exception("Unhandled exception: %s", exc)
    return JSONResponse(
        status_code=500,
        content={
            "message": "Internal Server Error",
            "detail": str(exc),
            "traceback": "".join(
                traceback.format_exception(type(exc), exc, exc.__traceback__)
            ),
        },
    )


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------


class ChatMessageInput(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    session_id: str
    message: str | None = None
    messages: list[ChatMessageInput] | None = None
    stream: bool = False


class PlaceEvaluation(BaseModel):
    venue_address: str
    event_date: str
    resolved_lat: float | None = None
    resolved_lon: float | None = None
    maps_data: dict[str, Any] = {}
    weather_data: dict[str, Any] = {}
    report: dict[str, Any] = {}


class ChatResponse(BaseModel):
    response: str
    place_evaluation: PlaceEvaluation | None = None



# ---------------------------------------------------------------------------
# MCP helpers (used by /chat only)
# ---------------------------------------------------------------------------


def _tool_definitions_from_mcp(tools: list[Any]) -> list[dict[str, Any]]:
    return [
        {
            "type": "function",
            "function": {
                "name": t.name,
                "description": t.description or f"MCP tool {t.name}",
                "parameters": t.inputSchema if isinstance(t.inputSchema, dict) else {},
            },
        }
        for t in tools
    ]


def _stringify_mcp_result(result: Any) -> str:
    content = getattr(result, "content", None)
    if content is None:
        return str(result)
    parts: list[str] = []
    for item in content:
        if hasattr(item, "text"):
            parts.append(item.text)
        elif hasattr(item, "model_dump"):
            parts.append(
                json.dumps(
                    item.model_dump(mode="json", exclude_none=True), ensure_ascii=False
                )
            )
        else:
            parts.append(str(item))
    return "\n".join(parts) if parts else ""


# ---------------------------------------------------------------------------
# /chat core loop
# ---------------------------------------------------------------------------


async def _run_chat_loop(request: ChatRequest) -> str:
    if not settings.openai_api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OPENAI_API_KEY is not set.",
        )
    if not settings.agent_mcp_1_url or not settings.agent_mcp_1_api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AGENT_MCP_1_URL and AGENT_MCP_1_API_KEY must be set.",
        )

    openai_client = AsyncOpenAI(api_key=settings.openai_api_key)
    mcp_headers = {"X-Goog-Api-Key": settings.agent_mcp_1_api_key}

    system_prompt = (
        "You are a Google Maps assistant. Use the available MCP tools for "
        "places, weather, routes, and related map lookups. Do not invent map "
        "data. If required fields are missing, ask a concise follow-up question."
    )

    messages: list[dict[str, Any]] = [{"role": "system", "content": system_prompt}]
    
    for m in request.messages:
        messages.append({"role": m.role, "content": m.content})

    async with streamablehttp_client(
        settings.agent_mcp_1_url, headers=mcp_headers
    ) as (read, write, _):
        async with ClientSession(read, write) as session:
            await session.initialize()
            list_result = await session.list_tools()
            mcp_tools = list_result.tools
            tool_definitions = _tool_definitions_from_mcp(mcp_tools)
            tool_names = {t.name for t in mcp_tools}

            logger.info("Loaded %d MCP tools.", len(mcp_tools))

            for _ in range(settings.max_tool_rounds):
                completion = await openai_client.chat.completions.create(
                    model=settings.openai_model,
                    messages=messages,
                    tools=tool_definitions,
                    tool_choice="auto",
                )
                assistant_message = completion.choices[0].message

                if assistant_message.tool_calls:
                    messages.append(
                        {
                            "role": "assistant",
                            "content": assistant_message.content,
                            "tool_calls": [
                                {
                                    "id": tc.id,
                                    "type": "function",
                                    "function": {
                                        "name": tc.function.name,
                                        "arguments": tc.function.arguments,
                                    },
                                }
                                for tc in assistant_message.tool_calls
                            ],
                        }
                    )
                    for tool_call in assistant_message.tool_calls:
                        tool_name = tool_call.function.name
                        try:
                            args = json.loads(tool_call.function.arguments or "{}")
                        except json.JSONDecodeError:
                            args = {}

                        if tool_name not in tool_names:
                            raise HTTPException(
                                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"Unknown MCP tool requested: {tool_name}",
                            )

                        logger.info("Calling MCP tool '%s' args=%s", tool_name, args)
                        tool_result = await session.call_tool(tool_name, args)
                        messages.append(
                            {
                                "role": "tool",
                                "tool_call_id": tool_call.id,
                                "content": _stringify_mcp_result(tool_result),
                            }
                        )
                    continue

                content = assistant_message.content or ""
                return content.strip() or "I could not produce a response."

    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Agent reached the maximum number of tool rounds without a final answer.",
    )


# ---------------------------------------------------------------------------
# Streaming (SSE) support for /chat
# ---------------------------------------------------------------------------

# Human-readable progress labels shown while each pipeline node is running.
NODE_LABELS: dict[str, str] = {
    "supervisor_router": "Understanding your request…",
    "maps_node": "Looking up venue, hotels, parking & accessibility…",
    "weather_node": "Checking the weather forecast…",
    "risk_analyzer_node": "Generating the risk assessment report…",
    "general_agent_node": "Answering your question…",
}

# general_agent_node's replies are plain user-facing prose, so its tokens are
# streamed live. It delegates to a nested create_react_agent sub-graph, so its
# real token stream surfaces under a namespaced sub-run (e.g. "general_agent_node:<id>")
# rather than under the top-level "general_agent_node" name — the top-level name only
# ever emits one aggregated echo chunk at the end, which would double the output if streamed.
#
# risk_analyzer_node's raw output is a JSON envelope (see agent/prompts.py), not
# user-facing prose, so it is intentionally NOT token-streamed — its result is
# surfaced via the "place_evaluation" event (full report) or the "done" event
# (chat_reply) once the node finishes.
def _text_stream_key(namespace: tuple[str, ...], node: str | None) -> str | None:
    if namespace and namespace[0].startswith("general_agent_node:"):
        return "general_agent_node"
    return None


def _to_langchain_messages(request: ChatRequest) -> list[Any]:
    langchain_messages: list[Any] = []
    if request.messages:
        for msg in request.messages:
            if msg.role == "user":
                langchain_messages.append(HumanMessage(content=msg.content))
            elif msg.role == "assistant":
                langchain_messages.append(AIMessage(content=msg.content))
            elif msg.role == "system":
                langchain_messages.append(SystemMessage(content=msg.content))
    elif request.message:
        langchain_messages.append(HumanMessage(content=request.message))
    return langchain_messages


def _initial_state(langchain_messages: list[Any]) -> dict[str, Any]:
    return {
        "messages": langchain_messages,
        "venue_address": "",
        "event_date": "",
        "resolved_lat": None,
        "resolved_lon": None,
        "maps_data": {},
        "weather_data": {},
        "risk_analysis": "",
        "is_place_evaluation": False,
        "structured_report": {},
    }


def _place_evaluation_from_state(state: dict[str, Any]) -> dict[str, Any] | None:
    if not state.get("is_place_evaluation"):
        return None
    return {
        "venue_address": state.get("venue_address", ""),
        "event_date": state.get("event_date", ""),
        "resolved_lat": state.get("resolved_lat"),
        "resolved_lon": state.get("resolved_lon"),
        "maps_data": state.get("maps_data", {}),
        "weather_data": state.get("weather_data", {}),
        "report": state.get("structured_report", {}),
    }


def _sse(event: str, data: dict[str, Any]) -> str:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


def _next_node(node_name: str, delta: dict[str, Any]) -> str | None:
    # Mirrors the routing wired up in agent/graph.py — keep in sync with build_graph().
    if node_name == "supervisor_router":
        intent = delta.get("route_intent", "risk_assessment")
        return "general_agent_node" if intent == "general_query" else "maps_node"
    if node_name == "maps_node":
        return "weather_node"
    if node_name == "weather_node":
        return "risk_analyzer_node"
    return None


async def _stream_chat(langchain_messages: list[Any]) -> AsyncIterator[str]:
    graph = build_graph()
    streamed_text = ""
    final_text = ""
    state_acc: dict[str, Any] = {}
    try:
        yield _sse(
            "stage",
            {"node": "supervisor_router", "status": "start", "label": NODE_LABELS["supervisor_router"]},
        )

        async for namespace, mode, payload in graph.astream(
            _initial_state(langchain_messages),
            stream_mode=["updates", "messages"],
            subgraphs=True,
        ):
            if mode == "messages":
                chunk, metadata = payload
                stream_key = _text_stream_key(namespace, metadata.get("langgraph_node"))
                if stream_key and isinstance(chunk, AIMessageChunk) and chunk.content:
                    streamed_text += chunk.content
                    yield _sse("token", {"node": stream_key, "text": chunk.content})
                continue

            # mode == "updates": only the top-level pipeline nodes matter for stage
            # tracking — nested sub-graph node updates (e.g. general_agent_node's
            # internal ReAct loop) show up under a non-empty namespace and are skipped.
            if namespace:
                continue

            for node_name, delta in payload.items():
                state_acc.update(delta)

                if node_name == "risk_analyzer_node":
                    final_text = delta.get("risk_analysis") or final_text
                    place_evaluation = _place_evaluation_from_state(state_acc)
                    if place_evaluation:
                        yield _sse("place_evaluation", place_evaluation)
                elif node_name == "general_agent_node":
                    node_messages = delta.get("messages") or []
                    if node_messages and getattr(node_messages[-1], "content", None):
                        final_text = node_messages[-1].content

                yield _sse(
                    "stage",
                    {"node": node_name, "status": "complete", "label": NODE_LABELS.get(node_name, node_name)},
                )

                next_node = _next_node(node_name, delta)
                if next_node:
                    yield _sse(
                        "stage",
                        {"node": next_node, "status": "start", "label": NODE_LABELS.get(next_node, next_node)},
                    )

        text = streamed_text.strip() or final_text.strip() or "I could not produce a response."
        yield _sse("done", {"text": text})
    except Exception as exc:
        logger.exception("Streaming pipeline error: %s", exc)
        yield _sse("error", {"message": str(exc)})


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@app.post("/chat", response_model=None, summary="Outdoor Event Logistics Risk Assessment (LangGraph Pipeline)")
async def chat(request: ChatRequest, http_request: Request):
    """
    Runs the full LangGraph pipeline for outdoor event & wedding logistics risk assessment.
    Accepts conversation history and infers the last user message as the query.

    Set `stream: true` in the request body (or send `Accept: text/event-stream`) to
    receive Server-Sent Events with pipeline progress + token-by-token output instead
    of a single buffered JSON response.
    """
    user_query = ""
    if request.message:
        user_query = request.message
    elif request.messages:
        for msg in reversed(request.messages):
            if msg.role == "user":
                user_query = msg.content
                break

    if not user_query or not user_query.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No user message found to analyze.",
        )

    langchain_messages = _to_langchain_messages(request)

    wants_stream = request.stream or "text/event-stream" in (
        http_request.headers.get("accept") or ""
    )

    if wants_stream:
        return StreamingResponse(
            _stream_chat(langchain_messages),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )

    graph = build_graph()
    try:
        final_state = await graph.ainvoke(_initial_state(langchain_messages))
    except Exception as exc:
        logger.exception("Pipeline error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Pipeline execution failed: {exc}",
        )

    # Pull last AI message as the formatted full report
    messages = final_state.get("messages", [])
    full_report = next(
        (m.content for m in reversed(messages) if hasattr(m, "content") and m.content),
        "",
    )

    place_evaluation = _place_evaluation_from_state(final_state)
    return ChatResponse(response=full_report, place_evaluation=place_evaluation)


@app.get("/health", summary="Health check")
async def health():
    return {
        "status": "ok",
        "agent": "Google Maps Agent + Event Logistics Pipeline",
        "version": "2.0.0",
        "mcp_url": settings.agent_mcp_1_url,
        "openweather_configured": bool(settings.openweather_api_key),
    }
