import { NextRequest, NextResponse } from "next/server";

import {
  incrementEcosystemSignals,
  loadEcosystemSignalCounts,
  reconcileEcosystemSignals,
  sanitizeSignalIncrements,
  type EcosystemSignalCount,
} from "@/lib/ecosystem/serverSignalStore";
import { isGhlDashboardAuthorized } from "@/lib/ghl/auth";

type IncrementBody = {
  mode?: "increment";
  signals?: { kind: string; category: string }[];
};

type ReconcileBody = {
  mode: "reconcile";
  counts?: EcosystemSignalCount[];
};

function parseReconcileCounts(raw: unknown): EcosystemSignalCount[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const r = row as Record<string, unknown>;
      const kind = typeof r.kind === "string" ? r.kind : "";
      const category = typeof r.category === "string" ? r.category : "";
      const count = typeof r.count === "number" ? r.count : 0;
      const lastSeen =
        typeof r.lastSeen === "string" ? r.lastSeen : new Date().toISOString();
      if (!kind || !category || count < 1) return null;
      return { kind, category, count, lastSeen } as EcosystemSignalCount;
    })
    .filter((r): r is EcosystemSignalCount => r !== null);
}

/** Ingest categorized signals from the companion app (no conversation text). */
export async function POST(request: NextRequest) {
  let body: IncrementBody | ReconcileBody;
  try {
    body = (await request.json()) as IncrementBody | ReconcileBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (body.mode === "reconcile") {
    const counts = parseReconcileCounts(body.counts);
    if (!counts.length) {
      return NextResponse.json({ ok: true, reconciled: 0 });
    }
    await reconcileEcosystemSignals(counts);
    return NextResponse.json({ ok: true, reconciled: counts.length });
  }

  const signals = sanitizeSignalIncrements(
    (body.signals ?? []).map((s) => ({
      kind: s.kind as EcosystemSignalCount["kind"],
      category: s.category,
    })),
  );
  if (!signals.length) {
    return NextResponse.json({ error: "No valid signals." }, { status: 400 });
  }

  await incrementEcosystemSignals(signals);
  return NextResponse.json({ ok: true, recorded: signals.length });
}

/** Founder / dashboard read — requires auth. */
export async function GET(request: NextRequest) {
  if (!(await isGhlDashboardAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const counts = await loadEcosystemSignalCounts();
  return NextResponse.json({ counts, generatedAt: new Date().toISOString() });
}
