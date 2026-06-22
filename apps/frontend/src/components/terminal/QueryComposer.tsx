import type { ChangeEvent, FormEvent } from "react";

import type { WorkflowStage } from "@/components/terminal/types";

type QueryComposerProps = {
  canUseSpeech: boolean;
  docId: string | null;
  isListening: boolean;
  isProcessing: boolean;
  isSourceIngesting: boolean;
  isUploading: boolean;
  pageNumber: string;
  query: string;
  shareUrl: string | null;
  uploadedFileName: string | null;
  workflowStages: WorkflowStage[];
  onCopyShareLink: () => void;
  onFileUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onPageNumberChange: (value: string) => void;
  onQueryChange: (value: string) => void;
  onStartVoiceInput: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function QueryComposer({
  canUseSpeech,
  docId,
  isListening,
  isProcessing,
  isSourceIngesting,
  isUploading,
  pageNumber,
  query,
  shareUrl,
  uploadedFileName,
  workflowStages,
  onCopyShareLink,
  onFileUpload,
  onPageNumberChange,
  onQueryChange,
  onStartVoiceInput,
  onSubmit,
}: QueryComposerProps) {
  const activeStage = workflowStages.find((stage) => stage.status === "active");
  const degradedStages = workflowStages.filter((stage) => stage.status === "degraded");

  return (
    <>
      <div className="flex items-center gap-4 flex-wrap">
        <label className="cursor-pointer rounded-xl border border-[#7f4c31] bg-[#7f4c31] px-4 py-2 font-mono text-sm text-[#fff9f0] transition hover:bg-[#6b3f28]">
          {isUploading ? "Uploading..." : uploadedFileName ? "Replace Document (PDF)" : "Upload Document (PDF)"}
          <input
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={onFileUpload}
            disabled={isUploading || isProcessing || isSourceIngesting}
          />
        </label>
        {uploadedFileName ? <span className="max-w-[280px] truncate text-sm text-[#6d5742]">{uploadedFileName}</span> : null}
        {shareUrl ? (
          <button
            type="button"
            className="rounded-lg border border-[#c19a6b] bg-[#f8efe0] px-3 py-2 text-xs font-mono text-[#5a3a26]"
            onClick={onCopyShareLink}
          >
            Copy Share Link
          </button>
        ) : null}
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
          {activeStage ? (
            <span className="rounded-full border border-amber-700/40 bg-amber-100/70 px-3 py-1 text-amber-900">
              {`Active: ${activeStage.label} · ${activeStage.detail}`}
            </span>
          ) : (
            <span className="rounded-full border border-emerald-700/30 bg-emerald-100/70 px-3 py-1 text-emerald-800">
              System ready for the next step
            </span>
          )}
          {degradedStages.map((stage) => (
            <span key={stage.id} className="rounded-full border border-orange-700/30 bg-orange-100/70 px-3 py-1 text-orange-800">
              {`Degraded: ${stage.label} · ${stage.detail}`}
            </span>
          ))}
          {isSourceIngesting ? (
            <span className="rounded-full border border-[#c19a6b] bg-[#f8efe0] px-3 py-1 text-[#5a3a26]">
              Source ingest is active in the background
            </span>
          ) : null}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Ask Savant to analyze the document..."
            className="flex-1 rounded-xl border border-[#cfb999] bg-[#fffdf8] px-4 py-2 font-mono text-sm text-[#261d17] focus:border-[#8a6344] focus:outline-none"
            disabled={!docId || isUploading || isProcessing || isSourceIngesting}
          />
          <input
            type="number"
            min={1}
            value={pageNumber}
            onChange={(event) => onPageNumberChange(event.target.value)}
            placeholder="Page"
            className="w-24 rounded-xl border border-[#cfb999] bg-[#fffdf8] px-2 py-2 font-mono text-sm text-[#261d17] focus:border-[#8a6344] focus:outline-none"
            disabled={!docId || isUploading || isProcessing || isSourceIngesting}
          />
          <button
            type="button"
            onClick={onStartVoiceInput}
            disabled={!docId || isUploading || isProcessing || isSourceIngesting || !canUseSpeech}
            className="rounded-xl border border-[#c19a6b] bg-[#f8efe0] px-3 py-2 font-mono text-xs text-[#5a3a26]"
          >
            {isListening ? "Stop Mic" : "Voice"}
          </button>
          <button
            type="submit"
            disabled={!docId || isUploading || isProcessing || isSourceIngesting || !query.trim()}
            className="rounded-xl bg-[#7f4c31] px-6 py-2 text-sm font-semibold text-[#fff9f0] transition hover:bg-[#6b3f28] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing ? "Processing..." : "Ask"}
          </button>
        </div>

        <div className="text-xs font-mono text-[#7f6751]">
          Direct query mode stays grounded to the active paper while source ingest, comparison, and evidence state are surfaced above in real time.
        </div>
      </form>
    </>
  );
}
