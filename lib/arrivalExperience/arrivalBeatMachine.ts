import type { ArrivalBeat, ArrivalExperienceConfig } from "./types";

export type ArrivalBeatState = {
  beat: ArrivalBeat;
  realityTurn: "open" | "clarify" | "done";
  skipReality: boolean;
};

export type ArrivalBeatAction =
  | { type: "TICK_GREET" }
  | { type: "TICK_SIT" }
  | { type: "TICK_REALITY" }
  | { type: "REALITY_SUBMITTED"; needsClarify: boolean }
  | { type: "REALITY_CLARIFIED" }
  | { type: "ECHO_SHOWN" }
  | { type: "TICK_RESPOND" }
  | { type: "TICK_INVITE" }
  | { type: "ACCEPT_DOOR" }
  | { type: "DECLINE_DOOR" }
  | { type: "STAY_HERE" }
  | { type: "WALK_COMPLETE" }
  | { type: "SKIP_TO_INVITE" };

export function initialArrivalBeatState(
  config: ArrivalExperienceConfig,
): ArrivalBeatState {
  const skipReality =
    config.hasCachedReality &&
    config.realityFreshToday &&
    config.homeState !== "FIRST_VISIT";

  return {
    beat: "settle",
    realityTurn: "open",
    skipReality,
  };
}

export function reduceArrivalBeat(
  state: ArrivalBeatState,
  action: ArrivalBeatAction,
): ArrivalBeatState {
  switch (action.type) {
    case "TICK_GREET":
      if (state.beat === "settle") return { ...state, beat: "greet" };
      return state;
    case "TICK_SIT":
      if (state.beat === "greet") return { ...state, beat: "sit" };
      return state;
    case "TICK_REALITY":
      if (state.skipReality && (state.beat === "greet" || state.beat === "sit")) {
        return { ...state, beat: "respond" };
      }
      if (state.beat === "sit" || state.beat === "greet") {
        return { ...state, beat: "reality" };
      }
      return state;
    case "SKIP_TO_INVITE":
      return { ...state, beat: "respond", realityTurn: "done" };
    case "REALITY_SUBMITTED":
      if (action.needsClarify) {
        return { ...state, beat: "reality", realityTurn: "clarify" };
      }
      return { ...state, beat: "echo", realityTurn: "done" };
    case "REALITY_CLARIFIED":
      return { ...state, beat: "echo", realityTurn: "done" };
    case "ECHO_SHOWN":
      if (state.beat === "echo") return { ...state, beat: "respond" };
      return state;
    case "TICK_RESPOND":
      if (state.beat === "respond" || state.beat === "echo") {
        return { ...state, beat: "invite" };
      }
      return state;
    case "TICK_INVITE":
      if (state.beat === "respond") return { ...state, beat: "invite" };
      return state;
    case "ACCEPT_DOOR":
      return { ...state, beat: "walk" };
    case "DECLINE_DOOR":
    case "STAY_HERE":
      return { ...state, beat: "staying" };
    case "WALK_COMPLETE":
      return { ...state, beat: "complete" };
    default:
      return state;
  }
}

export function beatShowsGreeting(beat: ArrivalBeat): boolean {
  return beat !== "settle";
}

export function beatShowsRealityQuestion(beat: ArrivalBeat): boolean {
  return beat === "reality";
}

export function beatShowsEcho(beat: ArrivalBeat): boolean {
  return beat === "echo" || beat === "respond" || beat === "invite" || beat === "walk";
}

export function beatShowsInvite(beat: ArrivalBeat): boolean {
  return beat === "invite";
}

export function beatShowsInput(beat: ArrivalBeat): boolean {
  return beat === "reality" || beat === "staying";
}

export function beatShowsSecondaryActions(beat: ArrivalBeat): boolean {
  return beat === "invite";
}
