/**
 * P0.26 — Artifact Execution Authority™
 * Distinguish workspace intent (draft in Create) from execution intent (generate now).
 */

import type { ChatTurn } from "./createInitialization";
import { extractArtifactFromChat, extractTitleFromArtifact } from "./createInitialization";
import { isBareGenericAcceptance } from "./pendingAcceptanceAuthority";

export type ArtifactExecutionKind =
  | "pdf"
  | "google-doc"
  | "google-sheet"
  | "calendar";

export type ArtifactExecutionDraft = {
  kind: ArtifactExecutionKind;
  title: string;
  body: string;
  missing: "content" | null;
};

export type ArtifactExecutionTurnOutcome =
  | { kind: "not_execution" }
  | { kind: "workspace"; reason: string }
  | { kind: "ask"; reply: string; draft: ArtifactExecutionDraft }
  | { kind: "confirm"; reply: string; draft: ArtifactExecutionDraft };

const PDF_EXECUTION_RE =
  /\b(?:make (?:this|it|that) (?:a )?pdf|convert (?:this|it|that) to (?:a )?pdf|save (?:this|it|that) as (?:a )?pdf|generate (?:the |a )?pdf(?:\s+version)?|create (?:the |a )?pdf(?:\s+now)?|export (?:this|it) as pdf)\b/i;

const PDF_WORKSPACE_RE =
  /\b(?:help me (?:write|create|draft|build) (?:a )?pdf|draft (?:a )?pdf|work on (?:a )?pdf|open create.*pdf|write (?:a )?pdf (?:for me|together))\b/i;

const GOOGLE_DOC_EXECUTION_RE =
  /\b(?:create (?:the |a )?google doc(?:\s+now)?|put (?:this|it|that) in (?:a )?google doc|save (?:this|it|that) to google docs?|export (?:this|it) to google docs?|generate (?:the |a )?google doc)\b/i;

const GOOGLE_DOC_WORKSPACE_RE =
  /\b(?:help me (?:write|draft|create)|draft (?:in )?create|open create|work on (?:a )?(?:doc|document))\b/i;

const GOOGLE_SHEET_EXECUTION_RE =
  /\b(?:create (?:the |a )?(?:google )?sheet(?:\s+now)?|build (?:the |a )?(?:google )?sheet|put (?:this|it|that) (?:into|in) (?:a )?spreadsheet|save (?:this|it|that) as (?:a )?sheet|generate (?:the |a )?sheet)\b/i;

const GOOGLE_SHEET_WORKSPACE_RE =
  /\b(?:help me create (?:a )?content calendar|draft (?:a )?spreadsheet|open create.*sheet)\b/i;

const CALENDAR_EXECUTION_RE =
  /\b(?:create (?:this |the |a )?calendar(?:\s+now)?|add (?:this|it|that) to (?:my )?calendar|build (?:a )?calendar from (?:this|it|that)|generate (?:the |a )?calendar)\b/i;

const CALENDAR_WORKSPACE_RE =
  /\b(?:help me (?:plan|build) (?:my )?calendar|open (?:the )?calendar|work on (?:my )?calendar)\b/i;

const ARTIFACT_EXECUTION_OFFER_RE =
  /\b(?:shall i create|should i create|want me to create|ready to create|create (?:the |it )?now)\b/i;

export function detectArtifactExecutionKind(
  text: string,
): ArtifactExecutionKind | null {
  const t = text.trim();
  if (!t) return null;
  if (PDF_EXECUTION_RE.test(t)) return "pdf";
  if (GOOGLE_DOC_EXECUTION_RE.test(t)) return "google-doc";
  if (GOOGLE_SHEET_EXECUTION_RE.test(t)) return "google-sheet";
  if (CALENDAR_EXECUTION_RE.test(t)) return "calendar";
  return null;
}

export function isArtifactWorkspaceIntent(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (PDF_WORKSPACE_RE.test(t)) return true;
  if (GOOGLE_DOC_WORKSPACE_RE.test(t) && !GOOGLE_DOC_EXECUTION_RE.test(t)) {
    return true;
  }
  if (GOOGLE_SHEET_WORKSPACE_RE.test(t) && !GOOGLE_SHEET_EXECUTION_RE.test(t)) {
    return true;
  }
  if (CALENDAR_WORKSPACE_RE.test(t) && !CALENDAR_EXECUTION_RE.test(t)) {
    return true;
  }
  return false;
}

export function isArtifactExecutionIntent(text: string): boolean {
  const t = text.trim();
  if (!t || isArtifactWorkspaceIntent(t)) return false;
  return detectArtifactExecutionKind(t) !== null;
}

export function isArtifactExecutionOfferMessage(assistantText: string): boolean {
  const t = assistantText.trim();
  if (!t || !ARTIFACT_EXECUTION_OFFER_RE.test(t)) return false;
  return (
    /\bpdf\b/i.test(t) ||
    /\bgoogle doc\b/i.test(t) ||
    /\b(?:google )?sheet\b/i.test(t) ||
    /\bcalendar\b/i.test(t)
  );
}

export function detectArtifactKindFromOffer(
  assistantText: string,
): ArtifactExecutionKind | null {
  if (!isArtifactExecutionOfferMessage(assistantText)) return null;
  const t = assistantText;
  if (/\bpdf\b/i.test(t)) return "pdf";
  if (/\bgoogle doc\b/i.test(t)) return "google-doc";
  if (/\b(?:google )?sheet\b/i.test(t)) return "google-sheet";
  if (/\bcalendar\b/i.test(t)) return "calendar";
  return null;
}

export function isArtifactExecutionAffirmation(text: string): boolean {
  return isBareGenericAcceptance(text.trim());
}

export function artifactExecutionOfferLine(kind: ArtifactExecutionKind): string {
  switch (kind) {
    case "pdf":
      return "Shall I create the PDF now?";
    case "google-doc":
      return "Shall I create the Google Doc now?";
    case "google-sheet":
      return "Shall I create the Google Sheet now?";
    case "calendar":
      return "Shall I create the calendar now?";
  }
}

export function extractContentForArtifactExecution(
  messages: ChatTurn[],
  lastAssistantText?: string,
): { title: string; body: string } | null {
  const lastUser =
    [...messages].reverse().find((m) => m.role === "user")?.content?.trim() ??
    "";

  if (!isArtifactExecutionIntent(lastUser)) {
    const fromChat = extractArtifactFromChat(messages);
    if (fromChat?.draftContent?.trim()) {
      return {
        title: fromChat.title,
        body: fromChat.draftContent.trim(),
      };
    }
  } else {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.role !== "assistant") continue;
      const body = m.content.trim();
      if (body.length < 40 || ARTIFACT_EXECUTION_OFFER_RE.test(body)) continue;
      if (isArtifactExecutionOfferMessage(body)) continue;
      return {
        title: extractTitleFromArtifact(body, "Document"),
        body,
      };
    }
  }

  const assistant = lastAssistantText?.trim();
  if (assistant && assistant.length >= 80 && !ARTIFACT_EXECUTION_OFFER_RE.test(assistant)) {
    return {
      title: extractTitleFromArtifact(assistant, "Document"),
      body: assistant,
    };
  }
  return null;
}

function kindLabel(kind: ArtifactExecutionKind): string {
  switch (kind) {
    case "pdf":
      return "PDF";
    case "google-doc":
      return "Google Doc";
    case "google-sheet":
      return "Google Sheet";
    case "calendar":
      return "Calendar";
  }
}

export function artifactExecutionFailureReply(
  kind: ArtifactExecutionKind,
  reason: string,
): string {
  return `I couldn't generate the ${kindLabel(kind)} because ${reason}. Want to try again?`;
}

export function resolveArtifactExecutionTurn(input: {
  userText: string;
  draft?: ArtifactExecutionDraft | null;
  messages?: ChatTurn[];
  lastAssistantText?: string;
}): ArtifactExecutionTurnOutcome {
  const text = input.userText.trim();

  if (input.draft) {
    if (input.draft.missing === "content") {
      const body = text.trim();
      if (!body || isBareGenericAcceptance(body)) {
        return {
          kind: "ask",
          reply: "What content should I use for this file?",
          draft: input.draft,
        };
      }
      return {
        kind: "confirm",
        reply: artifactExecutionOfferLine(input.draft.kind),
        draft: {
          ...input.draft,
          body,
          title: extractTitleFromArtifact(body, kindLabel(input.draft.kind)),
          missing: null,
        },
      };
    }
    if (isBareGenericAcceptance(text)) {
      return {
        kind: "confirm",
        reply: "",
        draft: input.draft,
      };
    }
    return { kind: "not_execution" };
  }

  const kind = detectArtifactExecutionKind(text);
  if (!kind) return { kind: "not_execution" };
  if (isArtifactWorkspaceIntent(text)) {
    return { kind: "workspace", reason: "workspace_intent" };
  }

  const content = extractContentForArtifactExecution(
    input.messages ?? [],
    input.lastAssistantText,
  );
  if (!content) {
    return {
      kind: "ask",
      reply: `What content should I turn into a ${kindLabel(kind)}?`,
      draft: {
        kind,
        title: kindLabel(kind),
        body: "",
        missing: "content",
      },
    };
  }

  const explicitNow =
    /\b(?:now|right away|immediately)\b/i.test(text) &&
    /\b(?:pdf|google doc|(?:google )?sheet|calendar)\b/i.test(text);

  const draft: ArtifactExecutionDraft = {
    kind,
    title: content.title,
    body: content.body,
    missing: null,
  };

  if (explicitNow) {
    return { kind: "confirm", reply: "", draft };
  }

  return {
    kind: "ask",
    reply: artifactExecutionOfferLine(kind),
    draft,
  };
}
