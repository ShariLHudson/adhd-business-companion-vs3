/**
 * Connect Create work to a Project Home (creates home if needed).
 * Kept off canonicalWorkRecord.ts so Events light bridge does not pull homeActions.
 */

import { createPersistedProjectHomeWithResult } from "@/lib/projectHomes/homeActions";
import { recommendProjectHome } from "@/lib/projectHomes/roomCatalog";
import type { ProjectHomeRoomId } from "@/lib/projectHomes/types";
import {
  upsertCanonicalWorkRecord,
  type CanonicalWorkRecord,
} from "./canonicalWorkRecord";

export function connectCanonicalWorkToProjectHome(input: {
  work: CanonicalWorkRecord;
  purposeHint?: string;
  preferredRoomId?: ProjectHomeRoomId;
}): {
  work: CanonicalWorkRecord;
  projectHomeId: string | null;
  created: boolean;
  error?: string;
} {
  if (input.work.projectHomeId) {
    return {
      work: input.work,
      projectHomeId: input.work.projectHomeId,
      created: false,
    };
  }

  const hint = `${input.work.title} ${input.work.workType} ${input.purposeHint ?? input.work.purpose}`;
  const roomId =
    input.preferredRoomId ?? recommendProjectHome(hint.trim()).roomId;

  const result = createPersistedProjectHomeWithResult({
    name: input.work.title || `${input.work.workType} Project`,
    purpose:
      input.work.purpose ||
      input.purposeHint ||
      `Continue the ${input.work.workType} shaped in Create.`,
    projectHomeId: roomId,
    currentFocus: "Continue shaping this work",
    nextSuggestedStep: "Open the linked creation and confirm next steps",
    pieces: input.work.sections
      .filter((s) => s.content.trim())
      .map((s) => s.title)
      .slice(0, 8),
  });

  if (!result.persisted || !result.home) {
    return {
      work: input.work,
      projectHomeId: null,
      created: false,
      error: result.error ?? "Could not create Project Home",
    };
  }

  const work = upsertCanonicalWorkRecord({
    ...input.work,
    kind: "creation_with_project",
    status: "planning",
    projectHomeId: result.home.id,
    companionProjectId: result.home.companionProjectId ?? result.home.id,
  });

  return {
    work,
    projectHomeId: result.home.id,
    created: true,
  };
}
