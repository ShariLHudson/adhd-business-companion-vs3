// Saved artifact record — active document in Create (backed by Saved Work storage).

import {
  savedWorkLocationLabel,
  savedWorkTypeFolder,
  type SavedWorkItem,
} from "./savedWorkStore";

export type SavedArtifactStatus = "draft" | "saved" | "exported";

export type SavedArtifactRecord = {
  artifactId: string;
  artifactType: string;
  artifactTitle: string;
  savedStatus: SavedArtifactStatus;
  /** Human label, e.g. "Saved Work" */
  savedLocation: string;
  /** e.g. Saved Work > SOPs */
  savedLocationDetail: string;
  savedWorkId?: string;
  /** @deprecated use savedWorkId — legacy template saves */
  templateId?: string;
  projectId?: string;
  projectName?: string;
  projectLocation?: string;
  savedAt?: string;
  lastEdited?: string;
  googleDocId?: string;
  googleDocUrl?: string;
  sourceWorkspace?: string;
  /** Content fingerprint at last save — export guard */
  contentHash?: string;
};

const SAVED_DOC_RE =
  /\b(?:where is (?:my |the )?(?:saved )?(?:document|draft|proposal|sop|file|work)|where did (?:it|this|my (?:document|draft|proposal|sop)) save|show (?:my )?(?:saved )?(?:document|draft|proposal|sop|work)|find my (?:proposal|sop|document)|open (?:my )?saved work|where(?:'s| is) my (?:saved )?(?:document|proposal|sop))\b/i;

const GOOGLE_DOC_LOCATION_RE =
  /\b(?:where is (?:my )?google doc|show (?:my )?google doc|open (?:my )?google doc)\b/i;

const GOOGLE_DOC_CREATE_RE =
  /\b(?:create (?:a |the )?google doc(?: now)?|make (?:a )?google doc|open (?:the )?google doc)\b/i;

const PRINT_RE =
  /\b(?:print (?:this|it|the (?:document|draft|proposal|sop))|open print|print the sop)\b/i;

const SAVE_AGAIN_RE =
  /\b(?:save (?:it )?again|update saved|save another copy)\b/i;

const SHOW_LOCATION_RE =
  /\b(?:show (?:me )?(?:the )?(?:saved )?location|where (?:is it|did it go)|where is this saved)\b/i;

const ADD_TO_PROJECT_RE =
  /\badd (?:this|it) to (?:my )?(?:the )?(.+?) project\b/i;

export function emptySavedArtifact(
  artifactType: string,
  artifactTitle: string,
): SavedArtifactRecord {
  return {
    artifactId: `draft-${Date.now()}`,
    artifactType,
    artifactTitle: artifactTitle || "Untitled",
    savedStatus: "draft",
    savedLocation: "Create",
    savedLocationDetail: "Create (not saved yet)",
    sourceWorkspace: "content-generator",
  };
}

export function hashArtifactContent(content: string): string {
  const t = content.trim();
  if (!t) return "";
  return `${t.length}:${t.slice(0, 64)}:${t.slice(-64)}`;
}

export function artifactContentMatches(
  record: SavedArtifactRecord | null | undefined,
  draft: string,
): boolean {
  if (!record?.contentHash) return true;
  return record.contentHash === hashArtifactContent(draft);
}

export function validateArtifactForExport(
  record: SavedArtifactRecord | null | undefined,
  draft: string,
  title: string,
): string | null {
  if (!draft.trim()) return "Nothing to export — the draft is empty.";
  if (!record) return null;
  if (
    record.savedStatus === "saved" &&
    record.artifactTitle &&
    title.trim() &&
    record.artifactTitle !== title.trim()
  ) {
    return "Title changed since last save — click **Save Again** before exporting.";
  }
  if (!artifactContentMatches(record, draft)) {
    return "Draft changed since last save — click **Save Again** to sync before exporting.";
  }
  return null;
}

export function formatSavedAt(iso?: string): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return null;
  }
}

export function formatSavedArtifactLocation(record: SavedArtifactRecord): string {
  const parts = [record.savedLocationDetail || record.savedLocation];
  if (record.projectName) {
    parts.push(`Project: ${record.projectName}`);
  }
  return parts.join(" · ");
}

export function formatSavedArtifactForPrompt(
  record: SavedArtifactRecord | null | undefined,
): string | undefined {
  if (!record) return undefined;
  const lines = [
    "SAVED ARTIFACT (answer location questions from this — Create stays open beside chat):",
    `- Type: ${record.artifactType}`,
    `- Title: ${record.artifactTitle}`,
    `- Status: ${record.savedStatus === "exported" ? "Exported" : record.savedStatus === "saved" ? "Saved" : "Draft"}`,
    `- Saved in: ${formatSavedArtifactLocation(record)}`,
    `- Saved Work ID: ${record.savedWorkId ?? record.artifactId}`,
  ];
  const at = formatSavedAt(record.lastEdited ?? record.savedAt);
  if (at) lines.push(`- Last saved: ${at}`);
  if (record.projectName) {
    lines.push(`- Project: ${record.projectName}`);
  } else {
    lines.push("- Project: not added yet — offer Add to Project if they want it linked.");
  }
  if (record.googleDocUrl) {
    lines.push(`- Google Doc URL: ${record.googleDocUrl}`);
    lines.push(
      "  When asked about the Google Doc, say it was created and share the link above.",
    );
  } else {
    lines.push(
      "- Google Doc: not created yet — user can click **Create Google Doc** in the Create panel.",
    );
  }
  lines.push(
    "Do NOT say work disappeared. Export buttons remain above the draft after save.",
    "Do NOT claim a Google Doc exists unless googleDocUrl is set.",
    "Templates are reusable patterns; this item lives in **Saved Work**, not Templates.",
  );
  return lines.join("\n");
}

export function isSavedDocumentRecoveryRequest(text: string): boolean {
  return SAVED_DOC_RE.test(text.trim());
}

export function isGoogleDocLocationRequest(text: string): boolean {
  return GOOGLE_DOC_LOCATION_RE.test(text.trim());
}

export function parseAddToProjectRequest(
  text: string,
): { projectName: string } | null {
  const m = text.trim().match(ADD_TO_PROJECT_RE);
  if (!m?.[1]) return null;
  return { projectName: m[1].trim() };
}

export function detectArtifactWorkspaceCommand(
  text: string,
):
  | "google-doc"
  | "google-doc-location"
  | "print"
  | "save-again"
  | "show-location"
  | "add-to-project"
  | null {
  const t = text.trim().toLowerCase();
  if (!t) return null;
  if (parseAddToProjectRequest(t)) return "add-to-project";
  if (GOOGLE_DOC_LOCATION_RE.test(t)) return "google-doc-location";
  if (GOOGLE_DOC_CREATE_RE.test(t)) return "google-doc";
  if (PRINT_RE.test(t)) return "print";
  if (SAVE_AGAIN_RE.test(t)) return "save-again";
  if (SHOW_LOCATION_RE.test(t) || SAVED_DOC_RE.test(t)) return "show-location";
  return null;
}

export function buildGoogleDocRecoveryMessage(
  record: SavedArtifactRecord | null | undefined,
): string {
  if (record?.googleDocUrl) {
    return `Your Google Doc is in Google Drive: [Open Google Doc](${record.googleDocUrl})`;
  }
  return (
    "No Google Doc yet for this piece — click **Create Google Doc** above the draft, " +
    "or ask me to create it now."
  );
}

export function buildSavedArtifactRecoveryMessage(
  record: SavedArtifactRecord | null | undefined,
  draftOpen: boolean,
): string {
  if (!record) {
    return draftOpen
      ? "Your **Create** workspace is open beside you — your draft is in the panel on the right."
      : "I'm reopening **Create** beside you now.";
  }

  const loc = record.savedLocationDetail || record.savedLocation;
  const projectNote = record.projectName
    ? `It is linked to project **${record.projectName}**.`
    : "It has not been added to a project yet. Would you like to add it now?";

  let msg =
    `Your **${record.artifactType}** “${record.artifactTitle}” is saved in **${loc}**. ` +
    `${projectNote} It's still open in **Create** beside you — use **Create Google Doc**, **Print**, or **Where Is This Saved?** above the draft.`;

  if (record.googleDocUrl) {
    msg += `\n\nYour Google Doc: [Open Google Doc](${record.googleDocUrl})`;
  }

  const at = formatSavedAt(record.lastEdited ?? record.savedAt);
  if (at && record.savedStatus !== "draft") {
    msg += `\n\nLast updated ${at}.`;
  }

  return msg;
}

export function recordFromSavedWork(item: SavedWorkItem): SavedArtifactRecord {
  return {
    artifactId: item.id,
    artifactType: item.artifactType,
    artifactTitle: item.title,
    savedStatus:
      item.status === "exported"
        ? "exported"
        : item.status === "saved"
          ? "saved"
          : "draft",
    savedLocation: "My Work",
    savedLocationDetail: item.savedLocation,
    savedWorkId: item.id,
    projectId: item.projectId,
    projectName: item.projectName,
    projectLocation: item.projectName
      ? `Project: ${item.projectName}`
      : undefined,
    googleDocId: item.googleDocId,
    googleDocUrl: item.googleDocUrl,
    savedAt: item.updatedAt,
    lastEdited: item.updatedAt,
    sourceWorkspace: item.sourceWorkspace,
    contentHash: hashArtifactContent(item.body),
  };
}

export function recordAfterSavedWorkSave(
  prev: SavedArtifactRecord | null,
  artifactType: string,
  artifactTitle: string,
  savedWorkId: string,
  draftContent: string,
): SavedArtifactRecord {
  const now = new Date().toISOString();
  const folder = savedWorkTypeFolder(artifactType);
  return {
    artifactId: savedWorkId,
    artifactType,
    artifactTitle,
    savedStatus: "saved",
    savedLocation: "My Work",
    savedLocationDetail: savedWorkLocationLabel(folder, artifactTitle),
    savedWorkId,
    projectId: prev?.projectId,
    projectName: prev?.projectName,
    projectLocation: prev?.projectLocation,
    googleDocId: prev?.googleDocId,
    googleDocUrl: prev?.googleDocUrl,
    savedAt: now,
    lastEdited: now,
    sourceWorkspace: prev?.sourceWorkspace ?? "content-generator",
    contentHash: hashArtifactContent(draftContent),
  };
}

/** @deprecated use recordAfterSavedWorkSave */
export function recordAfterTemplateSave(
  prev: SavedArtifactRecord | null,
  artifactType: string,
  artifactTitle: string,
  savedWorkId: string,
  _isUpdate: boolean,
  draftContent = "",
): SavedArtifactRecord {
  return recordAfterSavedWorkSave(
    prev,
    artifactType,
    artifactTitle,
    savedWorkId,
    draftContent,
  );
}

export function recordAfterProjectLink(
  prev: SavedArtifactRecord,
  projectId: string,
  projectName: string,
): SavedArtifactRecord {
  return {
    ...prev,
    projectId,
    projectName,
    projectLocation: `Project: ${projectName}`,
    savedLocationDetail: `${prev.savedLocationDetail} · Project: ${projectName}`,
    lastEdited: new Date().toISOString(),
  };
}

export function recordAfterGoogleDoc(
  prev: SavedArtifactRecord,
  url: string,
  docId?: string,
): SavedArtifactRecord {
  return {
    ...prev,
    savedStatus: "exported",
    googleDocUrl: url,
    googleDocId: docId,
    savedAt: prev.savedAt ?? new Date().toISOString(),
    lastEdited: new Date().toISOString(),
  };
}
