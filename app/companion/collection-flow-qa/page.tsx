"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  clearCollectionPendingOffer,
  clearAllCollectionPrefills,
  markCollectionOfferCooldown,
  peekCollectionOfferCooldownTurn,
} from "@/lib/estate/collectionFramework";
import {
  clearManualQaChecks,
  COLLECTION_FLOW_DESIGN_RULES,
  COLLECTION_FLOW_QA_CHECKLIST,
  formatCollectionFlowQaReport,
  loadManualQaChecks,
  runCollectionFlowAutomatedChecks,
  saveManualQaCheck,
  type CollectionFlowAutomatedCheck,
} from "@/lib/estate/collectionFramework/collectionFlowQa";
import "./collection-flow-qa.css";

declare global {
  interface Window {
    __collectionFlowQa?: () => string;
    __runCollectionFlowAutomatedChecks?: typeof runCollectionFlowAutomatedChecks;
  }
}

export default function CollectionFlowQaPage() {
  const [automated, setAutomated] = useState<CollectionFlowAutomatedCheck[]>(
    () => runCollectionFlowAutomatedChecks(),
  );
  const [manual, setManual] = useState<Record<string, boolean>>({});
  const [copyNote, setCopyNote] = useState<string | null>(null);
  const cooldownTurn = peekCollectionOfferCooldownTurn();

  useEffect(() => {
    setManual(loadManualQaChecks());
    window.__collectionFlowQa = () => formatCollectionFlowQaReport(automated);
    window.__runCollectionFlowAutomatedChecks = runCollectionFlowAutomatedChecks;
    return () => {
      delete window.__collectionFlowQa;
      delete window.__runCollectionFlowAutomatedChecks;
    };
  }, [automated]);

  const automatedByChecklist = useMemo(() => {
    const map = new Map<string, CollectionFlowAutomatedCheck>();
    for (const row of automated) {
      if (row.checklistId) map.set(row.checklistId, row);
    }
    return map;
  }, [automated]);

  const manualDone = COLLECTION_FLOW_QA_CHECKLIST.filter((item) => manual[item.id])
    .length;
  const autoPassed = automated.filter((row) => row.passed).length;

  const rerunAutomated = useCallback(() => {
    setAutomated(runCollectionFlowAutomatedChecks());
  }, []);

  function toggleManual(id: string, checked: boolean) {
    saveManualQaCheck(id, checked);
    setManual(loadManualQaChecks());
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyNote("Copied to clipboard");
      window.setTimeout(() => setCopyNote(null), 1800);
    } catch {
      setCopyNote("Could not copy — select the text manually");
    }
  }

  function resetSession() {
    clearCollectionPendingOffer();
    clearAllCollectionPrefills();
    markCollectionOfferCooldown(9999);
    clearManualQaChecks();
    setManual({});
    rerunAutomated();
    setCopyNote("QA session reset (pending offer, prefill, manual checks, cooldown)");
    window.setTimeout(() => setCopyNote(null), 2200);
  }

  if (process.env.NODE_ENV === "production") {
    return (
      <main className="collection-flow-qa collection-flow-qa--blocked">
        <p>Collection Flow QA is only available in development builds.</p>
      </main>
    );
  }

  return (
    <main className="collection-flow-qa">
      <header className="collection-flow-qa__header">
        <div>
          <p className="collection-flow-qa__kicker">Dev only</p>
          <h1 className="collection-flow-qa__title">Collection Flow QA</h1>
          <p className="collection-flow-qa__lead">
            Quick checklist for chat → permission → room → draft → save → browse.
            Route: <code>/companion/collection-flow-qa</code>
          </p>
        </div>
        <div className="collection-flow-qa__header-actions">
          <Link href="/companion" className="collection-flow-qa__link">
            Open Companion
          </Link>
          <button
            type="button"
            className="collection-flow-qa__btn collection-flow-qa__btn--ghost"
            onClick={resetSession}
          >
            Reset QA session
          </button>
        </div>
      </header>

      {copyNote ? (
        <p className="collection-flow-qa__toast" role="status">
          {copyNote}
        </p>
      ) : null}

      <section className="collection-flow-qa__panel" aria-label="Design rules">
        <h2 className="collection-flow-qa__section-title">Design rules</h2>
        <ul className="collection-flow-qa__rules">
          {COLLECTION_FLOW_DESIGN_RULES.map((rule) => (
            <li key={rule.id}>
              <strong>{rule.title}</strong>
              <span>{rule.detail}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="collection-flow-qa__panel" aria-label="Automated checks">
        <div className="collection-flow-qa__panel-head">
          <h2 className="collection-flow-qa__section-title">Automated smoke checks</h2>
          <button
            type="button"
            className="collection-flow-qa__btn"
            onClick={rerunAutomated}
          >
            Re-run
          </button>
        </div>
        <p className="collection-flow-qa__meta">
          {autoPassed}/{automated.length} passed · Console:{" "}
          <code>window.__collectionFlowQa()</code>
        </p>
        <ul className="collection-flow-qa__auto-list">
          {automated.map((row) => (
            <li
              key={row.id}
              className={
                row.passed
                  ? "collection-flow-qa__auto-row collection-flow-qa__auto-row--pass"
                  : "collection-flow-qa__auto-row collection-flow-qa__auto-row--fail"
              }
            >
              <span className="collection-flow-qa__auto-label">{row.label}</span>
              <span className="collection-flow-qa__auto-detail">{row.detail}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="collection-flow-qa__panel" aria-label="Manual checklist">
        <div className="collection-flow-qa__panel-head">
          <h2 className="collection-flow-qa__section-title">Manual checklist</h2>
          <span className="collection-flow-qa__meta">
            {manualDone}/{COLLECTION_FLOW_QA_CHECKLIST.length} checked
          </span>
        </div>
        <p className="collection-flow-qa__meta">
          Offer cooldown turn:{" "}
          {cooldownTurn != null
            ? `${cooldownTurn} (blocks offers for ~8 turns after)`
            : "none"}
        </p>

        <ol className="collection-flow-qa__checklist">
          {COLLECTION_FLOW_QA_CHECKLIST.map((item) => {
            const auto = automatedByChecklist.get(item.id);
            return (
              <li key={item.id} className="collection-flow-qa__check-item">
                <label className="collection-flow-qa__check-label">
                  <input
                    type="checkbox"
                    checked={Boolean(manual[item.id])}
                    onChange={(e) => toggleManual(item.id, e.target.checked)}
                  />
                  <span>
                    <span className="collection-flow-qa__check-step">
                      {item.step}.
                    </span>{" "}
                    {item.title}
                  </span>
                </label>

                {auto ? (
                  <p
                    className={
                      auto.passed
                        ? "collection-flow-qa__auto-hint collection-flow-qa__auto-hint--pass"
                        : "collection-flow-qa__auto-hint collection-flow-qa__auto-hint--fail"
                    }
                  >
                    Auto: {auto.passed ? "pass" : "fail"} — {auto.detail}
                  </p>
                ) : null}

                <p className="collection-flow-qa__goal">{item.goal}</p>

                <div className="collection-flow-qa__sample">
                  <span className="collection-flow-qa__sample-label">Sample chat</span>
                  <p className="collection-flow-qa__sample-text">{item.sampleChatMessage}</p>
                  <button
                    type="button"
                    className="collection-flow-qa__btn collection-flow-qa__btn--small"
                    onClick={() => void copyText(item.sampleChatMessage)}
                  >
                    Copy message
                  </button>
                </div>

                {item.followUpMessages?.length ? (
                  <div className="collection-flow-qa__sample">
                    <span className="collection-flow-qa__sample-label">Then reply</span>
                    <ul className="collection-flow-qa__followups">
                      {item.followUpMessages.map((line) => (
                        <li key={line}>
                          <code>{line}</code>
                          <button
                            type="button"
                            className="collection-flow-qa__btn collection-flow-qa__btn--small"
                            onClick={() => void copyText(line)}
                          >
                            Copy
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <ol className="collection-flow-qa__steps">
                  {item.manualSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>

                {item.roomPreviewPath ? (
                  <Link
                    href={item.roomPreviewPath}
                    className="collection-flow-qa__room-link"
                  >
                    Preview room UI
                  </Link>
                ) : null}
              </li>
            );
          })}
        </ol>
      </section>
    </main>
  );
}
