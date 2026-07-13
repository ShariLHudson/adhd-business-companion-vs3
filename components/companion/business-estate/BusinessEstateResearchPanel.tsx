"use client";

import { useState } from "react";
import {
  BUSINESS_ESTATE_RESEARCH_MAY_AUTO_UPDATE_PROFILE,
  buildBusinessEstateResearchResult,
  clearResearchSessionPrompt,
  saveResearchNoteOnly,
  writeResearchSessionPrompt,
  type BusinessEstateResearchResult,
  type BusinessEstateResearchReturnContext,
} from "@/lib/profile/businessEstateResearch";

type Props = {
  returnContext: BusinessEstateResearchReturnContext;
  onClose: () => void;
  /** Return to the same area/stage without discarding editor drafts */
  onReturnToEstate: () => void;
};

type Phase = "ask" | "clarify" | "results";

/**
 * Estate-level research panel — one place for business research.
 * Does not auto-update profile fields.
 */
export function BusinessEstateResearchPanel({
  returnContext,
  onClose,
  onReturnToEstate,
}: Props) {
  const [phase, setPhase] = useState<Phase>("ask");
  const [request, setRequest] = useState("");
  const [clarification, setClarification] = useState("");
  const [pendingClarify, setPendingClarify] = useState<string | null>(null);
  const [result, setResult] = useState<BusinessEstateResearchResult | null>(
    null,
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    findings: true,
    meaning: true,
    next: true,
    sources: false,
    updates: true,
    approved: false,
  });

  function toggle(key: string) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function runResearch(withClarification?: string) {
    const built = buildBusinessEstateResearchResult(
      request,
      withClarification,
    );
    if (built.clarificationNeeded && !withClarification) {
      setPendingClarify(built.clarificationNeeded);
      setPhase("clarify");
      return;
    }
    setResult(built);
    writeResearchSessionPrompt(request, built);
    setPhase("results");
    setNotice(null);
  }

  function handleLeaveUnchanged() {
    clearResearchSessionPrompt();
    setNotice("Nothing in your Business Estate was changed.");
    onReturnToEstate();
  }

  return (
    <div
      className="business-estate-research-panel"
      data-testid="business-estate-research-panel"
      data-auto-update-profile={String(
        BUSINESS_ESTATE_RESEARCH_MAY_AUTO_UPDATE_PROFILE,
      )}
      role="dialog"
      aria-label="Research This With Shari"
    >
      <header className="business-estate-research-panel__header">
        <div>
          <p className="estate-workspace__kicker">My Business Estate</p>
          <h2 className="business-estate-research-panel__title">
            Research This With Shari
          </h2>
        </div>
        <button
          type="button"
          className="my-business-estate-panel__close"
          onClick={() => {
            clearResearchSessionPrompt();
            onClose();
          }}
          data-testid="research-panel-close"
        >
          Close
        </button>
      </header>

      {returnContext.sectionId ? (
        <p className="business-estate-research-panel__return-hint">
          You can return to{" "}
          <strong>{returnContext.sectionId.replace(/-/g, " ")}</strong>
          {returnContext.stageId ? ` · ${returnContext.stageId}` : ""} when
          you&apos;re done. Unsaved drafts stay where you left them.
        </p>
      ) : (
        <p className="business-estate-research-panel__return-hint">
          Research stays separate from your approved Business Estate profile.
        </p>
      )}

      {phase === "ask" ? (
        <div className="business-estate-research-panel__ask">
          <label
            className="business-estate-research-panel__label"
            htmlFor="estate-research-request"
          >
            What would you like to research for your business?
          </label>
          <textarea
            id="estate-research-request"
            className="business-estate-research-panel__textarea"
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            placeholder="Describe it in your own words — audience needs, competitors, pricing, messaging, tools, ideas…"
            data-testid="estate-research-request"
          />
          <button
            type="button"
            className="business-estate-section-editor__save"
            disabled={!request.trim()}
            onClick={() => runResearch()}
            data-testid="estate-research-submit"
          >
            Research with Shari
          </button>
        </div>
      ) : null}

      {phase === "clarify" && pendingClarify ? (
        <div className="business-estate-research-panel__clarify">
          <p className="business-estate-research-panel__clarify-q">
            {pendingClarify}
          </p>
          <textarea
            className="business-estate-research-panel__textarea business-estate-research-panel__textarea--short"
            value={clarification}
            onChange={(e) => setClarification(e.target.value)}
            placeholder="One short answer is enough…"
            data-testid="estate-research-clarify"
          />
          <div className="guided-stage-complete__actions">
            <button
              type="button"
              className="business-estate-section-editor__save"
              onClick={() => runResearch(clarification.trim() || "Continue as best you can")}
              data-testid="estate-research-clarify-submit"
            >
              Continue
            </button>
            <button
              type="button"
              className="guided-estate-field__help-btn"
              onClick={() => setPhase("ask")}
            >
              Edit my request
            </button>
          </div>
        </div>
      ) : null}

      {phase === "results" && result ? (
        <div className="business-estate-research-panel__results">
          <section className="business-estate-research-section">
            <h3>Research question</h3>
            <p>{result.question}</p>
          </section>

          <Collapsible
            title="What Shari reviewed"
            open={Boolean(openSections.approved)}
            onToggle={() => toggle("approved")}
          >
            <ul>
              {result.whatReviewed.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {result.layers.approvedContext.length ? (
              <>
                <p className="business-estate-research-layer-label">
                  Approved user information
                </p>
                <ul>
                  {result.layers.approvedContext.slice(0, 8).map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p>No approved Business Estate fields yet — that&apos;s okay.</p>
            )}
          </Collapsible>

          <Collapsible
            title="Key findings"
            open={Boolean(openSections.findings)}
            onToggle={() => toggle("findings")}
            layer="Research findings"
          >
            <ul>
              {result.keyFindings.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Collapsible>

          <Collapsible
            title="What this may mean for the business"
            open={Boolean(openSections.meaning)}
            onToggle={() => toggle("meaning")}
            layer="Shari's interpretation"
          >
            <p>{result.interpretation}</p>
          </Collapsible>

          <Collapsible
            title="Suggested next steps"
            open={Boolean(openSections.next)}
            onToggle={() => toggle("next")}
          >
            <ul>
              {result.suggestedNextSteps.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Collapsible>

          <Collapsible
            title="Sources"
            open={Boolean(openSections.sources)}
            onToggle={() => toggle("sources")}
          >
            <ul>
              {result.sources.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Collapsible>

          <Collapsible
            title="Possible Business Estate updates"
            open={Boolean(openSections.updates)}
            onToggle={() => toggle("updates")}
            layer="Suggested updates (not applied)"
          >
            {result.possibleUpdates.length ? (
              <ul>
                {result.possibleUpdates.map((u) => (
                  <li key={u.path}>
                    <strong>{u.path}</strong> — {u.suggestion}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No field updates suggested yet.</p>
            )}
          </Collapsible>

          <div
            className="business-estate-research-panel__approval"
            data-testid="research-approval-actions"
          >
            <p>
              Would you like me to prepare suggested updates for your Business
              Estate?
            </p>
            <div className="guided-stage-complete__actions">
              <button
                type="button"
                className="business-estate-section-editor__save"
                onClick={() =>
                  setNotice(
                    "Suggested updates stay as drafts here. Nothing is saved to your profile until you approve and Save in a Business Area.",
                  )
                }
                data-testid="research-prepare-updates"
              >
                Prepare suggested updates
              </button>
              <button
                type="button"
                className="guided-estate-field__help-btn"
                onClick={() => {
                  saveResearchNoteOnly(result);
                  setNotice(
                    "Research saved separately from your Business Estate profile.",
                  );
                }}
                data-testid="research-save-only"
              >
                Save the research only
              </button>
              <button
                type="button"
                className="guided-estate-field__help-btn"
                onClick={() =>
                  setNotice(
                    "Shari still has this research context in conversation. Your profile is unchanged.",
                  )
                }
                data-testid="research-keep-talking"
              >
                Keep talking
              </button>
              <button
                type="button"
                className="guided-estate-field__help-btn"
                onClick={handleLeaveUnchanged}
                data-testid="research-leave-unchanged"
              >
                Leave everything unchanged
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {notice ? (
        <p className="guided-estate-field__notice" role="status">
          {notice}
        </p>
      ) : null}

      <div className="business-estate-research-panel__footer">
        <button
          type="button"
          className="business-estate-section-editor__save"
          onClick={onReturnToEstate}
          data-testid="research-return-to-area"
        >
          Return to Business Estate
        </button>
      </div>
    </div>
  );
}

function Collapsible({
  title,
  open,
  onToggle,
  layer,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  layer?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="business-estate-research-section">
      <button
        type="button"
        className="business-estate-research-section__toggle"
        aria-expanded={open}
        onClick={onToggle}
      >
        <span>{title}</span>
        <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      {open ? (
        <div className="business-estate-research-section__body">
          {layer ? (
            <p className="business-estate-research-layer-label">{layer}</p>
          ) : null}
          {children}
        </div>
      ) : null}
    </section>
  );
}
