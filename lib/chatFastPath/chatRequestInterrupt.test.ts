import { describe, expect, it, vi } from "vitest";
import {
  isChatRequestAbortError,
  isChatRequestSuperseded,
  supersedeInFlightChatRequest,
  CHAT_REQUEST_ABORTED,
} from "./chatRequestInterrupt";

describe("chatRequestInterrupt", () => {
  it("detects superseded generations", () => {
    expect(isChatRequestSuperseded(1, 1)).toBe(false);
    expect(isChatRequestSuperseded(1, 2)).toBe(true);
  });

  it("detects abort errors", () => {
    expect(isChatRequestAbortError(new Error(CHAT_REQUEST_ABORTED))).toBe(true);
    expect(isChatRequestAbortError(new Error("other"))).toBe(false);
  });

  it("aborts the previous controller", () => {
    const previous = new AbortController();
    const spy = vi.spyOn(previous, "abort");
    supersedeInFlightChatRequest(previous);
    expect(spy).toHaveBeenCalledOnce();
    expect(previous.signal.aborted).toBe(true);
  });
});
