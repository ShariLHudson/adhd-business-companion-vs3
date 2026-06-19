"use client";

import { useState } from "react";
import { logMomentum } from "@/lib/companionStore";
import {
  ACTIVITY_CATEGORIES,
  getActivityById,
  type ActivityCategoryId,
  type CompanionActivity,
} from "@/lib/companionActivities";
import {
  canAdvanceActivityStep,
  defaultAnswersForField,
  fieldStorageKey,
  prepareStepAnswers,
  stepField,
  stepInstruction,
  type ActivityAnswers,
} from "@/lib/activityFields";
import { ActivityStepFields } from "@/components/companion/ActivityStepFields";
import {
  crossWorkspaceBesideLine,
  crossWorkspaceContextMessage,
} from "@/lib/crossWorkspaceSuggestion";
import { NO_CATEGORY } from "@/lib/categoryRevealUx";
import { DecisionCompassPanel } from "@/components/companion/DecisionCompassPanel";
import { CrossWorkspaceSuggestionCard } from "@/components/companion/CrossWorkspaceSuggestionCard";
import type { DecisionCompassPrefill } from "@/lib/decisionCompass";
import type { PersistedDecisionCompassSession } from "@/lib/decisionCompassSessionStore";
import type { AppSection } from "@/lib/companionUi";
import {
  HELP_ME_RIGHT_NOW_MENU,
  type HelpMeRightNowMenuItem,
} from "@/lib/focusToolDefinitions";
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
  onQuickTool,
  onOpenDecisionCompass,
  onClose,
  embedded = false,
  variant = "help-now",
  session: controlledSession,
  onSessionChange,
  decisionCompassPrefill = null,
  decisionCompassSession = null,
  onDecisionCompassSessionChange,
  onDecisionCompassComplete,
}: {
  onOpenBeside?: (section: AppSection, payload: OpenBesidePayload) => void;
  /** Featured Help Me Right Now menu — open section, activity, or chat. */
  onQuickTool?: (item: HelpMeRightNowMenuItem) => void;
  /** Opens ADHD Decision Compass split workspace (not the legacy step exercise). */
  onOpenDecisionCompass?: () => void;
  onClose?: () => void;
  embedded?: boolean;
  /** Relief tools vs structured guided exercises. */
  variant?: ActivityPanelVariant;
  session?: ActivitySessionState;
  onSessionChange?: (session: ActivitySessionState) => void;
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
    variant === "guided" ? "Guided Exercises" : "Help Me Right Now";
  const browseSubtitle =
    variant === "guided"
      ? "Structured thinking and self-reflection — go deeper when you have a few minutes."
      : "Immediate relief and momentum — pick what matches right now.";

  function start(a: CompanionActivity) {
    const firstField = stepField(a.steps[0]);
    patchSession({
      activityId: a.id,
      stepIndex: 0,
      phase: "active",
      categoryId: a.categoryId,
      linkedBesideDismissed: false,
      linkedBesideOpened: false,
      answers: firstField
        ? { [fieldStorageKey(firstField)]: defaultAnswersForField(firstField) }
        : {},
    });
  }

  function launchGuidedExercise(activityId: string) {
    if (activityId === "decision-compass") {
      onOpenDecisionCompass?.();
      return;
    }
    const a = getActivityById(activityId);
    if (a) start(a);
  }

  function launchQuickTool(item: HelpMeRightNowMenuItem) {
    if (onQuickTool) {
      onQuickTool(item);
      return;
    }
    if (item.kind === "activity" && item.activityId) {
      launchGuidedExercise(item.activityId);
    }
  }

  function ensureStepAnswers(
    activity: CompanionActivity,
    stepIndex: number,
    answers: ActivityAnswers,
  ): ActivityAnswers {
    const field = stepField(activity.steps[stepIndex]);
    if (!field) return answers;
    let next = answers;
    if (answers[fieldStorageKey(field)] === undefined && field.type !== "review-list") {
      const initial = defaultAnswersForField(field);
      if (initial !== undefined) {
        next = { ...next, [fieldStorageKey(field)]: initial };
      }
    }
    return prepareStepAnswers(field, next);
  }

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

  function backToBrowse() {
    patchSession({ ...EMPTY_ACTIVITY_SESSION, categoryId: session.categoryId });
  }

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

  const shellClass = embedded
    ? "flex h-full min-h-0 w-full max-w-xl flex-col overflow-hidden px-4 py-5"
    : "companion-fade-in flex h-full min-h-0 w-full max-w-xl flex-col px-6 py-8";

  const browseShellClass = embedded
    ? "flex h-full min-h-0 w-full max-w-xl flex-col overflow-hidden"
    : "companion-fade-in mx-auto flex h-full min-h-0 w-full max-w-xl flex-col px-6 py-8";

  if (session.phase === "stopped") {
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
            onClick={backToBrowse}
            className="rounded-xl bg-[#1e4f4f] px-6 py-2.5 text-sm font-semibold text-white"
          >
            Back to {variant === "guided" ? "exercises" : "activities"}
          </button>
        </div>
      </div>
    );
  }

  if (session.phase === "complete" && activity) {
    const cat = ACTIVITY_CATEGORIES.find((c) => c.id === activity.categoryId);
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
    if (activity.customUi === "decision-compass") {
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

    const cat = ACTIVITY_CATEGORIES.find((c) => c.id === activity.categoryId);
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

    return (
      <div className={shellClass}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 text-left">
            <p className="text-xs font-bold uppercase tracking-wide text-[#1e4f4f]">
              {cat?.label}
            </p>
            <h2 className="text-xl font-semibold text-[#1f1c19]">
              {activity.title}
            </h2>
            <p className="mt-1 text-sm text-[#6b635a]">{activity.timeLabel}</p>
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
                    <span
                      aria-hidden="true"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f5f1ea] text-lg"
                    >
                      {item.emoji}
                    </span>
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
            : HELP_ME_RIGHT_NOW_MENU.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => launchQuickTool(item)}
                    className="flex w-full items-start gap-3 rounded-2xl border border-[#d4cdc3] bg-white/85 px-3.5 py-3 text-left shadow-sm transition-colors hover:border-[#1e4f4f]/35 hover:bg-white"
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f5f1ea] text-lg"
                    >
                      {item.emoji}
                    </span>
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
              ))}
        </ul>
      </div>
    </div>
  );
}
