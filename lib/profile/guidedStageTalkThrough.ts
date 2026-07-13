/**
 * "Talk This Through With Shari" — stage-scoped help packet.
 * Never auto-saves; returns member to the same stage (no navigation).
 */

import {
  collectApprovedBusinessEstateContext,
  requestGuidedFieldHelp,
} from "@/lib/profile/guidedFieldHelp";
import { getPrimaryAvatar } from "@/lib/companionStore";
import type { GuidedStageDefinition } from "@/lib/profile/guidedStageTypes";
import {
  GUIDED_STAGES_MAY_AUTO_NAVIGATE,
  GUIDED_STAGES_MAY_AUTO_SAVE,
} from "@/lib/profile/guidedStageTypes";
import type { GuidanceHelpMode } from "@/lib/profile/guidedFieldTypes";

export function buildStageTalkThroughPrompt(
  stage: GuidedStageDefinition,
  draftValues: Record<string, string>,
): string {
  const avatar = getPrimaryAvatar();
  const lines = [
    `GUIDED STAGE CONVERSATION — Talk This Through With Shari`,
    `Stage: ${stage.title} (${stage.id})`,
    `Area: ${stage.areaId}`,
    stage.description,
    `Fields in this stage: ${stage.fieldPaths.join(", ")}`,
    "Ask ONE question at a time.",
    "Use approved Business Estate and People I Help context — do not re-ask known answers.",
    "Summarize what you heard before offering drafts.",
    "Offer draft suggestions for relevant fields; explain why each fits.",
    "Require explicit member approval before applying any draft.",
    "Stay in this stage — do not navigate away.",
    `Contract: autoSave=${GUIDED_STAGES_MAY_AUTO_SAVE} autoNavigate=${GUIDED_STAGES_MAY_AUTO_NAVIGATE}`,
  ];

  const approved = collectApprovedBusinessEstateContext();
  const known = Object.entries(approved);
  if (known.length) {
    lines.push("Approved Business Estate context:");
    for (const [path, value] of known) {
      lines.push(`- ${path}: ${value}`);
    }
  }

  if (avatar) {
    const summary = [avatar.name, avatar.who, avatar.tagline]
      .filter(Boolean)
      .join(" · ");
    if (summary) lines.push(`Primary People I Help: ${summary}`);
  }

  lines.push("Current draft answers in this stage (not saved unless member saves):");
  for (const path of stage.fieldPaths) {
    if (path === "people-i-help.link") continue;
    const key = path.includes(".") ? path.slice(path.indexOf(".") + 1) : path;
    const value = draftValues[path] ?? draftValues[key] ?? "";
    lines.push(`- ${path}: ${value.trim() || "(empty)"}`);
  }

  return lines.join("\n");
}

export function requestStageTalkThrough(
  stage: GuidedStageDefinition,
  draftValues: Record<string, string>,
): void {
  const firstField =
    stage.fieldPaths.find((p) => p !== "people-i-help.link") ?? stage.id;
  const parsed = firstField.includes(".")
    ? {
        sectionId: firstField.slice(0, firstField.indexOf(".")),
        fieldKey: firstField.slice(firstField.indexOf(".") + 1),
      }
    : { sectionId: stage.areaId, fieldKey: firstField };

  const helpMode: GuidanceHelpMode = "help_me_develop";
  requestGuidedFieldHelp({
    sectionId: parsed.sectionId,
    fieldKey: parsed.fieldKey,
    fieldPath: firstField,
    helpMode,
    currentValue:
      draftValues[firstField] ?? draftValues[parsed.fieldKey] ?? "",
    approvedBusinessContext: collectApprovedBusinessEstateContext(),
    relatedFieldValues: {},
    question: `Talk through: ${stage.title}`,
    definition: stage.description,
    guidedQuestions: [...stage.fieldPaths],
  });

  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(
        "companion-guided-stage-talk-v1",
        buildStageTalkThroughPrompt(stage, draftValues),
      );
    } catch {
      /* ignore */
    }
  }
}

export function readStageTalkThroughPrompt(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem("companion-guided-stage-talk-v1");
  } catch {
    return null;
  }
}
