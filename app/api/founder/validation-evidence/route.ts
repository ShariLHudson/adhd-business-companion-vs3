import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import {
  FOUNDER_VALIDATION_EVIDENCE_ROOT,
  evidenceRelativePathForRun,
} from "@/lib/founderValidationMode";
import type { CertificationJourneyId } from "@/lib/createCertification";

/**
 * Persist a journey evidence pack under docs/create-experience/evidence/.
 * Founder-admin only (proxy matcher /api/founder/*).
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      journeyId?: string;
      runId?: string;
      json?: string;
    };
    const journeyId = body.journeyId?.trim() as CertificationJourneyId | undefined;
    const runId = body.runId?.trim();
    const json = body.json;
    if (!journeyId || !runId || !json) {
      return NextResponse.json(
        { ok: false, error: "journeyId, runId, and json are required." },
        { status: 400 },
      );
    }

    const relative = evidenceRelativePathForRun(journeyId, runId);
    if (!relative.startsWith(FOUNDER_VALIDATION_EVIDENCE_ROOT)) {
      return NextResponse.json({ ok: false, error: "Invalid path." }, { status: 400 });
    }

    const abs = path.join(process.cwd(), relative);
    await mkdir(path.dirname(abs), { recursive: true });
    await writeFile(abs, json, "utf8");

    // Refresh living dashboard snapshot for founders
    const dashPath = path.join(
      process.cwd(),
      FOUNDER_VALIDATION_EVIDENCE_ROOT,
      "CERTIFICATION_DASHBOARD_FOUNDER_LIVE.md",
    );
    // Dashboard markdown is regenerated client-side; leave a pointer file.
    await writeFile(
      dashPath,
      [
        "# Founder Validation — evidence index",
        "",
        `Last written: ${new Date().toISOString()}`,
        "",
        `Latest run file: \`${relative}\``,
        "",
        "Open Founder Validation Mode to regenerate the full living dashboard.",
        "CERTIFIED is never automatic — requires explicit founder approval.",
        "",
      ].join("\n"),
      "utf8",
    );

    return NextResponse.json({ ok: true, path: relative });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Write failed.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
