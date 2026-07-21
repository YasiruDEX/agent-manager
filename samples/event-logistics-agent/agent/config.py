"""
agent/config.py
---------------
Centralised settings for the Outdoor Event Logistics agent.
Reads from environment variables / .env file via pydantic-settings.
"""

from __future__ import annotations

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ── External LLM Provider (Agent Manager overrides) ───────────────────────
    use_llm_provider: bool = Field(
        default=False,
        description="Whether to use an external LLM provider.",
    )
    llm_provider_url: str = Field(
        default="",
        description="The base URL of the external LLM provider.",
    )
    llm_provider_key: str = Field(
        default="",
        description="The API key for the external LLM provider.",
    )

    # ── OpenAI ────────────────────────────────────────────────────────────────
    openai_api_key: str
    openai_model: str = "gpt-4o-mini"
    openai_timeout: float = Field(
        default=60.0,
        description="Timeout in seconds for OpenAI API calls.",
    )
    openai_max_retries: int = Field(
        default=3,
        description="Maximum retry attempts for OpenAI API calls.",
    )

    # ── Google Maps MCP ────────────────────────────────────────────────────────
    agent_mcp_1_url: str = Field(
        default="",
        description="Streamable-HTTP URL for the Google Maps MCP server.",
    )
    agent_mcp_1_api_key: str = Field(
        default="",
        description="X-Goog-Api-Key for the Google Maps MCP server.",
    )

    # ── OpenWeather (native, no MCP) ───────────────────────────────────────────
    openweather_api_key: str = Field(
        default="",
        description="OpenWeather One Call API 4.0 key (paid tier required).",
    )

    # ── Legacy / misc ──────────────────────────────────────────────────────────
    max_tool_rounds: int = Field(
        default=6,
        description="Maximum MCP tool-call rounds for the /chat endpoint.",
    )

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
