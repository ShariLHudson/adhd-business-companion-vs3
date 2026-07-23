"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { CertificationJourneyId } from "@/lib/createCertification";
import type { CertificationStatus, TestResultStatus } from "@/lib/createCertification/types";
import {
  CERTIFY_CONFIRMATION_PHRASE,
  STATUS_CHANGE_CONFIRMATION_PHRASE,
  applyApprovedOverlay,
  buildApprovalRecord,
  buildFounderValidationDashboard,
  canApproveStatusChange,
  emptyValidationStore,
  exportRunEvidenceJson,
  exportStoreSnapshotJson,
  finishJourneyRun,
  formatFounderValidationDashboardMarkdown,
  getJourneyDefinition,
  getJourneySuccessCriteria,
  getOverlay,
  listValidationJourneyIds,
  loadValidationStore,
  saveValidationStore,
  startJourneyRun,
  type FounderValidationStore,
  type JourneyRunRecord,
  type JourneyVerdict,
  type ScreenshotReference,
} from "@/lib/founderValidationMode";

type Phase = "overview" | "brief" | "running" | "record" | "approve";

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function statusTone(status: string): string {
  if (status === "CERTIFIED" || status === "PASS") return "text-[#1e4f4f]";
  if (status === "FAIL" || status === "BLOCKED") return "text-[#8b3a3a]";
  if (status === "NOT_RUN" || status === "NOT_STARTED") return "text-[#6b635a]";
  return "text-[#7a5c00]";
}

export function FounderValidationMode() {
  const [store, setStore] = useState<FounderValidationStore>(emptyValidationStore);
  const [hydrated, setHydrated] = useState(false);
  const [phase, setPhase] = useState<Phase>("overview");
  const [selectedId, setSelectedId] = useState<CertificationJourneyId>("J-001");
  const [activeRun, setActiveRun] = useState<JourneyRunRecord | null>(null);

  const [browserVerdict, setBrowserVerdict] = useState<JourneyVerdict>("not_run");
  const [emotionalVerdict, setEmotionalVerdict] =
    useState<JourneyVerdict>("not_run");
  const [notes, setNotes] = useState("");
  const [screenshotRef, setScreenshotRef] = useState("");
  const [screenshotCaption, setScreenshotCaption] = useState("");
  const [screenshots, setScreenshots] = useState<ScreenshotReference[]>([]);
  const [criteriaChecked, setCriteriaChecked] = useState<Record<string, boolean>>(
    {},
  );
  const [environment, setEnvironment] =
    useState<JourneyRunRecord["environment"]>("preview");

  const [approveBrowser, setApproveBrowser] = useState<TestResultStatus>("PASS");
  const [approveEmotional, setApproveEmotional] =
    useState<TestResultStatus>("PASS");
  const [approveCertification, setApproveCertification] =
    useState<CertificationStatus>("TESTING");
  const [confirmPhrase, setConfirmPhrase] = useState("");
  const [approvedBy, setApprovedBy] = useState("founder");
  const [gateError, setGateError] = useState<string | null>(null);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    const loaded = loadValidationStore();
    setStore(loaded);
    setHydrated(true);
  }, []);

  const persist = useCallback((next: FounderValidationStore) => {
    saveValidationStore(next);
    setStore(next);
  }, []);

  const journeyIds = listValidationJourneyIds();
  const definition = getJourneyDefinition(selectedId);
  const criteria = getJourneySuccessCriteria(selectedId);
  const overlay = getOverlay(store, selectedId);
  const dashboardRows = useMemo(
    () => buildFounderValidationDashboard(store),
    [store],
  );

  function selectJourney(id: CertificationJourneyId) {
    setSelectedId(id);
    setPhase("brief");
    setGateError(null);
    setSaveMsg(null);
  }

  function beginRun() {
    const { store: next, run } = startJourneyRun(store, selectedId, {
      environment,
    });
    persist(next);
    setActiveRun(run);
    setBrowserVerdict("not_run");
    setEmotionalVerdict("not_run");
    setNotes("");
    setScreenshots([]);
    setCriteriaChecked({});
    setPhase("running");
  }

  function addScreenshot() {
    const ref = screenshotRef.trim();
    if (!ref) return;
    setScreenshots((prev) => [
      ...prev,
      {
        id: `shot-${Date.now()}`,
        reference: ref,
        caption: screenshotCaption.trim(),
        addedAt: new Date().toISOString(),
      },
    ]);
    setScreenshotRef("");
    setScreenshotCaption("");
  }

  function goToRecord() {
    setPhase("record");
  }

  async function submitRun() {
    if (!activeRun) return;
    if (browserVerdict === "not_run") {
      setGateError("Record a browser pass/fail/blocked verdict before finishing.");
      return;
    }
    const next = finishJourneyRun(store, activeRun.id, {
      browserVerdict,
      emotionalVerdict,
      notes,
      screenshots,
      emotionalChecklist: activeRun.emotionalChecklist,
      criteriaChecked,
    });
    persist(next);
    const finished = next.runs.find((r) => r.id === activeRun.id);
    const nextOverlay = getOverlay(next, selectedId);
    if (finished) {
      downloadText(`${finished.id}.json`, exportRunEvidenceJson(finished));
      try {
        const res = await fetch("/api/founder/validation-evidence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            journeyId: finished.journeyId,
            runId: finished.id,
            json: exportRunEvidenceJson(finished),
          }),
        });
        if (res.ok) {
          setSaveMsg(
            "Evidence saved under docs/create-experience/evidence/ and downloaded.",
          );
        } else {
          setSaveMsg(
            "Downloaded evidence JSON. Server write skipped or failed — keep the download.",
          );
        }
      } catch {
        setSaveMsg("Downloaded evidence JSON (offline write).");
      }
    }
    setActiveRun(null);
    setApproveBrowser(nextOverlay.browser);
    setApproveEmotional(nextOverlay.emotional);
    setApproveCertification(nextOverlay.certification);
    setConfirmPhrase("");
    setPhase("approve");
    setGateError(null);
  }

  function submitApproval() {
    const proposed = {
      journeyId: selectedId,
      toBrowser: approveBrowser,
      toEmotional: approveEmotional,
      toCertification: approveCertification,
    };
    const gate = canApproveStatusChange(proposed, confirmPhrase);
    if (!gate.allowed) {
      setGateError(gate.blockers.join(" "));
      return;
    }
    const from = getOverlay(store, selectedId);
    const approval = buildApprovalRecord({
      journeyId: selectedId,
      approvedBy,
      confirmationPhrase: confirmPhrase,
      from,
      to: proposed,
    });
    const nextOverlay = {
      ...from,
      browser: proposed.toBrowser,
      emotional: proposed.toEmotional,
      certification: proposed.toCertification,
      updatedAt: new Date().toISOString(),
    };
    const next = applyApprovedOverlay(store, approval, nextOverlay);
    persist(next);
    downloadText(
      "founder-validation-dashboard.md",
      formatFounderValidationDashboardMarkdown(next),
    );
    setSaveMsg(
      "Status change approved. Dashboard snapshot downloaded. CERTIFIED only if you explicitly approved it.",
    );
    setPhase("overview");
    setGateError(null);
  }

  if (!hydrated) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#f5f0e8] text-[#6b635a]">
        Loading Founder Validation Mode…
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-[#f5f0e8] px-4 py-6 text-[#1f1c19]">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6b635a]">
              Founder only · not visible to members
            </p>
            <h1 className="text-2xl font-semibold">Founder Validation Mode</h1>
            <p className="mt-1 text-sm text-[#6b635a]">
              Architecture frozen. Record browser evidence for J-001–J-008 and
              TRUST. Never auto-CERTIFIED.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/founder"
              className="rounded-lg border border-[#d4cdc3] bg-white px-3 py-1.5 text-sm text-[#1e4f4f]"
            >
              Founder home
            </Link>
            <Link
              href="/companion"
              className="rounded-lg border border-[#1e4f4f] bg-[#1e4f4f] px-3 py-1.5 text-sm text-white"
              target="_blank"
            >
              Open Companion
            </Link>
          </div>
        </header>

        {saveMsg ? (
          <p className="mb-4 rounded-lg border border-[#1e4f4f]/30 bg-white px-3 py-2 text-sm text-[#1e4f4f]">
            {saveMsg}
          </p>
        ) : null}
        {gateError ? (
          <p className="mb-4 rounded-lg border border-[#8b3a3a]/40 bg-white px-3 py-2 text-sm text-[#8b3a3a]">
            {gateError}
          </p>
        ) : null}

        {phase === "overview" ? (
          <section className="space-y-4">
            <div className="rounded-2xl border border-[#d4cdc3] bg-white p-4 shadow-sm">
              <h2 className="text-lg font-semibold">Certification status</h2>
              <ul className="mt-3 space-y-2">
                {journeyIds.map((id) => {
                  const o = getOverlay(store, id);
                  const def = getJourneyDefinition(id);
                  return (
                    <li
                      key={id}
                      className="flex flex-wrap items-center justify-between gap-2 border-t border-[#ebe4d9] pt-2 first:border-0 first:pt-0"
                    >
                      <div>
                        <p className="font-medium">
                          {id} · {def?.name}
                        </p>
                        <p className="text-xs text-[#6b635a]">
                          Browser{" "}
                          <span className={statusTone(o.browser)}>{o.browser}</span>
                          {" · "}Emotional{" "}
                          <span className={statusTone(o.emotional)}>
                            {o.emotional}
                          </span>
                          {" · "}
                          <span className={statusTone(o.certification)}>
                            {o.certification}
                          </span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => selectJourney(id)}
                        className="rounded-md border border-[#d4cdc3] px-2 py-1 text-xs font-medium text-[#1e4f4f] hover:bg-[#f5f0e8]"
                      >
                        Validate
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="rounded-2xl border border-[#d4cdc3] bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">Living dashboard</h2>
                <button
                  type="button"
                  onClick={() =>
                    downloadText(
                      "CERTIFICATION_DASHBOARD_FOUNDER.md",
                      formatFounderValidationDashboardMarkdown(store),
                    )
                  }
                  className="text-xs font-medium text-[#1e4f4f] underline"
                >
                  Download dashboard
                </button>
              </div>
              <div className="mt-3 max-h-64 overflow-auto text-xs">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#ebe4d9] text-[#6b635a]">
                      <th className="py-1 pr-2">ID</th>
                      <th className="py-1 pr-2">Browser</th>
                      <th className="py-1 pr-2">UX</th>
                      <th className="py-1">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardRows
                      .filter((r) => r.capabilityId.startsWith("J-") || r.capabilityId === "TRUST")
                      .map((r) => (
                        <tr key={r.capabilityId} className="border-b border-[#f0ebe3]">
                          <td className="py-1 pr-2 font-medium">{r.capabilityId}</td>
                          <td className={`py-1 pr-2 ${statusTone(r.browser)}`}>
                            {r.browser}
                          </td>
                          <td className={`py-1 pr-2 ${statusTone(r.ux)}`}>{r.ux}</td>
                          <td className={`py-1 ${statusTone(r.certification)}`}>
                            {r.certification}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                className="mt-3 text-xs text-[#6b635a] underline"
                onClick={() =>
                  downloadText(
                    "founder-validation-store.json",
                    exportStoreSnapshotJson(store),
                  )
                }
              >
                Export full evidence store
              </button>
            </div>
          </section>
        ) : null}

        {phase === "brief" && definition ? (
          <section className="rounded-2xl border border-[#d4cdc3] bg-white p-5 shadow-sm">
            <button
              type="button"
              onClick={() => setPhase("overview")}
              className="text-xs text-[#1e4f4f] underline"
            >
              ← All journeys
            </button>
            <h2 className="mt-2 text-xl font-semibold">
              {definition.id} — {definition.name}
            </h2>
            <p className="mt-2 text-sm text-[#2d2926]">{definition.path}</p>
            <p className="mt-2 text-xs text-[#6b635a]">
              Library: {definition.library} · Current overlay: browser{" "}
              {overlay.browser}, emotional {overlay.emotional},{" "}
              {overlay.certification}
            </p>

            <h3 className="mt-5 text-sm font-semibold uppercase tracking-wide text-[#6b635a]">
              Success criteria (review before starting)
            </h3>
            <ul className="mt-2 space-y-2">
              {criteria.map((c) => (
                <li key={c.id} className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(criteriaChecked[c.id])}
                    onChange={(e) =>
                      setCriteriaChecked((prev) => ({
                        ...prev,
                        [c.id]: e.target.checked,
                      }))
                    }
                    className="mt-1"
                  />
                  <span>{c.label}</span>
                </li>
              ))}
            </ul>

            <label className="mt-4 block text-sm">
              Environment
              <select
                value={environment}
                onChange={(e) =>
                  setEnvironment(
                    e.target.value as JourneyRunRecord["environment"],
                  )
                }
                className="mt-1 w-full rounded-lg border border-[#d4cdc3] px-3 py-2"
              >
                <option value="local">Local</option>
                <option value="preview">Preview</option>
                <option value="production">Production</option>
                <option value="other">Other</option>
              </select>
            </label>

            <button
              type="button"
              onClick={beginRun}
              className="mt-5 w-full rounded-xl bg-[#1e4f4f] px-4 py-3 text-sm font-semibold text-white"
            >
              Start journey — one at a time
            </button>
          </section>
        ) : null}

        {phase === "running" && activeRun ? (
          <section className="rounded-2xl border border-[#d4cdc3] bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold">
              Running {activeRun.journeyId}
            </h2>
            <p className="mt-2 text-sm text-[#6b635a]">
              Execute the journey in Companion (authenticated). Capture notes and
              screenshot references here. Do not claim CERTIFIED from this step.
            </p>
            <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm">
              {criteria.map((c) => (
                <li key={c.id}>{c.label}</li>
              ))}
            </ol>
            <label className="mt-4 block text-sm">
              Notes
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="mt-1 w-full rounded-lg border border-[#d4cdc3] px-3 py-2"
                placeholder="What you observed…"
              />
            </label>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <input
                value={screenshotRef}
                onChange={(e) => setScreenshotRef(e.target.value)}
                placeholder="Screenshot path or URL"
                className="rounded-lg border border-[#d4cdc3] px-3 py-2 text-sm"
              />
              <input
                value={screenshotCaption}
                onChange={(e) => setScreenshotCaption(e.target.value)}
                placeholder="Caption"
                className="rounded-lg border border-[#d4cdc3] px-3 py-2 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={addScreenshot}
              className="mt-2 text-xs font-medium text-[#1e4f4f] underline"
            >
              Attach screenshot reference
            </button>
            {screenshots.length > 0 ? (
              <ul className="mt-2 space-y-1 text-xs text-[#6b635a]">
                {screenshots.map((s) => (
                  <li key={s.id}>
                    {s.reference}
                    {s.caption ? ` — ${s.caption}` : ""}
                  </li>
                ))}
              </ul>
            ) : null}
            <button
              type="button"
              onClick={goToRecord}
              className="mt-5 w-full rounded-xl bg-[#1e4f4f] px-4 py-3 text-sm font-semibold text-white"
            >
              Record pass / fail
            </button>
          </section>
        ) : null}

        {phase === "record" && activeRun ? (
          <section className="rounded-2xl border border-[#d4cdc3] bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold">Record results</h2>
            <fieldset className="mt-4">
              <legend className="text-sm font-semibold">Browser journey</legend>
              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                {(["pass", "fail", "blocked"] as const).map((v) => (
                  <label key={v} className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      name="browser"
                      checked={browserVerdict === v}
                      onChange={() => setBrowserVerdict(v)}
                    />
                    {v}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset className="mt-4">
              <legend className="text-sm font-semibold">Emotional quality</legend>
              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                {(["pass", "fail", "blocked", "not_run"] as const).map((v) => (
                  <label key={v} className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      name="emotional"
                      checked={emotionalVerdict === v}
                      onChange={() => setEmotionalVerdict(v)}
                    />
                    {v}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="mt-4 block text-sm">
              Final notes
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-[#d4cdc3] px-3 py-2"
              />
            </label>
            <button
              type="button"
              onClick={() => void submitRun()}
              className="mt-5 w-full rounded-xl bg-[#1e4f4f] px-4 py-3 text-sm font-semibold text-white"
            >
              Save evidence (does not CERTIFY)
            </button>
          </section>
        ) : null}

        {phase === "approve" ? (
          <section className="rounded-2xl border border-[#d4cdc3] bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold">Approve status change</h2>
            <p className="mt-2 text-sm text-[#6b635a]">
              Evidence is stored. Certification status only changes when you
              explicitly approve. CERTIFIED requires typing{" "}
              <code className="rounded bg-[#f5f0e8] px-1">
                {CERTIFY_CONFIRMATION_PHRASE}
              </code>
              .
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <label className="text-sm">
                Browser
                <select
                  value={approveBrowser}
                  onChange={(e) =>
                    setApproveBrowser(e.target.value as TestResultStatus)
                  }
                  className="mt-1 w-full rounded-lg border border-[#d4cdc3] px-2 py-2"
                >
                  {["PASS", "FAIL", "PARTIAL", "NOT_RUN"].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Emotional
                <select
                  value={approveEmotional}
                  onChange={(e) =>
                    setApproveEmotional(e.target.value as TestResultStatus)
                  }
                  className="mt-1 w-full rounded-lg border border-[#d4cdc3] px-2 py-2"
                >
                  {["PASS", "FAIL", "PARTIAL", "NOT_RUN"].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Certification
                <select
                  value={approveCertification}
                  onChange={(e) =>
                    setApproveCertification(
                      e.target.value as CertificationStatus,
                    )
                  }
                  className="mt-1 w-full rounded-lg border border-[#d4cdc3] px-2 py-2"
                >
                  {[
                    "TESTING",
                    "BLOCKED",
                    "NOT_CERTIFIED",
                    "CONDITIONALLY_CERTIFIED",
                    "CERTIFIED",
                    "NOT_STARTED",
                  ].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="mt-3 block text-sm">
              Approved by
              <input
                value={approvedBy}
                onChange={(e) => setApprovedBy(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#d4cdc3] px-3 py-2"
              />
            </label>
            <label className="mt-3 block text-sm">
              Confirmation phrase
              <input
                value={confirmPhrase}
                onChange={(e) => setConfirmPhrase(e.target.value)}
                placeholder={
                  approveCertification === "CERTIFIED"
                    ? CERTIFY_CONFIRMATION_PHRASE
                    : STATUS_CHANGE_CONFIRMATION_PHRASE
                }
                className="mt-1 w-full rounded-lg border border-[#d4cdc3] px-3 py-2 font-mono text-sm"
              />
            </label>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={submitApproval}
                className="rounded-xl bg-[#1e4f4f] px-4 py-3 text-sm font-semibold text-white"
              >
                Approve status change
              </button>
              <button
                type="button"
                onClick={() => setPhase("overview")}
                className="rounded-xl border border-[#d4cdc3] bg-white px-4 py-3 text-sm"
              >
                Skip approval (evidence kept, status unchanged)
              </button>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
