"use client";

import { ADVISORS } from "@/lib/ecosystem/board";
import type { CommandCenterAdvisorBoard } from "@/lib/ecosystem/commandCenter/commandCenterTypes";

export function FounderBoardPanel({ board }: { board: CommandCenterAdvisorBoard }) {
  const advisorName =
    board.mostActiveAdvisorName ??
    (board.mostActiveAdvisor ? ADVISORS[board.mostActiveAdvisor].name : null);

  return (
    <section className="rounded-2xl border border-[#d4cdc3] bg-white/90 p-4 shadow-sm">
      <h3 className="text-sm font-bold uppercase tracking-wide text-[#6b635a]">
        Founder Board
      </h3>
      {advisorName ? (
        <p className="mt-2 text-sm text-[#2d2926]">
          Most active advisor:{" "}
          <span className="font-semibold text-[#1e4f4f]">{advisorName}</span>
        </p>
      ) : null}

      {board.priorityRecommendation ? (
        <div className="mt-3 rounded-xl border border-[#e4ddd2] bg-white px-3 py-2">
          <p className="text-[10px] font-bold uppercase text-[#9a6a1e]">Priority</p>
          <p className="text-sm text-[#1f1c19]">{board.priorityRecommendation}</p>
        </div>
      ) : null}

      {board.riskRecommendation ? (
        <div className="mt-2 rounded-xl border border-[#a85c4a]/25 bg-[#a85c4a]/[0.05] px-3 py-2">
          <p className="text-[10px] font-bold uppercase text-[#a85c4a]">Risk</p>
          <p className="text-sm text-[#1f1c19]">{board.riskRecommendation}</p>
        </div>
      ) : null}

      {board.opportunityRecommendation ? (
        <div className="mt-2 rounded-xl border border-[#1e4f4f]/20 bg-[#1e4f4f]/[0.04] px-3 py-2">
          <p className="text-[10px] font-bold uppercase text-[#1e4f4f]">Opportunity</p>
          <p className="text-sm text-[#1f1c19]">{board.opportunityRecommendation}</p>
        </div>
      ) : null}

      {board.currentRecommendations.length > 1 ? (
        <ul className="mt-3 flex flex-col gap-1.5 text-xs text-[#6b635a]">
          {board.currentRecommendations.slice(1, 3).map((r) => (
            <li key={r.text}>{r.text}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
