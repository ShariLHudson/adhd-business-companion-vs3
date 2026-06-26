"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  hasActivePrototypeOverrides,
  recomposeLivingRoomWithPrototype,
  showWelcomeRoomPrototypePanel,
  type LivingCompanionRoom,
} from "@/lib/companionEnvironmentIntelligence";
import { useWelcomeRoomPrototype } from "@/lib/companionEnvironmentIntelligence/useWelcomeRoomPrototype";
import {
  companionPresenceWelcomeImageUrl,
  COMPANION_PRESENCE_WELCOME_IMAGE_ID,
  resolveCompanionPresenceLibraryImage,
  WELCOME_PRESENCE_GREETING,
  WELCOME_PRESENCE_INVITE,
} from "@/lib/companionPresenceLibrary";
import { ASSETS } from "@/lib/companionUi";
import { timeOfDayBucket } from "@/lib/arrivalIntelligence/livingIntelligenceGraph";
import { getRecognitionStore } from "@/lib/recognition/recognitionStore";
import {
  phaseShowsGreeting,
  phaseShowsInput,
  phaseShowsInvite,
  resolveWelcomeAtmosphere,
  resolveWelcomeRoomAccent,
  type WelcomeSeason,
  type WelcomeTimeOfDay,
} from "@/lib/welcomeLivingRoom";
import type { WelcomeWeather } from "@/lib/companionEnvironmentIntelligence";
import { useWelcomeLivingRoom } from "@/lib/welcomeLivingRoom/useWelcomeLivingRoom";
import { LivingCompanionRoomLayers } from "@/components/companion/LivingCompanionRoomLayers";
import { WelcomeRoomPrototypeDevPanel } from "@/components/companion/WelcomeRoomPrototypeDevPanel";
import type { CommunicationAnchorMode } from "@/lib/companionCommunicationAnchor";
import type { ArrivalRecommendation, HospitalityResponse } from "@/lib/arrivalExperience";

type WelcomeLivingRoomContextValue = ReturnType<typeof useWelcomeLivingRoom>;

const WelcomeLivingRoomContext =
  createContext<WelcomeLivingRoomContextValue | null>(null);

export function useWelcomeLivingRoomContext(): WelcomeLivingRoomContextValue {
  const value = useContext(WelcomeLivingRoomContext);
  if (!value) {
    throw new Error(
      "WelcomeLivingRoomInput must render inside CompanionWelcomeScene",
    );
  }
  return value;
}

type WelcomeSceneAtmosphere = {
  timeOfDay: WelcomeTimeOfDay;
  season: WelcomeSeason;
  weather: WelcomeWeather;
};

function normalizeWelcomeAtmosphere(
  base:
    | WelcomeSceneAtmosphere
    | { timeOfDay: WelcomeTimeOfDay; season: WelcomeSeason; weather?: WelcomeWeather },
): WelcomeSceneAtmosphere {
  return {
    timeOfDay: base.timeOfDay,
    season: base.season,
    weather: "weather" in base && base.weather ? base.weather : "clear",
  };
}

type Props = {
  ariaLabel?: string;
  greeting?: string;
  invite?: string | null;
  echoLine?: string | null;
  recommendation?: ArrivalRecommendation | null;
  hospitality?: HospitalityResponse | null;
  showGreeting?: boolean;
  showInvite?: boolean;
  showEcho?: boolean;
  showRecommendation?: boolean;
  showInput?: boolean;
  communicationAnchorMode?: CommunicationAnchorMode;
  walking?: boolean;
  onAcceptRecommendation?: () => void;
  onDeclineRecommendation?: () => void;
  onStayHere?: () => void;
  onSameAsYesterday?: () => void;
  showSameAsYesterday?: boolean;
  livingRoom?: LivingCompanionRoom | null;
  companionImageId?: string;
  timeOfDay?: WelcomeTimeOfDay;
  children: ReactNode;
};

/**
 * Living welcome room — environment breathes; Shari stays still.
 * Room state is chosen before render (Room Integrity Principle™).
 */
export function CompanionWelcomeScene({
  ariaLabel = `${WELCOME_PRESENCE_GREETING} ${WELCOME_PRESENCE_INVITE}`,
  greeting = WELCOME_PRESENCE_GREETING,
  invite = WELCOME_PRESENCE_INVITE,
  echoLine = null,
  recommendation = null,
  hospitality = null,
  showGreeting: showGreetingOverride,
  showInvite: showInviteOverride,
  showEcho = false,
  showRecommendation = false,
  showInput: showInputOverride,
  communicationAnchorMode = "full",
  walking = false,
  onAcceptRecommendation,
  onDeclineRecommendation,
  onStayHere,
  onSameAsYesterday,
  showSameAsYesterday = false,
  livingRoom,
  companionImageId,
  timeOfDay = timeOfDayBucket(),
  children,
}: Props) {
  const living = useWelcomeLivingRoom();
  const searchParams = useSearchParams();
  const studioParam = searchParams.get("studio");
  const demoParam = searchParams.get("demo");
  const { overrides, setOverrides, resetOverrides } = useWelcomeRoomPrototype();
  const resolvedRoom = useMemo(() => {
    if (!livingRoom) return null;
    if (!hasActivePrototypeOverrides(overrides)) return livingRoom;
    return recomposeLivingRoomWithPrototype(livingRoom, overrides);
  }, [livingRoom, overrides]);

  const atmosphere = useMemo(
    () =>
      normalizeWelcomeAtmosphere(
        resolvedRoom?.atmosphere ?? resolveWelcomeAtmosphere({ timeOfDay }),
      ),
    [resolvedRoom?.atmosphere, timeOfDay],
  );
  const roomAccent = resolveWelcomeRoomAccent({
    birthday: getRecognitionStore().birthday,
  });
  const photographId =
    resolvedRoom?.layer1.id ??
    companionImageId ??
    COMPANION_PRESENCE_WELCOME_IMAGE_ID;
  const src =
    resolveCompanionPresenceLibraryImage("chat-welcome", photographId) ??
    companionPresenceWelcomeImageUrl();

  const showGreeting =
    showGreetingOverride ?? phaseShowsGreeting(living.phase);
  const showInvite =
    showInviteOverride ?? (invite ? phaseShowsInvite(living.phase) : false);
  const showInput =
    showInputOverride ?? phaseShowsInput(living.phase);
  const arrivalMode = showGreetingOverride !== undefined;
  const livingChange = resolvedRoom?.livingChangeSet;

  return (
    <WelcomeLivingRoomContext.Provider value={living}>
      <section
        className="companion-welcome-scene"
        aria-label={ariaLabel}
        data-testid="companion-welcome-scene"
      >
        {showWelcomeRoomPrototypePanel(studioParam, demoParam) ? (
          <WelcomeRoomPrototypeDevPanel
            overrides={overrides}
            onChange={setOverrides}
            onReset={resetOverrides}
          />
        ) : null}

        <div
          className={`companion-welcome-scene__hero companion-welcome-scene__hero--${living.phase}${
            living.candlePulse ? " companion-welcome-scene__hero--candle-pulse" : ""
          }${living.phase === "alive" || arrivalMode ? " companion-welcome-scene__hero--ambient" : ""}${
            walking ? " companion-welcome-scene__hero--walking" : ""
          }`}
          data-living-phase={living.phase}
          data-time-of-day={atmosphere.timeOfDay}
          data-season={atmosphere.season}
          data-weather={atmosphere.weather}
          data-room-accent={roomAccent ?? undefined}
          data-room-reason={resolvedRoom?.layer1.reason}
          data-hospitality-blanket={hospitality?.showBlanket ? "" : undefined}
          data-hospitality-mug={hospitality?.showMugSteam ? "" : undefined}
          data-hospitality-lamp={hospitality?.warmLamp ? "" : undefined}
          data-hospitality-curtains={hospitality?.closeCurtains ? "" : undefined}
          data-kinsey={
            livingChange?.kinsey && livingChange.kinsey !== "hidden"
              ? livingChange.kinsey
              : undefined
          }
          data-wildlife={livingChange?.wildlife ?? undefined}
          data-hero-motion={livingChange?.heroMotion ?? undefined}
          data-living-visit={livingChange?.visitKind ?? undefined}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            data-welcome-image={photographId}
            className="companion-welcome-scene__art"
            draggable={false}
          />

          {resolvedRoom ? (
            <LivingCompanionRoomLayers
              objects={resolvedRoom.layer2}
              motion={resolvedRoom.layer3}
              photographId={photographId}
            />
          ) : (
            <div className="companion-welcome-scene__life" aria-hidden="true">
              <div className="companion-welcome-scene__sunlight" />
              <div className="companion-welcome-scene__lamplight" />
              <div className="companion-welcome-scene__foliage" />
            </div>
          )}

          {hospitality?.showBlanket ? (
            <div
              className="companion-welcome-scene__object companion-welcome-scene__object--blanket companion-welcome-scene__hospitality-blanket"
              aria-hidden="true"
            />
          ) : null}
          {hospitality?.showMugSteam ? (
            <div
              className="companion-welcome-scene__steam companion-welcome-scene__hospitality-steam"
              aria-hidden="true"
            />
          ) : null}

          <div className="companion-welcome-scene__veil" aria-hidden="true" />

          <div className="companion-welcome-scene__overlay">
            <div className="companion-welcome-scene__open" aria-hidden="true" />

            <div className="companion-welcome-scene__copy-panel">
              <div className="companion-welcome-scene__copy">
                <h1
                  className={`companion-welcome-scene__greeting${
                    showGreeting ? " is-visible" : ""
                  }`}
                >
                  {greeting}
                </h1>
                <p
                  className={`companion-welcome-scene__invite${
                    showInvite ? " is-visible" : ""
                  }`}
                >
                  {invite}
                </p>
                <p
                  className={`companion-welcome-scene__echo${
                    showEcho && echoLine ? " is-visible" : ""
                  }`}
                  aria-live="polite"
                >
                  {echoLine}
                </p>
                {showRecommendation && recommendation ? (
                  <div
                    className={`companion-welcome-scene__arrival-door is-visible`}
                  >
                    <p className="companion-welcome-scene__recommendation">
                      {recommendation.line}
                    </p>
                    <div className="companion-welcome-scene__arrival-actions">
                      <button
                        type="button"
                        className="companion-welcome-scene__arrival-primary"
                        onClick={onAcceptRecommendation}
                      >
                        {recommendation.buttonLabel}
                      </button>
                      <button
                        type="button"
                        className="companion-welcome-scene__arrival-quiet"
                        onClick={onDeclineRecommendation}
                      >
                        Not today
                      </button>
                      <button
                        type="button"
                        className="companion-welcome-scene__arrival-quiet"
                        onClick={onStayHere}
                      >
                        Stay here
                      </button>
                    </div>
                  </div>
                ) : null}
                {showSameAsYesterday ? (
                  <button
                    type="button"
                    className="companion-welcome-scene__arrival-same"
                    onClick={onSameAsYesterday}
                  >
                    Same as yesterday
                  </button>
                ) : null}
                {resolvedRoom?.guestPreparation?.line ? (
                  <p
                    className={`companion-welcome-scene__prepared${
                      showInvite ? " is-visible" : ""
                    }`}
                  >
                    {resolvedRoom.guestPreparation.line}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div
            className={`companion-welcome-scene__input companion-communication-anchor companion-communication-anchor--living-room companion-communication-anchor--${communicationAnchorMode}${
              showInput ? " is-visible" : ""
            }${walking ? " companion-communication-anchor--transition" : ""}`}
            data-communication-variant="living-room"
            data-communication-mode={communicationAnchorMode}
          >
            {children}
          </div>

          <span className="companion-welcome-scene__brand" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ASSETS.logo}
              alt=""
              className="companion-welcome-scene__brand-img"
              draggable={false}
            />
          </span>
        </div>
      </section>
    </WelcomeLivingRoomContext.Provider>
  );
}
