"use client";

import { useState } from "react";
import type { ThoughtCluster } from "@/lib/brainDumpClusterModel";
import {
  mergeClusters,
  renameCluster,
  type ClusterOverrides,
} from "@/lib/brainDumpClusterPreferences";

const INPUT_CLASS =
  "mt-1 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-sm text-[#1f1c19] outline-none focus:border-[#1e4f4f]";

const BTN =
  "rounded-lg border border-[#c9bfb0] px-3 py-1.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/5";

export function ClusterManagementMenu({
  cluster,
  allClusters,
  onOverridesChange,
  onConvertProject,
  onConvertGoal,
}: {
  cluster: ThoughtCluster;
  allClusters: ThoughtCluster[];
  onOverridesChange: (overrides: ClusterOverrides) => void;
  onConvertProject: () => void;
  onConvertGoal: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(cluster.label);
  const [mergeTarget, setMergeTarget] = useState("");

  if (cluster.id === "__more__") return null;

  const mergeOptions = allClusters.filter(
    (c) => c.id !== cluster.id && c.id !== "__more__",
  );

  function applyRename() {
    const next = renameCluster(cluster.id, renameValue);
    onOverridesChange(next);
    setOpen(false);
  }

  function applyMerge() {
    if (!mergeTarget) return;
    const next = mergeClusters(cluster.id, mergeTarget);
    onOverridesChange(next);
    setMergeTarget("");
    setOpen(false);
  }

  return (
    <div className="mt-3 border-t border-[#efe8de] pt-3" data-testid="cluster-management-menu">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={BTN}
        data-testid="cluster-manage-toggle"
      >
        {open ? "Hide cluster options" : "Manage cluster"}
      </button>

      {open ? (
        <div className="mt-3 space-y-3">
          <label className="block text-sm font-semibold text-[#1f1c19]">
            Rename cluster
            <input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className={INPUT_CLASS}
              data-testid="cluster-rename-input"
            />
          </label>
          <button type="button" onClick={applyRename} className={BTN}>
            Save name
          </button>

          {mergeOptions.length > 0 ? (
            <label className="block text-sm font-semibold text-[#1f1c19]">
              Merge into
              <select
                value={mergeTarget}
                onChange={(e) => setMergeTarget(e.target.value)}
                className={INPUT_CLASS}
                data-testid="cluster-merge-select"
              >
                <option value="">Select cluster…</option>
                {mergeOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {mergeTarget ? (
            <button type="button" onClick={applyMerge} className={BTN}>
              Merge clusters
            </button>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onConvertProject}
              className={BTN}
              data-testid="cluster-convert-project"
            >
              Convert to project
            </button>
            <button
              type="button"
              onClick={onConvertGoal}
              className={BTN}
              data-testid="cluster-convert-goal"
            >
              Convert to goal
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
