import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConceptCard } from "@/components/PaperGraphExplorer";
import { savantFetch } from "@/lib/api";

vi.mock("@/lib/api", () => ({ savantFetch: vi.fn() }));

const props = {
  node: { id: "position", label: "Positional Encoding", summary: "Token order", category: "component" as const, importance: 1 },
  paperText: "Public paper context",
  sessionId: "graph-session",
  note: "",
  isBookmarked: false,
  onClose: vi.fn(), onNoteChange: vi.fn(), onToggleBookmark: vi.fn(), onSaveInsight: vi.fn(),
};

describe("saved concept conversations", () => {
  beforeEach(() => {
    vi.mocked(savantFetch).mockReset();
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("restores saved node questions and answers", async () => {
    vi.mocked(savantFetch).mockResolvedValue(Response.json({ messages: [
      { role: "user", content: "Why token positions?" },
      { role: "assistant", content: "To represent sequence order." },
    ] }));
    render(<ConceptCard {...props} />);
    expect(await screen.findByText("To represent sequence order.")).toBeTruthy();
    expect(savantFetch).toHaveBeenCalledWith("/graph/sessions/graph-session/nodes/position/messages");
  });

  it("sends the session and role-based history when asking a follow-up", async () => {
    vi.mocked(savantFetch)
      .mockResolvedValueOnce(Response.json({ messages: [
        { role: "user", content: "First question" }, { role: "assistant", content: "First answer" },
      ] }))
      .mockResolvedValueOnce(Response.json({ answer: "New answer" }));
    render(<ConceptCard {...props} />);
    await screen.findByText("First answer");
    fireEvent.change(screen.getByPlaceholderText("Ask about Positional Encoding..."), { target: { value: "Explain further" } });
    fireEvent.click(screen.getByRole("button", { name: "↵" }));
    await waitFor(() => expect(savantFetch).toHaveBeenCalledTimes(2));
    const request = JSON.parse(String(vi.mocked(savantFetch).mock.calls[1][1]?.body));
    expect(request.session_id).toBe("graph-session");
    expect(request.node_id).toBe("position");
    expect(request.history).toEqual([{ role: "user", content: "First question" }, { role: "assistant", content: "First answer" }]);
    expect(await screen.findByText("New answer")).toBeTruthy();
  });
});
