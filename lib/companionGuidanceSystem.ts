/**
 * Workspace Auto Population & Companion Guidance System
 * Active guide — not a form, wizard, or passive chatbot.
 */

import type { AppSection } from "./companionUi";
import { matchCatalogFromText } from "./createCatalog";
import { workspaceTitle } from "./workspaceMode";
import type { WorkspaceContext, WorkspaceFieldId } from "./workspaceAwareness";
import { inferWorkspaceChatFill } from "./workspaceAwareness";

export type ChatTurn = { role: string; content: string };

export type ResearchWorkspaceMatch = {
  section: AppSection;
  topic: string;
  offerLine: string;
  prefillOfferLine: string;
};

export type ConversationPrefill = {
  field: WorkspaceFieldId;
  value: string;
  label: string;
};

export const COMPANION_GUIDANCE_CORE = `COMPANION GUIDANCE (mandatory):
- If a workspace is open, assume the user wants progress INSIDE that workspace.
- Analyze conversation → identify what belongs in the workspace → auto-populate matching fields.
- Ask only for MISSING information. Never ask the user to repeat what they already said.
- Confirm what you added in one short line, then ask the next missing piece.
- Behave like a trusted guide and collaborative partner — not a form, wizard, or chatbot.
- Do not switch workspaces unless the user asks. Do not restart workflows from blank.`;

export const NO_DUPLICATE_QUESTIONS_RULE = `NO DUPLICATE QUESTIONS (mandatory):
Before asking anything, check: current conversation, visible workspace fields, and captured answers.
If the answer already exists: populate the field, confirm briefly, move forward.
Never ask "what's your audience?" if they already said who they help.`;

export const CONTEXT_CONTINUITY_RULE = `CONTEXT CONTINUITY (mandatory):
Remember the active workspace. Audience questions update Client Avatar; content discussion updates Create draft;
strategy discussion updates the plan beside chat. Stay in context until the user switches.`;

const RESEARCH_VERB_RE =
  /\b(?:help me understand|research|learn about|tell me about|who are|what do|understand my|figure out my|define my|map out my)\b/i;

const PREFILL_READY_RE =
  /\b(?:enough (?:info|information)|ready to build|build my|prefill|fill in what|start my|create my)\b/i;

const AUDIENCE_RE =
  /\b(?:ideal client|client avatar|icp|audience|who i help|people i help|my customers?|entrepreneurs?|coaches?)\b/i;

const STRATEGY_RE =
  /\b(?:marketing plan|business strategy|go to market|gtm|launch plan|growth plan)\b/i;

const FUNNEL_RE = /\b(?:sales funnel|funnel|customer journey)\b/i;

const WORKSHOP_RE = /\b(?:workshop|webinar|masterclass|course launch)\b/i;

const TEACHING_TO_WORKSPACE: {
  re: RegExp;
  section: AppSection;
  workspaceLabel: string;
  offer: string;
}[] = [
  {
    re: /\b(?:client avatars?|ideal client|icp|buyer persona|target audience)\b/i,
    section: "client-avatars",
    workspaceLabel: "Client Avatar builder",
    offer:
      "We have a **Client Avatar** builder — want to create one while we're talking about it?",
  },
  {
    re: /\b(?:sales funnel|funnel|customer journey)\b/i,
    section: "content-generator",
    workspaceLabel: "Create",
    offer:
      "Want to **build a funnel** in Create while this is fresh?",
  },
  {
    re: /\b(?:marketing plan|go to market|content strategy)\b/i,
    section: "playbook",
    workspaceLabel: "Strategies",
    offer:
      "Want to turn this into a **marketing plan** beside us in Strategies?",
  },
  {
    re: /\b(?:workshop|webinar|masterclass)\b/i,
    section: "projects",
    workspaceLabel: "Projects",
    offer:
      "Want to **plan the workshop** in Projects while we talk it through?",
  },
  {
    re: /\b(?:sop|standard operating procedure|newsletter|offer)\b/i,
    section: "content-generator",
    workspaceLabel: "Create",
    offer:
      "Want to **draft this in Create** beside us as we go?",
  },
];

const COMPLETION_ACTIONS: Partial<
  Record<AppSection, { label: string; prompt: string }[]>
> = {
  "client-avatars": [
    { label: "Review Avatar", prompt: "Let's review what we captured." },
    { label: "Improve Avatar", prompt: "Which section should we strengthen?" },
    { label: "Generate Content", prompt: "Want content ideas for this avatar?" },
    { label: "Build Marketing Plan", prompt: "Ready for a marketing plan?" },
    { label: "Finish For Now", prompt: "We can pick this up anytime." },
  ],
  playbook: [
    { label: "Test Strategy", prompt: "What's the smallest test of this plan?" },
    { label: "Save Strategy", prompt: "I'll keep this plan on the right." },
    { label: "Turn Into Project", prompt: "Want a project for this?" },
    { label: "Create Content", prompt: "What content should we make first?" },
  ],
  projects: [
    { label: "Create Tasks", prompt: "What's the first task?" },
    { label: "Time Block Work", prompt: "Want to schedule a block?" },
    { label: "Generate Content", prompt: "Need content for this project?" },
    { label: "Mark Complete", prompt: "Is this project done for now?" },
  ],
  "content-generator": [
    { label: "Review Draft", prompt: "Let's read through the draft." },
    { label: "Improve Draft", prompt: "What should we tighten?" },
    { label: "Add Section", prompt: "What section is missing?" },
    { label: "Export", prompt: "Ready to export or save?" },
    { label: "Start New Draft", prompt: "Want a fresh piece?" },
  ],
};

/** User is researching a topic that maps to a workspace — offer to open beside chat. */
export function detectResearchWorkspaceConnection(
  userText: string,
  activePanel: AppSection | null,
): ResearchWorkspaceMatch | null {
  const t = userText.trim();
  if (!t || t.length < 12) return null;
  if (!RESEARCH_VERB_RE.test(t) && !AUDIENCE_RE.test(t)) return null;

  const catalog = matchCatalogFromText(t);

  if (
    (AUDIENCE_RE.test(t) || /\b(?:understand|research).{0,40}(?:client|audience|customer)/i.test(t)) &&
    activePanel !== "client-avatars"
  ) {
    const topic = extractTopicPhrase(t) ?? "your ideal client";
    return {
      section: "client-avatars",
      topic,
      offerLine: `Much of this belongs in your **Client Avatar**. We have a builder beside chat — want me to open it and fill in what we discover as we go?`,
      prefillOfferLine: `I've noted several pieces about ${topic} from our chat. Open **Client Avatar** beside us and I'll prefill what we know?`,
    };
  }

  if (WORKSHOP_RE.test(t) && activePanel !== "projects") {
    return {
      section: "projects",
      topic: "your workshop",
      offerLine:
        "Workshop planning fits **Projects** beside us — want me to open it and capture what we figure out?",
      prefillOfferLine:
        "I can prefill your workshop plan from our conversation. Open **Projects** beside us?",
    };
  }

  if (STRATEGY_RE.test(t) && activePanel !== "playbook") {
    return {
      section: "playbook",
      topic: "your strategy",
      offerLine:
        "Strategy work belongs in **Strategies** beside us — open it and build the plan as we talk?",
      prefillOfferLine:
        "I can prefill your strategy from our chat. Open **Strategies** beside us?",
    };
  }

  if (FUNNEL_RE.test(t) && activePanel !== "content-generator") {
    return {
      section: "content-generator",
      topic: "your funnel",
      offerLine:
        "Funnel work lives in **Create** beside us — want me to open a funnel draft and fill it as we go?",
      prefillOfferLine:
        "I can start your funnel draft from what we've discussed. Open **Create** beside us?",
    };
  }

  if (catalog?.route === "client-avatars" && activePanel !== "client-avatars") {
    return {
      section: "client-avatars",
      topic: catalog.type ?? "Client Avatar",
      offerLine:
        "Let's open **Client Avatar** beside us and build this as we research.",
      prefillOfferLine:
        "I'll prefill your avatar from our conversation. Open **Client Avatar** beside us?",
    };
  }

  if (
    catalog?.type &&
    catalog.route !== "client-avatars" &&
    catalog.route !== "projects" &&
    activePanel !== "content-generator"
  ) {
    return {
      section: "content-generator",
      topic: catalog.type,
      offerLine: `Let's open **Create** for your **${catalog.type}** beside us and build as we go.`,
      prefillOfferLine: `I can prefill your **${catalog.type}** from our chat. Open **Create** beside us?`,
    };
  }

  return null;
}

export function shouldOfferConversationPrefill(userText: string): boolean {
  return PREFILL_READY_RE.test(userText.trim());
}

/** Scan chat history for fields that can be prefilled when opening a workspace. */
export function extractConversationPrefill(
  messages: ChatTurn[],
  section: AppSection,
): ConversationPrefill[] {
  const userLines = messages
    .filter((m) => m.role === "user" && m.content.trim().length >= 8)
    .map((m) => m.content.trim());

  if (userLines.length === 0) return [];

  const ctx = {
    section,
    title: workspaceTitle(section),
  } as WorkspaceContext;

  const seen = new Set<string>();
  const fills: ConversationPrefill[] = [];

  let lastAssistant = "";
  for (const msg of messages) {
    if (msg.role === "assistant") {
      lastAssistant = msg.content;
      continue;
    }
    if (msg.role !== "user") continue;
    const inferred = inferWorkspaceChatFill(ctx, msg.content, lastAssistant);
    if (!inferred) continue;
    const key = `${inferred.field}:${inferred.value.slice(0, 40)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    fills.push({
      field: inferred.field,
      value: inferred.value,
      label: fieldLabel(inferred.field),
    });
  }

  return fills;
}

export function buildPrefillSummaryMessage(
  section: AppSection,
  prefills: ConversationPrefill[],
): string | null {
  if (prefills.length === 0) return null;
  const title = workspaceTitle(section);
  const items = prefills
    .slice(0, 5)
    .map((p) => `**${p.label}**: ${truncate(p.value, 80)}`)
    .join("\n");
  return [
    `I've already pulled several pieces into your **${title}** workspace from our conversation:`,
    items,
    prefills.length > 5
      ? `…and ${prefills.length - 5} more.`
      : "",
    "Take a look beside you — edit anything, and tell me what's still missing.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function workspaceCompletionHint(section: AppSection): string | null {
  const actions = COMPLETION_ACTIONS[section];
  if (!actions?.length) return null;
  const list = actions.map((a, i) => `${i + 1}. ${a.label}`).join("\n");
  return [
    `WORKSPACE COMPLETION (when a section feels done):`,
    "Say: I think we've completed this section — then offer:",
    list,
    "Never leave the user stranded after finishing a section.",
  ].join("\n");
}

/** After teaching, bridge to doing in the right workspace. */
export function learningToDoingHint(
  userText: string,
  lastAssistantText = "",
): string | null {
  const combined = `${userText}\n${lastAssistantText}`;
  for (const entry of TEACHING_TO_WORKSPACE) {
    if (!entry.re.test(combined)) continue;
    return [
      "LEARNING → DOING BRIDGE (mandatory after teaching this topic):",
      "Do not stop at education. After the teaching beat, offer ONE bridge:",
      entry.offer,
      "If they agree, the app opens the workspace beside chat — keep coaching there.",
    ].join("\n");
  }
  return null;
}

/** App feature how-to — explain briefly, offer to open beside chat, guide through use. */
export function toolTeachingHint(userText: string): string | null {
  const t = userText.trim();
  if (!/\b(?:how do i|how to|what is|what does|use the|spin the wheel)\b/i.test(t)) {
    return null;
  }
  if (/\bspin(?: the)? wheel\b/i.test(t)) {
    return [
      "TOOL TEACHING — SPIN THE WHEEL:",
      "Brief: helps when you're stuck or can't choose — chance picks one next step.",
      'Offer: "Want me to open Spin The Wheel beside us?"',
      "If yes: guide them to spin, then interpret the result and offer: do it now, break it smaller, save for later, or spin again.",
      "Keep chat visible — never make them hunt for the conversation.",
    ].join("\n");
  }
  return [
    "TOOL TEACHING (mandatory):",
    "1. Briefly explain what the tool does (1–2 sentences).",
    "2. Offer to open it beside chat.",
    "3. If they agree: guide step by step, interpret results, suggest next step.",
    "Keep chat visible. Never leave them searching for the conversation.",
  ].join("\n");
}

export function companionGuidanceHintForChat(opts: {
  workspacePanel: AppSection | null;
  workspaceContext?: WorkspaceContext | null;
  userText?: string;
  lastAssistantText?: string;
  teachingActive?: boolean;
}): string {
  const parts = [COMPANION_GUIDANCE_CORE, NO_DUPLICATE_QUESTIONS_RULE];

  if (opts.workspacePanel) {
    parts.push(CONTEXT_CONTINUITY_RULE);
    const completion = workspaceCompletionHint(opts.workspacePanel);
    if (completion) parts.push(completion);
  }

  if (opts.teachingActive) {
    const bridge = learningToDoingHint(
      opts.userText ?? "",
      opts.lastAssistantText ?? "",
    );
    if (bridge) parts.push(bridge);
  }

  const toolHint = toolTeachingHint(opts.userText ?? "");
  if (toolHint) parts.push(toolHint);

  return parts.join("\n\n");
}

function fieldLabel(field: WorkspaceFieldId): string {
  const labels: Partial<Record<WorkspaceFieldId, string>> = {
    "avatar-who": "Who they are",
    "avatar-pain": "Struggles",
    "avatar-goals": "Goals",
    "avatar-behavior": "Behavior",
    "avatar-solution": "How you help",
    "project-title": "Project name",
    "project-goal": "Outcome",
    "create-topic": "Topic",
    "create-brief": "Brief",
  };
  return labels[field] ?? field.replace(/-/g, " ");
}

function extractTopicPhrase(text: string): string | null {
  const m = text.match(
    /\b(?:understand|research|learn about|help me with)\s+(.+?)(?:[.?!]|$)/i,
  );
  return m?.[1]?.trim().slice(0, 60) ?? null;
}

function truncate(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

/** Queue prefills for panel application (stagger keys so each fill applies). */
export function staggerPrefillKeys(
  prefills: ConversationPrefill[],
  baseKey = Date.now(),
): { field: WorkspaceFieldId; value: string; key: number }[] {
  return prefills.map((p, i) => ({
    field: p.field,
    value: p.value,
    key: baseKey + i,
  }));
}
