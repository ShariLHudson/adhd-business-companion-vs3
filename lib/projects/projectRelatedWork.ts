/**
 * Infer related work from existing project hooks (Prompt 137).
 * No invented LIG UI — surfaces conversations / files / links already stored.
 */

import { listProjectConversations } from "@/lib/projectConversations";
import { listUnifiedProjectFiles } from "@/lib/projectFiles";
import { listProjectLinks } from "@/lib/projectLinks";
import { listProjectAssetNotes } from "@/lib/projectAssets";

export type RelatedWorkSummary = {
  conversationTitles: string[];
  fileTitles: string[];
  linkTitles: string[];
  notePreviews: string[];
  hasAny: boolean;
};

function previewLine(text: string, max = 80): string {
  const t = text.trim().replace(/\s+/g, " ");
  if (!t) return "";
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

export function summarizeRelatedProjectWork(
  projectId: string | null | undefined,
): RelatedWorkSummary {
  if (!projectId) {
    return {
      conversationTitles: [],
      fileTitles: [],
      linkTitles: [],
      notePreviews: [],
      hasAny: false,
    };
  }

  const conversationTitles = listProjectConversations(projectId)
    .slice(0, 5)
    .map((c) => previewLine(c.userPreview || c.assistantPreview) || "Conversation")
    .filter(Boolean);

  const fileTitles = listUnifiedProjectFiles(projectId)
    .slice(0, 5)
    .map((f) => f.title?.trim() || "File")
    .filter(Boolean);

  const linkTitles = listProjectLinks(projectId)
    .slice(0, 5)
    .map((l) => l.label?.trim() || l.url?.trim() || "Link")
    .filter(Boolean);

  const notePreviews = listProjectAssetNotes(projectId)
    .slice(0, 3)
    .map((n) => previewLine(n.title || n.body))
    .filter(Boolean);

  return {
    conversationTitles,
    fileTitles,
    linkTitles,
    notePreviews,
    hasAny:
      conversationTitles.length +
        fileTitles.length +
        linkTitles.length +
        notePreviews.length >
      0,
  };
}
