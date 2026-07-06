"use client";

type DiscoveryEngineEntryZoneProps = {
  overnightMessage: string;
  onOpenDailyBrief: () => void;
  onOpenWeeklyReport: () => void;
  onOpenMonthlyReport: () => void;
  findingCount: number;
  alertCount: number;
};

export function DiscoveryEngineEntryZone({
  overnightMessage,
  onOpenDailyBrief,
  onOpenWeeklyReport,
  onOpenMonthlyReport,
  findingCount,
  alertCount,
}: DiscoveryEngineEntryZoneProps) {
  return (
    <section className="founder-discovery-engine__entry" aria-labelledby="ede-entry-title">
      <h2 className="founder-discovery-engine__section-title" id="ede-entry-title">
        Your Executive Discovery Department™
      </h2>
      <p className="founder-discovery-engine__overnight">{overnightMessage}</p>
      <p className="founder-discovery-engine__lead">
        Founder quietly discovered {findingCount} findings across the ecosystem — not search, not research.
        Calm recommendations wait.
      </p>

      {alertCount > 0 ? (
        <p className="founder-discovery-engine__alert-banner">
          {alertCount} Founder Alert{alertCount > 1 ? "s" : ""}™ in today&apos;s brief — rare and material
        </p>
      ) : null}

      <div className="founder-discovery-engine__entry-actions">
        <button type="button" className="founder-discovery-engine__primary-button" onClick={onOpenDailyBrief}>
          Today&apos;s Discovery Brief
        </button>
        <button type="button" className="founder-discovery-engine__secondary-button" onClick={onOpenWeeklyReport}>
          Weekly Report
        </button>
        <button type="button" className="founder-discovery-engine__secondary-button" onClick={onOpenMonthlyReport}>
          Monthly Executive Report
        </button>
      </div>
    </section>
  );
}
