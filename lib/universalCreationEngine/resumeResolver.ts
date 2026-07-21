/**
 * 051 — Resume / return-state resolution.
 */

import { getActiveEventRecord, getEventRecord } from "@/lib/eventsIntelligence";
import { resolveLargerCreation } from "@/lib/creationEcosystem";
import { assembleUniversalCreationContext } from "./creationContextAssembler";
import { resolveCreationWorkspace } from "./workspaceResolver";
import type { CreationResolution, UniversalCreationContext } from "./types";

export function resolveResumeState(input?: {
  eventRecordId?: string | null;
  creationId?: string | null;
}): {
  resumed: boolean;
  context: UniversalCreationContext | null;
  workspaceId: string | null;
} {
  const creation = resolveLargerCreation({
    eventRecordId: input?.eventRecordId,
    creationId: input?.creationId,
    preferActiveEvent: true,
  });
  const record =
    (input?.eventRecordId
      ? getEventRecord(input.eventRecordId)
      : null) ??
    creation?.eventRecord ??
    getActiveEventRecord();

  if (!record && !creation) {
    return { resumed: false, context: null, workspaceId: null };
  }

  const resolution: CreationResolution = {
    found: true,
    creationRecordId: creation?.creationId ?? record?.id ?? null,
    workspaceId: record?.id ?? creation?.creationId ?? null,
    eventRecordId: record?.id ?? null,
    canonicalWorkId: creation?.canonicalWork?.id ?? record?.canonicalWorkId ?? null,
    projectHomeId: creation?.projectHomeId ?? record?.projectHomeId ?? null,
    blueprint: null,
    isDuplicateAttempt: false,
    resume: true,
    reason: "resume_return_state",
  };

  const workspace = resolveCreationWorkspace(resolution);
  const context = assembleUniversalCreationContext({
    resolution,
    record: workspace.record ?? record,
    workspace: workspace.snapshot,
    latestUserGoal: "Continue where we left off",
  });

  return {
    resumed: true,
    context,
    workspaceId: workspace.workspaceId,
  };
}
