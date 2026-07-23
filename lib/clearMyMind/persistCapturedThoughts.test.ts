/**
 * @vitest-environment jsdom
 *
 * Clear My Mind completion + save integrity.
 * Never report “safely captured” unless persist succeeded.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { splitCaptureInput } from "@/lib/clearMyMindCapture";
import { buildAdaptiveNextSteps } from "@/lib/clearMyMind/adaptiveNextSteps";
import {
  clearMyMindCapturedCountLabel,
  persistCapturedThoughts,
} from "@/lib/clearMyMind/persistCapturedThoughts";
import {
  CLEAR_MY_MIND_CAPTURED_SAFE_TITLE,
  CLEAR_MY_MIND_SAVE_FAILED_TITLE,
} from "@/lib/clearMyMindCopy";
import * as companionStorageRecovery from "@/lib/companionStorageRecovery";
import { getBrainDumps, tryAddBrainDumps } from "@/lib/companionStore";

describe("persistCapturedThoughts — save success / failure", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("persists one thought and confirms count", () => {
    const result = persistCapturedThoughts({
      parts: ["pay the electric bill today"],
      sessionId: "cmm-one",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.capturedCount).toBe(1);
    expect(result.sessionEntries[0]?.originalText).toBe(
      "pay the electric bill today",
    );
    expect(getBrainDumps().some((e) => e.captureSessionId === "cmm-one")).toBe(
      true,
    );
  });

  it("persists multiple comma-separated thoughts with exact wording", () => {
    const parts = splitCaptureInput(
      "finish quarterly report, call dentist, plan mom's birthday",
    );
    const result = persistCapturedThoughts({
      parts,
      sessionId: "cmm-comma",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.capturedCount).toBe(3);
    expect(result.sessionEntries.map((e) => e.originalText).sort()).toEqual(
      [...parts].sort(),
    );
  });

  it("persists multiline thoughts without rewriting", () => {
    const raw = "Line one stays\nLine two stays\nLine three stays";
    const parts = splitCaptureInput(raw);
    const result = persistCapturedThoughts({
      parts,
      sessionId: "cmm-multi",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.sessionEntries.map((e) => e.originalText)).toEqual(parts);
    for (const part of parts) {
      expect(result.sessionEntries.some((e) => e.originalText === part)).toBe(
        true,
      );
    }
  });

  it("reports save failure without claiming capture", () => {
    vi.spyOn(companionStorageRecovery, "safeLocalStorageSet").mockReturnValue(
      false,
    );
    const result = persistCapturedThoughts({
      parts: ["this must not appear as saved"],
      sessionId: "cmm-fail",
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe("save_failed");
    expect(result.capturedCount).toBe(0);
    expect(
      getBrainDumps().some((e) => e.captureSessionId === "cmm-fail"),
    ).toBe(false);
  });

  it("tryAddBrainDumps confirms round-trip on success", () => {
    const result = tryAddBrainDumps(["exact words remain"], {
      captureSessionId: "cmm-try",
    });
    expect(result.ok).toBe(true);
    expect(result.created[0]?.originalText).toBe("exact words remain");
  });

  it("reloads persisted thoughts after refresh (storage reopen)", () => {
    const sessionId = "cmm-reopen";
    const first = persistCapturedThoughts({
      parts: ["still here after reopen"],
      sessionId,
    });
    expect(first.ok).toBe(true);
    const reloaded = getBrainDumps().filter(
      (e) => e.captureSessionId === sessionId,
    );
    expect(reloaded).toHaveLength(1);
    expect(reloaded[0]?.originalText).toBe("still here after reopen");
  });
});

describe("canonical captured count language", () => {
  it("uses singular and plural correctly", () => {
    expect(clearMyMindCapturedCountLabel(1)).toBe(
      "1 thought captured — still yours, exactly as you wrote it.",
    );
    expect(clearMyMindCapturedCountLabel(0)).toMatch(/^0 thoughts captured/);
    expect(clearMyMindCapturedCountLabel(3)).toMatch(/^3 thoughts captured/);
  });

  it("adaptive steps never say one thought when count is zero", () => {
    const empty = buildAdaptiveNextSteps([]);
    expect(empty.kind).toBe("empty");
    expect(empty.body).not.toMatch(/one thought/i);
    expect(empty.body).toMatch(/nothing was captured|add a thought/i);

    const one = buildAdaptiveNextSteps([
      {
        id: "a",
        text: "one real thought",
        originalText: "one real thought",
        createdAt: new Date().toISOString(),
      },
    ]);
    expect(one.kind).toBe("one");
    expect(one.body).toMatch(/one thought/i);
  });
});

describe("Clear My Mind completion UX wiring", () => {
  it("keeps failure copy distinct from safely-captured title", () => {
    expect(CLEAR_MY_MIND_SAVE_FAILED_TITLE).not.toBe(
      CLEAR_MY_MIND_CAPTURED_SAFE_TITLE,
    );
    expect(CLEAR_MY_MIND_SAVE_FAILED_TITLE).toMatch(/weren.t saved/i);
  });

  it("gates completion on persist success in ClearMyMindSession", () => {
    const session = readFileSync(
      join(process.cwd(), "components/companion/ClearMyMindSession.tsx"),
      "utf8",
    );
    expect(session).toContain("persistCapturedThoughts");
    expect(session).toContain("cmm-persist-error");
    expect(session).toContain("Never show");
    expect(session).toMatch(/if\s*\(\s*!persisted\.ok\s*\)/);
    expect(session).toContain("retryFailedSave");
    expect(session).toMatch(/Prefer the live box/);
    expect(session).not.toMatch(
      /addBrainDumps\(parts,\s*\{\s*captureSessionId/,
    );
  });

  it("uses one canonical count source on the completion screen", () => {
    const choice = readFileSync(
      join(process.cwd(), "components/companion/ClearMyMindCaptureChoice.tsx"),
      "utf8",
    );
    expect(choice).toContain("clearMyMindCapturedCountLabel(capturedCount)");
    expect(choice).toContain("capturedCount > 0");
    expect(choice).toContain("cmm-captured-count");
    expect(choice).not.toMatch(
      /thoughtCount\} thought\{thoughtCount === 1/,
    );
  });

  it("makes the Clear My Mind panel vertically scrollable", () => {
    const css = readFileSync(
      join(process.cwd(), "app/companion/clear-my-mind-panel.css"),
      "utf8",
    );
    expect(css).toMatch(/\.clear-my-mind-panel__content\s*\{[^}]*overflow-y:\s*auto/s);
    expect(css).toMatch(/max-height:\s*min\(92dvh/);
    expect(css).toMatch(/@media \(max-width:\s*640px\)/);
  });

  it("Show Conversation control no longer exists anywhere in Companion chrome", () => {
    const client = readFileSync(
      join(process.cwd(), "app/companion/CompanionPageClient.tsx"),
      "utf8",
    );
    expect(client).not.toContain("Show Conversation");
    expect(client).not.toContain("show-conversation-chip");
    expect(client).not.toContain("conversation-visibility-chip");
  });
});
