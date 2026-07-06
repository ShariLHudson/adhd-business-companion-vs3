import { FOUNDER_STUDIO_BASE } from "@/lib/founderStudio/founderConfig";
import { workspaceHref } from "../../workspace/config";

import type {
  ConciergeDrawerSection,
  ExecutiveAgenda,
  ExecutiveConciergeMessage,
  ExecutiveConciergeRecommendation,
  ExecutiveReminder,
  ThinkingSpaceSuggestion,
  WorkspaceSuggestion,
} from "../types";

export const SAMPLE_MORNING_GREETING = "Good morning, Shari.";

export const SAMPLE_PRIMARY_MESSAGE: ExecutiveConciergeMessage = {
  id: "concierge-msg-1",
  text: "I've prepared today's Build Workspace — product priorities and Spark quality are ready when you are.",
  href: workspaceHref("build"),
  hrefLabel: "Open Build Workspace",
};

export const SAMPLE_EXECUTIVE_AGENDA: ExecutiveAgenda = {
  priorities: [
    {
      id: "ag-p1",
      title: "Review Founder Studio concierge experience",
      summary: "Confirm the office feels prepared — not like software asking what to do.",
    },
    {
      id: "ag-p2",
      title: "Decision Vault sample decisions",
      summary: "Walk one real decision through the vault before live memory ships.",
    },
    {
      id: "ag-p3",
      title: "Workshop narrative alignment",
      summary: "Transformation story for the next cohort — not a feature tour.",
    },
  ],
  watchItems: [
    {
      id: "watch-1",
      title: "Member conversation quality",
      note: "Observation Mode — Rule of Three before any prompt change.",
    },
    {
      id: "watch-2",
      title: "Production founder access",
      note: "Allowlisted email on deployed environment.",
    },
    {
      id: "watch-3",
      title: "PostCraft integration path",
      note: "Architecture ready; live sync remains a future phase.",
    },
  ],
  opportunity: {
    id: "opp-1",
    title: "Executive Strategy Center for product roadmap",
    summary:
      "Today's most valuable thinking may be mapping Q3 priorities on the strategy canvas.",
  },
  recommendation: {
    id: "rec-1",
    title: "Before continuing, review yesterday's decisions",
    summary:
      "The Decision Vault has three sample records — institutional memory starts with clarity on what we already chose.",
    href: `${FOUNDER_STUDIO_BASE}/decision-vault`,
    hrefLabel: "Open Decision Vault",
  },
};

export const SAMPLE_WORKSPACE_SUGGESTION: WorkspaceSuggestion = {
  workspaceId: "build",
  title: "Recommended: Build Workspace",
  reason: "Product priorities and Spark quality are the calm focus for this morning.",
  href: workspaceHref("build"),
};

export const SAMPLE_THINKING_SPACE: ThinkingSpaceSuggestion = {
  placeId: "round-table",
  label: "The Round Table",
  reason: "This feels like a Round Table decision — gathered judgment before you commit.",
  href: "/companion",
};

export const SAMPLE_REMINDERS: ExecutiveReminder[] = [
  {
    id: "rem-1",
    kind: "pending-decision",
    title: "Workshop pricing review",
    note: "A gentle pause before the next cohort announcement.",
    href: `${FOUNDER_STUDIO_BASE}/decision-vault`,
  },
  {
    id: "rem-2",
    kind: "strategy-session",
    title: "Strategy session saved locally",
    note: "Resume executive thinking where you left off.",
    href: `${FOUNDER_STUDIO_BASE}/executive-strategy`,
  },
  {
    id: "rem-3",
    kind: "idea-revisit",
    title: "Decision Vault institutional memory",
    note: "An idea worth revisiting before the next architecture conversation.",
    href: `${FOUNDER_STUDIO_BASE}/decision-vault`,
  },
];

export const SAMPLE_QUICK_WINS = [
  {
    id: "qw-1",
    title: "Scan today's FIRE brief",
    summary: "Three priorities already surfaced on the office home.",
  },
  {
    id: "qw-2",
    title: "One Decision Vault record",
    summary: "Open a single decision and confirm the reasoning chain feels right.",
  },
];

export const SAMPLE_DRAWER_SECTIONS: ConciergeDrawerSection[] = [
  {
    id: "drawer-agenda",
    title: "Today's Agenda",
    items: [
      {
        id: "da-1",
        label: "Build Workspace prepared",
        meta: "Morning",
        href: workspaceHref("build"),
      },
      {
        id: "da-2",
        label: "Decision Vault review",
        meta: "Suggested",
        href: `${FOUNDER_STUDIO_BASE}/decision-vault`,
      },
    ],
  },
  {
    id: "drawer-decisions",
    title: "Recent Decisions",
    items: [
      {
        id: "dd-1",
        label: "Freeze conversation architecture",
        meta: "Jun 15",
        href: `${FOUNDER_STUDIO_BASE}/decision-vault`,
      },
      {
        id: "dd-2",
        label: "Founder Studio before full intelligence",
        meta: "Jul 1",
        href: `${FOUNDER_STUDIO_BASE}/decision-vault`,
      },
    ],
  },
  {
    id: "drawer-ideas",
    title: "Saved Ideas",
    items: [
      {
        id: "di-1",
        label: "Executive Strategy Center",
        meta: "Shipped",
        href: `${FOUNDER_STUDIO_BASE}/executive-strategy`,
      },
      {
        id: "di-2",
        label: "Decision Vault memory",
        meta: "Exploring",
        href: `${FOUNDER_STUDIO_BASE}/decision-vault`,
      },
    ],
  },
  {
    id: "drawer-research",
    title: "Recent Research",
    items: [
      {
        id: "dr-1",
        label: "Conversation gold standards",
        meta: "Spec 116",
        href: `${FOUNDER_STUDIO_BASE}/workspace/discover`,
      },
    ],
  },
  {
    id: "drawer-approvals",
    title: "Pending Approvals",
    items: [
      {
        id: "dp-1",
        label: "Workshop cohort narrative",
        meta: "Awaiting review",
        href: `${FOUNDER_STUDIO_BASE}/workspace/team`,
      },
    ],
  },
  {
    id: "drawer-strategy",
    title: "Recent Strategy Sessions",
    items: [
      {
        id: "ds-1",
        label: "Spark Alpha positioning",
        meta: "Jul 1",
        href: `${FOUNDER_STUDIO_BASE}/executive-strategy`,
      },
    ],
  },
  {
    id: "drawer-resume",
    title: "Quick Resume",
    items: [
      {
        id: "qr-1",
        label: "Continue Build Workspace",
        href: workspaceHref("build"),
      },
      {
        id: "qr-2",
        label: "Open Executive Strategy Center",
        href: `${FOUNDER_STUDIO_BASE}/executive-strategy`,
      },
    ],
  },
];

export const SAMPLE_EXECUTIVE_RECOMMENDATION: ExecutiveConciergeRecommendation =
  SAMPLE_EXECUTIVE_AGENDA.recommendation!;
