// Live Content Opportunity Generator — titles, angles, and asset ideas from signal counts only.

import type { EcosystemSignalCount } from "./serverSignalStore";
import type { GhlProductSignal } from "@/lib/ghl/types";

export type ContentTrend = "up" | "stable" | "down";

export type LiveContentAssetType =
  | "social_post"
  | "blog"
  | "newsletter"
  | "workshop"
  | "lead_magnet"
  | "email_series"
  | "youtube_video";

export type LiveContentAssetSuggestion = {
  type: LiveContentAssetType;
  label: string;
  title: string;
  angle: string;
};

export type LiveContentSourceSignal = {
  kind: string;
  category: string;
  count: number;
};

export type LiveContentOpportunity = {
  id: string;
  topic: string;
  topicKey: string;
  frequency: number;
  opportunityScore: number;
  trend: ContentTrend;
  whyThisMatters: string;
  sourceSignals: LiveContentSourceSignal[];
  suggestedAssets: LiveContentAssetSuggestion[];
};

export type LiveContentGeneratorInput = {
  counts: EcosystemSignalCount[];
  productSignals?: GhlProductSignal[];
  now?: Date;
  limit?: number;
};

export type PostCraftLiveExport = {
  generatedAt: string;
  dashboardName: "ADHD Business Ecosystem Dashboard";
  opportunities: Array<{
    topic: string;
    topicKey: string;
    mentions: number;
    opportunityScore: number;
    trend: ContentTrend;
    whyThisMatters: string;
    sourceSignals: LiveContentSourceSignal[];
    assets: LiveContentAssetSuggestion[];
  }>;
};

const ASSET_LABELS: Record<LiveContentAssetType, string> = {
  social_post: "Social Post",
  blog: "Blog",
  newsletter: "Newsletter",
  workshop: "Workshop",
  lead_magnet: "Lead Magnet",
  email_series: "Email Series",
  youtube_video: "YouTube Video",
};

type TopicPlaybook = {
  topicKey: string;
  topic: string;
  match: { kind: string; category: string }[];
  whyThisMatters: (frequency: number, trend: ContentTrend) => string;
  assets: LiveContentAssetSuggestion[];
};

const PLAYBOOKS: TopicPlaybook[] = [
  {
    topicKey: "overwhelm",
    topic: "Overwhelm",
    match: [
      { kind: "struggle", category: "overwhelm" },
      { kind: "question", category: "im_overwhelmed" },
      { kind: "emotion", category: "frustrated" },
      { kind: "emotion", category: "stuck" },
    ],
    whyThisMatters: (frequency, trend) =>
      `${frequency} categorized signals show founders stalling when everything feels urgent${trend === "up" ? " — and mentions are rising this week" : ""}. Content that names overwhelm and offers one next step builds trust fast.`,
    assets: [
      {
        type: "social_post",
        label: ASSET_LABELS.social_post,
        title: "When your brain says everything is urgent",
        angle: "Short post validating overwhelm without adding more tasks — one calming reframe.",
      },
      {
        type: "blog",
        label: ASSET_LABELS.blog,
        title: "ADHD overwhelm in business: why everything feels urgent at once",
        angle: "Explain the pattern, normalize it, and end with a single triage question.",
      },
      {
        type: "newsletter",
        label: ASSET_LABELS.newsletter,
        title: "What to do when everything feels urgent",
        angle: "Three-part issue: name the pile, pick one container, schedule one 15-minute win.",
      },
      {
        type: "workshop",
        label: ASSET_LABELS.workshop,
        title: "Reducing overwhelm: one container at a time",
        angle: "Live working session — brain dump, cluster, and choose one lane for the week.",
      },
      {
        type: "youtube_video",
        label: ASSET_LABELS.youtube_video,
        title: "Stop drowning in tasks (ADHD-friendly overwhelm reset)",
        angle: "5-minute on-camera walkthrough of a single reset ritual founders can reuse.",
      },
    ],
  },
  {
    topicKey: "prioritization",
    topic: "Prioritization",
    match: [
      { kind: "struggle", category: "prioritization" },
      { kind: "question", category: "help_me_prioritize" },
      { kind: "question", category: "what_should_i_work_on" },
      { kind: "emotion", category: "confused" },
    ],
    whyThisMatters: (frequency, trend) =>
      `${frequency} signals ask some version of “what matters first?”${trend === "up" ? " — demand is trending up" : ""}. Priority rescue content converts because it reduces decision fatigue.`,
    assets: [
      {
        type: "social_post",
        label: ASSET_LABELS.social_post,
        title: "Post series: choosing what to work on when everything competes",
        angle: "3-post mini-series — too many priorities, one lane, one win.",
      },
      {
        type: "blog",
        label: ASSET_LABELS.blog,
        title: "How ADHD founders choose what to work on first",
        angle: "Framework post: impact vs energy vs deadline — pick one filter per day.",
      },
      {
        type: "lead_magnet",
        label: ASSET_LABELS.lead_magnet,
        title: "ADHD Priority Rescue Checklist",
        angle: "One-page printable: triage inbox, projects, and nagging tasks into now / later / drop.",
      },
      {
        type: "workshop",
        label: ASSET_LABELS.workshop,
        title: "Deciding what matters first (without the guilt spiral)",
        angle: "Guided prioritization lab with live sorting and one committed next action.",
      },
      {
        type: "email_series",
        label: ASSET_LABELS.email_series,
        title: "5 emails: from scattered to one clear priority",
        angle: "Daily nudge sequence — shrink the list, protect focus, celebrate one finish.",
      },
    ],
  },
  {
    topicKey: "focus",
    topic: "Focus",
    match: [
      { kind: "struggle", category: "focus" },
      { kind: "emotion", category: "stuck" },
    ],
    whyThisMatters: (frequency, trend) =>
      `${frequency} focus-related signals${trend === "up" ? " are climbing" : ""}. Founders want practical guardrails, not generic productivity advice.`,
    assets: [
      {
        type: "social_post",
        label: ASSET_LABELS.social_post,
        title: "The 25-minute lie we tell ourselves (and what works instead)",
        angle: "Honest post about focus friction plus one realistic focus block ritual.",
      },
      {
        type: "blog",
        label: ASSET_LABELS.blog,
        title: "Focus for ADHD entrepreneurs when the tab count keeps growing",
        angle: "Environmental + body-double tactics with zero shame framing.",
      },
      {
        type: "youtube_video",
        label: ASSET_LABELS.youtube_video,
        title: "My actual focus setup for scattered workdays",
        angle: "Screen-share style tour of tools, timers, and distraction off-ramps.",
      },
      {
        type: "workshop",
        label: ASSET_LABELS.workshop,
        title: "Focus sprint clinic",
        angle: "Co-working style session with a single deliverable defined upfront.",
      },
    ],
  },
  {
    topicKey: "getting_started",
    topic: "Getting Started",
    match: [
      { kind: "question", category: "dont_know_where_to_start" },
      { kind: "emotion", category: "confused" },
      { kind: "emotion", category: "hopeful" },
    ],
    whyThisMatters: (frequency, trend) =>
      `${frequency} signals show founders frozen at the starting line${trend === "up" ? " — increasing lately" : ""}. “Where do I start?” content lowers activation energy.`,
    assets: [
      {
        type: "social_post",
        label: ASSET_LABELS.social_post,
        title: "You don't need a perfect plan — you need a first inch",
        angle: "Micro-start post with one absurdly small first action example.",
      },
      {
        type: "newsletter",
        label: ASSET_LABELS.newsletter,
        title: "The first 20 minutes when you don't know where to start",
        angle: "Issue template: clear desk, pick one thread, set a timer, stop on purpose.",
      },
      {
        type: "lead_magnet",
        label: ASSET_LABELS.lead_magnet,
        title: "First Step Finder for Stuck Days",
        angle: "Decision tree PDF — emotion check, energy check, one chosen lane.",
      },
      {
        type: "email_series",
        label: ASSET_LABELS.email_series,
        title: "3-day start ritual",
        angle: "Short sequence to break inertia without over-planning.",
      },
    ],
  },
  {
    topicKey: "marketing",
    topic: "Marketing",
    match: [{ kind: "struggle", category: "marketing" }],
    whyThisMatters: (frequency) =>
      `${frequency} marketing struggle signals — founders want visibility without burning out.`,
    assets: [
      {
        type: "blog",
        label: ASSET_LABELS.blog,
        title: "Marketing when you hate being 'on' all the time",
        angle: "Low-spoon marketing map: one channel, one rhythm, one metric.",
      },
      {
        type: "social_post",
        label: ASSET_LABELS.social_post,
        title: "Batch day vs panic post — pick your marketing mode",
        angle: "Compare two sustainable rhythms without prescribing hustle.",
      },
      {
        type: "youtube_video",
        label: ASSET_LABELS.youtube_video,
        title: "How I plan a week of content in one sitting",
        angle: "Founder-led batching demo tied to energy, not calendars.",
      },
    ],
  },
  {
    topicKey: "content_creation",
    topic: "Content Creation",
    match: [{ kind: "struggle", category: "content_creation" }],
    whyThisMatters: (frequency) =>
      `${frequency} content-creation friction signals — help founders ship drafts, not stare at blanks.`,
    assets: [
      {
        type: "newsletter",
        label: ASSET_LABELS.newsletter,
        title: "From blank page to published (without the shame spiral)",
        angle: "Issue on ugly first drafts, templates, and publish windows.",
      },
      {
        type: "workshop",
        label: ASSET_LABELS.workshop,
        title: "Draft hour: write one piece together",
        angle: "Live co-write with a shared prompt and hard stop.",
      },
      {
        type: "lead_magnet",
        label: ASSET_LABELS.lead_magnet,
        title: "10 fill-in prompts for ADHD founders",
        angle: "Swipe file of starters for posts, emails, and scripts.",
      },
    ],
  },
  {
    topicKey: "follow_through",
    topic: "Follow Through",
    match: [
      { kind: "struggle", category: "follow_through" },
      { kind: "emotion", category: "frustrated" },
    ],
    whyThisMatters: (frequency, trend) =>
      `${frequency} signals show founders stalling before the finish line${trend === "up" ? " — rising this week" : ""}. Finish-line content reduces shame and increases completion.`,
    assets: [
      {
        type: "email_series",
        label: ASSET_LABELS.email_series,
        title: "5 emails: finish what you started (without the guilt)",
        angle: "Short accountability sequence — define done, shrink the last step, celebrate close.",
      },
      {
        type: "workshop",
        label: ASSET_LABELS.workshop,
        title: "Close the loop clinic",
        angle: "Bring one almost-done project; leave with a shipped micro-outcome.",
      },
      {
        type: "lead_magnet",
        label: ASSET_LABELS.lead_magnet,
        title: "The Last 10% Checklist",
        angle: "PDF for ADHD founders — definition of done, friction scan, one completion block.",
      },
      {
        type: "blog",
        label: ASSET_LABELS.blog,
        title: "Why ADHD founders stop at 90%",
        angle: "Normalize the pattern and offer three finish rituals that actually stick.",
      },
    ],
  },
  {
    topicKey: "decision_making",
    topic: "Decision Making",
    match: [
      { kind: "struggle", category: "decision_making" },
      { kind: "emotion", category: "confused" },
    ],
    whyThisMatters: (frequency, trend) =>
      `${frequency} decision-friction signals${trend === "up" ? " are trending up" : ""}. Clarity content helps founders pick a lane without analysis paralysis.`,
    assets: [
      {
        type: "blog",
        label: ASSET_LABELS.blog,
        title: "Good enough decisions for ADHD entrepreneurs",
        angle: "Reversible vs irreversible choices — pick fast, adjust later.",
      },
      {
        type: "youtube_video",
        label: ASSET_LABELS.youtube_video,
        title: "3 filters I use when I can't decide",
        angle: "Quick on-camera framework: energy, impact, deadline.",
      },
      {
        type: "workshop",
        label: ASSET_LABELS.workshop,
        title: "Decision hour: pick one path",
        angle: "Live facilitation — two options in, one committed next step out.",
      },
      {
        type: "newsletter",
        label: ASSET_LABELS.newsletter,
        title: "When every option feels equally important",
        angle: "Newsletter on satisficing, time-boxing, and default rules.",
      },
    ],
  },
];

const PRODUCT_TOPIC_BOOST: Record<string, string[]> = {
  overwhelm: ["overwhelm", "overwhelmed"],
  prioritization: ["priorit", "work on"],
  focus: ["focus"],
  getting_started: ["start", "where to start"],
  marketing: ["marketing", "launch"],
  content_creation: ["content", "writing"],
  follow_through: ["finish", "follow"],
  decision_making: ["decide", "decision"],
};

function productBoostForTopic(
  topicKey: string,
  productSignals?: GhlProductSignal[],
): number {
  if (!productSignals?.length) return 0;
  const needles = PRODUCT_TOPIC_BOOST[topicKey] ?? [topicKey.replace(/_/g, " ")];
  let boost = 0;
  for (const signal of productSignals) {
    const hay = signal.label.toLowerCase();
    if (needles.some((n) => hay.includes(n))) {
      boost += Math.min(signal.count, 25);
    }
  }
  return boost;
}

function matchesPlaybook(
  row: EcosystemSignalCount,
  playbook: TopicPlaybook,
): boolean {
  return playbook.match.some(
    (m) => m.kind === row.kind && m.category === row.category,
  );
}

function computeTrendFromLastSeen(
  matchedCounts: EcosystemSignalCount[],
  frequency: number,
  now: Date,
): ContentTrend {
  if (!matchedCounts.length) return "stable";
  const msDay = 86_400_000;
  const latest = Math.max(
    ...matchedCounts.map((r) => new Date(r.lastSeen).getTime()),
  );
  const ageDays = (now.getTime() - latest) / msDay;
  const density = frequency / Math.max(matchedCounts.length, 1);

  if (ageDays <= 4 && density >= 3) return "up";
  if (ageDays > 21 && frequency < 5) return "down";
  if (ageDays <= 7 && frequency >= 10) return "up";
  return "stable";
}

export function calculateLiveOpportunityScore(input: {
  frequency: number;
  trend: ContentTrend;
  signalTypes: number;
}): number {
  const { frequency, trend, signalTypes } = input;
  const trendBonus = trend === "up" ? 12 : trend === "down" ? -5 : 0;
  const raw = frequency * 0.22 + signalTypes * 8 + trendBonus;
  return Math.min(100, Math.max(0, Math.round(raw)));
}

function cloneAssets(assets: LiveContentAssetSuggestion[]): LiveContentAssetSuggestion[] {
  return assets.map((a) => ({ ...a }));
}

export function generateLiveContentOpportunities(
  input: LiveContentGeneratorInput,
): LiveContentOpportunity[] {
  const now = input.now ?? new Date();
  const opportunities: LiveContentOpportunity[] = [];

  for (const playbook of PLAYBOOKS) {
    const matched = input.counts.filter((row) => matchesPlaybook(row, playbook));
    if (!matched.length) continue;

    const sourceSignals: LiveContentSourceSignal[] = matched.map((r) => ({
      kind: r.kind,
      category: r.category,
      count: r.count,
    }));
    const frequency = sourceSignals.reduce((sum, s) => sum + s.count, 0);
    if (frequency < 1) continue;

    const signalTypes = new Set(sourceSignals.map((s) => s.kind)).size;
    const trend = computeTrendFromLastSeen(matched, frequency, now);
    const productBoost = productBoostForTopic(
      playbook.topicKey,
      input.productSignals,
    );
    const adjustedFrequency = frequency + productBoost;
    const opportunityScore = calculateLiveOpportunityScore({
      frequency: adjustedFrequency,
      trend,
      signalTypes,
    });

    opportunities.push({
      id: `live-opp-${playbook.topicKey}`,
      topic: playbook.topic,
      topicKey: playbook.topicKey,
      frequency: adjustedFrequency,
      opportunityScore,
      trend,
      whyThisMatters: playbook.whyThisMatters(frequency, trend),
      sourceSignals,
      suggestedAssets: cloneAssets(playbook.assets),
    });
  }

  const ranked = opportunities.sort(
    (a, b) =>
      b.opportunityScore - a.opportunityScore ||
      b.frequency - a.frequency,
  );

  const limit = input.limit ?? 10;
  return ranked.slice(0, limit);
}

export function toPostCraftLiveExport(
  opportunities: LiveContentOpportunity[],
  now = new Date(),
): PostCraftLiveExport {
  return {
    generatedAt: now.toISOString(),
    dashboardName: "ADHD Business Ecosystem Dashboard",
    opportunities: opportunities.map((o) => ({
      topic: o.topic,
      topicKey: o.topicKey,
      mentions: o.frequency,
      opportunityScore: o.opportunityScore,
      trend: o.trend,
      whyThisMatters: o.whyThisMatters,
      sourceSignals: o.sourceSignals,
      assets: o.suggestedAssets,
    })),
  };
}

/** Sanity check — opportunities must not carry conversation fields. */
export function opportunitiesAreSignalOnly(
  opportunities: LiveContentOpportunity[],
): boolean {
  const forbidden = [
    "text",
    "message",
    "content",
    "conversation",
    "transcript",
    "body",
    "draft",
  ];
  const blob = JSON.stringify(opportunities).toLowerCase();
  return !forbidden.some((word) => blob.includes(`"${word}"`));
}
