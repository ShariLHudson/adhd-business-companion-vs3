/**
 * 126 — First-Time Welcome Experience constitutional contract.
 * Encodes the product rule for certification and call sites.
 */

export const FIRST_TIME_WELCOME_STANDARD_ID =
  "126_FIRST_TIME_WELCOME_EXPERIENCE_STANDARD" as const;

/** Skip permanently counts as completion for automatic display. */
export const WELCOME_SKIP_COUNTS_AS_COMPLETION = true as const;

/** Manual replay must never clear account completion. */
export const WELCOME_MANUAL_REPLAY_MUST_NOT_RESET_COMPLETION = true as const;

export type FirstTimeWelcomeCertificationItem = {
  id: string;
  requirement: string;
};

/**
 * Certification checklist from 126 — verify before release / after regressions.
 */
export const FIRST_TIME_WELCOME_CERTIFICATION_CHECKLIST: readonly FirstTimeWelcomeCertificationItem[] =
  [
    {
      id: "once_for_new_user",
      requirement:
        "The Welcome Experience automatically appears exactly once for every new user.",
    },
    {
      id: "skip_suppresses",
      requirement:
        "Skipping permanently suppresses future automatic playback.",
    },
    {
      id: "complete_suppresses",
      requirement:
        "Completing playback permanently suppresses future automatic playback.",
    },
    {
      id: "returning_direct",
      requirement:
        "Returning users are taken directly into Spark Estate.",
    },
    {
      id: "replay_explicit_only",
      requirement:
        "The Welcome Experience can only be replayed through an explicit user action.",
    },
    {
      id: "sync_devices",
      requirement:
        "Completion status synchronizes across supported devices.",
    },
    {
      id: "no_replay_on_updates",
      requirement:
        "Platform updates and new versions never trigger automatic replay.",
    },
    {
      id: "no_regression_reappear",
      requirement:
        "No regression allows the Welcome Experience to reappear after the initial completion or skip.",
    },
  ] as const;

export type WelcomeExperienceDisposition = "completed" | "skipped";

export function resolveWelcomeDisposition(input: {
  skipped: boolean;
}): WelcomeExperienceDisposition {
  return input.skipped ? "skipped" : "completed";
}

/** True when automatic display must be suppressed. */
export function shouldSuppressAutomaticWelcome(input: {
  welcomeCompletedAt: string | null | undefined;
}): boolean {
  return Boolean(input.welcomeCompletedAt?.trim());
}
