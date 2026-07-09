"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { EstateWorkspace } from "@/components/companion/EstateWorkspace";
import { GrowPanelBackButton } from "@/components/companion/GrowPanelBackButton";
import { ChamberMomentumPathArea } from "@/components/companion/chamber/ChamberMomentumPathArea";
import { ChamberOfMomentumRoomShell } from "@/components/companion/chamber/ChamberOfMomentumRoomShell";
import { ChamberProgressRecognition } from "@/components/companion/chamber/ChamberProgressRecognition";
import { ChamberMomentumCardPanel } from "@/components/companion/chamber/ChamberMomentumCard";
import { buildChamberArrivalContext } from "@/lib/estate/chamber/chamberMemberJourney";
import { buildSparkEstateDailyArrival } from "@/lib/estate/sparkEstateDailyCompanionExperience";
import { buildChamberMemoryGuidance } from "@/lib/estate/chamberOfMomentumMemory";
import { CHAMBER_EXPERIENCE_TAGLINE } from "@/lib/estate/chamber/chamberOfMomentumRoomRegistry";
import { CHAMBER_DEMO_DISCLAIMER, isChamberDemoMode } from "@/lib/estate/chamber/chamberDemoMode";
import { CHAMBER_DEMO_WELCOME } from "@/lib/estate/chamber/chamberDemoContent";
import { ensureChamberDemoDataSeeded } from "@/lib/estate/chamber/seedChamberDemoData";
import { hasChamberSupplementalPanels } from "@/lib/estate/chamberRoomExperience";
import {
  CHAMBER_ENTRY_OPTIONS,
  CHAMBER_ENTRY_PROMPT,
  CHAMBER_UNSURE_HEADING,
  CHAMBER_UNSURE_OPTIONS,
  CHAMBER_UNSURE_PROMPT,
  CHAMBER_WELCOME_SUBTITLE,
  CHAMBER_WELCOME_TITLE,
  type ChamberMomentumIntent,
  type ChamberUnsureOption,
} from "@/lib/estate/chamberOfMomentumRouting";
import "@/app/companion/chamber-of-momentum.css";

type Props = {
  onBack: () => void;
  onSelectIntent: (intent: ChamberMomentumIntent) => void;
  onSelectUnsure: (option: ChamberUnsureOption) => void;
  onDescribeSituation?: (text: string) => void;
};

/** Chamber of Momentum™ doorway — welcome, one question, gentle routing. */
export function ChamberOfMomentumEntryPanel({
  onBack,
  onSelectIntent,
  onSelectUnsure,
  onDescribeSituation,
}: Props) {
  const [situation, setSituation] = useState("");
  const demoMode = useMemo(() => isChamberDemoMode(), []);
  const [panelsReady, setPanelsReady] = useState(() => !isChamberDemoMode());
  const memoryGuidance = useMemo(() => buildChamberMemoryGuidance(), [panelsReady]);
  const dailyArrival = useMemo(() => buildSparkEstateDailyArrival(), [panelsReady]);
  const arrivalContext = useMemo(() => buildChamberArrivalContext(), [panelsReady]);
  const showSupplemental = useMemo(
    () => panelsReady && hasChamberSupplementalPanels(),
    [panelsReady],
  );
  const welcomeTitle = demoMode ? CHAMBER_DEMO_WELCOME.title : CHAMBER_WELCOME_TITLE;
  const welcomeSubtitle = demoMode
    ? CHAMBER_DEMO_WELCOME.subtitle
    : CHAMBER_WELCOME_SUBTITLE;

  useEffect(() => {
    if (!demoMode) return;
    ensureChamberDemoDataSeeded();
    setPanelsReady(true);
  }, [demoMode]);

  function handleDescribeSubmit(event: FormEvent) {
    event.preventDefault();
    const text = situation.trim();
    if (!text || !onDescribeSituation) return;
    onDescribeSituation(text);
  }
  return (
    <ChamberOfMomentumRoomShell>
      <EstateWorkspace className="chamber-entry grow-room-panel">
        <GrowPanelBackButton onBack={onBack} label="Estate" />

        <div className="chamber-room__layout">
          <section
            className="chamber-room__primary"
            aria-label="What would help you move forward today?"
          >
            <header className="chamber-entry__welcome">
              <p className="chamber-entry__welcome-kicker">{CHAMBER_EXPERIENCE_TAGLINE}</p>
              <h1 className="chamber-entry__welcome-title">{welcomeTitle}</h1>
              <p className="chamber-entry__welcome-subtitle">{welcomeSubtitle}</p>
              {demoMode ? (
                <p className="chamber-entry__demo-note">{CHAMBER_DEMO_DISCLAIMER}</p>
              ) : null}
              {memoryGuidance ? (
                <p className="chamber-entry__memory-hint">{memoryGuidance}</p>
              ) : !demoMode && dailyArrival.welcomeLine ? (
                <p className="chamber-entry__memory-hint">{dailyArrival.welcomeLine}</p>
              ) : arrivalContext.whereLeftOff ? (
                <p className="chamber-entry__memory-hint">{arrivalContext.whereLeftOff}</p>
              ) : null}
              <ChamberMomentumCardPanel />
              <p className="chamber-entry__prompt">{CHAMBER_ENTRY_PROMPT}</p>
            </header>

            {onDescribeSituation ? (
              <form
                className="chamber-entry__describe"
                onSubmit={handleDescribeSubmit}
              >
                <label className="chamber-entry__describe-label" htmlFor="chamber-situation">
                  Describe your situation in your own words
                </label>
                <textarea
                  id="chamber-situation"
                  className="chamber-entry__describe-input"
                  value={situation}
                  onChange={(event) => setSituation(event.target.value)}
                  placeholder='For example: "I have too much to do" or "Teach me marketing"'
                  rows={2}
                />
                <button
                  type="submit"
                  className="chamber-entry__describe-btn"
                  disabled={!situation.trim()}
                >
                  Find my next step
                </button>
              </form>
            ) : null}

            <div
              className="chamber-entry__choices grow-room__cards journal-room__options"
              role="list"
            >
              {CHAMBER_ENTRY_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className="grow-room__card journal-room__option chamber-entry__option"
                  role="listitem"
                  data-testid={`chamber-entry-${option.id}`}
                  onClick={() => onSelectIntent(option.id)}
                >
                  <span className="journal-room__option-title">
                    <span className="chamber-entry__emoji" aria-hidden>
                      {option.emoji}
                    </span>{" "}
                    {option.label}
                  </span>
                  <span className="journal-room__option-desc">{option.hint}</span>
                </button>
              ))}
            </div>

            <section
              className="chamber-entry__unsure"
              aria-label="Not sure where to start"
            >
              <h2 className="chamber-entry__unsure-heading">{CHAMBER_UNSURE_HEADING}</h2>
              <p className="chamber-entry__unsure-prompt">{CHAMBER_UNSURE_PROMPT}</p>
              <div className="chamber-entry__unsure-row">
                {CHAMBER_UNSURE_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className="chamber-entry__unsure-btn"
                    data-testid={`chamber-unsure-${option.id}`}
                    onClick={() => onSelectUnsure(option.id)}
                  >
                    <span className="chamber-entry__unsure-label">{option.label}</span>
                    <span className="chamber-entry__unsure-hint">{option.hint}</span>
                  </button>
                ))}
              </div>
            </section>
          </section>

          {showSupplemental ? (
            <aside className="chamber-room__aside" aria-label="Movement and progress">
              <ChamberMomentumPathArea />
              <ChamberProgressRecognition />
            </aside>
          ) : null}
        </div>
      </EstateWorkspace>
    </ChamberOfMomentumRoomShell>
  );
}
