import sys
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from fastapi import HTTPException

from savant_backend import config, demo_limits, store


class DemoLimitTests(unittest.IsolatedAsyncioTestCase):
    async def test_disabled_does_not_access_database(self):
        with patch.object(config.settings, "PUBLIC_DEMO", False), patch.object(store, "db", None):
            await demo_limits.charge_provider_call("generation")

    async def test_public_demo_fails_closed_without_database(self):
        with patch.object(config.settings, "PUBLIC_DEMO", True), patch.object(store, "db", None):
            with self.assertRaises(HTTPException) as error:
                await demo_limits.charge_provider_call("generation")
            self.assertEqual(error.exception.status_code, 503)

    async def test_counter_is_shared_by_day_not_owner(self):
        update = AsyncMock(return_value={"calls": 1})
        db = SimpleNamespace(demo_usage=SimpleNamespace(find_one_and_update=update))
        with patch.object(config.settings, "PUBLIC_DEMO", True), patch.object(store, "db", db):
            await demo_limits.charge_provider_call("generation")
        args, kwargs = update.call_args
        self.assertTrue(args[0]["_id"].endswith(":generation"))
        self.assertEqual(args[1]["$inc"], {"calls": 1})
        self.assertTrue(kwargs["upsert"])

    async def test_quota_exhaustion_rejects_provider_call(self):
        update = AsyncMock(return_value={"calls": 61})
        db = SimpleNamespace(demo_usage=SimpleNamespace(find_one_and_update=update))
        with patch.object(config.settings, "PUBLIC_DEMO", True), patch.object(store, "db", db):
            with self.assertRaises(HTTPException) as error:
                await demo_limits.charge_provider_call("generation")
            self.assertEqual(error.exception.status_code, 429)

    async def test_database_error_fails_closed(self):
        update = AsyncMock(side_effect=RuntimeError("database unavailable"))
        db = SimpleNamespace(demo_usage=SimpleNamespace(find_one_and_update=update))
        with patch.object(config.settings, "PUBLIC_DEMO", True), patch.object(store, "db", db):
            with self.assertRaises(HTTPException) as error:
                await demo_limits.charge_provider_call("embedding")
            self.assertEqual(error.exception.status_code, 503)
