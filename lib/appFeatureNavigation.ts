/**
 * App feature navigation — answer how-to, then offer to open the exact place.
 */

import type { SettingsSection } from "@/components/companion/SettingsPanel";
import {
  isAppHowToQuestion,
  matchAppFeatures,
  resolveAppFeatureKnowledge,
} from "./appFeatureKnowledge";
import type { AppSection } from "./companionUi";
import { workspaceObjectId, workspaceTitle } from "./workspaceMode";
import { detectCompanionFirstTarget } from "./companionFirstWorkflow";

export type AppFeatureNavTarget =
  | {
      kind: "settings";
      section: SettingsSection;
      label: string;
    }
  | {
      kind: "workspace";
      section: AppSection;
      label: string;
      itemType?: string;
    };

export type AppFeatureNavOffer = {
  target: AppFeatureNavTarget;
  reply: string;
  acceptLabel: string;
  objectId: string;
};

const SETTINGS_ROUTES: {
  re: RegExp;
  section: SettingsSection;
  label: string;
  brief: string;
}[] = [
  {
    re: /\b(?:celebration|confetti|chime|success sound|win sound|party popper)\b/i,
    section: "celebrations",
    label: "Celebration sounds",
    brief:
      "Celebration sounds live in **Settings → Celebrations** — choose Full, Simple, or Off.",
  },
  {
    re: /\b(?:change the colors?|appearance|visual mode|theme|color mode)\b/i,
    section: "appearance",
    label: "Appearance",
    brief:
      "Colors are in **Settings → Appearance** — pick Adaptive, Category, or Minimal.",
  },
  {
    re: /\b(?:how shari sounds|ai tone|tone of voice|communication style)\b/i,
    section: "tone",
    label: "How Shari sounds",
    brief: "Shari's tone is in **Settings → How Shari Sounds**.",
  },
  {
    re: /\b(?:notification|alert|desktop notif)\b/i,
    section: "notifications",
    label: "Notifications",
    brief: "Alerts and notifications are in **Settings → Notifications**.",
  },
  {
    re: /\b(?:language|region|date format)\b/i,
    section: "language",
    label: "Language & region",
    brief: "Language and region are in **Settings → Language & Region**.",
  },
  {
    re: /\b(?:google|connect|integration)\b/i,
    section: "connections",
    label: "Connections",
    brief: "Connected apps are in **Settings → Connections**.",
  },
];

export function resolveAppFeatureNavTarget(
  text: string,
): AppFeatureNavTarget | null {
  const t = text.trim();
  if (!t) return null;

  for (const route of SETTINGS_ROUTES) {
    if (route.re.test(t)) {
      return {
        kind: "settings",
        section: route.section,
        label: route.label,
      };
    }
  }

  if (/\b(?:is there a feature|does this app|can this app help)\b/i.test(t)) {
    if (/\b(?:sop|standard operating)\b/i.test(t)) {
      return {
        kind: "workspace",
        section: "content-generator",
        label: "Create",
        itemType: "SOP",
      };
    }
    const companionFirst = detectCompanionFirstTarget(t);
    if (companionFirst) {
      return {
        kind: "workspace",
        section: companionFirst.section,
        label: companionFirst.label,
        itemType: companionFirst.itemType,
      };
    }
    const features = matchAppFeatures(t);
    const primary = features[0];
    if (primary) {
      if (primary.id === "clear-my-mind") {
        return {
          kind: "workspace",
          section: "brain-dump",
          label: primary.name,
        };
      }
      if (primary.id === "create") {
        return {
          kind: "workspace",
          section: "content-generator",
          label: primary.name,
        };
      }
      return {
        kind: "workspace",
        section: primary.id as AppSection,
        label: primary.name,
      };
    }
  }

  if (!isAppHowToQuestion(t)) return null;

  const companionFirst = detectCompanionFirstTarget(t);
  if (companionFirst) {
    return {
      kind: "workspace",
      section: companionFirst.section,
      label: companionFirst.label,
      itemType: companionFirst.itemType,
    };
  }

  const features = matchAppFeatures(t);
  const primary = features[0];
  if (!primary) return null;

  const sectionMap: Partial<Record<string, AppSection>> = {
    focus: "focus",
    "clear-my-mind": "brain-dump",
    "focus-session": "focus-timer",
    breathe: "breathe",
    "focus-audio": "focus-audio",
    "time-block": "time-block",
    "momentum-games": "games",
    "spin-wheel": "spin-wheel",
    "help-me-right-now": "focus",
    snippets: "snippets",
    create: "content-generator",
    templates: "templates-library",
    strategies: "playbook",
    projects: "projects",
    "how-do-i": "how-do-i",
    "client-avatars": "client-avatars",
    "adjust-my-day": "focus",
  };

  const section = sectionMap[primary.id];
  if (!section) return null;

  return {
    kind: "workspace",
    section,
    label: primary.name,
  };
}

function settingsBrief(text: string): string | null {
  for (const route of SETTINGS_ROUTES) {
    if (route.re.test(text)) return route.brief;
  }
  return null;
}

export function buildAppFeatureNavOffer(text: string): AppFeatureNavOffer | null {
  const t = text.trim();
  if (!t) return null;

  const target = resolveAppFeatureNavTarget(t);
  if (!target) return null;

  const knowledge = resolveAppFeatureKnowledge(t);
  const settingsLine = settingsBrief(t);

  if (target.kind === "settings") {
    const brief =
      settingsLine ??
      knowledge?.howTo ??
      `You can change **${target.label}** in Settings.`;
    return {
      target,
      reply: `${brief}\n\nI can take you directly to **${target.label}** if you'd like.`,
      acceptLabel: `Open ${target.label}`,
      objectId: "settings",
    };
  }

  const brief =
    knowledge?.howTo ??
    `**${target.label}** is in the app — I can open it beside us.`;
  return {
    target,
    reply: `${brief}\n\nWant me to open **${workspaceTitle(target.section)}** beside us?`,
    acceptLabel: `Open ${target.label}`,
    objectId: workspaceObjectId(target.section),
  };
}

export function userAcceptedFeatureNav(text: string): boolean {
  return /^(?:yes|yep|yeah|sure|ok|okay|please|open it|go ahead|take me there)\b/i.test(
    text.trim(),
  );
}

export function appFeatureNavigationHintForChat(text: string): string | undefined {
  const offer = buildAppFeatureNavOffer(text);
  if (!offer) return undefined;
  if (offer.target.kind === "settings") {
    return [
      "APP FEATURE NAVIGATION (mandatory):",
      "Give the brief answer first (1–2 sentences).",
      `Then offer: "I can take you directly to **${offer.target.label}** if you'd like."`,
      "Wait for yes — then the app opens Settings to that section while chat stays visible.",
      "After they arrive, offer to walk through the setting.",
    ].join("\n");
  }
  return [
    "APP FEATURE NAVIGATION (mandatory):",
    "Brief answer first, then offer to open the feature/workspace beside chat.",
    "Do NOT stop at navigation instructions alone.",
  ].join("\n");
}
