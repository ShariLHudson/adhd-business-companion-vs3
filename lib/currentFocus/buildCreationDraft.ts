/**
 * 066 / 074 — Real Build Draft from Current Focus (no ContentGeneratorPanel / chat).
 * Three legal outcomes: success · honest error · retry in same workspace.
 * Never spin forever. Never claim work is safe without durable verify.
 */

import { buildWorkspaceV2Brief } from "@/lib/createWorkspaceV2";
import { resolvedTypeLabel } from "@/lib/createWorkflow";
import type { CreateWorkflowState } from "@/lib/createWorkflow";
import { logCreateBuild } from "@/lib/createBuild";
import {
  logDraftGenerated,
  logDraftGenerationFailed,
  logDraftRenderedInWorkspace,
  logSharedBuildDraftCalled,
} from "@/lib/createBuildDraft";
import { getPrefs } from "@/lib/companionStore";
import { getOutputLanguageContext } from "@/lib/companionLanguage";
import {
  buildGenerationContextWithBusiness,
  resolveToneForGeneration,
  getSelectedContentToneId,
} from "@/lib/contentAudience";
import {
  extractTitleFromDraftContent,
  resolveHumanReadableTitle,
} from "@/lib/activeWorkspaceRegistry/humanReadableIdentity";
import { registerCreationDestinationWorkspace } from "@/lib/activeWorkspaceRegistry";
import {
  isAuthoritativelyDurable,
  persistCreationDraft,
} from "@/lib/creationDurable";
import {
  getRuntimeCreationRecord,
  upsertRuntimeCreationRecord,
} from "./creationRecord";

/** 074 — Build Draft must not hang; surface retry after this bound. */
export const BUILD_DRAFT_TIMEOUT_MS = 45_000;

export type BuildCreationDraftResult = {
  ok: boolean;
  draftContent: string | null;
  updatedWorkflow: CreateWorkflowState;
  failureMessage: string | null;
  retryAvailable: boolean;
};

function answersPreservedMessage(creationId: string): string {
  if (isAuthoritativelyDurable(creationId)) {
    return "The draft didn't finish cleanly. Your answers are still saved — Retry Build Draft when you're ready.";
  }
  return "The draft didn't finish cleanly. Stay in this workspace and try Build Draft again — I could not verify a durable save yet.";
}

export async function buildCreationDraftFromFocus(input: {
  workflow: CreateWorkflowState;
  creationId: string;
}): Promise<BuildCreationDraftResult> {
  const typeLabel =
    resolvedTypeLabel(input.workflow) || input.workflow.selectedTypeLabel || "Draft";
  const brief = buildWorkspaceV2Brief(input.workflow);

  logSharedBuildDraftCalled({
    type: typeLabel,
    fromChat: false,
    mode: "create_only",
  });
  logCreateBuild("estateFocusBuildDraft", {
    itemType: typeLabel,
    sessionId: input.creationId,
  });

  if (!brief.trim() || brief.trim() === `Creating: ${typeLabel}`) {
    return {
      ok: false,
      draftContent: null,
      updatedWorkflow: input.workflow,
      failureMessage:
        "Add a little more in Current Focus first — one section is enough — then try Build Draft again.",
      retryAvailable: true,
    };
  }

  const buildingWorkflow: CreateWorkflowState = {
    ...input.workflow,
    draftStatus: "building",
    questionMode: "current_focus",
  };

  try {
    const { contentLanguageHint } = getOutputLanguageContext(getPrefs());
    const toneForApi = resolveToneForGeneration(getSelectedContentToneId());
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), BUILD_DRAFT_TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: typeLabel,
          brief,
          tone: toneForApi,
          context: buildGenerationContextWithBusiness({}),
          contentLanguageHint,
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }

    const data = (await res.json()) as {
      result?: string;
      error?: string;
    };

    if (!res.ok || !data.result?.trim()) {
      logDraftGenerationFailed(typeLabel, data.error || "generation-failed");
      return {
        ok: false,
        draftContent: null,
        updatedWorkflow: {
          ...buildingWorkflow,
          draftStatus: "error",
        },
        failureMessage: answersPreservedMessage(input.creationId),
        retryAvailable: true,
      };
    }

    const content = data.result.trim();
    logDraftGenerated(typeLabel, content.length);
    logDraftRenderedInWorkspace(typeLabel, content.length);

    // 073 — promote a real title from the draft when current title is bare type
    const draftTitle = extractTitleFromDraftContent(content, typeLabel);
    const promotedTitle = resolveHumanReadableTitle({
      existingTitle: buildingWorkflow.selectedTemplateName,
      draftTitle,
      requestText: buildingWorkflow.selectedTemplateName,
      creationType: typeLabel,
    });

    const candidateWorkflow: CreateWorkflowState = {
      ...buildingWorkflow,
      draftStatus: "ready",
      draftContent: content,
      buildApproved: true,
      step: "improve",
      readinessConfirmed: true,
      workspacePhaseLabel: "Draft ready",
      selectedTemplateName: promotedTitle,
    };

    // Authoritative durable persist — Draft Ready only after verify
    const durable = await persistCreationDraft({
      workflow: candidateWorkflow,
      draftContent: content,
    });
    if (!durable.ok) {
      return {
        ok: false,
        draftContent: null,
        updatedWorkflow: {
          ...buildingWorkflow,
          draftStatus: "error",
        },
        failureMessage: durable.message || answersPreservedMessage(input.creationId),
        retryAvailable: true,
      };
    }

    const record = getRuntimeCreationRecord(input.creationId);
    if (record) {
      upsertRuntimeCreationRecord({
        ...record,
        draftContent: content,
        title: durable.record.title || promotedTitle,
        selectedTemplateName: durable.record.title || promotedTitle,
      });
    }

    const updatedWorkflow: CreateWorkflowState = {
      ...candidateWorkflow,
      selectedTemplateName: durable.record.title || promotedTitle,
      sessionId: durable.workspaceId,
    };
    registerCreationDestinationWorkspace(updatedWorkflow);

    return {
      ok: true,
      draftContent: content,
      updatedWorkflow,
      failureMessage: null,
      retryAvailable: false,
    };
  } catch (err) {
    const aborted =
      (err instanceof Error && err.name === "AbortError") ||
      (typeof DOMException !== "undefined" &&
        err instanceof DOMException &&
        err.name === "AbortError");
    logDraftGenerationFailed(
      typeLabel,
      aborted ? "timeout" : "network-or-parse",
    );
    return {
      ok: false,
      draftContent: null,
      updatedWorkflow: {
        ...buildingWorkflow,
        draftStatus: "error",
      },
      failureMessage: aborted
        ? "Build Draft is taking too long. Your answers should still be in this workspace — Retry when you're ready."
        : answersPreservedMessage(input.creationId),
      retryAvailable: true,
    };
  }
}
