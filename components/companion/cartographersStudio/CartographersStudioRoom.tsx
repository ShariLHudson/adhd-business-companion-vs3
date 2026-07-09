"use client";

import { useState } from "react";
import {
  CARTOGRAPHERS_ATLAS_TEASER,
  CARTOGRAPHERS_FRAMED_MAPS,
  CARTOGRAPHERS_ROOM_INTRO,
  type CartographersFramedMap,
  type CartographersFramedMapId,
} from "@/lib/cartographersStudio";
import type { VisualFocusMap } from "@/lib/visualFocus";
import { ContinueThinkingCard } from "@/components/companion/ContinueThinkingCard";
import { AppBackButton } from "@/components/companion/AppBackButton";
import { NAV_FOCUS_MY_BRAIN } from "@/lib/navigationBack";

function FramedMapButton({
  map,
  onSelect,
  onLearn,
}: {
  map: CartographersFramedMap;
  onSelect: (id: CartographersFramedMapId) => void;
  onLearn: (map: CartographersFramedMap) => void;
}) {
  return (
    <button
      type="button"
      data-testid={`cartographers-frame-${map.id}`}
      data-interactive={map.interactive ? "true" : "false"}
      aria-label={
        map.interactive
          ? `Open ${map.nameplate} Discovery Interview`
          : `${map.nameplate} — coming soon`
      }
      title={map.interactive ? map.nameplate : `${map.nameplate} — coming soon`}
      onClick={() => {
        if (map.interactive) onSelect(map.id);
        else onLearn(map);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        onLearn(map);
      }}
      onPointerDown={(e) => {
        if (e.pointerType === "touch") {
          /* long-press handled via context menu / learn tip */
        }
      }}
      className={`cartographers-frame${map.interactive ? " cartographers-frame--live" : " cartographers-frame--soon"}`}
    >
      <span className="cartographers-frame__glow" aria-hidden />
      <span className="cartographers-frame__plate">{map.nameplate}</span>
      {!map.interactive ? (
        <span className="cartographers-frame__soon">Soon</span>
      ) : null}
    </button>
  );
}

export function CartographersStudioRoom({
  continueThinking,
  onSelectMindMap,
  onOpenMap,
  onRemoveMap,
  onDeleteMap,
  onWorkWithShari,
  onBack,
  onClose,
  backDestination = NAV_FOCUS_MY_BRAIN,
}: {
  continueThinking: VisualFocusMap[];
  onSelectMindMap: () => void;
  onOpenMap: (id: string) => void;
  onRemoveMap?: (id: string) => void;
  onDeleteMap?: (id: string) => void;
  onWorkWithShari?: () => void;
  onBack?: () => void;
  onClose?: () => void;
  backDestination?: string;
}) {
  const [learnMap, setLearnMap] = useState<CartographersFramedMap | null>(null);
  const [atlasOpen, setAtlasOpen] = useState(false);

  function handleFrameSelect(id: CartographersFramedMapId) {
    if (id === "mind-map") onSelectMindMap();
  }

  return (
    <div
      className="cartographers-studio-room"
      data-testid="cartographers-studio-room"
    >
      <header className="cartographers-studio-room__header">
        <div className="min-w-0 flex-1">
          <p className="cartographers-studio-room__plaque">
            {CARTOGRAPHERS_ROOM_INTRO.plaque}
          </p>
          <h1 className="cartographers-studio-room__title">
            {CARTOGRAPHERS_ROOM_INTRO.tagline}
          </h1>
          <p className="cartographers-studio-room__welcome">
            {CARTOGRAPHERS_ROOM_INTRO.welcome}
          </p>
          <p className="cartographers-studio-room__mvp-note">
            {CARTOGRAPHERS_ROOM_INTRO.mindMapReady}
          </p>
        </div>
        {onBack || onClose ? (
          <AppBackButton
            destination={backDestination}
            onBack={onBack ?? onClose!}
            size="compact"
          />
        ) : null}
      </header>

      {continueThinking.length > 0 ? (
        <section
          className="cartographers-studio-room__resume"
          data-testid="continue-thinking"
        >
          <p className="cartographers-studio-room__resume-label">
            Continue where you left off
          </p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
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

      <section
        className="cartographers-wall"
        aria-label="Framed maps"
        data-testid="cartographers-wall"
      >
        <div className="cartographers-wall__grid">
          {CARTOGRAPHERS_FRAMED_MAPS.map((map) => (
            <FramedMapButton
              key={map.id}
              map={map}
              onSelect={handleFrameSelect}
              onLearn={setLearnMap}
            />
          ))}
        </div>
      </section>

      <div className="cartographers-studio-room__objects">
        <button
          type="button"
          className="cartographers-atlas-stand"
          data-testid="cartographers-atlas"
          onClick={() => setAtlasOpen(true)}
          aria-label="Open Atlas of Visual Thinking"
        >
          <span className="cartographers-atlas-stand__title">
            {CARTOGRAPHERS_ATLAS_TEASER.title}
          </span>
          <span className="cartographers-atlas-stand__body">
            {CARTOGRAPHERS_ATLAS_TEASER.body}
          </span>
        </button>
        {onWorkWithShari ? (
          <button
            type="button"
            className="mt-3 text-sm font-semibold text-[#1e4f4f] underline-offset-2 hover:underline"
            onClick={onWorkWithShari}
            data-testid="cartographers-work-with-shari"
          >
            Not sure which map? Tell Shari what you&apos;re trying to see.
          </button>
        ) : null}
      </div>

      {learnMap ? (
        <div
          className="cartographers-learn-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cartographers-learn-title"
          data-testid="cartographers-learn-tip"
        >
          <div className="cartographers-learn-overlay__card">
            <p
              id="cartographers-learn-title"
              className="cartographers-learn-overlay__name"
            >
              {learnMap.nameplate}
            </p>
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
                  className="rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163c3c]"
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
        <div
          className="cartographers-learn-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cartographers-atlas-title"
          data-testid="cartographers-atlas-panel"
        >
          <div className="cartographers-learn-overlay__card cartographers-learn-overlay__card--wide">
            <p
              id="cartographers-atlas-title"
              className="cartographers-learn-overlay__name"
            >
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
                className="rounded-xl px-4 py-2 text-sm font-semibold text-[#6b635a] hover:bg-[#faf7f2]"
                onClick={() => setAtlasOpen(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163c3c]"
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
    </div>
  );
}
