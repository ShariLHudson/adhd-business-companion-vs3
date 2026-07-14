"use client";

import Image from "next/image";
import { useRef, useState, type CSSProperties } from "react";
import {
  DESTINATION_GALLERY_BG,
  DESTINATION_GALLERY_CRYSTALS,
  DESTINATION_CRYSTAL_HIT_AREAS,
  crystalAriaLabel,
  crystalHitAreaFor,
  type CrystalActivation,
  type DestinationCrystal,
  type DestinationCrystalId,
} from "@/lib/destinationGallery";
import { ExportActions } from "@/components/companion/ExportActions";

type Props = {
  onBack?: () => void;
  onReturnToEstate?: () => void;
  onSelectCrystal?: (crystal: DestinationCrystal) => void;
  /** Pass-1 prepared destination (Document / Store / Share / Print / Design). */
  prepared?: CrystalActivation | null;
  onClearPrepared?: () => void;
  exportText?: string;
  exportTitle?: string;
  onOpenConnections?: () => void;
};

const ACTIVATE_MS = 380;

/**
 * Destination Gallery — painted crystal pillars are the navigation objects.
 * Transparent hit areas only; no cards, orbs, tooltips, or duplicate labels.
 * Artwork labels (Schedule, Write, Save, …) remain the only visible names.
 */
export function DestinationGalleryPanel({
  onBack,
  onReturnToEstate,
  onSelectCrystal,
  prepared = null,
  onClearPrepared,
  exportText = "",
  exportTitle = "Spark work",
  onOpenConnections,
}: Props) {
  const showPrepared = prepared != null && prepared.kind !== "open_calendar";
  const [activatingId, setActivatingId] =
    useState<DestinationCrystalId | null>(null);
  const [flash, setFlash] = useState<{ x: string; y: string } | null>(null);
  const activateTimerRef = useRef<number | null>(null);

  function activateCrystal(crystal: DestinationCrystal) {
    if (activatingId) return;
    if (activateTimerRef.current != null) {
      window.clearTimeout(activateTimerRef.current);
    }
    const area = crystalHitAreaFor(crystal.id);
    setActivatingId(crystal.id);
    if (area) {
      setFlash({
        x: `calc(${area.left} + ${area.width} / 2)`,
        y: `calc(${area.top} + ${area.height} / 2)`,
      });
    }
    activateTimerRef.current = window.setTimeout(() => {
      onSelectCrystal?.(crystal);
      setActivatingId(null);
      setFlash(null);
      activateTimerRef.current = null;
    }, ACTIVATE_MS);
  }

  return (
    <div
      className="destination-gallery-panel absolute inset-0 z-10"
      data-testid="destination-gallery-panel"
      data-crystal-navigation="true"
      data-scene="destination-gallery-background"
      role="region"
      aria-label="Destination Gallery"
    >
      <div
        className="destination-gallery-panel__stage"
        data-testid="destination-gallery-stage"
      >
        <div className="destination-gallery-panel__scene" aria-hidden>
          <Image
            src={DESTINATION_GALLERY_BG.split("?")[0] ?? DESTINATION_GALLERY_BG}
            alt=""
            fill
            priority
            className="destination-gallery-panel__media"
            sizes="100vw"
          />
        </div>

        <div
          className="destination-gallery-panel__flash"
          data-active={flash ? "true" : "false"}
          style={
            flash
              ? ({
                  "--flash-x": flash.x,
                  "--flash-y": flash.y,
                } as CSSProperties)
              : undefined
          }
          aria-hidden
        />

        {showPrepared ? (
          <PreparedDestinationView
            prepared={prepared}
            exportText={exportText}
            exportTitle={exportTitle}
            onOpenConnections={onOpenConnections}
          />
        ) : (
          <ul
            className="destination-gallery-crystal-field"
            data-testid="destination-gallery-crystal-list"
          >
            {DESTINATION_GALLERY_CRYSTALS.map((crystal) => {
              const area = crystalHitAreaFor(crystal.id);
              if (!area) return null;
              const activating = activatingId === crystal.id;
              return (
                <li
                  key={crystal.id}
                  className="destination-gallery-crystal-slot"
                  style={{
                    left: area.left,
                    top: area.top,
                    width: area.width,
                    height: area.height,
                  }}
                >
                  <button
                    type="button"
                    className="destination-gallery-crystal"
                    data-testid={`destination-crystal-${crystal.id}`}
                    data-crystal-id={crystal.id}
                    data-activating={activating ? "true" : "false"}
                    aria-label={crystalAriaLabel(area)}
                    onClick={() => activateCrystal(crystal)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        activateCrystal(crystal);
                      }
                    }}
                  >
                    <span
                      className="destination-gallery-crystal__glow"
                      aria-hidden
                    />
                    <span
                      className="destination-gallery-crystal__shimmer"
                      aria-hidden
                    />
                    <span
                      className="destination-gallery-crystal__spark"
                      aria-hidden
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="destination-gallery-panel__chrome">
        {showPrepared && onClearPrepared ? (
          <button
            type="button"
            className="destination-gallery-panel__chrome-btn"
            data-testid="destination-gallery-back-to-crystals"
            onClick={onClearPrepared}
          >
            Gallery
          </button>
        ) : null}
        {onBack ? (
          <button
            type="button"
            className="destination-gallery-panel__chrome-btn"
            onClick={onBack}
          >
            Back
          </button>
        ) : null}
        {onReturnToEstate ? (
          <button
            type="button"
            className="destination-gallery-panel__chrome-btn"
            onClick={onReturnToEstate}
          >
            Estate
          </button>
        ) : null}
      </div>

      {/* Dev-facing count for tests — hit areas match painted pillars */}
      <span className="sr-only" data-testid="destination-crystal-hit-count">
        {DESTINATION_CRYSTAL_HIT_AREAS.length}
      </span>
    </div>
  );
}

function PreparedDestinationView({
  prepared,
  exportText,
  exportTitle,
  onOpenConnections,
}: {
  prepared: CrystalActivation;
  exportText: string;
  exportTitle: string;
  onOpenConnections?: () => void;
}) {
  const hasExportable = exportText.trim().length > 0;

  return (
    <div
      className="destination-gallery-prepared"
      data-testid={`destination-prepared-${prepared.crystalId}`}
      data-activation-kind={prepared.kind}
    >
      <div className="destination-gallery-prepared__whisper">
        <h2 className="font-serif text-2xl">{prepared.title}</h2>
        {prepared.kind === "design_pending" ? (
          <p
            className="mt-3 text-base leading-relaxed text-[#f7f0e4]"
            data-testid="destination-design-pending-message"
            aria-live="polite"
          >
            {prepared.body}
          </p>
        ) : (
          <p className="mt-3 text-sm leading-relaxed text-[#e8dcc8]">
            {prepared.body}
          </p>
        )}

        {prepared.kind === "prepared_share" ? (
          <div
            className="mt-4 space-y-2 text-sm text-[#e8dcc8]"
            data-testid="destination-share-prepared"
          >
            <p>
              Prepared for: Facebook · Instagram · LinkedIn · Pinterest · TikTok
              · YouTube
            </p>
            <p className="font-medium text-[#f7f0e4]">
              Approval required before anything is published.
            </p>
          </div>
        ) : null}

        {prepared.kind === "prepared_store" ? (
          <div className="mt-4" data-testid="destination-store-prepared">
            <p className="text-sm text-[#e8dcc8]">
              Connect Google Drive in Connections when you want Spark to store
              files for you.
            </p>
            {onOpenConnections ? (
              <button
                type="button"
                className="destination-gallery-panel__chrome-btn mt-4"
                data-testid="destination-store-open-connections"
                onClick={onOpenConnections}
              >
                Open Connections
              </button>
            ) : null}
          </div>
        ) : null}

        {(prepared.kind === "prepared_document" ||
          prepared.kind === "prepared_print") &&
        hasExportable ? (
          <div
            className="mt-4 rounded-xl bg-[#f7f0e4]/95 p-4 text-[#1f1c19]"
            data-testid={
              prepared.kind === "prepared_document"
                ? "destination-document-export"
                : "destination-print-export"
            }
          >
            <ExportActions
              text={exportText}
              title={exportTitle}
              social={false}
              compact
              embedInPanel
            />
          </div>
        ) : null}

        {(prepared.kind === "prepared_document" ||
          prepared.kind === "prepared_print") &&
        !hasExportable ? (
          <p
            className="mt-4 text-sm text-[#d4c4a8]"
            data-testid="destination-export-empty"
          >
            Bring something we&apos;ve written together, and I can send it from
            here.
          </p>
        ) : null}
      </div>
    </div>
  );
}
