# Run the connected local Savant demo

This setup uses real PDF parsing, a dedicated MongoDB instance, lexical retrieval,
and Gemini answer/graph generation. It does not require Atlas, paid voice, or a
wallet. Local answer synthesis fallback is disabled so provider failures stay
visible. Use a public or non-confidential PDF: document context is sent to Gemini.

## Prerequisites

- Docker, Python 3.12, and a Node.js version supported by Next.js 16 (20.9+).
- A valid Gemini API key available in an ignored environment file.
- Free local ports 27197 (MongoDB), 8197 (API), and 3197 (web).

## 1. Database

From the repository root:

```sh
docker compose -f compose.local.yml up -d
```

Only loopback exposes MongoDB. The named volume is separate from other projects.
Do not point this demo at a production database. If port 27197 is already in use,
check for an existing Savant demo database before starting another instance.

## 2. Backend

```sh
python3.12 -m venv apps/backend/.venv
apps/backend/.venv/bin/pip install -r apps/backend/requirements-ci.lock.txt
cp apps/backend/.env.example apps/backend/.env
```

Set `GEMINI_API_KEY` in `apps/backend/.env`, then run:

```sh
apps/backend/.venv/bin/python scripts/local-backend.py
```

Alternatively, `SAVANT_ENV_FILE=/absolute/path/to/existing/.env` selects an existing
key file. The launcher reads only the needed Gemini configuration, always uses
the dedicated loopback database, creates an ignored mode-600 local signing secret,
and disables payments and ElevenLabs. It never copies another project's database
connection or publishes its key. The generated secret persists across restarts.

## 3. Web — another terminal

```sh
cd apps/frontend
npm ci
cp .env.example .env.local
npm run dev -- --hostname 127.0.0.1 --port 3197
```

Open http://127.0.0.1:3197. The frontend calls `/api/backend`; Next.js proxies it to
the server-only `SAVANT_API_ORIGIN`. This keeps browser requests on one origin.
`GET http://127.0.0.1:8197/healthz` checks the API process. Current `/readyz` checks
configuration presence, not provider connectivity; verify a real upload/query.

## 4. Exercise the complete flow

1. Create a workspace and upload a text-based PDF.
2. Wait for the ingestion job to finish. The document becomes available only
   after chunks are stored; the UI allows up to six minutes for long jobs.
3. Ask a specific question, then inspect the returned page citation and excerpt.
4. Open Paper Graph Explorer, select a concept, and bookmark it.
5. Reload and revisit the same workspace to check persisted answer/graph state.

Standard MongoDB does not implement Atlas `$vectorSearch`. The local launcher
sets `VECTOR_SEARCH_ENABLED=false`, skips embeddings, and reports `lexical_only`.
Gemini still generates answers and concept graphs. To validate semantic retrieval,
configure Atlas and its vector/filter index separately with vector search enabled.
Do not describe this local run as an Atlas vector-search demonstration.

## Checks

```sh
cd apps/backend
.venv/bin/ruff check src tests ../../scripts/local-backend.py
.venv/bin/python -m pytest tests -q
```

In `apps/frontend`, run `npm test`, `npm run typecheck`, `npm run lint`, and
`npm run build`. These suites use fixtures/mocks; the browser exercise above is
the separate live MongoDB/Gemini verification.

## Stop and recovery

Stop web/API terminals with Ctrl-C. Stop the Compose service with
`docker compose -f compose.local.yml stop`; the data volume is preserved. Do not
delete the volume to repair a connection problem. The local signing secret must
also be preserved to keep existing client sessions valid.

This is a local development workflow. Hosted backend deployment, production
identity, abuse controls, durable background workers, and operational readiness
remain separate work.
