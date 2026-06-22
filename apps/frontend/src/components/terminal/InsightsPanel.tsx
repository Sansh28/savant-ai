import type { Citation, DocMeta, QueryTelemetry } from "@/components/terminal/types";

type ExportFormat = "markdown" | "notion" | "pdf";

type InsightsPanelProps = {
  activeCitationIndex: number | null;
  citations: Citation[];
  docMeta: DocMeta | null;
  hasDocument: boolean;
  telemetry: QueryTelemetry | null;
  onExport: (format: ExportFormat) => void;
  onFocusCitation: (citation: Citation, index: number) => void;
};

function fallbackSummary(telemetry: QueryTelemetry | null): string | null {
  if (!telemetry) return null;
  if (telemetry.retrieval_mode === "lexical_only" && telemetry.llm_fallback) {
    return "The answer used lexical retrieval and local synthesis fallback, so it is grounded in chunk text but not from the primary model path.";
  }
  if (telemetry.retrieval_mode === "lexical_only") {
    return "The answer came from lexical-only retrieval because vector retrieval was unavailable or rate-limited.";
  }
  if (telemetry.llm_fallback) {
    return "The answer used local synthesis fallback after retrieval completed, so wording is more conservative than the primary generation path.";
  }
  return "The answer came from the normal retrieval and synthesis pipeline.";
}

export function InsightsPanel({
  activeCitationIndex,
  citations,
  docMeta,
  hasDocument,
  telemetry,
  onExport,
  onFocusCitation,
}: InsightsPanelProps) {
  const summary = fallbackSummary(telemetry);

  return (
    <>
      {!hasDocument && (
        <div className="bg-[#fffaf2]/80 backdrop-blur-sm border border-[#cfb999] rounded-2xl p-3 space-y-2">
          <div className="text-xs uppercase tracking-widest text-[#8a6344] font-mono">Before You Ask</div>
          <div className="text-sm text-[#4b392d] leading-relaxed">
            Upload a paper first so Savant can retrieve document-specific evidence, attach page-level citations, and
            build a graph that stays tied to the actual source.
          </div>
        </div>
      )}

      {summary && (
        <div className="bg-[#fffaf2]/80 backdrop-blur-sm border border-[#cfb999] rounded-2xl p-3 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-widest text-[#8a6344] font-mono">Answer Path</div>
              <div className="mt-1 text-sm text-[#4b392d] leading-relaxed">{summary}</div>
            </div>
            <div
              className={`rounded-full px-3 py-1 text-[10px] font-mono uppercase tracking-[0.16em] ${
                telemetry?.retrieval_mode === "lexical_only" || telemetry?.llm_fallback
                  ? "border border-orange-700/20 bg-orange-100/70 text-orange-800"
                  : "border border-emerald-700/20 bg-emerald-100/70 text-emerald-800"
              }`}
            >
              {telemetry?.retrieval_mode === "lexical_only" || telemetry?.llm_fallback ? "Degraded Path" : "Primary Path"}
            </div>
          </div>
          {telemetry?.retrieval_mode === "lexical_only" || telemetry?.llm_fallback ? (
            <div className="rounded-xl border border-orange-700/20 bg-orange-50 px-3 py-2 text-xs leading-relaxed text-orange-900">
              This answer is still grounded in retrieved paper content, but it used a fallback path. Treat it as a
              verified draft and inspect the evidence cards below before relying on the wording.
            </div>
          ) : null}
        </div>
      )}

      {docMeta && (docMeta.ocrUsed || docMeta.sourceType || docMeta.qualitySignals?.scan_handling) ? (
        <div className="bg-[#fffaf2]/80 backdrop-blur-sm border border-[#cfb999] rounded-2xl p-3 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-widest text-[#8a6344] font-mono">Document Quality</div>
              <div className="mt-1 text-sm text-[#4b392d] leading-relaxed">
                Savant keeps track of how the paper entered the system so users can interpret evidence quality in context.
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-[10px] font-mono uppercase tracking-[0.14em]">
              {docMeta.sourceType ? (
                <span className="rounded-full border border-[#cfb999] bg-[#fffdf8] px-3 py-1 text-[#5f4734]">{docMeta.sourceType}</span>
              ) : null}
              {docMeta.ocrUsed ? (
                <span className="rounded-full border border-[#d1b283] bg-[#fbf2df] px-3 py-1 text-[#7b5531]">OCR recovery</span>
              ) : null}
              {docMeta.qualitySignals?.scan_handling ? (
                <span className="rounded-full border border-[#cfb999] bg-[#fffdf8] px-3 py-1 text-[#5f4734]">
                  {docMeta.qualitySignals.scan_handling}
                </span>
              ) : null}
            </div>
          </div>
          {docMeta.ocrUsed ? (
            <div className="rounded-xl border border-[#e1c89d] bg-[#fdf4e5] px-3 py-2 text-xs leading-relaxed text-[#6f553d]">
              OCR was used for this paper, which is helpful for scanned PDFs but can occasionally introduce noisy text. Citation snippets are especially worth checking before export or reuse.
            </div>
          ) : null}
        </div>
      ) : null}

      {citations.length > 0 ? (
        <div className="bg-[#fffaf2]/80 backdrop-blur-sm border border-[#cfb999] rounded-2xl p-3 space-y-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest text-[#8a6344] font-mono">Evidence</div>
              <div className="mt-1 text-xs text-[#6e5a47]">
                Open a citation, read the snippet, and jump the workspace to the exact page used for the answer.
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-[10px] font-mono text-[#7d6348]">{citations.length} cited chunks</div>
              <button
                type="button"
                onClick={() => onExport("markdown")}
                className="rounded-full border border-[#cfb999] bg-[#fffdf8] px-3 py-1 text-[10px] font-mono uppercase tracking-[0.12em] text-[#5f4734]"
              >
                Export Markdown
              </button>
              <button
                type="button"
                onClick={() => onExport("notion")}
                className="rounded-full border border-[#cfb999] bg-[#fffdf8] px-3 py-1 text-[10px] font-mono uppercase tracking-[0.12em] text-[#5f4734]"
              >
                Export Summary
              </button>
              <button
                type="button"
                onClick={() => onExport("pdf")}
                className="rounded-full border border-[#cfb999] bg-[#fffdf8] px-3 py-1 text-[10px] font-mono uppercase tracking-[0.12em] text-[#5f4734]"
              >
                Print to PDF
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {citations.map((citation, idx) => {
              const isActive = activeCitationIndex === idx;
              return (
                <details
                  key={`${citation.page_number}-${citation.chunk_index}-${idx}`}
                  open={isActive}
                  className={`rounded-lg border px-3 py-2 ${
                    isActive ? "border-[#8a6344] bg-[#fff7eb]" : "border-[#cfb999] bg-[#fffdf8]"
                  }`}
                >
                  <summary className="cursor-pointer list-none flex flex-col gap-2 text-xs font-mono text-[#4d3a2c]">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-[#f4ead9] border border-[#ccb794] px-2 py-1">p.{citation.page_number ?? "?"}</span>
                      <span className="rounded-md bg-[#f4ead9] border border-[#ccb794] px-2 py-1">chunk {citation.chunk_index ?? "?"}</span>
                      <span className="rounded-md bg-[#e7f2e8] border border-emerald-700/20 px-2 py-1">score {citation.score ?? 0}</span>
                      {citation.filename ? <span className="truncate text-[#6d5742]">{citation.filename}</span> : null}
                    </div>
                    <div className="text-[11px] leading-relaxed text-[#7d6348]">
                      {citation.selection_reason || "Used as supporting evidence for the generated answer."}
                    </div>
                  </summary>
                  <div className="mt-3 space-y-3">
                    {citation.match_terms?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {citation.match_terms.map((term) => (
                          <span key={term} className="rounded-full border border-[#ccb794] bg-[#f4ead9] px-2 py-1 text-[10px] font-mono text-[#6d5742]">
                            {term}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <div className="rounded-lg border border-[#cfb999] bg-[#fff9f0] px-3 py-3 text-sm leading-relaxed text-[#443327]">
                      {citation.snippet || "No snippet available."}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onFocusCitation(citation, idx)}
                        className="rounded-full border border-[#8a6344] bg-[#f8efe0] px-3 py-1 text-[10px] font-mono uppercase tracking-[0.12em] text-[#5a3a26]"
                      >
                        Jump to Evidence
                      </button>
                      {citation.snippet ? (
                        <button
                          type="button"
                          onClick={() => void navigator.clipboard.writeText(citation.snippet ?? "")}
                          className="rounded-full border border-[#cfb999] bg-[#fffdf8] px-3 py-1 text-[10px] font-mono uppercase tracking-[0.12em] text-[#5f4734]"
                        >
                          Copy Snippet
                        </button>
                      ) : null}
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        </div>
      ) : hasDocument ? (
        <div className="bg-[#fffaf2]/80 backdrop-blur-sm border border-[#cfb999] rounded-2xl p-3 space-y-2">
          <div className="text-xs uppercase tracking-widest text-[#8a6344] font-mono">Evidence</div>
          <div className="text-sm text-[#4b392d] leading-relaxed">
            Ask a document question to see supporting snippets, page references, and explanation for why each chunk was used.
          </div>
        </div>
      ) : null}

      {telemetry && (
        <div className="bg-[#fffaf2]/80 backdrop-blur-sm border border-[#cfb999] rounded-xl p-3 text-xs text-[#5c4735] font-mono">
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            <span>total {telemetry.total_ms ?? 0}ms</span>
            <span>embed {telemetry.embed_ms ?? 0}ms</span>
            <span>retrieve {telemetry.retrieval_ms ?? 0}ms</span>
            <span>llm {telemetry.llm_ms ?? 0}ms</span>
            <span>tts {telemetry.tts_ms ?? 0}ms</span>
            {telemetry.retrieval_mode ? <span>mode {telemetry.retrieval_mode}</span> : null}
            {telemetry.quality_signals?.low_confidence ? <span>confidence low</span> : null}
            {typeof telemetry.quality_signals?.evidence_count === "number" ? <span>evidence {telemetry.quality_signals.evidence_count}</span> : null}
          </div>
        </div>
      )}
    </>
  );
}
