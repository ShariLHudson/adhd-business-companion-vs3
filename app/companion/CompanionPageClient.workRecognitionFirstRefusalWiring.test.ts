/**
 * Phase T-1, first slice (2026-08-07) — Work Intent Ownership Convergence.
 * CompanionPageClient.tsx is too large to mount in a unit test, so this
 * locks the wiring directly, matching this codebase's established pattern
 * for that file (see CompanionPageClient.notificationSoundWiring.test.ts,
 * CompanionPageClient.createFoundationOpenWiring.test.ts).
 *
 * @see docs/create-experience/WORK_INTENT_TARGET_ARCHITECTURE.md §6
 * @see docs/create-experience/WORK_INTENT_OWNERSHIP_AUDIT.md
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const COMPANION_PAGE_CLIENT = path.join(
  process.cwd(),
  "app/companion/CompanionPageClient.tsx",
);

function source(): string {
  return readFileSync(COMPANION_PAGE_CLIENT, "utf8").replace(/\r\n/g, "\n");
}

/** The new Phase T-1 first-refusal block, from its opening `if` to its closing brace. */
function firstRefusalBlock(): string {
  const src = source();
  const match = src.match(
    /if \(\s*isWorkRecognitionFirstRefusalEnabled\(\)[\s\S]*?\n {4}\}\n\n {4}\/\/ Blocked eligible-Create normalization/,
  );
  if (!match) {
    throw new Error(
      "Phase T-1 first-refusal block not found immediately before blockedCreateGuard in CompanionPageClient.tsx",
    );
  }
  return match[0];
}

describe("CompanionPageClient — Work Recognition first refusal (Phase T-1 first slice)", () => {
  it("imports the new function and flag from workRecognitionFallthrough.ts, not a new module", () => {
    const src = source();
    expect(src).toContain(
      'import {\n  isWorkRecognitionFirstRefusalEnabled,\n  resolveWorkRecognitionFirstRefusal,\n} from "@/lib/estateBrain/workRecognitionFallthrough";',
    );
  });

  it("sits immediately before blockedCreateGuard — the audit's highest-blast-radius legacy interceptor", () => {
    const src = source();
    const firstRefusalIdx = src.indexOf("isWorkRecognitionFirstRefusalEnabled()");
    const blockedGuardIdx = src.indexOf("Blocked eligible-Create normalization");
    expect(firstRefusalIdx).toBeGreaterThan(0);
    expect(blockedGuardIdx).toBeGreaterThan(0);
    expect(firstRefusalIdx).toBeLessThan(blockedGuardIdx);
  });

  it("is gated behind the feature flag as the FIRST condition — flag off is a provable no-op", () => {
    const block = firstRefusalBlock();
    expect(block.trim().startsWith("if (\n      isWorkRecognitionFirstRefusalEnabled()")).toBe(
      true,
    );
  });

  it("excludes an active Chamber/Board conversation, an active pending choice, and an already-awaited confirmation — the three exceptions this slice owns", () => {
    const block = firstRefusalBlock();
    expect(block).toContain("!awaitingUserConfirmationRef.current?.active");
    expect(block).toContain("!hasActivePendingChoice()");
    expect(block).toContain("!isChamberMemberConversationActive({");
  });

  it("does not touch Chamber activation logic itself — only reads the existing lock, never modifies chamberConversationLock.ts", () => {
    // Confirms this slice's own promise ("Do not touch: change Chamber
    // activation") by checking the block only ever calls the existing
    // isChamberMemberConversationActive as a read, never redefines it.
    const block = firstRefusalBlock();
    expect(block).not.toMatch(/function isChamberMemberConversationActive/);
  });

  it("calls resolveWorkRecognitionFirstRefusal with the trimmed text and the existing lastAssistantForPrimary — no new classifier", () => {
    const block = firstRefusalBlock();
    expect(block).toContain(
      "resolveWorkRecognitionFirstRefusal(\n        trimmed,\n        lastAssistantForPrimary,\n      )",
    );
  });

  it("opens the workspace only via startFreshCreateFromEstate — the same function the catalog confirm click uses, no new workspace system", () => {
    const block = firstRefusalBlock();
    expect(block).toContain("startFreshCreateFromEstate({");
    expect(block).toContain("workRecognitionResult.openWorkspace.artifactType");
    expect(block).toContain("workRecognitionResult.openWorkspace.initialPrompt");
    // Never a second, alternate open path.
    expect(block).not.toMatch(
      /openCreateWorkspace|bootstrapWorkspaceV2Session|registerCreationDestinationWorkspace/,
    );
  });

  it("finishes the turn the same way every sibling early-return in this function does", () => {
    const block = firstRefusalBlock();
    expect(block).toContain('setInput("");');
    expect(block).toContain("finishEarlyChatTurn();");
    expect(block).toContain("finishLatencyTurn({ localReply: true });");
    expect(block).toContain("return;");
  });

  it("blockedCreateGuard's own definition is untouched by this change", () => {
    const src = source();
    expect(src).toContain(
      "resolveLegacyCreateWorkspaceGuard({\n              section: \"content-generator\",",
    );
  });
});
