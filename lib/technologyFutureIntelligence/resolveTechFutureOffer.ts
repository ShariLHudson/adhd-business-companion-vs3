import { getTechFutureChapter, TECH_FUTURE_CHAPTERS } from "./chapterCatalog";
import type { TechFutureChapter, TechFutureTopicKind } from "./types";

/** Prefer deeper bundle chapters when both match. */
const TOPIC_PRIORITY: Record<TechFutureTopicKind, readonly string[]> = {
  shiny_object: ["TF-001", "TF-012"],
  tool_count: ["TF-002", "TF-006", "TF-009"],
  build_vs_buy: ["TF-003"],
  ai_time: ["TF-AI-001", "TF-AI-008", "TF-AI-002", "TF-AI-004", "TF-004"],
  crm: ["TF-007", "TF-010"],
  switch_replace: ["TF-010", "TF-008", "TF-001"],
  choose_software: ["TF-008", "TF-010", "TF-001"],
  integrations: ["TF-013", "TF-AUTO-001", "TF-AUTO-012"],
  source_of_truth: ["TF-014", "TF-KM-001"],
  automation_ready: ["TF-AUTO-001", "TF-AUTO-012", "TF-013"],
  manual_smarter: ["TF-AUTO-012", "TF-AUTO-001"],
  knowledge_home: ["TF-KM-001", "TF-014"],
  tech_overwhelm: ["TF-011", "TF-002", "TF-001"],
  right_problem: ["TF-012", "TF-005", "TF-001"],
};

const SWITCH_CRM_RE =
  /\b(?:switch|replace|change|migrate).{0,24}\bcrms?\b|\bcrms?\b.{0,24}\b(?:switch|replace|migrate|change)\b|\bshould i (?:get|buy|use|need|switch) (?:a |an |my )?(?:new )?crms?\b|\b(?:hubspot|salesforce|gohighlevel|ghl|keap|activecampaign).{0,24}\b(?:switch|replace|migrate)\b|\b(?:switch|replace|migrate).{0,24}\b(?:hubspot|salesforce|gohighlevel|ghl)\b/i;

const SWITCH_TOOL_RE =
  /\b(?:should i|do i need to|is it time to)\s+(?:switch|replace|change|migrate|buy|get)\b.{0,40}\b(?:software|tool|app|platform|system|crm|email|calendar)\b|\bswitch (?:from|to|my)\b.{0,30}\b(?:software|tool|app|crm|platform)\b/i;

const SHINY_RE =
  /\b(?:shiny\s+object|new\s+tool|latest\s+(?:app|ai|software)|everyone\s+(?:says|uses)|should i (?:try|add) (?:another|a new))\b/i;

const AI_TIME_RE =
  /\b(?:ai (?:save|saving) (?:me )?time|will ai|use ai for|chatgpt|claude|automate with ai|ai (?:tool|assistant))\b/i;

const BUILD_APP_RE =
  /\b(?:build (?:my|our|an?) (?:own )?app|custom (?:app|software)|should i build)\b/i;

const TOO_MANY_TOOLS_RE =
  /\b(?:too many (?:tools|apps|programs|subscriptions)|software sprawl|tool\s+overwhelm|another\s+subscription)\b/i;

const INTEGRATE_RE =
  /\b(?:connect(?:ed|ing)? (?:all|my) (?:software|tools|apps)|integration|zapier|make\.com|webhook|automate)\b/i;

const SOURCE_TRUTH_RE =
  /\b(?:source of truth|where (?:should|do) i (?:keep|put)|single source|which (?:system|tool) is (?:the )?truth)\b/i;

const AUTOMATION_READY_RE =
  /\b(?:automation (?:ready|worth)|ready to (?:build|automate)|is (?:this |the )?automation ready)\b/i;

const MANUAL_RE =
  /\b(?:manual (?:is|work|smarter)|do it (?:by )?hand|when (?:not )?to automate|prefer manual)\b/i;

const TECH_OVERWHELM_RE =
  /\b(?:overwhelm(?:ed)? by (?:tech|technology|software|tools)|tech overwhelm|where do i (?:even )?start.{0,20}(?:tech|software|tools))\b/i;

const CHOOSE_SOFTWARE_RE =
  /\b(?:choose between|which (?:software|tool|app|crm)|comparing (?:two|software|tools)|vs\.?)\b.{0,40}\b(?:software|tool|app|crm|platform)?\b/i;

export function classifyTechFutureTopic(
  userText: string,
): TechFutureTopicKind | null {
  const t = userText.trim();
  if (!t) return null;

  if (SWITCH_CRM_RE.test(t)) return "crm";
  if (
    /\b(?:need (?:a )?crms?|everyone says.{0,20}crms?|do i (?:really )?need (?:a )?crms?)\b/i.test(
      t,
    )
  ) {
    return "crm";
  }
  if (AUTOMATION_READY_RE.test(t)) return "automation_ready";
  if (SWITCH_TOOL_RE.test(t)) return "switch_replace";
  if (SHINY_RE.test(t)) return "shiny_object";
  if (AI_TIME_RE.test(t)) return "ai_time";
  if (BUILD_APP_RE.test(t)) return "build_vs_buy";
  if (TOO_MANY_TOOLS_RE.test(t)) return "tool_count";
  if (TECH_OVERWHELM_RE.test(t)) return "tech_overwhelm";
  if (INTEGRATE_RE.test(t)) return "integrations";
  if (SOURCE_TRUTH_RE.test(t)) return "source_of_truth";
  if (MANUAL_RE.test(t)) return "manual_smarter";
  if (CHOOSE_SOFTWARE_RE.test(t)) return "choose_software";
  if (
    /\b(?:am i solving the right problem|right problem|wrong problem)\b/i.test(t)
  ) {
    return "right_problem";
  }
  return null;
}

export function resolveTechFutureChapters(
  userText: string,
  opts?: { max?: number },
): TechFutureChapter[] {
  const max = Math.min(Math.max(1, opts?.max ?? 1), 2);
  const topic = classifyTechFutureTopic(userText);
  if (!topic) return [];

  const ids = TOPIC_PRIORITY[topic] ?? [];
  const out: TechFutureChapter[] = [];
  for (const id of ids) {
    const chapter = getTechFutureChapter(id);
    if (chapter) out.push(chapter);
    if (out.length >= max) break;
  }
  if (out.length === 0) {
    const fallback = TECH_FUTURE_CHAPTERS.find((c) => c.topic === topic);
    if (fallback) out.push(fallback);
  }
  return out.slice(0, max);
}

/**
 * Compact prompt hint — one chapter preferred, never dump library files.
 * Rule 7: knowledge advises; it does not route.
 */
export function techFutureHintForChat(userText: string): string | null {
  const chapters = resolveTechFutureChapters(userText, { max: 1 });
  if (chapters.length === 0) return null;

  const chapter = chapters[0]!;
  return [
    "TECHNOLOGY & FUTURE DIRECTOR (thin — advise only, do not route or dump chapters):",
    `Primary chapter: ${chapter.id} — ${chapter.title}`,
    chapter.offerHint,
    "Consider: outcome first, migration/maintenance burden, ownership, and keeping what already works.",
    "Do not automatically recommend buying a new tool. Ask one clarifying question only if needed.",
  ].join("\n");
}

/**
 * Thin member-facing reply when Technology & Future owns the turn.
 * Never dumps the library; never navigates; never opens a scenic menu.
 */
export function composeThinTechFutureMemberReply(
  userText: string,
): string | null {
  const topic = classifyTechFutureTopic(userText);
  if (!topic) return null;
  const chapters = resolveTechFutureChapters(userText, { max: 1 });
  if (chapters.length === 0) return null;

  if (topic === "crm" || SWITCH_CRM_RE.test(userText)) {
    return [
      "Before you switch, it helps to name what you actually need the CRM to do — follow-ups, pipeline, or just remembering people.",
      "Migration and ongoing maintenance are real costs, so sometimes the kinder move is tightening what you already have.",
      "What outcome would make a switch worth it for you?",
    ].join(" ");
  }

  if (topic === "switch_replace") {
    return [
      "Switching only pays off when the current tool is blocking a real outcome — not when something new merely looks shinier.",
      "I'd weigh migration burden and who will maintain the new system before moving anything.",
      "What's breaking in the one you have now?",
    ].join(" ");
  }

  return [
    chapters[0]!.offerHint,
    "What outcome are you hoping for if nothing else changes?",
  ].join(" ");
}
