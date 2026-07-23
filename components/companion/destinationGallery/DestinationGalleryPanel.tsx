"use client";

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { detectPrintSupport } from "@/lib/artifactDestinations";
import {
  DESTINATION_GALLERY_BG,
  DESTINATION_CRYSTAL_HIT_AREAS,
  crystalOfferAriaLabel,
  executeCrystalDestination,
  getDestinationCrystal,
  resolveArtifactDestinationCrystalOffers,
  type ArtifactCrystalVisualState,
  type ArtifactDestinationCrystalOffer,
  type CrystalActivation,
  type DestinationCrystal,
} from "@/lib/destinationGallery";

type Props = {
  onBack?: () => void;
  onReturnToEstate?: () => void;
  /**
   * Legacy pillar activation (Schedule / Design / Share).
   * Artifact-local destinations (PDF, Print, Docs…) execute in-panel.
   */
  onSelectCrystal?: (crystal: DestinationCrystal) => void;
  /** Prepared destination whisper (needs connection / hospitality). */
  prepared?: CrystalActivation | null;
  onClearPrepared?: () => void;
  exportText?: string;
  exportTitle?: string;
  /** Drives which crystals appear (document vs sheet vs calendar…). */
  artifactType?: string;
  onOpenConnections?: () => void;
  canvaDestinationUrl?: string | null;
  outlookConnected?: boolean;
  canvaConnected?: boolean;
};

const ACTIVATE_MS = 380;

type RuntimeStateMap = Partial<
  Record<string, ArtifactCrystalVisualState>
>;

/**
 * Destination Gallery — painted crystal pillars remain the visual destinations.
 * Artifact capabilities filter which crystals light up; never a plain export menu.
 */
export function DestinationGalleryPanel({
  onBack,
  onReturnToEstate,
  onSelectCrystal,
  prepared = null,
  onClearPrepared,
  exportText = "",
  exportTitle = "Spark work",
  artifactType = "Document",
  onOpenConnections,
  canvaDestinationUrl = null,
  outlookConnected = false,
  canvaConnected = false,
}: Props) {
  const printSupport = useMemo(() => detectPrintSupport(), []);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleConfigured, setGoogleConfigured] = useState(true);
  const [runtimeStates, setRuntimeStates] = useState<RuntimeStateMap>({});
  const [statusWhisper, setStatusWhisper] = useState<string | null>(null);
  const [activatingOfferId, setActivatingOfferId] = useState<string | null>(
    null,
  );
  const [flash, setFlash] = useState<{ x: string; y: string } | null>(null);
  const activateTimerRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/google/status")
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        setGoogleConnected(Boolean(j.connected));
        setGoogleConfigured(j.configured !== false);
      })
      .catch(() => {
        if (cancelled) return;
        setGoogleConnected(false);
        setGoogleConfigured(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const baseOffers = useMemo(
    () =>
      resolveArtifactDestinationCrystalOffers(artifactType, exportText, {
        googleConfigured,
        googleConnected,
        outlookConnected,
        canvaConnected,
        printSupported: printSupport.supported,
      }),
    [
      artifactType,
      exportText,
      googleConfigured,
      googleConnected,
      outlookConnected,
      canvaConnected,
      printSupport.supported,
    ],
  );

  const offers = useMemo(
    () =>
      baseOffers.map((offer) => {
        const runtime = runtimeStates[offer.offerId];
        if (!runtime) return offer;
        return { ...offer, state: runtime };
      }),
    [baseOffers, runtimeStates],
  );

  const showPreparedWhisper =
    prepared != null &&
    prepared.kind !== "open_calendar" &&
    prepared.kind !== "open_external_url";

  function setOfferState(
    offerId: string,
    state: ArtifactCrystalVisualState,
  ) {
    setRuntimeStates((prev) => ({ ...prev, [offerId]: state }));
  }

  function whisper(message: string) {
    setStatusWhisper(message);
    window.setTimeout(() => setStatusWhisper(null), 3200);
  }

  async function runOffer(offer: ArtifactDestinationCrystalOffer) {
    if (
      offer.state === "temporarily_unavailable" &&
      runtimeStates[offer.offerId] !== "failed"
    ) {
      whisper(offer.statusHint);
      return;
    }

    if (offer.state === "needs_connection") {
      whisper(offer.statusHint);
      onOpenConnections?.();
      return;
    }

    setOfferState(offer.offerId, "processing");
    const result = await executeCrystalDestination({
      destinationId: offer.destinationId,
      title: exportTitle,
      body: exportText,
      artifactType,
      googleConnected,
      googleConfigured,
      outlookConnected,
      canvaConnected,
      printSupported: printSupport.supported,
      canvaDestinationUrl,
    });

    if (result.openConnections) {
      setOfferState(offer.offerId, "needs_connection");
      whisper(result.message);
      onOpenConnections?.();
      return;
    }

    if (result.openEstateCalendar) {
      const schedule = getDestinationCrystal("schedule");
      if (schedule) onSelectCrystal?.(schedule);
    }

    if (result.openUrl) {
      try {
        window.open(result.openUrl, "_blank", "noopener,noreferrer");
      } catch {
        setOfferState(offer.offerId, "failed");
        whisper(
          "Something got tangled opening that destination. You can try again.",
        );
        return;
      }
    }

    if (result.ok) {
      setOfferState(offer.offerId, "completed");
      whisper(result.message);
      window.setTimeout(() => {
        setRuntimeStates((prev) => {
          const next = { ...prev };
          if (next[offer.offerId] === "completed") {
            delete next[offer.offerId];
          }
          return next;
        });
      }, 2400);
      return;
    }

    setOfferState(offer.offerId, "failed");
    whisper(result.message);
  }

  function activateOffer(offer: ArtifactDestinationCrystalOffer) {
    if (activatingOfferId) return;
    if (activateTimerRef.current != null) {
      window.clearTimeout(activateTimerRef.current);
    }
    setActivatingOfferId(offer.offerId);
    setFlash({
      x: `calc(${offer.hitArea.left} + ${offer.hitArea.width} / 2)`,
      y: `calc(${offer.hitArea.top} + ${offer.hitArea.height} / 2)`,
    });
    activateTimerRef.current = window.setTimeout(() => {
      void runOffer(offer);
      setActivatingOfferId(null);
      setFlash(null);
      activateTimerRef.current = null;
    }, ACTIVATE_MS);
  }

  return (
    <div
      className="destination-gallery-panel absolute inset-0 z-10"
      data-testid="destination-gallery-panel"
      data-crystal-navigation="true"
      data-crystal-mode="artifact"
      data-scene="destination-gallery-background"
      data-artifact-family={offers[0] ? artifactType : "Document"}
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

        <ul
          className="destination-gallery-crystal-field"
          data-testid="destination-gallery-crystal-list"
        >
          {offers.map((offer) => {
            const activating = activatingOfferId === offer.offerId;
            return (
              <li
                key={offer.offerId}
                className="destination-gallery-crystal-slot"
                style={{
                  left: offer.hitArea.left,
                  top: offer.hitArea.top,
                  width: offer.hitArea.width,
                  height: offer.hitArea.height,
                }}
              >
                <button
                  type="button"
                  className="destination-gallery-crystal"
                  data-testid={`destination-crystal-${offer.destinationId}`}
                  data-crystal-id={offer.slotId}
                  data-destination-id={offer.destinationId}
                  data-crystal-state={offer.state}
                  data-activating={activating ? "true" : "false"}
                  aria-label={crystalOfferAriaLabel(offer)}
                  onClick={() => activateOffer(offer)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      activateOffer(offer);
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
                  <span
                    className="destination-gallery-crystal__whisper"
                    data-testid={`destination-crystal-whisper-${offer.destinationId}`}
                  >
                    {offer.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {showPreparedWhisper && prepared ? (
          <PreparedDestinationWhisper
            prepared={prepared}
            onOpenConnections={onOpenConnections}
          />
        ) : null}

        {statusWhisper ? (
          <p
            className="destination-gallery-status-whisper"
            data-testid="destination-gallery-status-whisper"
            aria-live="polite"
          >
            {statusWhisper}
          </p>
        ) : null}
      </div>

      <div className="destination-gallery-panel__chrome">
        {showPreparedWhisper && onClearPrepared ? (
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

      <span className="sr-only" data-testid="destination-crystal-hit-count">
        {offers.length}
      </span>
      <span className="sr-only" data-testid="destination-crystal-pillar-count">
        {DESTINATION_CRYSTAL_HIT_AREAS.length}
      </span>
    </div>
  );
}

function PreparedDestinationWhisper({
  prepared,
  onOpenConnections,
}: {
  prepared: CrystalActivation;
  onOpenConnections?: () => void;
}) {
  const showConnectionsCta =
    prepared.shouldOpenConnections === true ||
    prepared.kind === "needs_connection" ||
    prepared.kind === "prepared_store";

  return (
    <div
      className="destination-gallery-prepared destination-gallery-prepared--over-crystals"
      data-testid={`destination-prepared-${prepared.crystalId}`}
      data-activation-kind={prepared.kind}
    >
      <div className="destination-gallery-prepared__whisper">
        <h2 className="font-serif text-2xl">{prepared.title}</h2>
        <p
          className="mt-3 text-base leading-relaxed text-[#f7f0e4]"
          data-testid={
            prepared.kind === "needs_connection"
              ? "destination-needs-connection-message"
              : prepared.crystalId === "create"
                ? "destination-design-pending-message"
                : undefined
          }
          aria-live="polite"
        >
          {prepared.body}
        </p>

        {prepared.preferenceLabel ? (
          <p
            className="mt-2 text-sm text-[#e8dcc8]"
            data-testid="destination-preference-label"
          >
            Preference: {prepared.preferenceLabel}
          </p>
        ) : null}

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

        {showConnectionsCta && onOpenConnections ? (
          <div className="mt-4" data-testid="destination-open-connections">
            <button
              type="button"
              className="destination-gallery-panel__chrome-btn mt-2"
              data-testid="destination-store-open-connections"
              onClick={onOpenConnections}
            >
              Open Connections
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
