"""FastAPI entrypoint for the dummy IT helpdesk agent.

Implements the AM chat-agent contract: ``POST /chat`` on port 8000 accepting
``{session_id, message, context}`` and returning ``{response, session_id}``.
``GET /health`` is provided for local checks (AM does not require it).

The agent reads no environment variables — all configuration is static and
all responses are canned.
"""

from __future__ import annotations

import logging
from typing import Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from agent import build_agent
from config import CONFIG

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("it-helpdesk")

AGENT = build_agent(CONFIG)
log.info(
    "IT helpdesk agent ready in demo mode (company=%s, tone=%s)",
    CONFIG.company_name,
    CONFIG.tone,
)


class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None
    context: dict[str, Any] | None = None


class ChatResponse(BaseModel):
    response: str
    session_id: str | None = None


app = FastAPI(title="IT Helpdesk Agent (Demo)", version="0.2.0")


@app.get("/health")
def health() -> dict[str, Any]:
    return {"status": "ok", "company": CONFIG.company_name, "mode": "demo"}


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest) -> ChatResponse:
    try:
        answer = AGENT.invoke(req.message)
    except Exception as exc:  # noqa: BLE001
        log.exception("agent invocation failed")
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    return ChatResponse(response=answer, session_id=req.session_id)
