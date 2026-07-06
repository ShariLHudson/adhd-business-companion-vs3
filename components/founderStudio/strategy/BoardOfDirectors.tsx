"use client";

import { useState } from "react";

import type { StrategyBoardMember } from "@/lib/founder/strategyCenter/types";

type BoardOfDirectorsProps = {
  members: StrategyBoardMember[];
};

function availabilityLabel(status: StrategyBoardMember["availability"]): string {
  if (status === "in-session") return "In Session";
  if (status === "reserved") return "Reserved";
  return "Available";
}

export function BoardOfDirectors({ members }: BoardOfDirectorsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <section className="strategy-board" aria-labelledby="strategy-board-heading">
      <div className="strategy-board__intro">
        <h2 className="strategy-board__heading" id="strategy-board-heading">
          Executive Board
        </h2>
        <p className="strategy-board__sub">
          Board of Directors architecture — future discussions, no AI yet.
        </p>
      </div>

      <div className="strategy-board__seating">
        {members.map((member) => {
          const expanded = expandedId === member.id;
          return (
            <article
              key={member.id}
              className={`strategy-board__seat strategy-board__seat--${member.availability}${
                expanded ? " strategy-board__seat--expanded" : ""
              }`}
            >
              <div className="strategy-board__initials" aria-hidden="true">
                {member.initials}
              </div>
              <h3 className="strategy-board__role">{member.role}</h3>
              <p className="strategy-board__expertise">{member.expertise}</p>
              <p className="strategy-board__focus">
                <span>Focus</span> {member.currentFocus}
              </p>
              <span
                className={`strategy-board__availability strategy-board__availability--${member.availability}`}
              >
                {availabilityLabel(member.availability)}
              </span>
              {expanded ? (
                <p className="strategy-board__future">
                  Future discussion surface — FLAME™ will bring live counsel here.
                </p>
              ) : null}
              <button
                type="button"
                className="strategy-board__expand"
                onClick={() => setExpandedId(expanded ? null : member.id)}
                aria-expanded={expanded}
              >
                {expanded ? "Close" : "Expand"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
