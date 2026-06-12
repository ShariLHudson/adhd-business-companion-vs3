"use client";

import { useEffect, useMemo, useState } from "react";

import type { FounderWorkspaceData } from "../types";
import {
  loadIntelligenceStore,
  recordProjectEdited,
  recordProjectViewed,
  saveIntelligenceStore,
} from "./intelligenceStore";
import {
  analyzeAllProjects,
  buildIntelligenceDashboard,
  sortProjectAnalyses,
} from "./projectIntelligence";
import { syncIssuesFromWorkspace } from "./projectIssues";
import { syncOpportunitiesFromWorkspace } from "./projectOpportunities";
import { syncRelationshipsFromWorkspace } from "./projectRelationships";
import type { ProjectIntelligence, ProjectSortKey } from "./types";

export function useProjectIntelligence(
  data: FounderWorkspaceData | null,
  focusedProjectId: string | null,
) {
  const [store, setStore] = useState(loadIntelligenceStore);
  const [sortKey, setSortKey] = useState<ProjectSortKey>("priority");

  useEffect(() => {
    if (!data) return;
    setStore((prev) => {
      let next = { ...prev };
      next.issues = syncIssuesFromWorkspace(next.issues, data);
      next.opportunities = syncOpportunitiesFromWorkspace(
        next.opportunities,
        data,
      );
      next.links = syncRelationshipsFromWorkspace(next.links, data);
      saveIntelligenceStore(next);
      return next;
    });
  }, [data]);

  useEffect(() => {
    if (!focusedProjectId) return;
    setStore((prev) => {
      const next = recordProjectViewed(prev, focusedProjectId);
      saveIntelligenceStore(next);
      return next;
    });
  }, [focusedProjectId]);

  const analyses = useMemo(() => {
    if (!data) return [] as ProjectIntelligence[];
    return sortProjectAnalyses(
      analyzeAllProjects(data, store),
      sortKey,
    );
  }, [data, store, sortKey]);

  const dashboard = useMemo(
    () => buildIntelligenceDashboard(analyses, store),
    [analyses, store],
  );

  const analysisByProjectId = useMemo(() => {
    const map = new Map<string, ProjectIntelligence>();
    for (const a of analyses) map.set(a.project.id, a);
    return map;
  }, [analyses]);

  function markProjectEdited(projectId: string) {
    setStore((prev) => {
      const next = recordProjectEdited(prev, projectId);
      saveIntelligenceStore(next);
      return next;
    });
  }

  return {
    analyses,
    dashboard,
    analysisByProjectId,
    sortKey,
    setSortKey,
    markProjectEdited,
  };
}
