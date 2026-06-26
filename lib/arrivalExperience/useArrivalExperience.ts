"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import type { ArrivalIntelligence } from "@/lib/arrivalIntelligence";
import {
  beatShowsEcho,
  beatShowsGreeting,
  beatShowsInput,
  beatShowsCommunicationAnchor,
  resolveCommunicationAnchorMode,
  beatShowsInvite,
  beatShowsRealityQuestion,
  beatShowsSecondaryActions,
  initialArrivalBeatState,
  openingRealityQuestion,
  processRealityMessage,
  reduceArrivalBeat,
  resolveArrivalRecommendation,
  resolveHospitalityResponse,
  sameAsYesterdayEcho,
  softCompleteReality,
  type ArrivalBeat,
  type ArrivalRecommendation,
  type ConversationalRealityResult,
  type HospitalityResponse,
} from "@/lib/arrivalExperience";
import { isDayStateFromToday } from "@/lib/dayReality";
import { getDayState } from "@/lib/companionStore";

const ARRIVAL_MS = {
  greet: 800,
  sit: 2000,
  reality: 2800,
  echoHold: 2200,
  respond: 800,
  invite: 1200,
  realityTimeout: 30000,
} as const;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export type UseArrivalExperienceResult = {
  beat: ArrivalBeat;
  greeting: string;
  realityQuestion: string | null;
  clarifyQuestion: string | null;
  echo: string | null;
  recommendation: ArrivalRecommendation | null;
  hospitality: HospitalityResponse;
  showGreeting: boolean;
  showRealityQuestion: boolean;
  showEcho: boolean;
  showInvite: boolean;
  showInput: boolean;
  communicationAnchorMode: ReturnType<typeof resolveCommunicationAnchorMode>;
  showSecondaryActions: boolean;
  walking: boolean;
  submitReality: (message: string) => void;
  acceptRecommendation: () => void;
  declineRecommendation: () => void;
  stayHere: () => void;
  sameAsYesterday: () => void;
};

export function useArrivalExperience(
  arrival: ArrivalIntelligence,
  onImmersionNav: (hidden: boolean) => void,
  onWalkComplete: (recommendation: ArrivalRecommendation) => void,
): UseArrivalExperienceResult {
  const cached = getDayState();
  const hasCachedReality = Boolean(cached);
  const realityFreshToday = isDayStateFromToday(cached);
  const skipRealityOnMount =
    hasCachedReality &&
    realityFreshToday &&
    arrival.homeState !== "FIRST_VISIT";

  const [state, dispatch] = useReducer(
    reduceArrivalBeat,
    initialArrivalBeatState({
      homeState: arrival.homeState,
      realityFreshToday,
      hasCachedReality,
      returnAfterLongAbsence: (arrival.returnIntervalDays ?? 0) >= 42,
    }),
  );

  const [echo, setEcho] = useReducer(
    (_: string | null, next: string | null) => next,
    null,
  );
  const [clarifyQuestion, setClarifyQuestion] = useReducer(
    (_: string | null, next: string | null) => next,
    null,
  );
  const [recommendation, setRecommendation] =
    useReducer(
      (_: ArrivalRecommendation | null, next: ArrivalRecommendation | null) =>
        next,
      null,
    );
  const [tone, setTone] = useReducer(
    (
      _: ConversationalRealityResult["tone"],
      next: ConversationalRealityResult["tone"],
    ) => next,
    "okay",
  );
  const [hospitality, setHospitality] = useReducer(
    (_: HospitalityResponse, next: HospitalityResponse) => next,
    resolveHospitalityResponse("okay"),
  );

  const realityTurnRef = useRef(state.realityTurn);
  realityTurnRef.current = state.realityTurn;
  const lastMessageRef = useRef("");

  const greeting =
    arrival.welcomePresence?.greeting ??
    arrival.welcomeLine ??
    arrival.openingMessage ??
    "Come on in.";

  const realityQuestion =
    state.skipReality && state.beat !== "reality"
      ? null
      : openingRealityQuestion({
          returnAfterLongAbsence: (arrival.returnIntervalDays ?? 0) >= 42,
          lowEnergyHint: arrival.homeState === "QUIET_PRESENCE",
        });

  useEffect(() => {
    if (arrival.homeState === "FIRST_VISIT") {
      onImmersionNav(true);
      const timer = window.setTimeout(() => onImmersionNav(false), 20000);
      return () => window.clearTimeout(timer);
    }
    onImmersionNav(false);
    return undefined;
  }, [arrival.homeState, onImmersionNav]);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const scale = reduced ? 0.35 : 1;
    const timers = [
      window.setTimeout(
        () => dispatch({ type: "TICK_GREET" }),
        ARRIVAL_MS.greet * scale,
      ),
      window.setTimeout(
        () => dispatch({ type: "TICK_SIT" }),
        ARRIVAL_MS.sit * scale,
      ),
      window.setTimeout(() => {
        if (skipRealityOnMount) {
          dispatch({ type: "SKIP_TO_INVITE" });
          const cachedState = getDayState();
          if (cachedState) {
            setTone("okay");
            setEcho("Same as yesterday — I've got it.");
            setHospitality(resolveHospitalityResponse("okay"));
            const rec = resolveArrivalRecommendation({
              message: cachedState.note ?? "",
              tone: "okay",
              dayState: cachedState,
              continueResolution: arrival.continue,
            });
            setRecommendation(rec);
          }
          window.setTimeout(
            () => dispatch({ type: "TICK_INVITE" }),
            ARRIVAL_MS.invite * scale,
          );
        } else {
          dispatch({ type: "TICK_REALITY" });
        }
      }, ARRIVAL_MS.reality * scale),
    ];
    return () => timers.forEach((id) => window.clearTimeout(id));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount choreography once per arrival
  }, []);

  useEffect(() => {
    if (state.beat !== "reality") return undefined;
    const timer = window.setTimeout(() => {
      const soft = softCompleteReality();
      setEcho(soft.echo);
      setTone(soft.tone);
      setHospitality(resolveHospitalityResponse(soft.tone));
      dispatch({ type: "REALITY_SUBMITTED", needsClarify: false });
      const rec = resolveArrivalRecommendation({
        message: "",
        tone: soft.tone,
        dayState: soft.dayState,
        continueResolution: arrival.continue,
      });
      setRecommendation(rec);
    }, ARRIVAL_MS.realityTimeout);
    return () => window.clearTimeout(timer);
  }, [state.beat, arrival.continue]);

  useEffect(() => {
    if (state.beat !== "echo") return undefined;
    dispatch({ type: "ECHO_SHOWN" });
    const reduced = prefersReducedMotion();
    const scale = reduced ? 0.35 : 1;
    const timers = [
      window.setTimeout(
        () => dispatch({ type: "TICK_RESPOND" }),
        ARRIVAL_MS.echoHold * scale,
      ),
      window.setTimeout(
        () => dispatch({ type: "TICK_INVITE" }),
        (ARRIVAL_MS.echoHold + ARRIVAL_MS.respond + ARRIVAL_MS.invite) * scale,
      ),
    ];
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [state.beat]);

  useEffect(() => {
    if (state.beat !== "walk" || !recommendation) return undefined;
    const reduced = prefersReducedMotion();
    const delay = reduced ? 400 : 1100;
    const timer = window.setTimeout(() => {
      onWalkComplete(recommendation);
      dispatch({ type: "WALK_COMPLETE" });
    }, delay);
    return () => window.clearTimeout(timer);
  }, [state.beat, recommendation, onWalkComplete]);

  const submitReality = useCallback(
    (message: string) => {
      const turn = realityTurnRef.current === "clarify" ? "clarify" : "open";
      const result = processRealityMessage(message, turn);
      lastMessageRef.current = message;
      setTone(result.tone);
      setHospitality(resolveHospitalityResponse(result.tone));

      if (result.needsClarify && turn === "open") {
        setClarifyQuestion(result.clarifyQuestion);
        dispatch({ type: "REALITY_SUBMITTED", needsClarify: true });
        return;
      }

      setClarifyQuestion(null);
      setEcho(result.echo);
      dispatch({ type: "REALITY_CLARIFIED" });
      const rec = resolveArrivalRecommendation({
        message,
        tone: result.tone,
        dayState: result.dayState,
        continueResolution: arrival.continue,
      });
      setRecommendation(rec);
    },
    [arrival.continue],
  );

  const sameAsYesterday = useCallback(() => {
    const dayCache = getDayState();
    const result = sameAsYesterdayEcho(dayCache?.note);
    setTone(result.tone);
    setEcho(result.echo);
    setHospitality(resolveHospitalityResponse(result.tone));
    dispatch({ type: "REALITY_CLARIFIED" });
    const rec = resolveArrivalRecommendation({
      message: cached?.note ?? "",
      tone: result.tone,
      dayState: result.dayState,
      continueResolution: arrival.continue,
    });
    setRecommendation(rec);
  }, [arrival.continue]);

  const acceptRecommendation = useCallback(() => {
    dispatch({ type: "ACCEPT_DOOR" });
  }, []);

  const declineRecommendation = useCallback(() => {
    dispatch({ type: "DECLINE_DOOR" });
  }, []);

  const stayHere = useCallback(() => {
    dispatch({ type: "STAY_HERE" });
  }, []);

  const inviteLine =
    state.beat === "reality" && clarifyQuestion
      ? clarifyQuestion
      : state.beat === "reality"
        ? realityQuestion
        : null;

  return {
    beat: state.beat,
    greeting,
    realityQuestion: inviteLine,
    clarifyQuestion,
    echo,
    recommendation,
    hospitality,
    showGreeting: beatShowsGreeting(state.beat),
    showRealityQuestion: beatShowsRealityQuestion(state.beat),
    showEcho: beatShowsEcho(state.beat) && Boolean(echo),
    showInvite: beatShowsInvite(state.beat) && Boolean(recommendation),
    showInput: beatShowsInput(state.beat),
    communicationAnchorMode: resolveCommunicationAnchorMode(state.beat),
    showSecondaryActions: beatShowsSecondaryActions(state.beat),
    walking: state.beat === "walk",
    submitReality,
    acceptRecommendation,
    declineRecommendation,
    stayHere,
    sameAsYesterday,
  };
}
