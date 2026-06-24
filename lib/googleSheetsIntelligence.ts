/**
 * P0.18 — Google Sheets Creation Intelligence™
 * Detect spreadsheet-worthy requests, collect minimum info, offer creation.
 */

import { rowsToCsv } from "./googleSheetContent";

export type GoogleSheetTypeId =
  | "content_calendar"
  | "lead_follow_up"
  | "sales_funnel_tracker"
  | "launch_checklist"
  | "product_comparison"
  | "pricing_comparison"
  | "client_avatar_comparison"
  | "affiliate_tracker"
  | "sop_task_tracker"
  | "property_pricing"
  | "saved_ideas"
  | "weekly_business_dashboard";

export type SheetIntakePhase = "collecting" | "offered" | "created";

export type GoogleSheetIntakeSession = {
  sheetType: GoogleSheetTypeId;
  phase: SheetIntakePhase;
  answers: Record<string, string>;
  questionIndex: number;
  offeredAtTurn?: number;
  originalPrompt: string;
  projectId?: string;
};

export type GoogleSheetTemplate = {
  id: GoogleSheetTypeId;
  label: string;
  artifactType: string;
  columns: string[];
  matchPatterns: RegExp[];
  questions: { key: string; prompt: string }[];
};

export type GoogleSheetPendingPayload = {
  sheetType: GoogleSheetTypeId;
  title: string;
  csv: string;
  columns: string[];
  artifactType: string;
};

export type GoogleSheetsTurnResolution =
  | { outcome: "none" }
  | {
      outcome: "ask";
      reply: string;
      session: GoogleSheetIntakeSession;
    }
  | {
      outcome: "offer";
      reply: string;
      session: GoogleSheetIntakeSession;
      pending: GoogleSheetPendingPayload;
    }
  | {
      outcome: "create";
      session: GoogleSheetIntakeSession;
      pending: GoogleSheetPendingPayload;
    };

const DOCUMENT_EXCLUDE_RE =
  /\b(?:write|draft|compose|create|help me (?:write|draft))\s+(?:an?\s+)?(?:email|blog(?:\s+post)?|book|article|newsletter|letter|e-?book)\b/i;

const SIMPLE_EMAIL_RE = /\bi need to write an email\b/i;

export const GOOGLE_SHEET_TEMPLATES: GoogleSheetTemplate[] = [
  {
    id: "content_calendar",
    label: "Content Calendar",
    artifactType: "Content Calendar",
    columns: [
      "Date",
      "Platform",
      "Topic",
      "Content Type",
      "Hook",
      "Caption",
      "CTA",
      "Status",
      "URL",
      "Notes",
    ],
    matchPatterns: [
      /\bcontent calendar\b/i,
      /\bsocial (?:media )?calendar\b/i,
      /\bposting calendar\b/i,
    ],
    questions: [
      {
        key: "platforms",
        prompt: "Let's build it. What platform are you posting on first?",
      },
      {
        key: "postCount",
        prompt: "How many posts do you want to plan?",
      },
    ],
  },
  {
    id: "lead_follow_up",
    label: "Lead Follow-Up Tracker",
    artifactType: "Lead Tracker",
    columns: [
      "Name",
      "Email",
      "Source",
      "Last Contact",
      "Follow-Up Date",
      "Interest Level",
      "Next Step",
      "Notes",
    ],
    matchPatterns: [
      /\blead(?:\s+|-)?(?:tracker|list|follow[- ]?up)\b/i,
      /\btrack leads?\b/i,
      /\bfollow[- ]?up tracker\b/i,
    ],
    questions: [
      {
        key: "offer",
        prompt: "What offer or service are these leads for?",
      },
    ],
  },
  {
    id: "sales_funnel_tracker",
    label: "Sales Funnel Tracker",
    artifactType: "Sales Funnel Tracker",
    columns: [
      "Stage",
      "Asset",
      "Purpose",
      "Message",
      "CTA",
      "Status",
      "URL",
      "Notes",
    ],
    matchPatterns: [
      /\bsales funnel tracker\b/i,
      /\bfunnel tracker\b/i,
      /\btrack(?:ing)? (?:my )?funnel\b/i,
    ],
    questions: [
      {
        key: "funnelName",
        prompt: "What funnel or offer is this tracking?",
      },
    ],
  },
  {
    id: "launch_checklist",
    label: "Launch Checklist",
    artifactType: "Launch Checklist",
    columns: [
      "Task",
      "Category",
      "Priority",
      "Due Date",
      "Status",
      "Owner",
      "Notes",
    ],
    matchPatterns: [
      /\blaunch checklist\b/i,
      /\blaunch tracker\b/i,
      /\bchecklist for (?:my )?launch\b/i,
    ],
    questions: [
      {
        key: "launchName",
        prompt: "What are you launching?",
      },
    ],
  },
  {
    id: "product_comparison",
    label: "Product Comparison",
    artifactType: "Product Comparison",
    columns: [
      "Option",
      "Price",
      "Features",
      "Pros",
      "Cons",
      "Best For",
      "Notes",
    ],
    matchPatterns: [
      /\bproduct comparison\b/i,
      /\bcompare products\b/i,
      /\bcomparison chart\b/i,
    ],
    questions: [
      {
        key: "products",
        prompt: "What products or options are you comparing?",
      },
    ],
  },
  {
    id: "pricing_comparison",
    label: "Pricing Comparison",
    artifactType: "Pricing Comparison",
    columns: [
      "Option",
      "Price",
      "Includes",
      "Target Buyer",
      "Margin",
      "Notes",
    ],
    matchPatterns: [
      /\bpricing comparison\b/i,
      /\bcompare pricing\b/i,
      /\bpricing sheet\b/i,
    ],
    questions: [
      {
        key: "subject",
        prompt: "What are you pricing or comparing?",
      },
    ],
  },
  {
    id: "client_avatar_comparison",
    label: "Client Avatar Comparison",
    artifactType: "Client Avatar Comparison",
    columns: [
      "Segment",
      "Pain Point",
      "Goal",
      "Offer Fit",
      "Channel",
      "Notes",
    ],
    matchPatterns: [
      /\bclient avatar comparison\b/i,
      /\bcompare (?:client )?avatars?\b/i,
      /\bavatar comparison\b/i,
    ],
    questions: [
      {
        key: "segments",
        prompt: "How many audience segments or avatars are you comparing?",
      },
    ],
  },
  {
    id: "affiliate_tracker",
    label: "Affiliate Tracker",
    artifactType: "Affiliate Tracker",
    columns: [
      "Partner",
      "Program",
      "Link",
      "Commission",
      "Clicks",
      "Conversions",
      "Payout",
      "Notes",
    ],
    matchPatterns: [
      /\baffiliate tracker\b/i,
      /\btrack affiliates?\b/i,
      /\baffiliate (?:program|sheet)\b/i,
    ],
    questions: [
      {
        key: "program",
        prompt: "What affiliate program or partners are you tracking?",
      },
    ],
  },
  {
    id: "sop_task_tracker",
    label: "SOP Task Tracker",
    artifactType: "SOP Task Tracker",
    columns: [
      "Step",
      "Task",
      "Owner",
      "Due Date",
      "Status",
      "Notes",
    ],
    matchPatterns: [
      /\bsop tracker\b/i,
      /\btask tracker\b/i,
      /\bprocess tracker\b/i,
    ],
    questions: [
      {
        key: "process",
        prompt: "What process or SOP is this tracking?",
      },
    ],
  },
  {
    id: "property_pricing",
    label: "Property / Unit Pricing Sheet",
    artifactType: "Property Pricing Sheet",
    columns: [
      "Property",
      "Unit",
      "Bedrooms",
      "Bathrooms",
      "Rent",
      "Deposit",
      "Status",
      "Notes",
    ],
    matchPatterns: [
      /\bproperty (?:pricing )?sheet\b/i,
      /\bunit pricing\b/i,
      /\brental tracker\b/i,
    ],
    questions: [
      {
        key: "portfolio",
        prompt: "How many properties or units should we plan rows for?",
      },
    ],
  },
  {
    id: "saved_ideas",
    label: "Saved Ideas Database",
    artifactType: "Ideas Database",
    columns: [
      "Idea",
      "Category",
      "Source",
      "Priority",
      "Status",
      "Next Step",
      "Notes",
    ],
    matchPatterns: [
      /\bideas? (?:database|tracker|sheet)\b/i,
      /\bsave(?:d)? ideas\b/i,
    ],
    questions: [
      {
        key: "focus",
        prompt: "What kind of ideas are you collecting?",
      },
    ],
  },
  {
    id: "weekly_business_dashboard",
    label: "Weekly Business Dashboard",
    artifactType: "Weekly Dashboard",
    columns: [
      "Metric",
      "This Week",
      "Last Week",
      "Goal",
      "Trend",
      "Notes",
    ],
    matchPatterns: [
      /\bweekly (?:business )?dashboard\b/i,
      /\bbusiness dashboard\b/i,
      /\bweekly metrics\b/i,
    ],
    questions: [
      {
        key: "metrics",
        prompt: "What metrics matter most this week?",
      },
    ],
  },
];

const GENERIC_SHEET_RE =
  /\b(?:spreadsheet|google sheet|make this (?:into )?a (?:spreadsheet|sheet)|save this as a google sheet|turn this into a (?:spreadsheet|sheet))\b/i;

const GENERIC_TRACKER_RE =
  /\b(?:create|build|make|help me (?:create|build|make))\s+(?:a |an |my )?tracker\b/i;

const GENERIC_CALENDAR_RE = /\b(?:create|build|make)\s+(?:a |an |my )?calendar\b/i;

export function getGoogleSheetTemplate(
  id: GoogleSheetTypeId,
): GoogleSheetTemplate {
  const found = GOOGLE_SHEET_TEMPLATES.find((t) => t.id === id);
  if (!found) throw new Error(`Unknown sheet type: ${id}`);
  return found;
}

export function templateColumns(id: GoogleSheetTypeId): string[] {
  return [...getGoogleSheetTemplate(id).columns];
}

export function shouldExcludeSheetOffer(text: string): boolean {
  const t = text.trim();
  if (!t) return true;
  if (DOCUMENT_EXCLUDE_RE.test(t)) return true;
  if (SIMPLE_EMAIL_RE.test(t)) return true;
  return false;
}

export function detectSheetIntent(text: string): GoogleSheetTypeId | null {
  const t = text.trim();
  if (!t || shouldExcludeSheetOffer(t)) return null;

  if (/\bproperty (?:pricing )?sheet\b/i.test(t)) {
    return "property_pricing";
  }

  for (const template of GOOGLE_SHEET_TEMPLATES) {
    if (template.matchPatterns.some((re) => re.test(t))) {
      return template.id;
    }
  }

  if (GENERIC_CALENDAR_RE.test(t)) return "content_calendar";
  if (/\bsales tracker\b/i.test(t)) return "sales_funnel_tracker";
  if (GENERIC_TRACKER_RE.test(t)) return "lead_follow_up";
  if (GENERIC_SHEET_RE.test(t)) return "saved_ideas";

  const ROUTING_RE =
    /\b(?:tracker|spreadsheet|google sheet|calendar|lead list|comparison chart|launch checklist|pricing sheet|property sheet|sales tracker)\b/i;
  if (!ROUTING_RE.test(t)) return null;

  if (/\bcontent calendar\b/i.test(t)) return "content_calendar";
  if (/\blead\b/i.test(t)) return "lead_follow_up";
  if (/\bfunnel\b/i.test(t)) return "sales_funnel_tracker";
  if (/\blaunch\b/i.test(t)) return "launch_checklist";
  if (/\bcomparison\b/i.test(t)) return "product_comparison";
  if (/\bpricing\b/i.test(t)) return "pricing_comparison";
  if (/\bproperty\b/i.test(t)) return "property_pricing";
  if (/\baffiliate\b/i.test(t)) return "affiliate_tracker";
  if (/\bsop\b/i.test(t)) return "sop_task_tracker";
  if (/\bweekly\b/i.test(t)) return "weekly_business_dashboard";
  if (/\btracker\b/i.test(t)) return "lead_follow_up";

  return null;
}

export function isGoogleSheetWorthyRequest(text: string): boolean {
  return detectSheetIntent(text) !== null;
}

function parsePositiveInt(text: string, fallback: number): number {
  const m = text.match(/\d+/);
  if (!m) return fallback;
  const n = parseInt(m[0], 10);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(n, 100);
}

function starterRowCount(session: GoogleSheetIntakeSession): number {
  const template = getGoogleSheetTemplate(session.sheetType);
  switch (session.sheetType) {
    case "content_calendar":
      return parsePositiveInt(session.answers.postCount ?? "10", 10);
    case "property_pricing":
      return parsePositiveInt(session.answers.portfolio ?? "5", 5);
    case "client_avatar_comparison":
      return parsePositiveInt(session.answers.segments ?? "3", 3);
    case "product_comparison": {
      const parts = (session.answers.products ?? "")
        .split(/,| and /i)
        .map((s) => s.trim())
        .filter(Boolean);
      return Math.max(parts.length, 3);
    }
    case "sales_funnel_tracker":
      return 6;
    case "launch_checklist":
      return 8;
    case "lead_follow_up":
    case "affiliate_tracker":
    case "sop_task_tracker":
    case "saved_ideas":
    case "weekly_business_dashboard":
    case "pricing_comparison":
      return 5;
    default:
      return 5;
  }
}

export function buildSheetTitle(session: GoogleSheetIntakeSession): string {
  const template = getGoogleSheetTemplate(session.sheetType);
  const a = session.answers;
  switch (session.sheetType) {
    case "content_calendar":
      return `Content Calendar — ${a.platforms?.trim() || "Posts"}`;
    case "lead_follow_up":
      return `Lead Tracker — ${a.offer?.trim() || "Leads"}`;
    case "sales_funnel_tracker":
      return `Funnel Tracker — ${a.funnelName?.trim() || "Sales Funnel"}`;
    case "launch_checklist":
      return `Launch Checklist — ${a.launchName?.trim() || "Launch"}`;
    case "product_comparison":
      return `Product Comparison — ${a.products?.trim() || "Options"}`;
    case "pricing_comparison":
      return `Pricing Comparison — ${a.subject?.trim() || "Pricing"}`;
    case "client_avatar_comparison":
      return "Client Avatar Comparison";
    case "affiliate_tracker":
      return `Affiliate Tracker — ${a.program?.trim() || "Partners"}`;
    case "sop_task_tracker":
      return `SOP Tracker — ${a.process?.trim() || "Process"}`;
    case "property_pricing":
      return "Property Pricing Sheet";
    case "saved_ideas":
      return `Ideas — ${a.focus?.trim() || "Saved Ideas"}`;
    case "weekly_business_dashboard":
      return "Weekly Business Dashboard";
    default:
      return template.label;
  }
}

function blankRow(columnCount: number): string[] {
  return Array.from({ length: columnCount }, () => "");
}

function buildStarterRows(session: GoogleSheetIntakeSession): string[][] {
  const template = getGoogleSheetTemplate(session.sheetType);
  const cols = template.columns;
  const count = starterRowCount(session);
  const rows: string[][] = [];

  for (let i = 0; i < count; i++) {
    const row = blankRow(cols.length);
    switch (session.sheetType) {
      case "content_calendar": {
        const platformIdx = cols.indexOf("Platform");
        const statusIdx = cols.indexOf("Status");
        if (platformIdx >= 0) {
          row[platformIdx] = session.answers.platforms?.trim() ?? "";
        }
        if (statusIdx >= 0) row[statusIdx] = "Planned";
        break;
      }
      case "sales_funnel_tracker": {
        const stages = [
          "Awareness",
          "Interest",
          "Consideration",
          "Decision",
          "Purchase",
          "Retention",
        ];
        const stageIdx = cols.indexOf("Stage");
        const statusIdx = cols.indexOf("Status");
        if (stageIdx >= 0) row[stageIdx] = stages[i] ?? "";
        if (statusIdx >= 0) row[statusIdx] = "Planned";
        break;
      }
      case "launch_checklist": {
        const statusIdx = cols.indexOf("Status");
        if (statusIdx >= 0) row[statusIdx] = "Not started";
        break;
      }
      case "lead_follow_up": {
        const interestIdx = cols.indexOf("Interest Level");
        if (interestIdx >= 0) row[interestIdx] = "Warm";
        break;
      }
      case "weekly_business_dashboard": {
        const defaults = [
          "Revenue",
          "Leads",
          "Calls booked",
          "Content published",
          "Email signups",
        ];
        const metricIdx = cols.indexOf("Metric");
        if (metricIdx >= 0) row[metricIdx] = defaults[i] ?? "";
        break;
      }
      case "product_comparison": {
        const optionIdx = cols.indexOf("Option");
        const parts = (session.answers.products ?? "")
          .split(/,| and /i)
          .map((s) => s.trim())
          .filter(Boolean);
        if (optionIdx >= 0) row[optionIdx] = parts[i] ?? "";
        break;
      }
      default:
        break;
    }
    rows.push(row);
  }

  return rows;
}

export function buildSheetCsv(session: GoogleSheetIntakeSession): string {
  const template = getGoogleSheetTemplate(session.sheetType);
  const header = template.columns;
  const data = buildStarterRows(session);
  return rowsToCsv([header, ...data]);
}

export function buildSheetOfferMessage(session: GoogleSheetIntakeSession): string {
  const template = getGoogleSheetTemplate(session.sheetType);
  const columnList = template.columns.join(", ");
  return (
    `I can turn this into a Google Sheet with columns for ${columnList}.\n\n` +
    "Would you like me to create it?"
  );
}

export function buildGoogleSheetPendingPayload(
  session: GoogleSheetIntakeSession,
): GoogleSheetPendingPayload {
  const template = getGoogleSheetTemplate(session.sheetType);
  return {
    sheetType: session.sheetType,
    title: buildSheetTitle(session),
    csv: buildSheetCsv(session),
    columns: [...template.columns],
    artifactType: template.artifactType,
  };
}

export function startGoogleSheetIntake(
  sheetType: GoogleSheetTypeId,
  originalPrompt: string,
): GoogleSheetsTurnResolution {
  const template = getGoogleSheetTemplate(sheetType);
  const session: GoogleSheetIntakeSession = {
    sheetType,
    phase: "collecting",
    answers: {},
    questionIndex: 0,
    originalPrompt: originalPrompt.trim(),
  };
  return {
    outcome: "ask",
    reply: template.questions[0]?.prompt ?? "What's the first detail to capture?",
    session,
  };
}

export function advanceGoogleSheetIntake(
  session: GoogleSheetIntakeSession,
  userText: string,
  currentTurn: number,
): GoogleSheetsTurnResolution {
  const template = getGoogleSheetTemplate(session.sheetType);
  const trimmed = userText.trim();
  if (!trimmed) return { outcome: "none" };

  if (session.phase === "offered") {
    return {
      outcome: "create",
      session,
      pending: buildGoogleSheetPendingPayload(session),
    };
  }

  const currentQuestion = template.questions[session.questionIndex];
  if (!currentQuestion) {
    return { outcome: "none" };
  }

  const answers = {
    ...session.answers,
    [currentQuestion.key]: trimmed,
  };
  const nextIndex = session.questionIndex + 1;

  if (nextIndex < template.questions.length) {
    const nextSession: GoogleSheetIntakeSession = {
      ...session,
      answers,
      questionIndex: nextIndex,
    };
    return {
      outcome: "ask",
      reply: template.questions[nextIndex]!.prompt,
      session: nextSession,
    };
  }

  const offeredSession: GoogleSheetIntakeSession = {
    ...session,
    answers,
    questionIndex: nextIndex,
    phase: "offered",
    offeredAtTurn: currentTurn,
  };
  const pending = buildGoogleSheetPendingPayload(offeredSession);
  return {
    outcome: "offer",
    reply: buildSheetOfferMessage(offeredSession),
    session: offeredSession,
    pending,
  };
}

export function resolveGoogleSheetsTurn(input: {
  userText: string;
  currentTurn: number;
  session: GoogleSheetIntakeSession | null;
  isAffirmation: boolean;
}): GoogleSheetsTurnResolution {
  const trimmed = input.userText.trim();
  if (!trimmed) return { outcome: "none" };

  if (input.session) {
    if (input.session.phase === "offered" && input.isAffirmation) {
      return {
        outcome: "create",
        session: input.session,
        pending: buildGoogleSheetPendingPayload(input.session),
      };
    }
    if (input.session.phase === "collecting" && !input.isAffirmation) {
      return advanceGoogleSheetIntake(
        input.session,
        trimmed,
        input.currentTurn,
      );
    }
    return { outcome: "none" };
  }

  const sheetType = detectSheetIntent(trimmed);
  if (!sheetType) return { outcome: "none" };
  return startGoogleSheetIntake(sheetType, trimmed);
}

/** Cross-workspace: suggest a sheet type from Create artifact context. */
export function suggestSheetTypeFromArtifact(
  artifactType: string,
): GoogleSheetTypeId | null {
  const t = artifactType.trim().toLowerCase();
  if (/\bfunnel\b/.test(t)) return "sales_funnel_tracker";
  if (/\bmarketing plan\b/.test(t)) return "content_calendar";
  if (/\blaunch\b/.test(t)) return "launch_checklist";
  if (/\bsop\b/.test(t)) return "sop_task_tracker";
  if (/\bcalendar\b/.test(t)) return "content_calendar";
  return null;
}

export function googleSheetsHintForChat(
  session: GoogleSheetIntakeSession | null,
): string | undefined {
  if (!session) return undefined;
  const template = getGoogleSheetTemplate(session.sheetType);
  if (session.phase === "collecting") {
    const q = template.questions[session.questionIndex];
    return [
      "GOOGLE SHEETS INTELLIGENCE (P0.18 — active intake):",
      `Sheet type: ${template.label}.`,
      q ? `Ask ONLY this one question next: ${q.prompt}` : "",
      "One question at a time. No spreadsheet setup questionnaire.",
      "FORBIDDEN: relationship openers, Create offers for prose documents.",
    ]
      .filter(Boolean)
      .join("\n");
  }
  if (session.phase === "offered") {
    return [
      "GOOGLE SHEETS INTELLIGENCE (P0.18 — permission offer):",
      `Offer columns: ${template.columns.join(", ")}.`,
      "Wait for yes before claiming the sheet exists.",
      "If they accept, the app creates the Google Sheet and returns the link.",
    ].join("\n");
  }
  return undefined;
}

export function googleSheetsCreateHintForArtifact(
  artifactType?: string | null,
): string | null {
  const sheetType = artifactType
    ? suggestSheetTypeFromArtifact(artifactType)
    : null;
  if (!sheetType) return null;
  const template = getGoogleSheetTemplate(sheetType);
  return [
    "GOOGLE SHEETS CROSS-WORKFLOW (P0.18):",
    `A **${template.label}** Google Sheet may track this better than a long doc.`,
    'Offer: "Want me to turn this into a Google Sheet?" — one intake question at a time.',
  ].join("\n");
}
