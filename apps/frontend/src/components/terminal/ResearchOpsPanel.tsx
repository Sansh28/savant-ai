import type { AnalyticsSummary, DocMeta, ResearchMemory } from "@/components/terminal/types";

type ResearchDocument = {
  docId: string;
  fileName: string;
  sourceType?: string | null;
};

type ResearchOpsPanelProps = {
  analyticsSummary: AnalyticsSummary | null;
  availableDocuments: ResearchDocument[];
  comparePrompt: string;
  currentDocId: string | null;
  docMeta: DocMeta | null;
  isComparing: boolean;
  isLoadingMemories: boolean;
  isSavingMemory: boolean;
  isSourceIngesting: boolean;
  memoryNote: string;
  memoryTags: string;
  memoryTopic: string;
  researchMemories: ResearchMemory[];
  selectedCompareDocIds: string[];
  sourceTitle: string;
  sourceUrl: string;
  onComparePromptChange: (value: string) => void;
  onMemoryNoteChange: (value: string) => void;
  onMemoryTagsChange: (value: string) => void;
  onMemoryTopicChange: (value: string) => void;
  onRunCompare: () => void;
  onSaveMemory: () => void;
  onSourceTitleChange: (value: string) => void;
  onSourceUrlChange: (value: string) => void;
  onSubmitSourceIngest: () => void;
  onToggleCompareDoc: (docId: string) => void;
};

export function ResearchOpsPanel({
  analyticsSummary,
  availableDocuments,
  comparePrompt,
  currentDocId,
  docMeta,
  isComparing,
  isLoadingMemories,
  isSavingMemory,
  isSourceIngesting,
  memoryNote,
  memoryTags,
  memoryTopic,
  researchMemories,
  selectedCompareDocIds,
  sourceTitle,
  sourceUrl,
  onComparePromptChange,
  onMemoryNoteChange,
  onMemoryTagsChange,
  onMemoryTopicChange,
  onRunCompare,
  onSaveMemory,
  onSourceTitleChange,
  onSourceUrlChange,
  onSubmitSourceIngest,
  onToggleCompareDoc,
}: ResearchOpsPanelProps) {
  return (
    <section className="rounded-2xl border border-[#cfb999] bg-[#fffaf2]/80 p-4 shadow-[0_10px_24px_rgba(66,46,20,0.08)]">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#8a6344]">Research Operations</div>
            <h2 className="mt-2 text-lg font-semibold text-[#2d2118]">Bring in papers, compare them, and keep durable research memory.</h2>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[#6d5742]">
              This workspace now supports messy-paper ingestion, multi-paper comparison, and saved notes that stay tied
              to the document trail instead of disappearing into chat history.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px] font-mono uppercase tracking-[0.14em]">
            {docMeta?.ocrUsed ? (
              <span className="rounded-full border border-[#d1b283] bg-[#fbf2df] px-3 py-1 text-[#7b5531]">OCR Used</span>
            ) : null}
            {docMeta?.sourceType ? (
              <span className="rounded-full border border-[#cfb999] bg-[#fffdf8] px-3 py-1 text-[#7d6348]">{docMeta.sourceType}</span>
            ) : null}
            {docMeta?.qualitySignals?.scan_handling ? (
              <span className="rounded-full border border-[#cfb999] bg-[#fffdf8] px-3 py-1 text-[#7d6348]">
                {docMeta.qualitySignals.scan_handling}
              </span>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
          <div className="rounded-2xl border border-[#d8c7ab] bg-[#fffdf8] p-4">
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#8a6344]">Direct Source Ingest</div>
            <p className="mt-2 text-xs leading-relaxed text-[#725e4b]">
              Paste an arXiv, Semantic Scholar, OpenReview, ACM, IEEE, or Springer paper URL and let Savant fetch the PDF
              into the active conversation.
            </p>
            <div className="mt-3 grid gap-2">
              <input
                type="url"
                value={sourceUrl}
                onChange={(event) => onSourceUrlChange(event.target.value)}
                placeholder="https://arxiv.org/abs/1706.03762"
                className="rounded-xl border border-[#cfb999] bg-[#fffaf2] px-3 py-2 text-sm text-[#2d2118] outline-none focus:border-[#8a6344]"
              />
              <input
                type="text"
                value={sourceTitle}
                onChange={(event) => onSourceTitleChange(event.target.value)}
                placeholder="Optional title override"
                className="rounded-xl border border-[#cfb999] bg-[#fffaf2] px-3 py-2 text-sm text-[#2d2118] outline-none focus:border-[#8a6344]"
              />
              <button
                type="button"
                onClick={onSubmitSourceIngest}
                disabled={isSourceIngesting || !sourceUrl.trim()}
                className="rounded-xl border border-[#7f4c31] bg-[#7f4c31] px-4 py-2 text-sm font-semibold text-[#fff9f0] transition hover:bg-[#6b3f28] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSourceIngesting ? "Fetching source..." : "Ingest from URL"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-[#d8c7ab] bg-[#fffdf8] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#8a6344]">Workspace Signals</div>
                <p className="mt-2 text-xs leading-relaxed text-[#725e4b]">
                  A lightweight readout of how the product is being used and where confidence is dropping.
                </p>
              </div>
              <div className="rounded-xl border border-[#e3d4bc] bg-[#fbf5e8] px-3 py-2 text-right">
                <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#9a7a57]">Analytics</div>
                <div className="mt-1 text-lg font-semibold text-[#36261d]">{analyticsSummary?.total_events ?? 0}</div>
                <div className="text-[11px] text-[#7a6550]">captured events</div>
              </div>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl border border-[#ead9ba] bg-[#fbf5e8] p-3">
                <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#9a7a57]">Low Confidence Queries</div>
                <div className="mt-1 text-xl font-semibold text-[#3d2b20]">{analyticsSummary?.low_confidence_queries ?? 0}</div>
              </div>
              <div className="rounded-xl border border-[#ead9ba] bg-[#fbf5e8] p-3">
                <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#9a7a57]">Top Graph Docs</div>
                <div className="mt-2 space-y-1 text-xs leading-relaxed text-[#6d5742]">
                  {(analyticsSummary?.most_used_graph_docs ?? []).slice(0, 2).map((item) => (
                    <div key={item.doc_id} className="truncate">
                      {item.doc_id.slice(0, 8)}... used {item.count}x
                    </div>
                  ))}
                  {!analyticsSummary?.most_used_graph_docs?.length ? <div>No graph activity yet.</div> : null}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
          <div className="rounded-2xl border border-[#d8c7ab] bg-[#fffdf8] p-4">
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#8a6344]">Multi-Paper Compare</div>
            <p className="mt-2 text-xs leading-relaxed text-[#725e4b]">
              Select papers already loaded into this workspace and ask a grounded cross-paper question like differences in
              methods, evaluation, or limitations.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {availableDocuments.map((document) => {
                const selected = selectedCompareDocIds.includes(document.docId);
                return (
                  <button
                    key={document.docId}
                    type="button"
                    onClick={() => onToggleCompareDoc(document.docId)}
                    className={`rounded-full border px-3 py-2 text-left text-xs font-mono transition ${
                      selected
                        ? "border-[#7f4c31] bg-[#f3e3cf] text-[#4d321f]"
                        : "border-[#cfb999] bg-[#fffaf2] text-[#6d5742]"
                    }`}
                  >
                    <span className="block truncate max-w-[220px]">{document.fileName}</span>
                    {document.sourceType ? <span className="block pt-1 text-[10px] uppercase">{document.sourceType}</span> : null}
                  </button>
                );
              })}
            </div>
            <textarea
              value={comparePrompt}
              onChange={(event) => onComparePromptChange(event.target.value)}
              placeholder="How do these papers differ in methodology and evaluation?"
              className="mt-3 min-h-[110px] w-full rounded-xl border border-[#cfb999] bg-[#fffaf2] px-3 py-3 text-sm text-[#2d2118] outline-none focus:border-[#8a6344]"
            />
            <button
              type="button"
              onClick={onRunCompare}
              disabled={isComparing || selectedCompareDocIds.length < 2 || !comparePrompt.trim()}
              className="mt-3 rounded-xl border border-[#7f4c31] bg-[#7f4c31] px-4 py-2 text-sm font-semibold text-[#fff9f0] transition hover:bg-[#6b3f28] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isComparing ? "Comparing..." : `Compare ${selectedCompareDocIds.length || 0} Papers`}
            </button>
            {currentDocId ? (
              <div className="mt-2 text-[11px] text-[#7a6550]">
                Active paper stays in focus while comparison results are added to the same evidence stream.
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-[#d8c7ab] bg-[#fffdf8] p-4">
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#8a6344]">Research Memory</div>
            <p className="mt-2 text-xs leading-relaxed text-[#725e4b]">
              Save durable notes, recurring themes, and conclusions so the workspace keeps a memory trail beyond a single answer.
            </p>
            <div className="mt-3 grid gap-2">
              <input
                type="text"
                value={memoryTopic}
                onChange={(event) => onMemoryTopicChange(event.target.value)}
                placeholder="Topic, e.g. limitations"
                className="rounded-xl border border-[#cfb999] bg-[#fffaf2] px-3 py-2 text-sm text-[#2d2118] outline-none focus:border-[#8a6344]"
              />
              <textarea
                value={memoryNote}
                onChange={(event) => onMemoryNoteChange(event.target.value)}
                placeholder="Save a note or conclusion tied to this paper..."
                className="min-h-[88px] rounded-xl border border-[#cfb999] bg-[#fffaf2] px-3 py-3 text-sm text-[#2d2118] outline-none focus:border-[#8a6344]"
              />
              <input
                type="text"
                value={memoryTags}
                onChange={(event) => onMemoryTagsChange(event.target.value)}
                placeholder="Comma-separated tags"
                className="rounded-xl border border-[#cfb999] bg-[#fffaf2] px-3 py-2 text-sm text-[#2d2118] outline-none focus:border-[#8a6344]"
              />
              <button
                type="button"
                onClick={onSaveMemory}
                disabled={isSavingMemory || !memoryTopic.trim() || !memoryNote.trim()}
                className="rounded-xl border border-[#c19a6b] bg-[#f8efe0] px-4 py-2 text-sm font-semibold text-[#5a3a26] transition hover:bg-[#f1e1c8] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSavingMemory ? "Saving note..." : "Save to Research Memory"}
              </button>
            </div>
            <div className="mt-4 space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#9a7a57]">
                Recent Memory {isLoadingMemories ? "· loading" : ""}
              </div>
              {researchMemories.length ? (
                researchMemories.slice(0, 4).map((memory) => (
                  <div key={`${memory.topic}-${memory.updated_at ?? memory.note}`} className="rounded-xl border border-[#ead9ba] bg-[#fbf5e8] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-[#3d2b20]">{memory.topic}</div>
                      {memory.mentions ? <div className="text-[10px] font-mono text-[#86684c]">{memory.mentions} mentions</div> : null}
                    </div>
                    <div className="mt-1 text-xs leading-relaxed text-[#6d5742]">{memory.note || memory.last_question || "No note saved yet."}</div>
                    {memory.tags?.length ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {memory.tags.map((tag) => (
                          <span key={tag} className="rounded-full border border-[#d8c7ab] bg-[#fffdf8] px-2 py-1 text-[10px] font-mono text-[#71543c]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-[#d8c7ab] bg-[#fffaf2] p-3 text-xs leading-relaxed text-[#71543c]">
                  No saved memory yet. Add one durable note once you find something worth carrying across sessions.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
