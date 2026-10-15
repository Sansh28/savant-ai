# Savant Architecture

## Overview

Savant is a three-surface research assistant:

- `apps/backend/`: FastAPI service for ingestion, retrieval, graph generation, session storage, and optional payment verification
- `apps/frontend/`: Next.js web client for paper upload, chat, citations, voice, and graph exploration
- `apps/extension/`: Chrome side-panel extension that extracts context from supported research pages and renders concept graphs

## Runtime Flow

### 1. PDF upload and ingestion

1. The frontend uploads a PDF to `POST /upload`, which returns a document/job ID.
2. The backend extracts page text with `PyPDF2`.
3. Page text is chunked and, when vector search is enabled, embedded with Gemini.
4. Chunks are stored in MongoDB Atlas with page and chunk metadata.
5. The frontend polls the job and exposes the document only after ingestion completes.
   The isolated local setup uses standard MongoDB with explicit lexical retrieval.

### 2. Document question answering

1. The frontend sends a prompt to `POST /query`.
2. The backend embeds the question when possible.
3. MongoDB vector search retrieves candidate chunks.
4. Lexical fallback reranking supplements retrieval when needed.
5. Gemini synthesizes an answer from retrieved context labeled with PDF page/chunk
   identifiers. Citation snippets select a query-relevant passage from each chunk.
6. ElevenLabs audio is generated when configured.

### 3. Graph exploration

1. The frontend or extension fetches paper context text.
2. The backend calls Gemini to extract graph nodes and edges.
3. The frontend or extension renders a graph UI and supports concept-level follow-up questions.

### 4. Browser extension flow

1. The extension runs only on supported paper hosts.
2. It extracts abstract/body text from the active page.
3. It calls backend graph endpoints using the configured API base URL.
4. If graph generation fails, it falls back to a local heuristic graph.

## Data Model

### MongoDB collections

- `documents`: paper chunks, filename, page number, chunk index, optional embedding
- `payments`: verified Solana payment receipts
- `sessions`: shared chat sessions
- `session_messages`: saved Q/A messages per session
- `graph_sessions`: saved graph exploration sessions
- `graph_messages`: per-node graph conversation history
- `chat_conversations`: persisted frontend conversation state

## Architectural Strengths

- Clear product split between backend, web app, and extension
- Good fallback behavior when embeddings or generation are rate-limited
- Practical retrieval pipeline with vector plus lexical behavior
- Shared graph concept across both frontend and extension surfaces

## Current Constraints

- The backend package under `apps/backend/src/savant_backend/` is the main orchestration layer and should keep moving toward thinner routers and more isolated services
- The large frontend components still carry too much UI and state logic in single files
- Backend-issued signed client sessions and owner-scoped queries exist; these are
  not a full user-account identity system. Browser bootstrap requests are shared
  between concurrent callers, and invalidated tokens refresh once.
- Ingestion/graph task execution is process-local; persisted job records are not
  equivalent to a durable worker with restart recovery.
- Unit/API/component suites are supplemented by a recorded local MongoDB/Gemini
  browser run; hosted operation and Atlas vector retrieval remain separate gates.

## Recommended Next Refactor Phases

### Phase 2

- Split backend routes into router modules
- Extract backend services for ingestion, retrieval, graph, and payments
- Add shared API helpers for frontend and extension

### Phase 3

- Evolve client sessions into production account authentication and review sharing
- Add request logging, rate limiting, and safer sharing semantics
- Add file-size and abuse protections for uploads

### Phase 4

- Expand live integration coverage beyond the recorded public-paper scenario
- Add retrieval/citation evaluation over a fixed question set
- Validate hosted backend operation, durable jobs, and Atlas index configuration

See [local setup](LOCAL_DEMO.md) and [verification record](DEMO_VERIFICATION.md).
