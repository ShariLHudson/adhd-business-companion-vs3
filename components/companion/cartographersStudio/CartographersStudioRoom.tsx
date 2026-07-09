"use client";

import { useState } from "react";
import {
  CARTOGRAPHERS_ATLAS_TEASER,
  CARTOGRAPHERS_FRAMED_MAPS,
  CARTOGRAPHERS_ROOM_INTRO,
  CARTOGRAPHERS_STUDIO_BACKGROUND,
  type CartographersFramedMap,
  type CartographersFramedMapId,
} from "@/lib/cartographersStudio";
import type { VisualFocusMap } from "@/lib/visualFocus";
import { ContinueThinkingCard } from "@/components/companion/ContinueThinkingCard";

/** Approximate hotspot positions over the Cartographer plate (percent). */
const FRAME_HOTSPOTS: Record<
  CartographersFramedMapId,
  { left: string; top: string; width: string; height: string }
> = {
  "mind-map": { left: "18%", top: "14%", width: "11%", height: "14%" },
  "decision-map": { left: "30%", top: "14%", width: "11%", height: "14%" },
  "relationship-map": { left: "42%", top: "14%", width: "11%", height: "14%" },
  "process-map": { left: "54%", top: "14%", width: "11%", height: "14%" },
  "journey-map": { left: "66%", top: "14%", width: "11%", height: "14%" },
  "timeline-map": { left: "18%", top: "30%", width: "11%", height: "14%" },
  "strategy-map": { left: "30%", top: "30%", width: "11%", height: "14%" },
  "project-map": { left: "42%", top: "30%", width: "11%", height: "14%" },
  "opportunity-map": { left: "54%", top: "30%", width: "11%", height: "14%" },
  "priority-map": { left: "66%", top: "30%", width: "11%", height: "14%" },
};

export function CartographersStudioRoom({
  continueThinking,
  onSelectMindMap,
  onOpenMap,
  onRemoveMap,
  onDeleteMap,
  onWorkWithShari,
  onBack,
  onClose,
}: {
  continueThinking: VisualFocusMap[];
  onSelectMindMap: () => void;
  onOpenMap: (id: string) => void;
  onRemoveMap?: (id: string) => void;
  onDeleteMap?: (id: string) => void;
  onWorkWithShari?: () => void;
  onBack?: () => void;
  onClose?: () => void;
}) {
  const [learnMap, setLearnMap] = useState<CartographersFramedMap | null>(null);
  const [atlasOpen, setAtlasOpen] = useState(false);
  const [objectTip, setObjectTip] = useState<string | null>(null);

  function handleFrameSelect(id: CartographersFramedMapId) {
    if (id === "mind-map") onSelectMindMap();
  }

  const exit = onBack ?? onClose;

  return (
    <div
      className="cartographers-immersive"
      data-testid="cartographers-studio-room"
    >
      <div
        className="cartographers-immersive__plate"
        style={{ backgroundImage: `url(${CARTOGRAPHERS_STUDIO_BACKGROUND})` }}
        role="img"
        aria-label="Cartographer's Studio"
      />
      <div className="cartographers-immersive__veil" aria-hidden />

      <div className="cartographers-immersive__chrome">
        <div>
          <p className="cartographers-immersive__plaque">
            {CARTOGRAPHERS_ROOM_INTRO.plaque}
          </p>
          <p className="cartographers-immersive__tagline">
            {CARTOGRAPHERS_ROOM_INTRO.tagline}
          </p>
        </div>
        {exit ? (
          <button
            type="button"
            className="cartographers-hotspot cartographers-hotspot--exit"
            data-testid="cartographers-exit"
            onClick={exit}
            aria-label="Leave Cartographer's Studio — resume later automatically"
          >
            Exit
          </button>
        ) : null}
      </div>

      {continueThinking.length > 0 ? (
        <section
          className="cartographers-immersive__resume"
          data-testid="continue-thinking"
        >
          <p className="cartographers-immersive__resume-label">
            Continue where you left off
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            {continueThinking.map((map) => (
              <ContinueThinkingCard
                key={map.id}
                map={map}
                onOpen={() => onOpenMap(map.id)}
                onRemove={onRemoveMap ? () => onRemoveMap(map.id) : undefined}
                onDelete={onDeleteMap ? () => onDeleteMap(map.id) : undefined}
              />
            ))}
          </div>
        </section>
      ) : null}

      <div className="cartographers-immersive__hotspots" aria-label="Room objects">
        {CARTOGRAPHERS_FRAMED_MAPS.map((map) => {
          const box = FRAME_HOTSPOTS[map.id];
          return (
            <button
              key={map.id}
              type="button"
              className={`cartographers-hotspot cartographers-hotspot--frame${
                map.interactive ? " cartographers-hotspot--live" : ""
              }`}
              style={{
                left: box.left,
                top: box.top,
                width: box.width,
                height: box.height,
              }}
              data-testid={`cartographers-frame-${map.id}`}
              data-interactive={map.interactive ? "true" : "false"}
              aria-label={
                map.interactive
                  ? `Open ${map.nameplate}`
                  : `${map.nameplate} — coming soon`
              }
              onClick={() => {
                if (map.interactive) handleFrameSelect(map.id);
                else setLearnMap(map);
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                setLearnMap(map);
              }}
            >
              <span className="cartographers-hotspot__label">{map.nameplate}</span>
            </button>
          );
        })}

        <button
          type="button"
          className="cartographers-hotspot cartographers-hotspot--atlas"
          data-testid="cartographers-atlas"
          style={{ left: "72%", top: "58%", width: "16%", height: "18%" }}
          onClick={() => setAtlasOpen(true)}
          aria-label="Open Atlas of Visual Thinking"
        >
          <span className="cartographers-hotspot__label">Atlas</span>
        </button>

        <button
          type="button"
          className="cartographers-hotspot cartographers-hotspot--table"
          data-testid="cartographers-discovery-table"
          style={{ left: "32%", top: "62%", width: "36%", height: "22%" }}
          onClick={() => {
            if (continueThinking[0]) onOpenMap(continueThinking[0].id);
            else onSelectMindMap();
          }}
          aria-label="Discovery Table — create or continue a map"
        >
          <span className="cartographers-hotspot__label">Discovery Table</span>
        </button>

        <button
          type="button"
          className="cartographers-hotspot cartographers-hotspot--telescope"
          data-testid="cartographers-telescope"
          style={{ left: "8%", top: "55%", width: "10%", height: "16%" }}
          onClick={() =>
            setObjectTip(
              "Telescope — zoom out to see related projects, goals, and connected maps. Full big-picture view arrives after Mind Map feels complete.",
            )
          }
          aria-label="Telescope"
        >
          <span className="cartographers-hotspot__label">Telescope</span>
        </button>

        <button
          type="button"
          className="cartographers-hotspot cartographers-hotspot--globe"
          data-testid="cartographers-globe"
          style={{ left: "86%", top: "48%", width: "10%", height: "14%" }}
          onClick={() =>
            setObjectTip(
              "Globe — browse map types by category. Mind Map is open today; other methods unlock when this path is ready.",
            )
          }
          aria-label="Globe"
        >
          <span className="cartographers-hotspot__label">Globe</span>
        </button>
      </div>

      <p className="cartographers-immersive__hint">
        {CARTOGRAPHERS_ROOM_INTRO.mindMapReady}
        {onWorkWithShari ? (
          <>
            {" · "}
            <button
              type="button"
              className="underline underline-offset-2"
              onClick={onWorkWithShari}
            >
              Ask Shari
            </button>
          </>
        ) : null}
      </p>

      {learnMap ? (
        <div className="cartographers-learn-overlay" role="dialog" aria-modal="true">
          <div className="cartographers-learn-overlay__card">
            <p className="cartographers-learn-overlay__name">{learnMap.nameplate}</p>
            <p className="cartographers-learn-overlay__tip">{learnMap.learnTip}</p>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-[#6b635a] hover:bg-[#faf7f2]"
                onClick={() => setLearnMap(null)}
              >
                Close
              </button>
              {learnMap.interactive ? (
                <button
                  type="button"
                  className="rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white"
                  onClick={() => {
                    setLearnMap(null);
                    onSelectMindMap();
                  }}
                >
                  Begin Discovery
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {atlasOpen ? (
        <div className="cartographers-learn-overlay" role="dialog" aria-modal="true">
          <div className="cartographers-learn-overlay__card cartographers-learn-overlay__card--wide">
            <p className="cartographers-learn-overlay__name">
              {CARTOGRAPHERS_ATLAS_TEASER.title}
            </p>
            <p className="cartographers-learn-overlay__tip">
              {CARTOGRAPHERS_ATLAS_TEASER.body}
            </p>
            <p className="mt-2 text-sm text-[#9a8f82]">
              {CARTOGRAPHERS_ATLAS_TEASER.comingSoon}
            </p>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-[#6b635a]"
                onClick={() => setAtlasOpen(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white"
                onClick={() => {
                  setAtlasOpen(false);
                  onSelectMindMap();
                }}
              >
                {CARTOGRAPHERS_ATLAS_TEASER.mindMapAction}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {objectTip ? (
        <div className="cartographers-learn-overlay" role="dialog" aria-modal="true">
          <div className="cartographers-learn-overlay__card">
            <p className="cartographers-learn-overlay__tip">{objectTip}</p>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                className="rounded-xl bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white"
                onClick={() => setObjectTip(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
