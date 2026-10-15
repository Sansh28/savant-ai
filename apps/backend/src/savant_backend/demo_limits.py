"""Persistent provider-call caps for the anonymous public demo, shared across sessions."""

from datetime import UTC, datetime, timedelta

from fastapi import HTTPException
from pymongo import ReturnDocument

from savant_backend import config, store


async def charge_provider_call(kind: str) -> None:
    if not config.settings.PUBLIC_DEMO:
        return
    if store.db is None:
        raise HTTPException(503, "Public demo database is unavailable")
    now = datetime.now(UTC)
    limit = (config.settings.DEMO_EMBEDDING_CALLS_PER_DAY if kind == "embedding"
             else config.settings.DEMO_GENERATION_CALLS_PER_DAY)
    try:
        usage = await store.db.demo_usage.find_one_and_update(
            {"_id": f"{now.date().isoformat()}:{kind}"},
            {"$inc": {"calls": 1}, "$setOnInsert": {"expires_at": now + timedelta(days=2)}},
            upsert=True,
            return_document=ReturnDocument.AFTER,
        )
    except Exception as exc:
        raise HTTPException(503, "Public demo quota check unavailable; retry later") from exc
    if usage["calls"] > limit:
        raise HTTPException(429, "The shared public demo AI quota is exhausted. Please try tomorrow.")
