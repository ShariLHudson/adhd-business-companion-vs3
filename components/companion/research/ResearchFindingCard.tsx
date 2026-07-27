"use client";

import {
  evidenceBasisLabel,
  findingMayShowCitation,
  type SharedResearchFinding,
} from "@/lib/research/types";
import { ResearchSourceList } from "./ResearchSourceList";

/**
 * The shared finding card — used identically by Client Avatar, Business Estate,
 * and the Research Library. Citation-style source cards and source-derived
 * quality labels render ONLY when findingMayShowCitation() is true (genuine
 * live/connected sources with complete metadata). Interpretation, built-in
 * guidance, and user-provided findings show a plain, honestly-labeled badge and
 * never a source card — even if sources were somehow attached to them.
 */
export function ResearchFindingCard({
  finding,
}: {
  finding: SharedResearchFinding;
}) {
  const mayCite = findingMayShowCitation(finding);
  const badgeClass = mayCite
    ? "border-[#1e4f4f]/30 bg-[#1e4f4f]/8 text-[#1e4f4f]"
    : "border-[#9a8f82]/30 bg-[#9a8f82]/12 text-[#6b635a]";

  return (
    <div
      className="rounded-xl border border-[#1e4f4f]/12 bg-white/80 px-3 py-2"
      data-testid="research-finding-card"
      data-evidence-basis={finding.evidenceBasis}
      data-may-cite={mayCite ? "true" : "false"}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${badgeClass}`}
          data-testid="research-finding-basis"
        >
          {evidenceBasisLabel(finding.evidenceBasis)}
        </span>
        {mayCite && finding.confidence ? (
          <span
            className="text-[11px] text-[#6b635a]"
            data-testid="research-finding-confidence"
          >
            Confidence: {finding.confidence}
          </span>
        ) : null}
        {mayCite && finding.freshness ? (
          <span className="text-[11px] text-[#6b635a]">· {finding.freshness}</span>
        ) : null}
        {mayCite && finding.verificationStatus ? (
          <span className="text-[11px] text-[#6b635a]">
            · {finding.verificationStatus.replace(/_/g, " ")}
          </span>
        ) : null}
      </div>

      {finding.title ? (
        <p className="mt-1 text-sm font-semibold text-[#2d2926]">
          {finding.title}
        </p>
      ) : null}
      <p className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed text-[#2d2926]">
        {finding.content}
      </p>

      {mayCite ? <ResearchSourceList sources={finding.sources} /> : null}
    </div>
  );
}
