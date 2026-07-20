/**
 * Durable mutation contract for Begin / Focus / Draft / Rename.
 * Sequence: validate → DB write → read-back verify → cache → then UI may advance.
 */

import type { CreateWorkflowState } from "@/lib/createWorkflow";
import {
  getRuntimeCreationRecord,
  type RuntimeCreationRecord,
} from "@/lib/currentFocus/creationRecord";
import { applyVerifiedCreationToCaches } from "./applyVerified";
import { buildAuthoritativeFromWorkflow } from "./mapping";
import {
  fetchAuthoritativeCreation,
  getAuthenticatedCreationUserId,
  upsertAuthoritativeCreation,
} from "./repository";
import type {
  AuthoritativeCreationRecord,
  DurableMutationResult,
} from "./types";
import { durableFail } from "./types";

export type PersistCreationMutationInput = {
  workflow: CreateWorkflowState;
  runtime?: RuntimeCreationRecord | null;
  originalRequest?: string;
  /** When set, bump from this previous version (fetched if omitted). */
  previous?: AuthoritativeCreationRecord | null;
};

async function resolvePrevious(
  workspaceId: string | null | undefined,
  provided?: AuthoritativeCreationRecord | null
): Promise<AuthoritativeCreationRecord | null> {
  if (provided) return provided;
  const id = workspaceId?.trim();
  if (!id) return null;
  return fetchAuthoritativeCreation(id);
}

/**
 * Core durable persist — never returns ok without verified DB write.
 */
export async function persistCreationMutation(
  input: PersistCreationMutationInput
): Promise<DurableMutationResult<AuthoritativeCreationRecord>> {
  const userId = await getAuthenticatedCreationUserId();
  if (!userId) {
    return durableFail(
      "AUTH_REQUIRED",
      "Sign in so I can keep this work safe across refresh.",
      true
    );
  }

  const workspaceId =
    input.workflow.eventRecordId?.trim() ||
    input.workflow.sessionId?.trim() ||
    null;
  const previous = await resolvePrevious(workspaceId, input.previous);
  const runtime =
    input.runtime ??
    (workspaceId ? getRuntimeCreationRecord(workspaceId) : null);

  const next = buildAuthoritativeFromWorkflow({
    workflow: input.workflow,
    runtime,
    userId,
    previous,
    originalRequest: input.originalRequest,
  });

  if (!next.workspaceId.trim()) {
    return durableFail(
      "INVALID_ID",
      "I need a workspace identity before I can save.",
      false
    );
  }

  const result = await upsertAuthoritativeCreation(next);
  if (!result.ok) return result;

  applyVerifiedCreationToCaches(result.record, input.workflow);
  return result;
}

/** Begin — establish durable Workspace ID before meaningful work. */
export async function persistCreationBegin(input: {
  workflow: CreateWorkflowState;
  originalRequest?: string;
}): Promise<DurableMutationResult<AuthoritativeCreationRecord>> {
  return persistCreationMutation({
    workflow: input.workflow,
    originalRequest: input.originalRequest,
    previous: null,
  });
}

/** Current Focus answer — durable before advance. */
export async function persistCreationFocusAnswer(input: {
  workflow: CreateWorkflowState;
  runtime?: RuntimeCreationRecord | null;
}): Promise<DurableMutationResult<AuthoritativeCreationRecord>> {
  return persistCreationMutation(input);
}

/** Draft — require answers present, then persist draft body. */
export async function persistCreationDraft(input: {
  workflow: CreateWorkflowState;
  draftContent: string;
}): Promise<DurableMutationResult<AuthoritativeCreationRecord>> {
  const answers = input.workflow.sectionContent ?? {};
  const answered = Object.values(answers).filter((v) => v?.trim()).length;
  if (answered < 1) {
    return durableFail(
      "PREREQUISITES",
      "Add at least one Current Focus answer before building a draft.",
      true
    );
  }
  // Verify prior answers were durably saved when possible
  const id =
    input.workflow.sessionId?.trim() || input.workflow.eventRecordId?.trim();
  if (id) {
    const prior = await fetchAuthoritativeCreation(id);
    if (!prior) {
      return durableFail(
        "PREREQUISITES_NOT_DURABLE",
        "I couldn't confirm your answers are saved yet. Retry the last Focus answer, then Build Draft.",
        true
      );
    }
  }
  return persistCreationMutation({
    workflow: {
      ...input.workflow,
      draftContent: input.draftContent,
      draftStatus: "ready",
      workspacePhaseLabel: "Draft ready",
    },
  });
}

/** Rename — persist title before confirming success. */
export async function persistCreationRename(input: {
  workflow: CreateWorkflowState;
  nextTitle: string;
}): Promise<DurableMutationResult<AuthoritativeCreationRecord>> {
  const title = input.nextTitle.trim();
  if (!title) {
    return durableFail("INVALID_TITLE", "Enter a name, then try again.", true);
  }
  return persistCreationMutation({
    workflow: {
      ...input.workflow,
      selectedTemplateName: title,
    },
  });
}

/**
 * Archive — remove from Continue Your Work in the authoritative store.
 * Local-only workspaces (never durable) return ok without a DB row.
 */
export async function persistCreationArchive(
  workspaceId: string,
): Promise<DurableMutationResult<AuthoritativeCreationRecord | null>> {
  const id = workspaceId.trim();
  if (!id) {
    return durableFail("INVALID_ID", "I need a workspace identity to remove.", false);
  }

  const userId = await getAuthenticatedCreationUserId();
  if (!userId) {
    // Signed-out / local-only — caller already cleared Continue surfaces.
    return {
      ok: true,
      durable: true,
      record: null,
      workspaceId: id,
      persistedAt: new Date().toISOString(),
      version: 0,
    };
  }

  const previous = await fetchAuthoritativeCreation(id);
  if (!previous) {
    return {
      ok: true,
      durable: true,
      record: null,
      workspaceId: id,
      persistedAt: new Date().toISOString(),
      version: 0,
    };
  }

  const archived: AuthoritativeCreationRecord = {
    ...previous,
    status: "archived",
    version: previous.version + 1,
    updatedAt: new Date().toISOString(),
  };
  return upsertAuthoritativeCreation(archived);
}
