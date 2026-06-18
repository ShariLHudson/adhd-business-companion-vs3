// Collaborative document creation — config + detection for chat + Create + Google workflow.
// Canonical spec: document-creation-workflow.json

import { matchCatalogFromText } from "./createCatalog";
import documentCreationWorkflow from "./document-creation-workflow.json";
import type { GoogleFileKind } from "./googleWorkspace";
import { googleWorkspaceTitle } from "./googleWorkspace";

export { documentCreationWorkflow };
export const DOCUMENT_CREATION_WORKFLOW = documentCreationWorkflow;

export type DocumentPanelPhase = "building" | "ready" | "google";

export type CollaborativeDocumentWorkflow = {
  version: string;
  role: string;
  layout: {
    left: string;
    right: { building: string; ready: string; google: string };
    rule: string;
  };
  intentPhrases: string[];
  documentTypes: {
    id: GoogleFileKind;
    label: string;
    triggers: string[];
    useWhen: string;
  }[];
  buildingHeaderActions: string[];
  hiddenWhileBuilding: string[];
  exportActions: {
    primary: string[];
    secondary: string[];
  };
  coachRules: string[];
  researchOffer: string;
  verification: {
    rule: string;
    failureTemplate: string;
  };
  ambiguity: {
    multiDraftPrompt: string;
    taskDumpRule: string;
  };
  copyPasteFallback: Record<GoogleFileKind, string[]>;
};

export const COLLABORATIVE_DOCUMENT_WORKFLOW: CollaborativeDocumentWorkflow = {
  version: "1.0",
  role:
    "Digital assistant that helps create and manage Google Docs, Sheets, and Forms while chat stays open for guidance.",
  layout: {
    left: "Chat with Shari — always active for guidance, research, and next steps.",
    right: {
      building: "Create panel — draft scaffold; header: Edit, Copy, It's ready only.",
      ready: "Export chooser — Open in Google Docs/Sheets/Forms, PDF, Copy Text.",
      google: "Embedded Google workspace — chat edits sync to the file.",
    },
    rule: "Never claim a panel is open until workspace state is verified visible.",
  },
  intentPhrases: [
    "create a document",
    "write a draft",
    "make a spreadsheet",
    "build a form",
    "create a google doc",
    "new document",
    "help me draft",
  ],
  documentTypes: [
    {
      id: "doc",
      label: "Google Doc",
      triggers: ["doc", "document", "google doc", "write", "draft", "sop", "proposal", "recipe"],
      useWhen: "Text-based assets — SOPs, proposals, recipes, scripts, emails.",
    },
    {
      id: "sheet",
      label: "Google Sheet",
      triggers: ["sheet", "spreadsheet", "calendar", "table", "tracker", "content calendar"],
      useWhen: "Tables, calendars, plans with rows/columns.",
    },
    {
      id: "form",
      label: "Google Form",
      triggers: ["form", "questionnaire", "intake", "survey", "quiz"],
      useWhen: "Questions, intake, client questionnaires.",
    },
  ],
  buildingHeaderActions: ["Edit", "Copy", "It's ready"],
  hiddenWhileBuilding: ["Save", "Saved Work", "Templates", "Where Is This Saved"],
  exportActions: {
    primary: [
      "Open in Google Docs",
      "Open in Google Sheets",
      "Open in Google Forms",
      "Download PDF",
      "Copy Text",
    ],
    secondary: ["Edit in Create", "Link to a Project"],
  },
  coachRules: [
    "Ask for the smallest first step — one ingredient, first paragraph, first row, first question.",
    "One question per reply while building; friendly, no jargon.",
    "User may type in chat OR edit in the Create panel — both are valid.",
    "Offer structure examples only when helpful (title → overview → sections).",
    "Do not dump full drafts in chat — Create panel is the canvas.",
    "When Create is open beside chat, auto-apply relevant content to the draft — never ask permission first.",
    "Do not load old drafts for new document requests unless the user explicitly asks to resume.",
    "Never use a chat sentence as the document title.",
    "Remind user chat stays open on the left.",
    "Offer research help: user can ask for reference info or search the web and paste here.",
  ],
  researchOffer:
    "Want help finding reference information for this? You can search the web and paste what you find here, or tell me what to look for.",
  verification: {
    rule: "Confirm workspace open only when panel + split view + reveal are verified.",
    failureTemplate:
      "I tried to open {type}, but it didn't appear on screen. Tap {type} in the menu, or tell me to try again.",
  },
  ambiguity: {
    multiDraftPrompt:
      "I found more than one possible document. Which one do you mean? Reply with the number or title.",
    taskDumpRule:
      "Lists of multiple tasks stay in chat — capture, prioritize, ask energy/time, pick ONE before opening Create.",
  },
  copyPasteFallback: {
    doc: [
      "Copy the text from our chat or the Create panel (Ctrl/Cmd+C).",
      "Open Google Docs → paste into a new doc (Ctrl/Cmd+V).",
      "Or click **Open in Google Docs** in the panel when **It's ready**.",
    ],
    sheet: [
      "Copy your table or list from chat or Create.",
      "Open Google Sheets → paste into cell A1.",
      "Or use **Open in Google Sheets** after **It's ready**.",
    ],
    form: [
      "Copy your questions from chat or Create.",
      "Open Google Forms → create a new form → paste questions as needed.",
      "Or use **Open in Google Forms** after **It's ready**.",
    ],
  },
};

const DOCUMENT_INTENT_RE =
  /\b(?:create|make|build|write|draft|start)\s+(?:a |an |my |the )?(?:document|google doc|spreadsheet|sheet|form|questionnaire|draft)\b/i;

const GENERIC_DOCUMENT_RE =
  /\b(?:create a document|new document|write a draft|help me draft|make a spreadsheet|build a form)\b/i;

const SPECIFIC_DOCUMENT_RE =
  /\bwrite an? (?:sop|proposal|recipe)\b|\bwrite a client intake form\b|\bcreate an? (?:sop|proposal)\b/i;

const TYPE_CHOICE_RE =
  /\b(?:google )?(?:doc|document|docs)\b|\b(?:google )?(?:sheet|spreadsheet|sheets)\b|\b(?:google )?(?:form|forms|questionnaire)\b/i;

export function isDocumentCreationRequest(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return (
    GENERIC_DOCUMENT_RE.test(t) ||
    DOCUMENT_INTENT_RE.test(t) ||
    SPECIFIC_DOCUMENT_RE.test(t)
  );
}

export function inferDocumentTypeFromRequest(text: string): GoogleFileKind | null {
  const t = text.toLowerCase();
  if (/\b(?:form|questionnaire|intake|survey|quiz)\b/.test(t)) return "form";
  if (/\b(?:spreadsheet|sheet|calendar|tracker|table)\b/.test(t)) return "sheet";
  if (/\bgoogle docs?\b/.test(t)) return "doc";
  if (/\b(?:sop|standard operating procedure)\b/.test(t)) return "doc";
  if (/\bwrite an? (?:sop|proposal|recipe)\b/.test(t)) return "doc";
  if (/\bcreate an? (?:sop|proposal)\b/.test(t)) return "doc";
  if (/\bmake a spreadsheet\b|\bbuild a spreadsheet\b/.test(t)) return "sheet";
  if (/\bbuild a form\b|\bmake a form\b/.test(t)) return "form";
  return null;
}

/** Ambiguous "create a document" without doc/sheet/form hint. */
export function needsDocumentTypeConfirmation(text: string): boolean {
  if (!isDocumentCreationRequest(text)) return false;
  return inferDocumentTypeFromRequest(text) === null;
}

export function extractDocumentTopic(text: string): string | undefined {
  const m = text.match(/\b(?:for|about)\s+(.+)$/i);
  return m?.[1]?.trim().replace(/[.?!]+$/, "");
}

export function itemTypeForCollaborativeKind(
  kind: GoogleFileKind,
  topic?: string,
  userText?: string,
): string {
  if (userText?.trim()) {
    const fromRequest = matchCatalogFromText(userText);
    if (fromRequest?.type) return fromRequest.type;
  }
  if (topic?.trim()) {
    const match = matchCatalogFromText(topic);
    if (match?.type) return match.type;
  }
  switch (kind) {
    case "sheet":
      return "content calendar";
    case "form":
      return "questionnaire";
    default:
      return topic?.trim() ? "document" : "content";
  }
}

/** Title for Create — topic or catalog type, never the raw chat sentence. */
export function titleForCollaborativeDocument(
  userText: string,
  topic?: string,
  itemType?: string,
): string {
  if (topic?.trim()) return topic.trim();
  const catalog = matchCatalogFromText(userText);
  if (catalog?.type) return `New ${catalog.type}`;
  if (itemType && itemType !== "content" && itemType !== "document") {
    return `New ${itemType}`;
  }
  return "Untitled draft";
}

export function parseDocumentTypeChoice(text: string): GoogleFileKind | null {
  const t = text.trim().toLowerCase();
  if (/^(1|one)\b/.test(t) || /\bgoogle doc/.test(t) || /\b(?:just )?a doc\b/.test(t)) {
    return "doc";
  }
  if (/^(2|two)\b/.test(t) || /\bsheet/.test(t) || /\bspreadsheet/.test(t)) {
    return "sheet";
  }
  if (/^(3|three)\b/.test(t) || /\bform/.test(t) || /\bquestionnaire/.test(t)) {
    return "form";
  }
  if (TYPE_CHOICE_RE.test(t)) {
    return inferDocumentTypeFromRequest(t);
  }
  return null;
}

export function documentTypeConfirmationMessage(topic?: string): string {
  const about = topic?.trim() ? ` for **${topic.trim()}**` : "";
  return (
    `Happy to help you create a document${about}. ` +
    `Do you want this as a **Google Doc** (text), **Google Sheet** (table/calendar), or **Google Form** (questionnaire)?\n\n` +
    `Reply **1** for Doc, **2** for Sheet, or **3** for Form — or just say which one.`
  );
}

export function documentCreationOpenAck(
  kind: GoogleFileKind,
  topic?: string,
): string {
  const surface = googleWorkspaceTitle(kind);
  const about = topic?.trim() ? ` **${topic.trim()}**` : "";
  return (
    `Opening **Create** beside us${about ? ` for${about}` : ""} — we'll build it here, then open in **${surface}** when you're ready.\n\n` +
    `Chat stays on the left. What's the very first tiny step to start — one line, title, or first item?`
  );
}

export function copyPasteFallbackMessage(kind: GoogleFileKind): string {
  const steps = COLLABORATIVE_DOCUMENT_WORKFLOW.copyPasteFallback[kind];
  return (
    `If **Open in ${googleWorkspaceTitle(kind)}** isn't visible yet, you can paste manually:\n\n` +
    steps.map((s, i) => `${i + 1}. ${s}`).join("\n")
  );
}

export function workspaceOpenFailureMessage(kind: GoogleFileKind): string {
  const type = googleWorkspaceTitle(kind);
  return COLLABORATIVE_DOCUMENT_WORKFLOW.verification.failureTemplate
    .replace(/\{type\}/g, type);
}

export function formatCollaborativeDocumentCoachHint(opts: {
  phase: DocumentPanelPhase;
  artifactType?: string;
  title?: string;
  preferredExport?: GoogleFileKind;
  draftVisible?: boolean;
}): string {
  const lines = [
    "COLLABORATIVE DOCUMENT MODE (chat left, workspace right):",
    ...COLLABORATIVE_DOCUMENT_WORKFLOW.coachRules.map((r) => `- ${r}`),
  ];

  if (opts.phase === "building") {
    lines.push(
      `- Phase: BUILDING in Create. Header actions only: ${COLLABORATIVE_DOCUMENT_WORKFLOW.buildingHeaderActions.join(", ")}.`,
      `- Do NOT mention ${COLLABORATIVE_DOCUMENT_WORKFLOW.hiddenWhileBuilding.join(", ")} as primary next steps.`,
    );
    if (opts.preferredExport) {
      lines.push(
        `- Planned export: ${googleWorkspaceTitle(opts.preferredExport)} when they click **It's ready**.`,
      );
    }
    if (opts.draftVisible === false) {
      lines.push("- Draft not visible yet — do not claim it is on screen.");
    } else {
      lines.push(
        `- Working on: ${opts.artifactType ?? "document"}${opts.title ? ` — ${opts.title}` : ""}.`,
      );
    }
    lines.push(`- Research: ${COLLABORATIVE_DOCUMENT_WORKFLOW.researchOffer}`);
  } else if (opts.phase === "ready") {
    lines.push(
      "- Phase: READY — user picks export. Primary: Open in Google Docs/Sheets/Forms, PDF, Copy.",
      "- Say the document is ready only if export panel is verified visible.",
    );
  } else {
    lines.push(
      "- Phase: GOOGLE — edits in chat sync to the embedded file via apply-edit.",
      "- User may say: Add a troubleshooting section / Move this section to the top — apply when they confirm.",
      "- Reply briefly (Done.) after sync.",
    );
  }

  lines.push(`- ${COLLABORATIVE_DOCUMENT_WORKFLOW.verification.rule}`);
  return lines.join("\n");
}

export function workflowConfigJson(): string {
  return JSON.stringify(COLLABORATIVE_DOCUMENT_WORKFLOW, null, 2);
}
