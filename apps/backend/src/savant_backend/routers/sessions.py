import uuid

from fastapi import APIRouter, Depends, HTTPException

from savant_backend import models, security, store
from savant_backend.services import backend_services as services

router = APIRouter()


@router.post("/sessions")
async def create_session(request: models.CreateSessionRequest, owner_id: str = Depends(security.get_owner_id)):
    services.require_database()
    session_id = str(uuid.uuid4())
    share_token = uuid.uuid4().hex[:12]
    now = services.now_utc()

    doc_filename = None
    if request.doc_id:
        document = await store.documents_collection.find_one(security.owner_filter(owner_id, doc_id=request.doc_id), {"filename": 1, "status": 1})
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        if document.get("status") != "ready":
            raise HTTPException(status_code=409, detail="Document is still processing")
        doc_filename = document.get("filename")

    session_doc = {
        "session_id": session_id,
        "owner_id": owner_id,
        "share_token": share_token,
        "doc_id": request.doc_id,
        "title": request.title or (doc_filename and f"Session: {doc_filename}") or "Untitled Session",
        "created_at": now,
        "updated_at": now,
    }
    await store.sessions_collection.insert_one(session_doc)
    return {
        "session_id": session_id,
        "share_token": share_token,
        "share_url": f"/share/{share_token}",
        "title": session_doc["title"],
    }


@router.get("/sessions/{session_id}")
async def get_session(session_id: str, owner_id: str = Depends(security.get_owner_id)):
    services.require_database()
    session = await store.sessions_collection.find_one(security.owner_filter(owner_id, session_id=session_id), {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    messages = await store.messages_collection.find(security.owner_filter(owner_id, session_id=session_id), {"_id": 0}).sort("created_at", 1).to_list(length=500)
    return {"session": session, "messages": messages}


@router.get("/share/{share_token}")
async def get_shared_session(share_token: str):
    services.require_database()
    session = await store.sessions_collection.find_one({"share_token": share_token}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Shared session not found")
    messages = await store.messages_collection.find({"session_id": session["session_id"]}, {"_id": 0}).sort("created_at", 1).to_list(length=500)
    return {"session": session, "messages": messages}


@router.get("/chat/conversations")
async def list_chat_conversations(owner_id: str = Depends(security.get_owner_id)):
    services.require_database()
    docs = await store.chat_conversations_collection.find(
        security.owner_filter(owner_id),
        {
            "_id": 0,
            "conversation_id": 1,
            "title": 1,
            "workspace_name": 1,
            "folder": 1,
            "pinned": 1,
            "doc_id": 1,
            "file_name": 1,
            "session_id": 1,
            "created_at": 1,
            "updated_at": 1,
            "logs": 1,
            "citations": 1,
            "telemetry": 1,
            "doc_meta": 1,
        },
    ).sort("updated_at", -1).to_list(length=500)
    return {"conversations": docs}


@router.post("/chat/conversations/{conversation_id}/state")
async def upsert_chat_conversation_state(
    conversation_id: str,
    request: models.ChatConversationStateRequest,
    owner_id: str = Depends(security.get_owner_id),
):
    services.require_database()
    if not request.title.strip():
        raise HTTPException(status_code=400, detail="title is required")

    if request.doc_id:
        doc = await store.documents_collection.find_one(security.owner_filter(owner_id, doc_id=request.doc_id), {"_id": 1, "status": 1})
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        if doc.get("status") != "ready":
            raise HTTPException(status_code=409, detail="Document is still processing")

    now = services.now_utc()
    update_doc = {
        "owner_id": owner_id,
        "title": request.title.strip()[:120],
        "workspace_name": (request.workspace_name or request.title).strip()[:120],
        "folder": (request.folder or "Inbox").strip()[:80],
        "pinned": bool(request.pinned),
        "doc_id": request.doc_id,
        "file_name": request.file_name,
        "session_id": request.session_id,
        "logs": request.logs[-500:],
        "citations": request.citations[:80],
        "telemetry": request.telemetry,
        "doc_meta": request.doc_meta,
        "updated_at": now,
    }
    await store.chat_conversations_collection.update_one(
        security.owner_filter(owner_id, conversation_id=conversation_id),
        {"$set": update_doc, "$setOnInsert": {"conversation_id": conversation_id, "created_at": now}},
        upsert=True,
    )
    return {"ok": True}


@router.get("/research-memory")
async def list_research_memory(owner_id: str = Depends(security.get_owner_id), doc_id: str | None = None):
    services.require_database()
    query = security.owner_filter(owner_id)
    if doc_id:
        query["doc_id"] = doc_id
    docs = await store.research_memory_collection.find(query, {"_id": 0}).sort("updated_at", -1).to_list(length=200)
    return {"memories": docs}


@router.post("/research-memory")
async def upsert_research_memory(request: models.ResearchMemoryUpsertRequest, owner_id: str = Depends(security.get_owner_id)):
    services.require_database()
    topic = request.topic.strip().lower()
    note = request.note.strip()
    if not topic or not note:
        raise HTTPException(status_code=400, detail="Both topic and note are required")
    now = services.now_utc()
    await store.research_memory_collection.update_one(
        security.owner_filter(owner_id, topic=topic, doc_id=request.doc_id),
        {
            "$set": {
                "owner_id": owner_id,
                "topic": topic[:120],
                "note": note[:3000],
                "doc_id": request.doc_id,
                "session_id": request.session_id,
                "tags": [tag.strip()[:40] for tag in request.tags if tag.strip()][:12],
                "updated_at": now,
            },
            "$setOnInsert": {"created_at": now, "mentions": 0},
        },
        upsert=True,
    )
    return {"ok": True}


@router.get("/analytics/summary")
async def analytics_summary(owner_id: str = Depends(security.get_owner_id)):
    services.require_database()
    events = await store.analytics_events_collection.find(security.owner_filter(owner_id), {"_id": 0}).to_list(length=2000)
    low_confidence_queries = sum(1 for event in events if event.get("event_type") == "query_completed" and event.get("payload", {}).get("low_confidence"))
    most_used_graph_nodes: dict[str, int] = {}
    for event in events:
        if event.get("event_type") == "graph_generated":
            doc_id = str(event.get("payload", {}).get("doc_id", ""))
            if doc_id:
                most_used_graph_nodes[doc_id] = most_used_graph_nodes.get(doc_id, 0) + 1
    return {
        "total_events": len(events),
        "low_confidence_queries": low_confidence_queries,
        "most_used_graph_docs": sorted(
            [{"doc_id": doc_id, "count": count} for doc_id, count in most_used_graph_nodes.items()],
            key=lambda item: item["count"],
            reverse=True,
        )[:10],
    }


@router.patch("/chat/conversations/{conversation_id}")
async def rename_chat_conversation(
    conversation_id: str,
    request: models.ChatConversationRenameRequest,
    owner_id: str = Depends(security.get_owner_id),
):
    services.require_database()
    title = request.title.strip()
    if not title:
        raise HTTPException(status_code=400, detail="title is required")
    result = await store.chat_conversations_collection.update_one(
        security.owner_filter(owner_id, conversation_id=conversation_id),
        {"$set": {"title": title[:120], "updated_at": services.now_utc()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"ok": True}


@router.delete("/chat/conversations/{conversation_id}")
async def delete_chat_conversation(conversation_id: str, owner_id: str = Depends(security.get_owner_id)):
    services.require_database()
    result = await store.chat_conversations_collection.delete_one(security.owner_filter(owner_id, conversation_id=conversation_id))
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"ok": True}
