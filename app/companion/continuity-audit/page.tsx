"use client";

import { useMemo } from "react";
import {
  buildContinuityAuditRows,
  formatContinuityAuditTable,
} from "@/lib/continuityAudit";
import { buildContinuityManifest } from "@/lib/continuityManifest";

/** Developer-only continuity diagnostics — not linked in user navigation. */
export default function ContinuityAuditPage() {
  const manifest = useMemo(() => buildContinuityManifest(), []);
  const rows = useMemo(() => buildContinuityAuditRows(), []);

  if (process.env.NODE_ENV === "production") {
    return (
      <main className="mx-auto max-w-lg p-8 text-center text-[#6b635a]">
        Continuity audit is only available in development builds.
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-6 font-mono text-sm text-[#1f1c19]">
      <h1 className="mb-2 text-lg font-bold text-[#1e4f4f]">
        Continuity audit (dev)
      </h1>
      <p className="mb-4 text-xs text-[#6b635a]">
        Console: <code>window.__companionContinuityAudit()</code>
      </p>
      <p className="mb-4">
        Latest:{" "}
        {manifest.latest
          ? `${manifest.latest.title} (${manifest.latest.type}) @ ${manifest.latest.lastTouchedAt}`
          : "none"}
      </p>
      <table className="w-full border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-[#1e4f4f]/20">
            <th className="py-2 pr-2">Type</th>
            <th className="py-2 pr-2">Title</th>
            <th className="py-2 pr-2">Storage</th>
            <th className="py-2 pr-2">Touched</th>
            <th className="py-2 pr-2">Resume</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-[#1e4f4f]/10">
              <td className="py-2 pr-2 align-top">{r.type}</td>
              <td className="py-2 pr-2 align-top">{r.title}</td>
              <td className="py-2 pr-2 align-top break-all">{r.storageKey}</td>
              <td className="py-2 pr-2 align-top whitespace-nowrap">
                {r.lastTouchedAt}
              </td>
              <td className="py-2 pr-2 align-top">{r.resumeAction}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <pre className="mt-6 overflow-x-auto rounded-lg bg-[#f5f1ea] p-4 text-xs">
        {formatContinuityAuditTable()}
      </pre>
    </main>
  );
}
