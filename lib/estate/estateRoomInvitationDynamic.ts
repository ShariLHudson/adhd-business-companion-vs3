/**
 * Dynamic estate invitations — first 1–2 suggestions adapt to the member's journey.
 */

import { resolveCompanionContinue } from "@/lib/companionLedContinue";
import { getLastActivity } from "@/lib/companionStore";
import type { EstateRoomInvitationItem } from "./estateRoomInvitationTypes";
import { ESTATE_INVITATION_MAX_DYNAMIC } from "./estateRoomInvitationCatalog";

function dynamicItem(
  id: string,
  emoji: string,
  label: string,
  action: EstateRoomInvitationItem["action"],
  detail?: string,
): EstateRoomInvitationItem {
  return {
    id,
    emoji,
    label,
    action,
    tier: "dynamic",
    detail,
  };
}

function continueFromCompanion(): EstateRoomInvitationItem | null {
  const resolution = resolveCompanionContinue();
  if (resolution.mode === "single") {
    const { option } = resolution;
    const label =
      option.title.length > 42 ? "Continue Where I Left Off" : option.title;
    return dynamicItem(
      "continue-journey",
      "📋",
      label,
      { kind: "companion-continue" },
      option.subtitle?.trim() || undefined,
    );
  }
  if (resolution.mode === "choose" && resolution.options[0]) {
    const top = resolution.options[0];
    return dynamicItem(
      "continue-journey",
      "📋",
      top.title.length > 42 ? "Continue Where I Left Off" : top.title,
      { kind: "companion-continue" },
      top.subtitle?.trim() || undefined,
    );
  }
  return null;
}

function creativeStudioContinue(): EstateRoomInvitationItem | null {
  const last = getLastActivity();
  if (!last?.title?.trim()) return null;
  if (
    last.kind !== "draft" &&
    last.kind !== "project" &&
    !/draft|create|write|workshop/i.test(last.title)
  ) {
    return null;
  }
  return dynamicItem(
    "continue-workshop",
    "📂",
    `Continue: ${last.title.trim().slice(0, 48)}`,
    { kind: "companion-continue" },
    last.subtitle?.trim() || undefined,
  );
}

function evidenceVaultRecent(): EstateRoomInvitationItem | null {
  const last = getLastActivity();
  if (!last?.title?.trim()) return null;
  if (!/win|success|celebrat|kind|grateful|evidence/i.test(last.title)) {
    return null;
  }
  return dynamicItem(
    "recent-win",
    "🌟",
    "Review what you added recently",
    { kind: "conversation" },
    last.title.trim().slice(0, 64),
  );
}

/** Room-aware dynamic slots — quiet, personal, never surveillance tone. */
export function resolveDynamicEstateInvitations(
  roomId: string,
): EstateRoomInvitationItem[] {
  const out: EstateRoomInvitationItem[] = [];

  const push = (item: EstateRoomInvitationItem | null) => {
    if (!item || out.length >= ESTATE_INVITATION_MAX_DYNAMIC) return;
    out.push(item);
  };

  switch (roomId) {
    case "welcome-home":
      push(continueFromCompanion());
      break;
    case "creative-studio":
      push(creativeStudioContinue());
      break;
    case "evidence-vault":
      push(evidenceVaultRecent());
      break;
    case "momentum-institute":
    case "library":
      push(continueFromCompanion());
      break;
    case "portfolio":
    case "goals-projects":
      push(continueFromCompanion());
      break;
    default:
      break;
  }

  return out;
}
