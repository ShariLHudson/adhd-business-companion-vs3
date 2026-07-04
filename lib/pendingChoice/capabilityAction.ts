import type { AppSection } from "@/lib/companionUi";
import { capabilityById } from "@/lib/estateCapabilityRegistry/catalog";
import type { CapabilityRecommendationOption } from "@/lib/estateCapabilityRegistry/types";
import type { PendingChoiceAction, PendingChoiceItem } from "./types";

function sectionForCapability(
  capabilityId: string,
): AppSection | undefined {
  const entry = capabilityById(capabilityId);
  if (!entry) return undefined;
  if (entry.primarySection) return entry.primarySection;
  if (capabilityId === "focus.timer") return "focus-timer";
  if (capabilityId === "focus.music") return "focus-audio";
  if (capabilityId === "focus.breathing") return "breathe";
  if (capabilityId === "restore.clearmind") return "brain-dump";
  if (capabilityId.startsWith("create.")) return "content-generator";
  if (capabilityId === "momentum.plan") return "plan-my-day";
  if (capabilityId === "momentum.projects") return "projects";
  if (capabilityId === "journal.reflect") return "growth-journal";
  return undefined;
}

export function pendingChoiceActionFromCapability(
  capabilityId: string,
  launchDiscovery = false,
): PendingChoiceAction | null {
  const entry = capabilityById(capabilityId);
  if (!entry) return null;

  if (launchDiscovery || (entry.requiresDiscovery && entry.category === "creation")) {
    return {
      kind: "start_discovery",
      capabilityId,
      discoveryTopic: entry.name,
      launchDiscovery: true,
    };
  }

  if (capabilityId === "focus.music") {
    return {
      kind: "open_focus_audio",
      capabilityId,
      focusAudioCategory: "calm-brain",
    };
  }

  if (capabilityId === "focus.breathing") {
    return { kind: "open_section", section: "breathe", capabilityId };
  }

  if (entry.requiredRoomId) {
    const section = sectionForCapability(capabilityId);
    return {
      kind: section ? "open_section" : "navigate_place",
      placeId: entry.requiredRoomId,
      section,
      capabilityId,
    };
  }

  const section = sectionForCapability(capabilityId);
  if (section) {
    return { kind: "open_section", section, capabilityId };
  }

  return { kind: "stay_in_chat", capabilityId };
}

export function pendingChoicesFromConciergeOptions(
  options: readonly CapabilityRecommendationOption[],
): PendingChoiceItem[] {
  return options.map((option, index) => {
    const action =
      pendingChoiceActionFromCapability(option.capabilityId) ?? {
        kind: "stay_in_chat" as const,
        capabilityId: option.capabilityId,
      };
    return {
      id: option.capabilityId,
      label: option.name,
      description: option.reason,
      destination: option.roomId ?? undefined,
      capability: option.capabilityId,
      callback: action,
      confidence: "medium" as const,
    };
  });
}

export function ackForPendingChoiceAction(action: PendingChoiceAction): string {
  const entry = action.capabilityId ? capabilityById(action.capabilityId) : null;
  const name = entry?.name ?? action.placeId?.replace(/-/g, " ") ?? "that";

  switch (action.kind) {
    case "navigate_place":
    case "open_section":
      return `Let's go — ${name}.`;
    case "open_focus_audio":
      return "Quiet music — I'll take you there.";
    case "start_discovery":
      return `Let's create your ${name} — one question at a time.`;
    case "open_journal":
      return "Your journal is ready when you are.";
    case "coaching_open":
      return "Let's try that.";
    case "stay_in_chat":
      return "I'm right here with you.";
    default:
      return "Let's do that.";
  }
}
