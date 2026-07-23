"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import type { FireExecutivePortfolio } from "@/lib/founder/types/fireBrief";
import type {
  FireActionHorizon,
  FireActionPlanItem,
  FireBriefSection,
  FireDetailedAlert,
  FireIntelligenceItem,
  FireIznaAssignment,
} from "@/lib/founder/types/fireBriefDetail";
import { FIRE_BRIEF_SECTION_ORDER } from "@/lib/founder/types/fireBriefDetail";
import { buildExecutiveBriefDetail } from "@/lib/founder/briefs/buildExecutiveBriefDetail";
import {
  FIRE_READING_SIZE_DEFAULT,
  type FireReadingSize,
  readFireReadingSize,
  writeFireReadingSize,
} from "@/lib/founder/briefs/fireReadingSize";
import {
  copyIznaAssignmentText,
  formatIznaAssignmentForClipboard,
  isIznaMarkedForReview,
  markIznaForReview,
} from "@/lib/founder/briefs/iznaAssignmentActions";

type ViewMode = "executive" | "full";

type Props = {
  portfolio: FireExecutivePortfolio;
  variant?: "today" | "archive";
  readingMode?: boolean;
  onReadingModeChange?: (next: boolean) => void;
};

function alertLevelLabel(level: FireDetailedAlert["level"]): string {
  if (level === "needs_attention_today") return "Needs Attention Today";
  if (level === "watch_closely") return "Watch Closely";
  return "Worth Knowing";
}

function horizonLabel(horizon: FireActionHorizon): string {
  if (horizon === "today") return "Today";
  if (horizon === "this_week") return "This Week";
  return "Watch / Revisit";
}

function sectionHasActions(section: FireBriefSection): boolean {
  if (section.urgency === "action") return true;
  if (section.alerts?.some((a) => a.level === "needs_attention_today")) {
    return true;
  }
  if (section.actionPlan?.some((a) => a.horizon === "today")) return true;
  if (section.iznaAssignments && section.iznaAssignments.length > 0) return true;
  return false;
}

function FieldBlock({
  label,
  value,
}: {
  label: string;
  value: string | undefined;
}) {
  if (!value?.trim()) return null;
  return (
    <div className="fire-brief-field">
      <p className="fire-brief-field__label">{label}</p>
      <p className="fire-brief-field__value">{value}</p>
    </div>
  );
}

function IntelligenceItemView({ item }: { item: FireIntelligenceItem }) {
  return (
    <article className="fire-brief-item">
      {item.title ? <h4 className="fire-brief-item__title">{item.title}</h4> : null}
      <FieldBlock label="What Happened" value={item.whatHappened} />
      <FieldBlock label="Why It Matters to Spark Estate" value={item.whyItMatters} />
      <FieldBlock label="Member Impact" value={item.memberImpact} />
      <FieldBlock label="Recommendation" value={item.recommendation} />
      <FieldBlock
        label="Implementation Direction"
        value={item.implementationDirection}
      />
      <FieldBlock label="Owner" value={item.owner} />
      <FieldBlock label="Timing" value={item.timing} />
      <FieldBlock
        label="Evidence or Confidence Level"
        value={item.evidenceOrConfidence}
      />
    </article>
  );
}

function AlertCard({ alert }: { alert: FireDetailedAlert }) {
  return (
    <article
      className={`fire-brief-alert fire-brief-alert--${alert.level}`}
      data-alert-level={alert.level}
    >
      <p className="fire-brief-alert__level">
        <span className="fire-brief-alert__level-mark" aria-hidden="true">
          {alert.level === "needs_attention_today"
            ? "●"
            : alert.level === "watch_closely"
              ? "◐"
              : "○"}
        </span>
        {alertLevelLabel(alert.level)}
      </p>
      <h4 className="fire-brief-alert__issue">{alert.issue}</h4>
      <FieldBlock label="Impact" value={alert.impact} />
      <FieldBlock label="Recommendation" value={alert.recommendation} />
      <FieldBlock
        label="Decision needed"
        value={
          alert.decisionNeeded
            ? "Yes — a founder decision is needed."
            : "No decision required."
        }
      />
      <FieldBlock label="Suggested timing" value={alert.suggestedTiming} />
    </article>
  );
}

function IznaCard({
  assignment,
  onCopy,
  onMarkReview,
}: {
  assignment: FireIznaAssignment;
  onCopy: (id: string) => void;
  onMarkReview: (id: string) => void;
}) {
  const marked = isIznaMarkedForReview(assignment.id);
  return (
    <article className="fire-brief-izna" data-testid="fire-izna-assignment">
      <h4 className="fire-brief-izna__title">{assignment.title}</h4>
      <FieldBlock label="Business context" value={assignment.businessContext} />
      <FieldBlock label="Why it matters" value={assignment.whyItMatters} />
      <div className="fire-brief-field">
        <p className="fire-brief-field__label">Step-by-step guidance</p>
        <ol className="fire-brief-izna__steps">
          {assignment.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>
      <div className="fire-brief-field">
        <p className="fire-brief-field__label">Expected deliverables</p>
        <ul className="fire-brief-izna__list">
          {assignment.expectedDeliverables.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </div>
      <FieldBlock label="Definition of done" value={assignment.definitionOfDone} />
      <FieldBlock label="Priority" value={assignment.priority} />
      <FieldBlock label="Timing" value={assignment.timing} />
      <FieldBlock
        label="What should be returned to the founder"
        value={assignment.returnToFounder}
      />
      <FieldBlock
        label="Questions or dependencies"
        value={assignment.questionsOrDependencies}
      />
      <div className="fire-brief-izna__actions">
        <button
          type="button"
          className="fire-brief-btn fire-brief-btn--secondary"
          onClick={() => onCopy(assignment.id)}
        >
          Copy Assignment
        </button>
        <button
          type="button"
          className="fire-brief-btn fire-brief-btn--secondary"
          onClick={() => onMarkReview(assignment.id)}
          aria-pressed={marked}
        >
          {marked ? "Marked for Review" : "Mark for Review"}
        </button>
      </div>
    </article>
  );
}

function ActionCard({ action }: { action: FireActionPlanItem }) {
  return (
    <article className="fire-brief-action" data-horizon={action.horizon}>
      <h4 className="fire-brief-action__title">{action.title}</h4>
      <FieldBlock label="Reason" value={action.reason} />
      <FieldBlock label="Estimated effort" value={action.estimatedEffort} />
      <FieldBlock label="Next step" value={action.nextStep} />
      <FieldBlock label="Suggested owner" value={action.suggestedOwner} />
      <FieldBlock
        label="Related report section"
        value={action.relatedSectionId?.replace(/_/g, " ")}
      />
    </article>
  );
}

function groupActions(actions: readonly FireActionPlanItem[]) {
  return {
    today: actions.filter((a) => a.horizon === "today"),
    this_week: actions.filter((a) => a.horizon === "this_week"),
    watch: actions.filter((a) => a.horizon === "watch"),
  };
}

export function FireExecutiveBriefReadingExperience({
  portfolio,
  variant = "today",
  readingMode = false,
  onReadingModeChange,
}: Props) {
  const baseId = useId();
  const articleRef = useRef<HTMLElement | null>(null);
  const exitReadingRef = useRef<HTMLButtonElement | null>(null);
  const savedScrollRef = useRef(0);

  const detail = useMemo(
    () =>
      buildExecutiveBriefDetail({
        portfolio,
      }),
    [portfolio],
  );

  const [viewMode, setViewMode] = useState<ViewMode>("executive");
  const [readingSize, setReadingSize] = useState<FireReadingSize>(
    FIRE_READING_SIZE_DEFAULT,
  );
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const id of FIRE_BRIEF_SECTION_ORDER) initial[id] = false;
    return initial;
  });
  const [copyNotice, setCopyNotice] = useState<string | null>(null);
  const [reviewTick, setReviewTick] = useState(0);

  useEffect(() => {
    setReadingSize(readFireReadingSize());
  }, []);

  useEffect(() => {
    if (readingMode) {
      savedScrollRef.current = window.scrollY;
      window.requestAnimationFrame(() => {
        articleRef.current?.scrollIntoView({ block: "start" });
        exitReadingRef.current?.focus();
      });
    }
  }, [readingMode]);

  const setSize = (size: FireReadingSize) => {
    setReadingSize(size);
    writeFireReadingSize(size);
  };

  const setReading = (next: boolean) => {
    onReadingModeChange?.(next);
    if (!next) {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: savedScrollRef.current });
      });
    }
  };

  const openSection = (id: string, alsoExpand = true) => {
    setViewMode("full");
    if (alsoExpand) {
      setExpanded((prev) => ({ ...prev, [id]: true }));
    }
    window.requestAnimationFrame(() => {
      const el = document.getElementById(`${baseId}-section-${id}`);
      el?.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  };

  const expandAll = () => {
    const next: Record<string, boolean> = {};
    for (const id of FIRE_BRIEF_SECTION_ORDER) next[id] = true;
    setExpanded(next);
    setViewMode("full");
  };

  const collapseAll = () => {
    const next: Record<string, boolean> = {};
    for (const id of FIRE_BRIEF_SECTION_ORDER) next[id] = false;
    setExpanded(next);
  };

  const openActionSections = () => {
    const next: Record<string, boolean> = { ...expanded };
    for (const section of detail.sections) {
      if (sectionHasActions(section)) next[section.id] = true;
    }
    setExpanded(next);
    setViewMode("full");
  };

  const readFullBrief = () => {
    setViewMode("full");
    setReading(true);
  };

  const toggleSection = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyIzna = async (assignment: FireIznaAssignment) => {
    const ok = await copyIznaAssignmentText(
      formatIznaAssignmentForClipboard(assignment),
    );
    setCopyNotice(
      ok ? `Copied: ${assignment.title}` : "Could not copy — try again.",
    );
    window.setTimeout(() => setCopyNotice(null), 2500);
  };

  const statusLabel =
    portfolio.status === "draft"
      ? "Draft"
      : portfolio.status === "reviewed"
        ? "Reviewed"
        : "Archived";

  const showOverview = viewMode === "executive" || viewMode === "full";

  return (
    <article
      ref={articleRef}
      className={`fire-brief fire-brief--size-${readingSize}${
        variant === "archive" ? " fire-brief--archive" : ""
      }${readingMode ? " fire-brief--reading-mode" : ""}`}
      data-testid="fire-executive-brief"
      data-reading-size={readingSize}
      data-view-mode={viewMode}
      data-reading-mode={readingMode ? "true" : "false"}
      aria-labelledby={`${baseId}-title`}
    >
      <header className="fire-brief__header">
        <p className="fire-brief__eyebrow">Today’s Executive Intelligence Brief</p>
        <h2 className="fire-brief__title" id={`${baseId}-title`}>
          {detail.reportName} — {detail.fullDateDisplay}
        </h2>
        <p className="fire-brief__date" data-testid="fire-brief-date">
          {detail.fullDateDisplay}
        </p>
        <dl className="fire-brief__meta">
          <div>
            <dt>Status</dt>
            <dd>{statusLabel}</dd>
          </div>
          <div>
            <dt>Reading time</dt>
            <dd>About {portfolio.readingTimeMinutes} minutes</dd>
          </div>
          {detail.preparedAtDisplay ? (
            <div>
              <dt>Prepared</dt>
              <dd>{detail.preparedAtDisplay}</dd>
            </div>
          ) : null}
          <div>
            <dt>Prepared for</dt>
            <dd>{portfolio.preparedFor}</dd>
          </div>
        </dl>
        {detail.memberFacingProvenance ? (
          <p className="fire-brief__provenance" data-testid="fire-brief-provenance">
            {detail.memberFacingProvenance}
          </p>
        ) : null}
      </header>

      <div
        className="fire-brief__controls"
        role="toolbar"
        aria-label="Brief viewing controls"
      >
        <div className="fire-brief__control-group" role="group" aria-label="Primary">
          <button
            type="button"
            className={`fire-brief-btn fire-brief-btn--primary${
              viewMode === "full" ? " fire-brief-btn--active" : ""
            }`}
            onClick={readFullBrief}
            data-testid="fire-read-full-brief"
          >
            Read Full Executive Brief
          </button>
          <button
            type="button"
            className={`fire-brief-btn${viewMode === "executive" ? " fire-brief-btn--active" : ""}`}
            aria-pressed={viewMode === "executive"}
            onClick={() => setViewMode("executive")}
          >
            Executive Overview
          </button>
          <button
            type="button"
            className="fire-brief-btn"
            onClick={() => openSection("founder_action_plan")}
            data-testid="fire-open-actions"
          >
            Open Founder Actions
          </button>
          <button
            type="button"
            className="fire-brief-btn"
            onClick={() => openSection("izna_work_package")}
            data-testid="fire-open-izna"
          >
            Open Izna Work Package
          </button>
        </div>
        <div className="fire-brief__control-group" role="group" aria-label="Sections">
          <button type="button" className="fire-brief-btn" onClick={expandAll}>
            Expand All
          </button>
          <button type="button" className="fire-brief-btn" onClick={collapseAll}>
            Collapse All
          </button>
          <button
            type="button"
            className="fire-brief-btn"
            onClick={openActionSections}
            data-testid="fire-open-action-sections"
          >
            Open Sections With Actions
          </button>
        </div>
        <div
          className="fire-brief__control-group"
          role="group"
          aria-label="Text size"
        >
          <span className="fire-brief__control-label" id={`${baseId}-text-size`}>
            Text Size
          </span>
          {(
            [
              ["smaller", "Smaller"],
              ["default", "Default"],
              ["larger", "Larger"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`fire-brief-btn${readingSize === value ? " fire-brief-btn--active" : ""}`}
              aria-pressed={readingSize === value}
              aria-describedby={`${baseId}-text-size`}
              onClick={() => setSize(value)}
              data-testid={`fire-text-size-${value}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div
          className="fire-brief__control-group"
          role="group"
          aria-label="Reading mode"
        >
          {readingMode ? (
            <button
              ref={exitReadingRef}
              type="button"
              className="fire-brief-btn fire-brief-btn--primary"
              onClick={() => setReading(false)}
              data-testid="fire-exit-reading-mode"
            >
              Exit Reading Mode
            </button>
          ) : (
            <button
              type="button"
              className="fire-brief-btn"
              onClick={() => {
                setViewMode("full");
                setReading(true);
              }}
              data-testid="fire-enter-reading-mode"
            >
              Reading Mode
            </button>
          )}
        </div>
      </div>

      {showOverview ? (
        <section
          className="fire-brief__overview"
          aria-labelledby={`${baseId}-overview`}
          data-testid="fire-brief-overview"
        >
          <h3 className="fire-brief__overview-title" id={`${baseId}-overview`}>
            Executive Overview
          </h3>
          <div className="fire-brief__overview-grid">
            <div className="fire-brief__overview-card">
              <h4 className="fire-brief__subhead">
                Three most important developments
              </h4>
              <ol className="fire-brief__overview-list">
                {detail.overview.topDevelopments.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ol>
            </div>
            <div className="fire-brief__overview-card fire-brief__overview-card--alerts">
              <h4 className="fire-brief__subhead">Founder Alerts</h4>
              {detail.overview.alertsRequiringAttention.length === 0 ? (
                <p className="fire-brief__body">No alerts requiring attention today.</p>
              ) : (
                <ul className="fire-brief__overview-list">
                  {detail.overview.alertsRequiringAttention.map((a) => (
                    <li key={a.id}>
                      <span className="fire-brief-badge">{alertLevelLabel(a.level)}</span>{" "}
                      {a.issue}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="fire-brief__overview-card">
              <h4 className="fire-brief__subhead">Top founder priority</h4>
              <p className="fire-brief__body">
                {detail.overview.topPriority ?? portfolio.primaryFocus}
              </p>
            </div>
            <div className="fire-brief__overview-card">
              <h4 className="fire-brief__subhead">Highest-value opportunity</h4>
              <p className="fire-brief__body">
                {detail.overview.highestOpportunity ?? "No opportunity surfaced yet."}
              </p>
            </div>
            <div className="fire-brief__overview-card">
              <h4 className="fire-brief__subhead">
                Product / development recommendation
              </h4>
              <p className="fire-brief__body">
                {detail.overview.productOrDevelopmentRecommendation ??
                  "No product recommendation surfaced yet."}
              </p>
            </div>
            <div className="fire-brief__overview-card">
              <h4 className="fire-brief__subhead">Izna’s highest-priority assignment</h4>
              <p className="fire-brief__body">
                {detail.overview.iznaPriorityAssignment ??
                  "No Izna assignment queued for today."}
              </p>
            </div>
            {detail.overview.changedSinceYesterday.length > 0 ? (
              <div className="fire-brief__overview-card fire-brief__overview-card--wide">
                <h4 className="fire-brief__subhead">What changed since yesterday</h4>
                <ul className="fire-brief__overview-list">
                  {detail.overview.changedSinceYesterday.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            ) : detail.overview.comparisonNote ? (
              <div className="fire-brief__overview-card fire-brief__overview-card--wide">
                <h4 className="fire-brief__subhead">Compared with previous report</h4>
                <p className="fire-brief__body">{detail.overview.comparisonNote}</p>
              </div>
            ) : null}
          </div>
          {viewMode === "executive" ? (
            <p className="fire-brief__overview-hint">
              Use Read Full Executive Brief when you want every complete report section.
            </p>
          ) : null}
        </section>
      ) : null}

      {viewMode === "full" ? (
        <div className="fire-brief__layout">
          {!readingMode ? (
            <nav className="fire-brief__rail" aria-label="Report sections">
              <p className="fire-brief__rail-title">Sections</p>
              <ul className="fire-brief__rail-list">
                {detail.sections.map((section) => (
                  <li key={section.id}>
                    <a
                      className={`fire-brief__rail-link fire-brief-section--${section.color}`}
                      href={`#${baseId}-section-${section.id}`}
                    >
                      <span aria-hidden="true">{section.icon}</span> {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ) : (
            <nav
              className="fire-brief__rail fire-brief__rail--reading"
              aria-label="Report sections"
            >
              <p className="fire-brief__rail-title">Jump to section</p>
              <ul className="fire-brief__rail-list">
                {detail.sections.map((section) => (
                  <li key={section.id}>
                    <a
                      className={`fire-brief__rail-link fire-brief-section--${section.color}`}
                      href={`#${baseId}-section-${section.id}`}
                    >
                      <span aria-hidden="true">{section.icon}</span> {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <div className="fire-brief__sections" data-testid="fire-brief-sections">
            {detail.sections.map((section) => {
              const isOpen = Boolean(expanded[section.id]);
              const panelId = `${baseId}-panel-${section.id}`;
              const headerId = `${baseId}-section-${section.id}`;
              return (
                <section
                  key={section.id}
                  id={headerId}
                  className={`fire-brief-section fire-brief-section--${section.color}${
                    isOpen ? " fire-brief-section--open" : ""
                  }`}
                  data-section-id={section.id}
                  data-expanded={isOpen ? "true" : "false"}
                >
                  <h3 className="fire-brief-section__title">
                    <button
                      type="button"
                      className="fire-brief-section__toggle"
                      id={`${headerId}-btn`}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => toggleSection(section.id)}
                      onKeyDown={(event) => {
                        if (event.key === " " || event.key === "Enter") {
                          event.preventDefault();
                          toggleSection(section.id);
                        }
                      }}
                    >
                      <span className="fire-brief-section__icon" aria-hidden="true">
                        {section.icon}
                      </span>
                      <span className="fire-brief-section__title-text">
                        {section.title}
                      </span>
                      {section.urgency === "action" ? (
                        <span className="fire-brief-badge fire-brief-badge--action">
                          Action
                        </span>
                      ) : section.urgency === "watch" ? (
                        <span className="fire-brief-badge fire-brief-badge--watch">
                          Watch
                        </span>
                      ) : null}
                      {section.itemCount > 0 ? (
                        <span className="fire-brief-badge">
                          {section.itemCount}{" "}
                          {section.itemCount === 1 ? "item" : "items"}
                        </span>
                      ) : null}
                    </button>
                  </h3>
                  <p className="fire-brief-section__synopsis">{section.synopsis}</p>
                  {!isOpen ? (
                    <button
                      type="button"
                      className="fire-brief-btn fire-brief-btn--open-section"
                      onClick={() => toggleSection(section.id)}
                      aria-controls={panelId}
                      aria-expanded={false}
                    >
                      Open Section
                    </button>
                  ) : null}
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={`${headerId}-btn`}
                    hidden={!isOpen}
                    className="fire-brief-section__body"
                  >
                    {section.alerts?.map((alert) => (
                      <AlertCard key={alert.id} alert={alert} />
                    ))}
                    {section.iznaAssignments?.map((assignment) => (
                      <IznaCard
                        key={`${assignment.id}-${reviewTick}`}
                        assignment={assignment}
                        onCopy={() => void handleCopyIzna(assignment)}
                        onMarkReview={(id) => {
                          markIznaForReview(id);
                          setReviewTick((n) => n + 1);
                        }}
                      />
                    ))}
                    {section.actionPlan
                      ? (() => {
                          const groups = groupActions(section.actionPlan);
                          return (
                            <div data-testid="fire-action-plan-groups">
                              {(
                                [
                                  ["today", groups.today],
                                  ["this_week", groups.this_week],
                                  ["watch", groups.watch],
                                ] as const
                              ).map(([horizon, list]) =>
                                list.length > 0 ? (
                                  <div
                                    key={horizon}
                                    className="fire-brief-action-group"
                                    data-horizon-group={horizon}
                                  >
                                    <h4 className="fire-brief__subhead">
                                      {horizonLabel(horizon)}
                                    </h4>
                                    {list.map((action) => (
                                      <ActionCard key={action.id} action={action} />
                                    ))}
                                  </div>
                                ) : null,
                              )}
                            </div>
                          );
                        })()
                      : null}
                    {section.items.map((it) => (
                      <IntelligenceItemView key={it.id} item={it} />
                    ))}
                    <button
                      type="button"
                      className="fire-brief-btn fire-brief-btn--secondary"
                      onClick={() => toggleSection(section.id)}
                    >
                      Collapse Section
                    </button>
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      ) : null}

      {copyNotice ? (
        <p className="fire-brief__toast" role="status" aria-live="polite">
          {copyNotice}
        </p>
      ) : null}
    </article>
  );
}
