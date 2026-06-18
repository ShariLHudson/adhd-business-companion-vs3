/**
 * Incremental collaborative drafting — hooks, anecdotes, CTAs, etc. merge into
 * a building draft without treating a single fragment as the finished piece.
 */

import { matchCatalogFromText } from "./createCatalog";
import { userFacingCreateTypeLabel } from "./createTypePickers";
import {
  findSectionHeadingLine,
  type MergeDraftResult,
} from "./liveCreateWorkspace";

export const DRAFT_FRAGMENT_SECTIONS = [
  "Hook",
  "Anecdote",
  "Story",
  "Teaching Point",
  "CTA",
  "Example",
  "Opening",
  "Closing",
  "Headline",
] as const;

export type DraftFragmentSection = (typeof DRAFT_FRAGMENT_SECTIONS)[number];

const PARTIAL_COMPONENT_REQUEST_RE =
  /\b(?:give me|write|draft|create|suggest|need|want)\s+(?:an?\s+)?(?:alternative\s+)?(?:hooks?|anecdotes?|stor(?:y|ies)|teaching points?|ctas?|calls? to action|examples?|openings?|closings?|headlines?)\b/i;

const PARTIAL_FOR_PIECE_RE =
  /\b(?:for|in|to)\s+(?:my|the|this|our)\s+(?:social media post|social post|newsletter|email|blog post|post|article|caption|thread)\b/i;

const PARENT_PIECE_RE =
  /\b(?:social media post|social post|newsletter|blog post|email|caption|linkedin post|facebook post|video script|sales page)\b/i;

const SECTION_FROM_REQUEST: { re: RegExp; section: DraftFragmentSection }[] = [
  { re: /\bhooks?\b/i, section: "Hook" },
  { re: /\banecdotes?\b/i, section: "Anecdote" },
  { re: /\bstor(?:y|ies)\b/i, section: "Story" },
  { re: /\bteaching points?\b/i, section: "Teaching Point" },
  { re: /\b(?:ctas?|calls? to action)\b/i, section: "CTA" },
  { re: /\bexamples?\b/i, section: "Example" },
  { re: /\bopenings?\b/i, section: "Opening" },
  { re: /\bclosings?\b/i, section: "Closing" },
  { re: /\bheadlines?\b/i, section: "Headline" },
];

const MIN_FRAGMENT_CHARS = 40;

export function isPartialComponentRequest(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return PARTIAL_COMPONENT_REQUEST_RE.test(t);
}

export function isParentPieceContext(text: string): boolean {
  return PARENT_PIECE_RE.test(text.trim());
}

export function inferFragmentSection(userText: string): DraftFragmentSection | null {
  const t = userText.trim();
  if (!t) return null;
  for (const { re, section } of SECTION_FROM_REQUEST) {
    if (re.test(t)) return section;
  }
  return null;
}

export function looksLikeDraftFragment(
  assistantText: string,
  userText = "",
): boolean {
  const content = assistantText.trim();
  if (content.length < MIN_FRAGMENT_CHARS) return false;
  if (isPartialComponentRequest(userText)) return true;
  if (PARTIAL_FOR_PIECE_RE.test(userText)) return true;
  if (content.length < 400 && inferFragmentSection(userText)) return true;
  return false;
}

export function resolveCollaborativeDraftTitle(opts: {
  itemType: string;
  userText?: string;
  existingTitle?: string | null;
}): string {
  const fromCatalog = matchCatalogFromText(opts.userText ?? "");
  const type =
    opts.itemType?.trim() ||
    fromCatalog?.type ||
    (opts.userText && isParentPieceContext(opts.userText)
      ? matchCatalogFromText(opts.userText)?.type
      : null) ||
    opts.itemType;
  const display = userFacingCreateTypeLabel(type) ?? type;
  if (display && display !== "content" && display !== "Document") {
    return display;
  }
  const existing = opts.existingTitle?.trim();
  if (existing && !looksLikeGeneratedFragmentTitle(existing)) {
    return existing;
  }
  return display || "Draft";
}

export function looksLikeGeneratedFragmentTitle(title: string): boolean {
  const t = title.trim();
  if (!t) return false;
  if (looksLikeMetaFragmentTitle(t)) return true;
  if (/\b(?:anecdote|hook|story|example|fun|here'?s)\b/i.test(t)) return true;
  return t.length > 48;
}

function looksLikeMetaFragmentTitle(title: string): boolean {
  return (
    /^(?:here'?s|sure|okay|great|perfect|how about)/i.test(title) ||
    /\b(?:you can use|for your post)\b/i.test(title)
  );
}

export function mergeFragmentIntoStructuredDraft(
  existingDraft: string,
  fragment: string,
  section: string | null,
): MergeDraftResult {
  const incoming = fragment.trim();
  if (!incoming) return { draft: existingDraft, mode: "append" };

  const sectionLabel = section?.trim() || null;
  if (!sectionLabel) {
    const existing = existingDraft.trim();
    if (!existing) return { draft: incoming, mode: "replace" };
    return {
      draft: `${existing}\n\n${incoming}`,
      mode: "append",
      scrollTarget: incoming.split("\n")[0]?.trim(),
    };
  }

  const heading = `## ${sectionLabel}`;
  const existing = existingDraft.trim();

  if (!existing) {
    return {
      draft: `${heading}\n\n${incoming}`,
      mode: "section",
      scrollTarget: sectionLabel,
    };
  }

  const lineIdx = findSectionHeadingLine(existing, sectionLabel);
  if (lineIdx < 0) {
    return {
      draft: `${existing}\n\n${heading}\n\n${incoming}`,
      mode: "section",
      scrollTarget: sectionLabel,
    };
  }

  const lines = existing.split("\n");
  let end = lines.length;
  for (let i = lineIdx + 1; i < lines.length; i++) {
    if (/^#{1,3}\s+/.test(lines[i]!.trim())) {
      end = i;
      break;
    }
  }
  const before = lines.slice(0, lineIdx + 1);
  const after = lines.slice(end);
  const merged = [...before, "", incoming, ...after].join("\n");
  return { draft: merged, mode: "section", scrollTarget: sectionLabel };
}

export function countDraftSections(draft: string): number {
  return (draft.match(/^#{1,3}\s+/gm) ?? []).length;
}

export function shouldOfferCompleteDraftBuild(draft: string): boolean {
  const trimmed = draft.trim();
  if (trimmed.length < 120) return false;
  return countDraftSections(trimmed) >= 2 || trimmed.length >= 280;
}

export function collaborativeDraftFollowUp(
  itemTypeLabel: string,
  opts?: { offerCompleteBuild?: boolean },
): string {
  const label = userFacingCreateTypeLabel(itemTypeLabel) ?? itemTypeLabel;
  const base =
    `Added to your **${label}** draft beside us — still building piece by piece.\n\n` +
    `What else would you like to add? (hook, anecdote, story, teaching point, CTA, examples…)`;
  if (opts?.offerCompleteBuild) {
    return (
      `${base}\n\n` +
      `You have solid material — would you like me to **build the complete draft** now?`
    );
  }
  return base;
}

export function collaborativeDraftingHintForChat(
  itemType: string,
  draftPreview?: string,
): string {
  const label = userFacingCreateTypeLabel(itemType) ?? itemType;
  const lines = [
    `COLLABORATIVE DRAFTING ACTIVE (${label}): User is building incrementally — fragments only.`,
    `Keep the workspace title as **${label}** — never rename the draft from generated snippet text.`,
    `After each fragment, ask what else to add; do NOT treat one section as the finished draft.`,
    `Do NOT ask permission to "add it" after every fragment — fragments auto-merge into Create.`,
  ];
  if (shouldOfferCompleteDraftBuild(draftPreview ?? "")) {
    lines.push(
      `Enough material exists — you MAY offer: "Would you like me to build the complete draft now?"`,
    );
  } else {
    lines.push(`Not enough sections yet — keep offering the next piece, not full-draft completion.`);
  }
  return lines.join("\n");
}
