"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { BrainDumpEntry } from "@/lib/companionStore";
import {
  buildBrainDumpClusterGraph,
  clusterReliefAcknowledgement,
  formatClusterDotWeight,
} from "@/lib/brainDumpClusterModel";

const ACK_DISMISS_MS = 5000;

export function ClearMyMindReliefClusters({
  entries,
}: {
  entries: BrainDumpEntry[];
}) {
  const graph = useMemo(() => buildBrainDumpClusterGraph(entries), [entries]);
  const [activeClusterId, setActiveClusterId] = useState<string | null>(null);

  const toggleCluster = useCallback((clusterId: string) => {
    setActiveClusterId((prev) => (prev === clusterId ? null : clusterId));
  }, []);

  useEffect(() => {
    if (!activeClusterId) return;
    const timer = window.setTimeout(
      () => setActiveClusterId(null),
      ACK_DISMISS_MS,
    );
    return () => window.clearTimeout(timer);
  }, [activeClusterId]);

  if (!graph.hasContent) {
    return (
      <p className="text-sm text-[#6b635a]" role="status">
        Everything is captured.
      </p>
    );
  }

  return (
    <div
      className="rounded-2xl border border-[#e7dfd4] bg-[#faf7f2]/80 p-4 sm:p-5"
      role="region"
      aria-label="Thought clusters"
      data-testid="clear-my-mind-relief-clusters"
    >
      <p className="text-lg font-semibold leading-snug text-[#1f1c19]">
        Everything is held.
      </p>

      <ul className="mt-4 flex flex-col gap-2.5" role="list">
        {graph.clusters.map((cluster) => {
          const { dots, suffix } = formatClusterDotWeight(cluster.count);
          const isActive = activeClusterId === cluster.id;
          const thoughtLabel =
            cluster.count === 1 ? "1 thought" : `${cluster.count} thoughts`;

          return (
            <li key={cluster.id}>
              <button
                type="button"
                onClick={() => toggleCluster(cluster.id)}
                aria-expanded={isActive}
                aria-label={`${cluster.label}, ${thoughtLabel}`}
                className={`w-full rounded-xl border-2 px-4 py-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e4f4f]/35 ${
                  isActive
                    ? "border-[#1e4f4f]/35 bg-white shadow-sm"
                    : "border-transparent bg-white/75 hover:bg-white"
                }`}
              >
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="text-base font-semibold text-[#1f1c19]">
                    <span aria-hidden="true">{cluster.icon} </span>
                    {cluster.label}
                  </span>
                  <span
                    className="text-sm tracking-[0.2em] text-[#7c7468]"
                    aria-hidden="true"
                  >
                    {dots}
                    {suffix ? (
                      <span className="ml-1.5 tracking-normal text-[#9a8f82]">
                        {suffix}
                      </span>
                    ) : null}
                  </span>
                </div>
                {isActive ? (
                  <p
                    className="companion-fade-in mt-2 text-sm leading-relaxed text-[#1e4f4f]"
                    role="status"
                    aria-live="polite"
                  >
                    {clusterReliefAcknowledgement(cluster.count)}
                  </p>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-sm text-[#6b635a]">Everything is captured.</p>
    </div>
  );
}
