/**
 * Conversation → Artifact — assemble multi-turn chat into structured drafts before Create.
 */

import { normalizeArtifactType, shouldLockArtifactType } from "./artifactType";
import { matchCatalogFromText } from "./createCatalog";
import {
  inferArtifactTypeFromConversation,
  looksLikeArtifactContent,
  type ChatTurn,
  type ResolvedArtifact,
} from "./createInitialization";

export const ASSEMBLY_ARTIFACT_TYPES = [
  "SOP",
  "Report",
  "Research Paper",
  "Marketing Plan",
  "Business Plan",
  "Proposal",
  "Workshop",
  "Article",
  "Training Guide",
  "Checklist",
  "Email Campaign",
  "Project Plan",
  "Document",
] as const;

export type AssemblyArtifactType = (typeof ASSEMBLY_ARTIFACT_TYPES)[number];

export type AssemblyConfidence = "high" | "medium" | "low";

export type ConversationArtifact = {
  artifactType: string;
  title: string;
  summary: string;
  draftContent: string;
  source: "conversation-handoff";
  confidence: AssemblyConfidence;
  missingPieces: string[];
  assembledFromTurnIndices: number[];
  createdAt: string;
};

export type AssemblyInput = {
  userCommand: string;
  messages: ChatTurn[];
  workspaceBrief?: string | null;
  workspaceTitle?: string | null;
  hintType?: string | null;
};

const ASSEMBLY_INTENT_RE =
  /\b(?:put (?:this|that|the|everything|it|what we discussed) together|turn (?:this|that|it|our conversation|what we discussed) into|make (?:this|that|it) into|create the final version|build the draft|write the draft|assemble (?:this|it)|make a document from (?:this|what we)|put everything into(?:\s+a)?|turn our conversation into|use what we discussed|create this in create|build the (?:sop|report|proposal|plan|draft|document|article|guide|checklist)|create the (?:sop|report|proposal|plan|draft|document|article|guide|checklist)|put the (?:sop|report|proposal|plan|draft|document|article|guide|checklist) together)\b/i;

const BLANK_CREATE_ONLY_RE =
  /^(?:open create|start (?:a )?blank|new blank|empty draft|fresh draft)\b/i;

const SHORT_ACCEPT_RE =
  /^(?:yes|yeah|yep|yup|ok(?:ay)?|sure|no|nope|thanks|thank you)\.?$/i;

const TYPE_IN_COMMAND: { type: AssemblyArtifactType; re: RegExp }[] = [
  { type: "SOP", re: /\b(?:sop|standard operating procedure|procedure doc)\b/i },
  { type: "Report", re: /\breport\b/i },
  {
    type: "Research Paper",
    re: /\b(?:research paper|academic paper|white paper)\b/i,
  },
  { type: "Marketing Plan", re: /\bmarketing plan\b/i },
  { type: "Business Plan", re: /\bbusiness plan\b/i },
  { type: "Proposal", re: /\b(?:proposal|scope of work|\bsow\b)\b/i },
  {
    type: "Workshop",
    re: /\b(?:workshop outline|workshop plan|workshop)\b/i,
  },
  { type: "Article", re: /\b(?:article|blog post)\b/i },
  {
    type: "Training Guide",
    re: /\b(?:guide|training guide|lesson plan|how-to guide)\b/i,
  },
  { type: "Checklist", re: /\bchecklist\b/i },
  {
    type: "Email Campaign",
    re: /\b(?:email sequence|email series|drip sequence|nurture sequence|follow-?up sequence|sales sequence)\b/i,
  },
  { type: "Project Plan", re: /\bproject plan\b/i },
  { type: "Document", re: /\b(?:general )?document\b/i },
];

type ExtractedFacts = {
  title?: string;
  purpose?: string;
  scope?: string;
  owner?: string;
  tools?: string;
  steps: string[];
  notes?: string;
  reviewDate?: string;
  summary?: string;
  background?: string;
  keyFindings: string[];
  details?: string;
  recommendations: string[];
  nextSteps: string[];
  researchQuestion?: string;
  introduction?: string;
  keyPoints: string[];
  evidence?: string;
  conclusion?: string;
  sourcesNeeded?: string;
  goal?: string;
  audience?: string;
  message?: string;
  channels?: string;
  offer?: string;
  contentIdeas: string[];
  timeline?: string;
  problem?: string;
  solution?: string;
  benefits?: string;
  investment?: string;
  overview?: string;
  rawSnippets: string[];
  assembledFromTurnIndices: number[];
};

function normalizeType(type: string): string {
  const t = type.trim();
  if (/^article$/i.test(t)) return "Article";
  if (/^guide$/i.test(t)) return "Training Guide";
  if (/^workshop outline$/i.test(t)) return "Workshop";
  if (/^email sequence$/i.test(t)) return "Email Campaign";
  if (/^general document$/i.test(t)) return "Document";
  if (/^research paper$/i.test(t)) return "Research Paper";
  if (/^project plan$/i.test(t)) return "Project Plan";
  if (/^lesson plan$/i.test(t)) return "Training Guide";
  return normalizeArtifactType(t);
}

export function isExplicitBlankCreateOpen(text: string): boolean {
  return BLANK_CREATE_ONLY_RE.test(text.trim());
}

export function isConversationAssemblyIntent(
  userCommand: string,
  messages: ChatTurn[],
): boolean {
  const cmd = userCommand.trim();
  if (!cmd || isExplicitBlankCreateOpen(cmd)) return false;
  if (!ASSEMBLY_INTENT_RE.test(cmd)) {
    if (
      !/\b(?:put together|build the|create the|write the|assemble)\b/i.test(cmd)
    ) {
      return false;
    }
    if (!findLastMakeTypeInCommand(cmd)) return false;
  }
  return hasUsableConversationContext(messages, cmd);
}

export function hasUsableConversationContext(
  messages: ChatTurn[],
  excludeUserCommand?: string,
): boolean {
  const prior = excludeUserCommand
    ? messages.filter(
        (m) => !(m.role === "user" && m.content.trim() === excludeUserCommand.trim()),
      )
    : messages;
  if (prior.length < 2) return false;

  let substantiveTurns = 0;
  let charCount = 0;
  for (const m of prior) {
    const t = m.content.trim();
    if (!t || SHORT_ACCEPT_RE.test(t)) continue;
    if (m.role === "assistant" && looksLikeArtifactContent(t)) {
      substantiveTurns += 1;
      charCount += t.length;
      continue;
    }
    if (m.role === "user" && isSubstantiveUserContent(t)) {
      substantiveTurns += 1;
      charCount += t.length;
    }
  }
  return substantiveTurns >= 2 && charCount >= 80;
}

function isSubstantiveUserContent(text: string): boolean {
  const t = text.trim();
  if (t.length < 12) return false;
  if (SHORT_ACCEPT_RE.test(t)) return false;
  return true;
}

function findLastMakeTypeInCommand(text: string): string | null {
  for (const { type, re } of TYPE_IN_COMMAND) {
    if (re.test(text)) return type;
  }
  const catalog = matchCatalogFromText(text);
  return catalog?.type ?? null;
}

export function inferAssemblyArtifactType(
  input: AssemblyInput,
): string | null {
  const cmd = input.userCommand.trim();
  const recent = input.messages
    .slice(-12)
    .map((m) => m.content)
    .join("\n");
  const haystack = `${cmd}\n${recent}`;

  for (const { type, re } of TYPE_IN_COMMAND) {
    if (re.test(haystack)) return normalizeType(type);
  }

  const catalog = matchCatalogFromText(cmd);
  if (catalog?.type) return normalizeType(catalog.type);

  const fromRecent = matchCatalogFromText(haystack);
  if (fromRecent?.type) return normalizeType(fromRecent.type);

  if (input.hintType) return normalizeType(input.hintType);

  const inferred = inferArtifactTypeFromConversation(
    `${cmd}\n${recent}`,
    recent,
  );
  if (inferred && inferred !== "Document") return normalizeType(inferred);

  return null;
}

function extractNumberedLines(text: string): string[] {
  const lines = text.split("\n");
  const out: string[] = [];
  for (const line of lines) {
    const m = line.match(/^\s*(?:\d+[.)]|[-*•])\s+(.+)/);
    if (m?.[1]?.trim()) out.push(m[1].trim());
  }
  return out;
}

function extractLabeledFields(text: string): Partial<ExtractedFacts> {
  const out: Partial<ExtractedFacts> = {};
  const pairs: [keyof ExtractedFacts, RegExp][] = [
    ["title", /^(?:title|name)\s*[:—-]\s*(.+)$/im],
    ["purpose", /^purpose\s*[:—-]\s*(.+)$/im],
    ["scope", /^scope\s*[:—-]\s*(.+)$/im],
    ["owner", /^owner\s*[:—-]\s*(.+)$/im],
    ["tools", /^tools?\s*[:—-]\s*(.+)$/im],
    ["summary", /^summary\s*[:—-]\s*(.+)$/im],
    ["background", /^background\s*[:—-]\s*(.+)$/im],
    ["goal", /^goal\s*[:—-]\s*(.+)$/im],
    ["audience", /^audience\s*[:—-]\s*(.+)$/im],
    ["problem", /^problem\s*[:—-]\s*(.+)$/im],
    ["solution", /^solution\s*[:—-]\s*(.+)$/im],
    ["timeline", /^timeline\s*[:—-]\s*(.+)$/im],
    ["researchQuestion", /^research question\s*[:—-]\s*(.+)$/im],
  ];
  for (const [key, re] of pairs) {
    const m = text.match(re);
    if (m?.[1]?.trim()) {
      (out as Record<string, string>)[key] = m[1].trim();
    }
  }
  return out;
}

function stripQuotes(s: string): string {
  return s.replace(/^["'“”‘’]+|["'“”‘’]+$/g, "").trim();
}

function mergeFacts(target: ExtractedFacts, patch: Partial<ExtractedFacts>): void {
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) {
      const key = k as keyof ExtractedFacts;
      const arr = target[key];
      if (Array.isArray(arr)) (arr as string[]).push(...(v as string[]));
      continue;
    }
    const key = k as keyof ExtractedFacts;
    if (!(target as Record<string, unknown>)[key]) {
      (target as Record<string, unknown>)[key] = v;
    }
  }
}

function mapAssistantQuestionToField(question: string): keyof ExtractedFacts | null {
  const q = question.toLowerCase();
  if (/\b(title|call it|call this|name (?:this|it|the))\b/.test(q)) return "title";
  if (/\b(purpose|why do|why we)\b/.test(q)) return "purpose";
  if (/\b(scope|who does this apply|who is this for)\b/.test(q)) return "scope";
  if (/\b(owner|who (?:owns|runs|maintains))\b/.test(q)) return "owner";
  if (/\b(tools?|software|equipment)\b/.test(q)) return "tools";
  if (/\b(steps?|process|procedure|workflow)\b/.test(q)) return "steps";
  if (/\b(summary|overview|background)\b/.test(q)) return "summary";
  if (/\b(findings?|key points?)\b/.test(q)) return "keyFindings";
  if (/\b(recommendations?|suggest)\b/.test(q)) return "recommendations";
  if (/\b(next steps?|what happens next)\b/.test(q)) return "nextSteps";
  if (/\b(goal|objective)\b/.test(q)) return "goal";
  if (/\b(audience|who is this for|target)\b/.test(q)) return "audience";
  if (/\b(message|positioning)\b/.test(q)) return "message";
  if (/\b(channels?|where (?:to|will) (?:post|share))\b/.test(q)) return "channels";
  if (/\b(offer|pricing)\b/.test(q)) return "offer";
  if (/\b(timeline|schedule|when)\b/.test(q)) return "timeline";
  if (/\b(problem|pain point)\b/.test(q)) return "problem";
  if (/\b(solution|approach)\b/.test(q)) return "solution";
  if (/\b(benefits?|value)\b/.test(q)) return "benefits";
  if (/\b(investment|cost|price|budget)\b/.test(q)) return "investment";
  if (/\b(research question|thesis)\b/.test(q)) return "researchQuestion";
  if (/\b(introduction|intro)\b/.test(q)) return "introduction";
  if (/\b(conclusion|wrap up)\b/.test(q)) return "conclusion";
  if (/\b(sources?|references?|citations?)\b/.test(q)) return "sourcesNeeded";
  return null;
}

function extractFactsFromConversation(
  messages: ChatTurn[],
  excludeCommand?: string,
): ExtractedFacts {
  const facts: ExtractedFacts = {
    steps: [],
    keyFindings: [],
    recommendations: [],
    nextSteps: [],
    keyPoints: [],
    contentIdeas: [],
    rawSnippets: [],
    assembledFromTurnIndices: [],
  };

  const msgs = excludeCommand
    ? messages.filter(
        (m) =>
          !(
            m.role === "user" &&
            m.content.trim() === excludeCommand.trim()
          ),
      )
    : messages;

  for (let i = 0; i < msgs.length; i++) {
    const m = msgs[i]!;
    const content = m.content.trim();
    if (!content) continue;

    if (m.role === "user") {
      if (!isSubstantiveUserContent(content)) continue;
      facts.rawSnippets.push(content);
      facts.assembledFromTurnIndices.push(i);

      mergeFacts(facts, extractLabeledFields(content));
      const numbered = extractNumberedLines(content);
      if (numbered.length) facts.steps.push(...numbered);

      const prev = i > 0 ? msgs[i - 1] : null;
      if (prev?.role === "assistant") {
        const field = mapAssistantQuestionToField(prev.content);
        if (field === "steps") {
          if (numbered.length) facts.steps.push(...numbered);
          else if (content.length < 400) facts.steps.push(content);
        } else if (field === "keyFindings" || field === "keyPoints") {
          facts.keyPoints.push(content);
          facts.keyFindings.push(content);
        } else if (field === "title" && content.length < 120) {
          facts.title = facts.title || stripQuotes(content);
        } else if (field) {
          const existing = (facts as Record<string, unknown>)[field];
          if (!existing && typeof field === "string") {
            (facts as Record<string, unknown>)[field] = content;
          }
        }
      }
    }

    if (m.role === "assistant" && looksLikeArtifactContent(content)) {
      facts.rawSnippets.push(content);
      facts.assembledFromTurnIndices.push(i);
      mergeFacts(facts, extractLabeledFields(content));
      const numbered = extractNumberedLines(content);
      if (numbered.length) facts.steps.push(...numbered);
    }
  }

  if (!facts.title) {
    facts.title = inferTitleFromFacts(facts, msgs);
  }

  return facts;
}

function inferTitleFromFacts(
  facts: ExtractedFacts,
  messages: ChatTurn[],
): string {
  for (const s of facts.rawSnippets) {
    const labeled = s.match(/^(?:title|name)\s*[:—-]\s*(.+)$/im);
    if (labeled?.[1]) return stripQuotes(labeled[1].trim());
  }
  for (let i = 1; i < messages.length; i++) {
    const prev = messages[i - 1];
    const m = messages[i];
    if (prev?.role === "assistant" && m?.role === "user") {
      if (mapAssistantQuestionToField(prev.content) === "title") {
        const t = m.content.trim();
        if (t.length > 2 && t.length < 120 && !/\?/.test(t)) {
          return stripQuotes(t);
        }
      }
    }
  }
  for (const m of messages) {
    if (m.role !== "user") continue;
    const t = m.content.trim();
    if (t.length < 80 && !/\?/.test(t) && !/\bneed an?\b/i.test(t)) {
      return stripQuotes(t).slice(0, 80);
    }
  }
  return "Untitled draft";
}

function section(title: string, body: string | undefined): string[] {
  if (!body?.trim()) return [title, ""];
  return [title, "", body.trim(), ""];
}

function listSection(title: string, items: string[]): string[] {
  if (!items.length) return [title, ""];
  return [title, "", ...items.map((item, i) => `${i + 1}. ${item}`), ""];
}

function bulletSection(title: string, items: string[]): string[] {
  if (!items.length) return [title, ""];
  return [title, "", ...items.map((item) => `- ${item}`), ""];
}

function formatSop(facts: ExtractedFacts, title: string): string {
  return [
    title,
    "",
    ...section("Purpose", facts.purpose),
    ...section("Scope", facts.scope),
    ...section("Owner", facts.owner),
    ...section("Tools", facts.tools),
    ...listSection("Steps", facts.steps),
    ...section("Notes", facts.notes ?? joinOverflow(facts)),
    ...section("Review Date", facts.reviewDate),
  ].join("\n");
}

function formatReport(facts: ExtractedFacts, title: string): string {
  return [
    title,
    "",
    ...section("Summary", facts.summary),
    ...section("Background", facts.background),
    ...bulletSection(
      "Key Findings",
      facts.keyFindings.length ? facts.keyFindings : facts.keyPoints,
    ),
    ...section("Details", facts.details ?? joinSnippets(facts, 3)),
    ...bulletSection("Recommendations", facts.recommendations),
    ...bulletSection("Next Steps", facts.nextSteps),
  ].join("\n");
}

function formatResearchPaper(facts: ExtractedFacts, title: string): string {
  return [
    title,
    "",
    ...section("Research Question", facts.researchQuestion),
    ...section("Introduction", facts.introduction ?? facts.background),
    ...bulletSection(
      "Key Points",
      facts.keyPoints.length ? facts.keyPoints : facts.keyFindings,
    ),
    ...section("Evidence / Notes", facts.evidence ?? joinSnippets(facts, 4)),
    ...section("Conclusion", facts.conclusion),
    ...section("Sources Needed", facts.sourcesNeeded),
  ].join("\n");
}

function formatMarketingPlan(facts: ExtractedFacts, title: string): string {
  return [
    title || "Marketing Plan",
    "",
    ...section("Goal", facts.goal ?? facts.purpose),
    ...section("Audience", facts.audience ?? facts.scope),
    ...section("Message", facts.message),
    ...section("Channels", facts.channels),
    ...section("Offer", facts.offer),
    ...bulletSection(
      "Content Ideas",
      facts.contentIdeas.length ? facts.contentIdeas : facts.steps,
    ),
    ...section("Timeline", facts.timeline),
    ...bulletSection("Next Steps", facts.nextSteps),
  ].join("\n");
}

function formatProposal(facts: ExtractedFacts, title: string): string {
  return [
    title,
    "",
    ...section("Problem", facts.problem ?? facts.background),
    ...section("Solution", facts.solution),
    ...section("Benefits", facts.benefits),
    ...section("Scope", facts.scope),
    ...section("Timeline", facts.timeline),
    ...section("Investment / Cost", facts.investment),
    ...bulletSection("Next Steps", facts.nextSteps),
  ].join("\n");
}

function formatGeneral(facts: ExtractedFacts, title: string): string {
  return [
    title,
    "",
    ...section("Overview", facts.overview ?? facts.summary ?? facts.purpose),
    ...bulletSection(
      "Key Points",
      facts.keyPoints.length
        ? facts.keyPoints
        : facts.steps.length
          ? facts.steps
          : facts.rawSnippets.slice(0, 5),
    ),
    ...section("Details", facts.details ?? joinSnippets(facts, 5)),
    ...bulletSection("Next Steps", facts.nextSteps),
  ].join("\n");
}

function joinSnippets(facts: ExtractedFacts, max: number): string {
  return facts.rawSnippets.slice(0, max).join("\n\n");
}

function joinOverflow(facts: ExtractedFacts): string | undefined {
  if (facts.rawSnippets.length <= 1) return undefined;
  return facts.rawSnippets.slice(1, 4).join("\n\n");
}

function formatDraftForType(
  artifactType: string,
  facts: ExtractedFacts,
  title: string,
): string {
  const type = normalizeType(artifactType);
  switch (type) {
    case "SOP":
      return formatSop(facts, title);
    case "Report":
      return formatReport(facts, title);
    case "Research Paper":
      return formatResearchPaper(facts, title);
    case "Marketing Plan":
    case "Business Plan":
      return formatMarketingPlan(
        { ...facts, goal: facts.goal ?? (type === "Business Plan" ? facts.purpose : facts.goal) },
        title || type,
      );
    case "Proposal":
      return formatProposal(facts, title);
    case "Workshop":
      return formatGeneral(
        {
          ...facts,
          overview: facts.overview ?? facts.purpose,
          keyPoints: facts.steps.length ? facts.steps : facts.keyPoints,
        },
        title || "Workshop Outline",
      );
    case "Checklist":
      return [
        title || "Checklist",
        "",
        "Checklist",
        "",
        ...(facts.steps.length
          ? facts.steps.map((s) => `- [ ] ${s}`)
          : facts.rawSnippets.map((s) => `- [ ] ${s}`)),
        "",
      ].join("\n");
    case "Email Campaign":
      return [
        title || "Email Sequence",
        "",
        ...section("Audience", facts.audience ?? facts.scope),
        ...section("Goal", facts.goal ?? facts.purpose),
        ...listSection(
          "Emails",
          facts.steps.length ? facts.steps : facts.rawSnippets.slice(0, 6),
        ),
        ...bulletSection("Next Steps", facts.nextSteps),
      ].join("\n");
    case "Project Plan":
      return formatGeneral(
        {
          ...facts,
          overview: facts.overview ?? facts.purpose,
          keyPoints: facts.steps,
        },
        title || "Project Plan",
      );
    case "Training Guide":
    case "Article":
    case "Document":
    default:
      return formatGeneral(facts, title);
  }
}

function missingPiecesForType(
  artifactType: string,
  facts: ExtractedFacts,
): string[] {
  const type = normalizeType(artifactType);
  const missing: string[] = [];
  if (!facts.title || facts.title === "Untitled draft") missing.push("title");
  if (type === "SOP") {
    if (!facts.purpose) missing.push("purpose");
    if (!facts.steps.length) missing.push("steps");
  }
  if (type === "Report" && !facts.summary && !facts.background) {
    missing.push("summary or background");
  }
  if (type === "Marketing Plan" && !facts.goal && !facts.audience) {
    missing.push("goal or audience");
  }
  return missing;
}

function scoreConfidence(
  artifactType: string | null,
  facts: ExtractedFacts,
  messages: ChatTurn[],
  userCommand: string,
): AssemblyConfidence {
  if (!artifactType) return "low";
  if (!hasUsableConversationContext(messages, userCommand)) return "low";

  const contentChars =
    facts.rawSnippets.join(" ").length +
    facts.steps.join(" ").length +
    (facts.purpose?.length ?? 0) +
    (facts.summary?.length ?? 0);

  const hasTitle = Boolean(facts.title && facts.title !== "Untitled draft");
  const hasStructure =
    facts.steps.length >= 2 ||
    facts.keyPoints.length >= 2 ||
    Boolean(facts.purpose && facts.scope) ||
    Boolean(facts.summary && facts.background);

  if (contentChars >= 150 && hasTitle && hasStructure) return "high";
  if (contentChars >= 80 && (hasTitle || hasStructure || facts.steps.length >= 1)) {
    return "medium";
  }
  if (contentChars >= 50) return "medium";
  return "low";
}

export function assembleConversationArtifact(
  input: AssemblyInput,
): ConversationArtifact | null {
  const artifactType = inferAssemblyArtifactType(input);
  const facts = extractFactsFromConversation(
    input.messages,
    input.userCommand.trim(),
  );

  if (input.workspaceTitle?.trim() && !facts.title) {
    facts.title = input.workspaceTitle.trim();
  }
  if (input.workspaceBrief?.trim() && !facts.purpose && !facts.summary) {
    facts.purpose = input.workspaceBrief.trim();
  }

  const confidence = scoreConfidence(
    artifactType,
    facts,
    input.messages,
    input.userCommand,
  );
  if (confidence === "low" && !artifactType) return null;

  const type = artifactType ?? "Document";
  const title = facts.title || `New ${type}`;
  const draftContent = formatDraftForType(type, facts, title);
  const filledBody = draftContent.replace(title, "").trim();
  if (filledBody.length < 40 && facts.rawSnippets.length === 0) return null;

  return {
    artifactType: type,
    title,
    summary: facts.summary ?? facts.purpose ?? facts.overview ?? "",
    draftContent,
    source: "conversation-handoff",
    confidence,
    missingPieces: missingPiecesForType(type, facts),
    assembledFromTurnIndices: [...new Set(facts.assembledFromTurnIndices)],
    createdAt: new Date().toISOString(),
  };
}

export function buildAssemblyClarificationMessage(): string {
  return (
    "What would you like me to turn this into?\n\n" +
    "• **SOP**\n" +
    "• **Report**\n" +
    "• **Plan** (marketing or business)\n" +
    "• **Proposal**\n" +
    "• **Article**\n" +
    "• **General Document**"
  );
}

export function buildAssemblyConfirmationMessage(
  artifact: ConversationArtifact,
): string {
  const type = artifact.artifactType.toLowerCase();
  return `I can turn what we discussed into a **${type}** draft. Want me to do that?`;
}

export function buildHandoffReceipt(artifact: ConversationArtifact): string {
  const type = artifact.artifactType;
  const partial =
    artifact.confidence !== "high" || artifact.missingPieces.length > 0;

  if (partial) {
    return "I put what we have into a draft beside us.";
  }

  const receipts: Record<string, string> = {
    SOP: "I put the SOP into a draft beside us.",
    Report: "I turned our conversation into a report draft.",
    "Research Paper": "I turned our conversation into a research paper draft.",
    "Marketing Plan": "I created a marketing plan draft from what we discussed.",
    "Business Plan": "I created a business plan draft from what we discussed.",
    Proposal: "I put everything into a proposal draft.",
    Workshop: "I turned our conversation into a workshop outline draft.",
    Article: "I turned our conversation into an article draft.",
    "Training Guide": "I turned our conversation into a guide draft.",
    Checklist: "I turned our conversation into a checklist draft.",
    "Email Campaign": "I turned our conversation into an email sequence draft.",
    "Project Plan": "I created a project plan draft from what we discussed.",
    Document: "I turned our conversation into a document draft.",
  };

  return receipts[type] ?? `I put your ${type} into a draft beside us.`;
}

export type HandoffEvaluation =
  | { action: "none" }
  | { action: "open"; artifact: ConversationArtifact }
  | { action: "confirm"; artifact: ConversationArtifact; message: string }
  | { action: "clarify"; message: string };

export function evaluateConversationHandoff(
  input: AssemblyInput,
): HandoffEvaluation {
  const cmd = input.userCommand.trim();
  if (!cmd || isExplicitBlankCreateOpen(cmd)) return { action: "none" };

  const assemblyIntent = isConversationAssemblyIntent(cmd, input.messages);
  const usable = hasUsableConversationContext(input.messages, cmd);

  if (!assemblyIntent && !usable) return { action: "none" };

  const artifact = assembleConversationArtifact(input);
  if (!artifact) {
    if (assemblyIntent) {
      return { action: "clarify", message: buildAssemblyClarificationMessage() };
    }
    return { action: "none" };
  }

  if (!assemblyIntent && usable) {
    if (artifact.confidence === "high") {
      return { action: "open", artifact };
    }
    return { action: "none" };
  }

  if (artifact.confidence === "high") {
    return { action: "open", artifact };
  }
  if (artifact.confidence === "medium") {
    return {
      action: "confirm",
      artifact,
      message: buildAssemblyConfirmationMessage(artifact),
    };
  }
  return { action: "clarify", message: buildAssemblyClarificationMessage() };
}

export function userAcceptedAssemblyConfirmation(text: string): boolean {
  return /^(?:yes|yeah|yep|yup|ok(?:ay)?|sure|go ahead|please do|do it|sounds good)\.?$/i.test(
    text.trim(),
  );
}

export function conversationArtifactToResolved(
  artifact: ConversationArtifact,
): ResolvedArtifact {
  return {
    itemType: artifact.artifactType,
    title: artifact.title,
    draftContent: artifact.draftContent,
    source: "chat",
    artifactTypeLocked: shouldLockArtifactType(artifact.artifactType),
  };
}

function draftHasSubstance(draft: string): boolean {
  const body = draft.trim();
  if (body.length < 80) return false;
  const lines = body
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 3);
  const placeholderOnly =
    /^(?:SOP Title|Purpose|Scope|Owner|Tools|Steps|Checklist|Summary|Background|Untitled|New |Overview|Key Points)/i;
  const substantive = lines.filter((l) => !placeholderOnly.test(l));
  return substantive.length >= 2;
}

export function tryAssembleFromConversation(
  input: AssemblyInput,
): ResolvedArtifact | null {
  const artifact = assembleConversationArtifact(input);
  if (!artifact) return null;
  if (artifact.confidence === "low") return null;
  const resolved = conversationArtifactToResolved(artifact);
  if (!draftHasSubstance(resolved.draftContent)) return null;
  return resolved;
}
