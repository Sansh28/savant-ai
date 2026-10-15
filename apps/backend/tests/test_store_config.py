"""Regression for Motor database objects, whose truth-value test raises."""

import os
import subprocess
import sys
from pathlib import Path


def test_store_import_with_configured_mongodb():
    backend = Path(__file__).resolve().parents[1]
    env = {
        **os.environ,
        "MONGODB_URI": "mongodb://127.0.0.1:27197",
        "PYTHONPATH": str(backend / "src"),
    }
    result = subprocess.run(
        [sys.executable, "-c", (
            "from savant_backend import store; "
            "assert store.db is not None; "
            "assert store.documents_collection.name == 'documents'; "
            "assert store.document_chunks_collection.name == 'document_chunks'; "
            "assert store.jobs_collection.name == 'jobs'; "
            "store.client.close()"
        )],
        cwd=backend,
        env=env,
        capture_output=True,
        text=True,
        check=False,
    )
    assert result.returncode == 0, "Configured MongoDB store must import without truth-value errors"
