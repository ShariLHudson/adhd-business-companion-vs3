// Founder Ecosystem — Phase 14 Automation Router.
// Reads founder intent and determines: which tool category, which tool, which
// action, what data is needed, and whether approval is required. Pure.

import { requiresApproval } from "./approvalEngine";
import type {
  AutomationActionType,
  AutomationRoute,
  Tool,
  ToolCategory,
} from "./automationTypes";

type Rule = {
  test: RegExp;
  category: ToolCategory;
  tool: Tool;
  actionType: AutomationActionType;
  title: string;
  emoji: string;
  dataNeeded: string[];
  opensBesideChat: boolean;
};

// Ordered: most specific first.
const RULES: Rule[] = [
  // --- GHL records (external → approval) ---
  {
    test: /\b(create|add) (a )?(new )?(contact|lead record)\b/i,
    category: "marketing",
    tool: "ghl",
    actionType: "create-external-record",
    title: "Create contact in GHL",
    emoji: "👤",
    dataNeeded: ["name", "email", "source"],
    opensBesideChat: false,
  },
  {
    test: /\b(create|new) (an )?opportunity|new deal\b/i,
    category: "marketing",
    tool: "ghl",
    actionType: "create-external-record",
    title: "Create opportunity in GHL",
    emoji: "💼",
    dataNeeded: ["contact", "value", "pipeline stage"],
    opensBesideChat: false,
  },
  {
    test: /\bmove (the )?(opportunity|deal|lead)\b/i,
    category: "marketing",
    tool: "ghl",
    actionType: "move-opportunity",
    title: "Move opportunity stage in GHL",
    emoji: "↗️",
    dataNeeded: ["opportunity", "target stage"],
    opensBesideChat: false,
  },
  {
    test: /\b(trigger|start|run) (a )?workflow|nurture sequence|automation sequence\b/i,
    category: "marketing",
    tool: "ghl",
    actionType: "trigger-workflow",
    title: "Trigger GHL workflow",
    emoji: "⚙️",
    dataNeeded: ["workflow", "contact(s)"],
    opensBesideChat: false,
  },
  // --- Communications ---
  // Sending is an outside-world action → approval-required. Checked BEFORE the
  // draft rule so "send the email" never silently goes out.
  {
    test: /\bsend\b[\w\s]*\bemail\b|\bemail (it|this|that) (to|out)\b|\bsend it (to|out)\b/i,
    category: "communications",
    tool: "gmail",
    actionType: "send-email",
    title: "Send the email",
    emoji: "📤",
    dataNeeded: ["recipient", "final draft to send"],
    opensBesideChat: false,
  },
  {
    test: /\b(follow[ -]?up|reply|respond|reach out|draft[\w\s-]*email|email (them|her|him|back)|outreach)\b/i,
    category: "communications",
    tool: "ghl-conversations",
    actionType: "draft-email",
    title: "Draft follow-up email",
    emoji: "📧",
    dataNeeded: ["recipient", "context / last message", "goal of the email"],
    opensBesideChat: true,
  },
  // --- Documents ---
  {
    test: /\b(spreadsheet|sheet|tracker|budget|financial model)\b/i,
    category: "documents",
    tool: "google-sheets",
    actionType: "create-google-sheet",
    title: "Create a Google Sheet",
    emoji: "📊",
    dataNeeded: ["columns", "purpose"],
    opensBesideChat: true,
  },
  {
    test: /\b(form|survey|intake|questionnaire)\b/i,
    category: "documents",
    tool: "google-forms",
    actionType: "create-google-form",
    title: "Create a Google Form",
    emoji: "🗒️",
    dataNeeded: ["questions", "purpose"],
    opensBesideChat: true,
  },
  {
    test: /\b(proposal|sop|contract|one ?pager|document|write ?up|brief|doc)\b/i,
    category: "documents",
    tool: "create",
    actionType: "create-draft",
    title: "Open Create to build the document",
    emoji: "📝",
    dataNeeded: ["topic", "audience", "key points", "link to project"],
    opensBesideChat: true,
  },
  {
    test: /\b(export (to )?pdf|pdf|download (it )?as)\b/i,
    category: "documents",
    tool: "pdf-export",
    actionType: "create-draft",
    title: "Export as PDF",
    emoji: "📄",
    dataNeeded: ["source document"],
    opensBesideChat: false,
  },
  // --- Marketing / content ---
  {
    test: /\b(canva|graphic|design (a|the)|thumbnail|cover image)\b/i,
    category: "marketing",
    tool: "canva",
    actionType: "create-draft",
    title: "Start a design in Canva",
    emoji: "🎨",
    dataNeeded: ["format", "message", "brand"],
    opensBesideChat: false,
  },
  {
    test: /\b(publish|schedule (a )?post|post to|social (post|media)|instagram|linkedin|facebook)\b/i,
    category: "marketing",
    tool: "social-scheduler",
    actionType: "publish-content",
    title: "Schedule a social post",
    emoji: "📣",
    dataNeeded: ["content", "network", "time"],
    opensBesideChat: false,
  },
  // --- Calendar ---
  {
    test: /\b(book|schedule) (a )?(call|meeting|appointment)\b/i,
    category: "calendar",
    tool: "google-calendar",
    actionType: "schedule-appointment",
    title: "Schedule an appointment",
    emoji: "📅",
    dataNeeded: ["attendee", "time", "duration"],
    opensBesideChat: false,
  },
  {
    test: /\b(schedule|block|set aside|time block|find time|make time)\b/i,
    category: "calendar",
    tool: "time-block",
    actionType: "open-workspace",
    title: "Open Time Block",
    emoji: "📅",
    dataNeeded: ["task", "duration", "day"],
    opensBesideChat: true,
  },
  // --- Projects ---
  {
    test: /\b(create|add) (a )?task|to-?do\b/i,
    category: "projects",
    tool: "internal-projects",
    actionType: "create-internal-task",
    title: "Add a task to the project",
    emoji: "✅",
    dataNeeded: ["task title", "project"],
    opensBesideChat: true,
  },
  {
    test: /\b(open|work on|continue|review) (the )?project|project status|odoo\b/i,
    category: "projects",
    tool: "internal-projects",
    actionType: "load-project",
    title: "Open the project",
    emoji: "📁",
    dataNeeded: ["which project"],
    opensBesideChat: true,
  },
  // --- Research ---
  {
    test: /\b(research|look up|investigate|learn about|find out|competitor analysis|market research)\b/i,
    category: "research",
    tool: "web-research",
    actionType: "research-topic",
    title: "Research the topic",
    emoji: "🔍",
    dataNeeded: ["topic", "what you want to learn"],
    opensBesideChat: true,
  },
  // --- AI partners ---
  {
    test: /\b(claude|chatgpt|ai (help|draft|assist)|generate (a )?prompt|prompt for)\b/i,
    category: "ai-partners",
    tool: "claude",
    actionType: "generate-prompt",
    title: "Prepare a Claude session with context",
    emoji: "🤖",
    dataNeeded: ["goal", "context to attach"],
    opensBesideChat: true,
  },
];

const CONFIDENCE_FALLBACK: AutomationRoute = {
  toolCategory: "projects",
  tool: "internal-projects",
  actionType: "open-workspace",
  title: "Open a workspace to work on this",
  description: "I couldn't pin this to one tool — let's open a workspace and shape it together.",
  emoji: "🧭",
  approvalRequired: false,
  dataNeeded: ["what you're trying to do"],
  opensBesideChat: true,
  confidence: "low",
};

export function routeAutomation(text: string): AutomationRoute {
  const t = text.trim();
  for (const rule of RULES) {
    if (rule.test.test(t)) {
      return {
        toolCategory: rule.category,
        tool: rule.tool,
        actionType: rule.actionType,
        title: rule.title,
        description: descriptionFor(rule.title, rule.dataNeeded),
        emoji: rule.emoji,
        approvalRequired: requiresApproval(rule.actionType),
        dataNeeded: rule.dataNeeded,
        opensBesideChat: rule.opensBesideChat,
        confidence: "high",
      };
    }
  }
  return CONFIDENCE_FALLBACK;
}

function descriptionFor(title: string, dataNeeded: string[]): string {
  return dataNeeded.length
    ? `${title}. I'll need: ${dataNeeded.join(", ")}.`
    : title;
}

/** Route several intents at once (e.g. from a task dump). */
export function routeMany(texts: string[]): AutomationRoute[] {
  return texts.map(routeAutomation);
}
