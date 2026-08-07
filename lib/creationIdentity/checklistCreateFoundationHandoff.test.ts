/**
 * Checklist → Create Foundation handoff.
 *
 * Rewritten 2026-08-07 (Phase C-1, Create Foundation convergence — see
 * docs/create-experience/CREATE_FOUNDATION_PHASE_C_PLAN.md §3). The
 * original second test asserted a since-removed mechanism
 * (CREATE_FOUNDATION_HANDOFF / openUniversalCreationFromText, certified
 * 2026-07-20 per docs/create-experience/standards/076_CREATE_FOUNDATION_CERTIFICATION.md)
 * that bootstrapped the workspace directly from classified text, skipping
 * any question conversation entirely — its own top comment said so plainly:
 * "Does not patch UC questions — Checklist must not enter questionIndex
 * loops." That design is superseded, not merely unimplemented: the
 * canonical Create journey (Recognition → entranceUnderstanding.ts →
 * Working Memory → Current Focus) requires the 5-question understanding
 * conversation to run for every entry point, including chat-classified
 * Create Foundation types — it does not skip straight to the workspace.
 *
 * What survives from the original intent, unchanged and still required:
 * Checklist (and every Create Foundation direct type) must never enter
 * Universal Creation's own discovery-interview loop
 * (lib/universalCreation/orchestrator.ts) — that constraint is still true
 * and is exactly what shouldRouteDirectlyToCreateFoundation still
 * enforces. What changed is what happens on the "true" branch: a typed
 * entranceUnderstanding.ts conversation (the same one the Create entrance
 * catalog already uses), not a direct-bootstrap skip.
 */

import { describe, expect, it } from "vitest";
import {
  classificationTypeFromWorkingIntent,
  deriveCreationIdentity,
  isDocumentClassificationType,
} from "./deriveCreationIdentity";
import { resolveCreateFoundationClassification } from "./createFoundationRouting";
import { bootstrapWorkspaceV2Session } from "@/lib/createWorkspaceV2";
import { detectUniversalDocumentType } from "@/lib/universalCreation";
import { shouldEnterUniversalCreation } from "@/lib/universalCreation/orchestrator";
import {
  resetWorkRecognitionSessionForTests,
  resolveCreateFoundationRecognition,
} from "@/lib/estateBrain/workRecognitionFallthrough";
import { resetEntranceUnderstandingForTests } from "@/lib/createEstate/entranceUnderstanding";

describe("Checklist Create Foundation handoff", () => {
  it("classifies Checklist as Create Foundation document type", () => {
    const text =
      "I want to start a brand new project for a client onboarding checklist";
    expect(detectUniversalDocumentType(text)).toBe("checklist");
    const id = deriveCreationIdentity({ originalRequest: text });
    expect(id.workingIntent).toBe("Create Checklist");
    const type = classificationTypeFromWorkingIntent(id.workingIntent);
    expect(type).toBe("Checklist");
    expect(isDocumentClassificationType(type)).toBe(true);
    const boot = bootstrapWorkspaceV2Session(type);
    expect(boot.session.typeLabel).toBe("Checklist");
  });

  it("Checklist still bypasses Universal Creation's own discovery loop (the surviving requirement)", () => {
    const text = "I want to create a client onboarding checklist";
    // Still true and still enforced — Universal Creation's own interview
    // must never claim a Create Foundation direct type.
    expect(shouldEnterUniversalCreation(text)).toBe(false);
    expect(
      resolveCreateFoundationClassification(text).routeDirectlyToCreateFoundation,
    ).toBe(true);
  });

  it("chat-typed Checklist request reaches the typed understanding conversation, not a direct workspace bootstrap", () => {
    resetWorkRecognitionSessionForTests();
    resetEntranceUnderstandingForTests();
    const text = "I want to create a client onboarding checklist";
    const result = resolveCreateFoundationRecognition(text);
    // A question, not an immediate workspace open — the abandoned
    // direct-bootstrap expectation is exactly what's removed here.
    expect(result?.kind).toBe("question");
    if (result?.kind !== "question") return;
    expect(result.session.catalogTypeLabel).toBe("Checklist");
    // Same understanding conversation entranceUnderstanding.ts's own
    // catalog path uses — never a murky/uncertainty-toned question.
    expect(result.message).not.toMatch(/murky/i);
  });
});

