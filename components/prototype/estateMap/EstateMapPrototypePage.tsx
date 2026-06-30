"use client";

import { useCallback, useState } from "react";
import {
  DEFAULT_CURRENT_ESTATE_LOCATION_ID,
  DEFAULT_ESTATE_MAP_LOCATIONS,
  EstateMapFullScreen,
} from "@/components/estateMap";
import { CONSERVATORY_BG } from "./estateMapData";
import { FoldedMapTrigger } from "./FoldedMapTrigger";
import type { EstateMapPhase } from "./types";

export function EstateMapPrototypePage() {
  const [phase, setPhase] = useState<EstateMapPhase>("closed");
  const [headingMessage, setHeadingMessage] = useState<string | null>(null);
  const [currentId, setCurrentId] = useState(DEFAULT_CURRENT_ESTATE_LOCATION_ID);

  const mapOpen = phase === "open";

  const openMap = useCallback(() => setPhase("open"), []);
  const closeMap = useCallback(() => setPhase("closed"), []);

  const handleSelect = useCallback((location: { id: string; name: string }) => {
    setCurrentId(location.id);
    setHeadingMessage(`Arriving at ${location.name}…`);
    window.setTimeout(() => setHeadingMessage(null), 3200);
  }, []);

  return (
    <div
      className={`em-root em-root--${phase}`}
      style={{ backgroundImage: `url(${CONSERVATORY_BG})` }}
    >
      <p className="em-dev-link">
        Estate Map (image-based) ·{" "}
        <a href="/companion">Companion</a>
      </p>

      {headingMessage && (
        <p className="em-toast" role="status">
          {headingMessage}
        </p>
      )}

      <FoldedMapTrigger phase={phase} onOpen={openMap} />

      <EstateMapFullScreen
        open={mapOpen}
        onClose={closeMap}
        locations={DEFAULT_ESTATE_MAP_LOCATIONS}
        currentLocationId={currentId}
        onSelectLocation={handleSelect}
      />
    </div>
  );
}
