# Connected local demo verification — October 15, 2026

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
