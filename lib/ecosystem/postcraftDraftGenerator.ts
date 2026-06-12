// PostCraft Content Draft Generator — first drafts from live opportunities only.

import type {
  ContentTrend,
  LiveContentAssetType,
  LiveContentSourceSignal,
  PostCraftLiveExport,
} from "./liveContentOpportunityGenerator";

export type ContentDraftStatus =
  | "idea"
  | "drafted"
  | "reviewed"
  | "approved"
  | "scheduled"
  | "published";

export const CONTENT_DRAFT_STATUSES: ContentDraftStatus[] = [
  "idea",
  "drafted",
  "reviewed",
  "approved",
  "scheduled",
  "published",
];

export type PostCraftDraftInput = {
  topic: string;
  topicKey: string;
  mentions?: number;
  opportunityScore: number;
  trend: ContentTrend;
  whyThisMatters: string;
  assetType: LiveContentAssetType;
  assetLabel: string;
  title: string;
  angle: string;
  sourceSignals: LiveContentSourceSignal[];
};

export type ContentDraft = {
  id: string;
  topic: string;
  topicKey: string;
  assetType: LiveContentAssetType;
  assetLabel: string;
  title: string;
  angle: string;
  opportunityScore: number;
  trend: ContentTrend;
  sourceSignalSummary: string;
  whyThisMatters: string;
  body: string;
  status: ContentDraftStatus;
  postCraftSyncReady: boolean;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
};

export type GenerateDraftResult = {
  draft: ContentDraft;
  usedLlm: boolean;
};

const FORBIDDEN_DRAFT_PATTERNS = [
  /\buser said\b/i,
  /\bthey said\b/i,
  /\bconversation\b/i,
  /\btranscript\b/i,
  /\bchat log\b/i,
  /"message":/i,
  /\bverbatim\b/i,
];

const ASSET_STRUCTURE: Record<LiveContentAssetType, string> = {
  social_post:
    "Short social post (under 280 words). Hook, 2-3 short paragraphs, soft CTA. Line breaks between thoughts.",
  blog: "Blog post with a warm intro, 3-4 sections with plain headings, practical takeaways, gentle close.",
  newsletter:
    "Newsletter issue: subject line, preview line, body with 3 sections, one clear next step.",
  workshop:
    "Workshop outline: promise, who it's for, 45-min agenda (timed blocks), participant outcome, facilitator notes.",
  lead_magnet:
    "Lead magnet outline: title, one-page sections, checklist or worksheet bullets, opt-in promise.",
  email_series:
    "Email series: 3 emails. For each — subject, preview, body (short), one action. Label Email 1/2/3.",
  youtube_video:
    "YouTube script outline: hook (15 sec), 3 talking beats, b-roll notes, closing CTA. Conversational spoken tone.",
};

export function summarizeSourceSignals(
  signals: LiveContentSourceSignal[],
): string {
  return signals
    .map((s) => `${s.kind}/${s.category}: ${s.count}`)
    .join(" · ");
}

export function buildPostCraftDraftPrompt(input: PostCraftDraftInput): {
  system: string;
  user: string;
} {
  const signalSummary = summarizeSourceSignals(input.sourceSignals);
  const system = `You write first-draft marketing content for Spark Studio Companions — warm, plain, ADHD-friendly, and supportive. Never clinical. Never shamey.

RULES:
- Use ONLY the topic, title, angle, trend, and aggregated signal counts provided.
- Do NOT invent or quote user conversations, messages, names, or private details.
- Do NOT use markdown symbols (no **, #, or backticks).
- Write copy-paste-ready content with real line breaks.
- Tone: calm, practical, human — like a supportive coach.

You are drafting a ${input.assetLabel}. Structure: ${ASSET_STRUCTURE[input.assetType]}`;

  const user = `Topic: ${input.topic}
Opportunity score: ${input.opportunityScore} (${input.trend} trend)
Aggregated signals (counts only): ${signalSummary}
Why this matters: ${input.whyThisMatters}

Title: ${input.title}
Angle: ${input.angle}

Write the first draft now. Return ONLY the draft content.`;

  return { system, user };
}

export function buildTemplateDraft(input: PostCraftDraftInput): string {
  const signals = summarizeSourceSignals(input.sourceSignals);
  const lines = [
    input.title,
    "",
    `(${input.assetLabel} draft — ${input.topic})`,
    "",
    input.angle,
    "",
    `Why we're creating this: ${input.whyThisMatters}`,
    "",
    `Founders in our ecosystem are showing ${input.mentions ?? "many"} related signals (${signals}). You're not alone if this resonates.`,
    "",
  ];

  switch (input.assetType) {
    case "social_post":
      lines.push(
        "Here's the truth: when everything feels urgent, your brain isn't broken — it's protecting you.",
        "",
        "Try this today: pick ONE container. Name it out loud. Everything else can wait in the parking lot.",
        "",
        "What's the one thing you'd rescue first? (No wrong answers.)",
      );
      break;
    case "blog":
      lines.push(
        "Intro",
        "If " + input.topic.toLowerCase() + " has been stealing your week, you're in good company.",
        "",
        "What’s really going on",
        "This pattern shows up when too many open loops compete for attention.",
        "",
        "One thing to try",
        "Shrink the list to three items. Circle one. Set a 15-minute timer.",
        "",
        "Close",
        "Progress beats perfection. One inch still counts.",
      );
      break;
    case "newsletter":
      lines.push(
        "Subject: " + input.title,
        "Preview: A calm plan when the pile feels impossible",
        "",
        "Hey —",
        "",
        input.angle,
        "",
        "Try this week: one brain dump, three buckets, one win.",
      );
      break;
    case "workshop":
      lines.push(
        "Workshop: " + input.title,
        "Duration: 45 minutes",
        "",
        "0-5 min — Welcome & normalize the struggle",
        "5-20 min — Brain dump everything on paper",
        "20-35 min — Sort into now / later / drop",
        "35-45 min — Commit to one next action",
      );
      break;
    case "lead_magnet":
      lines.push(
        "The " + input.topic + " Rescue Sheet",
        "",
        "Step 1 — Name what's loud",
        "Step 2 — Pick one lane",
        "Step 3 — Define done (small)",
        "Step 4 — 15-minute start",
        "Step 5 — Celebrate the inch",
      );
      break;
    case "email_series":
      lines.push(
        "Email 1 — " + input.title,
        "You're not behind. You're carrying a lot.",
        "",
        "Email 2 — Pick one lane",
        "Three filters: energy, impact, deadline.",
        "",
        "Email 3 — Close the loop",
        "Define done. Ship the small version.",
      );
      break;
    case "youtube_video":
      lines.push(
        "HOOK (0:00-0:15)",
        "If " + input.topic.toLowerCase() + " is winning right now — stay with me.",
        "",
        "BEAT 1 — Name the pattern",
        "BEAT 2 — One reset ritual",
        "BEAT 3 — Your one next step",
        "",
        "OUTRO",
        "Comment with the one thing you're choosing today.",
      );
      break;
    default:
      lines.push(input.angle);
  }

  return lines.join("\n");
}

export function draftContentIsSafe(body: string): boolean {
  const trimmed = body.trim();
  if (!trimmed) return false;
  return !FORBIDDEN_DRAFT_PATTERNS.some((re) => re.test(trimmed));
}

function newDraftId(): string {
  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export type LlmCaller = (prompt: {
  system: string;
  user: string;
}) => Promise<string>;

export async function generatePostCraftDraft(
  input: PostCraftDraftInput,
  options: { callLlm?: LlmCaller } = {},
): Promise<GenerateDraftResult> {
  let body: string;
  let usedLlm = false;

  if (options.callLlm) {
    const prompt = buildPostCraftDraftPrompt(input);
    body = (await options.callLlm(prompt)).trim();
    usedLlm = true;
  } else {
    body = buildTemplateDraft(input);
  }

  if (!draftContentIsSafe(body)) {
    body = buildTemplateDraft(input);
    usedLlm = false;
  }

  const now = new Date().toISOString();
  const draft: ContentDraft = {
    id: newDraftId(),
    topic: input.topic,
    topicKey: input.topicKey,
    assetType: input.assetType,
    assetLabel: input.assetLabel,
    title: input.title,
    angle: input.angle,
    opportunityScore: input.opportunityScore,
    trend: input.trend,
    sourceSignalSummary: summarizeSourceSignals(input.sourceSignals),
    whyThisMatters: input.whyThisMatters,
    body,
    status: "drafted",
    postCraftSyncReady: false,
    createdAt: now,
    updatedAt: now,
  };

  return { draft, usedLlm };
}

export function findAssetInPostCraftExport(
  exportData: PostCraftLiveExport,
  topicKey: string,
  assetType: LiveContentAssetType,
): PostCraftDraftInput | null {
  const opportunity = exportData.opportunities.find(
    (o) => o.topicKey === topicKey,
  );
  if (!opportunity) return null;

  const asset = opportunity.assets.find((a) => a.type === assetType);
  if (!asset) return null;

  return {
    topic: opportunity.topic,
    topicKey: opportunity.topicKey,
    mentions: opportunity.mentions,
    opportunityScore: opportunity.opportunityScore,
    trend: opportunity.trend,
    whyThisMatters: opportunity.whyThisMatters,
    assetType: asset.type,
    assetLabel: asset.label,
    title: asset.title,
    angle: asset.angle,
    sourceSignals: opportunity.sourceSignals,
  };
}

export function toPostCraftSyncPayload(draft: ContentDraft) {
  return {
    id: draft.id,
    status: draft.status,
    topic: draft.topic,
    assetType: draft.assetType,
    assetLabel: draft.assetLabel,
    title: draft.title,
    angle: draft.angle,
    body: draft.body,
    opportunityScore: draft.opportunityScore,
    trend: draft.trend,
    sourceSignalSummary: draft.sourceSignalSummary,
    approvedAt: draft.approvedAt,
    updatedAt: draft.updatedAt,
  };
}
