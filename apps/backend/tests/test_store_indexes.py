import sys
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from savant_backend import config, store


class StoreIndexTests(unittest.IsolatedAsyncioTestCase):
    async def test_unique_indexes_exclude_ownerless_legacy_records(self):
        names = [
            "documents_collection", "document_chunks_collection", "jobs_collection",
            "sessions_collection", "messages_collection", "graph_sessions_collection",
            "graph_messages_collection", "chat_conversations_collection",
        ]
        collections = {name: SimpleNamespace(create_index=AsyncMock()) for name in names}
        with patch.object(store, "db", object()), patch.object(config.settings, "PUBLIC_DEMO", False):
            with patch.multiple(store, **collections):
                await store.ensure_indexes()
        unique_count = 0
        for collection in collections.values():
            for call in collection.create_index.call_args_list:
                if call.kwargs["unique"]:
                    unique_count += 1
                    self.assertEqual(call.kwargs["partialFilterExpression"], {"owner_id": {"$type": "string"}})
                    self.assertTrue(call.kwargs["name"].startswith("owned_"))
        self.assertEqual(unique_count, 5)
