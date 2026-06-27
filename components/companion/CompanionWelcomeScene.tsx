"use client";

import {
  createContext,
  useContext,
  useMemo,
  type CSSProperties,
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
import { LivingChangeVisualDebug } from "@/components/companion/LivingChangeVisualDebug";
import { WelcomeRoomPrototypeDevPanel } from "@/components/companion/WelcomeRoomPrototypeDevPanel";
import {
  effectiveWelcomePhotographId,
  welcomeImageCapabilities,
} from "@/lib/companionEnvironmentIntelligence/welcomeImageCapabilities";
import type { CommunicationAnchorMode } from "@/lib/companionCommunicationAnchor";
import type { ArrivalRecommendation, HospitalityResponse } from "@/lib/arrivalExperience";
import { homesteadTimeCssVars } from "@/lib/homesteadTime";
import { isMasterLivingRoomLocked } from "@/lib/livingRoomMaster";

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
  greetingBody?: string | null;
  sparkLine?: string | null;
  invite?: string | null;
  echoLine?: string | null;
  recommendation?: ArrivalRecommendation | null;
  hospitality?: HospitalityResponse | null;
  showGreeting?: boolean;
  showSpark?: boolean;
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
 * Room state is chosen before render (Room Integrity Principle).
 */
export function CompanionWelcomeScene({
  ariaLabel = `${WELCOME_PRESENCE_GREETING} ${WELCOME_PRESENCE_INVITE}`,
  greeting = WELCOME_PRESENCE_GREETING,
  greetingBody = null,
  sparkLine = null,
  invite = WELCOME_PRESENCE_INVITE,
  echoLine = null,
  recommendation = null,
  hospitality = null,
  showGreeting: showGreetingOverride,
  showSpark: showSparkOverride,
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
  const displayPhotographId = effectiveWelcomePhotographId(photographId);
  const imageCaps = welcomeImageCapabilities(displayPhotographId);
  const masterSceneLocked = isMasterLivingRoomLocked();
  const artStyle = {
    objectPosition: imageCaps.artObjectPosition,
    objectFit: imageCaps.artObjectFit,
  } as CSSProperties;
  const artRoomLayout = imageCaps.artObjectFit === "contain";
  const showHospitalitySteam =
    hospitality?.showMugSteam && !imageCaps.suppressHospitalitySteam;
  const showHospitalityCurtains =
    hospitality?.closeCurtains && !imageCaps.suppressCurtains;
  const src =
    resolveCompanionPresenceLibraryImage("chat-welcome", displayPhotographId) ??
    companionPresenceWelcomeImageUrl();

  const showGreeting =
    showGreetingOverride ?? phaseShowsGreeting(living.phase);
  const showSpark =
    showSparkOverride ?? showGreeting;
  const showInvite =
    showInviteOverride ?? (invite ? phaseShowsInvite(living.phase) : false);
  const showInput =
    showInputOverride ?? phaseShowsInput(living.phase);
  const arrivalMode = showGreetingOverride !== undefined;
  const livingChange = resolvedRoom?.livingChangeSet;
  const homesteadTime = resolvedRoom?.homesteadTime ?? null;
  const homesteadStyle = homesteadTime
    ? (homesteadTimeCssVars(homesteadTime) as CSSProperties)
    : undefined;

  return (
    <WelcomeLivingRoomContext.Provider value={living}>
      <section
        className="companion-welcome-scene"
        aria-label={ariaLabel}
        data-testid="companion-welcome-scene"
      >
        {showWelcomeRoomPrototypePanel(studioParam, demoParam) ? (
          <>
            <WelcomeRoomPrototypeDevPanel
              overrides={overrides}
              onChange={setOverrides}
              onReset={resetOverrides}
            />
            <LivingChangeVisualDebug
              livingChange={livingChange}
              motionEnabled={resolvedRoom?.layer3.enabled ?? []}
              photographId={displayPhotographId}
            />
          </>
        ) : null}

        <div
          className={`companion-welcome-scene__hero companion-welcome-scene__hero--${living.phase}${
            living.candlePulse ? " companion-welcome-scene__hero--candle-pulse" : ""
          }${living.phase === "alive" || arrivalMode ? " companion-welcome-scene__hero--ambient" : ""}${
            walking ? " companion-welcome-scene__hero--walking" : ""
          }`}
          style={homesteadStyle}
          data-living-phase={living.phase}
          data-time-of-day={atmosphere.timeOfDay}
          data-homestead-period={homesteadTime?.period}
          data-homestead-pace={homesteadTime?.dayPace}
          data-season={atmosphere.season}
          data-weather={atmosphere.weather}
          data-room-accent={roomAccent ?? undefined}
          data-room-reason={resolvedRoom?.layer1.reason}
          data-hospitality-blanket={hospitality?.showBlanket ? "" : undefined}
          data-hospitality-mug={showHospitalitySteam ? "" : undefined}
          data-hospitality-lamp={hospitality?.warmLamp ? "" : undefined}
          data-hospitality-curtains={showHospitalityCurtains ? "" : undefined}
          data-master-scene={masterSceneLocked ? "" : undefined}
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
            data-welcome-image={displayPhotographId}
            className={`companion-welcome-scene__art${
              artRoomLayout ? " companion-welcome-scene__art--room" : ""
            }`}
            style={artStyle}
            draggable={false}
          />

          {resolvedRoom && !masterSceneLocked ? (
            <LivingCompanionRoomLayers
              objects={resolvedRoom.layer2}
              motion={resolvedRoom.layer3}
              photographId={displayPhotographId}
            />
          ) : !masterSceneLocked ? (
            <div className="companion-welcome-scene__life" aria-hidden="true">
              <div className="companion-welcome-scene__sunlight" />
              <div className="companion-welcome-scene__lamplight" />
              <div className="companion-welcome-scene__foliage" />
            </div>
          ) : null}

          {!masterSceneLocked && hospitality?.showBlanket ? (
            <div
              className="companion-welcome-scene__object companion-welcome-scene__object--blanket companion-welcome-scene__hospitality-blanket"
              aria-hidden="true"
            />
          ) : null}
          {!masterSceneLocked && showHospitalitySteam ? (
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
                {sparkLine ? (
                  <p
                    className={`companion-welcome-scene__spark${
                      showSpark ? " is-visible" : ""
                    }`}
                  >
                    {sparkLine}
                  </p>
                ) : null}
                <h1
                  className={`companion-welcome-scene__greeting${
                    showGreeting ? " is-visible" : ""
                  }`}
                >
                  {greeting}
                </h1>
                {greetingBody ? (
                  <p
                    className={`companion-welcome-scene__greeting-body${
                      showGreeting ? " is-visible" : ""
                    }`}
                  >
                    {greetingBody}
                  </p>
                ) : null}
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
                        Let's sit a minute
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
                    About the same
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

        </div>
      </section>
    </WelcomeLivingRoomContext.Provider>
  );
}
