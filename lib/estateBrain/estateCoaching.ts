/**
 * Estate Coaching Architecture — coach before navigate.
 *
 * What is the member trying to accomplish?
 * What is getting in the way?
 * What experience would help most?
 * Navigation happens last.
 */

import { prescriptionsForSituation } from "./estateCoachingRegistry";
import type {
  EstateCoachingGoal,
  EstateCoachingMenu,
  EstateCoachingPrescription,
  EstateCoachingSituation,
  ImmediateEstateCoachingOpenPayload,
} from "./estateCoachingTypes";
import { isRegistryArtifactExecution } from "@/lib/artifactRegistry";
import {
  isProjectCreationIntent,
  resolveImmediateCreateAction,
} from "@/lib/createExperience/createExperienceRouting";
import { isResearchIntent } from "./researchRouting";
import { shouldEnterDiscoveryMode } from "./discoveryMode";
import {
  adaptiveCoachingOpener,
  recordSignalsFromCoachingChoice,
} from "./adaptiveIntelligence";

const EXPLICIT_ROOM_NAV_RE =
  /\b(?:take me to|bring me to|go to|open|show me|step into)\b/i;

const FOCUS_COACHING_RE =
  /\b(?:need to focus|help me focus|can'?t concentrate|trouble concentrating|distracted|procrastinat|can'?t get started|keep getting interrupted|need to get (?:something|this) done|hard to focus|stay focused|lose focus|losing focus|can'?t stay on task)\b/i;

const OVERWHELM_COACHING_RE =
  /\b(?:i(?:'m| am) overwhelmed|feeling overwhelmed|so overwhelmed|everything (?:feels|is) too much|too much at once|can'?t handle (?:all|this))\b/i;

const CREATIVE_BLOCK_RE =
  /\b(?:creative block|stuck creatively|can'?t create|not creative|nothing feels creative|stuck on (?:this|my) (?:idea|project))\b/i;

const STRESS_COACHING_RE =
  /\b(?:i(?:'m| am) stressed|feeling stressed|so stressed|wound up|on edge|tense|frazzled)\b/i;

const DECISION_COACHING_RE =
  /\b(?:can'?t (?:make a )?decide|can'?t choose|stuck between|torn between|help me decide|don'?t know which (?:one|option)|which (?:one|option) should i)\b/i;

const BUSINESS_GROWTH_COACHING_RE =
  /\b(?:grow my business|grow (?:the|my) company|scale my business|build my business|business growth|take my business)\b/i;

const MOTIVATION_COACHING_RE =
  /\b(?:need motivation|no motivation|can'?t motivate|don'?t feel motivated|can'?t get myself to|don'?t want to (?:start|do))\b/i;

const CREATIVE_NEED_RE =
  /\b(?:need to be creative|want to be creative|get creative|feel creative)\b/i;

const COACHING_MENU_MARKER =
  /let'?s figure out what would help|couple of ways we could|what would help most|which sounds better|several ways we could/i;

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

export function detectEstateCoachingSituation(
  userText: string,
): EstateCoachingSituation | null {
  const t = userText.trim();
  if (!t) return null;

  if (FOCUS_COACHING_RE.test(t) && !/\boverwhelm/i.test(t)) return "focus";
  if (OVERWHELM_COACHING_RE.test(t)) return "overwhelmed";
  if (CREATIVE_BLOCK_RE.test(t) || CREATIVE_NEED_RE.test(t)) {
    return "creative_block";
  }
  if (STRESS_COACHING_RE.test(t)) return "stress";
  if (DECISION_COACHING_RE.test(t)) return "decision";
  if (BUSINESS_GROWTH_COACHING_RE.test(t)) return "business_growth";
  if (MOTIVATION_COACHING_RE.test(t)) return "motivation";

  return null;
}

export function detectCoachingGoal(userText: string): EstateCoachingGoal | null {
  const t = userText.trim();
  if (!t) return null;
  if (/\b(?:finish|working on|focus on).*\bsop\b/i.test(t)) {
    return { kind: "sop", label: "finish your SOP", artifactType: "sop" };
  }
  if (/\b(?:finish|working on|focus on).*\bemail\b/i.test(t)) {
    return { kind: "email", label: "finish your email", artifactType: "email" };
  }
  if (/\b(?:finish|working on|focus on).*\b(?:proposal|newsletter|document)\b/i.test(t)) {
    return { kind: "document", label: "finish this document" };
  }
  if (/\b(?:finish|working on|focus on).*\bproject\b/i.test(t)) {
    return { kind: "project", label: "finish your project" };
  }
  return null;
}

function introForSituation(
  situation: EstateCoachingSituation,
  goal?: EstateCoachingGoal,
): string {
  if (goal) {
    return `Got it — you want to ${goal.label}. Let's figure out what would help most right now.`;
  }
  switch (situation) {
    case "focus":
      return "Let's figure out what would help most right now.";
    case "overwhelmed":
      return "There are several ways we could ease this a little.";
    case "creative_block":
      return "I have a few ideas that might help you get unstuck.";
    case "stress":
      return "Let's find something that helps you settle.";
    case "decision":
      return "Here's what I think would help most — pick what feels right.";
    case "business_growth":
      return "There are a few good places to start with this.";
    case "motivation":
      return "Let's find one gentle way forward.";
  }
}

function sequenceHintForGoal(goal: EstateCoachingGoal): string {
  if (goal.kind === "sop") {
    return (
      "When you're ready, we could clear your head, take a short breathing reset, " +
      "set a focus window, and open Create with your SOP waiting."
    );
  }
  return "";
}

/** Member should be coached — not immediately transported. */
export function shouldCoachBeforeNavigate(userText: string): boolean {
  const t = userText.trim();
  if (!t) return false;
  if (shouldEnterDiscoveryMode(t)) return false;
  if (EXPLICIT_ROOM_NAV_RE.test(t)) return false;
  if (isRegistryArtifactExecution(t)) return false;
  if (resolveImmediateCreateAction(t)) return false;
  if (isProjectCreationIntent(t)) return false;
  if (isResearchIntent(t) && /\bresearch\b/i.test(t)) return false;

  return detectEstateCoachingSituation(t) !== null;
}

const FOCUS_OBSTACLE_PRESCRIPTION_MAP: Record<string, string[]> = {
  thoughts: ["focus-clear-mind", "focus-breathing", "focus-music"],
  started: ["focus-body-double", "focus-time-block", "focus-music"],
  interruption: ["focus-time-block", "focus-peaceful-place", "focus-body-double"],
  motivation: ["focus-body-double", "focus-music", "focus-time-block"],
  anxious: ["focus-breathing", "focus-music", "focus-peaceful-place"],
  tired: ["focus-peaceful-place", "focus-breathing", "focus-music"],
};

function obstacleKey(obstacle: string): string {
  const t = normalize(obstacle);
  if (/\b(?:too many thoughts|scattered|crowded head|brain)\b/.test(t)) {
    return "thoughts";
  }
  if (/\b(?:can'?t get started|procrastinat|stuck)\b/.test(t)) {
    return "started";
  }
  if (/\b(?:interrupt|distraction)\b/.test(t)) {
    return "interruption";
  }
  if (/\b(?:motivation|motivat)\b/.test(t)) {
    return "motivation";
  }
  if (/\b(?:anxious|anxiety|nervous)\b/.test(t)) {
    return "anxious";
  }
  if (/\b(?:tired|exhaust|sleepy|low energy)\b/.test(t)) {
    return "tired";
  }
  return "started";
}

/** After Discovery identifies focus obstacle — tailored coaching menu. */
export function focusCoachingMenuForObstacle(
  obstacleAnswer: string,
): EstateCoachingMenu {
  const key = obstacleKey(obstacleAnswer);
  const preferredIds =
    FOCUS_OBSTACLE_PRESCRIPTION_MAP[key] ??
    FOCUS_OBSTACLE_PRESCRIPTION_MAP.started!;
  const all = prescriptionsForSituation("focus");
  const ordered = [
    ...preferredIds
      .map((id) => all.find((p) => p.id === id))
      .filter(Boolean),
    ...all.filter((p) => !preferredIds.includes(p.id)),
  ] as EstateCoachingPrescription[];

  return {
    situation: "focus",
    intro: "Here are a few ideas that might help.",
    prescriptions: ordered.slice(0, 7),
    goal: detectCoachingGoal(obstacleAnswer) ?? undefined,
  };
}

export function resolveEstateCoachingMenu(
  userText: string,
): EstateCoachingMenu | null {
  const situation = detectEstateCoachingSituation(userText);
  if (!situation) return null;

  const goal = detectCoachingGoal(userText) ?? undefined;
  const prescriptions = prescriptionsForSituation(situation).slice(0, 7);

  return {
    situation,
    intro: introForSituation(situation, goal),
    prescriptions,
    goal,
    sequenceHint: goal ? sequenceHintForGoal(goal) : undefined,
  };
}

export function formatEstateCoachingMenu(menu: EstateCoachingMenu): string {
  const opener = adaptiveCoachingOpener(menu.situation);
  const lines = menu.prescriptions.map(
    (p, i) => `${i + 1}. ${p.humanLabel}`,
  );
  const parts = opener
    ? [opener, "", menu.intro, "", ...lines]
    : [menu.intro, "", ...lines];
  if (menu.sequenceHint) {
    parts.push("", menu.sequenceHint);
  }
  parts.push("", "Which sounds better?");
  return parts.join("\n");
}

const COACHING_MENU_STORAGE_KEY = "estate-coaching-menu-v1";

export function cacheCoachingMenu(menu: EstateCoachingMenu): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(COACHING_MENU_STORAGE_KEY, JSON.stringify(menu));
}

export function loadCachedCoachingMenu(): EstateCoachingMenu | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COACHING_MENU_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as EstateCoachingMenu;
  } catch {
    return null;
  }
}

export function clearCachedCoachingMenu(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(COACHING_MENU_STORAGE_KEY);
}

export function isEstateCoachingMenuMessage(text: string): boolean {
  return COACHING_MENU_MARKER.test(text);
}

export function parseEstateCoachingChoice(
  reply: string,
  menu: EstateCoachingMenu,
): EstateCoachingPrescription | null {
  const t = normalize(reply);
  if (!t) return null;

  const num = /^[1-7]$/.test(t) ? Number(t) - 1 : -1;
  if (num >= 0 && num < menu.prescriptions.length) {
    return menu.prescriptions[num] ?? null;
  }

  for (const prescription of menu.prescriptions) {
    const label = normalize(prescription.humanLabel);
    if (t === label || t.includes(label)) return prescription;
    if (prescription.detail && t.includes(normalize(prescription.detail))) {
      return prescription;
    }
  }

  if (/\bsomething else\b/i.test(t)) {
    return (
      menu.prescriptions.find((p) => p.id === "something-else") ?? null
    );
  }

  return null;
}

export function resolveEstateCoachingContinuation(
  userText: string,
  lastAssistantText?: string,
): ImmediateEstateCoachingOpenPayload | null {
  if (!lastAssistantText || !isEstateCoachingMenuMessage(lastAssistantText)) {
    return null;
  }

  const cached = loadCachedCoachingMenu();
  if (cached) {
    const choice = parseEstateCoachingChoice(userText, cached);
    if (!choice) return null;
    return buildCoachingOpenPayload(
      userText,
      cached.situation,
      choice,
      cached.goal,
    );
  }

  const situation = inferSituationFromMenu(lastAssistantText);
  if (!situation) return null;

  const menu: EstateCoachingMenu = {
    situation,
    intro: "",
    prescriptions: prescriptionsForSituation(situation).slice(0, 7),
    goal:
      detectCoachingGoal(lastAssistantText) ??
      detectCoachingGoal(userText) ??
      undefined,
  };

  const choice = parseEstateCoachingChoice(userText, menu);
  if (!choice) return null;

  return buildCoachingOpenPayload(userText, situation, choice, menu.goal);
}

function inferSituationFromMenu(
  assistantText: string,
): EstateCoachingSituation | null {
  for (const situation of [
    "focus",
    "overwhelmed",
    "creative_block",
    "stress",
    "decision",
    "business_growth",
    "motivation",
  ] as const) {
    const first = prescriptionsForSituation(situation)[0]?.humanLabel;
    if (first && assistantText.includes(first)) return situation;
  }
  if (/figure out what would help/i.test(assistantText)) return "focus";
  if (/several ways we could ease/i.test(assistantText)) return "overwhelmed";
  if (/get unstuck/i.test(assistantText)) return "creative_block";
  if (/helps you settle/i.test(assistantText)) return "stress";
  if (/pick what feels right/i.test(assistantText)) return "decision";
  if (/good places to start/i.test(assistantText)) return "business_growth";
  if (/gentle way forward/i.test(assistantText)) return "motivation";
  return null;
}

export function buildCoachingOpenPayload(
  userText: string,
  situation: EstateCoachingSituation,
  prescription: EstateCoachingPrescription,
  goal?: EstateCoachingGoal,
): ImmediateEstateCoachingOpenPayload | null {
  if (prescription.stayInConversation) {
    return null;
  }

  recordSignalsFromCoachingChoice(prescription);

  const followUp =
    goal?.kind === "sop" && prescription.id === "focus-time-block"
      ? "I'll set up a focus window — then we can open your SOP in Create."
      : `Let's try that — ${prescription.humanLabel.charAt(0).toLowerCase()}${prescription.humanLabel.slice(1)}.`;

  return {
    userText,
    situation,
    prescriptionId: prescription.id,
    humanLabel: prescription.humanLabel,
    estatePlaceId: prescription.spaceId,
    section: prescription.section,
    openSection: prescription.openSection,
    followUpLine: followUp,
    goal,
  };
}

export function estateCoachingHint(menu: EstateCoachingMenu): string {
  return (
    `ESTATE COACHING: Situation=${menu.situation}. ` +
    `Coach before navigate — present human choices, never "I'm taking you to…". ` +
    `After choice, quietly prepare environment. ` +
    (menu.goal ? `Goal=${menu.goal.label}. ` : "")
  );
}
