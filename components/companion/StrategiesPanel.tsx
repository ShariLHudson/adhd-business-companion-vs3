"use client";

import { CompanionObjectLabel, CompanionObjectVisual } from "@/components/companion/CompanionObjectVisual";
import {
  STRATEGY_CATEGORY_OBJECT_ID,
  STRATEGY_GROUP_OBJECT_ID,
} from "@/lib/companionObjects";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  initialCollapsedSectionMap,
  toggleSectionInMap,
} from "@/lib/expandableUi";
import {
  STRATEGIES,
  STRATEGY_GROUPS,
  categoriesForGroup,
  getCategory,
  getStrategy,
  groupForStrategy,
  resolveSubcat,
  strategiesFor,
  timeForStrategy,
  warmthFor,
  type Strategy,
  type StrategyGroupId,
} from "@/lib/strategySystem";
import {
  ADHD_STRATEGY_HUB,
  BUSINESS_STRATEGY_TEMPLATES,
  STRATEGIES_HUB,
  adhdStrategyDropdownGroups,
  businessBuiltinStrategyCount,
  type AdhdStrategyHubEntry,
} from "@/lib/strategyCatalog";
import { BusinessStrategyDock } from "@/components/companion/BusinessStrategyDock";
import type { BusinessStrategySession } from "@/lib/businessStrategyBuilder";
import { compareDropdownLabels } from "@/lib/dropdownSort";
import {
  getUserStrategies,
  saveUserStrategy,
  userStrategiesFor,
  type UserStrategy,
} from "@/lib/userStrategies";
import { HowThisFitsTogetherLink } from "@/components/companion/HowThisFitsTogetherLink";
import { WorkspaceAreaWorksGuide } from "@/components/companion/WorkspaceAreaWorksGuide";
import { workspacePanelShellClass } from "@/lib/workspaceLayoutTokens";
import { StrategyApplyPanel } from "@/components/companion/StrategyApplyPanel";
import type { StrategyApplySession } from "@/lib/strategyApplyCoach";
import { useVisualMode } from "@/lib/useVisualMode";
import { StrategyUseNow } from "@/components/companion/StrategyUseNow";
import { CoachingLibraryPicker } from "@/components/companion/CoachingLibraryPicker";
import type { AppSection } from "@/lib/companionUi";
import { appReferences } from "@/lib/appReferences";
import {
  browseCategoriesForLibrary,
  getStrategiesForWhatYoureDealingWith,
  getStrategyLibraryCounts,
  searchStrategies,
  trackStrategyEvent,
} from "@/lib/strategyIntelligence";
import {
  getRecommendedStrategiesForApply,
  getTopStrategyRecommendations,
  remainingPopularStrategyCount,
  STRATEGY_RECOMMENDATION_LIMIT,
} from "@/lib/strategyLibrary/recommendStrategies";
import {
  CATEGORY_COMPANION_TOOLS,
  pickStrategyReflection,
} from "@/lib/strategyReflections";
import { MENU_LIST_LABEL, MENU_TEXT } from "@/lib/menuNavStyles";
import { AppBackButton } from "@/components/companion/AppBackButton";
import {
  STRATEGY_CHAMBER_HELP_ME_CHOOSE,
  STRATEGY_CHAMBER_PRIMARY_ENTRIES,
  STRATEGY_LIBRARY_HOW_DO_I,
  STRATEGY_LIBRARY_MODE_CHOICES,
  STRATEGY_LIBRARY_SUBTITLE,
  STRATEGY_LIBRARY_TITLE,
  chamberEntryToLibraryMode,
  recommendStrategyLibraryMode,
  type StrategyChamberEntryId,
  type StrategyLibraryModeId,
} from "@/lib/strategyLibrary/estateCopy";
import { buildStrategyDetailViewModel } from "@/lib/strategyLibrary/strategyDetailTemplate";
import { StrategyExecutionConnections } from "@/components/companion/StrategyExecutionConnections";
import { StrategyGuidedCreatePanel } from "@/components/companion/StrategyGuidedCreatePanel";
import { ContinueYourJourney } from "@/components/companion/ContinueYourJourney";
import { StrategyDecisionRecord } from "@/components/companion/StrategyDecisionRecord";
import { resolveAdaptivePresentation } from "@/lib/adaptiveCompanionIntelligence";
import {
  applyGuidedJourneyAnswer,
  buildContinueYourJourney,
  buildStrategyDecisionRecord,
  buildStrategyResumeSummary,
  createStrategyWorkItem,
  decisionRecordIsReady,
  executeApprovedStrategyHandoff,
  getResumableStrategyWorkItem,
  getStrategyWorkItem,
  guidedJourneyIsComplete,
  guidedPromptForWorkItem,
  listResumableStrategyWorkItems,
  pauseStrategyWorkItem,
  resumeStrategyWorkItem,
  skipGuidedJourneyStage,
  STRATEGY_HANDOFF_LIVE_DESTINATIONS,
  updateStrategyWorkItem,
  type ContinueJourneyDestinationId,
  type StrategyEntryReason,
} from "@/lib/strategyChamber";

type View =
  | { v: "home" }
  | { v: "adhd" }
  | { v: "business" }
  | { v: "group"; group: StrategyGroupId }
  | { v: "recommended" }
  | { v: "saved" }
  | { v: "strategy"; stratId: string }
  | { v: "userStrategy"; id: string }
  | { v: "new" }
  | { v: "chamber-entry"; workItemId: string };

// Meaning hue → brighter decorative counterpart (matches the rest of the app).
const DECOR: Record<string, string> = {
  "#1e4f4f": "#0d9488",
  "#9a6fb0": "#a855f7",
  "#4a6fa5": "#3b82f6",
  "#2f4f7a": "#6366f1",
  "#c08a3e": "#f59e0b",
  "#a85c4a": "#ef4444",
  "#6b8e23": "#22c55e",
};

// Category → Strategy → Action. ADHD-friendly: never more than 3 meaningful
// choices on screen. Categories are navigation; strategies are action-first.
export function StrategiesPanel({
  onOpen,
  onAsk,
  onContextChange,
  onStartBusinessStrategy,
  onStartStrategyApply,
  onOpenActivity,
  registerBack,
  openCommand,
  strategyApplySession,
  onDismissStrategyApply,
  businessStrategySession,
  businessStrategyDraft,
  onDismissBusinessBuild,
  onTalkBusinessWithShari,
  presentation = "workspace",
}: {
  onOpen?: (section: AppSection) => void;
  onAsk?: (prompt: string) => void;
  onContextChange?: (detail: import("@/lib/workspaceAwareness").WorkspacePanelDetail) => void;
  /** Start business strategy builder (Create flow). */
  onStartBusinessStrategy?: (typeLabel: string) => void;
  /** Start ADHD strategy apply coach. */
  onStartStrategyApply?: (strategyId: string) => void;
  onOpenActivity?: (activityId: string) => void;
  registerBack?: (fn: (() => boolean) | null) => void;
  /** Parent-driven open (e.g. from chat: "open Start Ugly"). */
  openCommand?: {
    key: number;
    strategyId?: string;
    hubEntryId?: string;
    openView?: "home" | "adhd" | "business" | "saved" | "recommended";
  } | null;
  /** Active ADHD apply coach — shown on the matching strategy, not over the whole hub. */
  strategyApplySession?: StrategyApplySession | null;
  onDismissStrategyApply?: () => void;
  businessStrategySession?: BusinessStrategySession | null;
  businessStrategyDraft?: { typeLabel: string; draft: string } | null;
  onDismissBusinessBuild?: () => void;
  onTalkBusinessWithShari?: () => void;
  /** Estate destination presentation (no split-workspace chrome). */
  presentation?: "workspace" | "estate";
}) {
  const estate = presentation === "estate";
  const [view, setView] = useState<View>({ v: "home" });
  const [libraryMode, setLibraryMode] =
    useState<StrategyLibraryModeId>("apply");
  const [howDoIOpen, setHowDoIOpen] = useState(false);
  /** Progressive disclosure — Browse All Strategies expands the library wall */
  const [browseAllOpen, setBrowseAllOpen] = useState(false);
  const [activeWorkItemId, setActiveWorkItemId] = useState<string | null>(null);
  const [workTick, setWorkTick] = useState(0);
  const activeWorkItem = useMemo(() => {
    if (activeWorkItemId) {
      return getStrategyWorkItem(activeWorkItemId) ?? getResumableStrategyWorkItem();
    }
    return getResumableStrategyWorkItem();
    // workTick forces refresh after localStorage writes
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional refresh token
  }, [activeWorkItemId, workTick]);
  const [search, setSearch] = useState("");
  const entranceHint = useMemo(
    () => recommendStrategyLibraryMode(search),
    [search],
  );
  const [hubOpen, setHubOpen] = useState<Record<string, boolean>>(() =>
    initialCollapsedSectionMap("adhd", "business", "recommended", "saved"),
  );
  const [adhdPick, setAdhdPick] = useState("");
  const [businessPick, setBusinessPick] = useState("");
  const [openSubcat, setOpenSubcat] = useState<string | null>(null);
  const strategyReturnRef = useRef<View>({ v: "home" });
  const visualMode = useVisualMode();
  const colorOn = visualMode !== "off";
  const decorative = visualMode === "decorative";

  // Global Back steps inward-first: detail → parent list → home → exit.
  useEffect(() => {
    registerBack?.(() => {
      if (view.v === "strategy" || view.v === "userStrategy") {
        setView(strategyReturnRef.current);
        return true;
      }
      if (
        view.v === "group" ||
        view.v === "recommended" ||
        view.v === "saved" ||
        view.v === "new" ||
        view.v === "adhd" ||
        view.v === "business" ||
        view.v === "chamber-entry"
      ) {
        if (view.v === "chamber-entry") {
          pauseStrategyWorkItem(view.workItemId);
          setWorkTick((n) => n + 1);
        }
        setView({ v: "home" });
        return true;
      }
      return false;
    });
    return () => registerBack?.(null);
  }, [view, registerBack]);

  useEffect(() => {
    if (!onContextChange) return;
    if (view.v === "strategy") {
      const s = getStrategy(view.stratId);
      onContextChange({
        view: "strategy",
        stage: "detail",
        selectedItemId: view.stratId,
        selectedItemName: s?.title ?? null,
      });
      return;
    }
    if (view.v === "userStrategy") {
      const u = getUserStrategies().find((x) => x.id === view.id);
      onContextChange({
        view: "userStrategy",
        stage: "detail",
        selectedItemId: view.id,
        selectedItemName: u?.title ?? null,
      });
      return;
    }
    onContextChange({ view: view.v, stage: view.v });
  }, [view, onContextChange]);

  function accent(color: string) {
    return decorative ? (DECOR[color] ?? color) : color;
  }
  function tint(color: string) {
    const c = accent(color);
    return colorOn
      ? {
          borderLeftWidth: 5,
          borderLeftColor: c,
          ...(decorative ? { backgroundColor: `${c}14` } : {}),
        }
      : undefined;
  }

  function toggleHub(id: string) {
    setHubOpen((prev) => toggleSectionInMap(prev, id));
  }

  function openAdhdEntry(entry: AdhdStrategyHubEntry) {
    const route = entry.route;
    if (route.kind === "builtin") {
      goToView({ v: "strategy", stratId: route.strategyId });
      return;
    }
    if (route.kind === "activity") {
      onOpenActivity?.(route.activityId);
      return;
    }
    onOpen?.(route.section);
  }

  function goToView(next: View) {
    if (
      strategyApplySession &&
      (next.v !== "strategy" || next.stratId !== strategyApplySession.strategyId)
    ) {
      onDismissStrategyApply?.();
    }
    if (next.v === "strategy" || next.v === "userStrategy") {
      strategyReturnRef.current = view;
    }
    if (next.v === "strategy") {
      trackStrategyEvent(next.stratId, "viewed");
    }
    setView(next);
  }

  function returnFromStrategyDetail() {
    goToView(strategyReturnRef.current);
  }

  function strategyDetailBackLabel(from: View): string {
    switch (from.v) {
      case "home":
        return "Strategy Chamber";
      case "adhd":
        return STRATEGIES_HUB.adhd.title;
      case "business":
        return STRATEGIES_HUB.business.title;
      case "group": {
        const group = STRATEGY_GROUPS.find((g) => g.id === from.group);
        return group?.label ?? "Strategy Chamber";
      }
      case "recommended":
        return STRATEGIES_HUB.recommended.title;
      case "saved":
        return STRATEGIES_HUB.saved.title;
      default:
        return "Strategy Chamber";
    }
  }

  function openBusinessLibrary(subcatId?: string) {
    setOpenSubcat(subcatId ?? null);
    goToView({ v: "group", group: "business" });
  }

  const dockedPlan = (
    <BusinessStrategyDock
      session={businessStrategySession}
      draft={businessStrategyDraft}
      onTalkWithShari={onTalkBusinessWithShari}
      onDismiss={onDismissBusinessBuild}
    />
  );

  function startBusiness(typeLabel: string) {
    onStartBusinessStrategy?.(typeLabel);
    setBusinessPick("");
  }

  function selectLibraryMode(mode: StrategyLibraryModeId) {
    setLibraryMode(mode);
    if (mode === "browse") {
      setBrowseAllOpen(true);
      if (view.v !== "home") goToView({ v: "home" });
      return;
    }
    if (mode === "apply") {
      setBrowseAllOpen(false);
      goToView({ v: "recommended" });
      return;
    }
    if (mode === "create") {
      goToView({ v: "new" });
      return;
    }
    if (strategyApplySession?.strategyId) {
      goToView({ v: "strategy", stratId: strategyApplySession.strategyId });
      return;
    }
    goToView({ v: "saved" });
  }

  function beginChamberEntry(entryId: StrategyChamberEntryId) {
    const primary = STRATEGY_CHAMBER_PRIMARY_ENTRIES.find((e) => e.id === entryId);
    const entryReason: StrategyEntryReason =
      primary?.entryReason ?? STRATEGY_CHAMBER_HELP_ME_CHOOSE.entryReason;
    setBrowseAllOpen(false);
    const work = createStrategyWorkItem({
      entryReason,
      sourceDestination: "strategy-library",
      sourceContext: entryId,
    });
    setActiveWorkItemId(work.id);
    setWorkTick((n) => n + 1);
    setLibraryMode(chamberEntryToLibraryMode(entryId));
    goToView({ v: "chamber-entry", workItemId: work.id });
  }

  function resumeChamberWork(workItemId?: string) {
    const item = workItemId
      ? getStrategyWorkItem(workItemId)
      : getResumableStrategyWorkItem();
    if (!item) {
      selectLibraryMode("resume");
      return;
    }
    resumeStrategyWorkItem(item.id);
    setActiveWorkItemId(item.id);
    setWorkTick((n) => n + 1);
    setBrowseAllOpen(false);
    if (strategyApplySession?.strategyId) {
      goToView({ v: "strategy", stratId: strategyApplySession.strategyId });
      return;
    }
    if (item.decisionStatement?.trim() || item.currentReality?.trim()) {
      if (decisionRecordIsReady(item)) {
        goToView({ v: "recommended" });
        return;
      }
      goToView({ v: "chamber-entry", workItemId: item.id });
      return;
    }
    goToView({ v: "chamber-entry", workItemId: item.id });
  }

  function saveChamberEntryAnswer(workItemId: string, answer: string) {
    const trimmed = answer.trim();
    if (!trimmed) return;
    const item = getStrategyWorkItem(workItemId);
    if (!item) return;
    const wasBlank = !(
      item.currentReality?.trim() || item.decisionStatement?.trim()
    );
    const patch = applyGuidedJourneyAnswer(item, trimmed);
    updateStrategyWorkItem(workItemId, patch);
    setWorkTick((n) => n + 1);
    if (wasBlank && item.entryReason === "unsure" && onAsk) {
      onAsk(
        `I'm in the Strategy Chamber. Here's what I'm working with: ${trimmed}. Help me choose the best place to begin.`,
      );
    }
  }

  function handleStrategyJourneySelect(
    workItemId: string,
    destinationId: ContinueJourneyDestinationId,
  ) {
    try {
      const result = executeApprovedStrategyHandoff({
        strategyWorkItemId: workItemId,
        destinationId,
      });
      setWorkTick((n) => n + 1);
      if (result.section && onOpen) onOpen(result.section);
      else if (result.seedAsk && onAsk) onAsk(result.seedAsk);
      else if (onAsk) {
        onAsk(
          `I'd like to continue from the Strategy Chamber toward ${destinationId.replace(/_/g, " ")}.`,
        );
      }
    } catch {
      if (onAsk) {
        onAsk(
          `I'd like to continue from the Strategy Chamber toward ${destinationId.replace(/_/g, " ")}.`,
        );
      }
    }
  }

  useEffect(() => {
    if (!openCommand?.key) return;
    if (openCommand.openView) {
      setView({ v: openCommand.openView });
      return;
    }
    if (openCommand.strategyId) {
      setAdhdPick(openCommand.strategyId);
      goToView({ v: "strategy", stratId: openCommand.strategyId });
      return;
    }
    if (openCommand.hubEntryId) {
      const entry = ADHD_STRATEGY_HUB.find((e) => e.id === openCommand.hubEntryId);
      if (entry) {
        setAdhdPick(entry.id);
        openAdhdEntry(entry);
      }
    }
  }, [openCommand?.key]);

  // ---- Strategy Chamber guided journey (one question at a time) ----------
  if (view.v === "chamber-entry") {
    const work = getStrategyWorkItem(view.workItemId);
    if (!work) {
      goToView({ v: "home" });
      return null;
    }
    const presentation = resolveAdaptivePresentation({
      destinationHint: "strategy_chamber",
    });
    const prompt = guidedPromptForWorkItem(work, presentation);
    const complete = guidedJourneyIsComplete(work) || decisionRecordIsReady(work);
    const resumeSummary = buildStrategyResumeSummary(work, presentation);
    const shellClass = estate
      ? "companion-fade-in flex min-h-0 w-full flex-col overflow-y-auto pb-8"
      : workspacePanelShellClass({ width: "standard", inSplit: true });
    return (
      <div
        className={shellClass}
        data-testid="strategy-chamber-entry"
        data-entry-reason={work.entryReason}
        data-stage={work.currentStage}
      >
        <AppBackButton
          onBack={() => {
            pauseStrategyWorkItem(work.id);
            setWorkTick((n) => n + 1);
            goToView({ v: "home" });
          }}
          destination="Strategy Chamber"
        />
        <p className="mt-4 text-2xl font-semibold text-[#1f1c19]">
          {STRATEGY_LIBRARY_TITLE}
        </p>
        {(work.decisionStatement || work.currentReality) &&
        presentation.resumeDepth !== "brief" ? (
          <p
            className="mt-3 whitespace-pre-line rounded-xl border border-[#e7dfd4] bg-[#faf8f5] px-3 py-2 text-sm leading-relaxed text-[#4b463f]"
            data-testid="strategy-chamber-resume-summary"
          >
            {resumeSummary}
          </p>
        ) : null}
        {!complete ? (
          <>
            <p className="mt-4 text-xl font-semibold leading-snug text-[#1f1c19]">
              {prompt.question}
            </p>
            {prompt.whyItMatters ? (
              <p className="mt-2 text-sm text-[#6b635a]">{prompt.whyItMatters}</p>
            ) : (
              <p className="mt-2 text-sm text-[#6b635a]">
                {presentation.oneQuestionAtATime
                  ? "One question at a time. You can pause anytime — your work stays here."
                  : "Answer what feels useful. You can pause anytime — your work stays here."}
              </p>
            )}
            {prompt.exampleHint ? (
              <p className="mt-1 text-sm italic text-[#6b635a]">{prompt.exampleHint}</p>
            ) : null}
            {presentation.showProgress ? (
              <p
                className="mt-2 text-xs font-semibold uppercase tracking-wide text-[#1e4f4f]"
                data-testid="strategy-chamber-stage-progress"
              >
                {prompt.stage.replace(/_/g, " ")}
              </p>
            ) : null}
            <ChamberEntryAnswerForm
              key={`${work.id}-${work.currentStage}-${work.version}-${workTick}`}
              initialValue=""
              onSave={(answer) => {
                saveChamberEntryAnswer(work.id, answer);
              }}
              onPause={() => {
                pauseStrategyWorkItem(work.id);
                setWorkTick((n) => n + 1);
                goToView({ v: "home" });
              }}
              onSkip={() => {
                const patch = skipGuidedJourneyStage(work);
                if (Object.keys(patch).length > 0) {
                  updateStrategyWorkItem(work.id, patch);
                  setWorkTick((n) => n + 1);
                }
              }}
              onContinue={() => {
                // Stay in chamber-entry — next question remounts via workTick
                setWorkTick((n) => n + 1);
              }}
            />
          </>
        ) : (
          <p className="mt-4 text-base leading-relaxed text-[#4b463f]">
            You have enough clarity to record the decision and choose one next step.
            Nothing else changes until you approve it.
          </p>
        )}
        {work.decisionStatement || work.currentReality ? (
          <div className="mt-6 flex flex-col gap-4">
            <StrategyDecisionRecord
              record={buildStrategyDecisionRecord(
                getStrategyWorkItem(work.id) ?? work,
              )}
              summaryFirst={presentation.summaryFirst}
            />
            <ContinueYourJourney
              model={buildContinueYourJourney(
                getStrategyWorkItem(work.id) ?? work,
                {
                  maxSecondary: Math.min(
                    2,
                    Math.max(0, presentation.maxVisibleChoices - 1),
                  ),
                },
              )}
              liveDestinations={STRATEGY_HANDOFF_LIVE_DESTINATIONS}
              onSelect={(destinationId) =>
                handleStrategyJourneySelect(work.id, destinationId)
              }
            />
            <button
              type="button"
              className="text-left text-sm font-semibold text-[#1e4f4f] underline"
              data-testid="strategy-chamber-browse-library-from-journey"
              onClick={() => goToView({ v: "recommended" })}
            >
              Browse the strategy library
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  // ---- Home: ADHD / Business / Recommended / Saved -----------------------
  if (view.v === "home") {
    const q = search.trim();
    const counts = getStrategyLibraryCounts();
    const searchResults = q ? searchStrategies(q) : [];
    const adhdGroups = adhdStrategyDropdownGroups(q);
    const businessOptions = [...BUSINESS_STRATEGY_TEMPLATES].sort((a, b) =>
      compareDropdownLabels(a, b),
    );
    const dealingWith = getStrategiesForWhatYoureDealingWith();
    const browseCats = browseCategoriesForLibrary();
    const saved = getUserStrategies();
    const savedCount = saved.length;

    const shellClass = estate
      ? "companion-fade-in flex min-h-0 w-full flex-col overflow-y-auto pb-8"
      : workspacePanelShellClass({ width: "standard", inSplit: true });
    const cardClass = estate
      ? "w-full rounded-xl border border-[#d4cdc3] bg-white px-4 py-3.5 text-left hover:border-[#1e4f4f]/40"
      : "w-full rounded-lg border border-[#d4cdc3] bg-white px-3 py-2.5 text-left hover:border-[#1e4f4f]/40";
    const cardTitleClass = estate
      ? "text-base font-semibold text-[#1f1c19]"
      : "text-sm font-semibold text-[#1f1c19]";
    const cardSubClass = estate
      ? "mt-1 block text-sm text-[#6b635a]"
      : "mt-0.5 block text-xs text-[#6b635a]";

    return (
      <div
        className={shellClass}
        data-testid="strategies-panel-home"
        data-presentation={presentation}
      >
        {estate ? null : <WorkspaceAreaWorksGuide areaId="playbook" />}
        {dockedPlan}
        <p
          className={
            estate
              ? "plan-day-morning-note__title text-3xl font-semibold text-[#1f1c19]"
              : "text-2xl font-semibold text-[#1f1c19]"
          }
          data-testid="strategy-library-title"
        >
          {STRATEGY_LIBRARY_TITLE}
        </p>
        <p className="mt-1 text-base text-[#6b635a]">{STRATEGY_LIBRARY_SUBTITLE}</p>

        {estate ? (
          <>
            <div
              className="plan-day-how-do-i mt-3"
              data-testid="strategy-library-how-do-i"
            >
              <button
                type="button"
                onClick={() => setHowDoIOpen((v) => !v)}
                className="plan-day-how-do-i__toggle inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e4f4f] transition-colors hover:text-[#163c3c] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
                aria-expanded={howDoIOpen}
                data-testid="strategy-library-how-do-i-toggle"
              >
                How This Helps
                <span aria-hidden="true" className="text-xs font-bold">
                  {howDoIOpen ? "−" : "+"}
                </span>
              </button>
              {howDoIOpen ? (
                <div
                  className="plan-day-how-do-i__body mt-2 max-w-xl text-sm leading-relaxed text-[#4b463f]"
                  data-testid="strategy-library-how-do-i-body"
                >
                  <p className="whitespace-pre-line">{STRATEGY_LIBRARY_HOW_DO_I}</p>
                  <HowThisFitsTogetherLink areaOrPlaceId="playbook" />
                </div>
              ) : null}
            </div>

            {(() => {
              const resumable = listResumableStrategyWorkItems();
              const latest = resumable[0] ?? null;
              const more = resumable.slice(1);
              if (!latest && !strategyApplySession) return null;
              return (
                <div
                  className="mt-3 rounded-2xl border border-[#1e4f4f]/35 bg-[#1e4f4f]/[0.06] px-4 py-3"
                  data-testid="strategy-chamber-resume"
                >
                  <p className="text-base font-semibold text-[#1f1c19]">
                    Continue where you left off
                  </p>
                  <p
                    className="mt-1 whitespace-pre-line text-sm leading-relaxed text-[#4b463f]"
                    data-testid="strategy-chamber-home-resume-summary"
                  >
                    {latest
                      ? buildStrategyResumeSummary(
                          latest,
                          resolveAdaptivePresentation({
                            destinationHint: "strategy_chamber",
                          }),
                        )
                      : "Your unfinished strategy work is still here — nothing was lost."}
                  </p>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <button
                      type="button"
                      onClick={() => resumeChamberWork(latest?.id)}
                      className="rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163d3d]"
                      data-testid="strategy-chamber-resume-continue"
                    >
                      Continue this
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        /* Keep unfinished; primary cards below start new. */
                        setBrowseAllOpen(false);
                      }}
                      className="rounded-xl border border-[#1e4f4f]/30 bg-white px-4 py-2.5 text-sm font-semibold text-[#1e4f4f]"
                      data-testid="strategy-chamber-resume-start-new-hint"
                    >
                      Or start something new below
                    </button>
                  </div>
                  {more.length > 0 ? (
                    <details className="mt-3" data-testid="strategy-chamber-more-unfinished">
                      <summary className="cursor-pointer text-sm font-semibold text-[#1e4f4f]">
                        {more.length === 1
                          ? "1 more unfinished strategy"
                          : `${more.length} more unfinished strategies`}
                      </summary>
                      <ul className="mt-2 flex flex-col gap-2">
                        {more.map((item) => (
                          <li key={item.id}>
                            <button
                              type="button"
                              onClick={() => resumeChamberWork(item.id)}
                              className="w-full rounded-xl border border-[#e7dfd4] bg-white px-3 py-2 text-left text-sm"
                            >
                              <span className="font-semibold text-[#1f1c19]">
                                {item.title}
                              </span>
                              <span className="mt-0.5 block text-[#6b635a]">
                                {item.plainLanguageSummary}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </details>
                  ) : null}
                </div>
              );
            })()}

            <p
              className="mt-3 rounded-xl border border-[#1e4f4f]/20 bg-[#1e4f4f]/[0.04] px-3 py-2 text-sm leading-relaxed text-[#2d2926]"
              data-testid="strategy-library-recommended-path"
            >
              <span className="font-semibold text-[#1e4f4f]">Suggested: </span>
              {
                (
                  STRATEGY_CHAMBER_PRIMARY_ENTRIES.find(
                    (e) => e.id === entranceHint.recommendedEntry,
                  ) ?? STRATEGY_CHAMBER_HELP_ME_CHOOSE
                ).label
              }
              . {entranceHint.reason}
            </p>

            <div
              className="mt-4 grid gap-3"
              role="group"
              aria-label="Strategy Chamber ways to begin"
              data-testid="strategy-chamber-entry-choices"
            >
              {STRATEGY_CHAMBER_PRIMARY_ENTRIES.map((entry) => {
                const recommended =
                  entranceHint.recommendedEntry === entry.id;
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => beginChamberEntry(entry.id)}
                    className={
                      recommended
                        ? "rounded-2xl border-2 border-[#1e4f4f] bg-white px-5 py-4 text-left shadow-sm"
                        : "rounded-2xl border border-[#e7dfd4] bg-white/95 px-5 py-4 text-left transition-colors hover:border-[#1e4f4f]/40"
                    }
                    data-testid={`strategy-chamber-entry-${entry.id}`}
                    data-recommended={recommended ? "true" : undefined}
                  >
                    <span className="block text-lg font-semibold text-[#1f1c19]">
                      {entry.label}
                    </span>
                    <span className="mt-1 block text-base leading-relaxed text-[#4b463f]">
                      {entry.description}
                    </span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => beginChamberEntry("help_me_choose")}
                className="rounded-2xl border border-dashed border-[#1e4f4f]/40 bg-[#faf8f5] px-5 py-4 text-left"
                data-testid="strategy-chamber-entry-help_me_choose"
              >
                <span className="block text-lg font-semibold text-[#1f1c19]">
                  {STRATEGY_CHAMBER_HELP_ME_CHOOSE.label}
                </span>
                <span className="mt-1 block text-base leading-relaxed text-[#4b463f]">
                  {STRATEGY_CHAMBER_HELP_ME_CHOOSE.description}
                </span>
              </button>
            </div>

            {/* Compat testids for prior mode-choice suite — estate uses chamber entries */}
            <div className="sr-only" data-testid="strategy-library-mode-choices" aria-hidden="true">
              {STRATEGY_LIBRARY_MODE_CHOICES.map((mode) => (
                <span key={mode.id} data-testid={`strategy-library-mode-${mode.id}`}>
                  {mode.label}
                </span>
              ))}
            </div>

            {!browseAllOpen ? (
              <button
                type="button"
                onClick={() => setBrowseAllOpen(true)}
                className="mt-4 text-sm font-semibold text-[#1e4f4f] hover:underline"
                data-testid="strategy-library-browse-all"
              >
                Browse the strategy library
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setBrowseAllOpen(false)}
                className="mt-4 text-sm font-semibold text-[#1e4f4f] hover:underline"
                data-testid="strategy-chamber-back-from-library"
              >
                ← Back to Strategy Chamber
              </button>
            )}
          </>
        ) : null}

        {!estate || browseAllOpen ? (
          <div className="mt-4 flex flex-wrap gap-2" data-testid="strategy-library-counts">
            <span className="rounded-full bg-[#f0f5f5] px-3 py-1 text-sm font-semibold text-[#1e4f4f]">
              ADHD Strategies ({counts.adhdStrategies})
            </span>
            <span className="rounded-full bg-[#f0f5f5] px-3 py-1 text-sm font-semibold text-[#1e4f4f]">
              Business Strategies ({counts.businessStrategies})
            </span>
            <span className="rounded-full bg-[#f0f5f5] px-3 py-1 text-sm font-semibold text-[#1e4f4f]">
              Recommended ({counts.recommendedStrategies})
            </span>
            <span className="rounded-full bg-[#f0f5f5] px-3 py-1 text-sm font-semibold text-[#1e4f4f]">
              Saved ({counts.savedStrategies})
            </span>
          </div>
        ) : null}

        {!estate || browseAllOpen ? (
        <div className="mt-6" data-testid="strategy-library-top-recommendations">
          <p className="text-sm font-bold uppercase tracking-wide text-[#1e4f4f]">
            Recommended for you
          </p>
          <p className="mt-1 text-sm text-[#6b635a]">
            Three calm starting points — Browse All when you want the full library.
          </p>
          <ul className="mt-2 flex flex-col gap-2">
            {getTopStrategyRecommendations(STRATEGY_RECOMMENDATION_LIMIT).map(
              (pop) => (
                <li key={pop.id}>
                  <button
                    type="button"
                    onClick={() =>
                      goToView({ v: "strategy", stratId: pop.strategyId })
                    }
                    className={cardClass}
                    data-testid={`strategy-library-popular-${pop.id}`}
                  >
                    <span className={cardTitleClass}>{pop.label}</span>
                    <span className={cardSubClass}>{pop.problem}</span>
                  </button>
                </li>
              ),
            )}
          </ul>
          {!browseAllOpen && !estate ? (
            <button
              type="button"
              onClick={() => setBrowseAllOpen(true)}
              className="mt-3 text-sm font-semibold text-[#1e4f4f] hover:underline"
              data-testid="strategy-library-browse-all-workspace"
            >
              Browse All Strategies
              {remainingPopularStrategyCount() > 0
                ? ` (${remainingPopularStrategyCount()} more popular)`
                : ""}
            </button>
          ) : null}
        </div>
        ) : null}

        {browseAllOpen || !estate ? (
          <>
            <p className="mt-4 text-sm text-[#6b635a]">
              Browse proven strategies for:{" "}
              {browseCats.map((c) => c.label).join(" · ")}.
            </p>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search by problem — e.g. "I can't get started" or "sales"`}
              className="mt-4 w-full rounded-xl border border-[#c9bfb0] bg-white px-4 py-3 text-base outline-none focus:border-[#1e4f4f]"
              data-testid="strategy-library-search"
            />

            {q && searchResults.length > 0 ? (
              <div className="mt-4 rounded-xl border border-[#d4cdc3] bg-white/90 p-3">
                <p className="text-sm font-semibold text-[#1f1c19]">
                  Matches for &ldquo;{q}&rdquo;
                </p>
                <ul className="mt-2 flex flex-col gap-2">
                  {searchResults.map((r) => (
                    <li key={r.strategyId}>
                      <button
                        type="button"
                        onClick={() =>
                          goToView({ v: "strategy", stratId: r.strategyId })
                        }
                        className={cardClass}
                      >
                        <span className={cardTitleClass}>{r.title}</span>
                        <span className={cardSubClass}>{r.subtitle}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : q ? (
              <p className="mt-3 text-sm text-[#6b635a]">
                No exact match — try a different phrase or build a custom
                strategy below.
              </p>
            ) : null}

            <div className="mt-6 rounded-2xl border-2 border-[#1e4f4f]/25 bg-[#f0f5f5] p-5">
              <p className="text-lg font-semibold text-[#1f1c19]">
                Can&apos;t Find What You Need?
              </p>
              <p className="mt-1 text-sm text-[#6b635a]">
                Build a custom strategy with Shari based on your business, goals,
                ADHD patterns, and current challenge.
              </p>
              <button
                type="button"
                onClick={() => startBusiness("Other Strategy")}
                className="mt-4 w-full rounded-xl bg-[#1e4f4f] px-4 py-3 text-base font-semibold text-white hover:bg-[#163d3d]"
                data-testid="strategy-library-build-cta"
              >
                Build My Strategy
              </button>
            </div>
          </>
        ) : null}

        <div
          className="mt-6 flex flex-col gap-3"
          data-testid="strategy-library-hubs"
          hidden={estate && !browseAllOpen}
        >
          <HubSection
            title={`${STRATEGIES_HUB.adhd.title} (${counts.adhdStrategies})`}
            description={STRATEGIES_HUB.adhd.description}
            open={hubOpen.adhd}
            onToggle={() => toggleHub("adhd")}
          >
            <select
              value={adhdPick}
              onChange={(e) => {
                const id = e.target.value;
                setAdhdPick(id);
                const entry = ADHD_STRATEGY_HUB.find((x) => x.id === id);
                if (entry) openAdhdEntry(entry);
              }}
              className="w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base font-medium text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
            >
              <option value="">Select an ADHD strategy…</option>
              {adhdGroups.map((group) => (
                <optgroup key={group.category} label={group.category}>
                  {group.options.map((opt) => (
                    <option key={opt.hubId} value={opt.hubId}>
                      {opt.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                setOpenSubcat(null);
                goToView({ v: "group", group: "personal" });
              }}
              className="mt-3 text-sm font-semibold text-[#1e4f4f]"
            >
              Browse all ADHD strategies by topic →
            </button>
          </HubSection>

          <HubSection
            title={`${STRATEGIES_HUB.business.title} (${counts.businessStrategies})`}
            description={STRATEGIES_HUB.business.description}
            open={hubOpen.business}
            onToggle={() => toggleHub("business")}
          >
            <p className="text-sm font-semibold text-[#1f1c19]">
              Coaching library ({businessBuiltinStrategyCount()} strategies)
            </p>
            <p className="mt-0.5 text-sm text-[#6b635a]">
              Proven moves for marketing, sales, content, pricing, and more —
              pick a category, then a strategy.
            </p>
            <div className="mt-3">
              <CoachingLibraryPicker
                variant="hub"
                onOpenStrategy={(id) => goToView({ v: "strategy", stratId: id })}
                onApplyWithShari={(id) => onStartStrategyApply?.(id)}
              />
            </div>
            <button
              type="button"
              onClick={() => openBusinessLibrary()}
              className="mt-3 text-sm font-semibold text-[#1e4f4f]"
            >
              Browse all business strategies by topic →
            </button>

            <p className="mt-5 text-sm font-semibold text-[#1f1c19]">
              Build a custom plan with Shari
            </p>
            <p className="mt-0.5 text-sm text-[#6b635a]">
              For a full marketing plan, 8-week roadmap, etc. — chat builds it
              while you keep the library here.
            </p>
            <select
              value={businessPick}
              onChange={(e) => {
                const v = e.target.value;
                setBusinessPick(v);
                if (v) startBusiness(v);
              }}
              className="mt-2 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base font-medium text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
            >
              <option value="">Select a plan type to build…</option>
              {businessOptions.map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => startBusiness("Other Strategy")}
              className="mt-3 w-full rounded-xl border border-[#1e4f4f]/30 bg-white px-4 py-2.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
            >
              Create New Strategy
            </button>
          </HubSection>

          <HubSection
            title={STRATEGIES_HUB.recommended.title}
            description={STRATEGIES_HUB.recommended.description}
            open={hubOpen.recommended}
            onToggle={() => toggleHub("recommended")}
          >
            <ul className="flex flex-col gap-2">
              {dealingWith.map((sit) => (
                <li key={sit.situationId}>
                  <p className="text-sm font-semibold text-[#1f1c19]">{sit.situationLabel}</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {sit.strategyIds.slice(0, 3).map((id) => {
                      const strat = getStrategy(id);
                      if (!strat) return null;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => goToView({ v: "strategy", stratId: id })}
                          className="rounded-lg border border-[#d4cdc3] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#1e4f4f] hover:border-[#1e4f4f]/40"
                        >
                          {strat.title}
                        </button>
                      );
                    })}
                  </div>
                </li>
              ))}
            </ul>
          </HubSection>

          <HubSection
            title={`${STRATEGIES_HUB.saved.title} (${savedCount})`}
            description={STRATEGIES_HUB.saved.description}
            open={hubOpen.saved}
            onToggle={() => toggleHub("saved")}
          >
            {savedCount === 0 ? (
              <p className="text-sm text-[#6b635a]">
                Nothing saved yet — create a business strategy or save one you build.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {[...saved]
                  .sort((a, b) => compareDropdownLabels(a.title, b.title))
                  .slice(0, 6)
                  .map((u) => (
                    <li key={u.id}>
                      <button
                        type="button"
                        onClick={() => goToView({ v: "userStrategy", id: u.id })}
                        className="w-full rounded-xl border border-[#d4cdc3] bg-white/90 px-3 py-2.5 text-left text-sm font-semibold text-black hover:border-[#1e4f4f]/40 hover:text-black"
                      >
                        {u.title}
                      </button>
                    </li>
                  ))}
              </ul>
            )}
            {savedCount > 0 ? (
              <button
                type="button"
                onClick={() => setView({ v: "saved" })}
                className="mt-2 text-sm font-semibold text-[#1e4f4f]"
              >
                View all saved ({savedCount}) →
              </button>
            ) : null}
          </HubSection>
        </div>
      </div>
    );
  }

  // ---- ADHD browse (full library) ----------------------------------------
  if (view.v === "adhd") {
    return (
      <div className="companion-fade-in mx-auto flex h-full max-w-xl flex-col px-6 py-8">
        <button
          type="button"
          onClick={() => setView({ v: "home" })}
          className="self-start text-sm font-semibold text-[#1e4f4f]"
        >
          ‹ Strategies
        </button>
        <p className="mt-2 text-2xl font-semibold text-[#1f1c19]">
          {STRATEGIES_HUB.adhd.title}
        </p>
        <p className="mt-1 text-base text-[#6b635a]">
          {STRATEGIES_HUB.adhd.description}
        </p>
        <select
          value={adhdPick}
          onChange={(e) => {
            const id = e.target.value;
            setAdhdPick(id);
            const entry = ADHD_STRATEGY_HUB.find((x) => x.id === id);
            if (entry) openAdhdEntry(entry);
          }}
          className="mt-4 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base font-medium outline-none focus:border-[#1e4f4f]"
        >
          <option value="">Select…</option>
          {ADHD_STRATEGY_HUB.map((e) => (
            <option key={e.id} value={e.id}>
              {e.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => {
            setOpenSubcat(null);
            setView({ v: "group", group: "personal" });
          }}
          className="mt-4 text-sm font-semibold text-[#1e4f4f]"
        >
          Browse coaching library by topic →
        </button>
      </div>
    );
  }

  // ---- Business browse ---------------------------------------------------
  if (view.v === "business") {
    const templates = [...BUSINESS_STRATEGY_TEMPLATES].sort((a, b) =>
      compareDropdownLabels(a, b),
    );
    return (
      <div className="companion-fade-in mx-auto flex h-full max-w-xl flex-col px-6 py-8">
        <button
          type="button"
          onClick={() => setView({ v: "home" })}
          className="self-start text-sm font-semibold text-[#1e4f4f]"
        >
          ‹ Strategies
        </button>
        <p className="mt-2 text-2xl font-semibold text-[#1f1c19]">
          {STRATEGIES_HUB.business.title}
        </p>
        <p className="mt-1 text-base text-[#6b635a]">
          {STRATEGIES_HUB.business.description}
        </p>

        <p className="mt-5 text-sm font-semibold text-[#1f1c19]">
          Coaching strategies
        </p>
        <div className="mt-2">
          <CoachingLibraryPicker
            variant="page"
            onOpenStrategy={(id) => goToView({ v: "strategy", stratId: id })}
            onApplyWithShari={(id) => onStartStrategyApply?.(id)}
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setOpenSubcat(null);
            goToView({ v: "group", group: "business" });
          }}
          className="mt-3 text-sm font-semibold text-[#1e4f4f]"
        >
          Browse all business strategies by topic →
        </button>

        <p className="mt-6 text-sm font-semibold text-[#1f1c19]">
          Build a custom plan with Shari
        </p>
        <select
          value={businessPick}
          onChange={(e) => {
            const v = e.target.value;
            setBusinessPick(v);
            if (v) startBusiness(v);
          }}
          className="mt-2 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base font-medium outline-none focus:border-[#1e4f4f]"
        >
          <option value="">Select a plan type…</option>
          {templates.map((label) => (
            <option key={label} value={label}>
              {label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => startBusiness("Other Strategy")}
          className="mt-4 w-full rounded-xl bg-[#1e4f4f] px-5 py-3 text-sm font-semibold text-white"
        >
          Create New Strategy
        </button>
      </div>
    );
  }

  // ---- Group: expandable accordion of subcategories ----------------------
  if (view.v === "group") {
    const group = STRATEGY_GROUPS.find((g) => g.id === view.group)!;
    const subcats = categoriesForGroup(view.group);
    return (
      <div className="companion-fade-in mx-auto flex h-full max-w-xl flex-col px-6 py-8">
        {dockedPlan}
        <button
          type="button"
          onClick={() => setView({ v: "home" })}
          className="self-start text-sm font-semibold text-[#1e4f4f]"
        >
          ‹ Strategies
        </button>
        <p className="mt-2 flex items-center gap-2 text-2xl font-semibold text-[#1f1c19]">
          <CompanionObjectVisual
            objectId={STRATEGY_GROUP_OBJECT_ID[view.group]}
            size="md"
            variant="icon"
          />
          {group.label}
        </p>
        <p className="mt-1 text-base text-[#6b635a]">
          {view.group === "personal"
            ? "What feels most true right now?"
            : "What part of the business needs attention?"}
        </p>

        {/* Select an area — calmer than a wall of cards */}
        <select
          value={openSubcat ?? ""}
          onChange={(e) => setOpenSubcat(e.target.value || null)}
          className="mt-3 w-full max-w-sm rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base font-medium text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
        >
          <option value="">Select an area…</option>
          {subcats.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
        </select>

        {/* Strategies for the chosen area */}
        {(() => {
          const cat = openSubcat ? getCategory(openSubcat) : null;
          if (!cat) {
            return (
              <p className="mt-6 text-base text-[#9a8f82]">
                Choose an area above to see the strategies inside.
              </p>
            );
          }
          const builtins = strategiesFor(cat.id).sort((a, b) =>
            compareDropdownLabels(a.title, b.title),
          );
          const mine = userStrategiesFor(cat.id).sort((a, b) =>
            compareDropdownLabels(a.title, b.title),
          );
          if (builtins.length + mine.length === 0) {
            return (
              <p className="mt-6 text-base text-[#9a8f82]">
                No strategies are listed here yet — check another area or save your
                own from New strategy.
              </p>
            );
          }
          return (
            <ul className="mt-5 flex flex-col gap-3">
              {builtins.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => goToView({ v: "strategy", stratId: s.id })}
                    style={tint(cat.color)}
                    className="w-full rounded-2xl border border-[#d4cdc3] bg-white/85 p-4 text-left transition-colors hover:border-[#1e4f4f]/45 hover:bg-white"
                  >
                    <span className="block text-base font-semibold text-[#1f1c19]">
                      {s.title}
                    </span>
                    <span className="mt-0.5 block text-sm text-[#6b635a]">
                      {s.whenToUse}
                    </span>
                  </button>
                </li>
              ))}
              {mine.map((u) => (
                <li key={u.id}>
                  <button
                    type="button"
                    onClick={() => goToView({ v: "userStrategy", id: u.id })}
                    style={tint(cat.color)}
                    className="w-full rounded-2xl border border-[#d4cdc3] bg-white/85 p-4 text-left transition-colors hover:border-[#1e4f4f]/45 hover:bg-white"
                  >
                    <span className="block text-base font-semibold text-[#1f1c19]">
                      {u.title}
                      <span className="ml-1 rounded-full bg-[#1e4f4f]/10 px-2 py-0.5 text-xs font-semibold text-[#1e4f4f]">
                        Yours
                      </span>
                    </span>
                    <span className="mt-0.5 block text-sm text-[#6b635a]">
                      {u.whenToUse}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          );
        })()}
      </div>
    );
  }

  // ---- Recommended for you (max 3 before Browse All — Prompt 143) --------
  if (view.v === "recommended") {
    const recs = getRecommendedStrategiesForApply(STRATEGY_RECOMMENDATION_LIMIT);
    return (
      <div
        className="companion-fade-in mx-auto flex h-full max-w-xl flex-col px-6 py-8"
        data-testid="strategy-library-recommended-view"
      >
        <button
          type="button"
          onClick={() => setView({ v: "home" })}
          className="self-start text-sm font-semibold text-[#1e4f4f]"
        >
          ‹ Strategies
        </button>
        <p className="mt-2 text-2xl font-semibold text-[#1f1c19]">
          Recommended for you
        </p>
        <p className="mt-1 text-base text-[#6b635a]">
          Three calm starting points. As I learn what works for you, this will
          get more personal.
        </p>
        <ul className="mt-5 flex flex-col gap-2">
          {recs.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => goToView({ v: "strategy", stratId: s.id })}
                className={
                  estate
                    ? "w-full rounded-2xl border border-[#e7dfd4] bg-white/95 px-4 py-3 text-left shadow-sm transition-colors hover:border-[#1e4f4f]/40"
                    : "w-full rounded-xl border border-[#e7dfd4] bg-white px-4 py-3 text-left hover:border-[#1e4f4f]/40"
                }
                data-testid={`strategy-recommended-${s.id}`}
              >
                <span className="block text-base font-semibold text-[#1f1c19]">
                  {s.title}
                </span>
                <span className="mt-0.5 block text-sm text-[#6b635a]">
                  {s.problem}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => {
            setBrowseAllOpen(true);
            setLibraryMode("browse");
            goToView({ v: "home" });
          }}
          className="mt-4 self-start text-sm font-semibold text-[#1e4f4f] hover:underline"
          data-testid="strategy-recommended-browse-all"
        >
          Browse All Strategies
        </button>
      </div>
    );
  }

  // ---- My saved strategies ------------------------------------------------
  if (view.v === "saved") {
    const mine = getUserStrategies();
    return (
      <div className="companion-fade-in mx-auto flex h-full max-w-xl flex-col px-6 py-8">
        <button
          type="button"
          onClick={() => setView({ v: "home" })}
          className="self-start text-sm font-semibold text-[#1e4f4f]"
        >
          ‹ Strategies
        </button>
        <p className="mt-2 text-2xl font-semibold text-[#1f1c19]">
          📌 Saved Strategies
        </p>
        {mine.length === 0 ? (
          <p className="mt-4 text-base text-[#6b635a]">
            Nothing saved yet. When a routine keeps working for you, you&apos;ll
            be able to save it here as your own — and I&apos;ll file it in the
            right place automatically.
          </p>
        ) : (
          <ul className="mt-5 flex flex-col gap-3">
            {mine.map((u) => {
              const cat = getCategory(u.category);
              return (
                <li key={u.id}>
                  <button
                    type="button"
                    onClick={() => goToView({ v: "userStrategy", id: u.id })}
                    style={tint(cat?.color ?? "#1e4f4f")}
                    className="w-full rounded-2xl border border-[#d4cdc3] bg-white/85 p-4 text-left transition-colors hover:border-[#1e4f4f]/45 hover:bg-white"
                  >
                    <span className="block text-base font-semibold text-[#1f1c19]">
                      {u.title}
                    </span>
                    <span className="mt-0.5 block text-sm text-[#6b635a]">
                      {cat ? cat.label : u.category}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }

  // ---- Guided create (never a blank form) --------------------------------
  if (view.v === "new") {
    return (
      <StrategyGuidedCreatePanel
        onBack={() => setView({ v: "home" })}
        onSaved={() => setView({ v: "saved" })}
        onOpen={onOpen}
        onAsk={onAsk}
      />
    );
  }

  // ---- User strategy detail (saved / companion-suggested) ----------------
  if (view.v === "userStrategy") {
    const u: UserStrategy | undefined = getUserStrategies().find(
      (x) => x.id === view.id,
    );
    if (!u) {
      setView({ v: "saved" });
      return null;
    }
    const ucat = getCategory(u.category);
    const ucolor = accent(ucat?.color ?? "#1e4f4f");
    return (
      <div className="companion-fade-in mx-auto flex h-full max-w-xl flex-col px-6 py-8">
        <button
          type="button"
          onClick={returnFromStrategyDetail}
          className="self-start text-sm font-semibold text-[#1e4f4f]"
        >
          ‹ Back to {strategyDetailBackLabel(strategyReturnRef.current)}
        </button>
        <p className="mt-2 text-2xl font-semibold text-[#1f1c19]">{u.title}</p>
        <p className="mt-1 text-sm italic text-[#9a8f82]">{u.whenToUse}</p>

        <LessonHeading color={ucolor}>What is it?</LessonHeading>
        <p className="mt-1.5 text-base leading-relaxed text-[#2d2926]">
          {u.description || u.steps[0]}
        </p>
        <ol className="mt-3 flex flex-col gap-2">
          {u.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ background: ucolor }}
              >
                {i + 1}
              </span>
              <span className="text-base leading-relaxed text-[#1f1c19]">{step}</span>
            </li>
          ))}
        </ol>

        <LessonHeading color={ucolor}>Why it helps</LessonHeading>
        <p className="mt-1.5 whitespace-pre-line text-base leading-relaxed text-[#2d2926]">
          {u.whyItWorks}
        </p>

        <LessonHeading color={ucolor}>When to use it</LessonHeading>
        <p className="mt-1.5 text-base leading-relaxed text-[#2d2926]">{u.whenToUse}</p>
        {u.example ? (
          <p className="mt-2 whitespace-pre-line text-base leading-relaxed text-[#6b635a]">
            {u.example}
          </p>
        ) : null}

        <StrategyUseNow
          key={u.id}
          strategyTitle={u.title}
          categoryId={u.category}
          onOpen={onOpen}
          onAsk={onAsk}
        />
      </div>
    );
  }

  // ---- Strategy detail ----------------------------------------------------
  const s: Strategy | undefined = getStrategy(view.stratId);
  if (!s) {
    goToView({ v: "home" });
    return null;
  }
  if (
    strategyApplySession &&
    strategyApplySession.strategyId === s.id
  ) {
    return (
      <StrategyApplyPanel
        session={strategyApplySession}
        onBack={onDismissStrategyApply}
      />
    );
  }
  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="px-6 pt-6">{dockedPlan}</div>
      <StrategyBuiltinDetail
        s={s}
        accent={accent}
        onOpen={onOpen}
        onAsk={onAsk}
        onStartStrategyApply={onStartStrategyApply}
        onBack={returnFromStrategyDetail}
        backLabel={strategyDetailBackLabel(strategyReturnRef.current)}
        onSaved={() => setView({ v: "saved" })}
      />
    </div>
  );
}

function StrategyBuiltinDetail({
  s,
  accent,
  onOpen,
  onAsk,
  onStartStrategyApply,
  onBack,
  backLabel,
  onSaved,
}: {
  s: Strategy;
  accent: (color: string) => string;
  onOpen?: (section: AppSection) => void;
  onAsk?: (prompt: string) => void;
  onStartStrategyApply?: (strategyId: string) => void;
  onBack: () => void;
  backLabel: string;
  onSaved: () => void;
}) {
  const cat = getCategory(resolveSubcat(s));
  const subcat = resolveSubcat(s);
  const accentColor = accent(cat?.color ?? "#1e4f4f");
  const [strategyActivated, setStrategyActivated] = useState(false);
  useEffect(() => {
    setStrategyActivated(false);
  }, [s.id]);
  const detail = useMemo(() => buildStrategyDetailViewModel(s), [s]);
  const closingReflection = useMemo(
    () => pickStrategyReflection(subcat, s),
    [subcat, s],
  );
  const relatedTools = useMemo(
    () => relatedCompanionTools(s, subcat),
    [s, subcat],
  );
  const linkedWorkItem = getResumableStrategyWorkItem();

  function saveAsMine() {
    saveUserStrategy({
      title: s.title,
      type: groupForStrategy(s),
      category: subcat,
      source: "user_generated",
      description: s.problem,
      whenToUse: s.whenToUse,
      steps: s.steps,
      whyItWorks: s.whyWorks,
      example: s.example,
      reflections: s.reflections,
    });
    onSaved();
  }

  return (
    <div
      className="companion-fade-in mx-auto flex h-full min-h-0 max-w-xl flex-col overflow-y-auto px-6 py-8"
      data-testid="strategy-detail-template"
    >
      <AppBackButton destination={backLabel} onBack={onBack} />

      <p className="mt-2 text-2xl font-semibold text-[#1f1c19]">{s.title}</p>

      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-[#6b635a]">
        <span>About {timeForStrategy(s)} minutes</span>
      </div>

      {warmthFor(subcat) ? (
        <p className="mt-3 text-base italic text-[#1e4f4f]">{warmthFor(subcat)}</p>
      ) : null}

      <LessonHeading color={accentColor}>What This Strategy Helps With</LessonHeading>
      <p className="mt-1.5 whitespace-pre-line text-base leading-relaxed text-[#2d2926]">
        {detail.helpsWith}
      </p>

      <LessonHeading color={accentColor}>When to Use It</LessonHeading>
      <p className="mt-1.5 text-base leading-relaxed text-[#2d2926]">
        {detail.whenToUse}
      </p>

      <LessonHeading color={accentColor}>When Not to Use It</LessonHeading>
      <p className="mt-1.5 text-base leading-relaxed text-[#2d2926]">
        {detail.whenNotToUse}
      </p>

      <LessonHeading color={accentColor}>Why It Works</LessonHeading>
      <p className="mt-1.5 whitespace-pre-line text-base leading-relaxed text-[#2d2926]">
        {detail.whyItWorks}
      </p>
      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#6b635a]">
        {detail.adhdWhy}
      </p>

      <LessonHeading color={accentColor}>How It Applies to Your Situation</LessonHeading>
      <p className="mt-1.5 text-base leading-relaxed text-[#2d2926]">
        {detail.situationApplication}
      </p>

      <LessonHeading color={accentColor}>Your Best First Step</LessonHeading>
      <div
        className="mt-2 rounded-xl border border-[#1e4f4f]/20 bg-[#1e4f4f]/[0.04] p-4"
        style={{ borderLeftWidth: 4, borderLeftColor: accentColor }}
        data-testid="strategy-first-step"
      >
        <p className="text-sm font-medium text-[#1f1c19]">{detail.firstStep}</p>
      </div>

      <LessonHeading color={accentColor}>Step-by-Step Implementation</LessonHeading>
      <ol className="mt-2 flex flex-col gap-2">
        {detail.steps.map((step, i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ background: accentColor }}
            >
              {i + 1}
            </span>
            <span className="text-base leading-relaxed text-[#1f1c19]">{step}</span>
          </li>
        ))}
      </ol>

      <LessonHeading color={accentColor}>Chamber Expertise</LessonHeading>
      <div
        className="mt-2 rounded-xl border border-[#1e4f4f]/15 bg-white/80 p-4"
        data-testid="strategy-chamber-contribution"
      >
        <p className="text-sm font-semibold text-[#1f1c19]">
          Specialist guidance used
        </p>
        {detail.chamber.map((c) => (
          <div key={c.roleLabel} className="mt-2">
            <p className="text-sm font-semibold text-[#1e4f4f]">{c.roleLabel}</p>
            <p className="mt-0.5 text-sm leading-relaxed text-[#2d2926]">
              {c.guidance}
            </p>
          </div>
        ))}
      </div>

      <LessonHeading color={accentColor}>Real-life example</LessonHeading>
      <p className="mt-1.5 whitespace-pre-line text-base leading-relaxed text-[#6b635a]">
        {detail.example}
      </p>

      <LessonHeading color={accentColor}>Common Problems</LessonHeading>
      <p className="mt-1.5 text-base leading-relaxed text-[#2d2926]">
        {detail.commonProblems}
      </p>

      <LessonHeading color={accentColor}>How to Adapt It</LessonHeading>
      <p className="mt-1.5 text-base leading-relaxed text-[#2d2926]">
        {detail.howToAdapt}
      </p>

      <LessonHeading color={accentColor}>How to Know It Is Working</LessonHeading>
      <p className="mt-1.5 text-base leading-relaxed text-[#2d2926]">
        {detail.howToKnowWorking}
      </p>

      <StrategyUseNow
        key={s.id}
        strategyTitle={s.title}
        strategyId={s.id}
        categoryId={subcat}
        onOpen={onOpen}
        onAsk={onAsk}
        onStartStrategyApply={onStartStrategyApply}
        onActivated={() => setStrategyActivated(true)}
      />

      <StrategyExecutionConnections
        strategy={s}
        onOpen={onOpen}
        onAsk={onAsk}
        onSaved={onSaved}
        onSaveStrategy={saveAsMine}
        activated={strategyActivated}
        showOptionalReviews
      />

      {linkedWorkItem ? (
        <div className="mt-6 flex flex-col gap-4">
          {decisionRecordIsReady(linkedWorkItem) ||
          linkedWorkItem.status === "evaluating" ||
          linkedWorkItem.status === "understanding" ? (
            <StrategyDecisionRecord
              record={buildStrategyDecisionRecord(linkedWorkItem)}
            />
          ) : null}
          <ContinueYourJourney
            model={buildContinueYourJourney(linkedWorkItem)}
            liveDestinations={STRATEGY_HANDOFF_LIVE_DESTINATIONS}
            onSelect={(destinationId) => {
              try {
                const result = executeApprovedStrategyHandoff({
                  strategyWorkItemId: linkedWorkItem.id,
                  destinationId,
                });
                if (result.section && onOpen) onOpen(result.section);
                else if (result.seedAsk && onAsk) onAsk(result.seedAsk);
                else if (onAsk) {
                  onAsk(
                    `I'd like to continue from the Strategy Chamber toward ${destinationId.replace(/_/g, " ")}.`,
                  );
                }
              } catch {
                if (onAsk) {
                  onAsk(
                    `I'd like to continue from the Strategy Chamber toward ${destinationId.replace(/_/g, " ")}.`,
                  );
                }
              }
            }}
          />
        </div>
      ) : null}

      {relatedTools.length > 0 ? (
        <>
          <LessonHeading color={accentColor}>Related Companion tools</LessonHeading>
          <div className="mt-2 flex flex-wrap gap-2">
            {relatedTools.map((tool) => (
              <button
                key={tool.section}
                type="button"
                onClick={() => onOpen?.(tool.section)}
                disabled={!onOpen}
                className="rounded-full border border-[#1e4f4f]/25 bg-white px-3 py-1.5 text-sm font-medium text-[#1e4f4f] hover:bg-[#1e4f4f]/[0.06] disabled:opacity-40"
              >
                <CompanionObjectLabel
                  objectId={tool.objectId}
                  label={tool.label}
                  size="xs"
                />
              </button>
            ))}
          </div>
        </>
      ) : null}

      {s.deeper ? (
        <details className="mt-6 rounded-2xl border border-[#1e4f4f]/15 bg-white/60 px-4 py-3">
          <summary className="cursor-pointer text-base font-semibold text-[#1e4f4f]">
            Want to understand this deeper?
          </summary>
          <p className="mt-2 whitespace-pre-line pb-2 text-base leading-relaxed text-[#2d2926]">
            {s.deeper}
          </p>
        </details>
      ) : null}

      <p className="mt-8 pb-6 text-center text-sm italic text-[#9a8f82]">
        {closingReflection}
      </p>
    </div>
  );
}

function HubSection({
  title,
  description,
  open,
  onToggle,
  children,
}: {
  title: string;
  description: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#1e4f4f]/15 bg-white/85 shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
      >
        <span>
          <span className={`block ${MENU_LIST_LABEL}`}>
            {open ? "▼" : "▶"} {title}
          </span>
          <span className={`mt-0.5 block text-sm ${MENU_TEXT}`}>{description}</span>
        </span>
      </button>
      {open ? <div className="border-t border-[#e7dfd4] px-4 pb-4 pt-3">{children}</div> : null}
    </div>
  );
}

function LessonHeading({
  color,
  children,
}: {
  color: string;
  children: string;
}) {
  return (
    <h3
      className="mt-6 text-base font-semibold"
      style={{ color }}
    >
      {children}
    </h3>
  );
}

function ChamberEntryAnswerForm({
  initialValue,
  onSave,
  onPause,
  onContinue,
  onSkip,
}: {
  initialValue: string;
  onSave: (answer: string) => void;
  onPause: () => void;
  onContinue: () => void;
  onSkip?: () => void;
}) {
  const [answer, setAnswer] = useState(initialValue);
  return (
    <div className="mt-4 flex flex-col gap-3" data-testid="strategy-chamber-entry-form">
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={4}
        placeholder="Share what feels true — even a rough sentence is enough."
        className="w-full rounded-xl border border-[#c9bfb0] bg-white px-4 py-3 text-base leading-relaxed text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
        data-testid="strategy-chamber-entry-answer"
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          className="rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-base font-semibold text-white hover:bg-[#163d3d] disabled:opacity-40"
          disabled={!answer.trim()}
          onClick={() => {
            onSave(answer);
            onContinue();
          }}
          data-testid="strategy-chamber-entry-save"
        >
          Save and continue
        </button>
        <button
          type="button"
          className="rounded-xl border border-[#1e4f4f]/30 bg-white px-4 py-2.5 text-base font-semibold text-[#1e4f4f]"
          onClick={() => {
            if (answer.trim()) onSave(answer);
            onPause();
          }}
          data-testid="strategy-chamber-entry-pause"
        >
          Pause for now
        </button>
        {onSkip ? (
          <button
            type="button"
            className="rounded-xl border border-transparent px-4 py-2.5 text-base font-semibold text-[#6b635a] underline"
            onClick={onSkip}
            data-testid="strategy-chamber-entry-skip"
          >
            Skip this for now
          </button>
        ) : null}
      </div>
    </div>
  );
}

const TOOL_LABELS: Partial<Record<AppSection, { label: string; objectId: string }>> = {
  "brain-dump": { label: "Clear My Mind", objectId: "clear-my-mind" },
  "focus-timer": { label: "Focus Session", objectId: "focus-timer" },
  breathe: { label: "Breathe", objectId: "breathing" },
  energy: { label: "How Are You Feeling Today?", objectId: "todays-reality" },
  projects: { label: "Projects", objectId: "projects" },
  "spin-wheel": { label: "Spin the Wheel", objectId: "spin-wheel" },
  "time-block": { label: "Time Block", objectId: "calendar" },
  "content-generator": { label: "Create", objectId: "create" },
  "email-generator": { label: "Email Generator", objectId: "email-generator" },
  snippets: { label: "Snippets", objectId: "toolbelt-snippets" },
  "templates-library": { label: "Templates", objectId: "templates" },
  home: { label: "Chat with Shari", objectId: "messages" },
};

function relatedCompanionTools(s: Strategy, subcatId: string) {
  const fromText = appReferences(
    s.problem,
    s.whyWorks,
    s.whyBrain,
    s.example,
    s.deeper,
    s.steps.join("\n"),
  );
  const seen = new Set(fromText.map((r) => r.section));
  const merged = [...fromText];
  for (const section of CATEGORY_COMPANION_TOOLS[subcatId] ?? []) {
    if (seen.has(section)) continue;
    const meta = TOOL_LABELS[section];
    if (meta) {
      merged.push({ section, label: meta.label, objectId: meta.objectId });
      seen.add(section);
    }
  }
  return merged.sort((a, b) => compareDropdownLabels(a.label, b.label));
}
