"use client";

import { useEffect, useState } from "react";
import { logMomentum } from "@/lib/companionStore";
import {
  ACTIVITY_CATEGORIES,
  getActivityById,
  type ActivityCategoryId,
  type CompanionActivity,
} from "@/lib/companionActivities";
import {
  canAdvanceActivityStep,
  ensureActivityStepAnswers,
  stepField,
  stepInstruction,
  type ActivityAnswers,
  type ActivityFieldDef,
} from "@/lib/activityFields";
import { ActivityStepFields } from "@/components/companion/ActivityStepFields";
import { CompanionFloatingCard } from "@/components/companion/CompanionFloatingCard";
import {
  crossWorkspaceBesideLine,
  crossWorkspaceContextMessage,
} from "@/lib/crossWorkspaceSuggestion";
import { NO_CATEGORY } from "@/lib/categoryRevealUx";
import { DecisionCompassPanel } from "@/components/companion/DecisionCompassPanel";
import { CrossWorkspaceSuggestionCard } from "@/components/companion/CrossWorkspaceSuggestionCard";
import { CompanionObjectVisual } from "@/components/companion/CompanionObjectVisual";
import type { DecisionCompassPrefill } from "@/lib/decisionCompass";
import type { PersistedDecisionCompassSession } from "@/lib/decisionCompassSessionStore";
import type { AppSection } from "@/lib/companionUi";
import { guidedExerciseMenu } from "@/lib/guidedExercises";

export type ActivityPanelVariant = "help-now" | "guided";

export type ActivityPhase = "browse" | "active" | "stopped" | "complete";

export type ActivitySessionState = {
  activityId: string;
  stepIndex: number;
  phase: ActivityPhase;
  categoryId: ActivityCategoryId | typeof NO_CATEGORY;
  linkedBesideDismissed: boolean;
  linkedBesideOpened: boolean;
  answers: ActivityAnswers;
};

export const EMPTY_ACTIVITY_SESSION: ActivitySessionState = {
  activityId: "",
  stepIndex: 0,
  phase: "browse",
  categoryId: NO_CATEGORY,
  linkedBesideDismissed: false,
  linkedBesideOpened: false,
  answers: {},
};

/** Active session with step-0 field answers initialized (use for all launch paths). */
export function buildActiveActivitySession(
  activity: CompanionActivity,
  overrides?: Partial<ActivitySessionState>,
): ActivitySessionState {
  const answers = ensureActivityStepAnswers(activity.steps, 0, {});
  return {
    activityId: activity.id,
    stepIndex: 0,
    phase: "active",
    categoryId: activity.categoryId,
    linkedBesideDismissed: false,
    linkedBesideOpened: false,
    answers,
    ...overrides,
  };
}

type OpenBesidePayload = {
  activity: CompanionActivity;
  session: ActivitySessionState;
  contextMessage: string;
};

function linkedSuggestFromStep(activity: CompanionActivity): number {
  return activity.suggestLinkedFromStep ?? activity.steps.length - 1;
}

function shouldShowLinkedSuggestion(
  activity: CompanionActivity,
  stepIndex: number,
  dismissed: boolean,
  opened: boolean,
): boolean {
  if (!activity.linkedSection || dismissed || opened) return false;
  return stepIndex >= linkedSuggestFromStep(activity);
}

export function CompanionActivitiesPanel({
  onOpenBeside,
  onOpenDecisionCompass,
  onClose,
  embedded = false,
  variant = "help-now",
  sanctuary = false,
  session: controlledSession,
  onSessionChange,
  registerBack,
  onBeforeActivityStart,
  returnToLabel,
  onExitActivity,
  decisionCompassPrefill = null,
  decisionCompassSession = null,
  onDecisionCompassSessionChange,
  onDecisionCompassComplete,
}: {
  onOpenBeside?: (section: AppSection, payload: OpenBesidePayload) => void;
  /** Opens ADHD Decision Compass split workspace (not the legacy step exercise). */
  onOpenDecisionCompass?: () => void;
  onClose?: () => void;
  embedded?: boolean;
  /** Relief tools vs structured guided exercises. */
  variant?: ActivityPanelVariant;
  /** Frosted floating card over butterfly conservatory (Focus My Brain workflows). */
  sanctuary?: boolean;
  session?: ActivitySessionState;
  onSessionChange?: (session: ActivitySessionState) => void;
  /** Global ← Back — inner screens first, then parent history. */
  registerBack?: (fn: (() => boolean) | null) => void;
  /** Push navigation restore before leaving browse for an activity. */
  onBeforeActivityStart?: () => void;
  /** Label for the parent screen when exiting an activity (e.g. ADHD Strategies). */
  returnToLabel?: string;
  /** Clear session and return to the parent screen — bypasses inner back interceptors. */
  onExitActivity?: () => void;
  decisionCompassPrefill?: DecisionCompassPrefill | null;
  decisionCompassSession?: PersistedDecisionCompassSession | null;
  onDecisionCompassSessionChange?: (
    snapshot: PersistedDecisionCompassSession,
  ) => void;
  onDecisionCompassComplete?: () => void;
}) {
  const [internalSession, setInternalSession] =
    useState<ActivitySessionState>(EMPTY_ACTIVITY_SESSION);

  const session = controlledSession ?? internalSession;
  const patchSession = (next: Partial<ActivitySessionState>) => {
    const merged = { ...session, ...next };
    if (onSessionChange) onSessionChange(merged);
    else setInternalSession(merged);
  };

  const activity =
    session.activityId && session.phase !== "browse"
      ? getActivityById(session.activityId) ?? null
      : null;

  const guidedExercises = guidedExerciseMenu();
  const browseTitle =
    variant === "guided" ? "Guided Exercises" : "Focus";
  const browseSubtitle =
    variant === "guided"
      ? "Structured thinking and self-reflection — go deeper when you have a few minutes."
      : "Pick a feeling or tool from Focus — relief tools live there now.";

  function start(a: CompanionActivity) {
    onBeforeActivityStart?.();
    patchSession(buildActiveActivitySession(a));
  }

  function launchGuidedExercise(activityId: string) {
    if (activityId === "decision-compass") {
      onOpenDecisionCompass?.();
      return;
    }
    const a = getActivityById(activityId);
    if (a) start(a);
  }

  function ensureStepAnswers(
    activity: CompanionActivity,
    stepIndex: number,
    answers: ActivityAnswers,
  ): ActivityAnswers {
    return ensureActivityStepAnswers(activity.steps, stepIndex, answers);
  }

  useEffect(() => {
    if (!activity || session.phase !== "active") return;
    const ensured = ensureActivityStepAnswers(
      activity.steps,
      session.stepIndex,
      session.answers,
    );
    if (ensured !== session.answers) {
      patchSession({ answers: ensured });
    }
  }, [activity?.id, session.phase, session.stepIndex, session.activityId]);

  function goToStep(nextIndex: number) {
    if (!activity) return;
    const answers = ensureStepAnswers(activity, nextIndex, session.answers);
    patchSession({ stepIndex: nextIndex, answers });
  }

  function stop() {
    patchSession({ phase: "stopped" });
  }

  function finish() {
    if (activity) {
      logMomentum("reset", `Activity: ${activity.title}`);
    }
    patchSession({ phase: "complete" });
  }

  const parentLabel =
    returnToLabel ?? (variant === "guided" ? "Guided Exercises" : "Focus");

  function exitToParent() {
    if (onExitActivity) {
      onExitActivity();
      return;
    }
    if (variant === "help-now" && onClose) {
      onClose();
      return;
    }
    patchSession({ ...EMPTY_ACTIVITY_SESSION, categoryId: session.categoryId });
  }

  function backToBrowse() {
    exitToParent();
  }

  function exitActivityView() {
    if (variant === "help-now" && onClose) {
      onClose();
      return;
    }
    backToBrowse();
  }

  useEffect(() => {
    registerBack?.(() => {
      if (session.phase === "stopped") {
        patchSession({ phase: "active" });
        return true;
      }
      if (session.phase === "complete") {
        exitActivityView();
        return true;
      }
      if (session.phase === "active") {
        if (session.stepIndex > 0) {
          goToStep(session.stepIndex - 1);
          return true;
        }
        return false;
      }
      return false;
    });
    return () => registerBack?.(null);
  }, [registerBack, session.phase, session.stepIndex, session.activityId]);

  function acceptLinkedBeside(a: CompanionActivity) {
    if (!a.linkedSection || !onOpenBeside) return;
    const contextMessage = crossWorkspaceContextMessage(a.title, a.linkedSection);
    const nextSession = {
      ...session,
      linkedBesideOpened: true,
    };
    onOpenBeside(a.linkedSection, {
      activity: a,
      session: nextSession,
      contextMessage,
    });
    patchSession({ linkedBesideOpened: true });
  }

  const shellClass = sanctuary
    ? "focus-workflow-shell"
    : embedded
      ? "flex h-full min-h-0 w-full max-w-xl flex-col overflow-hidden px-4 py-5"
      : "companion-fade-in flex h-full min-h-0 w-full max-w-xl flex-col px-6 py-8";

  const browseShellClass = embedded
    ? "flex h-full min-h-0 w-full max-w-xl flex-col overflow-hidden"
    : "companion-fade-in mx-auto flex h-full min-h-0 w-full max-w-xl flex-col px-6 py-8";

  if (session.phase === "stopped") {
    if (sanctuary) {
      return (
        <CompanionFloatingCard
          activityTitle={activity?.title ?? parentLabel}
          onLeftNav={exitToParent}
          leftNavLabel={`← ${parentLabel}`}
          primaryAction={
            activity
              ? {
                  label: `Resume ${activity.title} →`,
                  onClick: () =>
                    patchSession({ stepIndex: 0, phase: "active" }),
                }
              : {
                  label: `Back to ${parentLabel} →`,
                  onClick: exitToParent,
                }
          }
        >
          <div className="companion-floating-card__outcome">
            <p className="companion-floating-card__outcome-title">
              Paused when you needed to.
            </p>
            <p className="companion-floating-card__outcome-body">
              These are here when you want them — not obligations.
            </p>
          </div>
        </CompanionFloatingCard>
      );
    }

    return (
      <div
        className={`${shellClass} ${embedded ? "" : "items-center text-center py-16"}`}
      >
        <p className="text-2xl font-semibold text-[#1f1c19]">
          Stopped when you needed to.
        </p>
        <p className="mt-2 text-base leading-relaxed text-[#6b635a]">
          That&apos;s the point — these are here when you want them, not
          obligations.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {activity ? (
            <button
              type="button"
              onClick={() => patchSession({ stepIndex: 0, phase: "active" })}
              className="rounded-xl border-2 border-[#1e4f4f] bg-white px-5 py-2.5 text-sm font-semibold text-[#1e4f4f]"
            >
              Resume {activity.title}
            </button>
          ) : null}
          <button
            type="button"
            onClick={exitToParent}
            className="rounded-xl bg-[#1e4f4f] px-6 py-2.5 text-sm font-semibold text-white"
          >
            ‹ Back to {parentLabel}
          </button>
        </div>
      </div>
    );
  }

  if (session.phase === "complete" && activity) {
    const cat = ACTIVITY_CATEGORIES.find((c) => c.id === activity.categoryId);
    if (sanctuary) {
      return (
        <CompanionFloatingCard
          activityTitle={activity.title}
          categoryId={activity.categoryId}
          categoryLabel={cat?.label}
          onLeftNav={backToBrowse}
          leftNavLabel={`← ${parentLabel}`}
          primaryAction={{
            label: "Choose another →",
            onClick: backToBrowse,
          }}
        >
          <div className="companion-floating-card__outcome">
            <p className="companion-floating-card__outcome-title">
              You showed up for yourself.
            </p>
            <p className="companion-floating-card__outcome-body">
              {activity.title} — {cat?.label ?? "done"}. No scorecard. Just
              support.
            </p>
          </div>
        </CompanionFloatingCard>
      );
    }

    return (
      <div
        className={`${shellClass} ${embedded ? "" : "items-center text-center py-16"}`}
      >
        <p className="text-2xl font-semibold text-[#1f1c19]">
          You showed up for yourself.
        </p>
        <p className="mt-2 text-base text-[#6b635a]">
          {activity.title} — {cat?.label ?? "done"}. No scorecard. Just support.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={backToBrowse}
            className="rounded-xl bg-[#1e4f4f] px-6 py-2.5 text-sm font-semibold text-white"
          >
            Choose another
          </button>
        </div>
      </div>
    );
  }

  if (session.phase === "active" && activity) {
    const cat = ACTIVITY_CATEGORIES.find((c) => c.id === activity.categoryId);

    if (activity.customUi === "decision-compass") {
      if (sanctuary) {
        return (
          <CompanionFloatingCard
            activityTitle={activity.title}
            categoryId={activity.categoryId}
            categoryLabel={cat?.label}
            timeLabel={activity.timeLabel}
            onLeftNav={exitToParent}
            leftNavLabel={`← ${parentLabel}`}
            onPause={stop}
            onExit={exitToParent}
            exitLabel="Exit exercise"
          >
            <DecisionCompassPanel
              initialPrefill={decisionCompassPrefill}
              restoredSession={decisionCompassSession}
              onSessionChange={onDecisionCompassSessionChange}
              onComplete={onDecisionCompassComplete}
              onStop={stop}
              onClose={finish}
            />
          </CompanionFloatingCard>
        );
      }
      return (
        <div className={shellClass}>
          <DecisionCompassPanel
            initialPrefill={decisionCompassPrefill}
            restoredSession={decisionCompassSession}
            onSessionChange={onDecisionCompassSessionChange}
            onComplete={onDecisionCompassComplete}
            onStop={stop}
            onClose={finish}
          />
        </div>
      );
    }

    const steps = activity.steps;
    const currentStep = steps[session.stepIndex];
    const field = stepField(currentStep);
    const instruction = stepInstruction(currentStep);
    const isLast = session.stepIndex >= steps.length - 1;
    const canAdvance = canAdvanceActivityStep(field, session.answers);
    const showLinkedSuggestion = shouldShowLinkedSuggestion(
      activity,
      session.stepIndex,
      session.linkedBesideDismissed,
      session.linkedBesideOpened,
    );

    if (sanctuary) {
      const leftNavLabel =
        session.stepIndex > 0 ? "← Back" : `← ${parentLabel}`;
      const onLeftNav =
        session.stepIndex > 0
          ? () => goToStep(session.stepIndex - 1)
          : exitToParent;

      return (
        <CompanionFloatingCard
          categoryId={activity.categoryId}
          categoryLabel={cat?.label}
          activityTitle={activity.title}
          timeLabel={activity.timeLabel}
          stepIndex={session.stepIndex}
          stepCount={steps.length}
          instruction={instruction}
          stepKey={session.stepIndex}
          onLeftNav={onLeftNav}
          leftNavLabel={leftNavLabel}
          onPause={stop}
          onExit={exitToParent}
          pauseLabel="Pause"
          exitLabel="Exit exercise"
          linkedSuggestion={
            showLinkedSuggestion && activity.linkedSection && onOpenBeside ? (
              <CrossWorkspaceSuggestionCard
                line={crossWorkspaceBesideLine(
                  activity.linkedSection,
                  activity.linkedSuggestionHint,
                )}
                targetSection={activity.linkedSection}
                onAccept={() => acceptLinkedBeside(activity)}
                onDismiss={() => patchSession({ linkedBesideDismissed: true })}
              />
            ) : undefined
          }
          fields={
            field ? (
              <ActivityStepFields
                presentation="floating-card"
                field={field}
                answers={session.answers}
                onChange={(answers) => patchSession({ answers })}
              />
            ) : undefined
          }
          primaryAction={{
            label: !isLast
              ? field
                ? "Next step →"
                : "Continue →"
              : "Done →",
            onClick: !isLast
              ? () => goToStep(session.stepIndex + 1)
              : finish,
            disabled: !canAdvance,
          }}
        />
      );
    }

    return (
      <div className={shellClass}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 text-left">
            <>
              <p className="text-xs font-bold uppercase tracking-wide text-[#1e4f4f]">
                {cat?.label}
              </p>
              <h2 className="text-xl font-semibold text-[#1f1c19]">
                {activity.title}
              </h2>
              <p className="mt-1 text-sm text-[#6b635a]">{activity.timeLabel}</p>
            </>
          </div>
          {!embedded && onClose ? (
            <button
              type="button"
              onClick={stop}
              className="shrink-0 rounded-lg border border-[#d4cdc3] bg-white px-3 py-1.5 text-sm font-semibold text-[#6b635a] hover:border-[#1e4f4f]/40 hover:text-[#1e4f4f]"
            >
              Stop anytime
            </button>
          ) : (
            <button
              type="button"
              onClick={stop}
              className="shrink-0 rounded-lg border border-[#d4cdc3] bg-white px-3 py-1.5 text-sm font-semibold text-[#6b635a] hover:border-[#1e4f4f]/40 hover:text-[#1e4f4f]"
            >
              Stop
            </button>
          )}
        </div>

        {showLinkedSuggestion && activity.linkedSection && onOpenBeside ? (
          <div className="mt-4">
            <CrossWorkspaceSuggestionCard
              line={crossWorkspaceBesideLine(
                activity.linkedSection,
                activity.linkedSuggestionHint,
              )}
              targetSection={activity.linkedSection}
              onAccept={() => acceptLinkedBeside(activity)}
              onDismiss={() =>
                patchSession({ linkedBesideDismissed: true })
              }
            />
          </div>
        ) : null}

        <div className="mt-4 min-h-0 flex-1 overflow-y-auto rounded-2xl border border-[#e7dfd4] bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
            Step {session.stepIndex + 1} of {steps.length}
          </p>
          <p className="mt-3 text-lg leading-relaxed text-[#1f1c19]">
            {instruction}
          </p>
          {field ? (
            <ActivityStepFields
              field={field}
              answers={session.answers}
              onChange={(answers) => patchSession({ answers })}
            />
          ) : null}
        </div>

        <div className="mt-4 flex shrink-0 flex-wrap gap-2">
          {session.stepIndex > 0 ? (
            <button
              type="button"
              onClick={() => goToStep(session.stepIndex - 1)}
              className="rounded-xl border border-[#c9bfb0] bg-white px-4 py-2.5 text-sm font-semibold text-[#4b463f]"
            >
              Back
            </button>
          ) : null}
          {!isLast ? (
            <button
              type="button"
              disabled={!canAdvance}
              onClick={() => goToStep(session.stepIndex + 1)}
              className="flex-1 rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a] disabled:cursor-not-allowed disabled:bg-[#9aaba8]"
            >
              Next step
            </button>
          ) : (
            <button
              type="button"
              disabled={!canAdvance}
              onClick={finish}
              className="flex-1 rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a] disabled:cursor-not-allowed disabled:bg-[#9aaba8]"
            >
              Done
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        embedded
          ? shellClass
          : "companion-fade-in flex h-full min-h-0 w-full justify-center overflow-y-auto px-4 py-6 sm:px-6"
      }
    >
      <div className={embedded ? "min-h-0 flex-1" : browseShellClass}>
        <div className="flex items-start justify-between gap-3">
          <header className="min-w-0 text-left">
            <h1 className="text-2xl font-semibold text-[#1f1c19]">
              {browseTitle}
            </h1>
            <p className="mt-2 text-base leading-relaxed text-[#6b635a]">
              {browseSubtitle}
            </p>
          </header>
          {onClose && !embedded ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl text-[#6b635a] hover:bg-[#1e4f4f]/10"
            >
              ✕
            </button>
          ) : null}
        </div>

        <ul className="mt-6 flex flex-col gap-2">
          {variant === "guided"
            ? guidedExercises.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => launchGuidedExercise(item.activityId)}
                    className="flex w-full items-start gap-3 rounded-2xl border border-[#d4cdc3] bg-white/85 px-3.5 py-3 text-left shadow-sm transition-colors hover:border-[#1e4f4f]/35 hover:bg-white"
                  >
                    <CompanionObjectVisual
                      objectId={item.objectId}
                      size="sm"
                      variant="icon"
                      className="shrink-0"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-semibold text-[#1f1c19]">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-sm leading-snug text-[#6b635a]">
                        {item.purpose}
                      </span>
                    </span>
                  </button>
                </li>
              ))
            : (
                <li>
                  <p className="rounded-2xl border border-[#d4cdc3] bg-white/85 px-3.5 py-3 text-sm text-[#6b635a]">
                    Relief tools live under <strong>Focus</strong> — pick how you&apos;re
                    feeling or open a tool from there.
                  </p>
                  {onClose ? (
                    <button
                      type="button"
                      onClick={onClose}
                      className="mt-3 w-full rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white"
                    >
                      Go to Focus
                    </button>
                  ) : null}
                </li>
              )}
        </ul>
      </div>
    </div>
  );
}
