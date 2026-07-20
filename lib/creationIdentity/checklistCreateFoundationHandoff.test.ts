/**
 * Checklist → Create Foundation handoff (restore standard document runtime).
 * Does not patch UC questions — Checklist must not enter questionIndex loops.
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  classificationTypeFromWorkingIntent,
  deriveCreationIdentity,
  isDocumentClassificationType,
} from "./deriveCreationIdentity";
import { bootstrapWorkspaceV2Session } from "@/lib/createWorkspaceV2";
import { detectUniversalDocumentType } from "@/lib/universalCreation";

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

  it("CompanionPageClient wires Checklist past UC questions into Create Foundation", () => {
    const client = readFileSync(
      resolve(process.cwd(), "app/companion/CompanionPageClient.tsx"),
      "utf8",
    );
    expect(client).toContain("CREATE_FOUNDATION_HANDOFF");
    expect(client).toContain("resolveCreateFoundationClassification");
    expect(client).toContain("shouldRouteDirectlyToCreateFoundation");
    expect(client).toContain("openUniversalCreationFromText");
    expect(client).toContain(
      "never fall through to tryUniversalCreationFlow",
    );
    const createOpen = client.match(
      /function completeImmediateCreateOpen\([\s\S]*?\r?\n  function /,
    )?.[0];
    expect(createOpen).toContain("openUniversalCreationFromText");
  });
});

