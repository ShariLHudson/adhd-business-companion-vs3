"use client";

import { useEffect, useState } from "react";
import {
  CARTOGRAPHERS_CONTINUE_MAPPING,
  CARTOGRAPHERS_EXIT,
  CARTOGRAPHERS_FRAMED_MAPS,
  CARTOGRAPHERS_HELP,
  CARTOGRAPHERS_RESUME_PREVIOUS,
  CARTOGRAPHERS_RETURN_TO_ESTATE,
  CARTOGRAPHERS_ROOM_INTRO,
  CARTOGRAPHERS_STUDIO_BACKGROUND,
  CARTOGRAPHERS_WELCOME_REQUEST_EVENT,
  dismissCartographersWelcome,
  wallSelectableFramedMaps,
  type CartographersFramedMap,
  type CartographersFramedMapId,
} from "@/lib/cartographersStudio";
import type { VisualFocusMap } from "@/lib/visualFocus";
import { studioCardTitleForMode } from "@/lib/visualFocus/studioCards";
import { CartographersAtlasOverlay } from "./CartographersAtlasOverlay";
import { CartographersContextualHelp } from "./CartographersContextualHelp";
import { CartographersStudioWelcomePanel } from "./CartographersStudioWelcomePanel";

/** Approximate hotspot over the main table map (percent of viewport). */
const CENTER_MAP_HOTSPOT = {
  left: "50%",
  top: "56%",
  width: "30%",
  height: "28%",
  transform: "translate(-50%, -50%)",
} as const;

/** Wall-frame positions — Mind Map frame only is interactive. */
const FRAME_HOTSPOTS: Record<
  CartographersFramedMapId,
  { left: string; top: string; width: string; height: string }
> = {
  "mind-map": { left: "22%", top: "18%", width: "14%", height: "16%" },
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
  onBack,
  onClose,
  onReturnToEstate,
}: {
  continueThinking: VisualFocusMap[];
  onSelectMindMap: () => void;
  onOpenMap: (id: string) => void;
  onRemoveMap?: (id: string) => void;
  onDeleteMap?: (id: string) => void;
  /** @deprecated Removed from production chrome — kept for call-site compatibility. */
  onWorkWithShari?: () => void;
  onBack?: () => void;
  onClose?: () => void;
  onReturnToEstate?: () => void;
}) {
  const [learnMap, setLearnMap] = useState<CartographersFramedMap | null>(null);
  const [atlasOpen, setAtlasOpen] = useState(false);
  const [objectTip, setObjectTip] = useState<string | null>(null);
  const [previousMapsOpen, setPreviousMapsOpen] = useState(false);
  const [hoveredFrameId, setHoveredFrameId] =
    useState<CartographersFramedMapId | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [contextualHelpOpen, setContextualHelpOpen] = useState(false);
  const selectableFrames = wallSelectableFramedMaps();

  useEffect(() => {
    const reopen = () => setShowWelcome(true);
    window.addEventListener(CARTOGRAPHERS_WELCOME_REQUEST_EVENT, reopen);
    return () =>
      window.removeEventListener(CARTOGRAPHERS_WELCOME_REQUEST_EVENT, reopen);
  }, []);

  function dismissWelcome() {
    dismissCartographersWelcome();
    setShowWelcome(false);
  }

  function beginWorking(action: () => void) {
    dismissWelcome();
    action();
  }

  function handleFrameSelect(id: CartographersFramedMapId) {
    if (id === "mind-map") beginWorking(onSelectMindMap);
  }

  const exit = onClose ?? onBack;
  const returnHome = onReturnToEstate ?? exit;
  const latestMap = continueThinking[0] ?? null;
  const hoveredFrame = hoveredFrameId
    ? CARTOGRAPHERS_FRAMED_MAPS.find((m) => m.id === hoveredFrameId)
    : null;

  return (
    <div
      className="cartographers-immersive cartographers-immersive--fullscreen"
      data-testid="cartographers-studio-room"
    >
      <div
        className="cartographers-immersive__plate"
        style={{ backgroundImage: `url(${CARTOGRAPHERS_STUDIO_BACKGROUND})` }}
        role="img"
        aria-label="Cartographer's Studio"
      />
      <div className="cartographers-immersive__veil" aria-hidden />

      <p
        className="cartographers-immersive__instruction"
        data-testid="cartographers-room-instruction"
      >
        {CARTOGRAPHERS_ROOM_INTRO.instruction}
      </p>

      <div className="cartographers-immersive__chrome">
        <div className="cartographers-immersive__chrome-left">
          {returnHome ? (
            <button
              type="button"
              className="cartographers-chrome-link"
              data-testid="cartographers-return-estate"
              onClick={returnHome}
            >
              <span aria-hidden>←</span> {CARTOGRAPHERS_RETURN_TO_ESTATE}
            </button>
          ) : null}
        </div>
        <div className="cartographers-immersive__chrome-actions">
          {continueThinking.length > 0 ? (
            <div className="cartographers-immersive__resume">
              <button
                type="button"
                className="cartographers-chrome-link"
                aria-expanded={previousMapsOpen}
                data-testid="continue-previous-maps-toggle"
                onClick={() => {
                  if (continueThinking.length === 1 && latestMap) {
                    beginWorking(() => onOpenMap(latestMap.id));
                    return;
                  }
                  setPreviousMapsOpen((open) => !open);
                }}
              >
                {CARTOGRAPHERS_RESUME_PREVIOUS}
              </button>
              {previousMapsOpen && continueThinking.length > 1 ? (
                <ul
                  className="cartographers-immersive__previous-list"
                  data-testid="continue-previous-maps-list"
                >
                  {continueThinking.map((map) => (
                    <li key={map.id}>
                      <button
                        type="button"
                        className="cartographers-immersive__previous-item"
                        onClick={() => beginWorking(() => onOpenMap(map.id))}
                      >
                        {map.title || "Untitled map"}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
          <button
            type="button"
            className="cartographers-chrome-link"
            data-testid="cartographers-help"
            onClick={() => setContextualHelpOpen(true)}
            aria-label="Help — how to use Cartographer's Studio"
          >
            {CARTOGRAPHERS_HELP}
          </button>
          {exit ? (
            <button
              type="button"
              className="cartographers-chrome-link"
              data-testid="cartographers-exit"
              onClick={exit}
              aria-label="Exit Cartographer's Studio"
            >
              {CARTOGRAPHERS_EXIT}
            </button>
          ) : null}
        </div>
      </div>

      {latestMap ? (
        <div
          className="cartographers-continue-mapping"
          data-testid="cartographers-continue-mapping"
        >
          <p className="cartographers-continue-mapping__eyebrow">
            {CARTOGRAPHERS_CONTINUE_MAPPING}
          </p>
          <p className="cartographers-continue-mapping__title">
            {latestMap.title?.trim() || "Untitled map"}
          </p>
          <p className="cartographers-continue-mapping__meta">
            {studioCardTitleForMode(latestMap.mode)}
            {latestMap.updatedAt
              ? ` · Last edited ${new Date(latestMap.updatedAt).toLocaleString()}`
              : ""}
          </p>
          <button
            type="button"
            className="cartographers-continue-mapping__cta"
            data-testid="cartographers-continue-mapping-cta"
            onClick={() => beginWorking(() => onOpenMap(latestMap.id))}
          >
            Continue
          </button>
        </div>
      ) : (
        <p
          className="cartographers-continue-mapping cartographers-continue-mapping--empty"
          data-testid="cartographers-continue-mapping-empty"
        >
          No saved maps yet — open Mind Map when you are ready to capture.
        </p>
      )}

      <div className="cartographers-immersive__hotspots" aria-label="Room objects">
        {/* Prompt 140 — only production-ready wall buttons are selectable. */}
        {selectableFrames.map((map) => {
          const box = FRAME_HOTSPOTS[map.id];
          return (
            <button
              key={map.id}
              type="button"
              className={`cartographers-hotspot cartographers-hotspot--frame cartographers-hotspot--live${
                hoveredFrameId === map.id ? " cartographers-hotspot--hover" : ""
              }`}
              style={{
                left: box.left,
                top: box.top,
                width: box.width,
                height: box.height,
              }}
              data-testid={`cartographers-frame-${map.id}`}
              data-interactive="true"
              aria-label={`Open ${map.nameplate}`}
              onMouseEnter={() => setHoveredFrameId(map.id)}
              onMouseLeave={() =>
                setHoveredFrameId((current) =>
                  current === map.id ? null : current,
                )
              }
              onFocus={() => setHoveredFrameId(map.id)}
              onBlur={() =>
                setHoveredFrameId((current) =>
                  current === map.id ? null : current,
                )
              }
              onClick={() => handleFrameSelect(map.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                setLearnMap(map);
              }}
            >
              <span className="cartographers-frame-btn cartographers-frame-btn--ready">
                <span className="cartographers-frame-btn__name">{map.nameplate}</span>
              </span>
            </button>
          );
        })}

        <button
          type="button"
          className="cartographers-hotspot cartographers-hotspot--atlas"
          data-testid="cartographers-atlas"
          style={{ left: "72%", top: "58%", width: "16%", height: "18%" }}
          onClick={() => beginWorking(() => setAtlasOpen(true))}
          aria-label="Open Cartographer's Atlas"
        >
          <span className="sr-only">Atlas</span>
        </button>

        <button
          type="button"
          className="cartographers-hotspot cartographers-hotspot--center-map cartographers-hotspot--live"
          data-testid="cartographers-center-map"
          style={CENTER_MAP_HOTSPOT}
          onClick={() => beginWorking(onSelectMindMap)}
          aria-label="Open Mind Map workspace — center map"
        >
          <span className="cartographers-frame-btn cartographers-frame-btn--center cartographers-frame-btn--ready">
            <span className="cartographers-frame-btn__name">Mind Map</span>
          </span>
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
          <span className="sr-only">Telescope</span>
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
          <span className="sr-only">Globe</span>
        </button>
      </div>

      {hoveredFrame ? (
        <div
          className="cartographers-frame-hover"
          data-testid="cartographers-frame-hover"
          role="tooltip"
        >
          <p className="cartographers-frame-hover__name">{hoveredFrame.nameplate}</p>
          <p className="cartographers-frame-hover__blurb">{hoveredFrame.hoverBlurb}</p>
        </div>
      ) : null}

      <p className="cartographers-immersive__hint" data-testid="cartographers-room-hint">
        {CARTOGRAPHERS_ROOM_INTRO.mindMapReady}
      </p>

      {showWelcome ? (
        <CartographersStudioWelcomePanel onDismiss={dismissWelcome} />
      ) : null}

      {contextualHelpOpen ? (
        <CartographersContextualHelp
          map={null}
          onClose={() => setContextualHelpOpen(false)}
          onBrowseMapTypes={() => {
            setContextualHelpOpen(false);
            setAtlasOpen(true);
          }}
        />
      ) : null}

      {learnMap ? (
        <div className="cartographers-learn-overlay" role="dialog" aria-modal="true">
          <div className="cartographers-learn-overlay__card">
            <p className="cartographers-learn-overlay__name">{learnMap.nameplate}</p>
            <p className="cartographers-learn-overlay__tip">{learnMap.learnTip}</p>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="cartographers-chrome-link cartographers-chrome-link--ink"
                onClick={() => setLearnMap(null)}
              >
                Close
              </button>
              {learnMap.interactive ? (
                <button
                  type="button"
                  className="cartographers-chrome-link cartographers-chrome-link--ink cartographers-chrome-link--strong"
                  onClick={() => {
                    setLearnMap(null);
                    beginWorking(onSelectMindMap);
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
        <CartographersAtlasOverlay
          onClose={() => setAtlasOpen(false)}
          onCreateMindMap={() => beginWorking(onSelectMindMap)}
        />
      ) : null}

      {objectTip ? (
        <div className="cartographers-learn-overlay" role="dialog" aria-modal="true">
          <div className="cartographers-learn-overlay__card">
            <p className="cartographers-learn-overlay__tip">{objectTip}</p>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                className="cartographers-chrome-link cartographers-chrome-link--ink cartographers-chrome-link--strong"
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
