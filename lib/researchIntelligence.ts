/**
 * Research Intelligence — constitutional capability.
 * The Companion owns research; the user never selects tools, browsers, or search engines.
 */

import { isKnowledgeQuestion } from "./knowledgeIntelligence";

/** External / current-information signals — auto-activate Research Intelligence */
export const RESEARCH_EXTERNAL_RE =
  /\b(?:latest|newest|recent(?:ly)?|current(?:ly)?|today'?s|this (?:week|month|year)|in 202[4-9]|right now|up to date|up-to-date)\b/i;

const TRENDS_RE =
  /\b(?:(?:pinterest|tiktok|instagram|linkedin|social media|youtube) trends?|trend(?:s|ing)? (?:on|for|in)|what(?:'s| is) (?:hot|popular|trending)|viral (?:on|right now))\b/i;

const STATS_RE =
  /\b(?:statistics?|stats?|data (?:on|about|show)|numbers? (?:on|for)|how many|what percent|market share)\b/i;

const NEWS_RE =
  /\b(?:news (?:about|on)|headlines|breaking news|what happened (?:with|to|in))\b/i;

const COMPETITOR_RE =
  /\b(?:competitor(?:s)?|competition|compare\b|versus|vs\.?|alternative(?:s)? to)\b/i;

const PRICING_RE =
  /\b(?:pricing (?:for|of|on)|price of|how much (?:does|do|is|are)|cost of|subscription (?:cost|price))\b/i;

const REVIEWS_RE =
  /\b(?:reviews? (?:of|for|on)|ratings? (?:for|of)|what do (?:people|users) (?:say|think)|user feedback on)\b/i;

const STUDIES_RE =
  /\b(?:(?:newest|latest|recent) (?:ADHD )?stud(?:y|ies)|research paper|clinical trial|peer.?review(?:ed)?)\b/i;

const REGULATIONS_RE =
  /\b(?:regulation(?:s)? (?:on|for|about)|compliance (?:with|for)|legal requirement|(?:FDA|GDPR|HIPAA) (?:rules?|requirements?))\b/i;

const MARKET_RE =
  /\b(?:market research|market size|industry (?:trend|report)|TAM|SAM)\b/i;

const AI_TOOLS_RE =
  /\b(?:new(?:est)? ai tool|current ai|best ai (?:tool|app)s?|ai (?:tools?|apps?) (?:for|in|right now))\b/i;

const LOCAL_RE =
  /\b(?:local business(?:es)?|near me|in (?:my|the) (?:area|city|town|neighborhood))\b/i;

const TRAVEL_RE =
  /\b(?:travel (?:to|info|information|advice)|flights? to|hotels? in|destination(?:s)? (?:for|in)|visa (?:for|requirements?))\b/i;

const LOOKUP_RE =
  /\b(?:look (?:that |this )?up|find (?:out|me) (?:about|the)|search for (?:the )?latest)\b/i;

/** Classic research phrasing (studies, evidence, what research says). */
export const RESEARCH_ACADEMIC_RE =
  /\b(?:what does research say|what do(?:es)? (?:the )?research(?:ers)? say|what (?:do|does) (?:the )?stud(?:y|ies) (?:say|show|suggest|find)|according to research|research (?:on|about|into|suggests?|shows?|says?|indicates?)|scientific (?:evidence|research)|evidence (?:on|about|for|that|suggests?))\b/i;

const RESEARCH_SIGNALS: readonly RegExp[] = [
  RESEARCH_EXTERNAL_RE,
  RESEARCH_ACADEMIC_RE,
  TRENDS_RE,
  STATS_RE,
  NEWS_RE,
  COMPETITOR_RE,
  PRICING_RE,
  REVIEWS_RE,
  STUDIES_RE,
  REGULATIONS_RE,
  MARKET_RE,
  AI_TOOLS_RE,
  LOCAL_RE,
  TRAVEL_RE,
  LOOKUP_RE,
];

/** Phrases the Companion must never use — Research Intelligence constitutional rule */
export const FORBIDDEN_RESEARCH_DISCLAIMERS: readonly string[] = [
  "I can't connect to the internet",
  "I don't have internet access",
  "I can't browse",
  "I can't search the web",
  "I don't have live access",
  "I can't look that up",
  "I don't know because my information is old",
  "my training data",
  "knowledge cutoff",
] as const;

/** Natural failure language — only for actual temporary connectivity issues */
export const RESEARCH_CONNECTIVITY_FAILURE_MESSAGE =
  "I'm having trouble reaching current online sources right now. I can still help based on what I already know, or we can try again in a moment." as const;

export function isResearchIntelligenceRequest(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (RESEARCH_SIGNALS.some((re) => re.test(t))) return true;
  return false;
}

export function extractResearchTopic(text: string): string | null {
  const t = text.trim();
  const patterns = [
    /\b(?:latest|newest|recent) (.+?)(?:[.?!]|$)/i,
    /\b(?:trends? (?:on|for|in)) (.+?)(?:[.?!]|$)/i,
    /\bresearch (?:on|about|into) (.+?)(?:[.?!]|$)/i,
    /\bcompare (.+?)(?:[.?!]|$)/i,
    /\b(?:reviews?|pricing) (?:of|for|on) (.+?)(?:[.?!]|$)/i,
  ];
  for (const re of patterns) {
    const m = t.match(re);
    const topic = m?.[1]?.trim();
    if (topic && topic.length >= 3 && topic.length <= 120) {
      return topic.replace(/\s+(?:please|right now)\b.*$/i, "").trim();
    }
  }
  return null;
}

export function researchIntelligenceHintForChat(userText: string): string {
  const topic = extractResearchTopic(userText);
  return [
    "RESEARCH INTELLIGENCE (constitutional — you own research):",
    topic ? `Topic: ${topic}.` : "User needs current, external, or factual information.",
    "Activate automatically — the user never selects search engines, browsers, AI providers, models, or tools.",
    "Gather, compare, and synthesize findings into clear actionable guidance — not raw link dumps.",
    'Natural openers: "I looked into…", "I found several…", "I compared their…"',
    `FORBIDDEN disclaimers: ${FORBIDDEN_RESEARCH_DISCLAIMERS.slice(0, 5).join("; ")}; never mention training data or knowledge cutoffs.`,
    'FORBIDDEN meta: "I\'m searching", "I\'m browsing", "I\'m using…", "I\'m calling…", "I\'m switching models".',
    `Connectivity failure only: "${RESEARCH_CONNECTIVITY_FAILURE_MESSAGE}"`,
    "Do NOT ask the user to search, browse, or use another AI app.",
  ].join("\n");
}

/** Whether timeless concept learning should stay on Knowledge Intelligence fast path */
export function isTimelessKnowledgeNotResearch(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (isResearchIntelligenceRequest(t)) return false;
  return isKnowledgeQuestion(t);
}
