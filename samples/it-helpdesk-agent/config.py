"""Static configuration for the dummy IT helpdesk agent.

Nothing here is read from the environment — the agent is a self-contained
demo that returns canned responses, so every value is a compile-time
constant. Edit this file to change the agent's presentation.
"""

from __future__ import annotations

from dataclasses import dataclass

COMPANY_NAME = "AcmeCorp"
TONE = "professional and helpful"
MAX_TICKETS_PER_QUERY = 20


@dataclass(frozen=True)
class Config:
    company_name: str = COMPANY_NAME
    tone: str = TONE
    max_tickets_per_query: int = MAX_TICKETS_PER_QUERY


CONFIG = Config()
