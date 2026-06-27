/**
 * Phase 8 — Autonomous Preparation
 * Prepare before the user asks. Never execute, send, publish, or decide.
 */

import { loadDecisionCompassSession } from "./decisionCompassSessionStore";
import type { ChatTurn } from "./companionIntelligence";
import {
  getBusinessProfile,
  getPrimaryAvatar,
  getProjects,
  getTemplates,
} from "./companionStore";
import {
  buildBusinessIntelligenceSnapshot,
  buildContentIntelligence,
  buildOfferIntelligence,
  identifyBusinessOpportunities,
  isPhase7BusinessIntelligenceEcosystemActive,
} from "./businessIntelligenceEcosystem";
import { getPhase2DiscoveryState } from "./phase2ProgressiveDiscovery";
import { daysSinceRelationshipStart } from "./phase3AdaptiveRelationship";
import {
  buildCompanionKnowledgeGraph,
  findNetworkAssetsForTopics,
  topicsInText,
} from "./phase6CompanionIntelligenceNetwork";
import { SURVEY_TEMPLATES } from "./surveyIntelligence";
import { getSavedWork } from "./savedWorkStore";
import { getUserStrategies } from "./userStrategies";

export type PreparationCategory =
  | "conversation"
  | "decision"
  | "launch"
  | "content"
  | "sales"
  | "re_entry"
  | "opportunity"
  | "meeting";

export type PreparedItem = {
  label: string;
  location: string;
  kind: string;
};

export type PreparationKit = {
  id: string;
  title: string;
  category: PreparationCategory;
  items: PreparedItem[];
  permissionPrompt: string;
  readiness: "ready" | "partial" | "emerging";
  updatedAt: string;
};

export type BusinessReadiness = {
  launch: string;
  sales: string;
  visibility: string;
  content: string;
  offer: string;
  narrative: string;
};

export type FounderPreparationMetrics = {
  preparedViewed: number;
  preparedUsed: number;
  offersShown: number;
  offersAccepted: number;
  reEntryBriefsShown: number;
  updatedAt: string;
};

export type AutonomousPreparationState = {
  topicMentions: Record<string, number>;
  lastPreparationOfferAt?: string;
  lastReEntryAt?: string;
  metrics: FounderPreparationMetrics;
  updatedAt: string;
};

const STORAGE_KEY = "companion-phase8-autonomous-preparation-v1";
const OFFER_COOLDOWN_MS = 4 * 24 * 60 * 60 * 1000;
const RE_ENTRY_DAYS = 3;

const LAUNCH_SIGNALS = /\bworkshop|course|challenge|program|membership|launch\b/i;
const DECISION_SIGNALS = /\bdecide|decision|choose between|stuck between|which offer\b/i;
const CONTENT_SIGNALS = /\bcontent ideas?|what (?:should|can) i (?:post|write|create)|need content\b/i;
const SALES_SIGNALS = /\bdiscovery call|sales call|client call|call tomorrow|prepare for (?:the )?call\b/i;
const LAUNCH_PLAN_SIGNALS = /\blaunch planning|plan (?:my |the )?launch|launch prep\b/i;

function defaultState(): AutonomousPreparationState {
  const now = new Date().toISOString();
  return {
    topicMentions: {},
    metrics: {
      preparedViewed: 0,
      preparedUsed: 0,
      offersShown: 0,
      offersAccepted: 0,
      reEntryBriefsShown: 0,
      updatedAt: now,
    },
    updatedAt: now,
  };
}

function readState(): AutonomousPreparationState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch {
    return defaultState();
  }
}

function writeState(state: AutonomousPreparationState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event("companion-phase8-preparation-updated"));
}

export function getAutonomousPreparationState(): AutonomousPreparationState {
  return readState();
}

function permissionWrap(topic: string, detail: string): string {
  return `I pulled together a few things that might help with ${topic}. ${detail} Would you like to see them? (Only if helpful — you're in control.)`;
}

function graphItemsForTopics(topics: string[], now = new Date()): PreparedItem[] {
  const matches = findNetworkAssetsForTopics(topics, buildCompanionKnowledgeGraph(now));
  return matches.slice(0, 6).map((m) => ({
    label: m.node.label,
    location: m.node.location,
    kind: m.node.kind,
  }));
}

export function prepareConversationContext(now = new Date()): PreparationKit {
  const p2 = getPhase2DiscoveryState();
  const items: PreparedItem[] = [
    ...graphItemsForTopics(["project", "goal", "strategy"], now),
    ...p2.goals.slice(0, 2).map((g) => ({
      label: g.text,
      location: "Goals",
      kind: "goal",
    })),
  ];
  return {
    id: "prep:conversation",
    title: "Conversation Context",
    category: "conversation",
    items: items.slice(0, 8),
    permissionPrompt: permissionWrap(
      "our conversation",
      "Relevant projects, goals, and strategies are assembled.",
    ),
    readiness: items.length >= 3 ? "ready" : items.length >= 1 ? "partial" : "emerging",
    updatedAt: now.toISOString(),
  };
}

export function prepareDecisionBrief(userText?: string, now = new Date()): PreparationKit {
  const offers = buildOfferIntelligence(now);
  const compass = loadDecisionCompassSession();
  const avatar = getPrimaryAvatar();
  const items: PreparedItem[] = [
    ...offers.slice(0, 3).map((o) => ({
      label: o.label,
      location: "Offers",
      kind: "offer",
    })),
    ...graphItemsForTopics(["decision", "survey", "pricing"], now),
  ];
  if (compass?.decision) {
    items.unshift({
      label: compass.decision.slice(0, 80),
      location: "Decision Compass",
      kind: "decision_compass",
    });
  }
  if (avatar) {
    items.push({
      label: avatar.name,
      location: "Client Avatar",
      kind: "audience",
    });
  }
  const topic = userText && /offer/i.test(userText) ? "choosing between offers" : "this decision";
  return {
    id: "prep:decision",
    title: "Decision Brief",
    category: "decision",
    items: items.slice(0, 8),
    permissionPrompt: permissionWrap(
      topic,
      "Offer history, prior decisions, and audience context are ready.",
    ),
    readiness: items.length >= 4 ? "ready" : items.length >= 2 ? "partial" : "emerging",
    updatedAt: now.toISOString(),
  };
}

export function prepareLaunchKit(now = new Date()): PreparationKit {
  const items: PreparedItem[] = [
    ...graphItemsForTopics(["workshop", "launch", "survey", "offer"], now),
    ...getProjects()
      .filter((p) => /launch|workshop|course|program/i.test(`${p.name} ${p.goal}`))
      .slice(0, 3)
      .map((p) => ({ label: p.name, location: "Projects", kind: "project" })),
    {
      label: SURVEY_TEMPLATES.product_validation.name,
      location: "Survey Templates",
      kind: "survey_template",
    },
    ...getTemplates()
      .filter((t) => /launch|marketing|email/i.test(`${t.title} ${t.category}`))
      .slice(0, 2)
      .map((t) => ({ label: t.title, location: "Templates", kind: "template" })),
    ...getUserStrategies()
      .filter((s) => /visibility|launch/i.test(s.title))
      .slice(0, 2)
      .map((s) => ({ label: s.title, location: "Strategies", kind: "strategy" })),
  ];
  return {
    id: "prep:launch",
    title: "Workshop Launch Kit",
    category: "launch",
    items: items.slice(0, 10),
    permissionPrompt: permissionWrap(
      "your launch",
      "Launch plan pieces, survey templates, and visibility strategies are gathered.",
    ),
    readiness: items.length >= 5 ? "ready" : items.length >= 2 ? "partial" : "emerging",
    updatedAt: now.toISOString(),
  };
}

export function prepareContentIdeas(now = new Date()): PreparationKit {
  const content = buildContentIntelligence();
  const profile = getBusinessProfile();
  const items: PreparedItem[] = [
    ...content.existingContent.map((c) => ({
      label: c,
      location: "Saved Work",
      kind: "content",
    })),
    ...content.repurposingOpportunities.map((r) => ({
      label: r,
      location: "Repurposing",
      kind: "opportunity",
    })),
    ...getUserStrategies()
      .filter((s) => /content|visibility/i.test(s.title))
      .slice(0, 2)
      .map((s) => ({ label: s.title, location: "Strategies", kind: "strategy" })),
  ];
  if (profile?.idealClient) {
    items.push({
      label: `Audience: ${profile.idealClient.slice(0, 60)}`,
      location: "Business Profile",
      kind: "audience",
    });
  }
  return {
    id: "prep:content",
    title: "Content Ideas",
    category: "content",
    items: items.slice(0, 8),
    permissionPrompt: permissionWrap(
      "content",
      "Audience themes, past content, and repurposing options are ready.",
    ),
    readiness: items.length >= 3 ? "ready" : items.length >= 1 ? "partial" : "emerging",
    updatedAt: now.toISOString(),
  };
}

export function prepareSalesCallKit(now = new Date()): PreparationKit {
  const avatar = getPrimaryAvatar();
  const profile = getBusinessProfile();
  const items: PreparedItem[] = [
    { label: "Discovery framework", location: "Sales Intelligence", kind: "framework" },
    { label: "Objection handling notes", location: "Sales Intelligence", kind: "framework" },
    ...getTemplates()
      .filter((t) => /email|follow|proposal/i.test(t.title))
      .slice(0, 2)
      .map((t) => ({ label: t.title, location: "Templates", kind: "template" })),
    ...getSavedWork()
      .filter((d) => /pricing|proposal|follow/i.test(d.title))
      .slice(0, 2)
      .map((d) => ({ label: d.title, location: d.savedLocation, kind: "document" })),
  ];
  if (avatar) {
    items.push({
      label: `${avatar.name} — ${avatar.painPoints.slice(0, 50)}`,
      location: "Client Avatar",
      kind: "audience",
    });
  }
  if (profile?.sells) {
    items.push({ label: profile.sells, location: "Offer", kind: "offer" });
  }
  return {
    id: "prep:sales",
    title: "Discovery Call Prep",
    category: "sales",
    items: items.slice(0, 8),
    permissionPrompt: permissionWrap(
      "your discovery call",
      "Framework, pricing notes, and client insights are assembled.",
    ),
    readiness: items.length >= 4 ? "ready" : items.length >= 2 ? "partial" : "emerging",
    updatedAt: now.toISOString(),
  };
}

export function prepareReEntryBrief(now = new Date()): PreparationKit | null {
  const p2 = getPhase2DiscoveryState();
  const daysAway = Math.floor(
    (now.getTime() - new Date(p2.lastSessionAt).getTime()) / 86_400_000,
  );
  if (daysAway < RE_ENTRY_DAYS) return null;

  const snapshot = buildBusinessIntelligenceSnapshot(now);
  const openProjects = getProjects()
    .filter((p) => p.status === "in-progress")
    .slice(0, 4);
  const items: PreparedItem[] = [
    {
      label: `Welcome back — ${daysAway} days since we last worked together.`,
      location: "Re-Entry",
      kind: "summary",
    },
    ...openProjects.map((p) => ({
      label: p.name,
      location: "Open project",
      kind: "project",
    })),
    {
      label: snapshot.strategicFocus.focusNow,
      location: "Priority",
      kind: "focus",
    },
    {
      label: snapshot.strategicFocus.highestLeverage.slice(0, 100),
      location: "Momentum restart",
      kind: "plan",
    },
  ];

  return {
    id: "prep:re_entry",
    title: "Welcome Back Brief",
    category: "re_entry",
    items,
    permissionPrompt: permissionWrap(
      "getting back in",
      "A calm summary, open loops, and one priority — no shame, no overwhelm.",
    ),
    readiness: "ready",
    updatedAt: now.toISOString(),
  };
}

export function detectOpportunityReadiness(now = new Date()): PreparationKit | null {
  const opps = identifyBusinessOpportunities(now);
  const top = opps[0];
  if (!top) return null;

  return {
    id: `prep:opportunity:${top.id}`,
    title: "Opportunity Readiness",
    category: "opportunity",
    items: opps.slice(0, 4).map((o) => ({
      label: o.label,
      location: "Opportunity",
      kind: o.kind,
    })),
    permissionPrompt: `I noticed something that might be helpful: ${top.prompt}`,
    readiness: "ready",
    updatedAt: now.toISOString(),
  };
}

export function buildBusinessReadiness(now = new Date()): BusinessReadiness {
  const snapshot = buildBusinessIntelligenceSnapshot(now);
  const launchKit = prepareLaunchKit(now);
  const salesKit = prepareSalesCallKit(now);
  const contentKit = prepareContentIdeas(now);

  return {
    launch:
      launchKit.readiness === "ready"
        ? "Launch materials are largely assembled."
        : "Launch prep is still forming.",
    sales:
      salesKit.readiness === "ready"
        ? "Sales call resources are ready to review."
        : "Sales prep building from your business context.",
    visibility: snapshot.visibility.narrative,
    content:
      contentKit.readiness !== "emerging"
        ? "Content reuse and ideas are available."
        : "Content library still growing.",
    offer:
      snapshot.offers.length >= 2
        ? "Multiple offers tracked — clarity may help."
        : snapshot.offers[0]
          ? `Primary offer signal: ${snapshot.offers[0]!.label}`
          : "Offer picture still emerging.",
    narrative: snapshot.strategicFocus.narrative,
  };
}

export function buildPreparedKits(now = new Date()): PreparationKit[] {
  const kits = [
    prepareConversationContext(now),
    prepareDecisionBrief(undefined, now),
    prepareLaunchKit(now),
    prepareContentIdeas(now),
    prepareSalesCallKit(now),
    detectOpportunityReadiness(now),
    prepareReEntryBrief(now),
  ].filter((k): k is PreparationKit => k !== null && k.items.length > 0);

  return kits.filter((k) => k.readiness !== "emerging");
}

export function isPhase8AutonomousPreparationActive(now = new Date()): boolean {
  if (!isPhase7BusinessIntelligenceEcosystemActive(now)) return false;
  return buildPreparedKits(now).length >= 2;
}

function cooldownClear(lastAt: string | undefined, now: Date): boolean {
  if (!lastAt) return true;
  return now.getTime() - new Date(lastAt).getTime() >= OFFER_COOLDOWN_MS;
}

function kitForUserText(text: string, now: Date): PreparationKit | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  if (SALES_SIGNALS.test(trimmed)) return prepareSalesCallKit(now);
  if (CONTENT_SIGNALS.test(trimmed)) return prepareContentIdeas(now);
  if (DECISION_SIGNALS.test(trimmed)) return prepareDecisionBrief(trimmed, now);
  if (LAUNCH_SIGNALS.test(trimmed) || LAUNCH_PLAN_SIGNALS.test(trimmed)) {
    return prepareLaunchKit(now);
  }

  const topics = topicsInText(trimmed);
  if (topics.includes("workshop") || topics.includes("launch")) return prepareLaunchKit(now);
  if (topics.includes("decision")) return prepareDecisionBrief(trimmed, now);
  if (topics.includes("content")) return prepareContentIdeas(now);

  return null;
}

export function maybeAutonomousPreparationOffer(input: {
  userText: string;
  messages?: ChatTurn[];
  now?: Date;
}): string | null {
  if (!isPhase8AutonomousPreparationActive(input.now)) return null;

  const now = input.now ?? new Date();
  const cur = readState();
  if (!cooldownClear(cur.lastPreparationOfferAt, now)) return null;

  const reEntry = prepareReEntryBrief(now);
  if (reEntry && !cur.lastReEntryAt) {
    return reEntry.permissionPrompt;
  }

  const kit = kitForUserText(input.userText, now);
  if (kit && kit.readiness !== "emerging") {
    return kit.permissionPrompt;
  }

  const readiness = detectOpportunityReadiness(now);
  if (readiness && /help|what should|focus|stuck/i.test(input.userText)) {
    return readiness.permissionPrompt;
  }

  return null;
}

export function recordPreparationOfferShown(now = new Date()): void {
  const cur = readState();
  writeState({
    ...cur,
    lastPreparationOfferAt: now.toISOString(),
    metrics: {
      ...cur.metrics,
      offersShown: cur.metrics.offersShown + 1,
      updatedAt: now.toISOString(),
    },
  });
}

export function recordPreparationAccepted(kitId: string, now = new Date()): void {
  const cur = readState();
  writeState({
    ...cur,
    metrics: {
      ...cur.metrics,
      offersAccepted: cur.metrics.offersAccepted + 1,
      preparedUsed: cur.metrics.preparedUsed + 1,
      updatedAt: now.toISOString(),
    },
    lastReEntryAt: kitId === "prep:re_entry" ? now.toISOString() : cur.lastReEntryAt,
  });
}

export function recordPreparationViewed(now = new Date()): void {
  const cur = readState();
  writeState({
    ...cur,
    metrics: {
      ...cur.metrics,
      preparedViewed: cur.metrics.preparedViewed + 1,
      updatedAt: now.toISOString(),
    },
  });
}

export function observeAutonomousPreparationTurn(input: {
  userText: string;
  now?: Date;
}): AutonomousPreparationState {
  if (!isPhase8AutonomousPreparationActive(input.now)) return readState();

  const t = input.userText.trim();
  if (!t) return readState();

  const cur = readState();
  const topicMentions = { ...cur.topicMentions };
  for (const topic of [
    "launch",
    "workshop",
    "content",
    "sales",
    "decision",
    "meeting",
  ]) {
    if (new RegExp(`\\b${topic}`, "i").test(t)) {
      topicMentions[topic] = (topicMentions[topic] ?? 0) + 1;
    }
  }

  const next = {
    ...cur,
    topicMentions,
    updatedAt: (input.now ?? new Date()).toISOString(),
  };
  writeState(next);
  return next;
}

export function formatPreparedWorkspaceForPanel(
  kits = buildPreparedKits(),
): string {
  if (!kits.length) {
    return "## Things I've Prepared For You\n\nPreparation kits will appear as your ecosystem grows.";
  }

  const lines = [
    "## Autonomous Preparation",
    "",
    "_Prepared before you ask — you decide what to use._",
    "",
    "### Things I've Prepared For You",
  ];

  for (const kit of kits.slice(0, 6)) {
    lines.push(
      "",
      `**${kit.title}** (${kit.readiness})`,
      ...kit.items.slice(0, 4).map((i) => `• ${i.label} — ${i.location}`),
    );
  }

  const readiness = buildBusinessReadiness();
  lines.push(
    "",
    "### Business Readiness",
    readiness.narrative,
    `Launch: ${readiness.launch}`,
    `Sales: ${readiness.sales}`,
    `Content: ${readiness.content}`,
  );

  return lines.join("\n");
}

export function phase8AutonomousPreparationHintForChat(input?: {
  userText?: string;
  preparationOffer?: string | null;
  now?: Date;
}): string | null {
  if (!isPhase8AutonomousPreparationActive(input?.now)) return null;

  const now = input?.now ?? new Date();
  const kits = buildPreparedKits(now);
  const readiness = buildBusinessReadiness(now);
  const offer =
    input?.preparationOffer ??
    (input?.userText
      ? maybeAutonomousPreparationOffer({ userText: input.userText, now })
      : null);
  const p2 = getPhase2DiscoveryState();
  const days = daysSinceRelationshipStart(now);

  const parts = [
    "PHASE 8 AUTONOMOUS PREPARATION (prepare before they ask — never act without permission):",
    "Goal: user feels prepared, not surprised by autonomous action.",
    "NEVER: send, publish, contact, change records, or decide for the user.",
    "ALWAYS: prepare options, request permission, respect control.",
    `Prepared kits ready: ${kits.map((k) => k.title).join(", ") || "forming"}.`,
    `Business readiness: ${readiness.narrative}`,
    `Days together: ${days}. Sessions: ${p2.sessionCount}.`,
    "Categories: Conversation, Decision, Launch, Content, Sales, Re-Entry, Opportunity readiness.",
    "Re-Entry: no shame, no guilt — summary + open loops + one priority when user returns.",
    "Success: user thinks 'I was about to ask for that' — companion reduces effort, user decides.",
  ];

  if (offer) {
    parts.push("PREPARATION OFFER (permission first — optional):", `"${offer}"`);
  }

  return parts.join("\n");
}

export function resetAutonomousPreparationForTests(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

// Validation scenario exports
export function validateWorkshopLaunchPreparation(
  userText: string,
  now = new Date(),
): PreparationKit | null {
  if (!LAUNCH_SIGNALS.test(userText)) return null;
  const kit = prepareLaunchKit(now);
  return kit.items.length >= 2 ? kit : null;
}

export function validateDiscoveryCallPreparation(
  userText: string,
  now = new Date(),
): PreparationKit | null {
  if (!SALES_SIGNALS.test(userText)) return null;
  const kit = prepareSalesCallKit(now);
  return kit.readiness !== "emerging" ? kit : null;
}

export function validateContentCreationPreparation(
  userText: string,
  now = new Date(),
): PreparationKit | null {
  if (!CONTENT_SIGNALS.test(userText)) return null;
  const kit = prepareContentIdeas(now);
  return kit.items.length >= 1 ? kit : null;
}

export function validateReEntryPreparation(now = new Date()): PreparationKit | null {
  return prepareReEntryBrief(now);
}

export function validateDecisionSupportPreparation(
  userText: string,
  now = new Date(),
): PreparationKit | null {
  if (!DECISION_SIGNALS.test(userText)) return null;
  const kit = prepareDecisionBrief(userText, now);
  return kit.items.length >= 1 ? kit : null;
}

export function validateOpportunityDetection(now = new Date()): PreparationKit | null {
  return detectOpportunityReadiness(now);
}
