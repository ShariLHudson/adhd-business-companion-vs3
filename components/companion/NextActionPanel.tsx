"use client";

import type { CommandCenterNextAction } from "@/lib/ecosystem/commandCenter/commandCenterTypes";

export function NextActionPanel({
  nextAction,
  onWork,
}: {
  nextAction: CommandCenterNextAction;
  onWork?: () => void;
}) {
  return (
    <section className="rounded-2xl border-2 border-[#1e4f4f]/30 bg-gradient-to-br from-[#1e4f4f]/[0.08] to-white p-5 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#1e4f4f]/70">
        What should I do next?
      </p>
      <h2 className="mt-2 text-xl font-semibold leading-snug text-[#1f1c19]">
        {nextAction.title}
      </h2>
      <p className="mt-2 text-sm text-[#6b635a]">{nextAction.reason}</p>
      {onWork ? (
        <button
          type="button"
          onClick={onWork}
          className="mt-4 w-full rounded-xl bg-[#1e4f4f] px-4 py-3 text-sm font-semibold text-white hover:bg-[#163a3a] sm:w-auto"
        >
          Let&apos;s Work On It
        </button>
      ) : null}
    </section>
  );
}
