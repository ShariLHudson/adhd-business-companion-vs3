"use client";

import { useMemo, useState } from "react";
import { VoiceAnswerField } from "@/components/companion/VoiceAnswerField";
import { StrategyExecutionConnections } from "@/components/companion/StrategyExecutionConnections";
import {
  EMPTY_GUIDED_CREATE,
  GUIDED_CREATE_STAGES,
  buildGuidedStrategyDraft,
  canAdvanceGuidedCreate,
  chamberGuidanceForCreate,
  guidedCreateApproachOptions,
  nextGuidedCreateStage,
  shouldOfferBoardForCreate,
  type GuidedCreateAnswers,
  type GuidedCreateStageId,
} from "@/lib/strategyLibrary/guidedCreate";
import { suggestCategory, saveUserStrategy } from "@/lib/userStrategies";
import type { AppSection } from "@/lib/companionUi";
import type { Strategy } from "@/lib/strategySystem";

type Props = {
  onBack: () => void;
  onSaved: () => void;
  onOpen?: (section: AppSection) => void;
  onAsk?: (prompt: string) => void;
};

export function StrategyGuidedCreatePanel({
  onBack,
  onSaved,
  onOpen,
  onAsk,
}: Props) {
  const [stage, setStage] = useState<GuidedCreateStageId>("problem");
  const [answers, setAnswers] = useState<GuidedCreateAnswers>(EMPTY_GUIDED_CREATE);
  const [pastNotes, setPastNotes] = useState("");
  const meta = GUIDED_CREATE_STAGES.find((s) => s.id === stage)!;
  const approaches = useMemo(
    () => guidedCreateApproachOptions(answers),
    [answers],
  );
  const chamber = useMemo(
    () => chamberGuidanceForCreate(answers),
    [answers],
  );
  const draft = useMemo(() => buildGuidedStrategyDraft(answers), [answers]);
  const previewStrategy = useMemo(
    (): Strategy => ({
      id: "guided-create-preview",
      title: draft.title,
      problem: draft.description,
      whyWorks: draft.whyItWorks,
      whyBrain: answers.adhdFriction || "Built around your real energy and constraints.",
      whenToUse: draft.whenToUse,
      steps: draft.steps,
      example: answers.betterLooksLike || "",
      categoryId: "overwhelm",
      timeMin: 15,
    }),
    [answers.adhdFriction, answers.betterLooksLike, draft],
  );

  function patch(partial: Partial<GuidedCreateAnswers>) {
    setAnswers((prev) => ({ ...prev, ...partial }));
  }

  function goNext() {
    if (!canAdvanceGuidedCreate(stage, answers)) return;
    if (stage === "board" && answers.boardChoice === "") {
      patch({ boardChoice: "skip" });
    }
    if (stage === "visual" && answers.visualChoice === "") {
      patch({ visualChoice: "skip" });
    }
    const next = nextGuidedCreateStage(stage, {
      ...answers,
      boardChoice:
        answers.boardChoice ||
        (!shouldOfferBoardForCreate(answers) ? "skip" : answers.boardChoice),
      visualChoice: answers.visualChoice || "skip",
    });
    if (next) setStage(next);
  }

  function saveDraft() {
    const built = buildGuidedStrategyDraft(answers);
    const { type, category } = suggestCategory(
      built.title,
      built.description,
    );
    saveUserStrategy({
      title: built.title,
      type,
      category,
      source: "user_generated",
      description: built.description,
      whenToUse: built.whenToUse,
      steps: built.steps,
      whyItWorks: built.whyItWorks,
      example: answers.betterLooksLike || undefined,
    });
    onSaved();
  }

  return (
    <div
      className="companion-fade-in mx-auto flex h-full min-h-0 max-w-xl flex-col overflow-y-auto px-6 py-8"
      data-testid="strategy-guided-create"
      data-stage={stage}
    >
      <button
        type="button"
        onClick={onBack}
        className="self-start text-sm font-semibold text-[#1e4f4f]"
      >
        ‹ Strategy Library
      </button>
      <p className="mt-2 text-2xl font-semibold text-[#1f1c19]">
        Build your own strategy
      </p>
      <p className="mt-1 text-sm leading-relaxed text-[#6b635a]">
        We&apos;ll shape this together — one stage at a time. No blank form.
      </p>
      <p className="mt-4 text-sm font-semibold text-[#1e4f4f]">
        {meta.title}
      </p>
      <p className="mt-0.5 text-sm text-[#4b463f]">{meta.prompt}</p>

      {stage === "problem" ? (
        <div className="mt-4 flex flex-col gap-3">
          <VoiceAnswerField
            value={answers.happening}
            onChange={(v) => patch({ happening: v })}
            placeholder="What is happening?"
            inputClassName="min-h-[80px] w-full rounded-lg border border-[#c9bfb0] px-3 py-2.5 text-base"
          />
          <VoiceAnswerField
            value={answers.whoAffected}
            onChange={(v) => patch({ whoAffected: v })}
            multiline={false}
            placeholder="Who is affected?"
          />
          <VoiceAnswerField
            value={answers.whyNow}
            onChange={(v) => patch({ whyNow: v })}
            placeholder="Why does it matter now?"
            inputClassName="min-h-[64px] w-full rounded-lg border border-[#c9bfb0] px-3 py-2.5 text-base"
          />
          <div className="flex flex-wrap gap-2" role="group" aria-label="Recurring or one-time">
            {(
              [
                ["recurring", "Recurring"],
                ["one-time", "One-time"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={answers.recurring === id}
                onClick={() => patch({ recurring: id })}
                className={
                  answers.recurring === id
                    ? "rounded-full border-2 border-[#1e4f4f] bg-white px-3 py-1.5 text-sm font-semibold"
                    : "rounded-full border border-[#d4cdc3] bg-white px-3 py-1.5 text-sm"
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {stage === "success" ? (
        <div className="mt-4 flex flex-col gap-3">
          <VoiceAnswerField
            value={answers.betterLooksLike}
            onChange={(v) => patch({ betterLooksLike: v })}
            placeholder="What would better look like?"
            inputClassName="min-h-[64px] w-full rounded-lg border border-[#c9bfb0] px-3 py-2.5 text-base"
          />
          <VoiceAnswerField
            value={answers.outcome}
            onChange={(v) => patch({ outcome: v })}
            placeholder="What outcome matters most?"
            inputClassName="min-h-[64px] w-full rounded-lg border border-[#c9bfb0] px-3 py-2.5 text-base"
          />
          <VoiceAnswerField
            value={answers.protect}
            onChange={(v) => patch({ protect: v })}
            placeholder="What must be protected?"
            inputClassName="min-h-[64px] w-full rounded-lg border border-[#c9bfb0] px-3 py-2.5 text-base"
          />
        </div>
      ) : null}

      {stage === "constraints" ? (
        <div className="mt-4 flex flex-col gap-3">
          <VoiceAnswerField
            value={answers.time}
            onChange={(v) => patch({ time: v })}
            multiline={false}
            placeholder="Time available"
          />
          <VoiceAnswerField
            value={answers.energy}
            onChange={(v) => patch({ energy: v })}
            multiline={false}
            placeholder="Energy / motivation"
          />
          <VoiceAnswerField
            value={answers.adhdFriction}
            onChange={(v) => patch({ adhdFriction: v })}
            placeholder="ADHD friction right now"
            inputClassName="min-h-[64px] w-full rounded-lg border border-[#c9bfb0] px-3 py-2.5 text-base"
          />
          <VoiceAnswerField
            value={answers.otherConstraints}
            onChange={(v) => patch({ otherConstraints: v })}
            placeholder="Money, people, deadlines, or other limits"
            inputClassName="min-h-[64px] w-full rounded-lg border border-[#c9bfb0] px-3 py-2.5 text-base"
          />
        </div>
      ) : null}

      {stage === "knowledge" ? (
        <div className="mt-4">
          <VoiceAnswerField
            value={pastNotes}
            onChange={setPastNotes}
            placeholder="What have you already tried? What almost worked?"
            inputClassName="min-h-[100px] w-full rounded-lg border border-[#c9bfb0] px-3 py-2.5 text-base"
          />
          <p className="mt-2 text-sm text-[#6b635a]">
            Optional — skip if nothing comes to mind. We can still build a solid
            first version.
          </p>
        </div>
      ) : null}

      {stage === "options" ? (
        <div className="mt-4 flex flex-col gap-2" role="list">
          {approaches.map((option) => (
            <button
              key={option}
              type="button"
              role="listitem"
              aria-pressed={answers.approachChoice === option}
              onClick={() => patch({ approachChoice: option })}
              className={
                answers.approachChoice === option
                  ? "rounded-2xl border-2 border-[#1e4f4f] bg-white px-4 py-3 text-left text-sm leading-relaxed"
                  : "rounded-2xl border border-[#d4cdc3] bg-white/90 px-4 py-3 text-left text-sm leading-relaxed"
              }
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}

      {stage === "chamber" ? (
        <div
          className="mt-4 rounded-2xl border border-[#1e4f4f]/15 bg-white/85 p-4"
          data-testid="strategy-create-chamber"
        >
          <p className="text-sm font-semibold text-[#1f1c19]">
            Specialist guidance used
          </p>
          {chamber.map((c) => (
            <div key={c.roleLabel} className="mt-3">
              <p className="text-sm font-semibold text-[#1e4f4f]">
                {c.roleLabel}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-[#2d2926]">
                {c.guidance}
              </p>
            </div>
          ))}
          <p className="mt-3 text-sm text-[#6b635a]">
            Shari keeps this in one conversation — no separate Chamber chats.
          </p>
        </div>
      ) : null}

      {stage === "board" ? (
        <div className="mt-4 flex flex-col gap-2">
          <p className="text-sm leading-relaxed text-[#4b463f]">
            This looks like it may carry risk or long-term trade-offs. Board
            review is optional.
          </p>
          {(
            [
              ["full", "Ask for a Board stress-test later"],
              ["skip", "Skip for now"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={answers.boardChoice === id}
              onClick={() => patch({ boardChoice: id })}
              className={
                answers.boardChoice === id
                  ? "rounded-2xl border-2 border-[#1e4f4f] bg-white px-4 py-3 text-left text-sm"
                  : "rounded-2xl border border-[#d4cdc3] bg-white px-4 py-3 text-left text-sm"
              }
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}

      {stage === "visual" ? (
        <div className="mt-4 flex flex-col gap-2">
          <p className="text-sm leading-relaxed text-[#4b463f]">
            A simple sequence or map can help when the steps feel tangled. You
            can stay here either way.
          </p>
          {(
            [
              ["yes", "Open Visual Thinking when I finish"],
              ["skip", "Stay with the written strategy"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={answers.visualChoice === id}
              onClick={() => patch({ visualChoice: id })}
              className={
                answers.visualChoice === id
                  ? "rounded-2xl border-2 border-[#1e4f4f] bg-white px-4 py-3 text-left text-sm"
                  : "rounded-2xl border border-[#d4cdc3] bg-white px-4 py-3 text-left text-sm"
              }
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}

      {stage === "build" ? (
        <div className="mt-4 flex flex-col gap-3">
          <VoiceAnswerField
            value={answers.title}
            onChange={(v) => patch({ title: v })}
            multiline={false}
            placeholder="Strategy name"
          />
          <VoiceAnswerField
            value={answers.steps}
            onChange={(v) => patch({ steps: v })}
            placeholder="Steps (one per line)"
            inputClassName="min-h-[100px] w-full rounded-lg border border-[#c9bfb0] px-3 py-2.5 text-base"
          />
          {!answers.steps.trim() && answers.approachChoice ? (
            <p className="text-sm text-[#6b635a]">
              If you leave steps blank, I&apos;ll start with your chosen
              approach.
            </p>
          ) : null}
        </div>
      ) : null}

      {stage === "connect" ? (
        <div className="mt-2">
          <StrategyExecutionConnections
            strategy={previewStrategy}
            onOpen={onOpen}
            onAsk={onAsk}
            showOptionalReviews={false}
          />
          <p className="mt-2 text-sm text-[#6b635a]">
            Connections use your draft title and first step. Save on the next
            screen to keep the full strategy.
          </p>
        </div>
      ) : null}

      {stage === "review" ? (
        <div
          className="mt-4 rounded-2xl border border-[#d4cdc3] bg-white/90 p-4"
          data-testid="strategy-create-review"
        >
          <p className="text-xl font-semibold text-[#1f1c19]">{draft.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-[#2d2926]">
            {draft.description}
          </p>
          <p className="mt-3 text-sm font-semibold text-[#1e4f4f]">Steps</p>
          <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-[#2d2926]">
            {draft.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[#6b635a]">
            {draft.whyItWorks}
          </p>
          {pastNotes.trim() ? (
            <p className="mt-3 text-sm text-[#6b635a]">
              Past notes: {pastNotes.trim()}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3 pb-8">
        {stage !== "problem" ? (
          <button
            type="button"
            onClick={() => {
              const ids = GUIDED_CREATE_STAGES.map((s) => s.id);
              const i = ids.indexOf(stage);
              if (i > 0) setStage(ids[i - 1]!);
            }}
            className="rounded-xl border border-[#c9bfb0] bg-white px-4 py-2.5 text-sm font-semibold text-[#1f1c19]"
          >
            Back
          </button>
        ) : null}
        {stage !== "review" ? (
          <button
            type="button"
            disabled={!canAdvanceGuidedCreate(stage, answers)}
            onClick={goNext}
            data-testid="strategy-guided-create-next"
            className="rounded-xl bg-[#1e4f4f] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              saveDraft();
              if (answers.visualChoice === "yes") {
                onOpen?.("visual-focus");
              }
              if (answers.boardChoice === "full") {
                onAsk?.(
                  `I'd like a Board stress-test of my new strategy “${draft.title}”.`,
                );
              }
            }}
            data-testid="strategy-guided-create-save"
            className="rounded-xl bg-[#1e4f4f] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Save strategy
          </button>
        )}
      </div>
    </div>
  );
}
