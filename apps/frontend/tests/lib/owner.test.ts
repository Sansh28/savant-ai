import { beforeEach, describe, expect, it, vi } from "vitest";
import { getClientAuthSession } from "@/lib/owner";

describe("client session ownership", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shares one bootstrap request between concurrent callers", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({
      access_token: "one-token", owner_id: "one-owner", expires_at: Math.floor(Date.now() / 1000) + 3600,
    }));
    vi.stubGlobal("fetch", fetchMock);
    const sessions = await Promise.all([getClientAuthSession(), getClientAuthSession(), getClientAuthSession()]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(new Set(sessions.map((session) => session.ownerId)).size).toBe(1);
    expect((await getClientAuthSession()).accessToken).toBe("one-token");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
