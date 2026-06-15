"use client";

import { dismissDayDesigner } from "@/lib/day-designer";

type DayDesignerPromptCardProps = {
  question: string;
  onDismiss: () => void;
};

/** One short planning question at a time — optional, never forced. */
export function DayDesignerPromptCard({
  question,
  onDismiss,
}: DayDesignerPromptCardProps) {
  function handleDismiss() {
    dismissDayDesigner();
    onDismiss();
  }

  return (
    <div className="rounded-2xl border border-[#1e4f4f]/15 bg-white/90 p-4 shadow-sm">
      <p className="text-center text-base leading-relaxed text-[#6b635a]">
        {question}
      </p>
      <p className="mt-2 text-center text-xs text-[#9a8f82]">
        Reply in the chat — one answer is enough.
      </p>
      <div className="mt-3 flex justify-center">
        <button
          type="button"
          onClick={handleDismiss}
          className="rounded-full border border-[#1e4f4f]/30 bg-white/80 px-4 py-2.5 text-sm font-semibold text-[#1e4f4f] hover:bg-white"
        >
          Skip planning
        </button>
      </div>
    </div>
  );
}
