import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { NextResponse } from "next/server";
import { evidenceRelativePathForRun } from "@/lib/founderValidationMode";
import type { CertificationJourneyId } from "@/lib/createCertification";

/** Filesystem writes require Node — never Edge. */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SAFE_ID = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,127}$/;

/**
 * Build absolute paths with *static* path segments only.
 * Avoid `resolve(process.cwd(), ...dynamicParts)` — webpack treats that as a
 * project-root context (`/ROOT/` matching thousands of files).
 */
function evidenceRunAbsPath(journeyId: string, runId: string): string {
  return join(
    process.cwd(),
    "docs",
    "create-experience",
    "evidence",
    "runs",
    journeyId,
    `${runId}.json`,
  );
}

function evidenceDashboardAbsPath(): string {
  return join(
    process.cwd(),
    "docs",
    "create-experience",
    "evidence",
    "CERTIFICATION_DASHBOARD_FOUNDER_LIVE.md",
  );
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
    const abs = evidenceRunAbsPath(journeyId, runId);

    await mkdir(dirname(abs), { recursive: true });
    await writeFile(abs, json, "utf8");

    await writeFile(
      evidenceDashboardAbsPath(),
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
