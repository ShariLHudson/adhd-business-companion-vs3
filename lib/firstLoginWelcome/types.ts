/**
 * First-login Shari welcome — account-level gate before Estate use.
 * Constitutional rule: 126 First-Time Welcome Experience Standard.
 */

import type { WelcomeExperienceDisposition } from "./welcomeExperienceConstitution";

export type FirstLoginWelcomeState =
  | "checking"
  | "not_required"
  | "ready"
  | "audio_blocked"
  | "playing"
  | "muted"
  | "stopped"
  | "completed"
  | "error";

export type FirstLoginWelcomeRecord = {
  /** ISO timestamp when the member entered the Estate after welcome (complete or skip). */
  welcomeCompletedAt: string | null;
  /** ISO timestamp when welcome audio started, or was deliberately skipped/stopped. */
  welcomeAudioPlayedAt: string | null;
  /** How the member finished the gate — skip still suppresses automatic replay (126). */
  welcomeDisposition?: WelcomeExperienceDisposition | null;
  /** App / platform version shown during the first Welcome Experience. */
  welcomePlatformVersion?: string | null;
};

export type MarkWelcomeCompletedOptions = {
  /** When true, records disposition as skipped (still suppresses automatic replay). */
  skipped?: boolean;
  /** Platform version string shown during this Welcome Experience. */
  platformVersion?: string | null;
  at?: string;
};

export const FIRST_LOGIN_WELCOME_TITLE = "Welcome to Your Spark Estate" as const;

export const FIRST_LOGIN_WELCOME_MESSAGE =
  "Welcome. I'm Shari, and I'll be here to help you find your way, think things through, and move forward without pressure.\n\nYou do not need to learn everything today. We can begin with whatever would help you most right now." as const;

export const FIRST_LOGIN_WELCOME_PRIMARY = "Continue to Welcome Home" as const;
export const FIRST_LOGIN_WELCOME_STOP = "Stop & Continue" as const;
export const FIRST_LOGIN_WELCOME_SKIP_AUDIO = "Continue without audio" as const;
export const FIRST_LOGIN_WELCOME_SECONDARY = "Tell Me How This Works" as const;

export const FIRST_LOGIN_HOW_THIS_WORKS =
  "Spark Estate is a calm place to think and work with me beside you. We'll start at Welcome Home. You can explore when you're ready — nothing here demands a tour first." as const;
