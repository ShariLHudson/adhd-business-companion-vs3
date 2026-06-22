"use client";

import { useState } from "react";
import type { TimeBlock } from "@/lib/companionStore";
import {
  formatMomentumDuration,
  otherImportantFollowUpPrompt,
  otherImportantUpdateOffer,
  type MomentumCheckInOutcome,
  type MomentumNotTodayAction,
  type MomentumOtherImportantPayload,
} from "@/lib/momentumAppointment";

const CHECK_IN_OPTIONS: {
  id: MomentumCheckInOutcome;
  label: string;
  emoji: string;
}[] = [
  { id: "finished", label: "Finished it", emoji: "✅" },
  { id: "progress", label: "Made progress", emoji: "✅" },
  { id: "other-important", label: "Worked on something else important", emoji: "✅" },
  { id: "not-today", label: "Not today", emoji: "✅" },
];

const NOT_TODAY_OPTIONS: {
  id: MomentumNotTodayAction;
  label: string;
}[] = [
  { id: "try-tomorrow", label: "Try again tomorrow" },
  { id: "make-smaller", label: "Make it smaller" },
  { id: "reschedule", label: "Schedule another time" },
  { id: "parking-lot", label: "Put it in the Parking Lot" },
  { id: "talk-through", label: "💬 Talk it through with Shari" },
  { id: "let-go", label: "Let it go" },
];

type Phase =
  | "check-in"
  | "not-today"
  | "other-important-what"
  | "other-important-update";

const OVERLAY_CLASS = {
  fixed: "fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4",
  scoped:
    "absolute inset-0 z-[70] flex items-center justify-center bg-black/30 p-4",
} as const;

// Shame-free check-in when a Momentum Appointment arrives.
export function TimeBlockTrigger({
  block,
  scoped = false,
  onCheckIn,
  onOtherImportant,
  onNotTodayAction,
  onStartNow,
  onDismiss,
}: {
  block: TimeBlock;
  /** Cover the main pane only — keeps the sidebar clickable. */
  scoped?: boolean;
  onCheckIn: (outcome: MomentumCheckInOutcome) => void;
  onOtherImportant: (payload: MomentumOtherImportantPayload) => void;
  onNotTodayAction: (action: MomentumNotTodayAction) => void;
  onStartNow: () => void;
  onDismiss: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("check-in");
  const [attention, setAttention] = useState("");
  const goal = block.goal?.trim() || "Move this forward.";
  const duration = formatMomentumDuration(block);
  const overlayClass = OVERLAY_CLASS[scoped ? "scoped" : "fixed"];

  if (phase === "other-important-what") {
    return (
      <div className={overlayClass}>
        <div className="companion-fade-in w-full max-w-md rounded-2xl bg-[#faf6f0] p-6 shadow-2xl">
          <p className="text-lg font-semibold text-[#1f1c19]">
            {otherImportantFollowUpPrompt(block.title)}
          </p>
          <p className="mt-1 text-sm text-[#6b635a]">
            Reality matters more than the plan — no penalty.
          </p>
          <textarea
            value={attention}
            onChange={(e) => setAttention(e.target.value)}
            placeholder="What actually got your focus?"
            rows={3}
            className="mt-4 w-full resize-none rounded-xl border border-[#c9bfb0] bg-white px-3 py-2.5 text-base outline-none focus:border-[#1e4f4f]"
          />
          <button
            type="button"
            disabled={!attention.trim()}
            onClick={() => setPhase("other-important-update")}
            className="mt-4 w-full rounded-xl bg-[#1e4f4f] py-3 text-base font-semibold text-white disabled:bg-[#9aaba8]"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (phase === "other-important-update") {
    return (
      <div className={overlayClass}>
        <div className="companion-fade-in w-full max-w-md rounded-2xl bg-[#faf6f0] p-6 shadow-2xl">
          <p className="text-base leading-relaxed text-[#2d2926]">
            {otherImportantUpdateOffer(attention)}
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={() =>
                onOtherImportant({
                  whatGotAttention: attention.trim(),
                  updateAppointment: true,
                  newTitle: attention.trim(),
                })
              }
              className="rounded-xl border border-[#d4cdc3] bg-white px-4 py-3 text-left text-base font-semibold text-[#1f1c19] hover:border-[#1e4f4f]/40"
            >
              Yes — update my appointment
            </button>
            <button
              type="button"
              onClick={() =>
                onOtherImportant({
                  whatGotAttention: attention.trim(),
                  updateAppointment: false,
                })
              }
              className="rounded-xl border border-[#d4cdc3] bg-white px-4 py-3 text-left text-base font-semibold text-[#1f1c19] hover:border-[#1e4f4f]/40"
            >
              No thanks — keep the original
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "not-today") {
    return (
      <div className={overlayClass}>
        <div className="companion-fade-in w-full max-w-md rounded-2xl bg-[#faf6f0] p-6 shadow-2xl">
          <p className="text-base leading-relaxed text-[#2d2926]">
            Looks like today went a different direction. What would you like to
            do with <strong>{block.title}</strong>?
          </p>
          <div className="mt-4 flex flex-col gap-2">
            {NOT_TODAY_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onNotTodayAction(opt.id)}
                className="rounded-xl border border-[#d4cdc3] bg-white px-4 py-3 text-left text-base font-semibold text-[#1f1c19] hover:border-[#1e4f4f]/40 hover:bg-[#f0f5f5]"
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="mt-4 w-full rounded-xl px-4 py-2.5 text-sm font-medium text-[#6b635a] hover:bg-black/5"
          >
            Stay here for now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={overlayClass}>
      <div className="companion-fade-in w-full max-w-md rounded-2xl bg-[#faf6f0] p-6 shadow-2xl">
        <p className="text-sm font-semibold text-[#1e4f4f]">
          Momentum Appointment
        </p>
        <p className="mt-1 text-2xl font-semibold text-[#1f1c19]">
          {block.title}
        </p>
        <p className="mt-2 text-sm text-[#6b635a]">
          Goal: {goal}
          {duration !== "Flexible" ? ` · ${duration}` : " · Flexible time"}
        </p>

        <p className="mt-5 text-lg font-semibold text-[#1f1c19]">
          How did it go?
        </p>
        <p className="mt-1 text-sm text-[#6b635a]">
          Every answer counts — movement matters more than perfection.
        </p>

        <div className="mt-4 flex flex-col gap-2">
          {CHECK_IN_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                if (opt.id === "not-today") {
                  setPhase("not-today");
                } else if (opt.id === "other-important") {
                  setPhase("other-important-what");
                } else {
                  onCheckIn(opt.id);
                }
              }}
              className="flex items-center gap-3 rounded-xl border border-[#d4cdc3] bg-white px-4 py-3 text-left text-base font-semibold text-[#1f1c19] hover:border-[#1e4f4f]/40 hover:bg-[#f0f5f5]"
            >
              <span aria-hidden="true">{opt.emoji}</span>
              {opt.label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-[#e7dfd4] pt-4">
          <button
            type="button"
            onClick={onStartNow}
            className="rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
          >
            ▶ Start now
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-[#6b635a] hover:bg-black/5"
          >
            Not right now
          </button>
        </div>
      </div>
    </div>
  );
}
