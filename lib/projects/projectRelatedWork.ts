/**
 * Related work for Projects hub (Prompt 137 + 141).
 * Surfaces conversations / files / links / notes / Work / maps / evidence / wins
 * only from existing project hooks and trusted relationship edges.
 * Never invents links from similar titles.
 */

import { listProjectConversations } from "@/lib/projectConversations";
import { listUnifiedProjectFiles } from "@/lib/projectFiles";
import { listProjectLinks } from "@/lib/projectLinks";
import { listProjectAssetNotes } from "@/lib/projectAssets";
import { getBlueprint } from "@/lib/universalWorkEngine/blueprints/registry";
import { getWorkBlueprintState } from "@/lib/universalWorkEngine/blueprints/workBlueprintStateStore";
import { getWorkIdentity } from "@/lib/universalWorkEngine/identity/workIdentityStore";
import {
  listWorkRelationships,
  listWorkRelationshipsForTarget,
} from "@/lib/universalWorkEngine/cartography/workRelationships";
import type { WorkRelationship } from "@/lib/universalWorkEngine/types";

export type RelatedWorkSummary = {
  conversationTitles: string[];
  fileTitles: string[];
  linkTitles: string[];
  notePreviews: string[];
  /** Universal Work titles linked via part_of / related edges */
  workTitles: string[];
  /** Cartography / map node labels from trusted edges */
  mapTitles: string[];
  /** Strategy-origin Work titles (origin=strategies + project edge) */
  strategyTitles: string[];
  evidenceTitles: string[];
  winTitles: string[];
  hasAny: boolean;
};

function previewLine(text: string, max = 80): string {
  const t = text.trim().replace(/\s+/g, " ");
  if (!t) return "";
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

function titleForWork(workId: string): string {
  const state = getWorkBlueprintState(workId);
  if (state) {
    const bp = getBlueprint(state.blueprintId, state.blueprintVersion);
    return (
      state.sectionContent.purpose?.trim() ||
      state.sectionContent.event_type?.trim() ||
      state.knownContext.purpose?.trim() ||
      bp?.title ||
      workId
    );
  }
  return workId;
}

function uniquePreview(titles: string[], max = 5): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of titles) {
    const p = previewLine(t);
    if (!p || seen.has(p)) continue;
    seen.add(p);
    out.push(p);
    if (out.length >= max) break;
  }
  return out;
}

function collectFromProjectEdges(projectId: string): {
  workTitles: string[];
  mapTitles: string[];
  strategyTitles: string[];
  evidenceTitles: string[];
  winTitles: string[];
} {
  const projectEdges = listWorkRelationshipsForTarget({
    kind: "project",
    id: projectId,
  });

  const workTitles: string[] = [];
  const mapTitles: string[] = [];
  const strategyTitles: string[] = [];
  const evidenceTitles: string[] = [];
  const winTitles: string[] = [];

  for (const edge of projectEdges) {
    const workId = edge.fromWorkId;
    const title = titleForWork(workId);
    workTitles.push(title);

    const identity = getWorkIdentity(workId);
    if (identity?.origin === "strategies") {
      strategyTitles.push(title);
    }

    // Sibling edges on the same Work — maps / evidence / wins already linked
    const siblings: WorkRelationship[] = listWorkRelationships(workId);
    for (const s of siblings) {
      if (s.toRef.kind === "cartography_node") {
        mapTitles.push(s.note?.trim() || s.toRef.id);
      }
      if (s.toRef.kind === "evidence") {
        evidenceTitles.push(s.note?.trim() || s.toRef.id);
      }
      if (s.toRef.kind === "win" || s.toRef.kind === "accomplishment") {
        winTitles.push(s.note?.trim() || s.toRef.id);
      }
    }
  }

  return {
    workTitles: uniquePreview(workTitles),
    mapTitles: uniquePreview(mapTitles),
    strategyTitles: uniquePreview(strategyTitles),
    evidenceTitles: uniquePreview(evidenceTitles),
    winTitles: uniquePreview(winTitles),
  };
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
      workTitles: [],
      mapTitles: [],
      strategyTitles: [],
      evidenceTitles: [],
      winTitles: [],
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

  const fromEdges = collectFromProjectEdges(projectId);

  return {
    conversationTitles,
    fileTitles,
    linkTitles,
    notePreviews,
    workTitles: fromEdges.workTitles,
    mapTitles: fromEdges.mapTitles,
    strategyTitles: fromEdges.strategyTitles,
    evidenceTitles: fromEdges.evidenceTitles,
    winTitles: fromEdges.winTitles,
    hasAny:
      conversationTitles.length +
        fileTitles.length +
        linkTitles.length +
        notePreviews.length +
        fromEdges.workTitles.length +
        fromEdges.mapTitles.length +
        fromEdges.strategyTitles.length +
        fromEdges.evidenceTitles.length +
        fromEdges.winTitles.length >
      0,
  };
}
