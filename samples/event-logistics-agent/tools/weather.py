"""
tools/weather.py
----------------
Native OpenWeather One Call API 3.0 integration tool.

Provides fetch_weather_data(), an async function that calls the
timemachine endpoint directly using httpx — NO MCP server required.

API endpoint:
  GET https://api.openweathermap.org/data/3.0/onecall/timemachine
  Params: lat, lon, dt (unix UTC timestamp), appid, units=metric

Response schema (relevant fields):
  {
    "lat": 51.5, "lon": -0.1, "timezone": "Europe/London",
    "data": [
      {
        "dt": 1777460400,
        "sunrise": 1777437375,
        "sunset": 1777480000,
        "moon_phase": 0.43,
        "temp": 18.5,
        "feels_like": 17.2,
        "humidity": 72,
        "wind_speed": 4.1,
        "wind_gust": 6.8,
        "clouds": 45,
        "uvi": 5.2,
        "weather": [{"id": 800, "main": "Clear", "description": "clear sky"}],
        "rain": {"1h": 0.0},
        "snow": {"1h": 0.0},
        "pop": 0.1
      }
    ]
  }
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

import httpx

from agent.config import settings

logger = logging.getLogger(__name__)

_OPENWEATHER_TIMEMACHINE_URL = (
    "https://api.openweathermap.org/data/2.5/weather"
)


# ---------------------------------------------------------------------------
# Date helpers
# ---------------------------------------------------------------------------


def _date_to_unix_utc(date_str: str) -> int:
    """
    Convert 'YYYY-MM-DD' to a Unix UTC timestamp at noon of that day.
    Noon is used as a stable representative time for a full-day weather read.
    """
    dt = datetime.strptime(date_str, "%Y-%m-%d").replace(
        hour=12, minute=0, second=0, tzinfo=timezone.utc
    )
    return int(dt.timestamp())


def _ts_to_utc_str(timestamp: int | None) -> str | None:
    """Convert a Unix timestamp to a human-readable UTC string."""
    if timestamp is None:
        return None
    try:
        return datetime.fromtimestamp(timestamp, tz=timezone.utc).strftime(
            "%Y-%m-%d %H:%M UTC"
        )
    except Exception:
        return None


# ---------------------------------------------------------------------------
# Payload parser
# ---------------------------------------------------------------------------


def _parse_weather_payload(payload: dict) -> dict:
    """
    Extract risk-relevant fields from the OpenWeather 3.0 timemachine response.

    Returns a structured dict with:
      - lat, lon, timezone
      - raw_data    – list of parsed data-point dicts
      - summary     – aggregated risk signals from the first data point
      - request_params – echo of the request params for traceability
    """
    result: dict[str, Any] = {
        "lat": payload.get("lat"),
        "lon": payload.get("lon"),
        "timezone": payload.get("timezone"),
        "raw_data": [],
        "summary": {},
    }

    parsed_points: list[dict] = []
    
    # Handle standard 2.5/weather format fallback
    data_list = payload.get("data", [])
    if not data_list and "weather" in payload:
        main = payload.get("main", {})
        sys = payload.get("sys", {})
        wind = payload.get("wind", {})
        clouds = payload.get("clouds", {})
        
        dp = {
            "dt": payload.get("dt"),
            "sunrise": sys.get("sunrise"),
            "sunset": sys.get("sunset"),
            "temp": main.get("temp"),
            "feels_like": main.get("feels_like"),
            "humidity": main.get("humidity"),
            "wind_speed": wind.get("speed"),
            "wind_gust": wind.get("gust"),
            "clouds": clouds.get("all"),
            "weather": payload.get("weather", []),
            "rain": payload.get("rain", 0),
            "snow": payload.get("snow", 0),
            "pop": 0,
            "visibility": payload.get("visibility"),
        }
        data_list = [dp]

    for dp in data_list:
        rain_raw = dp.get("rain", 0)
        snow_raw = dp.get("snow", 0)

        parsed = {
            "dt": dp.get("dt"),
            "dt_utc": _ts_to_utc_str(dp.get("dt")),
            "sunrise": dp.get("sunrise"),
            "sunrise_utc": _ts_to_utc_str(dp.get("sunrise")),
            "sunset": dp.get("sunset"),
            "sunset_utc": _ts_to_utc_str(dp.get("sunset")),
            "moon_phase": dp.get("moon_phase"),
            "temp_c": dp.get("temp"),
            "feels_like_c": dp.get("feels_like"),
            "humidity_pct": dp.get("humidity"),
            "wind_speed_ms": dp.get("wind_speed"),
            "wind_gust_ms": dp.get("wind_gust"),
            "cloud_cover_pct": dp.get("clouds"),
            "uvi": dp.get("uvi"),
            "visibility_m": dp.get("visibility"),
            "conditions": dp.get("weather", []),
            "rain_mm": rain_raw.get("1h", 0) if isinstance(rain_raw, dict) else rain_raw,
            "snow_mm": snow_raw.get("1h", 0) if isinstance(snow_raw, dict) else snow_raw,
            "precipitation_probability_pct": round(
                (dp.get("pop") or 0) * 100, 1
            ),
        }
        parsed_points.append(parsed)

    result["raw_data"] = parsed_points

    # Aggregate risk signals from the first (and usually only) data point
    if parsed_points:
        dp0 = parsed_points[0]
        result["summary"] = {
            "sunrise_utc": dp0["sunrise_utc"],
            "sunset_utc": dp0["sunset_utc"],
            "temp_c": dp0["temp_c"],
            "feels_like_c": dp0["feels_like_c"],
            "humidity_pct": dp0["humidity_pct"],
            "wind_speed_ms": dp0["wind_speed_ms"],
            "wind_gust_ms": dp0["wind_gust_ms"],
            "cloud_cover_pct": dp0["cloud_cover_pct"],
            "precipitation_probability_pct": dp0["precipitation_probability_pct"],
            "rain_mm": dp0["rain_mm"],
            "snow_mm": dp0["snow_mm"],
            "uvi": dp0["uvi"],
            "moon_phase": dp0["moon_phase"],
            "conditions": dp0["conditions"],
        }

    return result


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


async def fetch_weather_data(lat: float, lon: float, event_date: str) -> dict:
    """
    Fetch and parse OpenWeather 3.0 One-Call timemachine data for a given
    location and date.

    Parameters
    ----------
    lat : float
        Latitude of the venue.
    lon : float
        Longitude of the venue.
    event_date : str
        Event date in 'YYYY-MM-DD' format.

    Returns
    -------
    dict
        Parsed weather data including a 'summary' dict of key risk signals.

    Raises
    ------
    RuntimeError   if OPENWEATHER_API_KEY is not configured.
    ValueError     if event_date cannot be parsed.
    httpx.HTTPStatusError
                   if the API returns a non-2xx status.
    """
    api_key = settings.openweather_api_key
    if not api_key:
        raise RuntimeError(
            "OPENWEATHER_API_KEY is not set. "
            "A paid OpenWeather One Call API 3.0 subscription is required."
        )

    try:
        dt_unix = _date_to_unix_utc(event_date)
    except ValueError as exc:
        raise ValueError(f"Invalid event_date '{event_date}': {exc}") from exc

    params = {
        "lat": lat,
        "lon": lon,
        "dt": dt_unix,
        "appid": api_key,
        "units": "metric",
    }

    logger.info(
        "[weather] GET timemachine: lat=%s lon=%s dt=%s (%s)",
        lat,
        lon,
        dt_unix,
        event_date,
    )

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(_OPENWEATHER_TIMEMACHINE_URL, params=params)
        response.raise_for_status()
        payload = response.json()

    weather_data = _parse_weather_payload(payload)
    weather_data["request_params"] = {
        "lat": lat,
        "lon": lon,
        "event_date": event_date,
        "dt_unix": dt_unix,
    }

    logger.info("[weather] Parsed %d data points.", len(weather_data.get("raw_data", [])))
    return weather_data
