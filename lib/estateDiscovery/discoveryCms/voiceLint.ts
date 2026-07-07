/**
 * Discovery CMS — voice lint (human, warm, never AI-generated).
 */

import type { DiscoveryCmsRecord, DiscoveryVoiceLintResult } from "./types";

const VOICE_FIELDS = [
  "title",
  "subtitle",
  "discoveryText",
  "whyItMatters",
  "foodForThought",
  "primaryButton",
] as const;

const BANNED_PATTERNS: Array<{ id: string; pattern: RegExp }> = [
  { id: "great-question", pattern: /\bgreat question\b/i },
  { id: "lets-dive-in", pattern: /\blet'?s dive in\b/i },
  { id: "important-to-note", pattern: /\bit'?s important to note\b/i },
  { id: "in-conclusion", pattern: /\bin conclusion\b/i },
  { id: "heres-breakdown", pattern: /\bhere'?s a breakdown\b/i },
  { id: "unlock-potential", pattern: /\bunlock your (?:full )?potential\b/i },
  { id: "game-changer", pattern: /\bgame[- ]?changer\b/i },
  { id: "next-level", pattern: /\bnext level\b/i },
  { id: "as-an-ai", pattern: /\bas an ai\b/i },
  { id: "repetitive-filler", pattern: /\bsomething about the way you said\b/i },
  { id: "you-should", pattern: /\byou should\b/i },
  { id: "you-need-to", pattern: /\byou need to\b/i },
  { id: "dont-miss", pattern: /\bdon'?t miss\b/i },
  { id: "act-now", pattern: /\bact now\b/i },
  { id: "limited-time", pattern: /\blimited time\b/i },
  { id: "exclamation-spam", pattern: /!{2,}/ },
  { id: "all-caps-word", pattern: /\b[A-Z]{4,}\b/ },
];

function fieldText(
  record: DiscoveryCmsRecord,
  field: (typeof VOICE_FIELDS)[number],
): string | null {
  const value = record[field];
  if (typeof value !== "string" || !value.trim()) return null;
  return value;
}

export function lintDiscoveryVoice(
  record: DiscoveryCmsRecord,
): DiscoveryVoiceLintResult {
  const violations: DiscoveryVoiceLintResult["violations"] = [];

  for (const field of VOICE_FIELDS) {
    const text = fieldText(record, field);
    if (!text) continue;

    for (const rule of BANNED_PATTERNS) {
      const match = text.match(rule.pattern);
      if (match) {
        violations.push({
          field,
          pattern: rule.id,
          excerpt: match[0],
        });
      }
    }
  }

  return {
    discoveryId: record.id,
    passed: violations.length === 0,
    violations,
  };
}

export function discoveryVoicePasses(record: DiscoveryCmsRecord): boolean {
  return lintDiscoveryVoice(record).passed;
}
