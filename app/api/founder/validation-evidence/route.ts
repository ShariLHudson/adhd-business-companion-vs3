import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";
import { NextResponse } from "next/server";
import {
  FOUNDER_VALIDATION_EVIDENCE_ROOT,
  evidenceRelativePathForRun,
} from "@/lib/founderValidationMode";
import type { CertificationJourneyId } from "@/lib/createCertification";

/** Filesystem writes require Node — never Edge. */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SAFE_ID = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,127}$/;

function resolveUnderCwd(relativePosix: string): string | null {
  const cwd = process.cwd();
  const abs = resolve(cwd, ...relativePosix.split("/"));
  const root = resolve(cwd) + sep;
  if (abs !== resolve(cwd) && !abs.startsWith(root)) {
    return null;
  }
  return abs;
}

/**
 * Persist a journey evidence pack under docs/create-experience/evidence/.
 * Founder-admin only (proxy matcher /api/founder/*).
 * Local/dev writes only — keep the client download as the durable fallback.
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
    if (!journeyId || !runId || typeof json !== "string" || !json) {
      return NextResponse.json(
        { ok: false, error: "journeyId, runId, and json are required." },
        { status: 400 },
      );
    }
    if (!SAFE_ID.test(journeyId) || !SAFE_ID.test(runId)) {
      return NextResponse.json(
        { ok: false, error: "Invalid journeyId or runId." },
        { status: 400 },
      );
    }

    const relative = evidenceRelativePathForRun(journeyId, runId);
    if (
      !relative.startsWith(`${FOUNDER_VALIDATION_EVIDENCE_ROOT}/`) ||
      relative.includes("..")
    ) {
      return NextResponse.json({ ok: false, error: "Invalid path." }, { status: 400 });
    }

    const abs = resolveUnderCwd(relative);
    if (!abs) {
      return NextResponse.json({ ok: false, error: "Invalid path." }, { status: 400 });
    }

    await mkdir(dirname(abs), { recursive: true });
    await writeFile(abs, json, "utf8");

    // Refresh living dashboard snapshot for founders
    const dashPath = resolveUnderCwd(
      `${FOUNDER_VALIDATION_EVIDENCE_ROOT}/CERTIFICATION_DASHBOARD_FOUNDER_LIVE.md`,
    );
    if (dashPath) {
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
    }

    return NextResponse.json({ ok: true, path: relative });
  } catch (err) {
    const code =
      err && typeof err === "object" && "code" in err
        ? String((err as { code?: unknown }).code ?? "")
        : "";
    const message = err instanceof Error ? err.message : "Write failed.";
    return NextResponse.json(
      {
        ok: false,
        error: code ? `${message} (${code})` : message,
        hint:
          "Evidence was still downloaded in the browser. Server write needs a writable local docs/ folder (dev only).",
      },
      { status: 500 },
    );
  }
}
