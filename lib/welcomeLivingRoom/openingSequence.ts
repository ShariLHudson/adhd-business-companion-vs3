/** Opening choreography — the room notices you arrive. */
export type WelcomeLivingPhase =
  | "still"
  | "candle"
  | "sunlight"
  | "greeting"
  | "invite"
  | "input"
  | "alive";

export const WELCOME_OPENING_MS = {
  candle: 300,
  sunlight: 700,
  greeting: 1000,
  invite: 1300,
  input: 1600,
} as const;

export const WELCOME_TYPING_FLICKER_DELAY_MS = 1000;
export const WELCOME_TYPING_FLICKER_DURATION_MS = 520;

export function welcomeOpeningSchedule(
  reducedMotion: boolean,
): Array<{ phase: WelcomeLivingPhase; at: number }> {
  if (reducedMotion) {
    return [{ phase: "alive", at: 0 }];
  }
  return [
    { phase: "still", at: 0 },
    { phase: "candle", at: WELCOME_OPENING_MS.candle },
    { phase: "sunlight", at: WELCOME_OPENING_MS.sunlight },
    { phase: "greeting", at: WELCOME_OPENING_MS.greeting },
    { phase: "invite", at: WELCOME_OPENING_MS.invite },
    { phase: "input", at: WELCOME_OPENING_MS.input },
    { phase: "alive", at: WELCOME_OPENING_MS.input + 400 },
  ];
}

export function phaseShowsGreeting(phase: WelcomeLivingPhase): boolean {
  return (
    phase === "greeting" ||
    phase === "invite" ||
    phase === "input" ||
    phase === "alive"
  );
}

export function phaseShowsInvite(phase: WelcomeLivingPhase): boolean {
  return phase === "invite" || phase === "input" || phase === "alive";
}

export function phaseShowsInput(phase: WelcomeLivingPhase): boolean {
  return phase === "input" || phase === "alive";
}
