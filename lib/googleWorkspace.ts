// Google Workspace — Companion creates; Google stores & edits.

export type GoogleFileKind = "doc" | "sheet" | "form";

export type GoogleWorkspaceSession = {
  kind: GoogleFileKind;
  fileId: string;
  url: string;
  embedUrl: string;
  title: string;
  artifactType: string;
  /** Plain-text snapshot for chat-driven edits */
  content: string;
};

export function googleFileIdFromUrl(url: string): string | null {
  const m = url.match(
    /\/(?:document|spreadsheets|forms)\/d\/([a-zA-Z0-9_-]+)/,
  );
  return m?.[1] ?? null;
}

export function googleEmbedUrl(kind: GoogleFileKind, fileId: string): string {
  switch (kind) {
    case "sheet":
      return `https://docs.google.com/spreadsheets/d/${fileId}/edit?embedded=true`;
    case "form":
      return `https://docs.google.com/forms/d/${fileId}/edit?embedded=true`;
    default:
      return `https://docs.google.com/document/d/${fileId}/edit?embedded=true`;
  }
}

export function googleWorkspaceTitle(kind: GoogleFileKind): string {
  switch (kind) {
    case "sheet":
      return "Google Sheets";
    case "form":
      return "Google Forms";
    default:
      return "Google Docs";
  }
}

/** Best Google surface for this artifact type. */
export function recommendGoogleExport(
  artifactType: string,
  content: string,
): GoogleFileKind {
  const t = artifactType.toLowerCase();
  if (
    /\b(form|questionnaire|intake|survey|quiz)\b/.test(t) ||
    /\b(form|questionnaire|intake|survey)\b/.test(content.slice(0, 400))
  ) {
    return "form";
  }
  if (
    /\b(calendar|spreadsheet|sheet|table)\b/.test(t) ||
    (content.includes("|") && content.split("\n").filter((l) => l.includes("|")).length >= 3)
  ) {
    return "sheet";
  }
  return "doc";
}

export function buildGoogleWorkspaceSession(input: {
  kind: GoogleFileKind;
  url: string;
  title: string;
  artifactType: string;
  content: string;
  fileId?: string;
}): GoogleWorkspaceSession | null {
  const fileId = input.fileId ?? googleFileIdFromUrl(input.url);
  if (!fileId) return null;
  return {
    kind: input.kind,
    fileId,
    url: input.url,
    embedUrl: googleEmbedUrl(input.kind, fileId),
    title: input.title,
    artifactType: input.artifactType,
    content: input.content,
  };
}

export function artifactReadyMessage(artifactType: string, title: string): string {
  const label = title.trim() || artifactType;
  return (
    `Your **${artifactType}** is ready — **${label}**.\n\n` +
    `Choose where you'd like to work with it. I recommend **Google Docs** (or Sheets for tables, Forms for questionnaires) so you can keep editing beside our chat.`
  );
}

export function formatGoogleWorkspaceEditHint(
  session: GoogleWorkspaceSession,
): string {
  return (
    `GOOGLE WORKSPACE MODE (ACTIVE — ${googleWorkspaceTitle(session.kind)} is visible beside chat):\n` +
    `- The user is continuing work in Google — NOT in Create.\n` +
    `- Document: **${session.title}** (${session.artifactType})\n` +
    `- Chat edits update the Google file automatically.\n` +
    `- Reply briefly ("Done.", "Moved.", "Added.") — the app syncs the file.\n` +
    `- Do NOT tell them to go back to Create or Saved Work.`
  );
}
