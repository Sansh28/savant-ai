"""Start an isolated local backend; never inherit another project's database."""

import os
import secrets
import subprocess
import sys
from pathlib import Path

from dotenv import dotenv_values

backend = Path(__file__).resolve().parents[1] / "apps" / "backend"
env_file = Path(os.environ.get("SAVANT_ENV_FILE", str(backend / ".env")))
values = dotenv_values(env_file) if env_file.exists() else {}
key = values.get("GEMINI_API_KEY") or os.environ.get("GEMINI_API_KEY")
if not key or key == "your_gemini_api_key":
    raise SystemExit("Set GEMINI_API_KEY in apps/backend/.env or specify SAVANT_ENV_FILE. Never paste keys into chat.")

# Keep local client sessions usable across process restarts. This ignored file
# contains only a generated demo signing secret and is never published.
secret_path = backend / ".env.local-auth"
if not secret_path.exists():
    descriptor = os.open(secret_path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(descriptor, "w") as secret_file:
        secret_file.write(secrets.token_urlsafe(48))

env = {
    **os.environ,
    "GEMINI_API_KEY": key,
    "MONGODB_URI": "mongodb://127.0.0.1:27197",
    "AUTH_SECRET": secret_path.read_text().strip(),
    "CORS_ALLOW_ORIGINS": "http://127.0.0.1:3197,http://localhost:3197",
    "REQUIRE_SOLANA_PAYMENT": "false",
    "GEMINI_MODEL": values.get("GEMINI_MODEL") or "gemini-2.5-flash",
    "EMBED_MAX_RETRIES": "1",
    "GENERATE_MAX_RETRIES": "1",
    "ALLOW_GENERATE_LOCAL_FALLBACK": "false",
    "VECTOR_SEARCH_ENABLED": "false",
    "ELEVENLABS_API_KEY": "",
}
print("Starting local Savant backend on 127.0.0.1:8197 with dedicated local MongoDB.", flush=True)
raise SystemExit(subprocess.call(
    [sys.executable, "-m", "uvicorn", "savant_backend.main:app", "--app-dir", "src", "--host", "127.0.0.1", "--port", "8197", "--reload"],
    cwd=backend,
    env=env,
))
