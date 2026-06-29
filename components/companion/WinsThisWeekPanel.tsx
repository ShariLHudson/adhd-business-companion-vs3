"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  buildWeeklyWins,
  formatWeeklyWinLine,
  getWeeklyWinsHistory,
} from "@/lib/weeklyWins";
import { hasEvidenceForWin } from "@/lib/evidenceBankStore";
import {
  getSavedGrowthWins,
  SAVED_GROWTH_WINS_UPDATED_EVENT,
  type SavedGrowthWin,
} from "@/lib/growthWinsStore";
import {
  isInGrowthArchivePeriod,
  type GrowthArchivePeriod,
} from "@/lib/growthArchive";
import type { GrowthPanelNav } from "@/lib/growthNavigation";
import { CelebrationGardenRoomShell } from "@/components/companion/CelebrationGardenRoomShell";
import { EstateWorkspace } from "@/components/companion/EstateWorkspace";
import { GrowthPanelBackButton } from "@/components/companion/GrowthPanelBackButton";
import "@/app/companion/celebration-garden-room.css";

export function WinsThisWeekPanel({
  refreshKey = 0,
  nav,
  onSaveToEvidenceBank,
}: {
  refreshKey?: string | number;
  nav: GrowthPanelNav;
  onSaveToEvidenceBank?: (whatHappened: string, sourceWinId: string) => void;
  onSaveEvidence?: (text: string, sourceId: string) => void;
  onSaveProof?: (text: string) => void;
  onSaveJourney?: (text: string) => void;
}) {
  const [tick, setTick] = useState(0);
  const archivePeriod: GrowthArchivePeriod = "week";

  const reload = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    reload();
  }, [reload, refreshKey]);

  useEffect(() => {
    const onUpdate = () => reload();
    window.addEventListener(SAVED_GROWTH_WINS_UPDATED_EVENT, onUpdate);
    return () =>
      window.removeEventListener(SAVED_GROWTH_WINS_UPDATED_EVENT, onUpdate);
  }, [reload]);

  const snapshot = useMemo(() => buildWeeklyWins(), [tick]);
  const history = useMemo(() => getWeeklyWinsHistory(), [tick]);
  const savedWins = useMemo(
    () =>
      getSavedGrowthWins().filter((win) =>
        isInGrowthArchivePeriod(win.ts, archivePeriod),
      ),
    [tick],
  );

  return (
    <CelebrationGardenRoomShell>
      <EstateWorkspace className="celebration-garden-panel">
        <GrowthPanelBackButton
          onBack={nav.onBack}
          label={nav.backLabel ?? "My Story"}
        />

        <header className="celebration-garden-panel__header">
          <p className="estate-workspace__kicker">Celebration Garden</p>
          <h1 className="estate-workspace__title">Wins &amp; Celebrations</h1>
          <p className="estate-workspace__lead">
            Every milestone worth remembering — gathered gently, celebrated warmly.
          </p>
        </header>

        <section className="estate-workspace__section celebration-garden-panel__stats" aria-label="Quick stats">
          <h2 className="estate-workspace__section-title">Quick Stats</h2>
          <p className="celebration-garden-panel__week">{snapshot.weekLabel}</p>
          {snapshot.stats.length === 0 ? (
            <p className="celebration-garden-panel__empty">
              Your garden is peaceful. When something goes well, it will bloom here.
            </p>
          ) : (
            <ul className="celebration-garden-panel__stat-list">
              {snapshot.stats.map((stat) => (
                <li key={stat.id} className="celebration-garden-panel__stat">
                  <span className="celebration-garden-panel__stat-icon" aria-hidden="true">
                    {stat.icon}
                  </span>
                  <span>{formatWeeklyWinLine(stat)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section
          className="estate-workspace__section celebration-garden-panel__today"
          aria-label="Today's celebration"
        >
          <h2 className="estate-workspace__section-title">Today&apos;s Celebration</h2>
          {savedWins.length === 0 ? (
            <p className="celebration-garden-panel__empty">
              Nothing saved this week yet. When a win feels worth keeping, save it from anywhere in your story.
            </p>
          ) : (
            <ul className="celebration-garden-panel__win-list">
              {savedWins.map((win) => (
                <CelebrationWinItem
                  key={win.id}
                  win={win}
                  onSaveToEvidenceBank={onSaveToEvidenceBank}
                />
              ))}
            </ul>
          )}
        </section>

        {history.length > 0 ? (
          <section
            className="estate-workspace__section celebration-garden-panel__timeline"
            aria-label="Celebration timeline"
          >
            <h2 className="estate-workspace__section-title">Celebration Timeline</h2>
            <ul className="celebration-garden-panel__timeline-list">
              {history.slice(0, 8).map((entry) => (
                <li key={entry.weekKey} className="celebration-garden-panel__timeline-item">
                  <p className="celebration-garden-panel__timeline-label">{entry.weekLabel}</p>
                  {entry.stats.length === 0 ? (
                    <p className="celebration-garden-panel__timeline-note">A quiet week</p>
                  ) : (
                    <ul className="celebration-garden-panel__timeline-stats">
                      {entry.stats.map((stat) => (
                        <li key={stat.id}>{formatWeeklyWinLine(stat)}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </EstateWorkspace>
    </CelebrationGardenRoomShell>
  );
}

function CelebrationWinItem({
  win,
  onSaveToEvidenceBank,
}: {
  win: SavedGrowthWin;
  onSaveToEvidenceBank?: (whatHappened: string, sourceWinId: string) => void;
}) {
  const savedEvidence = win.sourceId ? hasEvidenceForWin(win.sourceId) : false;

  return (
    <li className="celebration-garden-panel__win">
      <div className="celebration-garden-panel__win-copy">
        <span className="celebration-garden-panel__win-icon" aria-hidden="true">
          {win.icon}
        </span>
        <p>{win.whatHappened}</p>
      </div>
      {onSaveToEvidenceBank && win.sourceId && !savedEvidence ? (
        <button
          type="button"
          className="celebration-garden-panel__win-action"
          onClick={() => onSaveToEvidenceBank(win.whatHappened, win.sourceId!)}
        >
          Keep as evidence
        </button>
      ) : savedEvidence ? (
        <span className="celebration-garden-panel__win-note">Kept in Evidence Vault</span>
      ) : null}
    </li>
  );
}
