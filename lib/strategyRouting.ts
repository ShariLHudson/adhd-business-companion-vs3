/**
 * Strategy intent routing — ADHD (apply) vs Business (create).
 */

export type StrategyIntentKind = "adhd_apply" | "business_create" | "ambiguous";

const ADHD_APPLY_RE =
  /\b(?:help me focus|need motivation|can't decide|cannot decide|can't get started|cannot get started|i'm overwhelmed|im overwhelmed|help me get started|get unstuck|body double|calm down|overwhelm|procrastinat|can't start|stay focused|momentum|brain parking|clear my mind)\b/i;

const BUSINESS_CREATE_RE =
  /\b(?:create|build|write|develop|draft)\b.{0,40}\b(?:marketing|sales|launch|content|product|visibility|business)\s+strategy\b|\b(?:marketing|sales|launch|content|product|visibility)\s+strategy\b|\bstrategy\s+(?:for|to)\s+(?:market|sell|launch|grow)/i;

const AMBIGUOUS_CREATE_RE =
  /\bhow\s+(?:do\s+i|can\s+i|to)\s+create\s+(?:a\s+)?strategy\b|\bhelp\s+me\s+create\s+(?:a\s+)?strategy\b|\bcreate\s+(?:a\s+)?strategy\b/i;

export function classifyStrategyIntent(text: string): StrategyIntentKind {
  const t = text.trim();
  if (!t) return "ambiguous";
  if (AMBIGUOUS_CREATE_RE.test(t) && !BUSINESS_CREATE_RE.test(t) && !ADHD_APPLY_RE.test(t)) {
    return "ambiguous";
  }
  if (BUSINESS_CREATE_RE.test(t)) return "business_create";
  if (ADHD_APPLY_RE.test(t)) return "adhd_apply";
  if (/\bstrategy\b/i.test(t) && /\b(?:business|marketing|sales|launch|content|product|visibility|plan)\b/i.test(t)) {
    return "business_create";
  }
  return "ambiguous";
}

export function strategyDisambiguationMessage(): string {
  return `Are you looking for:

• **An ADHD strategy to use right now** — I'll help you apply a technique to your situation

• **A business strategy you'd like to create** — I'll ask questions one at a time and build a draft with you

Reply with **ADHD** or **Business** (or tell me which one you mean).`;
}

export function parseStrategyDisambiguationChoice(text: string): StrategyIntentKind | null {
  const t = text.trim().toLowerCase();
  if (/^(adhd|apply|use now|right now|technique|help me focus)/i.test(t)) {
    return "adhd_apply";
  }
  if (/^(business|create|build|plan|marketing|sales)/i.test(t)) {
    return "business_create";
  }
  if (/\badhd\b/i.test(t) && !/\bbusiness\b/i.test(t)) return "adhd_apply";
  if (/\bbusiness\b/i.test(t)) return "business_create";
  return null;
}

export function adhdApplyOpener(topic?: string): string {
  const label = topic?.trim() || "this";
  return `Let's apply **${label}** to your real situation — one step at a time. What's happening right now?`;
}

export function businessCreateRouteHint(typeLabel: string): string {
  return `Opening **${typeLabel}** beside chat — I'll ask one question at a time and build your draft when you're ready.`;
}
