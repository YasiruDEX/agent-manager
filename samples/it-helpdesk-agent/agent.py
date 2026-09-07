"""Dummy IT helpdesk agent.

No LLM, no network calls, no environment variables. Incoming messages are
matched against a handful of keywords and answered from the static sample
data in ``data/`` via the mocked clients in ``clients/``. The point is to
exercise the Agent Manager chat contract and produce traces, not to be
intelligent.
"""

from __future__ import annotations

import re
from typing import Any

from clients import employees as employees_client
from clients import policies as policies_client
from clients import system_status as status_client
from clients import tickets as tickets_client
from config import Config

_EMAIL_RE = re.compile(r"[\w.+-]+@[\w-]+\.[\w.]+")
_EMPLOYEE_ID_RE = re.compile(r"\bE-\d{4}\b", re.IGNORECASE)


def _match(message: str, *keywords: str) -> bool:
    return any(k in message for k in keywords)


class DummyAgent:
    """Keyword-routed responder over the bundled sample data."""

    def __init__(self, cfg: Config) -> None:
        self.cfg = cfg

    def invoke(self, message: str) -> str:
        text = (message or "").strip()
        if not text:
            return self._greeting()

        lowered = text.lower()
        email = _EMAIL_RE.search(text)
        emp_id = _EMPLOYEE_ID_RE.search(text)
        employee = self._resolve_employee(
            email.group(0) if email else None,
            emp_id.group(0).upper() if emp_id else None,
        )

        if _match(lowered, "policy", "policies", "rule", "allowed"):
            return self._policy(lowered)
        if _match(lowered, "password", "reset", "locked out"):
            return self._password(employee)
        if _match(lowered, "outage", "status", "down", "not working", "not syncing"):
            return self._status(lowered)
        if _match(lowered, "ticket", "case", "request id"):
            return self._tickets(employee)
        if _match(lowered, "access", "install", "license", "software"):
            return self._software(employee, text)
        if _match(lowered, "escalate", "l2", "urgent", "manager"):
            return self._escalate(employee)
        if _match(lowered, "hi", "hello", "hey", "help"):
            return self._greeting()
        return self._fallback()

    # -- helpers ---------------------------------------------------------

    def _resolve_employee(
        self, email: str | None, employee_id: str | None
    ) -> dict[str, Any] | None:
        try:
            if email:
                return employees_client.lookup_by_email(email)
            if employee_id:
                return employees_client.get(employee_id)
        except employees_client.EmployeeNotFound:
            return None
        return None

    def _who(self, employee: dict[str, Any] | None) -> str:
        return employee["name"] if employee else "there"

    # -- canned responses ------------------------------------------------

    def _greeting(self) -> str:
        return (
            f"Hi, I'm the {self.cfg.company_name} IT helpdesk agent (demo mode). "
            "I can answer questions about password resets, ticket status, "
            "software access, system outages, and IT policies. "
            "This is a sample agent, so every answer is canned."
        )

    def _password(self, employee: dict[str, Any] | None) -> str:
        if employee and employee.get("is_admin"):
            return (
                f"Thanks, {self._who(employee)}. Your account is flagged as an "
                "administrator, so I can't reset it from L1. I've noted an "
                "escalation to L2 Security (demo only — nothing was actually "
                "changed). They typically respond within one business hour."
            )
        return (
            f"Thanks, {self._who(employee)}. Identity check passed (demo). "
            "A temporary password has been 'sent' to your registered email and "
            "expires in 24 hours. You'll be asked to set a new one at next "
            "sign-in. Nothing was really reset — this is a sample agent."
        )

    def _status(self, lowered: str) -> str:
        degraded = status_client.get_degraded()
        if not degraded:
            return "All monitored systems are reporting operational (sample data)."
        lines = [
            f"- {s['service']}: {s['status']} — {s['message']}" for s in degraded
        ]
        return (
            "Here's the current system status from the sample data:\n"
            + "\n".join(lines)
            + "\n\nSince this matches a known issue, no ticket is needed."
        )

    def _tickets(self, employee: dict[str, Any] | None) -> str:
        if not employee:
            return (
                "I can look up tickets once I know who you are. Share your work "
                "email and employee ID (for example, alice.chen@acmecorp.com / "
                "E-1001) and I'll pull the sample records."
            )
        rows = tickets_client.get_by_employee(employee["id"])[
            : self.cfg.max_tickets_per_query
        ]
        if not rows:
            return f"No tickets on file for {employee['name']} in the sample data."
        lines = [
            f"- {t['id']} [{t['status']}/{t['priority']}] {t['subject']}" for t in rows
        ]
        return f"Tickets for {employee['name']} (sample data):\n" + "\n".join(lines)

    def _software(self, employee: dict[str, Any] | None, text: str) -> str:
        who = self._who(employee)
        dept = employee["department"] if employee else "your department"
        return (
            f"Thanks, {who}. I've logged a software access request against "
            f"{dept} (demo only — no access was granted). Requests that need "
            "manager approval are routed automatically; you'll get an email "
            "when it's decided."
        )

    def _policy(self, lowered: str) -> str:
        docs = policies_client.search(query=lowered, limit=2)
        if not docs:
            return "I couldn't find a matching policy in the sample knowledge base."
        return "Relevant policies (sample data):\n" + "\n".join(
            f"- {d['title']}: {d['body']}" for d in docs
        )

    def _escalate(self, employee: dict[str, Any] | None) -> str:
        return (
            f"Understood, {self._who(employee)}. I've raised a demo escalation to "
            "L2 support with a summary of this conversation. Nothing was actually "
            "filed — this is a sample agent."
        )

    def _fallback(self) -> str:
        return (
            "I'm a demo IT helpdesk agent with a fixed set of canned answers. "
            "Try asking about a password reset, ticket status, software access, "
            "system outages, or an IT policy."
        )


def build_agent(cfg: Config) -> DummyAgent:
    return DummyAgent(cfg)


__all__ = ["DummyAgent", "build_agent"]
