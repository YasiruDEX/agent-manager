"""
tools/dynamic_mcp.py
--------------------
LangChain tools wrapping the MCP server tools for the general QA agent.
"""

from __future__ import annotations

import json
import logging
from typing import Optional

from langchain_core.tools import tool
from mcp.client.session import ClientSession
from mcp.client.streamable_http import streamablehttp_client

from agent.config import settings

logger = logging.getLogger(__name__)

def _parse_mcp_result(result) -> dict:
    structured = getattr(result, "structuredContent", None)
    if structured:
        return structured
    content = getattr(result, "content", None)
    if content is None:
        return {}
    parts = []
    for item in content:
        if hasattr(item, "text"):
            parts.append(item.text)
        elif hasattr(item, "model_dump"):
            parts.append(json.dumps(item.model_dump(mode="json", exclude_none=True), ensure_ascii=False))
        else:
            parts.append(str(item))
    raw_text = "\n".join(parts)
    try:
        return json.loads(raw_text)
    except Exception:
        return {"raw": raw_text}

async def _call_mcp_tool(tool_name: str, args: dict) -> dict:
    mcp_url = settings.agent_mcp_1_url
    mcp_key = settings.agent_mcp_1_api_key
    if not mcp_url or not mcp_key:
        return {"error": "MCP Configuration missing."}

    headers = {"X-Goog-Api-Key": mcp_key}
    try:
        async with streamablehttp_client(mcp_url, headers=headers) as (read, write, _):
            async with ClientSession(read, write) as session:
                await session.initialize()
                logger.info(f"[dynamic_mcp] Calling {tool_name} with {args}")
                result = await session.call_tool(tool_name, args)
                return _parse_mcp_result(result)
    except Exception as exc:
        logger.error(f"Error calling {tool_name}: {exc}")
        return {"error": str(exc)}

@tool
async def search_places(text_query: str, location_bias: Optional[dict] = None) -> str:
    """
    Search for places using Google Maps.
    Args:
        text_query (str): The search string (e.g. 'Pelican Hill Resort').
        location_bias (dict): Optional bias (e.g. {"circle": {"center": {"latitude": ..., "longitude": ...}, "radiusMeters": 5000}}).
    """
    args = {"textQuery": text_query}
    if location_bias:
        args["locationBias"] = location_bias
    res = await _call_mcp_tool("search_places", args)
    return json.dumps(res, indent=2)

@tool
async def compute_routes(origin_address: str, destination_address: str, travel_mode: str = "DRIVE") -> str:
    """
    Compute travel route between origin and destination.
    Args:
        origin_address (str): The origin address (e.g. 'Eiffel Tower, Paris' or 'WSO2, Colombo 4').
        destination_address (str): The destination address (e.g. 'Fort Railway Station').
        travel_mode (str): Travel mode ('DRIVE', 'WALK', 'BICYCLE', 'TRANSIT'). Default is 'DRIVE'.
    """
    args = {
        "origin": {"address": origin_address},
        "destination": {"address": destination_address},
        "travel_mode": travel_mode
    }
    res = await _call_mcp_tool("compute_routes", args)
    return json.dumps(res, indent=2)

@tool
async def lookup_weather(address: str) -> str:
    """
    Look up current weather for an address.
    Args:
        address (str): The location to get weather for (e.g. 'London, UK').
    """
    args = {"location": {"address": address}}
    res = await _call_mcp_tool("lookup_weather", args)
    return json.dumps(res, indent=2)

DYNAMIC_TOOLS = [search_places, compute_routes, lookup_weather]
