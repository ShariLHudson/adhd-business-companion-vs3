"use client";

import { useCallback, useState } from "react";

import {
  experimentFromIssue,
  loadFounderTracking,
  markIssueReadyForRetest,
  removeExperiment,
  removeIssue,
  retestIssueFail,
  retestIssuePass,
  saveFounderTracking,
  upsertExperiment,
  upsertIssue,
  type FounderExperimentInput,
  type FounderIssueInput,
} from "./store";
import type { FounderTrackingData } from "./types";

export function useFounderTracking() {
  const [data, setData] = useState<FounderTrackingData>(loadFounderTracking);

  const persist = useCallback(
    (updater: (prev: FounderTrackingData) => FounderTrackingData) => {
      setData((prev) => {
        const next = updater(prev);
        saveFounderTracking(next);
        return next;
      });
    },
    [],
  );

  return {
    data,
    upsertIssue: (input: FounderIssueInput) =>
      persist((prev) => upsertIssue(prev, input)),
    upsertExperiment: (input: FounderExperimentInput) =>
      persist((prev) => upsertExperiment(prev, input)),
    removeIssue: (id: string) => persist((prev) => removeIssue(prev, id)),
    removeExperiment: (id: string) =>
      persist((prev) => removeExperiment(prev, id)),
    markReadyForRetest: (id: string) =>
      persist((prev) => markIssueReadyForRetest(prev, id)),
    retestPass: (id: string) => persist((prev) => retestIssuePass(prev, id)),
    retestFail: (id: string) => persist((prev) => retestIssueFail(prev, id)),
    createExperimentFromIssue: (issueId: string) => {
      let created: FounderExperimentInput | null = null;
      persist((prev) => {
        const issue = prev.issues.find((i) => i.id === issueId);
        if (!issue) return prev;
        created = experimentFromIssue(issue);
        return upsertExperiment(prev, created);
      });
      return created;
    },
  };
}
