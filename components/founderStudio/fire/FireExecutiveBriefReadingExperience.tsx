"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import type { FireExecutivePortfolio } from "@/lib/founder/types/fireBrief";
import type {
  FireActionHorizon,
  FireActionPlanItem,
  FireBriefSection,
  FireBriefSectionId,
  FireDetailedAlert,
  FireIntelligenceItem,
  FireIznaAssignment,
} from "@/lib/founder/types/fireBriefDetail";
import { FIRE_BRIEF_SECTION_ORDER } from "@/lib/founder/types/fireBriefDetail";
import { buildExecutiveBriefDetail } from "@/lib/founder/briefs/buildExecutiveBriefDetail";
import {
  estimateSectionReadingMinutes,
  markBriefSectionRead,
  readBriefSectionMarks,
  readLastBriefSection,
  writeLastBriefSection,
} from "@/lib/founder/briefs/fireBriefReadingProgress";
import {
  FIRE_READING_SIZE_DEFAULT,
  FIRE_READING_SIZE_LABELS,
  FIRE_READING_SIZE_OPTIONS,
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

type Surface =
  | "dashboard"
  | "attention"
  | "actions"
  | "alerts"
  | "izna"
  | "sections"
  | "section";

type Props = {
  portfolio: FireExecutivePortfolio;
  variant?: "today" | "archive";
  readingMode?: boolean;
  onReadingModeChange?: (next: boolean) => void;
  greeting?: string;
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

function sectionPlainText(section: FireBriefSection): string {
  const parts: string[] = [section.title, section.synopsis];
  for (const item of section.items) {
    parts.push(
      item.title ?? "",
      item.whatHappened ?? "",
      item.whyItMatters ?? "",
      item.recommendation ?? "",
    );
  }
  for (const alert of section.alerts ?? []) {
    parts.push(alert.issue, alert.impact, alert.recommendation);
  }
  for (const action of section.actionPlan ?? []) {
    parts.push(action.title, action.reason, action.nextStep);
  }
  for (const izna of section.iznaAssignments ?? []) {
    parts.push(izna.title, izna.whyItMatters, izna.definitionOfDone);
  }
  return parts.join(" ");
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
      <FieldBlock label="Why It Matters" value={item.whyItMatters} />
      <FieldBlock label="What I Recommend" value={item.recommendation} />
      <FieldBlock label="What Happens Next" value={item.implementationDirection} />
      <FieldBlock label="Member Impact" value={item.memberImpact} />
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
  compact = false,
}: {
  assignment: FireIznaAssignment;
  onCopy: (id: string) => void;
  onMarkReview: (id: string) => void;
  compact?: boolean;
}) {
  const marked = isIznaMarkedForReview(assignment.id);
  const [showDetails, setShowDetails] = useState(!compact);

  return (
    <article className="fire-brief-izna" data-testid="fire-izna-assignment">
      <h4 className="fire-brief-izna__title">{assignment.title}</h4>
      <FieldBlock label="Why it matters" value={assignment.whyItMatters} />
      <FieldBlock label="Priority" value={assignment.priority} />
      <FieldBlock label="Timing" value={assignment.timing} />
      {!showDetails ? (
        <button
          type="button"
          className="fire-brief-btn fire-brief-btn--primary"
          onClick={() => setShowDetails(true)}
        >
          Full Instructions
        </button>
      ) : (
        <>
          <FieldBlock label="Business context" value={assignment.businessContext} />
          <div className="fire-brief-field">
            <p className="fire-brief-field__label">Full Instructions</p>
            <ol className="fire-brief-izna__steps">
              {assignment.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
          <div className="fire-brief-field">
            <p className="fire-brief-field__label">Expected Deliverables</p>
            <ul className="fire-brief-izna__list">
              {assignment.expectedDeliverables.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
          <FieldBlock label="Definition of Done" value={assignment.definitionOfDone} />
          <FieldBlock
            label="What should be returned to the founder"
            value={assignment.returnToFounder}
          />
          <FieldBlock
            label="Questions or dependencies"
            value={assignment.questionsOrDependencies}
          />
        </>
      )}
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
      <FieldBlock label="Why it matters" value={action.reason} />
      <FieldBlock label="Next step" value={action.nextStep} />
      <FieldBlock label="Owner" value={action.suggestedOwner} />
      <FieldBlock label="Estimated effort" value={action.estimatedEffort} />
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

function sectionBodyContent({
  section,
  reviewTick,
  onCopyIzna,
  onMarkReview,
  actionHorizonFilter,
  iznaPrimaryOnly,
  showMoreIzna,
  onShowMoreIzna,
}: {
  section: FireBriefSection;
  reviewTick: number;
  onCopyIzna: (assignment: FireIznaAssignment) => void;
  onMarkReview: (id: string) => void;
  actionHorizonFilter?: FireActionHorizon | "today_top3";
  iznaPrimaryOnly?: boolean;
  showMoreIzna?: boolean;
  onShowMoreIzna?: () => void;
}) {
  const iznaList = section.iznaAssignments ?? [];
  const primaryIzna = iznaList[0];
  const moreIzna = iznaList.slice(1);

  let actionPlan = section.actionPlan;
  if (actionPlan && actionHorizonFilter === "today_top3") {
    actionPlan = actionPlan.filter((a) => a.horizon === "today").slice(0, 3);
  } else if (actionPlan && actionHorizonFilter) {
    actionPlan = actionPlan.filter((a) => a.horizon === actionHorizonFilter);
  }

  return (
    <>
      {section.alerts?.map((alert) => (
        <AlertCard key={alert.id} alert={alert} />
      ))}
      {iznaPrimaryOnly && primaryIzna ? (
        <>
          <IznaCard
            key={`${primaryIzna.id}-${reviewTick}`}
            assignment={primaryIzna}
            compact
            onCopy={() => onCopyIzna(primaryIzna)}
            onMarkReview={onMarkReview}
          />
          {moreIzna.length > 0 && !showMoreIzna ? (
            <button
              type="button"
              className="fire-brief-btn"
              onClick={onShowMoreIzna}
              data-testid="fire-more-izna"
            >
              More Assignments ({moreIzna.length})
            </button>
          ) : null}
          {showMoreIzna
            ? moreIzna.map((assignment) => (
                <IznaCard
                  key={`${assignment.id}-${reviewTick}`}
                  assignment={assignment}
                  compact
                  onCopy={() => onCopyIzna(assignment)}
                  onMarkReview={onMarkReview}
                />
              ))
            : null}
        </>
      ) : (
        iznaList.map((assignment) => (
          <IznaCard
            key={`${assignment.id}-${reviewTick}`}
            assignment={assignment}
            onCopy={() => onCopyIzna(assignment)}
            onMarkReview={onMarkReview}
          />
        ))
      )}
      {actionPlan
        ? (() => {
            const groups = groupActions(actionPlan);
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
                      <h4 className="fire-brief__subhead">{horizonLabel(horizon)}</h4>
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
    </>
  );
}

export function FireExecutiveBriefReadingExperience({
  portfolio,
  variant = "today",
  readingMode = false,
  onReadingModeChange,
  greeting,
}: Props) {
  const baseId = useId();
  const articleRef = useRef<HTMLElement | null>(null);
  const exitReadingRef = useRef<HTMLButtonElement | null>(null);
  const savedScrollRef = useRef(0);
  const moreMenuRef = useRef<HTMLDivElement | null>(null);
  const textSizeMenuRef = useRef<HTMLDivElement | null>(null);

  const detail = useMemo(
    () =>
      buildExecutiveBriefDetail({
        portfolio,
      }),
    [portfolio],
  );

  const sectionsById = useMemo(() => {
    const map = new Map<FireBriefSectionId, FireBriefSection>();
    for (const section of detail.sections) map.set(section.id, section);
    return map;
  }, [detail.sections]);

  const [surface, setSurface] = useState<Surface>("dashboard");
  const [activeSectionId, setActiveSectionId] =
    useState<FireBriefSectionId | null>(null);
  const [readingSize, setReadingSize] = useState<FireReadingSize>(
    FIRE_READING_SIZE_DEFAULT,
  );
  const [moreOpen, setMoreOpen] = useState(false);
  const [textSizeOpen, setTextSizeOpen] = useState(false);
  const [allSectionsOpen, setAllSectionsOpen] = useState(false);
  const [actionHorizon, setActionHorizon] = useState<
    "today_top3" | "this_week" | "watch"
  >("today_top3");
  const [showMoreIzna, setShowMoreIzna] = useState(false);
  const [expandAllMode, setExpandAllMode] = useState(false);
  const [copyNotice, setCopyNotice] = useState<string | null>(null);
  const [reviewTick, setReviewTick] = useState(0);
  const [readMarks, setReadMarks] = useState<Set<FireBriefSectionId>>(
    () => new Set(),
  );
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  /** Client-only — avoid SSR/localStorage hydration mismatch on resume CTA. */
  const [lastSectionId, setLastSectionId] =
    useState<FireBriefSectionId | null>(null);

  useEffect(() => {
    setReadingSize(readFireReadingSize());
    setReadMarks(readBriefSectionMarks(portfolio.id));
    const last = readLastBriefSection(portfolio.id);
    setLastSectionId(last);
    if (last) setActiveSectionId(last);
  }, [portfolio.id]);

  useEffect(() => {
    if (!readingMode) return;
    savedScrollRef.current = window.scrollY;
    if (!activeSectionId) {
      const last = readLastBriefSection(portfolio.id);
      const start = last ?? FIRE_BRIEF_SECTION_ORDER[0];
      setActiveSectionId(start);
      setSurface("section");
    } else {
      setSurface("section");
    }
    window.requestAnimationFrame(() => {
      articleRef.current?.scrollIntoView({ block: "start" });
      exitReadingRef.current?.focus();
    });
  }, [readingMode]); // eslint-disable-line react-hooks/exhaustive-deps -- enter once

  useEffect(() => {
    if (!moreOpen && !textSizeOpen && !allSectionsOpen) return;
    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (moreOpen && moreMenuRef.current && !moreMenuRef.current.contains(target)) {
        setMoreOpen(false);
      }
      if (
        textSizeOpen &&
        textSizeMenuRef.current &&
        !textSizeMenuRef.current.contains(target)
      ) {
        setTextSizeOpen(false);
      }
      if (allSectionsOpen) {
        const menu = document.getElementById(`${baseId}-all-sections`);
        if (menu && !menu.contains(target)) setAllSectionsOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [moreOpen, textSizeOpen, allSectionsOpen, baseId]);

  const setSize = (size: FireReadingSize) => {
    setReadingSize(size);
    writeFireReadingSize(size);
    setTextSizeOpen(false);
  };

  const setReading = (next: boolean) => {
    onReadingModeChange?.(next);
    if (!next) {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: savedScrollRef.current });
      });
    }
  };

  const openSection = (id: FireBriefSectionId, enterReading = false) => {
    setActiveSectionId(id);
    setSurface("section");
    setExpandAllMode(false);
    writeLastBriefSection(portfolio.id, id);
    if (enterReading) setReading(true);
    window.requestAnimationFrame(() => {
      document
        .getElementById(`${baseId}-active-section`)
        ?.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  };

  const openSurface = (next: Surface) => {
    setSurface(next);
    setExpandAllMode(false);
    if (next === "actions") setActionHorizon("today_top3");
    if (next === "izna") setShowMoreIzna(false);
    if (next === "sections") setActiveSectionId(null);
    window.requestAnimationFrame(() => {
      articleRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  };

  const goDashboard = () => {
    setSurface("dashboard");
    setExpandAllMode(false);
    setReading(false);
  };

  const sectionIndex = activeSectionId
    ? FIRE_BRIEF_SECTION_ORDER.indexOf(activeSectionId)
    : -1;

  const goPrevSection = () => {
    if (sectionIndex <= 0) return;
    openSection(FIRE_BRIEF_SECTION_ORDER[sectionIndex - 1], readingMode);
  };

  const goNextSection = () => {
    if (sectionIndex < 0 || sectionIndex >= FIRE_BRIEF_SECTION_ORDER.length - 1) {
      return;
    }
    openSection(FIRE_BRIEF_SECTION_ORDER[sectionIndex + 1], readingMode);
  };

  const expandAll = () => {
    setSurface("sections");
    setExpandAllMode(true);
    setMoreOpen(false);
    setReading(false);
  };

  const collapseAll = () => {
    setExpandAllMode(false);
    setSurface("sections");
    setActiveSectionId(null);
    setMoreOpen(false);
  };

  const openActionSections = () => {
    setSurface("sections");
    setExpandAllMode(false);
    setMoreOpen(false);
    const first = detail.sections.find(sectionHasActions);
    if (first) openSection(first.id);
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

  const markCurrentRead = () => {
    if (!activeSectionId) return;
    markBriefSectionRead(portfolio.id, activeSectionId);
    setReadMarks(readBriefSectionMarks(portfolio.id));
    setStatusNotice("Marked as read.");
    window.setTimeout(() => setStatusNotice(null), 2000);
  };

  const comeBackLater = () => {
    if (activeSectionId) writeLastBriefSection(portfolio.id, activeSectionId);
    setStatusNotice("Saved your place. You can return here anytime.");
    setReading(false);
    setSurface("dashboard");
    window.setTimeout(() => setStatusNotice(null), 2500);
  };

  const attentionCount = detail.overview.alertsRequiringAttention.length;
  const todayActions =
    detail.overview.topActions.filter((a) => a.horizon === "today").length ||
    detail.sections
      .find((s) => s.id === "founder_action_plan")
      ?.actionPlan?.filter((a) => a.horizon === "today").length ||
    0;
  const alertCount =
    detail.sections.find((s) => s.id === "founder_alerts")?.alerts?.length ??
    portfolio.alerts.length;
  const iznaCount =
    detail.sections.find((s) => s.id === "izna_work_package")?.iznaAssignments
      ?.length ?? 0;

  const activeSection = activeSectionId
    ? sectionsById.get(activeSectionId)
    : undefined;
  const readingMinutes = activeSection
    ? estimateSectionReadingMinutes(sectionPlainText(activeSection))
    : null;

  const actionSection = sectionsById.get("founder_action_plan");
  const iznaSection = sectionsById.get("izna_work_package");
  const alertsSection = sectionsById.get("founder_alerts");

  const showDashboard = !readingMode && surface === "dashboard";
  const showSectionGrid =
    !readingMode && (surface === "sections" || expandAllMode);
  const showFocusedPanel =
    !readingMode &&
    (surface === "attention" ||
      surface === "actions" ||
      surface === "alerts" ||
      surface === "izna");
  const showOneSection =
    surface === "section" && activeSection && (!expandAllMode || readingMode);

  return (
    <article
      ref={articleRef}
      className={`fire-brief fire-brief--size-${readingSize}${
        variant === "archive" ? " fire-brief--archive" : ""
      }${readingMode ? " fire-brief--reading-mode" : ""}`}
      data-testid="fire-executive-brief"
      data-reading-size={readingSize}
      data-surface={surface}
      data-reading-mode={readingMode ? "true" : "false"}
      data-layout="full-width"
      aria-labelledby={`${baseId}-title`}
    >
      {!readingMode ? (
        <header className="fire-brief__header">
          {greeting ? (
            <p className="fire-brief__greeting" data-testid="fire-brief-greeting">
              {greeting}
            </p>
          ) : null}
          <h2 className="fire-brief__title" id={`${baseId}-title`}>
            {detail.reportName}
          </h2>
          <p className="fire-brief__date" data-testid="fire-brief-date">
            {detail.fullDateDisplay}
          </p>
          {detail.memberFacingProvenance ? (
            <p
              className="fire-brief__provenance"
              data-testid="fire-brief-provenance"
            >
              {detail.memberFacingProvenance}
            </p>
          ) : null}
        </header>
      ) : null}

      {readingMode ? (
        <div
          className="fire-brief__reading-toolbar"
          role="toolbar"
          aria-label="Reading mode controls"
        >
          <button
            ref={exitReadingRef}
            type="button"
            className="fire-brief-btn fire-brief-btn--primary"
            onClick={() => setReading(false)}
            data-testid="fire-exit-reading-mode"
          >
            Exit Reading Mode
          </button>
          <div className="fire-brief__menu" ref={textSizeMenuRef}>
            <button
              type="button"
              className="fire-brief-btn"
              aria-expanded={textSizeOpen}
              aria-haspopup="menu"
              onClick={() => setTextSizeOpen((v) => !v)}
              data-testid="fire-text-size-trigger"
            >
              Text Size: {FIRE_READING_SIZE_LABELS[readingSize]}
            </button>
            {textSizeOpen ? (
              <div className="fire-brief__menu-panel" role="menu">
                {FIRE_READING_SIZE_OPTIONS.map((size) => (
                  <button
                    key={size}
                    type="button"
                    role="menuitemradio"
                    aria-checked={readingSize === size}
                    className={`fire-brief-btn${
                      readingSize === size ? " fire-brief-btn--active" : ""
                    }`}
                    onClick={() => setSize(size)}
                    data-testid={`fire-text-size-${size}`}
                  >
                    {FIRE_READING_SIZE_LABELS[size]}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <button
            type="button"
            className="fire-brief-btn"
            onClick={goPrevSection}
            disabled={sectionIndex <= 0}
            data-testid="fire-prev-section"
          >
            Previous Section
          </button>
          <div className="fire-brief__menu">
            <button
              type="button"
              className="fire-brief-btn"
              aria-expanded={allSectionsOpen}
              onClick={() => setAllSectionsOpen((v) => !v)}
              data-testid="fire-all-sections"
            >
              All Sections
            </button>
            {allSectionsOpen ? (
              <div
                id={`${baseId}-all-sections`}
                className="fire-brief__menu-panel fire-brief__menu-panel--wide"
                role="menu"
              >
                {detail.sections.map((section, index) => (
                  <button
                    key={section.id}
                    type="button"
                    role="menuitem"
                    className="fire-brief-btn"
                    onClick={() => {
                      setAllSectionsOpen(false);
                      openSection(section.id, true);
                    }}
                  >
                    {index + 1}. {section.title}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <button
            type="button"
            className="fire-brief-btn"
            onClick={goNextSection}
            disabled={
              sectionIndex < 0 ||
              sectionIndex >= FIRE_BRIEF_SECTION_ORDER.length - 1
            }
            data-testid="fire-next-section"
          >
            Next Section
          </button>
        </div>
      ) : (
        <div
          className="fire-brief__controls"
          role="toolbar"
          aria-label="Brief viewing controls"
        >
          <button
            type="button"
            className={`fire-brief-btn${
              surface === "dashboard" ? " fire-brief-btn--active" : ""
            }`}
            aria-pressed={surface === "dashboard"}
            onClick={goDashboard}
            data-testid="fire-toolbar-overview"
          >
            Overview
          </button>
          <button
            type="button"
            className={`fire-brief-btn${
              surface === "sections" || surface === "section"
                ? " fire-brief-btn--active"
                : ""
            }`}
            aria-pressed={surface === "sections" || surface === "section"}
            onClick={() => openSurface("sections")}
            data-testid="fire-read-full-brief"
          >
            Full Brief
          </button>
          <div className="fire-brief__menu" ref={textSizeMenuRef}>
            <button
              type="button"
              className="fire-brief-btn"
              aria-expanded={textSizeOpen}
              aria-haspopup="menu"
              onClick={() => setTextSizeOpen((v) => !v)}
              data-testid="fire-text-size-trigger"
            >
              Text Size: {FIRE_READING_SIZE_LABELS[readingSize]}
            </button>
            {textSizeOpen ? (
              <div className="fire-brief__menu-panel" role="menu">
                {FIRE_READING_SIZE_OPTIONS.map((size) => (
                  <button
                    key={size}
                    type="button"
                    role="menuitemradio"
                    aria-checked={readingSize === size}
                    className={`fire-brief-btn${
                      readingSize === size ? " fire-brief-btn--active" : ""
                    }`}
                    onClick={() => setSize(size)}
                    data-testid={`fire-text-size-${size}`}
                  >
                    {FIRE_READING_SIZE_LABELS[size]}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div className="fire-brief__menu" ref={moreMenuRef}>
            <button
              type="button"
              className="fire-brief-btn"
              aria-expanded={moreOpen}
              aria-haspopup="menu"
              onClick={() => setMoreOpen((v) => !v)}
              data-testid="fire-toolbar-more"
            >
              More
            </button>
            {moreOpen ? (
              <div className="fire-brief__menu-panel" role="menu">
                <button
                  type="button"
                  role="menuitem"
                  className="fire-brief-btn"
                  onClick={expandAll}
                >
                  Expand All
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="fire-brief-btn"
                  onClick={collapseAll}
                >
                  Collapse All
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="fire-brief-btn"
                  onClick={openActionSections}
                  data-testid="fire-open-action-sections"
                >
                  Open Sections With Actions
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="fire-brief-btn"
                  onClick={() => {
                    setMoreOpen(false);
                    setSurface("section");
                    setReading(true);
                    if (!activeSectionId) {
                      openSection(
                        readLastBriefSection(portfolio.id) ??
                          FIRE_BRIEF_SECTION_ORDER[0],
                        true,
                      );
                    }
                  }}
                  data-testid="fire-enter-reading-mode"
                >
                  Reading Mode
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {showDashboard ? (
        <section
          className="fire-brief__dashboard"
          aria-labelledby={`${baseId}-dashboard`}
          data-testid="fire-brief-overview"
        >
          <h3 className="fire-brief__dashboard-title" id={`${baseId}-dashboard`}>
            Today’s starting points
          </h3>
          <p className="fire-brief__you-are-here" data-testid="fire-you-are-here">
            You are here: Overview
          </p>
          <div className="fire-brief__dashboard-grid" data-testid="fire-dashboard-cards">
            <button
              type="button"
              className="fire-dash-card fire-dash-card--attention"
              onClick={() => openSurface("attention")}
              data-testid="fire-dash-attention"
            >
              <span className="fire-dash-card__icon" aria-hidden="true">
                !
              </span>
              <span className="fire-dash-card__title">What Needs My Attention</span>
              <span className="fire-dash-card__body">
                {attentionCount > 0
                  ? detail.overview.alertsRequiringAttention[0]?.issue ??
                    "A few items need your judgment today."
                  : detail.overview.topPriority ??
                    "Nothing urgent is waiting — start where you prefer."}
              </span>
              <span className="fire-dash-card__meta">
                {attentionCount > 0
                  ? `${attentionCount} attention item${attentionCount === 1 ? "" : "s"}`
                  : "Clear morning"}
              </span>
              <span className="fire-dash-card__action">Open</span>
            </button>

            <button
              type="button"
              className="fire-dash-card fire-dash-card--actions"
              onClick={() => openSurface("actions")}
              data-testid="fire-dash-actions"
            >
              <span className="fire-dash-card__icon" aria-hidden="true">
                →
              </span>
              <span className="fire-dash-card__title">Today’s Founder Actions</span>
              <span className="fire-dash-card__body">
                {detail.overview.topPriority ??
                  "See the top three actions for today."}
              </span>
              <span className="fire-dash-card__meta">
                {todayActions === 1
                  ? "1 action today"
                  : `${todayActions} actions today`}
              </span>
              <span className="fire-dash-card__action">Open</span>
            </button>

            <button
              type="button"
              className="fire-dash-card fire-dash-card--alerts"
              onClick={() => openSurface("alerts")}
              data-testid="fire-dash-alerts"
            >
              <span className="fire-dash-card__icon" aria-hidden="true">
                ▲
              </span>
              <span className="fire-dash-card__title">Founder Alerts</span>
              <span className="fire-dash-card__body">
                {alertCount > 0
                  ? "Review alerts that may need a decision or watch."
                  : "No founder alerts in today’s brief."}
              </span>
              <span className="fire-dash-card__meta">
                {alertCount === 1 ? "1 alert" : `${alertCount} alerts`}
              </span>
              <span className="fire-dash-card__action">Open</span>
            </button>

            <button
              type="button"
              className="fire-dash-card fire-dash-card--izna"
              onClick={() => openSurface("izna")}
              data-testid="fire-dash-izna"
            >
              <span className="fire-dash-card__icon" aria-hidden="true">
                ✎
              </span>
              <span className="fire-dash-card__title">Izna’s Work Package</span>
              <span className="fire-dash-card__body">
                {detail.overview.iznaPriorityAssignment ??
                  "See what Izna should handle first."}
              </span>
              <span className="fire-dash-card__meta">
                {iznaCount === 1
                  ? "1 assignment"
                  : `${iznaCount} assignments`}
              </span>
              <span className="fire-dash-card__action">Open</span>
            </button>

            <button
              type="button"
              className="fire-dash-card fire-dash-card--full"
              onClick={() => openSurface("sections")}
              data-testid="fire-dash-full-brief"
            >
              <span className="fire-dash-card__icon" aria-hidden="true">
                ▣
              </span>
              <span className="fire-dash-card__title">Read the Full Brief</span>
              <span className="fire-dash-card__body">
                Browse all {FIRE_BRIEF_SECTION_ORDER.length} sections when you want
                the complete report.
              </span>
              <span className="fire-dash-card__meta">
                About {portfolio.readingTimeMinutes} min total
              </span>
              <span className="fire-dash-card__action">Open</span>
            </button>
          </div>
          {lastSectionId ? (
            <button
              type="button"
              className="fire-brief-btn fire-brief-btn--secondary fire-brief__resume"
              onClick={() => openSection(lastSectionId)}
              data-testid="fire-resume-last-section"
            >
              Return to last section read
            </button>
          ) : null}
        </section>
      ) : null}

      {showFocusedPanel ? (
        <section
          className="fire-brief__panel"
          data-testid="fire-focused-panel"
          aria-live="polite"
        >
          <p className="fire-brief__you-are-here">
            You are here:{" "}
            {surface === "attention"
              ? "What Needs My Attention"
              : surface === "actions"
                ? "Today’s Founder Actions"
                : surface === "alerts"
                  ? "Founder Alerts"
                  : "Izna’s Work Package"}
          </p>
          <button
            type="button"
            className="fire-brief-btn"
            onClick={goDashboard}
            data-testid="fire-back-overview"
          >
            Back to Overview
          </button>

          {surface === "attention" ? (
            <div className="fire-brief__panel-body">
              <h3 className="fire-brief__section-heading">What Needs My Attention</h3>
              {detail.overview.alertsRequiringAttention.length === 0 ? (
                <p className="fire-brief__body">
                  Nothing urgent is asking for a decision right now. Your top focus:{" "}
                  {detail.overview.topPriority ?? portfolio.primaryFocus}
                </p>
              ) : (
                detail.overview.alertsRequiringAttention.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))
              )}
            </div>
          ) : null}

          {surface === "actions" && actionSection ? (
            <div className="fire-brief__panel-body">
              <h3 className="fire-brief__section-heading">Today’s Founder Actions</h3>
              {sectionBodyContent({
                section: {
                  ...actionSection,
                  alerts: undefined,
                  iznaAssignments: undefined,
                  items: [],
                },
                reviewTick,
                onCopyIzna: handleCopyIzna,
                onMarkReview: (id) => {
                  markIznaForReview(id);
                  setReviewTick((n) => n + 1);
                },
                actionHorizonFilter: actionHorizon,
              })}
              <div className="fire-brief__panel-links">
                <button
                  type="button"
                  className={`fire-brief-btn${
                    actionHorizon === "this_week" ? " fire-brief-btn--active" : ""
                  }`}
                  onClick={() => setActionHorizon("this_week")}
                  data-testid="fire-view-this-week"
                >
                  View This Week
                </button>
                <button
                  type="button"
                  className={`fire-brief-btn${
                    actionHorizon === "watch" ? " fire-brief-btn--active" : ""
                  }`}
                  onClick={() => setActionHorizon("watch")}
                  data-testid="fire-view-watch"
                >
                  View Watch / Revisit
                </button>
                {actionHorizon !== "today_top3" ? (
                  <button
                    type="button"
                    className="fire-brief-btn"
                    onClick={() => setActionHorizon("today_top3")}
                  >
                    Back to Today’s Top Actions
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          {surface === "alerts" && alertsSection ? (
            <div className="fire-brief__panel-body">
              <h3 className="fire-brief__section-heading">Founder Alerts</h3>
              {sectionBodyContent({
                section: {
                  ...alertsSection,
                  actionPlan: undefined,
                  iznaAssignments: undefined,
                  items: [],
                },
                reviewTick,
                onCopyIzna: handleCopyIzna,
                onMarkReview: (id) => {
                  markIznaForReview(id);
                  setReviewTick((n) => n + 1);
                },
              })}
            </div>
          ) : null}

          {surface === "izna" && iznaSection ? (
            <div className="fire-brief__panel-body">
              <h3 className="fire-brief__section-heading">Izna’s Work Package</h3>
              {sectionBodyContent({
                section: {
                  ...iznaSection,
                  alerts: undefined,
                  actionPlan: undefined,
                  items: [],
                },
                reviewTick,
                onCopyIzna: handleCopyIzna,
                onMarkReview: (id) => {
                  markIznaForReview(id);
                  setReviewTick((n) => n + 1);
                },
                iznaPrimaryOnly: true,
                showMoreIzna,
                onShowMoreIzna: () => setShowMoreIzna(true),
              })}
            </div>
          ) : null}
        </section>
      ) : null}

      {showSectionGrid ? (
        <section
          className="fire-brief__section-grid-wrap"
          data-testid="fire-brief-sections"
          aria-labelledby={`${baseId}-sections`}
        >
          <p className="fire-brief__you-are-here">You are here: Full Brief</p>
          <h3 className="fire-brief__section-heading" id={`${baseId}-sections`}>
            Report sections
          </h3>
          <p className="fire-brief__body fire-brief__lede">
            Open one section at a time. Nothing is expanded until you choose it.
          </p>
          <div className="fire-brief__section-grid">
            {detail.sections.map((section, index) => {
              const minutes = estimateSectionReadingMinutes(
                sectionPlainText(section),
              );
              const isRead = readMarks.has(section.id);
              return (
                <article
                  key={section.id}
                  className={`fire-section-card fire-brief-section--${section.color}`}
                  data-section-id={section.id}
                  data-expanded={
                    expandAllMode || activeSectionId === section.id
                      ? "true"
                      : "false"
                  }
                >
                  <div className="fire-section-card__top">
                    <span className="fire-section-card__marker" aria-hidden="true" />
                    <span className="fire-section-card__icon" aria-hidden="true">
                      {section.icon}
                    </span>
                    <p className="fire-section-card__index">Section {index + 1}</p>
                  </div>
                  <h3 className="fire-section-card__title fire-brief-section__title">
                    {section.title}
                  </h3>
                  <p className="fire-section-card__synopsis">{section.synopsis}</p>
                  <p className="fire-section-card__meta">
                    {minutes ? `About ${minutes} min` : "Quick read"}
                    {isRead ? " · Read" : ""}
                  </p>
                  <button
                    type="button"
                    className="fire-brief-btn fire-brief-btn--open-section"
                    onClick={() => openSection(section.id)}
                  >
                    Open
                  </button>
                  {expandAllMode ? (
                    <div className="fire-brief-section__body">
                      {sectionBodyContent({
                        section,
                        reviewTick,
                        onCopyIzna: handleCopyIzna,
                        onMarkReview: (id) => {
                          markIznaForReview(id);
                          setReviewTick((n) => n + 1);
                        },
                      })}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {showOneSection && activeSection ? (
        <section
          id={`${baseId}-active-section`}
          className={`fire-brief__reader fire-brief-section fire-brief-section--${activeSection.color} fire-brief-section--open`}
          data-section-id={activeSection.id}
          data-expanded="true"
          data-testid="fire-active-section"
          aria-labelledby={`${baseId}-active-title`}
        >
          <p className="fire-brief__you-are-here" aria-live="polite">
            You are here: {activeSection.title}
            {sectionIndex >= 0
              ? ` · Section ${sectionIndex + 1} of ${FIRE_BRIEF_SECTION_ORDER.length}`
              : ""}
          </p>
          <header className="fire-brief__reader-header">
            <h3
              className="fire-brief__section-heading"
              id={`${baseId}-active-title`}
            >
              <span className="fire-brief-section__icon" aria-hidden="true">
                {activeSection.icon}
              </span>{" "}
              {activeSection.title}
            </h3>
            <p className="fire-brief-section__synopsis">{activeSection.synopsis}</p>
            {readingMinutes ? (
              <p className="fire-brief__reader-meta">
                About {readingMinutes} minute{readingMinutes === 1 ? "" : "s"} to read
              </p>
            ) : null}
          </header>
          <div className="fire-brief-section__body">
            {sectionBodyContent({
              section: activeSection,
              reviewTick,
              onCopyIzna: handleCopyIzna,
              onMarkReview: (id) => {
                markIznaForReview(id);
                setReviewTick((n) => n + 1);
              },
            })}
          </div>
          <div className="fire-brief__reader-actions">
            <button
              type="button"
              className="fire-brief-btn"
              onClick={goPrevSection}
              disabled={sectionIndex <= 0}
            >
              Previous Section
            </button>
            <button
              type="button"
              className="fire-brief-btn"
              onClick={goNextSection}
              disabled={
                sectionIndex < 0 ||
                sectionIndex >= FIRE_BRIEF_SECTION_ORDER.length - 1
              }
            >
              Next Section
            </button>
            {!readingMode ? (
              <button
                type="button"
                className="fire-brief-btn"
                onClick={() => openSurface("sections")}
              >
                Back to Overview
              </button>
            ) : null}
            <button
              type="button"
              className="fire-brief-btn fire-brief-btn--secondary"
              onClick={markCurrentRead}
              data-testid="fire-mark-read"
            >
              Mark as Read
            </button>
            <button
              type="button"
              className="fire-brief-btn fire-brief-btn--secondary"
              onClick={comeBackLater}
              data-testid="fire-come-back-later"
            >
              Come Back Later
            </button>
            {!readingMode ? (
              <button
                type="button"
                className="fire-brief-btn fire-brief-btn--primary"
                onClick={() => setReading(true)}
              >
                Continue in Reading Mode
              </button>
            ) : null}
          </div>
          {/* Keyboard-accessible section toggle proxy for tests / AT */}
          <button
            type="button"
            className="fire-brief-section__toggle sr-only"
            aria-expanded="true"
            aria-controls={`${baseId}-active-section`}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") {
                event.preventDefault();
                goNextSection();
              }
              if (event.key === "ArrowLeft") {
                event.preventDefault();
                goPrevSection();
              }
            }}
          >
            {activeSection.title}
          </button>
        </section>
      ) : null}

      {copyNotice || statusNotice ? (
        <p className="fire-brief__toast" role="status" aria-live="polite">
          {copyNotice ?? statusNotice}
        </p>
      ) : null}
    </article>
  );
}
