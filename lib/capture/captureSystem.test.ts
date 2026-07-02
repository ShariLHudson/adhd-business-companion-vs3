// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
import {
  classifyCaptureIntent,
  extractCaptureContent,
  isCaptureViewTurn,
  isCaptureWriteTurn,
} from "./classifyCaptureIntent";
import { executeCaptureWrite } from "./executeCaptureIntent";
import { flushPendingCaptureQueue, saveCaptureEntry } from "./saveCaptureEntry";

describe("capture system", () => {
  beforeEach(() => {
    if (typeof localStorage !== "undefined") {
      localStorage.clear();
    }
  });

  it("1. journal write → stored only, no chat path", () => {
    const intent = classifyCaptureIntent("I want to journal this thought");
    expect(intent.kind).toBe("write");
    if (intent.kind === "write") {
      expect(intent.captureType).toBe("journal");
      expect(intent.content).toMatch(/thought/i);
    }
    expect(isCaptureWriteTurn("I want to journal this thought")).toBe(true);
  });

  it("2. portfolio write → stored only", () => {
    const intent = classifyCaptureIntent("Add this to my portfolio: launched the workshop");
    expect(intent.kind).toBe("write");
    if (intent.kind === "write") {
      expect(intent.captureType).toBe("portfolio");
      expect(intent.content).toMatch(/launched/i);
    }
  });

  it("3. evidence write → stored only", () => {
    const intent = classifyCaptureIntent(
      "Save this as evidence I helped someone feel less alone",
    );
    expect(intent.kind).toBe("write");
    if (intent.kind === "write") {
      expect(intent.captureType).toBe("evidence-vault");
      expect(intent.content).toMatch(/helped someone/i);
    }
  });

  it("4. overwhelmed → not capture", () => {
    expect(classifyCaptureIntent("I feel overwhelmed").kind).toBe("none");
    expect(isCaptureWriteTurn("I feel overwhelmed")).toBe(false);
  });

  it("5. show portfolio → view only, not write", () => {
    const intent = classifyCaptureIntent("Show me my portfolio");
    expect(intent.kind).toBe("view");
    if (intent.kind === "view") {
      expect(intent.captureType).toBe("portfolio");
    }
    expect(isCaptureWriteTurn("Show me my portfolio")).toBe(false);
    expect(isCaptureViewTurn("Show me my portfolio")).toBe(true);
  });

  it("saveCaptureEntry persists journal locally", () => {
    const result = saveCaptureEntry("journal", "Quiet morning reflection.");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.recordId).toMatch(/^jr-/);
    }
  });

  it("executeCaptureWrite returns saved without navigation", () => {
    const intent = classifyCaptureIntent("I want to journal today felt calmer");
    expect(intent.kind).toBe("write");
    if (intent.kind !== "write") return;
    const outcome = executeCaptureWrite(intent);
    expect(outcome.action).toBe("saved");
  });

  it("extractCaptureContent strips command prefix", () => {
    expect(
      extractCaptureContent(
        "Save this as evidence I helped someone",
        "evidence-vault",
      ),
    ).toMatch(/helped someone/i);
  });

  it("flushPendingCaptureQueue retries queued items", () => {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(
      "companion-capture-pending-v1",
      JSON.stringify([
        {
          id: "cap-pending-test",
          captureType: "journal",
          content: "Queued thought",
          createdAt: new Date().toISOString(),
          attempts: 0,
        },
      ]),
    );
    const flushed = flushPendingCaptureQueue();
    expect(flushed).toBe(1);
  });
});
