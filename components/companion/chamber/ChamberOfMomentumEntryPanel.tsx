"use client";

import { EstateWorkspace } from "@/components/companion/EstateWorkspace";
import { GrowPanelBackButton } from "@/components/companion/GrowPanelBackButton";
import { GrowRoomShell } from "@/components/companion/GrowRoomShell";
import {
  CHAMBER_ENTRY_OPTIONS,
  CHAMBER_ENTRY_PROMPT,
  CHAMBER_INTERNAL_ACCESS_OPTIONS,
  type ChamberMomentumIntent,
} from "@/lib/estate/chamberOfMomentumRouting";
import { CHAMBER_OF_MOMENTUM_MEMBER_NAME } from "@/lib/estate/chamberOfMomentumIdentity";
import "@/app/companion/chamber-of-momentum.css";

type Props = {
  onBack: () => void;
  onSelectIntent: (intent: ChamberMomentumIntent) => void;
};

/** Chamber of Momentum™ doorway — one question, then internal routing. */
export function ChamberOfMomentumEntryPanel({ onBack, onSelectIntent }: Props) {
  return (
    <GrowRoomShell>
      <EstateWorkspace className="chamber-entry grow-room-panel">
        <GrowPanelBackButton onBack={onBack} label="Estate" />

        <header className="grow-room__header chamber-entry__header">
          <p className="estate-workspace__kicker">Forward movement</p>
          <h1 className="estate-workspace__title">{CHAMBER_OF_MOMENTUM_MEMBER_NAME}</h1>
          <p className="grow-room__statement grow-room__intro-lead chamber-entry__prompt">
            {CHAMBER_ENTRY_PROMPT}
          </p>
        </header>

        <div className="grow-room__cards journal-room__options" role="list">
          {CHAMBER_ENTRY_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className="grow-room__card journal-room__option chamber-entry__option"
              role="listitem"
              data-testid={`chamber-entry-${option.id}`}
              onClick={() => onSelectIntent(option.id)}
            >
              <span className="journal-room__option-title">{option.label}</span>
              <span className="journal-room__option-desc">{option.hint}</span>
            </button>
          ))}
        </div>

        <div className="chamber-entry__internal" aria-label="Inside Chamber of Momentum">
          <p className="chamber-entry__internal-label">Inside the Chamber</p>
          <div className="chamber-entry__internal-row">
            {CHAMBER_INTERNAL_ACCESS_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className="chamber-entry__internal-btn"
                data-testid={`chamber-internal-${option.id}`}
                onClick={() => onSelectIntent(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </EstateWorkspace>
    </GrowRoomShell>
  );
}
