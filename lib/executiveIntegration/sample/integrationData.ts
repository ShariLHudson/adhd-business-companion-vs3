import type {
  ExecutiveIntegration,
  IntegrationGroup,
  IntegrationSearchResult,
} from "../types";
import { GHL_CAPABILITIES, POSTCRAFT_CAPABILITIES } from "../integrationConnection";

export const INTEGRATION_CENTER_PRINCIPLE =
  "Founder orchestrates. Other applications are connected departments — not separate worlds.";

export const ONE_OFFICE_MESSAGE =
  "What you need today — organized around running your company, not opening applications.";

function integration(
  partial: Omit<ExecutiveIntegration, "capabilities"> & {
    capabilities?: ExecutiveIntegration["capabilities"];
  },
): ExecutiveIntegration {
  return {
    ...partial,
    capabilities: partial.capabilities ?? [],
  };
}

const COMMUNICATION: ExecutiveIntegration[] = [
  integration({
    id: "google-mail",
    name: "Google Mail",
    groupId: "communication",
    tagline: "Visual Spark Studios email",
    status: "connected",
    lastConnectedAt: "2026-07-06T08:12:00Z",
    lastActivityAt: "2026-07-06T11:40:00Z",
    lastActivitySummary: "Workshop inquiry from member — flagged important",
    highlights: [
      { id: "gm-unread", label: "Unread", value: "3 important" },
      { id: "gm-recent", label: "Recent", value: "Listening Rooms waitlist reply" },
    ],
    quickActions: [
      { id: "gm-compose", kind: "compose", label: "Compose" },
      { id: "gm-open", kind: "open", label: "Open Gmail" },
    ],
    openUrl: "https://mail.google.com",
    orchestrationNote: "Founder surfaces what matters — you decide when to open Gmail.",
  }),
  integration({
    id: "google-calendar",
    name: "Google Calendar",
    groupId: "communication",
    tagline: "Today's schedule and availability",
    status: "connected",
    lastConnectedAt: "2026-07-06T07:00:00Z",
    lastActivityAt: "2026-07-06T12:00:00Z",
    lastActivitySummary: "Focus block 2–4pm · Team sync tomorrow 10am",
    highlights: [
      { id: "gc-today", label: "Today", value: "2 events · focus block protected" },
      { id: "gc-avail", label: "Availability", value: "Open after 4pm" },
    ],
    quickActions: [
      { id: "gc-meeting", kind: "compose", label: "Create meeting" },
      { id: "gc-open", kind: "open", label: "Open Calendar" },
    ],
    openUrl: "https://calendar.google.com",
    orchestrationNote: "Founder protects focus time — calendar opens only when you choose.",
  }),
  integration({
    id: "google-drive",
    name: "Google Drive",
    groupId: "communication",
    tagline: "Mission documents, research, strategy",
    status: "connected",
    lastConnectedAt: "2026-07-05T18:00:00Z",
    lastActivityAt: "2026-07-06T09:15:00Z",
    lastActivitySummary: "Restart Research Brief updated",
    highlights: [
      { id: "gd-recent", label: "Recent", value: "Listening Rooms strategy doc" },
      { id: "gd-mission", label: "Mission docs", value: "listening-rooms folder" },
    ],
    quickActions: [
      { id: "gd-review", kind: "review", label: "Review strategy doc" },
      { id: "gd-open", kind: "open", label: "Open Drive" },
    ],
    openUrl: "https://drive.google.com",
    orchestrationNote: "Research and strategy stay linked to missions in Founder.",
  }),
];

const DEVELOPMENT: ExecutiveIntegration[] = [
  integration({
    id: "founder-studio",
    name: "Founder Studio™",
    groupId: "development",
    tagline: "Executive Headquarters",
    status: "connected",
    lastActivityAt: "2026-07-06T12:30:00Z",
    lastActivitySummary: "Sprint 8 Discovery Engine · Integration Center in progress",
    highlights: [
      { id: "fs-status", label: "Status", value: "Active — you are here" },
      { id: "fs-mission", label: "Current Mission", value: "Listening Rooms restart" },
    ],
    quickActions: [
      { id: "fs-continue", kind: "continue", label: "Continue mission" },
      { id: "fs-open", kind: "open", label: "Open Office" },
    ],
    orchestrationNote: "Founder decides. Everything else connects here.",
  }),
  integration({
    id: "github",
    name: "GitHub",
    groupId: "development",
    tagline: "Repository and milestones",
    status: "connected",
    lastConnectedAt: "2026-07-06T06:00:00Z",
    lastActivityAt: "2026-07-06T11:55:00Z",
    lastActivitySummary: "Executive Discovery Engine pushed to main",
    highlights: [
      { id: "gh-milestone", label: "Milestone", value: "Founder Studio executive stack" },
      { id: "gh-issues", label: "Open issues", value: "2 review · 0 blocking" },
      { id: "gh-commits", label: "Recent commits", value: "Sprint 7 Relationship Intelligence" },
    ],
    quickActions: [
      { id: "gh-review", kind: "review", label: "Review commits" },
      { id: "gh-open", kind: "open", label: "Open GitHub" },
    ],
    openUrl: "https://github.com",
    orchestrationNote: "Code ships from Founder missions — GitHub stores the truth.",
  }),
  integration({
    id: "cursor",
    name: "Cursor",
    groupId: "development",
    tagline: "Development implementation",
    status: "connected",
    lastActivityAt: "2026-07-06T12:45:00Z",
    lastActivitySummary: "Implementation Sprint 1 — Integration Center",
    highlights: [
      { id: "cu-prompt", label: "Current prompt", value: "Executive Integration Center™" },
      { id: "cu-impl", label: "Implementation", value: "Founder Studio bridge layer" },
    ],
    quickActions: [
      { id: "cu-resume", kind: "resume", label: "Resume development" },
      { id: "cu-open", kind: "open", label: "Open Cursor" },
    ],
    orchestrationNote: "Cursor builds what Founder approves — never the other way around.",
  }),
];

const MARKETING: ExecutiveIntegration[] = [
  integration({
    id: "postcraft",
    name: "PostCraft™",
    groupId: "marketing",
    tagline: "Founder decides · PostCraft creates",
    status: "needs-configuration",
    lastActivitySummary: "Connect ecosystem signals to send content and import analytics",
    capabilities: [...POSTCRAFT_CAPABILITIES],
    highlights: [
      { id: "pc-queue", label: "Content queue", value: "Awaiting connection" },
      { id: "pc-campaigns", label: "Campaign queue", value: "Draft when connected" },
    ],
    quickActions: [
      { id: "pc-open", kind: "open", label: "Open PostCraft" },
      { id: "pc-send", kind: "prepare", label: "Send content to PostCraft" },
      { id: "pc-analytics", kind: "review", label: "Import PostCraft analytics" },
    ],
    openUrl: "/ecosystem/dashboard",
    orchestrationNote: "PostCraft creates — Founder coordinates messaging with research. Nothing publishes without you.",
  }),
  integration({
    id: "gohighlevel",
    name: "GoHighLevel™",
    groupId: "marketing",
    tagline: "Founder decides · GHL delivers",
    status: "needs-configuration",
    lastActivitySummary: "Connect GHL API and location to prepare funnels and import results",
    capabilities: [...GHL_CAPABILITIES],
    highlights: [
      { id: "ghl-crm", label: "CRM", value: "Connect to activate" },
      { id: "ghl-funnels", label: "Funnels", value: "Prepare after connection" },
    ],
    quickActions: [
      { id: "ghl-open", kind: "open", label: "Open GHL" },
      { id: "ghl-funnel", kind: "prepare", label: "Prepare funnel" },
      { id: "ghl-email", kind: "prepare", label: "Prepare email workflow" },
      { id: "ghl-results", kind: "review", label: "Import campaign results" },
    ],
    openUrl: "/ghl/dashboard",
    orchestrationNote: "Nothing launches from GHL until Founder approves.",
  }),
];

const SOCIAL: ExecutiveIntegration[] = [
  integration({
    id: "linkedin",
    name: "LinkedIn",
    groupId: "social-media",
    tagline: "Professional presence",
    status: "connected",
    lastActivityAt: "2026-07-05T16:00:00Z",
    highlights: [
      { id: "li-activity", label: "Recent activity", value: "Founder journey post · 42 reactions" },
      { id: "li-scheduled", label: "Scheduled", value: "Workshop announcement — draft" },
    ],
    quickActions: [
      { id: "li-create", kind: "prepare", label: "Create content" },
      { id: "li-open", kind: "open", label: "Open LinkedIn" },
    ],
    openUrl: "https://linkedin.com",
    orchestrationNote: "PostCraft drafts can feed LinkedIn — Founder coordinates timing.",
  }),
  integration({
    id: "instagram",
    name: "Instagram",
    groupId: "social-media",
    tagline: "Visual Spark community",
    status: "connected",
    lastActivityAt: "2026-07-04T12:00:00Z",
    highlights: [
      { id: "ig-activity", label: "Recent activity", value: "Estate aesthetic reel" },
      { id: "ig-scheduled", label: "Scheduled", value: "None this week" },
    ],
    quickActions: [
      { id: "ig-open", kind: "open", label: "Open Instagram" },
    ],
    orchestrationNote: "Visual content aligns with PostCraft campaigns.",
  }),
  integration({
    id: "facebook",
    name: "Facebook",
    groupId: "social-media",
    tagline: "Community and groups",
    status: "connected",
    lastActivityAt: "2026-07-03T09:00:00Z",
    highlights: [
      { id: "fb-activity", label: "Recent activity", value: "Listening Rooms interest thread" },
      { id: "fb-scheduled", label: "Scheduled", value: "1 workshop reminder" },
    ],
    quickActions: [
      { id: "fb-open", kind: "open", label: "Open Facebook" },
    ],
    orchestrationNote: "Community questions feed Discovery Engine overnight.",
  }),
  integration({
    id: "pinterest",
    name: "Pinterest",
    groupId: "social-media",
    tagline: "Visual discovery",
    status: "future",
    highlights: [{ id: "pin-future", label: "Status", value: "Planned connection" }],
    quickActions: [],
    orchestrationNote: "Future — research pins will link to Opportunity Discovery.",
  }),
  integration({
    id: "youtube",
    name: "YouTube",
    groupId: "social-media",
    tagline: "Long-form content",
    status: "future",
    highlights: [{ id: "yt-future", label: "Status", value: "Planned connection" }],
    quickActions: [],
    orchestrationNote: "Future — workshop replays and estate tours.",
  }),
];

const AI: ExecutiveIntegration[] = [
  integration({
    id: "chatgpt-command-center",
    name: "ChatGPT Command Center",
    groupId: "ai",
    tagline: "Research · images · prompt development",
    status: "connected",
    lastActivityAt: "2026-07-06T08:30:00Z",
    highlights: [
      { id: "gpt-research", label: "Research", value: "ADHD restart comparables" },
      { id: "gpt-prompts", label: "Prompt development", value: "Integration Center spec" },
    ],
    quickActions: [
      { id: "gpt-open", kind: "open", label: "Open Command Center GPT" },
      { id: "gpt-research", kind: "research", label: "Research" },
    ],
    orchestrationNote: "External AI assists — Founder owns decisions and memory.",
  }),
];

const OPERATIONS: ExecutiveIntegration[] = [
  integration({
    id: "team-hub",
    name: "Team Hub™",
    groupId: "operations",
    tagline: "Founder thinks · Team Hub executes",
    status: "connected",
    lastActivityAt: "2026-07-06T09:00:00Z",
    highlights: [
      { id: "th-waiting", label: "Waiting on Shari", value: "2 approvals" },
      { id: "th-active", label: "Active projects", value: "Workshop launch packet" },
    ],
    quickActions: [
      { id: "th-review", kind: "review", label: "Review approvals" },
      { id: "th-open", kind: "open", label: "Open Team Hub" },
    ],
    orchestrationNote: "Execution stays in Team Hub — strategy stays in Founder.",
  }),
];

const BUSINESS: ExecutiveIntegration[] = [
  integration({
    id: "companion",
    name: "Spark Companion™",
    groupId: "business",
    tagline: "Members experience Spark here",
    status: "connected",
    lastActivityAt: "2026-07-06T11:00:00Z",
    highlights: [
      { id: "sc-status", label: "Status", value: "Estate conversation active" },
      { id: "sc-signals", label: "Member signals", value: "Return guilt theme rising" },
    ],
    quickActions: [
      { id: "sc-review", kind: "review", label: "Review member signals" },
      { id: "sc-open", kind: "open", label: "Open Companion" },
    ],
    orchestrationNote: "Companion serves members — Founder reads signals, never surveils.",
  }),
];

const PRODUCTIVITY: ExecutiveIntegration[] = [
  integration({
    id: "google-workspace",
    name: "Google Workspace",
    groupId: "productivity",
    tagline: "Mail · Calendar · Drive unified",
    status: "connected",
    highlights: [
      { id: "gw-status", label: "Status", value: "3 communication tools linked" },
    ],
    quickActions: [
      { id: "gw-open", kind: "open", label: "Open Workspace" },
    ],
    orchestrationNote: "One communication layer — not three separate apps in your head.",
  }),
];

const RESEARCH: ExecutiveIntegration[] = [
  integration({
    id: "executive-research-center",
    name: "Executive Research Center™",
    groupId: "research",
    tagline: "Your private research department",
    status: "connected",
    lastActivityAt: "2026-07-05T20:00:00Z",
    highlights: [
      { id: "erc-recent", label: "Recent", value: "ADHD Restart Rituals report" },
      { id: "erc-queue", label: "Queue", value: "Pricing benchmarks brief" },
    ],
    quickActions: [
      { id: "erc-research", kind: "research", label: "Start research brief" },
      { id: "erc-open", kind: "open", label: "Open Research Center" },
    ],
    orchestrationNote: "Research answers what Shari needs to know — Discovery finds what nobody asked.",
  }),
];

export const INTEGRATION_GROUPS: IntegrationGroup[] = [
  { id: "communication", label: "Communication", purpose: "Mail, calendar, documents — what the company said and scheduled.", integrations: COMMUNICATION },
  { id: "development", label: "Development", purpose: "Founder Studio, GitHub, Cursor — what we are building.", integrations: DEVELOPMENT },
  { id: "marketing", label: "Marketing", purpose: "PostCraft creates · GoHighLevel delivers.", integrations: MARKETING },
  { id: "operations", label: "Operations", purpose: "Team Hub and execution lanes.", integrations: OPERATIONS },
  { id: "business", label: "Business", purpose: "Companion and member-facing products.", integrations: BUSINESS },
  { id: "ai", label: "AI Tools", purpose: "Command Center GPT and future assistants.", integrations: AI },
  { id: "social-media", label: "Social Media", purpose: "LinkedIn, Instagram, Facebook — where the world meets Spark.", integrations: SOCIAL },
  { id: "productivity", label: "Productivity", purpose: "Workspace tools that support the office.", integrations: PRODUCTIVITY },
  { id: "research", label: "Research", purpose: "Executive Research and intelligence inputs.", integrations: RESEARCH },
];

export const SEARCH_INDEX: IntegrationSearchResult[] = [
  { id: "sr-listening", integrationId: "founder-studio", integrationName: "Founder Studio™", groupId: "development", title: "Listening Rooms mission", summary: "Current mission workspace and restart narrative", openUrl: "/companion/founder/executive-builder" },
  { id: "sr-email", integrationId: "google-mail", integrationName: "Google Mail", groupId: "communication", title: "Latest important email", summary: "Workshop inquiry — member waitlist", openUrl: "https://mail.google.com" },
  { id: "sr-roadmap", integrationId: "github", integrationName: "GitHub", groupId: "development", title: "Latest roadmap milestone", summary: "Founder Studio executive stack", openUrl: "https://github.com" },
  { id: "sr-postcraft", integrationId: "postcraft", integrationName: "PostCraft™", groupId: "marketing", title: "Latest PostCraft campaign", summary: "Gentle Restart campaign — awaiting visual" },
  { id: "sr-ghl", integrationId: "gohighlevel", integrationName: "GoHighLevel™", groupId: "marketing", title: "Latest GHL workflow", summary: "Workshop funnel automation draft" },
  { id: "sr-cursor", integrationId: "cursor", integrationName: "Cursor", groupId: "development", title: "Current Cursor prompt", summary: "Executive Integration Center™ implementation" },
  { id: "sr-linkedin", integrationId: "linkedin", integrationName: "LinkedIn", groupId: "social-media", title: "LinkedIn draft", summary: "Workshop announcement — scheduled draft" },
  { id: "sr-drive", integrationId: "google-drive", integrationName: "Google Drive", groupId: "communication", title: "Listening Rooms strategy doc", summary: "Mission document — updated today", openUrl: "https://drive.google.com" },
  { id: "sr-research", integrationId: "executive-research-center", integrationName: "Executive Research Center™", groupId: "research", title: "ADHD Restart research", summary: "Latest completed research report", openUrl: "/companion/founder/executive-research" },
  { id: "sr-discovery", integrationId: "founder-studio", integrationName: "Founder Studio™", groupId: "development", title: "Today's Discovery Brief", summary: "Overnight findings — unified restart narrative", openUrl: "/companion/founder/executive-discovery-engine" },
];

export function getIntegration(id: string): ExecutiveIntegration | undefined {
  for (const group of INTEGRATION_GROUPS) {
    const found = group.integrations.find((i) => i.id === id);
    if (found) return found;
  }
  return undefined;
}
