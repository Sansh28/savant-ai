import { API_BASE_URL } from "@/lib/config";
import { getClientAuthSession } from "@/lib/owner";

export async function withOwnerHeaders(headers?: HeadersInit): Promise<Headers> {
  const nextHeaders = new Headers(headers);
  const session = await getClientAuthSession();
  nextHeaders.set("Authorization", `Bearer ${session.accessToken}`);
  return nextHeaders;
}

export async function savantFetch(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: await withOwnerHeaders(init.headers),
  });
}

async function parseSavantJson<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T & { detail?: string };
  if (!response.ok) {
    throw new Error(payload.detail || "Savant request failed");
  }
  return payload;
}

export async function savantJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await savantFetch(path, init);
  return parseSavantJson<T>(response);
}
