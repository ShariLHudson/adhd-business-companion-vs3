/** Welcome Home intro choreography — camera, music, voice, chat reveal. */

/** Wait until the welcome scene has painted before narration / dolly. */
export const WELCOME_HOME_INTRO_SCREEN_READY_MS = 450 as const;

export const WELCOME_HOME_CHAT_REVEAL_DELAY_MS = 2000 as const;

/** Discovery Key — after member settles (post-chat). */
export const WELCOME_HOME_DISCOVERY_KEY_DELAY_MS = 7000 as const;

/** Estate Guide — quietly placed after the Key. */
export const WELCOME_HOME_ESTATE_GUIDE_DELAY_MS = 9500 as const;

/** Fallback dolly length until voice duration is known (~3.5 min letter). */
export const WELCOME_HOME_FALLBACK_DOLLY_MS = 210_000 as const;

/** Minimum camera walk when narration is very short. */
export const WELCOME_HOME_MIN_DOLLY_MS = 45_000 as const;
