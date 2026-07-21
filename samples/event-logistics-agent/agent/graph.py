"""
agent/graph.py
--------------
Builds and compiles the LangGraph StateGraph for the Event Logistics pipeline.

Pipeline:
  START → supervisor_router → maps_node → weather_node → risk_analyzer_node → END
"""

from __future__ import annotations

import logging

from langgraph.graph import END, START, StateGraph

from agent.nodes import (
    maps_node,
    risk_analyzer_node,
    supervisor_router,
    weather_node,
)
from agent.state import EventLogisticsState

logger = logging.getLogger(__name__)


def build_graph():
    """
    Construct and compile the Event Logistics StateGraph.
    Returns a compiled CompiledStateGraph ready for ainvoke / invoke.
    """
    builder = StateGraph(EventLogisticsState)

    from agent.nodes import general_agent_node
    
    # Register nodes
    builder.add_node("supervisor_router", supervisor_router)
    builder.add_node("maps_node", maps_node)
    builder.add_node("weather_node", weather_node)
    builder.add_node("risk_analyzer_node", risk_analyzer_node)
    builder.add_node("general_agent_node", general_agent_node)

    # Routing logic
    def route_supervisor(state: EventLogisticsState) -> str:
        intent = state.get("route_intent", "risk_assessment")
        if intent == "general_query":
            return "general_agent_node"
        return "maps_node"

    # Wire the pipeline
    builder.add_edge(START, "supervisor_router")
    
    builder.add_conditional_edges(
        "supervisor_router",
        route_supervisor,
        {
            "general_agent_node": "general_agent_node",
            "maps_node": "maps_node"
        }
    )
    
    builder.add_edge("maps_node", "weather_node")
    builder.add_edge("weather_node", "risk_analyzer_node")
    builder.add_edge("risk_analyzer_node", END)
    builder.add_edge("general_agent_node", END)

    graph = builder.compile()
    logger.info("Event Logistics graph compiled. Nodes: %s", list(graph.nodes.keys()))
    return graph
