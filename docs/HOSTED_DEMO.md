# Hosted demo deployment gate

This is a deployment checklist, not a claim that the public demo is live.

## Frontend: existing Vercel project

- Repository: `Sansh28/savant-ai`, production branch `main`.
- Root directory: `apps/frontend`; framework: Next.js.
- Install: `npm ci`; build: `npm run build`.
- Set `NEXT_PUBLIC_API_BASE_URL=/api/backend`.
- Set server-only `SAVANT_API_ORIGIN` to the HTTPS backend origin, without a trailing slash.
- Redeploy after changing either variable. Never place provider keys in `NEXT_PUBLIC_*` variables.

## Backend: persistent Python service

The ingestion and graph jobs run in-process. Use a persistent web service, not a short-lived function. Keep a single process/worker until durable jobs and shared throttling are implemented. Restarts can interrupt active jobs.

- Root: `apps/backend`; Python 3.12.
- Install: `pip install -r requirements-ci.lock.txt`.
- Start: `uvicorn savant_backend.main:app --app-dir src --host 0.0.0.0 --port "$PORT" --workers 1`.
- Health endpoint: `/healthz`. Current `/readyz` checks configuration presence, not provider connectivity.
- Configure `MONGODB_URI`, `GEMINI_API_KEY`, a unique random `AUTH_SECRET`, and `CORS_ALLOW_ORIGINS` for the actual frontend origin in the host's secret manager.
- Set `VECTOR_SEARCH_ENABLED=true`, `EMBED_ALLOW_LEXICAL_FALLBACK=false`, `ALLOW_GENERATE_LOCAL_FALLBACK=false`, `REQUIRE_SOLANA_PAYMENT=false` for an honest Atlas verification run.
- Leave optional voice/payment credentials unset unless those features are explicitly being enabled.

Before public exposure, add enforceable global cost/request and upload-size limits. Session-only throttling is not sufficient: anonymous sessions can be reissued, and the standalone graph extraction routes currently lack an authentication dependency. Apply expiry/cleanup to uploaded documents and disclose that uploads are sent to MongoDB and Google. Do not advertise this as production-ready account authentication or durable job execution.

## Atlas vector index

Create a **Vector Search** index named `vector_index` on `savant.document_chunks`, using [`atlas-vector-index.json`](../apps/backend/atlas-vector-index.json). The JSON is the index definition, not a full CLI request. Wait until it is queryable. Do not overwrite an existing incompatible index without reviewing its users.

The current `gemini-embedding-001` endpoint returned HTTP 200 and a 3072-dimensional vector during the deployment preflight on 2026-10-15. Stored and query vectors must use the same model/dimension. The index includes all three fields used by the API's prefilter, including the owner-isolation field. Configure database access for the backend's egress addresses; do not open the cluster to all IPs just to bypass setup.

References: [MongoDB index fields](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type/), [Google embeddings](https://ai.google.dev/gemini-api/docs/embeddings), [Render port binding](https://render.com/docs/web-services#port-binding).

## Publish only after hosted verification

1. Open the public frontend in a fresh session and upload a public PDF.
2. Wait for ingestion; verify stored chunks have 3072-dimensional embeddings and the index is queryable.
3. Ask a question; confirm nonempty Atlas vector results, a grounded answer, and a citation matching the PDF page. A successful answer alone does not establish that Atlas retrieval worked.
4. Generate and interact with the graph; reload and verify restoration.
5. Confirm a separate client cannot read the first client's document; verify anonymous requests, size limits, and quota exhaustion fail safely.
6. Capture the working hosted app. Only then update the repository homepage, source README, profile README, and walkthrough with the verified demo URL.
