/**
 * 066 / 074+ — Sole Creation submission path.
 * Advances Current Focus only after authoritative durable verify.
 */

import { registerCreationDestinationWorkspace } from "@/lib/activeWorkspaceRegistry";
import { persistCreationFocusAnswer } from "@/lib/creationDurable";
import { persistCreationContinuitySnapshot } from "@/lib/creationContinuity";
import { applyEventWorkspaceToCreateWorkflow } from "@/lib/eventCreationWorkspace";
import { traceWorkspacePersist } from "@/lib/activeWorkspaceRegistry/workspacePersistTrace";
import {
  applyFoundationAnswerToEventRecord,
  fillEventSectionFromGuide,
  getEventRecord,
  upsertEventRecord,
} from "@/lib/eventsIntelligence";
import type { CreateWorkflowState } from "@/lib/createWorkflow";
import {
  authorizeCreationEgress,
  emptyCreationEvidence,
  isCreationResultApplicable,
} from "@/lib/trustKernel";
import {
  applyAnswerToRuntimeCreationRecord,
  ensureRuntimeCreationRecord,
  mergeRuntimeRecordIntoWorkflow,
} from "./creationRecord";
import { resolveCanonicalCurrentFocus } from "./resolveCanonicalFocus";
import type {
  CanonicalCurrentFocus,
  SubmitCurrentFocusResponseInput,
  SubmitCurrentFocusResponseResult,
} from "./types";

const IDEAS_BY_SECTION: Record<string, string> = {
  outcomes:
    "Examples: leave with a clear next offer, reconnect with peers, or practice one skill they'll use Monday.",
  audience:
    "Examples: coaches building a signature retreat, founders in year one, or members of your community circle.",
  purpose:
    "Examples: deepen relationships, launch a new offer, or create a calm planning weekend.",
  agenda:
    "Try a simple arc: welcome → one deep session → break → practice → close with next steps.",
  dates: "Even a season helps — spring weekend, or a specific month you're aiming for.",
  venue: "Home, rented room, or virtual — start with what feels easiest to host.",
  topic: "One clear topic beats a broad list — what is this really about?",
  subject: "A subject line that names the benefit works well — even a rough draft.",
  offer: "Name who it's for and what changes for them.",
  steps: "Three to five plain steps is enough to start.",
};

export function ideasGuidanceForFocus(focus: CanonicalCurrentFocus): string {
  const key = focus.sectionId || focus.assetTypeId || "";
  return (
    IDEAS_BY_SECTION[key] ||
    IDEAS_BY_SECTION[focus.title.toLowerCase()] ||
    "There's no perfect answer — a rough phrase is enough to keep us moving."
  );
}

function fail(
  preserved: string,
  message: string,
  focus: CanonicalCurrentFocus | null,
  workflow: CreateWorkflowState | null | undefined,
): SubmitCurrentFocusResponseResult & {
  updatedWorkflow?: CreateWorkflowState | null;
} {
  return {
    ok: false,
    preservedResponse: preserved,
    confirmationGuidance: null,
    failureMessage: message,
    retryAvailable: true,
    nextFocus: focus,
    realityUpdated: false,
    trustAuthorized: false,
    advanced: false,
    durable: false,
    updatedWorkflow: workflow ?? null,
  };
}

async function persistAndAuthorize(input: {
  requestId: string;
  contextVersion: number;
  creationId: string;
  preserved: string;
  focus: CanonicalCurrentFocus;
  updatedWorkflow: CreateWorkflowState;
  proposedMessage: string;
}): Promise<
  SubmitCurrentFocusResponseResult & {
    updatedWorkflow?: CreateWorkflowState | null;
  }
> {
  const durable = await persistCreationFocusAnswer({
    workflow: input.updatedWorkflow,
  });

  traceWorkspacePersist(
    "focus_save",
    input.creationId,
    durable.ok,
    durable.ok
      ? `v=${durable.version}`
      : `${durable.errorCode}:${durable.message}`,
  );

  if (!durable.ok) {
    return fail(
      input.preserved,
      durable.message ||
        "That didn't finish saving securely. Your answer is still here — Retry.",
      input.focus,
      // Do not advance — keep pre-answer workflow out of caller via null updated
      null,
    );
  }

  const merged =
    durable.record &&
    ({
      ...input.updatedWorkflow,
      sessionId: durable.workspaceId,
      selectedTemplateName: durable.record.title,
      sectionContent: { ...durable.record.payload.answers },
      draftContent: durable.record.payload.draft,
    } as CreateWorkflowState);

  registerCreationDestinationWorkspace(merged);

  const evidence = emptyCreationEvidence({
    actionId: input.requestId,
    requestId: input.requestId,
    turnId: input.requestId,
    creationId: durable.workspaceId,
    operation: "current_focus_submit",
    intentRecognized: true,
    recordCreated: true,
    recordPersisted: true,
    workspaceBound: true,
    workspaceMounted: true,
    memberVisible: true,
    resumeIndexed: true,
    currentFocusAvailable: true,
    failureState: null,
    contextVersion: input.contextVersion,
  });

  const egress = authorizeCreationEgress({
    claim: "updated",
    proposedMessage: input.proposedMessage,
    evidence,
  });

  if (!egress.authorized) {
    return fail(
      input.preserved,
      egress.text ||
        "That didn't finish saving cleanly. Your answer is still here — Retry.",
      input.focus,
      null,
    );
  }

  const nextFocus = resolveCanonicalCurrentFocus({
    creationId: durable.workspaceId,
    workflow: merged,
  });

  return {
    ok: true,
    preservedResponse: input.preserved,
    confirmationGuidance: egress.text,
    failureMessage: null,
    retryAvailable: false,
    nextFocus,
    realityUpdated: true,
    trustAuthorized: true,
    advanced: true,
    durable: true,
    version: durable.version,
    updatedWorkflow: merged,
  };
}

export async function submitCurrentFocusResponse(
  input: SubmitCurrentFocusResponseInput,
  opts?: {
    activeRequestId?: string;
    activeContextVersion?: number;
    activeCreationId?: string | null;
    workflow?: CreateWorkflowState | null;
  },
): Promise<
  SubmitCurrentFocusResponseResult & {
    updatedWorkflow?: CreateWorkflowState | null;
  }
> {
  const preserved = input.response;
  const applicable = isCreationResultApplicable({
    resultRequestId: input.requestId,
    activeRequestId: opts?.activeRequestId ?? input.requestId,
    resultContextVersion: input.contextVersion,
    activeContextVersion:
      opts?.activeContextVersion ?? input.contextVersion,
    resultCreationId: input.creationId,
    activeCreationId: opts?.activeCreationId ?? input.creationId,
  });

  if (!applicable) {
    return fail(
      preserved,
      "That answer arrived a moment late — it's still here. Try Submit again when you're ready.",
      resolveCanonicalCurrentFocus({
        creationId: input.creationId,
        workflow: opts?.workflow,
      }),
      opts?.workflow,
    );
  }

  if (opts?.workflow) {
    ensureRuntimeCreationRecord({
      ...opts.workflow,
      sessionId: opts.workflow.sessionId || input.creationId,
    });
  }

  const focus = resolveCanonicalCurrentFocus({
    creationId: input.creationId,
    contextVersion: input.contextVersion,
    workflow: opts?.workflow,
  });
  if (!focus || focus.focusId !== input.focusId) {
    return fail(
      preserved,
      "This Focus moved — your words are still here. Retry against the current question.",
      focus,
      opts?.workflow,
    );
  }

  if (input.responseType === "ideas") {
    return {
      ok: true,
      preservedResponse: preserved,
      confirmationGuidance: ideasGuidanceForFocus(focus),
      failureMessage: null,
      retryAvailable: false,
      nextFocus: focus,
      realityUpdated: false,
      trustAuthorized: true,
      advanced: false,
      durable: true,
      updatedWorkflow: opts?.workflow ?? null,
    };
  }

  if (input.responseType === "unsure") {
    return {
      ok: true,
      preservedResponse: preserved,
      confirmationGuidance:
        "That's fine. A rough guess works — or use Give me ideas and stay right here.",
      failureMessage: null,
      retryAvailable: false,
      nextFocus: focus,
      realityUpdated: false,
      trustAuthorized: true,
      advanced: false,
      durable: true,
      updatedWorkflow: opts?.workflow ?? null,
    };
  }

  if (input.responseType === "skip") {
    const eventRecord = getEventRecord(input.creationId);
    let updatedWorkflow = opts?.workflow ?? null;
    if (!eventRecord && focus.sectionId) {
      const nextRecord = applyAnswerToRuntimeCreationRecord(
        input.creationId,
        focus.sectionId,
        "",
        { skip: true },
      );
      if (nextRecord && updatedWorkflow) {
        updatedWorkflow = mergeRuntimeRecordIntoWorkflow(
          updatedWorkflow,
          nextRecord,
        );
      }
    }
    if (!updatedWorkflow) {
      return fail(
        preserved,
        "I couldn't hold this creation for a moment. Retry stays in this workspace.",
        focus,
        opts?.workflow,
      );
    }
    return persistAndAuthorize({
      requestId: input.requestId,
      contextVersion: input.contextVersion,
      creationId: input.creationId,
      preserved,
      focus,
      updatedWorkflow,
      proposedMessage: "We can come back to that.",
    });
  }

  const trimmed = input.response.trim();
  if (!trimmed) {
    return fail(
      preserved,
      "Add a few words when you're ready — I'll wait here.",
      focus,
      opts?.workflow,
    );
  }

  const eventRecord = getEventRecord(input.creationId);

  // —— Event Record path (cache) + authoritative durable ——
  if (eventRecord) {
    try {
      let updated = eventRecord;
      if (focus.focusId.startsWith("q-") || focus.sectionId) {
        updated = applyFoundationAnswerToEventRecord(eventRecord, trimmed);
      } else if (focus.assetTypeId === "agenda") {
        updated = fillEventSectionFromGuide(eventRecord, "agenda", trimmed);
        updated = upsertEventRecord({
          ...updated,
          nextAction: "Refine agenda",
        });
      } else {
        updated = upsertEventRecord({
          ...eventRecord,
          conversationContext: trimmed,
        });
      }

      persistCreationContinuitySnapshot(updated, null);

      let updatedWorkflow = applyEventWorkspaceToCreateWorkflow(
        {
          ...(opts?.workflow ?? ({} as CreateWorkflowState)),
          sessionId: updated.id,
          eventRecordId: updated.id,
          selectedTypeLabel:
            opts?.workflow?.selectedTypeLabel ||
            updated.eventTypeLabel ||
            "Event Plan",
          selectedTemplateName:
            opts?.workflow?.selectedTemplateName || updated.title,
          workspaceFirst: true,
          questionMode: "current_focus",
        },
        updated,
      );
      ensureRuntimeCreationRecord(updatedWorkflow);

      return persistAndAuthorize({
        requestId: input.requestId,
        contextVersion: input.contextVersion,
        creationId: updated.id,
        preserved,
        focus,
        updatedWorkflow,
        proposedMessage: `Got it — that's part of your ${(updated.eventTypeLabel || "event").trim().toLowerCase()} now.`,
      });
    } catch {
      return fail(
        preserved,
        "Something got tangled saving that. Your answer is still here — Retry keeps you on this Focus.",
        focus,
        opts?.workflow,
      );
    }
  }

  // —— Runtime Creation path + authoritative durable ——
  try {
    const sectionId =
      focus.sectionId ||
      (focus.focusId.startsWith("section:")
        ? focus.focusId.slice("section:".length)
        : null);

    const nextRecord = applyAnswerToRuntimeCreationRecord(
      input.creationId,
      sectionId,
      trimmed,
    );
    if (!nextRecord) {
      return fail(
        preserved,
        "I couldn't hold this creation for a moment. Your answer is still here — Retry stays in this workspace.",
        focus,
        opts?.workflow,
      );
    }

    const updatedWorkflow = opts?.workflow
      ? mergeRuntimeRecordIntoWorkflow(opts.workflow, nextRecord)
      : mergeRuntimeRecordIntoWorkflow(
          {
            sessionId: nextRecord.id,
            selectedTypeLabel: nextRecord.typeLabel,
            selectedTemplateName: nextRecord.title,
            sectionContent: nextRecord.sectionContent,
            templateSections: nextRecord.templateSections ?? undefined,
            workspaceFirst: true,
            questionMode: "current_focus",
          } as CreateWorkflowState,
          nextRecord,
        );

    return persistAndAuthorize({
      requestId: input.requestId,
      contextVersion: input.contextVersion,
      creationId: nextRecord.id,
      preserved,
      focus,
      updatedWorkflow,
      proposedMessage: "Got it — that's part of your creation now.",
    });
  } catch {
    return fail(
      preserved,
      "Something got tangled saving that. Your answer is still here — Retry keeps you on this Focus.",
      focus,
      opts?.workflow,
    );
  }
}
