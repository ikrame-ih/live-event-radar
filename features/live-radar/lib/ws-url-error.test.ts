import { describe, expect, it } from "vitest";
import { wsUrlError } from "./ws-url-error";

describe("wsUrlError", () => {
  it("accepts ws and wss URLs", () => {
    expect(wsUrlError("wss://example.com/stream")).toBeNull();
    expect(wsUrlError("ws://localhost:8080")).toBeNull();
  });

  it("rejects non-WebSocket protocols", () => {
    expect(wsUrlError("https://example.com")).toBe("invalid protocol");
    expect(wsUrlError("http://localhost:3000")).toBe("invalid protocol");
  });

  it("rejects malformed URLs", () => {
    expect(wsUrlError("not-a-url")).toBe("invalid url");
  });
});
