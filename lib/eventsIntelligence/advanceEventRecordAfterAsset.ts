/**
 * After an asset is created/resumed, keep the Event Record in sync so
 * recommendations and lifecycle advance (J-001: Agenda Created → Lifecycle Updated).
 */

import {
  eventLifecyclePhaseForUniversalState,
  resolveUniversalCreationStateFromEvent,
} from "@/lib/universalCreationStateMachine";
import { getEventAssetDefinition } from "./eventAssetRegistry";
import {
  getEventAssetTemplate,
  listEventAssetTemplates,
} from "./eventCapabilityRegistry/templates";
import { getEventSection, updateEventSection } from "./eventSections";
import {
  inferNextAction,
  phaseToRuntimeState,
} from "./lifecycle";
import { upsertEventRecord } from "./eventRecordStore";
import { syncEventRecordToProjects } from "./projectsBridge";
import type { EventRecord, EventSectionId } from "./types";

function seedContentForAsset(
  assetTypeId: string,
  templateId?: string | null,
): string {
  const template =
    (templateId ? getEventAssetTemplate(templateId) : null) ??
    listEventAssetTemplates(assetTypeId)[0] ??
    null;
  if (template?.starterOutline?.length) {
    return template.starterOutline.map((line) => `• ${line}`).join("\n");
  }
  const def = getEventAssetDefinition(assetTypeId);
  return `${def?.userFacingName ?? "Asset"} draft started.`;
}

/**
 * Fill the planning section (if empty) and sync lifecycle from universal state.
 */
export function advanceEventRecordAfterAsset(input: {
  record: EventRecord;
  sectionId: EventSectionId;
  assetTypeId: string;
  templateId?: string | null;
}): EventRecord {
  let next = input.record;
  const section = getEventSection(next.sections, input.sectionId);
  if (!section?.content.trim()) {
    const content = seedContentForAsset(input.assetTypeId, input.templateId);
    const sections = updateEventSection(
      next.sections,
      input.sectionId,
      content,
      "confirmed",
    );
    next = syncEventRecordToProjects(
      upsertEventRecord({
        ...next,
        sections,
        nextAction: inferNextAction({ ...next, sections }),
      }),
    );
  }

  const universalState = resolveUniversalCreationStateFromEvent(next);
  const lifecyclePhase = eventLifecyclePhaseForUniversalState(universalState);
  const runtimeState = phaseToRuntimeState(lifecyclePhase);

  if (
    next.lifecyclePhase !== lifecyclePhase ||
    next.runtimeState !== runtimeState
  ) {
    next = upsertEventRecord({
      ...next,
      lifecyclePhase,
      runtimeState,
      nextAction: inferNextAction({
        ...next,
        lifecyclePhase,
        runtimeState,
      }),
    });
  }

  return next;
}
