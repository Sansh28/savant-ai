from elevenlabs.client import ElevenLabs
from motor.motor_asyncio import AsyncIOMotorClient

from savant_backend import config

client = AsyncIOMotorClient(config.MONGODB_URI) if config.MONGODB_URI else None
db = client.savant if client else None

documents_collection = db.documents if db is not None else None
document_chunks_collection = db.document_chunks if db is not None else None
jobs_collection = db.jobs if db is not None else None
payments_collection = db.payments if db is not None else None
sessions_collection = db.sessions if db is not None else None
messages_collection = db.session_messages if db is not None else None
graph_sessions_collection = db.graph_sessions if db is not None else None
graph_messages_collection = db.graph_messages if db is not None else None
chat_conversations_collection = db.chat_conversations if db is not None else None

elevenlabs_client = ElevenLabs(api_key=config.ELEVENLABS_API_KEY) if config.ELEVENLABS_API_KEY else None


async def ensure_indexes() -> None:
    if db is None:
        return

    if config.settings.PUBLIC_DEMO:
        await db.demo_usage.create_index("expires_at", expireAfterSeconds=0)

    collections = [
        (documents_collection, [("owner_id", 1), ("doc_id", 1)], True),
        (documents_collection, [("owner_id", 1), ("status", 1), ("updated_at", -1)], False),
        (document_chunks_collection, [("owner_id", 1), ("doc_id", 1), ("page_number", 1), ("chunk_index", 1)], False),
        (document_chunks_collection, [("owner_id", 1), ("doc_id", 1)], False),
        (jobs_collection, [("owner_id", 1), ("job_id", 1)], True),
        (jobs_collection, [("owner_id", 1), ("doc_id", 1), ("job_type", 1), ("created_at", -1)], False),
        (sessions_collection, [("owner_id", 1), ("session_id", 1)], True),
        (messages_collection, [("owner_id", 1), ("session_id", 1), ("created_at", 1)], False),
        (graph_sessions_collection, [("owner_id", 1), ("session_id", 1)], True),
        (graph_sessions_collection, [("owner_id", 1), ("doc_id", 1)], False),
        (graph_messages_collection, [("owner_id", 1), ("session_id", 1), ("node_id", 1), ("created_at", 1)], False),
        (chat_conversations_collection, [("owner_id", 1), ("conversation_id", 1)], True),
    ]

    for collection, keys, unique in collections:
        if collection is None or not hasattr(collection, "create_index"):
            continue
        options = {"unique": unique}
        if unique:
            # Legacy hackathon records have no owner and can contain duplicate
            # IDs. Preserve them while enforcing isolation-era uniqueness for
            # every authenticated owner's records. Queries never adopt legacy data.
            options["partialFilterExpression"] = {"owner_id": {"$type": "string"}}
            options["name"] = "owned_" + "_".join(key for key, _ in keys) + "_unique_v1"
        await collection.create_index(keys, **options)
