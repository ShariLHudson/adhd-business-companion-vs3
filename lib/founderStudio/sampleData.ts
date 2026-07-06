import type {
  FounderGlanceSection,
  FounderPriority,
  FounderRoomCard,
  FounderSignal,
  FounderTrend,
  TeamHubSection,
} from "./types";

export const FOUNDER_HOME_GLANCE: readonly FounderGlanceSection[] = [
  {
    id: "critical",
    title: "Critical",
    items: [
      {
        id: "c1",
        label: "Critical",
        tone: "critical",
        summary: "Ocean Conservatory living scene — validate on mobile after flicker tuning.",
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
        summary: "Member onboarding video — short welcome, not a product tour.",
      },
      {
        id: "o2",
        label: "Opportunity",
        tone: "opportunity",
        summary: "ADHD planner bundle with Spark Card™ — test with 3 founders.",
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
        summary: "Pin Founder Studio route — private, no member nav exposure.",
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
        summary: "FIRE morning briefing template — placeholder cards first.",
      },
      {
        id: "d2",
        label: "On Deck",
        tone: "on-deck",
        summary: "Team Hub™ Izna marketing lane — limited access only.",
      },
    ],
  },
];

export const FOUNDER_BEST_IDEA = {
  title: "Today's Best Idea",
  summary:
    "Ship Founder Studio shell first — layout, guard, sample intelligence. Wire real SPARK™ / FLAME™ / FIRE™ after the structure feels right.",
  tone: "insight" as const,
};

export const FOUNDER_CURSOR_PRIORITIES: readonly FounderPriority[] = [
  {
    id: "p1",
    title: "Founder Studio routes + access guard",
    note: "No member exposure",
  },
  {
    id: "p2",
    title: "Team Hub placeholder with execution lanes",
    note: "Izna lane separate from strategy",
  },
  {
    id: "p3",
    title: "Sample data file → future intelligence hooks",
    note: "Single swap point",
  },
];

export const FOUNDER_CUSTOMER_PULSE: readonly FounderSignal[] = [
  {
    id: "s1",
    label: "Overwhelm on return",
    detail: "Members want calm re-entry — not task lists.",
  },
  {
    id: "s2",
    label: "Conversation quality",
    detail: "Spark Alpha tests trending positive vs generic chat.",
  },
  {
    id: "s3",
    label: "Estate discovery",
    detail: "Wander menu used — conservatory curiosity high.",
  },
];

export const FOUNDER_TREND_RADAR: readonly FounderTrend[] = [
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
];

export const FOUNDER_REVENUE_OPPORTUNITY = {
  title: "Revenue Opportunity",
  summary:
    "Premium Estate cohort — 12 founders, conversation-first onboarding, quarterly live with Shari.",
  tone: "revenue" as const,
};

export const FOUNDER_IGNORE_TODAY: readonly string[] = [
  "Full analytics dashboard — not this sprint",
  "Member-facing Founder features — never",
  "Rewriting conversation architecture — frozen",
];

export const CREATION_STUDIO_CARDS: readonly FounderRoomCard[] = [
  {
    id: "workshop",
    title: "Workshop",
    summary: "ADHD Business Clarity — 90-minute live outline",
    tone: "on-deck",
  },
  {
    id: "webinar",
    title: "Webinar",
    summary: "Spark Estate walkthrough — conversation-first onboarding",
    tone: "opportunity",
  },
  {
    id: "course",
    title: "Course",
    summary: "Momentum Builder module — draft lesson arc",
    tone: "on-deck",
  },
  {
    id: "newsletter",
    title: "Newsletter",
    summary: "Thursday note — one story, one invitation",
    tone: "quick-win",
  },
  {
    id: "linkedin",
    title: "LinkedIn post",
    summary: "Founder Studio behind the scenes — photo + 3 lines",
    tone: "opportunity",
  },
  {
    id: "pinterest",
    title: "Pinterest pin",
    summary: "Sunroom journal aesthetic — calm estate imagery",
    tone: "quick-win",
  },
  {
    id: "email-sequence",
    title: "Email sequence",
    summary: "Welcome series — three gentle touches, no pressure",
    tone: "on-deck",
  },
  {
    id: "lead-magnet",
    title: "Lead magnet",
    summary: "Clear My Mind™ printable — gentle capture",
    tone: "insight",
  },
  {
    id: "campaign",
    title: "Content campaign",
    summary: "Spring clarity campaign — estate + conversation theme",
    tone: "revenue",
  },
];

export const AUTOMATION_STUDIO_CARDS: readonly FounderRoomCard[] = [
  {
    id: "fire-brief",
    title: "FIRE morning PDF",
    summary: "Auto-compile glance cards → Drive archive",
    tone: "on-deck",
  },
  {
    id: "research",
    title: "Research automation",
    summary: "Queue topic scans → Knowledge Library drafts",
    tone: "insight",
  },
  {
    id: "analytics",
    title: "Analytics digest",
    summary: "Weekly member signals → Customer Pulse summary",
    tone: "on-deck",
  },
  {
    id: "social-queue",
    title: "Social media queue",
    summary: "Draft → approve → schedule handoff for Izna",
    tone: "opportunity",
  },
  {
    id: "reporting",
    title: "Reporting",
    summary: "FIRE trend radar → one-page founder briefing",
    tone: "quick-win",
  },
  {
    id: "drive-pdf",
    title: "Google Drive PDFs",
    summary: "Archive completed briefings with dated folders",
    tone: "on-deck",
  },
  {
    id: "content-prep",
    title: "Content creation prep",
    summary: "Creation Studio cards → Cursor build packages",
    tone: "opportunity",
  },
  {
    id: "team-assign",
    title: "Team assignments",
    summary: "Spark Command priorities → Team Hub lanes",
    tone: "quick-win",
  },
  {
    id: "cursor-prompts",
    title: "Cursor prompts",
    summary: "Package acceptance checks with each priority",
    tone: "quick-win",
  },
  {
    id: "follow-up",
    title: "Follow-up tasks",
    summary: "Waiting-on reminders — Shari, Izna, Cursor",
    tone: "on-deck",
  },
];

export const KNOWLEDGE_LIBRARY_CARDS: readonly FounderRoomCard[] = [
  {
    id: "fire-archive",
    title: "FIRE Reports",
    summary: "Daily briefings archive — placeholder shelf",
    tone: "insight",
  },
  {
    id: "research",
    title: "Research saves",
    summary: "Articles, links, and source notes",
    tone: "on-deck",
  },
  {
    id: "decisions",
    title: "Decision history",
    summary: "What we chose and why — pattern memory",
    tone: "insight",
  },
];

export const TEAM_HUB_SECTIONS: readonly TeamHubSection[] = [
  {
    id: "active-projects",
    title: "Active Projects",
    items: [
      { id: "ap1", title: "Founder Studio™ shell", meta: "Cursor · In progress" },
      { id: "ap2", title: "Ocean Conservatory polish", meta: "Cursor · Review" },
    ],
  },
  {
    id: "my-tasks",
    title: "My Tasks",
    items: [
      { id: "mt1", title: "Record welcome voice take 2", meta: "Shari" },
      { id: "mt2", title: "Approve March newsletter theme", meta: "Shari" },
    ],
  },
  {
    id: "waiting-shari",
    title: "Waiting for Shari",
    items: [
      { id: "ws1", title: "Brand photo selects", meta: "Izna · Needs approval" },
    ],
  },
  {
    id: "waiting-izna",
    title: "Waiting on Izna",
    items: [
      { id: "wi1", title: "Pinterest pin batch — Week 12", meta: "Due Friday" },
      { id: "wi2", title: "Instagram carousel copy", meta: "Draft ready" },
    ],
  },
  {
    id: "waiting-cursor",
    title: "Waiting on Cursor",
    items: [
      { id: "wc1", title: "Founder access guard tests", meta: "Queued" },
    ],
  },
  {
    id: "approvals",
    title: "Approvals",
    items: [
      { id: "a1", title: "Social post — Estate warmth quote", meta: "Approve / Edit" },
    ],
  },
  {
    id: "assets",
    title: "Assets",
    items: [
      { id: "as1", title: "Founder office background.png", meta: "Brand folder" },
      { id: "as2", title: "Spark logo suite — gold on teal", meta: "Drive" },
    ],
  },
  {
    id: "social-queue",
    title: "Social Media Queue",
    items: [
      { id: "sq1", title: "LinkedIn — conversation is the product", meta: "Scheduled Tue" },
      { id: "sq2", title: "Pinterest — Sunroom journal aesthetic", meta: "Draft" },
    ],
  },
  {
    id: "completed",
    title: "Completed This Week",
    items: [
      { id: "cw1", title: "Estate menu simplification", meta: "Shipped" },
      { id: "cw2", title: "Clear My Mind sunroom restore", meta: "Shipped" },
    ],
  },
];

export function sampleRoomCards(roomId: string): FounderRoomCard[] {
  switch (roomId) {
    case "creation-studio":
      return [...CREATION_STUDIO_CARDS];
    case "automation-studio":
      return [...AUTOMATION_STUDIO_CARDS];
    case "knowledge-library":
      return [...KNOWLEDGE_LIBRARY_CARDS];
    default:
      return [
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
  }
}
