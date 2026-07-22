"use client";

import { useEffect, useState } from "react";
import {
  CARTOGRAPHERS_EXIT,
  CARTOGRAPHERS_FRAMED_MAPS,
  CARTOGRAPHERS_HELP,
  CARTOGRAPHERS_RESUME_PREVIOUS,
  CARTOGRAPHERS_RETURN_TO_ESTATE,
  CARTOGRAPHERS_ROOM_INTRO,
  CARTOGRAPHERS_STUDIO_BACKGROUND,
  CARTOGRAPHERS_WELCOME_REQUEST_EVENT,
  dismissCartographersWelcome,
  getFramedMapById,
  wallSelectableFramedMaps,
  type CartographersFramedMap,
  type CartographersFramedMapId,
} from "@/lib/cartographersStudio";
import {
  CARTOGRAPHY_WALL_HOTSPOTS,
  cartographyWallMaps,
  wallMapsInDisplayOrder,
} from "@/lib/cartographersStudio/wallMaps";
import type { VisualFocusMap } from "@/lib/visualFocus";
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

export function CartographersStudioRoom({
  continueThinking,
  onSelectMindMap,
  onSelectWallMap,
  onOpenMap,
  onViewMyMaps,
  onBack,
  onClose,
  onReturnToEstate,
}: {
  continueThinking: VisualFocusMap[];
  onSelectMindMap: () => void;
  /** Opens entry for any wall map (including Mind Map). */
  onSelectWallMap?: (id: CartographersFramedMapId) => void;
  onOpenMap: (id: string) => void;
  onRemoveMap?: (id: string) => void;
  onDeleteMap?: (id: string) => void;
  onViewMyMaps?: () => void;
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
  const wallOrder = wallMapsInDisplayOrder();

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

  function openWallMap(id: CartographersFramedMapId) {
    beginWorking(() => {
      if (onSelectWallMap) {
        onSelectWallMap(id);
        return;
      }
      if (id === "mind-map") onSelectMindMap();
    });
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
          {onViewMyMaps ? (
            <button
              type="button"
              className="cartographers-chrome-link"
              data-testid="cartographers-my-maps"
              onClick={() => beginWorking(onViewMyMaps)}
            >
              My Maps
            </button>
          ) : null}
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

      {/* Mobile / accessible gallery — same registry as desktop wall */}
      <nav
        className="cartographers-mobile-gallery"
        aria-label="Map types"
        data-testid="cartographers-mobile-gallery"
      >
        <p className="cartographers-mobile-gallery__label">Choose a map</p>
        <ul className="cartographers-mobile-gallery__list">
          {wallOrder.map((wall) => {
            const frame = getFramedMapById(wall.id);
            if (!frame?.wallSelectable) return null;
            return (
              <li key={wall.id}>
                <button
                  type="button"
                  className="cartographers-mobile-gallery__item"
                  data-testid={`cartographers-gallery-${wall.id}`}
                  aria-label={`Open ${wall.name}`}
                  onClick={() => openWallMap(wall.id)}
                >
                  <span className="cartographers-mobile-gallery__name">
                    {wall.name}
                  </span>
                  <span className="cartographers-mobile-gallery__blurb">
                    {frame.hoverBlurb}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="cartographers-immersive__hotspots" aria-label="Room objects">
        {wallOrder.map((wall) => {
          const frame = selectableFrames.find((m) => m.id === wall.id);
          if (!frame) return null;
          const box = CARTOGRAPHY_WALL_HOTSPOTS[wall.id];
          return (
            <div
              key={wall.id}
              className={`cartographers-wall-slot${
                hoveredFrameId === wall.id ? " cartographers-wall-slot--hover" : ""
              }`}
              style={{
                left: box.left,
                top: box.top,
                width: box.width,
                height: box.height,
              }}
              data-testid={`cartographers-wall-slot-${wall.id}`}
            >
              <button
                type="button"
                className="cartographers-hotspot cartographers-hotspot--frame cartographers-hotspot--live"
                data-testid={`cartographers-frame-${wall.id}`}
                data-interactive="true"
                aria-label={`Open ${wall.name}`}
                onMouseEnter={() => setHoveredFrameId(wall.id)}
                onMouseLeave={() =>
                  setHoveredFrameId((current) =>
                    current === wall.id ? null : current,
                  )
                }
                onFocus={() => setHoveredFrameId(wall.id)}
                onBlur={() =>
                  setHoveredFrameId((current) =>
                    current === wall.id ? null : current,
                  )
                }
                onClick={() => openWallMap(wall.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setLearnMap(frame);
                }}
              >
                <span className="sr-only">{wall.name}</span>
              </button>
              <button
                type="button"
                className="cartographers-wall-label"
                data-testid={`cartographers-label-${wall.id}`}
                aria-label={`Open ${wall.name}`}
                onMouseEnter={() => setHoveredFrameId(wall.id)}
                onMouseLeave={() =>
                  setHoveredFrameId((current) =>
                    current === wall.id ? null : current,
                  )
                }
                onFocus={() => setHoveredFrameId(wall.id)}
                onBlur={() =>
                  setHoveredFrameId((current) =>
                    current === wall.id ? null : current,
                  )
                }
                onClick={() => openWallMap(wall.id)}
              >
                {wall.name}
              </button>
            </div>
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
          onClick={() => openWallMap("mind-map")}
          aria-label="Open Mind Map workspace — center map"
        >
          <span className="cartographers-wall-label cartographers-wall-label--center">
            Mind Map
          </span>
        </button>

        <button
          type="button"
          className="cartographers-hotspot cartographers-hotspot--telescope"
          data-testid="cartographers-telescope"
          style={{ left: "8%", top: "55%", width: "10%", height: "16%" }}
          onClick={() =>
            setObjectTip(
              "Telescope — zoom out to see related projects, goals, and connected maps.",
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
              "Globe — browse every map type. Each framed map on the wall is ready to open.",
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

      {/* Registry length guard for tests / future slots */}
      <span className="sr-only" data-testid="cartographers-wall-count">
        {cartographyWallMaps.length}
      </span>

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
                    openWallMap(learnMap.id);
                  }}
                >
                  Begin My Map
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {atlasOpen ? (
        <CartographersAtlasOverlay
          onClose={() => setAtlasOpen(false)}
          onCreateMindMap={() => openWallMap("mind-map")}
          onCreateMap={(id) => openWallMap(id)}
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
