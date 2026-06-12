// Create open logic — load the current artifact only; never surprise with old drafts.

import type { CreateSessionSnapshot } from "./createSessionStore";
import { matchCatalogFromText } from "./createCatalog";
import { normalizeArtifactType, shouldLockArtifactType } from "./artifactType";
import type { CreationWorkspaceContext } from "./workspaceCreation";
import { isCreateResumeRequest } from "./workspaceIntent";
import {
  detectArtifactWorkspaceCommand,
  isSavedDocumentRecoveryRequest,
} from "./savedArtifact";
import type { LastActivity } from "./companionStore";

export type ChatTurn = { role: "user" | "assistant"; content: string };

export type ResolvedArtifact = {
  itemType: string;
  title: string;
  draftContent: string;
  source: "context" | "chat" | "last-activity" | "stored" | "blank" | "none";
  artifactTypeLocked: boolean;
};

export type ResolveArtifactInput = {
  userText: string;
  messages: ChatTurn[];
  creationContext: CreationWorkspaceContext | null | undefined;
  lastActivity: LastActivity | null | undefined;
  storedSession: CreateSessionSnapshot | null | undefined;
  /** True only for explicit resume phrases — allows stored session fallback. */
  allowStoredSession: boolean;
};

const MIN_ARTIFACT_CHARS = 160;

const EXPORT_REFERENCE_RE =
  /\b(?:google doc|google docs|print|save (?:the|my)? ?(?:proposal|sop|document|draft)|export|create (?:the|a)? ?doc)\b/i;

const REFERS_TO_CURRENT_RE =
  /\b(?:this|it|the (?:sop|proposal|document|draft|one))\b/i;

const CHAT_OFFER_ONLY_RE =
  /\b(?:would you like|want me to help|i can open create|tell me what section)\b/i;

/** Blank structures for new artifact requests — not fake marketing copy. */
export const BLANK_ARTIFACT_SCAFFOLDS: Record<string, string> = {
  Proposal: [
    "Proposal Title",
    "",
    "Prepared For",
    "",
    "Overview",
    "",
    "Objectives",
    "",
    "Recommended Solution",
    "",
    "Timeline",
    "",
    "Investment",
    "",
    "Next Steps",
  ].join("\n"),
  SOP: [
    "SOP Title",
    "",
    "Purpose",
    "",
    "Scope",
    "",
    "Steps",
    "1. ",
    "2. ",
    "3. ",
    "",
    "Checklist",
    "- ",
  ].join("\n"),
  "Sales Page": [
    "Headline",
    "",
    "Subheadline",
    "",
    "Problem",
    "",
    "Solution",
    "",
    "Benefits",
    "- ",
    "",
    "Offer",
    "",
    "Call to Action",
  ].join("\n"),
  Funnel: [
    "Funnel Name",
    "",
    "Audience",
    "",
    "Lead Magnet / Entry Point",
    "",
    "Email Sequence",
    "",
    "Core Offer",
    "",
    "Upsell / Next Step",
  ].join("\n"),
  "Marketing Plan": [
    "Marketing Plan",
    "",
    "Goal",
    "",
    "Audience",
    "",
    "Channels",
    "- ",
    "",
    "Content Themes",
    "- ",
    "",
    "Timeline",
    "",
    "Metrics",
  ].join("\n"),
  "Email Sequence": [
    "Sequence Name",
    "",
    "Audience",
    "",
    "Goal",
    "",
    "Email 1 — Subject",
    "",
    "Email 2 — Subject",
    "",
    "Email 3 — Subject",
  ].join("\n"),
  "Launch Plan": [
    "Launch Name",
    "",
    "Launch Date",
    "",
    "Offer",
    "",
    "Pre-Launch",
    "- ",
    "",
    "Launch Week",
    "- ",
    "",
    "Post-Launch",
    "- ",
  ].join("\n"),
  "Content Calendar": [
    "Month / Period",
    "",
    "Themes",
    "- ",
    "",
    "Week 1",
    "- ",
    "",
    "Week 2",
    "- ",
    "",
    "Week 3",
    "- ",
    "",
    "Week 4",
    "- ",
  ].join("\n"),
  "5-Day Plan": [
    "Plan Title",
    "",
    "Day 1",
    "",
    "Day 2",
    "",
    "Day 3",
    "",
    "Day 4",
    "",
    "Day 5",
    "",
  ].join("\n"),
  "Business Plan": [
    "Business Name",
    "",
    "Mission",
    "",
    "Target Market",
    "",
    "Offer",
    "",
    "Revenue Model",
    "",
    "90-Day Priorities",
    "- ",
  ].join("\n"),
  "Claude Prompt": [
    "Prompt Name",
    "",
    "Role / Context",
    "",
    "Task",
    "",
    "Constraints",
    "- ",
    "",
    "Output Format",
  ].join("\n"),
  "GHL Workflow": [
    "Workflow Name",
    "",
    "Trigger",
    "",
    "Steps",
    "1. ",
    "2. ",
    "3. ",
    "",
    "Notes for GHL setup",
  ].join("\n"),
  Automation: [
    "Automation Name",
    "",
    "Trigger",
    "",
    "Actions",
    "1. ",
    "2. ",
    "",
    "Tools (GHL, Zapier, etc.)",
  ].join("\n"),
  Checklist: ["Checklist Title", "", "- [ ] ", "- [ ] ", "- [ ] "].join("\n"),
  Process: [
    "Process Name",
    "",
    "Owner",
    "",
    "Steps",
    "1. ",
    "2. ",
    "3. ",
    "",
    "Handoff / Done criteria",
  ].join("\n"),
};

export function isExplicitCreateResumeRequest(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return isCreateResumeRequest(t) || isSavedDocumentRecoveryRequest(t);
}

export function isExportArtifactRequest(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (detectArtifactWorkspaceCommand(t)) return true;
  return EXPORT_REFERENCE_RE.test(t);
}

export function refersToCurrentArtifact(text: string): boolean {
  return REFERS_TO_CURRENT_RE.test(text.trim());
}

export function looksLikeArtifactContent(text: string): boolean {
  const t = text.trim();
  if (t.length < MIN_ARTIFACT_CHARS) return false;
  if (CHAT_OFFER_ONLY_RE.test(t) && t.length < 320) return false;

  const lines = t.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length >= 5) return true;
  if (/^#{1,3}\s/m.test(t)) return true;
  if (/^\d+[.)]\s/m.test(t)) return true;
  if (/\*\*[^*]+\*\*/.test(t) && lines.length >= 3) return true;
  return t.length >= 400;
}

export function inferArtifactTypeFromConversation(
  userText: string,
  content?: string,
): string {
  const t = userText.toLowerCase();
  if (/\bsop\b|standard operating procedure|workflow doc/.test(t)) return "SOP";
  if (/\bproposal\b|scope of work|\bsow\b/.test(t)) return "Proposal";
  if (/\bemail sequence\b|drip sequence/.test(t)) return "Email Sequence";
  if (/\bemail\b/.test(t)) return "Email";
  if (/\bpost\b|linkedin/.test(t)) return "LinkedIn Post";

  const fromUser = matchCatalogFromText(userText);
  if (fromUser?.type) return fromUser.type;

  const catalog = matchCatalogFromText(`${userText}\n${content ?? ""}`);
  if (catalog?.type) return catalog.type;

  const combined = `${userText}\n${content ?? ""}`.toLowerCase();
  if (/\bsop\b|standard operating procedure|workflow doc/.test(combined)) {
    return "SOP";
  }
  if (/\bproposal\b|scope of work|\bsow\b/.test(combined)) return "Proposal";
  if (/\bemail\b/.test(combined)) return "Email";
  if (/\bpost\b|linkedin/.test(combined)) return "LinkedIn Post";
  return "Document";
}

function looksLikeMetaTitle(heading: string): boolean {
  if (
    /^(?:perfect|here'?s|sure|okay|great|let'?s|would you|i can|no problem)/i.test(
      heading,
    )
  ) {
    return true;
  }
  if (
    /\b(?:suggested title|questions we can include|would you like|tell me what|what would you|how would you)\b/i.test(
      heading,
    )
  ) {
    return true;
  }
  if (heading.endsWith("?") && /\b(?:would you|do you want|shall we|can we)\b/i.test(heading)) {
    return true;
  }
  return false;
}

export function extractTitleFromArtifact(
  content: string,
  itemType: string,
): string {
  const lines = content
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  for (const line of lines.slice(0, 12)) {
    if (/^\d+[.)]\s/.test(line)) continue;
    const heading = line
      .replace(/^#{1,3}\s+/, "")
      .replace(/\*\*/g, "")
      .replace(/:$/, "")
      .trim();
    if (heading.length < 4 || heading.length > 80) continue;
    if (heading.endsWith("?")) continue;
    if (/^(overview|objectives|purpose|scope|steps|checklist|questions)$/i.test(heading)) {
      continue;
    }
    if (/^proposal title$/i.test(heading)) continue;
    if (looksLikeMetaTitle(heading)) continue;
    return heading;
  }

  return itemType === "Document" ? "Untitled document" : `New ${itemType}`;
}

export function extractArtifactFromChat(
  messages: ChatTurn[],
  hintType?: string | null,
): Omit<ResolvedArtifact, "source" | "artifactTypeLocked"> | null {
  const recent = messages.slice(-14);

  for (let i = recent.length - 1; i >= 0; i--) {
    const m = recent[i];
    if (m.role !== "assistant") continue;
    if (!looksLikeArtifactContent(m.content)) continue;

    const userText = recent
      .slice(0, i + 1)
      .filter((t) => t.role === "user")
      .map((t) => t.content)
      .join("\n");

    const itemType = inferArtifactTypeFromConversation(
      userText,
      m.content,
    );
    const normalized = hintType
      ? normalizeArtifactType(hintType)
      : normalizeArtifactType(itemType);

    return {
      itemType: normalized,
      title: extractTitleFromArtifact(m.content, normalized),
      draftContent: m.content.trim(),
    };
  }

  return null;
}

export function blankScaffoldForType(itemType: string): string {
  const normalized = normalizeArtifactType(itemType);
  return BLANK_ARTIFACT_SCAFFOLDS[normalized] ?? "";
}

/** Default collaborative scaffold — Title, Overview, Sections. */
export const DEFAULT_COLLABORATIVE_SCAFFOLD = [
  "Title",
  "",
  "Overview",
  "",
  "Sections",
  "",
].join("\n");

/** Blank scaffold for collaborative document flow — type-specific or default structure. */
export function collaborativeScaffoldForType(
  itemType: string,
  topic?: string,
): string {
  const typed = blankScaffoldForType(itemType);
  if (typed.trim()) {
    if (topic?.trim()) {
      const lines = typed.split("\n");
      lines[0] = topic.trim();
      return lines.join("\n");
    }
    return typed;
  }
  if (topic?.trim()) {
    return DEFAULT_COLLABORATIVE_SCAFFOLD.replace(/^Title/, topic.trim());
  }
  return DEFAULT_COLLABORATIVE_SCAFFOLD;
}

export function isFreshDraftActivity(
  activity: LastActivity | null | undefined,
  maxAgeMs = 4 * 60 * 60 * 1000,
): boolean {
  if (!activity || activity.kind !== "draft" || !activity.content?.trim()) {
    return false;
  }
  if (!activity.ts) return true;
  return Date.now() - new Date(activity.ts).getTime() <= maxAgeMs;
}

function fromContext(
  ctx: CreationWorkspaceContext,
): ResolvedArtifact | null {
  if (!ctx.draftContent?.trim()) return null;
  const itemType = normalizeArtifactType(ctx.itemType);
  return {
    itemType,
    title: ctx.title?.trim() || extractTitleFromArtifact(ctx.draftContent, itemType),
    draftContent: ctx.draftContent.trim(),
    source: "context",
    artifactTypeLocked: Boolean(ctx.artifactTypeLocked),
  };
}

function fromStoredSession(
  session: CreateSessionSnapshot,
): ResolvedArtifact | null {
  const draft = session.genSeed.draft?.trim() || session.creationContext.draftContent?.trim();
  if (!draft) return null;
  const itemType = normalizeArtifactType(
    session.creationContext.itemType || session.genSeed.type || "Document",
  );
  return {
    itemType,
    title:
      session.creationContext.title?.trim() ||
      session.genSeed.topic?.trim() ||
      extractTitleFromArtifact(draft, itemType),
    draftContent: draft,
    source: "stored",
    artifactTypeLocked: Boolean(session.creationContext.artifactTypeLocked),
  };
}

function fromLastActivity(
  activity: LastActivity,
): ResolvedArtifact | null {
  if (!activity.content?.trim()) return null;
  const itemType = normalizeArtifactType(activity.contentType || "Document");
  return {
    itemType,
    title: activity.title?.trim() || extractTitleFromArtifact(activity.content, itemType),
    draftContent: activity.content.trim(),
    source: "last-activity",
    artifactTypeLocked: shouldLockArtifactType(itemType),
  };
}

function newArtifactFromRequest(userText: string): ResolvedArtifact | null {
  const catalog = matchCatalogFromText(userText);
  if (!catalog?.type) return null;

  const itemType = normalizeArtifactType(catalog.type);
  const scaffold = blankScaffoldForType(itemType);

  return {
    itemType,
    title: `New ${itemType}`,
    draftContent: scaffold,
    source: "blank",
    artifactTypeLocked: shouldLockArtifactType(itemType),
  };
}

/** Resolve what Create should show — current artifact only. */
export function resolveCurrentArtifact(
  input: ResolveArtifactInput,
): ResolvedArtifact | null {
  const { userText, messages, creationContext, lastActivity, storedSession } =
    input;
  const exportRequest = isExportArtifactRequest(userText);
  const newRequest = /\b(?:need|want|create|make|write|build|draft)\b/i.test(
    userText,
  );

  if (creationContext?.draftContent?.trim()) {
    const fromCtx = fromContext(creationContext);
    if (fromCtx) return fromCtx;
  }

  const chatArtifact = extractArtifactFromChat(messages);
  if (chatArtifact) {
    return {
      ...chatArtifact,
      source: "chat",
      artifactTypeLocked: shouldLockArtifactType(chatArtifact.itemType),
    };
  }

  if (
    isFreshDraftActivity(lastActivity) &&
    (!exportRequest || refersToCurrentArtifact(userText))
  ) {
    const fromAct = fromLastActivity(lastActivity!);
    if (fromAct) return fromAct;
  }

  if (input.allowStoredSession && storedSession) {
    const fromStore = fromStoredSession(storedSession);
    if (fromStore) return fromStore;
  }

  if (newRequest && !exportRequest) {
    const blank = newArtifactFromRequest(userText);
    if (blank) return blank;
  }

  if (exportRequest && refersToCurrentArtifact(userText)) {
    return null;
  }

  return null;
}

export function buildCreateOpenAck(artifact: ResolvedArtifact): string {
  switch (artifact.source) {
    case "chat":
    case "context":
      return `Opening **Create** with your **${artifact.itemType}** — “${artifact.title}” is beside you. Use the buttons above the draft to save, create a Google Doc, or print.`;
    case "blank":
      return `Opening a blank **${artifact.itemType}** in **Create** — start filling it in beside us, or tell me what to add.`;
    case "stored":
    case "last-activity":
      return `Here's your **${artifact.itemType}** in **Create** beside you.`;
    default:
      return "Opening **Create** beside you.";
  }
}

export function missingArtifactExportMessage(): string {
  return (
    "I don't have the content loaded yet. **Paste it here** or tell me what we just built — " +
    "then I can open **Create** with the right draft for Google Doc / print."
  );
}

function artifactFingerprint(artifact: ResolvedArtifact): string {
  const draft = artifact.draftContent.trim();
  return `${artifact.itemType}:${artifact.title}:${draft.length}:${draft.slice(0, 80)}`;
}

/** Collect distinct artifact candidates when multiple sources disagree. */
export function collectArtifactCandidates(
  input: ResolveArtifactInput,
): ResolvedArtifact[] {
  const { messages, creationContext, lastActivity, storedSession } = input;
  const out: ResolvedArtifact[] = [];

  if (creationContext?.draftContent?.trim()) {
    const fromCtx = fromContext(creationContext);
    if (fromCtx) out.push(fromCtx);
  }

  const chatArtifact = extractArtifactFromChat(messages);
  if (chatArtifact) {
    out.push({
      ...chatArtifact,
      source: "chat",
      artifactTypeLocked: shouldLockArtifactType(chatArtifact.itemType),
    });
  }

  if (isFreshDraftActivity(lastActivity)) {
    const fromAct = fromLastActivity(lastActivity!);
    if (fromAct) out.push(fromAct);
  }

  if (input.allowStoredSession && storedSession) {
    const fromStore = fromStoredSession(storedSession);
    if (fromStore) out.push(fromStore);
  }

  const seen = new Set<string>();
  return out.filter((a) => {
    const key = artifactFingerprint(a);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function buildArtifactAmbiguityMessage(
  candidates: ResolvedArtifact[],
): string {
  const list = candidates
    .slice(0, 4)
    .map(
      (c, i) =>
        `${i + 1}. **${c.itemType}** — “${c.title}” (${c.source === "chat" ? "from chat" : c.source === "stored" ? "last session" : c.source})`,
    )
    .join("\n");
  return (
    "I found more than one possible document. Which one do you mean?\n\n" +
    `${list}\n\n` +
    "Reply with the number or title."
  );
}
