import "@testing-library/jest-dom/vitest";
import { JSDOM } from "jsdom";

// Node 26 exposes an unavailable global Web Storage property. Use the actual
// jsdom Storage implementation when it prevents Vitest from installing one.
if (typeof window !== "undefined" && !window.localStorage) {
  const storage = new JSDOM("", { url: "http://localhost:3000" }).window.localStorage;
  Object.defineProperty(window, "localStorage", { configurable: true, value: storage });
}

if (typeof window !== "undefined" && !window.requestAnimationFrame) {
  window.requestAnimationFrame = (callback: FrameRequestCallback) => window.setTimeout(() => callback(performance.now()), 0);
}
