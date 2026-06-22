export type Citation = {
  filename?: string;
  page_number?: number;
  chunk_index?: number;
  score?: number;
  snippet?: string;
  selection_reason?: string;
  match_terms?: string[];
};

export type QueryTelemetry = {
  embed_ms?: number;
  retrieval_ms?: number;
  llm_ms?: number;
  tts_ms?: number;
  payment_verify_ms?: number;
  total_ms?: number;
  retrieval_mode?: "hybrid" | "lexical_only";
  llm_fallback?: boolean;
  quality_signals?: {
    low_confidence?: boolean;
    retrieval_mode?: string;
    llm_fallback?: boolean;
    evidence_count?: number;
    strongest_score?: number;
    weakest_score?: number;
  };
};

export type DocMeta = {
  chunksProcessed?: number;
  chunksStored?: number;
  pageCount?: number;
  ingestMs?: number;
  sourceUrl?: string | null;
  sourceType?: string | null;
  ocrUsed?: boolean;
  retrievalMode?: string | null;
  status?: string | null;
  qualitySignals?: {
    scan_handling?: string;
    chunk_count?: number;
    embedded_chunks?: number;
  } | null;
};

export type ResearchMemory = {
  topic: string;
  note?: string;
  doc_id?: string | null;
  session_id?: string | null;
  tags?: string[];
  mentions?: number;
  updated_at?: string;
  created_at?: string;
  last_question?: string;
};

export type AnalyticsSummary = {
  total_events: number;
  low_confidence_queries: number;
  most_used_graph_docs: Array<{ doc_id: string; count: number }>;
};

export type ConversationRecord = {
  id: string;
  title: string;
  workspaceName: string | null;
  folder: string;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
  docId: string | null;
  fileName: string | null;
  sessionId: string | null;
  logs: string[];
  citations: Citation[];
  telemetry: QueryTelemetry | null;
  docMeta: DocMeta | null;
};

export type GraphStatus = "idle" | "loading" | "ready" | "error";

export type TimelineItem = {
  id: string;
  raw: string;
  tone: "info" | "success" | "warn" | "error";
};

export type StageStatus = "idle" | "active" | "done" | "error" | "degraded";

export type WorkflowStage = {
  id: "upload" | "retrieval" | "synthesis" | "audio";
  label: string;
  status: StageStatus;
  detail: string;
};
