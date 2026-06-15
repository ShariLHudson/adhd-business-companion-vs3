/**
 * Relationship signal patterns — detect follow-up language, no diagnosis.
 */

import type { RelationshipSignalHit, RelationshipSignalKind, RelationshipType } from "./types";

type SignalPattern = {
  kind: RelationshipSignalKind;
  label: string;
  re: RegExp;
  nameRe?: RegExp;
  defaultType: RelationshipType;
};

const PATTERNS: SignalPattern[] = [
  {
    kind: "follow_up",
    label: "Follow-up mentioned",
    re: /\b(need to|should|have to|got to|want to)\s+follow up\b/i,
    nameRe: /\bfollow up with\s+([A-Z][A-Za-z.'-]+(?:\s+[A-Z][A-Za-z.'-]+)?)/i,
    defaultType: "prospect",
  },
  {
    kind: "should_call",
    label: "Call mentioned",
    re: /\b(need to|should|have to|want to)\s+(call|phone)\b/i,
    nameRe: /\b(?:call|phone)\s+([A-Z][A-Za-z.'-]+(?:\s+[A-Z][A-Za-z.'-]+)?)/i,
    defaultType: "client",
  },
  {
    kind: "should_email",
    label: "Email mentioned",
    re: /\b(need to|should|have to|want to)\s+(email|write to|message)\b/i,
    nameRe: /\b(?:email|write to|message)\s+([A-Z][A-Za-z.'-]+(?:\s+[A-Z][A-Za-z.'-]+)?)/i,
    defaultType: "client",
  },
  {
    kind: "promised",
    label: "Promise mentioned",
    re: /\b(i promised|i told (them|him|her)|said i would|committed to)\b/i,
    nameRe: /\bpromised\s+([A-Z][A-Za-z.'-]+)/i,
    defaultType: "client",
  },
  {
    kind: "havent_talked",
    label: "Haven't connected recently",
    re: /\b(haven'?t|hasn'?t|not)\s+(talked|spoken|connected|reached out|heard from)\b/i,
    nameRe:
      /\b(?:talked to|spoken to|connected with|reached out to|heard from)\s+([A-Z][A-Za-z.'-]+(?:\s+[A-Z][A-Za-z.'-]+)?)/i,
    defaultType: "friend",
  },
  {
    kind: "referral",
    label: "Referral mentioned",
    re: /\b(referred me to|referral from|introduced (me )?to|someone referred)\b/i,
    nameRe:
      /\b(?:referred me to|referral from|introduced (?:me )?to)\s+([A-Z][A-Za-z.'-]+(?:\s+[A-Z][A-Za-z.'-]+)?)/i,
    defaultType: "referral_partner",
  },
  {
    kind: "reconnect",
    label: "Reconnect mentioned",
    re: /\b(reconnect with|get back in touch|reach out again|check in with)\b/i,
    nameRe:
      /\b(?:reconnect with|get back in touch with|reach out to|check in with)\s+([A-Z][A-Za-z.'-]+(?:\s+[A-Z][A-Za-z.'-]+)?)/i,
    defaultType: "colleague",
  },
];

const BUSINESS_WORDS =
  /\b(client|customer|lead|prospect|partner|vendor|affiliate|collaborator|referral|investor|buyer)\b/i;
const PERSONAL_WORDS =
  /\b(friend|family|mom|dad|sister|brother|mentor|coach|colleague|cousin|aunt|uncle)\b/i;

function inferType(text: string, fallback: RelationshipType): RelationshipType {
  const t = text.toLowerCase();
  if (/\b(referr|affiliate)\b/.test(t)) return "referral_partner";
  if (/\bvendor\b/.test(t)) return "vendor";
  if (/\b(collaborat|partner)\b/.test(t)) return "collaborator";
  if (/\b(lead|prospect)\b/.test(t)) return "prospect";
  if (/\bclient\b/.test(t)) return "client";
  if (/\bmentor\b/.test(t)) return "mentor";
  if (/\bcoach\b/.test(t)) return "coach";
  if (PERSONAL_WORDS.test(t)) return "friend";
  if (BUSINESS_WORDS.test(t)) return fallback;
  return fallback;
}

function extractName(text: string, pattern: SignalPattern): string | null {
  if (pattern.nameRe) {
    const m = text.match(pattern.nameRe);
    if (m?.[1]) return cleanName(m[1]);
  }
  const generic =
    /\bwith\s+([A-Z][A-Za-z.'-]+(?:\s+[A-Z][A-Za-z.'-]+)?)\b/.exec(text);
  if (generic?.[1]) return cleanName(generic[1]);
  return null;
}

function cleanName(raw: string): string {
  return raw
    .replace(/\s+(about|regarding|on|for|today|tomorrow|this|next)\b.*$/i, "")
    .trim();
}

function contextSnippet(text: string, max = 120): string {
  const t = text.trim().replace(/\s+/g, " ");
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

export function detectRelationshipSignals(text: string): RelationshipSignalHit[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const hits: RelationshipSignalHit[] = [];
  const seen = new Set<RelationshipSignalKind>();

  for (const pattern of PATTERNS) {
    if (!pattern.re.test(trimmed)) continue;
    if (seen.has(pattern.kind)) continue;
    seen.add(pattern.kind);
    hits.push({
      kind: pattern.kind,
      label: pattern.label,
      extractedName: extractName(trimmed, pattern),
      contextSnippet: contextSnippet(trimmed),
      inferredType: inferType(trimmed, pattern.defaultType),
    });
  }
  return hits;
}

export function hasRelationshipSignal(text: string): boolean {
  return detectRelationshipSignals(text).length > 0;
}

export function normalizePersonName(name: string): string {
  return name.trim().toLowerCase();
}
