/**
 * Member-facing object answers — warm, from Knowledge Base only.
 */

import type { EstateObjectRecord } from "./types";
import type { ObjectIntentKind } from "./types";

export function formatObjectIdentification(
  object: EstateObjectRecord,
  intentKind: ObjectIntentKind,
): string {
  if (object.objectType === "character") {
    return [
      `That is ${object.officialName}.`,
      object.description,
      object.story,
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (intentKind === "use_request") {
    return formatObjectUseResponse(object);
  }

  return [
    `That's the ${object.officialName}.`,
    object.description,
    object.purpose,
  ]
    .filter(Boolean)
    .join(" ");
}

export function formatObjectUseResponse(object: EstateObjectRecord): string {
  if (object.status !== "Live") {
    return `That's the ${object.officialName} — we're still getting it ready for you. Would you like to stay here for now?`;
  }

  if (!object.interactive) {
    return [
      `The ${object.officialName} isn't something you open — it's here to ${object.purpose.toLowerCase()}.`,
      object.story,
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (object.objectId === "estate-journal") {
    return "Yes — the journal is always open to a blank page. Would you like to sit with it in the Journal, or keep talking here?";
  }

  if (object.objectId === "guidebook") {
    return "Of course — the Guidebook is yours to open whenever you want orientation. Would you like me to open it?";
  }

  if (object.objectId === "discovery-chest") {
    return "The Discovery Chest holds surprises worth returning to. Would you like to visit it in the Possibility House when you're ready?";
  }

  return `Yes — you can use the ${object.officialName}. Would you like to open it now?`;
}

export function suggestedActionForObject(
  object: EstateObjectRecord,
): string | undefined {
  if (!object.interactive || object.status !== "Live") return undefined;

  switch (object.objectId) {
    case "estate-journal":
      return "visit_journal";
    case "guidebook":
      return "open_guidebook";
    case "folded-map":
      return "show_estate_map";
    case "discovery-key":
      return "show_discovery";
    default:
      return undefined;
  }
}
