/**
 * Post-login companion-led routing — resume meaningful work, not last page visited.
 */

import {
  resolveCompanionContinue,
  type CompanionContinueOption,
  type CompanionContinueResolution,
} from "./companionLedContinue";

const SESSION_KEY = "companion-post-login-continue-v1";

export type PostLoginContinueIntent = {
  action: "resume";
  option: CompanionContinueOption;
};

export function buildPostLoginContinueResolution(): CompanionContinueResolution {
  return resolveCompanionContinue();
}

/** Store auto-resume intent when exactly one meaningful activity exists. */
export function storePostLoginContinueFromResolution(
  resolution: CompanionContinueResolution,
): void {
  if (typeof sessionStorage === "undefined") return;
  if (resolution.mode !== "single") {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
    return;
  }
  try {
    const payload: PostLoginContinueIntent = {
      action: "resume",
      option: resolution.option,
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
  } catch {
    /* quota */
  }
}

export function peekPostLoginContinue(): PostLoginContinueIntent | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PostLoginContinueIntent;
    if (parsed?.action === "resume" && parsed.option?.id) {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function consumePostLoginContinue(): PostLoginContinueIntent | null {
  const intent = peekPostLoginContinue();
  if (!intent) return null;
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
  return intent;
}
