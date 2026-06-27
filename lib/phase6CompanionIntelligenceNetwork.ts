/**
 * Phase 6 — Companion Intelligence Network
 * Connected ecosystem intelligence across conversations, workspaces, and assets.
 */

import {
  getBrainDumps,
  getBusinessProfile,
  getPrimaryAvatar,
  getProjects,
  getSnippets,
  getTemplates,
} from "./companionStore";
import { loadDecisionCompassSession } from "./decisionCompassSessionStore";
import { getPhase2DiscoveryState } from "./phase2ProgressiveDiscovery";
import {
  daysSinceRelationshipStart,
  getPhase3RelationshipState,
} from "./phase3AdaptiveRelationship";
import { isPhase5CompanionIntelligenceEcosystemActive } from "./phase5CompanionIntelligenceEcosystem";
import { getSavedWork } from "./savedWorkStore";
import { SURVEY_TEMPLATES, getSurveyFounderMetrics } from "./surveyIntelligence";
import { getUserStrategies } from "./userStrategies";

export type KnowledgeNodeKind =
  | "project"
  | "document"
  | "strategy"
  | "template"
  | "snippet"
  | "survey"
  | "decision_compass"
  | "clear_my_mind"
  | "goal"
  | "audience"
  | "offer"
  | "launch"
  | "workshop"
  | "content"
  | "conversation_memory";

export type KnowledgeNodeStatus = "active" | "draft" | "abandoned" | "completed";

export type KnowledgeGraphNode = {
  id: string;
  kind: KnowledgeNodeKind;
  label: string;
  location: string;
  status: KnowledgeNodeStatus;
  topics: string[];
  updatedAt: string;
};

export type KnowledgeGraphRelation =
  | "relates_to"
  | "supports"
  | "created_for"
  | "influenced_by"
  | "part_of"
  | "reused_from";

export type KnowledgeGraphEdge = {
  from: string;
  to: string;
  relation: KnowledgeGraphRelation;
  label?: string;
};

export type CompanionKnowledgeGraph = {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
  updatedAt: string;
};

export type NetworkAssetMatch = {
  node: KnowledgeGraphNode;
  reason: string;
  related: KnowledgeGraphNode[];
};

export type Phase6NetworkState = {
  topicMentions: Record<string, number>;
  assetReuseOffersShown: number;
  discoveryOffersShown: number;
  lastReuseOfferAt?: string;
  lastDiscoveryOfferAt?: string;
  crossLinksRecorded: number;
  updatedAt: string;
};

const STORAGE_KEY = "companion-phase6-intelligence-network-v1";
const MIN_GRAPH_NODES = 4;
const OFFER_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000;

const TOPIC_SIGNALS: { id: string; re: RegExp }[] = [
  { id: "workshop", re: /\bworkshop/i },
  { id: "survey", re: /\bsurvey|questions?\s+for\b/i },
  { id: "visibility", re: /\bvisibility|marketing|being seen|promot/i },
  { id: "launch", re: /\blaunch|ship|release\b/i },
  { id: "offer", re: /\boffer|program|package|membership|course\b/i },
  { id: "audience", re: /\baudience|avatar|ideal client|niche\b/i },
  { id: "pricing", re: /\bpricing|price|charge\b/i },
  { id: "content", re: /\bcontent|post|blog|newsletter|video\b/i },
  { id: "strategy", re: /\bstrateg/i },
  { id: "decision", re: /\bdecision|choose|stuck between\b/i },
  { id: "template", re: /\btemplate\b/i },
  { id: "project", re: /\bproject\b/i },
];

const RELATIONSHIP_CHAINS: [string, string][] = [
  ["workshop", "survey"],
  ["survey", "audience"],
  ["audience", "offer"],
  ["offer", "launch"],
  ["launch", "content"],
  ["content", "strategy"],
  ["strategy", "visibility"],
  ["visibility", "confidence"],
];

function defaultState(): Phase6NetworkState {
  return {
    topicMentions: {},
    assetReuseOffersShown: 0,
    discoveryOffersShown: 0,
    crossLinksRecorded: 0,
    updatedAt: new Date().toISOString(),
  };
}

function readState(): Phase6NetworkState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch {
    return defaultState();
  }
}

function writeState(state: Phase6NetworkState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event("companion-phase6-network-updated"));
}

export function getPhase6NetworkState(): Phase6NetworkState {
  return readState();
}

function extractTopics(text: string): string[] {
  const topics: string[] = [];
  for (const { id, re } of TOPIC_SIGNALS) {
    if (re.test(text)) topics.push(id);
  }
  return topics;
}

function inferTopicsFromText(...parts: (string | undefined)[]): string[] {
  const blob = parts.filter(Boolean).join(" ").toLowerCase();
  return extractTopics(blob);
}

function nodeStatusFromProject(status: string): KnowledgeNodeStatus {
  if (status === "completed") return "completed";
  if (status === "paused") return "abandoned";
  return "active";
}

export function buildCompanionKnowledgeGraph(now = new Date()): CompanionKnowledgeGraph {
  const nodes: KnowledgeGraphNode[] = [];
  const edges: KnowledgeGraphEdge[] = [];
  const nodeByTopic = new Map<string, string[]>();

  function addNode(node: KnowledgeGraphNode) {
    nodes.push(node);
    for (const topic of node.topics) {
      const list = nodeByTopic.get(topic) ?? [];
      list.push(node.id);
      nodeByTopic.set(topic, list);
    }
  }

  function link(from: string, to: string, relation: KnowledgeGraphRelation, label?: string) {
    if (from === to) return;
    if (edges.some((e) => e.from === from && e.to === to && e.relation === relation)) return;
    edges.push({ from, to, relation, label });
  }

  for (const project of getProjects()) {
    const topics = inferTopicsFromText(project.name, project.goal, project.notes, ...(project.goals ?? []));
    const id = `project:${project.id}`;
    addNode({
      id,
      kind: "project",
      label: project.name,
      location: "Projects",
      status: nodeStatusFromProject(project.status),
      topics,
      updatedAt: project.updatedAt,
    });
  }

  for (const doc of getSavedWork()) {
    const topics = inferTopicsFromText(
      doc.title,
      doc.body,
      doc.artifactType,
      doc.tags.join(" "),
      doc.typeFolder,
    );
    const isSurvey =
      /survey|form|validation/i.test(doc.title) ||
      /survey|form/i.test(doc.artifactType);
    addNode({
      id: `document:${doc.id}`,
      kind: isSurvey ? "survey" : "document",
      label: doc.title,
      location: doc.savedLocation,
      status: doc.status === "archived" ? "abandoned" : doc.status === "draft" ? "draft" : "active",
      topics,
      updatedAt: doc.updatedAt,
    });
    if (doc.projectId) link(`document:${doc.id}`, `project:${doc.projectId}`, "part_of");
  }

  for (const strategy of getUserStrategies()) {
    const topics = inferTopicsFromText(
      strategy.title,
      strategy.description,
      strategy.category,
      strategy.tags?.join(" "),
    );
    addNode({
      id: `strategy:${strategy.id}`,
      kind: "strategy",
      label: strategy.title,
      location: "Strategies",
      status: "active",
      topics,
      updatedAt: strategy.updatedAt,
    });
  }

  for (const template of getTemplates()) {
    const topics = inferTopicsFromText(template.title, template.category, template.body);
    addNode({
      id: `template:${template.id}`,
      kind: "template",
      label: template.title,
      location: "Templates",
      status: "active",
      topics,
      updatedAt: template.updatedAt ?? now.toISOString(),
    });
  }

  for (const snippet of getSnippets()) {
    const topics = inferTopicsFromText(snippet.content, snippet.kind, snippet.tags?.join(" "));
    addNode({
      id: `snippet:${snippet.id}`,
      kind: "snippet",
      label: snippet.content.slice(0, 60) || snippet.kind,
      location: "Snippets",
      status: "active",
      topics,
      updatedAt: snippet.updatedAt ?? now.toISOString(),
    });
  }

  const compass = loadDecisionCompassSession();
  if (compass?.decision?.trim()) {
    const topics = inferTopicsFromText(compass.decision, compass.optionA, compass.optionB);
    addNode({
      id: `decision_compass:${compass.sessionId}`,
      kind: "decision_compass",
      label: compass.decision.slice(0, 80),
      location: "Decision Compass",
      status: compass.complete ? "completed" : "active",
      topics: [...topics, "decision"],
      updatedAt: compass.lastTouchedAt,
    });
  }

  for (const dump of getBrainDumps().slice(0, 12)) {
    if (!dump.text?.trim()) continue;
    const topics = inferTopicsFromText(dump.text);
    addNode({
      id: `clear_my_mind:${dump.id}`,
      kind: "clear_my_mind",
      label: dump.text.slice(0, 60),
      location: "Clear My Mind",
      status: dump.done ? "completed" : "active",
      topics,
      updatedAt: dump.createdAt,
    });
  }

  const profile = getBusinessProfile();
  if (profile?.role || profile?.sells) {
    addNode({
      id: "business_profile:primary",
      kind: "offer",
      label: profile.sells ?? profile.role ?? "Business",
      location: "Business Profile",
      status: "active",
      topics: inferTopicsFromText(profile.sells, profile.role, ...(profile.goals ?? [])),
      updatedAt: now.toISOString(),
    });
  }

  const avatar = getPrimaryAvatar();
  if (avatar) {
    addNode({
      id: `audience:${avatar.id}`,
      kind: "audience",
      label: avatar.name,
      location: "Client Avatar",
      status: "active",
      topics: inferTopicsFromText(avatar.name, avatar.who, avatar.painPoints, avatar.goals),
      updatedAt: avatar.updatedAt ?? now.toISOString(),
    });
  }

  const p2 = getPhase2DiscoveryState();
  for (const goal of p2.goals.slice(0, 5)) {
    const topics = inferTopicsFromText(goal.text);
    addNode({
      id: `goal:${goal.recordedAt}`,
      kind: "goal",
      label: goal.text.slice(0, 80),
      location: "Goals",
      status: "active",
      topics,
      updatedAt: goal.recordedAt,
    });
  }

  const surveyMetrics = getSurveyFounderMetrics();
  if (surveyMetrics.lastSurveyType) {
    const template = SURVEY_TEMPLATES[surveyMetrics.lastSurveyType];
    addNode({
      id: `survey_template:${surveyMetrics.lastSurveyType}`,
      kind: "survey",
      label: template.name,
      location: "Surveys",
      status: "active",
      topics: inferTopicsFromText(template.name, template.purpose, surveyMetrics.lastSurveyType),
      updatedAt: surveyMetrics.lastCreatedAt ?? surveyMetrics.updatedAt,
    });
  }

  for (const memory of getPhase3RelationshipState().predictivePatterns.slice(0, 6)) {
    const topics = inferTopicsFromText(memory.label);
    addNode({
      id: `conversation_memory:${memory.id}`,
      kind: "conversation_memory",
      label: memory.label,
      location: "Relationship memory",
      status: "active",
      topics,
      updatedAt: now.toISOString(),
    });
  }

  for (const [a, b] of RELATIONSHIP_CHAINS) {
    const aNodes = nodeByTopic.get(a) ?? [];
    const bNodes = nodeByTopic.get(b) ?? [];
    for (const from of aNodes) {
      for (const to of bNodes) {
        link(from, to, "supports", `${a} → ${b}`);
      }
    }
  }

  for (const [topic, ids] of nodeByTopic) {
    if (ids.length < 2) continue;
    for (let i = 0; i < ids.length - 1; i++) {
      link(ids[i]!, ids[i + 1]!, "relates_to", `shared:${topic}`);
    }
  }

  return {
    nodes,
    edges,
    updatedAt: now.toISOString(),
  };
}

export function isPhase6CompanionIntelligenceNetworkActive(now = new Date()): boolean {
  if (!isPhase5CompanionIntelligenceEcosystemActive(now)) return false;
  return buildCompanionKnowledgeGraph(now).nodes.length >= MIN_GRAPH_NODES;
}

export function topicsInText(text: string): string[] {
  return extractTopics(text);
}

export function findNetworkAssetsForTopics(
  topics: string[],
  graph = buildCompanionKnowledgeGraph(),
): NetworkAssetMatch[] {
  if (!topics.length) return [];

  const matches: NetworkAssetMatch[] = [];
  const topicSet = new Set(topics);

  for (const node of graph.nodes) {
    const overlap = node.topics.filter((t) => topicSet.has(t));
    if (!overlap.length) continue;

    const relatedIds = new Set(
      graph.edges
        .filter((e) => e.from === node.id || e.to === node.id)
        .map((e) => (e.from === node.id ? e.to : e.from)),
    );
    const related = graph.nodes.filter((n) => relatedIds.has(n.id)).slice(0, 4);

    matches.push({
      node,
      reason: `Connected to ${overlap.join(", ")}`,
      related,
    });
  }

  return matches
    .sort((a, b) => b.node.updatedAt.localeCompare(a.node.updatedAt))
    .slice(0, 8);
}

export function searchKnowledgeGraph(
  query: string,
  graph = buildCompanionKnowledgeGraph(),
): KnowledgeGraphNode[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const topics = extractTopics(q);
  const tokens = q.split(/\s+/).filter((t) => t.length > 2);

  return graph.nodes
    .filter((node) => {
      const hay = `${node.label} ${node.location} ${node.topics.join(" ")}`.toLowerCase();
      if (topics.some((t) => node.topics.includes(t))) return true;
      return tokens.some((t) => hay.includes(t));
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 10);
}

function cooldownClear(lastAt: string | undefined, now: Date): boolean {
  if (!lastAt) return true;
  return now.getTime() - new Date(lastAt).getTime() >= OFFER_COOLDOWN_MS;
}

export function maybeExistingAssetReuseOffer(input: {
  userText: string;
  now?: Date;
}): string | null {
  if (!isPhase6CompanionIntelligenceNetworkActive(input.now)) return null;

  const now = input.now ?? new Date();
  const cur = readState();
  if (!cooldownClear(cur.lastReuseOfferAt, now)) return null;

  const topics = extractTopics(input.userText);
  const graph = buildCompanionKnowledgeGraph(now);
  const matches = findNetworkAssetsForTopics(topics, graph);
  if (!matches.length) return null;

  const wantsSurvey =
    topics.includes("survey") ||
    /\bquestions?\s+for\b/i.test(input.userText) ||
    /\bcustomer survey\b/i.test(input.userText);

  if (wantsSurvey) {
    const survey = matches.find((m) => m.node.kind === "survey" || /survey/i.test(m.node.label));
    if (survey) {
      return (
        `We already created **${survey.node.label}** (${survey.node.location}). ` +
        `Would you like to reuse it, modify it, or create a new version?`
      );
    }
  }

  const wantsWorkshop = topics.includes("workshop");
  if (wantsWorkshop) {
    const workshop = matches.find(
      (m) => m.node.topics.includes("workshop") || /workshop/i.test(m.node.label),
    );
    if (workshop) {
      const related = workshop.related
        .slice(0, 2)
        .map((r) => r.label)
        .join(", ");
      return related
        ? `You've discussed workshops before — including **${workshop.node.label}**` +
            (related ? ` and related work (${related})` : "") +
            `. Want to pick up from there or start fresh?`
        : `You've got workshop context in **${workshop.node.label}**. Reuse it or start fresh?`;
    }
  }

  const top = matches[0]!;
  if (/\b(create|new|build|need|help|make)\b/i.test(input.userText)) {
    return (
      `You already have **${top.node.label}** in ${top.node.location}. ` +
      `Would you like to open that, adapt it, or create something new?`
    );
  }

  return null;
}

export function maybeRelatedResourceDiscoveryOffer(input: {
  userText: string;
  now?: Date;
}): string | null {
  if (!isPhase6CompanionIntelligenceNetworkActive(input.now)) return null;

  const now = input.now ?? new Date();
  const cur = readState();
  if (!cooldownClear(cur.lastDiscoveryOfferAt, now)) return null;

  const topics = extractTopics(input.userText);
  if (!topics.length) return null;

  const graph = buildCompanionKnowledgeGraph(now);
  const matches = findNetworkAssetsForTopics(topics, graph);
  if (matches.length < 2) return null;

  const labels = [...new Set(matches.map((m) => m.node.label))].slice(0, 3);
  const topic = topics[0]!;
  const friendlyTopic = topic.replace(/_/g, " ");

  if (topic === "visibility") {
    const strategies = matches.filter((m) => m.node.kind === "strategy");
    const content = matches.filter((m) => m.node.kind === "document" || m.node.kind === "content");
    if (strategies.length || content.length) {
      const parts: string[] = [];
      if (strategies[0]) parts.push(`a visibility strategy (${strategies[0].node.label})`);
      if (content[0]) parts.push(`content (${content[0].node.label})`);
      return `For visibility — you already have ${parts.join(" and ")}. Want to use any of that?`;
    }
  }

  return `For ${friendlyTopic}, I'm seeing connected work already: ${labels.join(", ")}. Want me to surface any of it?`;
}

export function recordNetworkReuseOfferShown(now = new Date()): void {
  const cur = readState();
  writeState({
    ...cur,
    lastReuseOfferAt: now.toISOString(),
    assetReuseOffersShown: cur.assetReuseOffersShown + 1,
  });
}

export function recordNetworkDiscoveryOfferShown(now = new Date()): void {
  const cur = readState();
  writeState({
    ...cur,
    lastDiscoveryOfferAt: now.toISOString(),
    discoveryOffersShown: cur.discoveryOffersShown + 1,
  });
}

export function observePhase6NetworkTurn(input: {
  userText: string;
  now?: Date;
}): Phase6NetworkState {
  if (!isPhase6CompanionIntelligenceNetworkActive(input.now)) return readState();

  const t = input.userText.trim();
  if (!t) return readState();

  const cur = readState();
  const topicMentions = { ...cur.topicMentions };
  for (const topic of extractTopics(t)) {
    topicMentions[topic] = (topicMentions[topic] ?? 0) + 1;
  }

  const graph = buildCompanionKnowledgeGraph(input.now);
  const next: Phase6NetworkState = {
    ...cur,
    topicMentions,
    crossLinksRecorded: graph.edges.length,
    updatedAt: (input.now ?? new Date()).toISOString(),
  };
  writeState(next);
  return next;
}

export function buildContextAwarenessSummary(userText: string): string[] {
  if (!isPhase6CompanionIntelligenceNetworkActive()) return [];

  const topics = extractTopics(userText);
  const matches = findNetworkAssetsForTopics(topics);
  const lines: string[] = [];

  for (const match of matches.slice(0, 4)) {
    lines.push(`${match.node.kind}: ${match.node.label} (${match.node.location})`);
    for (const rel of match.related.slice(0, 2)) {
      lines.push(`  ↔ ${rel.label} (${rel.location})`);
    }
  }

  return lines;
}

export function formatConnectedEcosystemForPanel(
  graph = buildCompanionKnowledgeGraph(),
): string {
  if (!graph.nodes.length) {
    return "## Connected Ecosystem\n\nStill connecting your work — every project and conversation adds links.";
  }

  const clusters = new Map<string, KnowledgeGraphNode[]>();
  for (const node of graph.nodes) {
    const key = node.topics[0] ?? node.kind;
    const list = clusters.get(key) ?? [];
    list.push(node);
    clusters.set(key, list);
  }

  const lines = [
    "## Companion Intelligence Network",
    "",
    "_Everything connected — you shouldn't have to remember where things live._",
    "",
    `**${graph.nodes.length}** assets connected across **${graph.edges.length}** relationships.`,
    "",
    "### What Exists",
  ];

  for (const node of graph.nodes.slice(0, 8)) {
    lines.push(`• ${node.label} — ${node.location}`);
  }

  const topTopics = [...clusters.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 4);

  if (topTopics.length) {
    lines.push("", "### Connected Topics");
    for (const [topic, nodes] of topTopics) {
      lines.push(`• ${topic.replace(/_/g, " ")}: ${nodes.map((n) => n.label).slice(0, 3).join(", ")}`);
    }
  }

  return lines.join("\n");
}

export function phase6CompanionIntelligenceNetworkHintForChat(input?: {
  userText?: string;
  reuseOffer?: string | null;
  discoveryOffer?: string | null;
}): string | null {
  if (!isPhase6CompanionIntelligenceNetworkActive()) return null;

  const graph = buildCompanionKnowledgeGraph();
  const p2 = getPhase2DiscoveryState();
  const days = daysSinceRelationshipStart();
  const reuse = input?.reuseOffer ?? maybeExistingAssetReuseOffer({ userText: input?.userText ?? "" });
  const discovery =
    input?.discoveryOffer ??
    maybeRelatedResourceDiscoveryOffer({ userText: input?.userText ?? "" });
  const context = input?.userText ? buildContextAwarenessSummary(input.userText) : [];

  const parts = [
    "PHASE 6 COMPANION INTELLIGENCE NETWORK (connected ecosystem — one companion face):",
    "Goal: user never thinks 'Where was that?' or 'Which tool should I use?' — the companion knows.",
    "Bridge between Companion Intelligence and Companion Intelligence Ecosystem.",
    "User sees ONE companion. Never expose internal layers, graph mechanics, or confidence scores.",
    "Never pushy. Permission first. Surface what exists — reuse, modify, or create new.",
    `Knowledge graph: ${graph.nodes.length} nodes, ${graph.edges.length} cross-links. Days together: ${days}. Sessions: ${p2.sessionCount}.`,
    "Resource Awareness: know what exists, where it lives, what worked, what was abandoned, what relates.",
    "Relationship Memory Upgrade: workshop ↔ survey ↔ audience ↔ offer ↔ launch ↔ content ↔ strategy.",
    "Validation: Existing Asset Reuse, Related Resource Discovery, Connected Project Awareness, Cross-Workspace Intelligence.",
  ];

  if (context.length) {
    parts.push("CONTEXT AWARENESS (connected assets for this turn):", ...context);
  }
  if (reuse) {
    parts.push("EXISTING ASSET REUSE (optional — offer once):", `"${reuse}"`);
  }
  if (discovery && discovery !== reuse) {
    parts.push("RELATED RESOURCE DISCOVERY (optional):", `"${discovery}"`);
  }

  parts.push(
    "Success: user says 'I don't have to remember anything' and 'everything seems connected'.",
    "Second brain for the business — not a search UI.",
  );

  return parts.join("\n");
}

export function resetPhase6NetworkForTests(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
