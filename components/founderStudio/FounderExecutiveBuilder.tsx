"use client";

import { useCallback, useMemo, useState } from "react";

import { composeBuildSession } from "@/lib/founder/builderCenter";
import { getBuilderCenterBootstrap } from "@/lib/founder/builderCenter/services/builderCenterService";
import type { BuildModeId, BuildSessionView } from "@/lib/executiveBuilder/types";
import { FOUNDER_STUDIO_BASE } from "@/lib/founderStudio/founderConfig";

import { RoomHeader } from "./executive/RoomHeader";
import { BuildBlueprintView } from "./builder/BuildBlueprintView";
import { BuildEntryPoints } from "./builder/BuildEntryPoints";
import { BuildEntryZone } from "./builder/BuildEntryZone";

export function FounderExecutiveBuilder() {
  const bootstrap = useMemo(() => getBuilderCenterBootstrap(), []);
  const [query, setQuery] = useState("");
  const [buildMode, setBuildMode] = useState<BuildModeId>("standard-build");
  const [session, setSession] = useState<BuildSessionView | null>(null);

  const runBuild = useCallback(
    (phrase: string, mode: BuildModeId = buildMode) => {
      const trimmed = phrase.trim();
      if (!trimmed) return;
      const result = composeBuildSession(trimmed, mode);
      if (result) {
        setSession(result);
        setQuery(trimmed);
      }
    },
    [buildMode],
  );

  return (
    <div className="founder-builder">
      <RoomHeader
        backHref={FOUNDER_STUDIO_BASE}
        backLabel="← Back to the Office"
        eyebrow="Executive Builder™"
        title="The World's Smartest Business Builder"
        question="Where do I start?"
        purpose="Every idea becomes a complete implementation blueprint — phases, packets, options, and drafts. Never a blank page."
      />

      {session ? (
        <BuildBlueprintView blueprint={session.blueprint} onClose={() => setSession(null)} />
      ) : (
        <>
          <BuildEntryZone
            query={query}
            onQueryChange={setQuery}
            buildMode={buildMode}
            onBuildModeChange={setBuildMode}
            buildModes={bootstrap.buildModes}
            onSubmit={() => runBuild(query)}
            suggestedBuilds={bootstrap.suggestedBuilds}
            onSelectSuggested={(phrase) => runBuild(phrase)}
          />
          <BuildEntryPoints
            entryPoints={bootstrap.entryPoints}
            onSelect={(label) => {
              setQuery(label);
            }}
          />
        </>
      )}
    </div>
  );
}
