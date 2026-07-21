"""
tools/maps.py
-------------
Google Maps MCP integration tool.

Provides fetch_maps_intelligence(), an async function that connects to the
Google Maps MCP server via streamablehttp_client and runs four searches:
  1. Venue geocoding (search_places)
  2. Hotels within 5 miles (search_places + location_bias)
  3. Parking structures nearby (search_places + location_bias)
  4. Accessibility features nearby (search_places + location_bias)

Returns a raw dict with all four payloads plus extracted lat/lon.
The caller (maps_node) is responsible for LLM synthesis of this data.
"""

from __future__ import annotations

import json
import logging
from typing import Any

from mcp.client.session import ClientSession
from mcp.client.streamable_http import streamablehttp_client

from agent.config import settings

logger = logging.getLogger(__name__)

# 5 miles in metres
_HOTEL_RADIUS_M = 8_046
_LOCAL_RADIUS_M = 3_000


def _parse_mcp_result(result: Any) -> dict:
    """
    Return the structuredContent dict from an MCP CallToolResult if available;
    otherwise fall back to parsing the plain text content as JSON.
    """
    structured = getattr(result, "structuredContent", None)
    if structured:
        return structured

    content = getattr(result, "content", None)
    if content is None:
        return {}

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

    raw_text = "\n".join(parts)
    try:
        return json.loads(raw_text)
    except Exception:
        return {"raw": raw_text}


async def _call_tool(session: ClientSession, tool_name: str, args: dict) -> Any:
    """Thin wrapper that logs and delegates to session.call_tool."""
    logger.info("[maps] Calling MCP tool '%s' args=%s", tool_name, args)
    return await session.call_tool(tool_name, args)


async def fetch_maps_intelligence(venue_address: str) -> dict:
    """
    Run all four Google Maps MCP searches for a venue address.

    Parameters
    ----------
    venue_address : str
        The raw venue string (e.g. "Pelican Hill Resort, Newport Beach, CA").

    Returns
    -------
    dict with keys:
        lat, lon           – geocoded coordinates (float)
        venue_data         – raw search_places response for the venue
        hotels_data        – raw search_places response for nearby hotels
        parking_data       – raw search_places response for nearby parking
        access_data        – raw search_places response for accessibility info

    Raises
    ------
    ValueError   if geocoding returns no results or coordinates are missing.
    RuntimeError if MCP connection settings are not configured.
    """
    mcp_url = settings.agent_mcp_1_url
    mcp_key = settings.agent_mcp_1_api_key
    if not mcp_url or not mcp_key:
        raise RuntimeError(
            "AGENT_MCP_1_URL and AGENT_MCP_1_API_KEY must be set to use the Maps tool."
        )

    headers = {"X-Goog-Api-Key": mcp_key}

    async with streamablehttp_client(mcp_url, headers=headers) as (read, write, _):
        async with ClientSession(read, write) as session:
            await session.initialize()

            # ── 1. Geocode venue ───────────────────────────────────────────
            venue_result = await _call_tool(
                session, "search_places", {"textQuery": venue_address}
            )
            venue_data = _parse_mcp_result(venue_result)
            places = venue_data.get("places", [])

            if not places:
                raise ValueError(
                    f"No places found for venue address: '{venue_address}'"
                )

            top_place = places[0]
            location = top_place.get("location", {})
            lat = location.get("latitude")
            lon = location.get("longitude")

            if lat is None or lon is None:
                raise ValueError(
                    "Could not extract coordinates from Google Maps places result."
                )

            logger.info("[maps] Geocoded '%s' → lat=%s lon=%s", venue_address, lat, lon)

            center = {"latitude": lat, "longitude": lon}

            # ── 2. Hotels within 5 miles ───────────────────────────────────
            hotels_result = await _call_tool(
                session,
                "search_places",
                {
                    "textQuery": f"hotels near {venue_address}",
                    "locationBias": {
                        "circle": {"center": center, "radiusMeters": _HOTEL_RADIUS_M}
                    },
                },
            )
            hotels_data = _parse_mcp_result(hotels_result)

            # ── 3. Parking structures ──────────────────────────────────────
            parking_result = await _call_tool(
                session,
                "search_places",
                {
                    "textQuery": f"parking garage parking lot near {venue_address}",
                    "locationBias": {
                        "circle": {"center": center, "radiusMeters": _LOCAL_RADIUS_M}
                    },
                },
            )
            parking_data = _parse_mcp_result(parking_result)

            # ── 4. Accessibility indicators ────────────────────────────────
            access_result = await _call_tool(
                session,
                "search_places",
                {
                    "textQuery": (
                        f"accessible parking wheelchair accessible shuttle "
                        f"drop-off near {venue_address}"
                    ),
                    "locationBias": {
                        "circle": {"center": center, "radiusMeters": _LOCAL_RADIUS_M}
                    },
                },
            )
            access_data = _parse_mcp_result(access_result)

    return {
        "lat": lat,
        "lon": lon,
        "venue_data": venue_data,
        "hotels_data": hotels_data,
        "parking_data": parking_data,
        "access_data": access_data,
    }
