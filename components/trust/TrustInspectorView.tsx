"use client";

import { useEffect, useMemo } from "react";
import {
  exposeTrustInspectorToWindow,
  getTrustAuditLog,
  getTrustInspectorSummary,
  getTrustTraitSnapshot,
  type TrustAuditEntry,
  type TrustTraitSnapshotItem,
} from "@/lib/intelligence-layer/trustInspector";

const TRAIT_ORDER = [
  "responds_to_suggestions",
  "ignores_generic_suggestions",
  "momentum_from_interventions",
  "disengages_from_nagging",
] as const;

function formatNum(value: number | null): string {
  if (value === null) return "—";
  return String(value);
}

function formatTime(at: string): string {
  try {
    return new Date(at).toLocaleString();
  } catch {
    return at;
  }
}

function formatTraitDeltas(entry: TrustAuditEntry): string {
  if (entry.traitDeltas.length === 0) return "None";
  return entry.traitDeltas.map((d) => `${d.path} changed`).join(", ");
}

function TraitEvidenceRow({
  entry,
}: {
  entry: TrustAuditEntry;
}) {
  return (
    <li className="text-[11px] text-[#6b635a]">
      {formatTime(entry.at)} · {entry.trustCategory} · offer={entry.offerKey ?? "—"} ·
      bucket={entry.interventionBucket ?? "—"} · evolve={String(entry.evolve)} ·{" "}
      {entry.reason}
    </li>
  );
}

function TraitCard({
  name,
  trait,
}: {
  name: string;
  trait: TrustTraitSnapshotItem;
}) {
  return (
    <article className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
      <h3 className="text-xs font-semibold text-[#1f1c19]">{name}</h3>
      <p className="mt-1 break-all text-[10px] text-[#6b635a]">{trait.path}</p>
      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] sm:grid-cols-3">
        <div>
          <dt className="text-[#6b635a]">Score</dt>
          <dd>{formatNum(trait.score)}</dd>
        </div>
        <div>
          <dt className="text-[#6b635a]">Confidence</dt>
          <dd>{formatNum(trait.confidence)}</dd>
        </div>
        <div>
          <dt className="text-[#6b635a]">Observations</dt>
          <dd>{trait.observations}</dd>
        </div>
        <div>
          <dt className="text-[#6b635a]">Status</dt>
          <dd className="font-medium">{trait.status}</dd>
        </div>
        <div className="col-span-2 sm:col-span-2">
          <dt className="text-[#6b635a]">Last updated</dt>
          <dd>{trait.lastUpdated ? formatTime(trait.lastUpdated) : "—"}</dd>
        </div>
      </dl>
      {trait.recentEvidence.length > 0 ? (
        <div className="mt-2 border-t border-[#ebe4d9] pt-2">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Recent evidence
          </p>
          <ul className="mt-1 space-y-1">
            {trait.recentEvidence.map((entry) => (
              <TraitEvidenceRow key={entry.id} entry={entry} />
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}

export function TrustInspectorView() {
  const summary = useMemo(() => getTrustInspectorSummary(), []);
  const traits = useMemo(() => getTrustTraitSnapshot(), []);
  const auditLog = useMemo(() => getTrustAuditLog({ limit: 50 }), []);

  useEffect(() => {
    exposeTrustInspectorToWindow();
  }, []);

  const blockedReasons = Object.entries(summary.blockedByReason).sort(
    (a, b) => b[1] - a[1],
  );

  return (
    <main className="mx-auto max-w-5xl p-4 pb-10 font-mono text-sm text-[#1f1c19] sm:p-6">
      <header className="mb-6 border-b border-[#1e4f4f]/20 pb-4">
        <h1 className="text-lg font-bold text-[#1e4f4f]">Trust Inspector</h1>
        <p className="mt-1 text-xs text-[#6b635a]">Read-only validation view</p>
        <p className="mt-2 text-[11px] text-[#6b635a]">
          Console:{" "}
          <code>window.__companionTrustInspector()</code>
        </p>
        <dl className="mt-3 flex flex-wrap gap-4 text-[11px]">
          <div>
            <dt className="text-[#6b635a]">Trust Inspector flag</dt>
            <dd className="font-semibold">
              {summary.trustInspectorEnabled ? "ON" : "OFF"}
            </dd>
          </div>
          <div>
            <dt className="text-[#6b635a]">Profile Learning flag</dt>
            <dd className="font-semibold">
              {summary.profileLearningEnabled ? "ON" : "OFF"}
            </dd>
          </div>
        </dl>
      </header>

      <section className="mb-6">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-[#1e4f4f]">
          Summary
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {(
            [
              ["Recorded", summary.recorded],
              ["Evolved", summary.evolved],
              ["Blocked", summary.blocked],
              ["Unknown Buckets", summary.unknownBuckets],
              ["System Caused", summary.systemCaused],
              ["Render Only", summary.renderOnly],
            ] as const
          ).map(([label, value]) => (
            <div
              key={label}
              className="rounded-lg border border-[#ebe4d9] bg-white p-3"
            >
              <p className="text-[10px] uppercase text-[#6b635a]">{label}</p>
              <p className="mt-1 text-xl font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-[#1e4f4f]">
          Blocked Reasons
        </h2>
        {blockedReasons.length === 0 ? (
          <p className="text-xs text-[#6b635a]">No blocked decisions recorded.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[#ebe4d9] bg-white">
            <table className="w-full min-w-[280px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[#1e4f4f]/20 bg-[#faf8f5]">
                  <th className="px-3 py-2 font-semibold">Reason</th>
                  <th className="px-3 py-2 font-semibold">Count</th>
                </tr>
              </thead>
              <tbody>
                {blockedReasons.map(([reason, count]) => (
                  <tr key={reason} className="border-b border-[#1e4f4f]/10">
                    <td className="px-3 py-2 align-top">{reason}</td>
                    <td className="px-3 py-2 align-top">{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-[#1e4f4f]">
          Trust Trait Snapshot
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {TRAIT_ORDER.map((key) => (
            <TraitCard key={key} name={key} trait={traits[key]} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-[#1e4f4f]">
          Audit Log (newest 50)
        </h2>
        {auditLog.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#d4cdc3] bg-[#faf8f5] p-4 text-xs text-[#6b635a]">
            <p>No trust audit entries yet.</p>
            <p className="mt-2">Enable:</p>
            <p className="mt-1">
              <code>companion-flag-trust-inspector = 1</code>
            </p>
            <p className="mt-2">
              Then trigger a tool suggestion offer, accept, or dismiss.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[#ebe4d9] bg-white">
            <table className="w-full min-w-[720px] border-collapse text-left text-[11px]">
              <thead>
                <tr className="border-b border-[#1e4f4f]/20 bg-[#faf8f5]">
                  <th className="px-2 py-2">Time</th>
                  <th className="px-2 py-2">Category</th>
                  <th className="px-2 py-2">Offer Key</th>
                  <th className="px-2 py-2">Bucket</th>
                  <th className="px-2 py-2">Causation</th>
                  <th className="px-2 py-2">Decision</th>
                  <th className="px-2 py-2">Reason</th>
                  <th className="px-2 py-2">Trait Deltas</th>
                </tr>
              </thead>
              <tbody>
                {auditLog.map((entry) => (
                  <tr key={entry.id} className="border-b border-[#1e4f4f]/10">
                    <td className="whitespace-nowrap px-2 py-2 align-top">
                      {formatTime(entry.at)}
                    </td>
                    <td className="px-2 py-2 align-top">{entry.trustCategory}</td>
                    <td className="px-2 py-2 align-top break-all">
                      {entry.offerKey ?? "—"}
                    </td>
                    <td className="px-2 py-2 align-top">
                      {entry.interventionBucket ?? "—"}
                    </td>
                    <td className="px-2 py-2 align-top">
                      {entry.causationType ?? "—"}
                    </td>
                    <td className="px-2 py-2 align-top">
                      {entry.evolve ? "evolved" : "blocked"}
                    </td>
                    <td className="px-2 py-2 align-top">{entry.reason}</td>
                    <td className="max-w-[200px] px-2 py-2 align-top break-words">
                      {formatTraitDeltas(entry)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
