import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SavantTerminal } from "@/components/SavantTerminal";
import { savantFetch } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  savantFetch: vi.fn(),
  savantJson: vi.fn(),
}));

vi.mock("@/components/terminal/ConversationSidebar", () => ({
  ConversationSidebar: ({
    conversations,
    activeConversationId,
    onCreateConversation,
    onSelectConversation,
  }: {
    conversations: Array<{ id: string; title: string }>;
    activeConversationId: string | null;
    onCreateConversation: () => void;
    onSelectConversation: (conversationId: string) => void;
  }) => (
    <div>
      <div data-testid="active-conversation">{activeConversationId ?? "none"}</div>
      <button onClick={onCreateConversation}>create-conversation</button>
      {conversations.map((conversation) => (
        <button key={conversation.id} onClick={() => onSelectConversation(conversation.id)}>
          select-{conversation.title}-{conversation.id}
        </button>
      ))}
    </div>
  ),
}));

vi.mock("@/components/terminal/TimelinePanel", () => ({
  TimelinePanel: ({
    timelineItems,
    uploadedFileName,
    pipelineStatus,
  }: {
    timelineItems: Array<{ id: string; raw: string }>;
    uploadedFileName: string | null;
    pipelineStatus: string;
  }) => (
    <div>
      <div data-testid="uploaded-file">{uploadedFileName ?? "none"}</div>
      <div data-testid="pipeline-status">{pipelineStatus}</div>
      {timelineItems.map((item) => (
        <div key={item.id}>{item.raw}</div>
      ))}
    </div>
  ),
}));

vi.mock("@/components/terminal/InsightsPanel", () => ({
  InsightsPanel: ({
    citations,
    telemetry,
    docMeta,
  }: {
    citations: Array<unknown>;
    telemetry: { retrieval_mode?: string; quality_signals?: { low_confidence?: boolean } } | null;
    docMeta: { sourceType?: string | null; ocrUsed?: boolean } | null;
  }) => (
    <div>
      <div data-testid="citations-count">{citations.length}</div>
      <div data-testid="retrieval-mode">{telemetry?.retrieval_mode ?? "none"}</div>
      <div data-testid="quality-low">{String(Boolean(telemetry?.quality_signals?.low_confidence))}</div>
      <div data-testid="doc-source">{docMeta?.sourceType ?? "none"}</div>
      <div data-testid="ocr-used">{String(Boolean(docMeta?.ocrUsed))}</div>
    </div>
  ),
}));

vi.mock("@/components/terminal/ResearchOpsPanel", () => ({
  ResearchOpsPanel: ({
    analyticsSummary,
    availableDocuments,
    comparePrompt,
    memoryNote,
    memoryTopic,
    researchMemories,
    selectedCompareDocIds,
    sourceTitle,
    sourceUrl,
    onComparePromptChange,
    onMemoryNoteChange,
    onMemoryTopicChange,
    onRunCompare,
    onSaveMemory,
    onSourceTitleChange,
    onSourceUrlChange,
    onSubmitSourceIngest,
    onToggleCompareDoc,
  }: {
    analyticsSummary: { total_events: number } | null;
    availableDocuments: Array<{ docId: string; fileName: string }>;
    comparePrompt: string;
    memoryNote: string;
    memoryTopic: string;
    researchMemories: Array<unknown>;
    selectedCompareDocIds: string[];
    sourceTitle: string;
    sourceUrl: string;
    onComparePromptChange: (value: string) => void;
    onMemoryNoteChange: (value: string) => void;
    onMemoryTopicChange: (value: string) => void;
    onRunCompare: () => void;
    onSaveMemory: () => void;
    onSourceTitleChange: (value: string) => void;
    onSourceUrlChange: (value: string) => void;
    onSubmitSourceIngest: () => void;
    onToggleCompareDoc: (docId: string) => void;
  }) => (
    <div>
      <div data-testid="analytics-total">{analyticsSummary?.total_events ?? 0}</div>
      <div data-testid="memory-count">{researchMemories.length}</div>
      <input data-testid="source-url" value={sourceUrl} onChange={(event) => onSourceUrlChange(event.target.value)} />
      <input data-testid="source-title" value={sourceTitle} onChange={(event) => onSourceTitleChange(event.target.value)} />
      <button onClick={onSubmitSourceIngest}>submit-source</button>
      <input data-testid="compare-prompt" value={comparePrompt} onChange={(event) => onComparePromptChange(event.target.value)} />
      <div data-testid="selected-compare">{selectedCompareDocIds.join(",")}</div>
      {availableDocuments.map((document) => (
        <button key={document.docId} onClick={() => onToggleCompareDoc(document.docId)}>
          toggle-doc-{document.docId}-{document.fileName}
        </button>
      ))}
      <button onClick={onRunCompare}>run-compare</button>
      <input data-testid="memory-topic" value={memoryTopic} onChange={(event) => onMemoryTopicChange(event.target.value)} />
      <textarea data-testid="memory-note" value={memoryNote} onChange={(event) => onMemoryNoteChange(event.target.value)} />
      <button onClick={onSaveMemory}>save-memory</button>
    </div>
  ),
}));

vi.mock("@/components/terminal/SuggestionsPanel", () => ({
  SuggestionsPanel: ({
    suggestedQuestions,
    applySuggestedQuestion,
  }: {
    suggestedQuestions: string[];
    applySuggestedQuestion: (suggestion: string) => Promise<void>;
  }) => (
    <div>
      <div data-testid="suggestions-count">{suggestedQuestions.length}</div>
      <button onClick={() => void applySuggestedQuestion(suggestedQuestions[0])}>apply-suggestion</button>
    </div>
  ),
}));

vi.mock("@/components/terminal/VoicePlaybackPanel", () => ({
  VoicePlaybackPanel: () => <div>voice-playback</div>,
}));

vi.mock("@/components/terminal/WorkspacePanel", () => ({
  WorkspacePanel: () => <div>workspace-panel</div>,
}));

vi.mock("@/components/terminal/OnboardingPanel", () => ({
  OnboardingPanel: () => <div>onboarding-panel</div>,
}));

vi.mock("@/components/terminal/QueryComposer", () => ({
  QueryComposer: ({
    docId,
    query,
    shareUrl,
    uploadedFileName,
    isProcessing,
    onFileUpload,
    onQueryChange,
    onSubmit,
  }: {
    docId: string | null;
    query: string;
    shareUrl: string | null;
    uploadedFileName: string | null;
    isProcessing: boolean;
    onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onQueryChange: (value: string) => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  }) => (
    <div>
      <div data-testid="composer-doc">{docId ?? "none"}</div>
      <div data-testid="composer-file">{uploadedFileName ?? "none"}</div>
      <div data-testid="composer-share">{shareUrl ?? "none"}</div>
      <div data-testid="composer-processing">{String(isProcessing)}</div>
      <button
        onClick={() =>
          onFileUpload(({
            target: {
              files: [new File(["pdf"], "paper.pdf", { type: "application/pdf" })],
            },
          } as unknown) as React.ChangeEvent<HTMLInputElement>)
        }
      >
        trigger-upload
      </button>
      <button onClick={() => onQueryChange("What is the contribution?")}>set-query</button>
      <button onClick={() => onSubmit({ preventDefault() {} } as React.FormEvent<HTMLFormElement>)}>submit-query</button>
      <div data-testid="composer-query">{query}</div>
    </div>
  ),
}));

describe("SavantTerminal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  function installFetchMock() {
    let analyticsCount = 3;
    let memoryDocs: Record<string, Array<{ topic: string; note: string }>> = {
      "doc-1": [],
      "doc-2": [],
    };

    vi.mocked(savantFetch).mockImplementation(async (path: string, init?: RequestInit) => {
      if (path === "/chat/conversations") {
        throw new Error("no backend hydrate");
      }

      if (path === "/analytics/summary") {
        return new Response(
          JSON.stringify({
            total_events: analyticsCount,
            low_confidence_queries: 1,
            most_used_graph_docs: [{ doc_id: "doc-1", count: 2 }],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      if (path === "/upload" && init?.method === "POST") {
        return new Response(JSON.stringify({ job_id: "job-1", doc_id: "doc-1", status: "queued" }), {
          status: 202,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (path === "/ingest/source" && init?.method === "POST") {
        return new Response(JSON.stringify({ job_id: "job-2", doc_id: "doc-2", status: "queued", source_type: "arxiv" }), {
          status: 202,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (path === "/jobs/job-1") {
        return new Response(
          JSON.stringify({
            status: "completed",
            job_type: "document_ingestion",
            result: {
              doc_id: "doc-1",
              chunk_count: 4,
              page_count: 2,
              retrieval_mode: "hybrid",
              ingest_ms: 14.2,
              ocr_used: true,
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      if (path === "/jobs/job-2") {
        return new Response(
          JSON.stringify({
            status: "completed",
            job_type: "source_ingestion",
            result: {
              doc_id: "doc-2",
              chunk_count: 6,
              page_count: 5,
              retrieval_mode: "hybrid",
              ingest_ms: 18.4,
              ocr_used: false,
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      if (path === "/documents/doc-1") {
        return new Response(
          JSON.stringify({
            doc_id: "doc-1",
            owner_id: "owner-test",
            filename: "paper.pdf",
            status: "ready",
            page_count: 2,
            chunk_count: 4,
            retrieval_mode: "hybrid",
            source_url: null,
            source_type: null,
            ocr_used: true,
            quality_signals: { scan_handling: "ocr", chunk_count: 4, embedded_chunks: 4 },
            created_at: "2026-01-01T00:00:00Z",
            updated_at: "2026-01-01T00:00:00Z",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      if (path === "/documents/doc-2") {
        return new Response(
          JSON.stringify({
            doc_id: "doc-2",
            owner_id: "owner-test",
            filename: "Attention Is All You Need.pdf",
            status: "ready",
            page_count: 5,
            chunk_count: 6,
            retrieval_mode: "hybrid",
            source_url: "https://arxiv.org/abs/1706.03762",
            source_type: "arxiv",
            ocr_used: false,
            quality_signals: { scan_handling: "native_text", chunk_count: 6, embedded_chunks: 6 },
            created_at: "2026-01-01T00:00:00Z",
            updated_at: "2026-01-01T00:00:00Z",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      if (path === "/sessions" && init?.method === "POST") {
        const body = JSON.parse(String(init.body || "{}")) as { doc_id?: string };
        const sessionId = body.doc_id === "doc-2" ? "session-2" : "session-1";
        return new Response(JSON.stringify({ session_id: sessionId, share_url: `/share/${sessionId}` }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (path === "/query" && init?.method === "POST") {
        analyticsCount += 1;
        return new Response(
          JSON.stringify({
            answer: "The paper introduces a new transformer approach.",
            audio_base64: null,
            context_used: [0, 1],
            citations: [{ page_number: 1, chunk_index: 0, snippet: "Evidence" }],
            telemetry: { retrieval_mode: "hybrid", total_ms: 33.1, quality_signals: { low_confidence: true, evidence_count: 2 } },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      if (path === "/compare" && init?.method === "POST") {
        analyticsCount += 1;
        return new Response(
          JSON.stringify({
            answer: "Paper A focuses on the transformer baseline while Paper B expands the evaluation setup.",
            citations: [
              { page_number: 1, chunk_index: 0, snippet: "Doc 1 evidence" },
              { page_number: 2, chunk_index: 1, snippet: "Doc 2 evidence" },
            ],
            context_used: [0, 1],
            doc_ids: ["doc-1", "doc-2"],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      if (path.startsWith("/research-memory?doc_id=")) {
        const docId = decodeURIComponent(path.split("=")[1] || "");
        return new Response(JSON.stringify({ memories: memoryDocs[docId] ?? [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (path === "/research-memory" && init?.method === "POST") {
        const body = JSON.parse(String(init.body || "{}")) as { doc_id?: string; topic: string; note: string };
        const docKey = body.doc_id || "doc-1";
        memoryDocs = {
          ...memoryDocs,
          [docKey]: [{ topic: body.topic, note: body.note }, ...(memoryDocs[docKey] ?? [])],
        };
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (path.includes("/chat/conversations/") && init?.method === "POST") {
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
      }

      if (path.includes("/chat/conversations/") && init?.method === "DELETE") {
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
      }

      if (path.includes("/chat/conversations/") && init?.method === "PATCH") {
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
      }

      return new Response(JSON.stringify({ detail: `Unhandled path ${path}` }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    });
  }

  it("handles upload, query submission, and conversation switching", async () => {
    installFetchMock();

    render(<SavantTerminal />);

    await waitFor(() => expect(screen.getByTestId("composer-doc")).toHaveTextContent("none"));
    expect(screen.getByTestId("analytics-total")).toHaveTextContent("3");
    const originalConversationId = screen.getByTestId("active-conversation").textContent as string;

    fireEvent.click(screen.getByText("trigger-upload"));

    await waitFor(() => expect(screen.getByTestId("composer-doc")).toHaveTextContent("doc-1"));
    expect(screen.getByTestId("composer-share")).toHaveTextContent("http://127.0.0.1:8000/share/session-1");
    expect(screen.getByText("Ingestion complete! Extracted and stored 4 chunks.")).toBeInTheDocument();
    expect(screen.getByTestId("ocr-used")).toHaveTextContent("true");

    fireEvent.click(screen.getByText("set-query"));
    expect(screen.getByTestId("composer-query")).toHaveTextContent("What is the contribution?");

    fireEvent.click(screen.getByText("submit-query"));

    await waitFor(() => expect(screen.getByText(/The paper introduces a new transformer approach\./)).toBeInTheDocument());
    expect(screen.getByTestId("citations-count")).toHaveTextContent("1");
    expect(screen.getByTestId("retrieval-mode")).toHaveTextContent("hybrid");
    expect(screen.getByTestId("quality-low")).toHaveTextContent("true");

    fireEvent.click(screen.getByText("create-conversation"));
    await waitFor(() => expect(screen.getByTestId("composer-doc")).toHaveTextContent("none"));
    expect(screen.getByTestId("composer-file")).toHaveTextContent("none");

    const originalConversationButton = await screen.findByText((content) => content.endsWith(`-${originalConversationId}`));
    fireEvent.click(originalConversationButton);
    await waitFor(() => expect(screen.getByTestId("composer-doc")).toHaveTextContent("doc-1"));
    expect(screen.getByText(/The paper introduces a new transformer approach\./)).toBeInTheDocument();
  });

  it("supports source ingest, multi-paper compare, and saved research memory", async () => {
    installFetchMock();

    render(<SavantTerminal />);

    await waitFor(() => expect(screen.getByTestId("composer-doc")).toHaveTextContent("none"));

    fireEvent.click(screen.getByText("trigger-upload"));
    await waitFor(() => expect(screen.getByTestId("composer-doc")).toHaveTextContent("doc-1"));
    const firstConversationId = screen.getByTestId("active-conversation").textContent as string;

    fireEvent.click(screen.getByText("create-conversation"));
    await waitFor(() => expect(screen.getByTestId("composer-doc")).toHaveTextContent("none"));

    fireEvent.change(screen.getByTestId("source-url"), { target: { value: "https://arxiv.org/abs/1706.03762" } });
    fireEvent.change(screen.getByTestId("source-title"), { target: { value: "Attention Is All You Need" } });
    fireEvent.click(screen.getByText("submit-source"));

    await waitFor(() => expect(screen.getByTestId("composer-doc")).toHaveTextContent("doc-2"));
    expect(screen.getByText(/Source ingest complete!/)).toBeInTheDocument();
    expect(screen.getByTestId("doc-source")).toHaveTextContent("arxiv");

    const firstConversationButton = await screen.findByText((content) => content.endsWith(`-${firstConversationId}`));
    fireEvent.click(firstConversationButton);
    await waitFor(() => expect(screen.getByTestId("composer-doc")).toHaveTextContent("doc-1"));

    fireEvent.change(screen.getByTestId("compare-prompt"), { target: { value: "How do these papers differ?" } });
    fireEvent.click(screen.getByText(/toggle-doc-doc-2-/));
    fireEvent.click(screen.getByText("run-compare"));

    await waitFor(() => expect(screen.getByText(/Paper A focuses on the transformer baseline/)).toBeInTheDocument());
    expect(screen.getByTestId("citations-count")).toHaveTextContent("2");

    fireEvent.change(screen.getByTestId("memory-topic"), { target: { value: "limitations" } });
    fireEvent.change(screen.getByTestId("memory-note"), { target: { value: "Need stronger ablations for deployment." } });
    fireEvent.click(screen.getByText("save-memory"));

    await waitFor(() => expect(screen.getByTestId("memory-count")).toHaveTextContent("1"));
    expect(screen.getByText(/Research memory saved under topic "limitations"\./)).toBeInTheDocument();
  });
});
