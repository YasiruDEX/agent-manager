"""
agent/nodes.py
--------------
All four LangGraph node functions for the Event Logistics pipeline.

Pipeline order:
  supervisor_router → maps_node → weather_node → risk_analyzer_node
"""

from __future__ import annotations

import json
import logging
import re
from datetime import datetime, timezone

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_core.runnables import RunnableConfig
from langchain_openai import ChatOpenAI

from agent.config import settings
from agent.prompts import (
    MAPS_SYNTHESIS_PROMPT_TEMPLATE,
    RISK_ANALYZER_SYSTEM_PROMPT,
    RISK_ANALYZER_USER_PROMPT_TEMPLATE,
    SUPERVISOR_SYSTEM_PROMPT,
)
from agent.state import EventLogisticsState
from tools.maps import fetch_maps_intelligence
from tools.weather import fetch_weather_data
from tools.dynamic_mcp import DYNAMIC_TOOLS
from langgraph.prebuilt import create_react_agent

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Shared helper
# ---------------------------------------------------------------------------


def _llm(temperature: float = 0.0) -> ChatOpenAI:
    if settings.use_llm_provider:
        return ChatOpenAI(
            base_url=settings.llm_provider_url,
            api_key=settings.llm_provider_key,
            model=settings.openai_model,
            temperature=temperature,
            timeout=settings.openai_timeout,
            max_retries=settings.openai_max_retries,
        )
    return ChatOpenAI(
        model=settings.openai_model,
        api_key=settings.openai_api_key,
        temperature=temperature,
        timeout=settings.openai_timeout,
        max_retries=settings.openai_max_retries,
    )


def _strip_markdown_fences(text: str) -> str:
    text = re.sub(r"^```(?:json)?\s*", "", text.strip())
    text = re.sub(r"\s*```$", "", text)
    return text.strip()


# ---------------------------------------------------------------------------
# Node A – Supervisor Router
# ---------------------------------------------------------------------------


async def supervisor_router(
    state: EventLogisticsState, config: RunnableConfig | None = None
) -> EventLogisticsState:
    """
    Parses the last human message to extract route_intent, venue_address, and event_date.
    Initialises all other state fields to safe defaults before the pipeline runs.
    """
    logger.info("[supervisor_router] Entering node.")

    last_human = next(
        (m.content for m in reversed(state["messages"]) if isinstance(m, HumanMessage)),
        "",
    )

    # Clean intermediate agent status messages from the history sent to supervisor router
    clean_history = []
    for m in state["messages"]:
        if isinstance(m, AIMessage):
            content = m.content
            if (content.startswith("Supervisor parsed:") or 
                content.startswith("Maps analysis complete") or 
                content.startswith("Weather data retrieved") or 
                "Maps agent error" in content or 
                "Weather agent error" in content or
                content.startswith("Weather Error:") or 
                content.startswith("Maps Error:")):
                continue
        clean_history.append(m)

    response = await _llm(temperature=0.0).ainvoke(
        [SystemMessage(content=SUPERVISOR_SYSTEM_PROMPT)] + clean_history, config=config
    )

    raw = _strip_markdown_fences(response.content)

    try:
        parsed = json.loads(raw)
        route_intent = parsed.get("route_intent", "risk_assessment")
        venue_address = parsed.get("venue_address", "")
        event_date = parsed.get("event_date", "")
    except Exception as exc:
        logger.error("[supervisor_router] JSON parse failed: %s — raw: %s", exc, raw)
        route_intent = "risk_assessment"
        venue_address = last_human
        event_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    logger.info("[supervisor_router] intent=%r venue=%r date=%r", route_intent, venue_address, event_date)

    return {
        "messages": [
            AIMessage(
                content=f"Supervisor parsed: intent='{route_intent}', venue='{venue_address}', date='{event_date}'"
            )
        ],
        "route_intent": route_intent,
        "venue_address": venue_address,
        "event_date": event_date,
        "resolved_lat": None,
        "resolved_lon": None,
        "maps_data": {},
        "weather_data": {},
        "risk_analysis": "",
        "is_place_evaluation": False,
        "structured_report": {},
    }


# ---------------------------------------------------------------------------
# Node B – Maps Agent
# ---------------------------------------------------------------------------


async def maps_node(
    state: EventLogisticsState, config: RunnableConfig | None = None
) -> EventLogisticsState:
    """
    Calls the Google Maps MCP tool-server to:
      1. Geocode the venue → resolved_lat / resolved_lon
      2. Find hotels within 5 miles
      3. Find nearby parking structures
      4. Assess physical accessibility around the venue
    Synthesises all results with an LLM call and writes to maps_data.
    """
    logger.info("[maps_node] Entering node.")

    venue_address = state.get("venue_address", "")
    if not venue_address:
        error_msg = "No venue address in state — cannot run maps_node."
        logger.error("[maps_node] %s", error_msg)
        return {
            "messages": [AIMessage(content=f"Maps Error: {error_msg}")],
            "maps_data": {"error": error_msg},
        }

    try:
        raw = await fetch_maps_intelligence(venue_address)
    except Exception as exc:
        logger.exception("[maps_node] fetch_maps_intelligence raised: %s", exc)
        error_msg = f"Maps agent error: {exc}"
        return {
            "messages": [AIMessage(content=error_msg)],
            "maps_data": {"error": error_msg},
            "resolved_lat": None,
            "resolved_lon": None,
        }

    # Unpack raw data from the maps tool
    lat = raw["lat"]
    lon = raw["lon"]
    venue_data_str = json.dumps(raw["venue_data"], indent=2)[:3000]
    hotels_data_str = json.dumps(raw["hotels_data"], indent=2)[:3000]
    parking_data_str = json.dumps(raw["parking_data"], indent=2)[:2000]
    access_data_str = json.dumps(raw["access_data"], indent=2)[:2000]

    # LLM synthesis → structured maps_data dict
    synthesis_prompt = MAPS_SYNTHESIS_PROMPT_TEMPLATE.format(
        venue_data=venue_data_str,
        hotels_data=hotels_data_str,
        parking_data=parking_data_str,
        access_data=access_data_str,
        lat=lat,
        lon=lon,
    )

    synthesis_response = await _llm(temperature=0.0).ainvoke(
        [HumanMessage(content=synthesis_prompt)], config=config
    )
    synthesis_raw = _strip_markdown_fences(synthesis_response.content)

    try:
        maps_summary = json.loads(synthesis_raw)
    except Exception:
        # Fallback: build a minimal summary from raw data
        maps_summary = {
            "venue": {
                "latitude": lat,
                "longitude": lon,
                "summary": raw["venue_data"].get("summary", ""),
            },
            "hotels": [
                {"name": h.get("id", "Unknown"), "distance": "within 5 miles", "notes": ""}
                for h in raw["hotels_data"].get("places", [])[:5]
            ],
            "parking": {
                "summary": raw["parking_data"].get("summary", "No parking data"),
                "structures": [],
            },
            "accessibility": {
                "summary": raw["access_data"].get("summary", "No data"),
                "features": [],
            },
        }

    maps_summary.setdefault("venue", {})
    maps_summary["venue"]["latitude"] = lat
    maps_summary["venue"]["longitude"] = lon

    logger.info("[maps_node] Complete. Geocoded at (%s, %s).", lat, lon)
    return {
        "messages": [
            AIMessage(content=f"Maps analysis complete. Venue geocoded at ({lat}, {lon}).")
        ],
        "resolved_lat": lat,
        "resolved_lon": lon,
        "maps_data": maps_summary,
    }


# ---------------------------------------------------------------------------
# Node C – Weather Agent
# ---------------------------------------------------------------------------


async def weather_node(state: EventLogisticsState) -> EventLogisticsState:
    """
    Fetches OpenWeather One-Call 4.0 timeline data natively (no MCP).
    Reads resolved_lat / resolved_lon / event_date from state.
    Writes parsed weather metrics to weather_data.
    """
    logger.info("[weather_node] Entering node.")

    lat = state.get("resolved_lat")
    lon = state.get("resolved_lon")
    event_date = state.get("event_date", "")

    if lat is None or lon is None:
        error_msg = "resolved_lat/lon not set — geocoding may have failed."
        logger.error("[weather_node] %s", error_msg)
        return {
            "messages": [AIMessage(content=f"Weather Error: {error_msg}")],
            "weather_data": {"error": error_msg},
        }

    try:
        weather_data = await fetch_weather_data(lat=lat, lon=lon, event_date=event_date)
    except Exception as exc:
        logger.exception("[weather_node] fetch_weather_data raised: %s", exc)
        error_msg = f"Weather agent error: {exc}"
        return {
            "messages": [AIMessage(content=error_msg)],
            "weather_data": {"error": error_msg},
        }

    logger.info("[weather_node] Complete. Summary: %s", weather_data.get("summary"))
    return {
        "messages": [
            AIMessage(
                content=f"Weather data retrieved for {event_date} at ({lat}, {lon})."
            )
        ],
        "weather_data": weather_data,
    }


# ---------------------------------------------------------------------------
# Node D – Risk Analyzer Agent
# ---------------------------------------------------------------------------


def _render_report_markdown(venue_address: str, event_date: str, report: dict) -> str:
    """Renders the structured report as markdown for chat history / non-JS clients."""
    weather_risk = report.get("weather_risk") or {}
    venue_logistics = report.get("venue_logistics") or {}

    lines = [
        f"### Risk Assessment Report for {report.get('venue_name') or venue_address}",
        f"**Event date:** {event_date}  \n**Overall risk:** {str(report.get('overall_risk_level', 'n/a')).title()}",
        "",
        "#### Executive Summary",
        report.get("executive_summary", ""),
        "",
        "#### Weather Risk",
        weather_risk.get("summary", ""),
        *[f"- {p}" for p in weather_risk.get("points", [])],
        "",
        "#### Venue & Logistics",
        venue_logistics.get("summary", ""),
        *[f"- {p}" for p in venue_logistics.get("points", [])],
        "",
        "#### Critical Failure Points",
        *[f"- {p}" for p in report.get("critical_failure_points", [])],
        "",
        "#### Contingency Plan",
        *[f"- {p}" for p in report.get("contingency_plan", [])],
        "",
        "#### Weather Windows",
        *[f"- {p}" for p in report.get("weather_windows", [])],
    ]
    return "\n".join(line for line in lines if line is not None)


async def risk_analyzer_node(
    state: EventLogisticsState, config: RunnableConfig | None = None
) -> EventLogisticsState:
    """
    Pure LLM reasoning node — no external tools.
    Synthesises maps_data + weather_data into either a full structured risk report
    (is_place_evaluation=True, card-ready data in structured_report) or a plain
    chat reply (follow-up answers, greetings, missing venue/date).
    """
    logger.info("[risk_analyzer_node] Entering node.")

    maps_data = state.get("maps_data", {})
    weather_data = state.get("weather_data", {})
    venue_address = state.get("venue_address", "Unknown venue")
    event_date = state.get("event_date", "Unknown date")

    # Clean intermediate agent status messages from the history sent to risk analyzer
    clean_history = []
    for m in state["messages"]:
        if isinstance(m, AIMessage):
            content = m.content
            if (content.startswith("Supervisor parsed:") or
                content.startswith("Maps analysis complete") or
                content.startswith("Weather data retrieved") or
                "Maps agent error" in content or
                "Weather agent error" in content or
                content.startswith("Weather Error:") or
                content.startswith("Maps Error:")):
                continue
        clean_history.append(m)

    context_content = (
        f"Accumulated Event Intelligence:\n"
        f"- Venue Name/Address: {venue_address}\n"
        f"- Event Date: {event_date}\n"
        f"- resolved_lat/lon: {state.get('resolved_lat')}, {state.get('resolved_lon')}\n\n"
        f"Google Maps Data:\n{json.dumps(maps_data, indent=2)[:5000]}\n\n"
        f"Weather Data:\n{json.dumps(weather_data, indent=2)[:4000]}\n"
    )

    try:
        response = await _llm(temperature=0.3).ainvoke(
            [
                SystemMessage(content=RISK_ANALYZER_SYSTEM_PROMPT),
                SystemMessage(content=context_content),
            ] + clean_history,
            config=config,
        )
        parsed = json.loads(_strip_markdown_fences(response.content))
    except Exception as exc:
        logger.exception("[risk_analyzer_node] LLM error: %s", exc)
        error_text = f"Risk analysis failed due to an error: {exc}"
        return {
            "messages": [AIMessage(content=error_text)],
            "risk_analysis": error_text,
            "is_place_evaluation": False,
            "structured_report": {},
        }

    if parsed.get("mode") == "full_report" and isinstance(parsed.get("report"), dict):
        report = parsed["report"]
        chat_text = _render_report_markdown(venue_address, event_date, report)
        logger.info("[risk_analyzer_node] Full structured report generated for %r.", venue_address)
        return {
            "messages": [AIMessage(content=chat_text)],
            "risk_analysis": chat_text,
            "is_place_evaluation": True,
            "structured_report": report,
        }

    chat_text = parsed.get("text") or "I need a bit more information to help with that."
    logger.info("[risk_analyzer_node] Chat reply generated (%d chars).", len(chat_text))
    return {
        "messages": [AIMessage(content=chat_text)],
        "risk_analysis": chat_text,
        "is_place_evaluation": False,
        "structured_report": {},
    }


# ---------------------------------------------------------------------------
# Node E – General QA Agent Node
# ---------------------------------------------------------------------------


async def general_agent_node(
    state: EventLogisticsState, config: RunnableConfig | None = None
) -> EventLogisticsState:
    """
    A dynamic tool-calling node that answers general logistics queries
    (like distance, routing, weather lookups) using MCP tools.
    """
    logger.info("[general_agent_node] Entering node.")
    
    # Clean intermediate agent status messages
    clean_history = []
    for m in state["messages"]:
        if isinstance(m, AIMessage):
            content = m.content
            if (content.startswith("Supervisor parsed:") or 
                content.startswith("Maps analysis complete") or 
                content.startswith("Weather data retrieved") or 
                "Maps agent error" in content or 
                "Weather agent error" in content or
                content.startswith("Weather Error:") or 
                content.startswith("Maps Error:")):
                continue
        clean_history.append(m)

    sys_msg = SystemMessage(content="You are a helpful logistics assistant. Answer the user's questions using your tools if needed. When giving distances or walking times, try to be specific.")
    clean_history.insert(0, sys_msg)
    
    agent = create_react_agent(_llm(temperature=0.0), tools=DYNAMIC_TOOLS)

    response = await agent.ainvoke({"messages": clean_history}, config=config)
    final_message = response["messages"][-1].content
    
    return {
        "messages": [AIMessage(content=final_message)]
    }
