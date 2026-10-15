import { API_BASE_URL } from "@/lib/config";
import { getClientAuthSession } from "@/lib/owner";

export async function withOwnerHeaders(headers?: HeadersInit): Promise<Headers> {
  const nextHeaders = new Headers(headers);
  const session = await getClientAuthSession();
  nextHeaders.set("Authorization", `Bearer ${session.accessToken}`);
  return nextHeaders;
}

export async function savantFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: await withOwnerHeaders(init.headers),
  });
  if (response.status !== 401) return response;

  // A local backend restart can invalidate a token before its client expiry.
  // Refresh once; never retry authorization failures in a loop.
  const session = await getClientAuthSession(true);
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${session.accessToken}`);
  return fetch(`${API_BASE_URL}${path}`, { ...init, headers });
}
