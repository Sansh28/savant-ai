# Hosted demo deployment gate

The [public demo](https://hackcu12.vercel.app/) was verified on October 15, 2026. See [the verification record](DEMO_VERIFICATION.md) for evidence and boundaries. This checklist also documents how to reproduce the deployment.

## Frontend: existing Vercel project

- Repository: `Sansh28/savant-ai`, production branch `main`.
- Root directory: `apps/frontend`; framework: Next.js.
- Install: `npm ci`; build: `npm run build`.
- Hosted configuration: `NEXT_PUBLIC_API_BASE_URL=https://savant-api-fo6z.onrender.com` (direct HTTPS API; backend CORS allows the frontend origin).
- For same-origin proxy deployments instead, use `NEXT_PUBLIC_API_BASE_URL=/api/backend` and server-only `SAVANT_API_ORIGIN` pointing at the HTTPS backend. Do not mix the two paths unintentionally.
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

Set `PUBLIC_DEMO=true` to enforce the shared, MongoDB-persisted daily provider-call budgets (default 60 generation attempts and 300 embedding attempts, including retries). These caps apply across anonymous sessions and persist across service restarts; quota failures stop provider calls. Public mode also rejects the development signing secret and wildcard CORS origins at startup. PDF uploads are limited to 10 MB, graph inputs are bounded, and standalone graph extraction requires a signed session. The daily budget is shared, so one visitor can exhaust it for others; this is not a per-person entitlement or a provider-level dollar cap.

Before promoting the demo, apply expiry/cleanup to uploaded documents and disclose that uploads are sent to MongoDB and Google. Do not advertise this as production-ready account authentication or durable job execution. Free Render services sleep after inactivity and can take about a minute to wake; disclose this beside the demo link.

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
