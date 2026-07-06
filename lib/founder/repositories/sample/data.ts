import type {
  FounderAutomationOpportunity,
  FounderCreationOpportunity,
  FounderDailyBrief,
  FounderInsight,
  FounderMemoryItem,
  FounderRecommendation,
  FounderReport,
  FounderRoomCard,
  FounderTaskRecommendation,
  FounderProjectSuggestion,
} from "../../types";

const TODAY = new Date().toISOString().slice(0, 10);

export const SAMPLE_TODAY_BRIEF: FounderDailyBrief = {
  id: `brief-${TODAY}`,
  date: TODAY,
  greeting: "Good Morning, Shari.",
  prompt: "What would help most right now?",
  status: "active",
  generatedAt: new Date().toISOString(),
  glance: [
    {
      id: "critical",
      title: "Critical",
      items: [
        {
          id: "c1",
          label: "Critical",
          tone: "critical",
          summary:
            "Phase 2 intelligence foundation — wire services before any external APIs.",
        },
      ],
    },
    {
      id: "opportunities",
      title: "Opportunities",
      items: [
        {
          id: "o1",
          label: "Opportunity",
          tone: "opportunity",
          summary:
            "Member onboarding video — short welcome, not a product tour.",
        },
        {
          id: "o2",
          label: "Opportunity",
          tone: "opportunity",
          summary:
            "ADHD planner bundle with Spark Card™ — test with 3 founders.",
        },
      ],
    },
    {
      id: "quick-wins",
      title: "Quick Wins",
      items: [
        {
          id: "q1",
          label: "Quick Win",
          tone: "quick-win",
          summary:
            "FIRE daily brief template — one page, three decisions max.",
        },
      ],
    },
    {
      id: "on-deck",
      title: "On Deck",
      items: [
        {
          id: "d1",
          label: "On Deck",
          tone: "on-deck",
          summary: "Ocean Conservatory polish — mobile flicker validation.",
        },
        {
          id: "d2",
          label: "On Deck",
          tone: "on-deck",
          summary: "Team Hub™ Izna lane — marketing execution only.",
        },
      ],
    },
  ],
  bestIdea: {
    id: "best-idea-today",
    title: "Today's Best Idea",
    summary:
      "Lock the Founder Intelligence OS foundation now — services and repositories — so FIRE™, FLAME™, and SPARK™ plug in without another refactor.",
    tone: "insight",
    category: "strategy",
    source: "flame",
    score: { confidence: 0.92, impact: 0.88 },
  },
  priorities: [
    {
      id: "p1",
      title: "Founder services + repositories",
      note: "Brief, memory, insights, team hub",
      score: { confidence: 0.95, urgency: 0.9 },
    },
    {
      id: "p2",
      title: "Executive UI components",
      note: "Shared cards — no duplicate markup",
      score: { confidence: 0.88, urgency: 0.75 },
    },
    {
      id: "p3",
      title: "Phase 3 prep — FIRE daily brief schema",
      note: "Single swap from sample → live",
      score: { confidence: 0.85, urgency: 0.7 },
    },
  ],
  customerSignals: [
    {
      id: "s1",
      label: "Overwhelm on return",
      detail: "Members want calm re-entry — not task lists.",
      source: "member-signal",
    },
    {
      id: "s2",
      label: "Conversation quality",
      detail: "Spark Alpha tests trending positive vs generic chat.",
      source: "member-signal",
    },
    {
      id: "s3",
      label: "Estate discovery",
      detail: "Wander menu used — conservatory curiosity high.",
      source: "member-signal",
    },
  ],
  trends: [
    {
      id: "t1",
      label: "Companion-first workflows",
      direction: "up",
      note: "Members stay in conversation longer.",
    },
    {
      id: "t2",
      label: "Feature menu fatigue",
      direction: "down",
      note: "Fewer taps wins over more modules.",
    },
    {
      id: "t3",
      label: "AI trust sensitivity",
      direction: "watch",
      note: "Warmth + permission matter more than speed.",
    },
  ],
  revenueOpportunity: {
    id: "rev-1",
    title: "Revenue Opportunity",
    summary:
      "Premium Estate cohort — 12 founders, conversation-first onboarding, quarterly live with Shari.",
    tone: "revenue",
  },
  ignoreItems: [
    { id: "ig1", summary: "Full analytics dashboard — not this sprint" },
    { id: "ig2", summary: "Member-facing Founder features — never" },
    { id: "ig3", summary: "Rewriting conversation architecture — frozen" },
  ],
  weakSignals: [
    {
      id: "ws1",
      label: "Quiet returners",
      note: "Members open Estate but don't speak for two sessions — worth a gentler welcome test.",
    },
  ],
  competitorInsights: [
    {
      id: "ci1",
      competitor: "Generic AI apps",
      summary: "Winning on relationship continuity, not feature count.",
    },
  ],
  decisionReminders: [
    {
      id: "dr1",
      title: "Conversation architecture freeze",
      summary: "Observation Mode active — evolve from evidence only.",
      status: "active",
    },
  ],
  alerts: [
    {
      id: "al1",
      title: "Founder Studio deployed",
      summary: "Phase 1 live — Phase 2 foundation in progress.",
      tone: "quick-win",
      severity: "low",
    },
  ],
};

export const SAMPLE_MEMORY: readonly FounderMemoryItem[] = [
  {
    id: "mem-1",
    title: "Conversation is the product",
    summary: "Member experience wins when Spark feels like a companion, not software.",
    category: "business-decision",
    status: "active",
    source: "manual",
    tags: ["strategy", "spark"],
    createdAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "mem-2",
    title: "Founder Studio stays private",
    summary: "Strategy intelligence never surfaces in member UI.",
    category: "product",
    status: "active",
    source: "manual",
    tags: ["founder", "privacy"],
    createdAt: "2026-07-05T18:00:00Z",
  },
  {
    id: "mem-3",
    title: "Estate menu simplification shipped",
    summary: "Fewer choices reduced wander fatigue — keep max 3 visible paths.",
    category: "lesson",
    status: "active",
    source: "team-hub",
    tags: ["estate", "ef"],
    createdAt: "2026-06-28T14:00:00Z",
  },
  {
    id: "mem-4",
    title: "Premium cohort pilot",
    summary: "Revisit after Founder Studio Phase 3 — small group, high touch.",
    category: "revisit",
    status: "candidate",
    source: "flame",
    tags: ["revenue"],
    createdAt: "2026-06-15T09:00:00Z",
    revisitAt: "2026-08-01T09:00:00Z",
  },
  {
    id: "mem-5",
    title: "Spark Card + planner bundle",
    summary: "Archived until onboarding video ships.",
    category: "archived-idea",
    status: "archived",
    source: "spark",
    tags: ["offer"],
    createdAt: "2026-05-10T11:00:00Z",
  },
];

export const SAMPLE_INSIGHTS: readonly FounderInsight[] = [
  SAMPLE_TODAY_BRIEF.bestIdea,
  {
    id: "ins-2",
    title: "Permission before drafts",
    summary: "Members trust Spark more when nothing appears without consent.",
    tone: "insight",
    category: "trust",
    source: "spark",
    score: { confidence: 0.9 },
  },
  {
    id: "ins-3",
    title: "Izna execution lane",
    summary: "Marketing tasks belong in Team Hub — not Founder strategy rooms.",
    tone: "on-deck",
    category: "operations",
    source: "manual",
    score: { confidence: 0.87 },
  },
  {
    id: "ins-4",
    title: "Conservatory curiosity",
    summary: "Living scene increases dwell time — subtle motion only.",
    tone: "opportunity",
    category: "product",
    source: "member-signal",
    score: { confidence: 0.8 },
  },
];

export const SAMPLE_RECOMMENDATIONS: readonly FounderRecommendation[] = [
  {
    id: "rec-1",
    title: "Wire getTodayBrief() everywhere",
    summary: "Home dashboard reads from brief service — no hardcoded arrays.",
    tone: "quick-win",
    category: "build",
    score: { confidence: 0.95, urgency: 0.9 },
  },
  {
    id: "rec-2",
    title: "FIRE morning PDF shell",
    summary: "One-page executive brief from daily brief object.",
    tone: "on-deck",
    category: "build",
    score: { confidence: 0.82 },
  },
  {
    id: "rec-3",
    title: "Ignore analytics APIs",
    summary: "Phase 2 is architecture only — no external connections yet.",
    tone: "ignore",
    category: "ignore",
    score: { confidence: 1 },
  },
  {
    id: "rec-4",
    title: "Ignore member Founder nav",
    summary: "Founder Studio never appears in estate menu.",
    tone: "ignore",
    category: "ignore",
    score: { confidence: 1 },
  },
];

export const SAMPLE_CREATION: readonly FounderCreationOpportunity[] = [
  {
    id: "workshop",
    format: "workshop",
    title: "Workshop",
    summary: "ADHD Business Clarity — 90-minute live outline",
    tone: "on-deck",
  },
  {
    id: "webinar",
    format: "webinar",
    title: "Webinar",
    summary: "Spark Estate walkthrough — conversation-first onboarding",
    tone: "opportunity",
  },
  {
    id: "course",
    format: "course",
    title: "Course",
    summary: "Momentum Builder module — draft lesson arc",
    tone: "on-deck",
  },
  {
    id: "newsletter",
    format: "newsletter",
    title: "Newsletter",
    summary: "Thursday note — one story, one invitation",
    tone: "quick-win",
  },
  {
    id: "linkedin",
    format: "linkedin",
    title: "LinkedIn post",
    summary: "Founder Studio behind the scenes — photo + 3 lines",
    tone: "opportunity",
  },
  {
    id: "pinterest",
    format: "pinterest",
    title: "Pinterest pin",
    summary: "Sunroom journal aesthetic — calm estate imagery",
    tone: "quick-win",
  },
  {
    id: "email-sequence",
    format: "email-sequence",
    title: "Email sequence",
    summary: "Welcome series — three gentle touches, no pressure",
    tone: "on-deck",
  },
  {
    id: "lead-magnet",
    format: "lead-magnet",
    title: "Lead magnet",
    summary: "Clear My Mind™ printable — gentle capture",
    tone: "insight",
  },
  {
    id: "campaign",
    format: "campaign",
    title: "Content campaign",
    summary: "Spring clarity campaign — estate + conversation theme",
    tone: "revenue",
  },
  {
    id: "video-1",
    format: "video",
    title: "Welcome video",
    summary: "60-second calm arrival — Shari voice, no feature tour",
    tone: "opportunity",
  },
];

export const SAMPLE_AUTOMATION: readonly FounderAutomationOpportunity[] = [
  {
    id: "fire-brief",
    title: "FIRE morning PDF",
    summary: "Auto-compile glance cards → Drive archive",
    tone: "on-deck",
    effort: "medium",
  },
  {
    id: "research",
    title: "Research automation",
    summary: "Queue topic scans → Knowledge Library drafts",
    tone: "insight",
    effort: "high",
  },
  {
    id: "analytics",
    title: "Analytics digest",
    summary: "Weekly member signals → Customer Pulse summary",
    tone: "on-deck",
    effort: "medium",
  },
  {
    id: "social-queue",
    title: "Social media queue",
    summary: "Draft → approve → schedule handoff for Izna",
    tone: "opportunity",
    effort: "low",
  },
  {
    id: "reporting",
    title: "Reporting",
    summary: "FIRE trend radar → one-page founder briefing",
    tone: "quick-win",
    effort: "low",
  },
  {
    id: "drive-pdf",
    title: "Google Drive PDFs",
    summary: "Archive completed briefings with dated folders",
    tone: "on-deck",
    effort: "medium",
  },
  {
    id: "content-prep",
    title: "Content creation prep",
    summary: "Creation Studio cards → Cursor build packages",
    tone: "opportunity",
    effort: "low",
  },
  {
    id: "team-assign",
    title: "Team assignments",
    summary: "Spark Command priorities → Team Hub lanes",
    tone: "quick-win",
    effort: "low",
  },
  {
    id: "cursor-prompts",
    title: "Cursor prompts",
    summary: "Package acceptance checks with each priority",
    tone: "quick-win",
    effort: "low",
  },
  {
    id: "follow-up",
    title: "Follow-up tasks",
    summary: "Waiting-on reminders — Shari, Izna, Cursor",
    tone: "on-deck",
    effort: "medium",
  },
];

export const SAMPLE_REPORTS: readonly FounderReport[] = [
  {
    id: "fire-2026-07-05",
    title: "FIRE Daily — Jul 5",
    summary: "Intelligence OS Phase 2 kickoff; member signals steady.",
    type: "fire-daily",
    publishedAt: "2026-07-05T08:00:00Z",
    tone: "insight",
  },
  {
    id: "fire-2026-07-04",
    title: "FIRE Daily — Jul 4",
    summary: "Founder Studio Phase 1 shipped; conservatory polish queued.",
    type: "fire-daily",
    publishedAt: "2026-07-04T08:00:00Z",
    tone: "on-deck",
  },
  {
    id: "forecast-q3",
    title: "Q3 Trend Forecast",
    summary: "Companion-first workflows rising; menu fatigue falling.",
    type: "forecast",
    publishedAt: "2026-07-01T12:00:00Z",
    tone: "insight",
  },
  {
    id: "decision-freeze",
    title: "Decision Record — Architecture Freeze",
    summary: "Conversation specs 105–131 complete; Observation Mode active.",
    type: "decision",
    publishedAt: "2026-06-20T16:00:00Z",
    tone: "insight",
  },
];

export const SAMPLE_PROJECTS: readonly FounderProjectSuggestion[] = [
  { id: "ap1", title: "Founder Intelligence OS", meta: "Cursor · In progress", status: "active" },
  { id: "ap2", title: "Ocean Conservatory polish", meta: "Cursor · Review", status: "active" },
];

export const SAMPLE_TASKS: readonly FounderTaskRecommendation[] = [
  { id: "mt1", title: "Record welcome voice take 2", meta: "Shari", assignee: "shari", lane: "my-tasks" },
  { id: "mt2", title: "Approve March newsletter theme", meta: "Shari", assignee: "shari", lane: "my-tasks" },
  { id: "ws1", title: "Brand photo selects", meta: "Izna · Needs approval", assignee: "izna", lane: "waiting-shari" },
  { id: "wi1", title: "Pinterest pin batch — Week 12", meta: "Due Friday", assignee: "izna", lane: "waiting-izna" },
  { id: "wi2", title: "Instagram carousel copy", meta: "Draft ready", assignee: "izna", lane: "waiting-izna" },
  { id: "wc1", title: "Founder access guard tests", meta: "Queued", assignee: "cursor", lane: "waiting-cursor" },
  { id: "a1", title: "Social post — Estate warmth quote", meta: "Approve / Edit", lane: "approvals" },
  { id: "as1", title: "Founder office background.png", meta: "Brand folder", lane: "assets" },
  { id: "as2", title: "Spark logo suite — gold on teal", meta: "Drive", lane: "assets" },
  { id: "sq1", title: "LinkedIn — conversation is the product", meta: "Scheduled Tue", lane: "social-queue" },
  { id: "sq2", title: "Pinterest — Sunroom journal aesthetic", meta: "Draft", lane: "social-queue" },
  { id: "cw1", title: "Estate menu simplification", meta: "Shipped", lane: "completed" },
  { id: "cw2", title: "Clear My Mind sunroom restore", meta: "Shipped", lane: "completed" },
];

export const SAMPLE_GENERIC_ROOM_CARDS: readonly FounderRoomCard[] = [
  {
    id: "sample-1",
    title: "Sample insight",
    summary: "Placeholder card — real intelligence connects here later.",
    tone: "insight",
  },
  {
    id: "sample-2",
    title: "Sample opportunity",
    summary: "One concise opportunity per card — never a wall of data.",
    tone: "opportunity",
  },
  {
    id: "sample-3",
    title: "Sample next step",
    summary: "What would help Shari move forward today?",
    tone: "quick-win",
  },
];

export function creationToRoomCards(
  items: readonly FounderCreationOpportunity[],
): FounderRoomCard[] {
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    summary: item.summary,
    tone: item.tone,
  }));
}

export function automationToRoomCards(
  items: readonly FounderAutomationOpportunity[],
): FounderRoomCard[] {
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    summary: item.summary,
    tone: item.tone,
  }));
}

export function reportsToRoomCards(
  items: readonly FounderReport[],
): FounderRoomCard[] {
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    summary: item.summary,
    tone: item.tone,
  }));
}
