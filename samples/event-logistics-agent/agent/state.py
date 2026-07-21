"""
agent/state.py
--------------
Graph state definition for the Outdoor Event Logistics LangGraph pipeline.
"""

from __future__ import annotations

from typing import Annotated, Optional

from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages
from typing_extensions import TypedDict


class EventLogisticsState(TypedDict):
    """
    Shared state that flows through every node in the pipeline.

    Fields
    ------
    messages        LangChain message history (accumulated via add_messages reducer)
    venue_address   Raw venue string extracted from the user query
    event_date      Calendar date of the event (YYYY-MM-DD)
    resolved_lat    Geocoded latitude (set by maps_node)
    resolved_lon    Geocoded longitude (set by maps_node)
    maps_data       Hotel density, parking & accessibility summary (set by maps_node)
    weather_data    OpenWeather 4.0 parsed payload (set by weather_node)
    risk_analysis   Final synthesised narrative risk report (set by risk_analyzer_node)
    """

    messages: Annotated[list[BaseMessage], add_messages]
    route_intent: str            # "risk_assessment", "general_query", or "end"
    venue_address: str
    event_date: str              # YYYY-MM-DD
    resolved_lat: Optional[float]
    resolved_lon: Optional[float]
    maps_data: dict              # hotel density, accessibility, parking
    weather_data: dict           # OpenWeather 4.0 parsed payload
    risk_analysis: str           # synthesised narrative outcome (human-readable)
    is_place_evaluation: bool    # True when risk_analyzer_node produced a full structured report
    structured_report: dict      # card-ready risk report (see prompts.RISK_ANALYZER_SYSTEM_PROMPT)
