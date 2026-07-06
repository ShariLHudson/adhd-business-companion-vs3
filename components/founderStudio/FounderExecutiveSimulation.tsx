"use client";

import { useCallback, useMemo, useState } from "react";

import { composeSimulationSession, getComparisonRows } from "@/lib/executiveSimulation";
import { getSimulationCenterBootstrap } from "@/lib/founder/simulationCenter";
import type { SimulationSessionView } from "@/lib/executiveSimulation/types";
import { FOUNDER_STUDIO_BASE } from "@/lib/founderStudio/founderConfig";

import { RoomHeader } from "./executive/RoomHeader";
import { SimulationComparisonView } from "./simulation/SimulationComparisonView";
import { SimulationEntryZone } from "./simulation/SimulationEntryZone";
import { SimulationScenarioDetail } from "./simulation/SimulationScenarioDetail";

export function FounderExecutiveSimulation() {
  const bootstrap = useMemo(() => getSimulationCenterBootstrap(), []);
  const [query, setQuery] = useState("");
  const [session, setSession] = useState<SimulationSessionView | null>(null);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);

  const runSimulation = useCallback((phrase: string) => {
    const trimmed = phrase.trim();
    if (!trimmed) return;
    const result = composeSimulationSession(trimmed);
    if (result) {
      setSession(result);
      setQuery(trimmed);
      setSelectedScenarioId(null);
    }
  }, []);

  const comparisonRows = useMemo(
    () => (session ? getComparisonRows(session.simulation) : []),
    [session],
  );

  const selectedScenario = session?.simulation.scenarios.find((s) => s.id === selectedScenarioId);

  return (
    <div className="founder-simulation">
      <RoomHeader
        backHref={FOUNDER_STUDIO_BASE}
        backLabel="← Back to the Office"
        eyebrow="Executive Simulation Studio™"
        title="Think Before You Build™"
        question="If we choose this path… what is most likely to happen?"
        purpose="Compare possible futures — tradeoffs, risks, and opportunity cost — before time, money, and energy are invested."
      />

      {selectedScenario && session ? (
        <SimulationScenarioDetail
          simulation={session.simulation}
          scenario={selectedScenario}
          onBack={() => setSelectedScenarioId(null)}
        />
      ) : session ? (
        <SimulationComparisonView
          simulation={session.simulation}
          comparisonRows={comparisonRows}
          onSelectScenario={setSelectedScenarioId}
          onClose={() => {
            setSession(null);
            setSelectedScenarioId(null);
          }}
        />
      ) : (
        <SimulationEntryZone
          query={query}
          onQueryChange={setQuery}
          onSubmit={() => runSimulation(query)}
          suggestedDecisions={bootstrap.suggestedDecisions}
          onSelectSuggested={(phrase) => runSimulation(phrase)}
        />
      )}
    </div>
  );
}
