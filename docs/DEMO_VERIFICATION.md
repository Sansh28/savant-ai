# Savant demo verification — October 15, 2026

## Hosted verification

- Web: https://hackcu12.vercel.app/ (Vercel, apps/frontend, Next.js).
- API: https://savant-api-fo6z.onrender.com (Render Free, Python 3.12, one worker).
- Atlas Cluster0: vector_index on savant.document_chunks, READY/queryable, 3072-dimensional cosine vectors with owner_id/doc_id/page_number filter fields.
- Public input: *Attention Is All You Need*, arXiv 1706.03762. Uploaded through the actual public browser UI and independently through the HTTPS API.
- Both hosted ingestions: 15 pages, 39 chunks. API metadata confirmed 39 embedded chunks, zero lexical-only chunks, no embedding fallback.
- Browser question: why the Transformer uses positional encoding. Real Gemini answer cited PDF page 6 / section 3.5; five evidence cards, including Atlas score 0.8878. Retrieval mode hybrid. Independent API run also returned five citations and nonzero vector scores, with llm_fallback=false.
- Browser graph: 16 concepts, 20 connections, selected Positional Encoding, bookmarked it, and received a Gemini follow-up. Reload restored document, answer, citations, cached graph, selected concept, and bookmark.
- Hosted boundary checks: other-owner document access 404; no-token document/graph access 401; upload exceeding 10 MB rejected 413; expected frontend CORS origin allowed, untrusted origin rejected 400.
- Backend regression suite: 22 passed, Ruff passed. Frontend: 11 passed, TypeScript and ESLint passed. Dedicated regression tests cover owner-scoped legacy-compatible indexes and saved concept conversations.

Deployment diagnosis: a second leftover URI-template line caused InvalidURI at process import. Once removed, startup reached Atlas but failed on duplicate legacy documents without owner IDs. Named partial unique indexes now enforce owner-scoped uniqueness without deleting or adopting legacy records. Gemini credentials are service secrets, never browser variables or committed files. The owner approved replacing Atlas's all-IP rule with Render's two egress ranges; the existing university entry was preserved.

Public demo protections: explicit CORS, unique signing secret, signed sessions and owner filters, bounded PDF/graph/query inputs, and persistent shared daily Gemini attempt caps (including retries). These are not full account authentication, comprehensive abuse protection, or provider-level spending guarantees. The new graph follow-up change passes session/node IDs and restores role-based history; the final hosted recheck is recorded in the walkthrough.

Limits: free-host cold starts and restarts; in-process jobs are not durable; shared daily quotas can be exhausted; content is stored in Atlas and sent to Google; public non-sensitive uploads only. ElevenLabs and payments are not enabled. Browser speech is optional. The Chrome extension and paid integrations were not exercised in this hosted run. No accuracy, scalability, uptime, or production-readiness benchmark is claimed.

## Earlier local verification

## Environment and boundaries

- Local web: 127.0.0.1:3197, same-origin API proxy to 127.0.0.1:8197.
- Dedicated MongoDB 7 container, exposed only on 127.0.0.1:27197.
- Python 3.12; local Node 26.8.1/npm 11.19.0.
- Real Gemini answer/graph generation; local answer fallback disabled.
- Explicit lexical retrieval, with no Atlas vector index in this run.
- Public input: Vaswani et al., *Attention Is All You Need*,
  https://arxiv.org/abs/1706.03762 (PDF downloaded from arXiv).
- Browser: Codex in-app browser. No Chrome/version equivalence is claimed.

## Observed browser workflow

1. Upload parsed all 15 PDF pages into 39 chunks in the local database.
2. A question about positional encoding returned a real Gemini answer with five
   retrieved citation cards; its page-6 reference matched the source section.
3. The expanded citation displayed the relevant positional-encoding passage.
4. Jump to Evidence set the follow-up page filter to 6; it is not a PDF viewer.
5. The generated graph rendered 16 concepts and 19 connections.
6. Selecting Positional Encoding opened its summary; bookmarking saved the node.
7. Reload restored the conversation, answer/citations, cached graph, selected
   concept, and one bookmark, without regenerating the graph.

The recorded numbers describe one local run. They are not quality, speed, scale,
or production benchmarks. The UI labels local lexical retrieval as degraded;
Gemini synthesis remains the primary model path. Audio provider integration and
hosted Atlas vector search were not verified.

## Automated checks

- Backend: 16 tests passed; Ruff passed.
- Frontend: 9 tests passed; TypeScript, ESLint, production build passed.
- Extension: 7 tests passed; typecheck and build passed.
- Clean frontend installation succeeded after lockfile repair.

Regressions cover configured MongoDB import, page-labeled model context,
query-relevant citation excerpts, lexical mode without Atlas, queued-document
readiness, conversation switching, token refresh/bootstrap, and restored graphs.
Mocked tests and the live browser run are distinct evidence.

## Repairs made

- Corrected Motor database truth-value checks that blocked configured startup.
- Repaired frontend lockfile optional dependencies and Node 26 test storage.
- Added a pinned Python development/test environment and isolated local launcher.
- Added the same-origin web/API proxy and local MongoDB Compose definition.
- Delayed document availability until ingestion completes; lengthened job polling.
- Removed state-hydration and deferred-updater races from conversation/graph flows.
- Added graph retry, shared session bootstrap, and one-time invalid-token refresh.
- Added page/chunk labels to generation context and relevant citation excerpts.
- Kept provider keys in request headers rather than query URLs.

No production secrets were committed, no private repository became public, and
no hosted backend or cloud database was provisioned by this verification.
