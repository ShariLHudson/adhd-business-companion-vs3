import { buildShariErrorRecoveryResponse } from "@/lib/conversation/shariCompanionEngine";
import { buildRuntimeRecoveryResponse } from "@/lib/sparkConversation/coachingFallback";
import { isTechnicalFetchErrorMessage } from "@/lib/safeJsonResponse";
import { sanitizeEstateFacingCopy } from "./estateContextIsolation";
import type {
  CompanionFailureContext,
  CompanionFailureSurface,
  RoutedCompanionFailure,
} from "./types";

/** System/debug channel — never shown as Shari. Dev console only. */
export function logCompanionSystemFailure(
  err: unknown,
  context: CompanionFailureContext,
): void {
  if (process.env.NODE_ENV === "production") return;
  const detail =
    err instanceof Error ? err.message : typeof err === "string" ? err : "unknown";
  const stack = err instanceof Error ? err.stack : undefined;
  console.warn("[companion-system]", {
    surface: context.surface,
    detail,
    stack,
    technical: isTechnicalFetchErrorMessage(detail),
    userPreview: context.userText?.slice(0, 120) ?? null,
  });
}

function estateMessageForSurface(
  surface: CompanionFailureSurface,
  userText?: string,
): string {
  if (surface === "fresh-start") {
    return buildShariErrorRecoveryResponse(
      "Want to start fresh together? We can try again whenever you're ready.",
    );
  }
  if (surface === "workspace-load") {
    return buildShariErrorRecoveryResponse(
      "Give this page one more breath — then we can pick up where you left off.",
    );
  }
  if (surface === "workspace-action") {
    return buildShariErrorRecoveryResponse(
      "That didn't land just now. We can try again, or keep talking.",
    );
  }
  const trimmed = userText?.trim() ?? "";
  if (trimmed) {
    return buildRuntimeRecoveryResponse({ userText: trimmed });
  }
  return buildShariErrorRecoveryResponse();
}

function shouldSpeakOnEstateChannel(context: CompanionFailureContext): boolean {
  switch (context.surface) {
    case "fresh-start":
    case "workspace-load":
    case "workspace-action":
      return true;
    case "chat":
      return Boolean(context.userText?.trim());
    default: {
      const _exhaustive: never = context.surface;
      return _exhaustive;
    }
  }
}

/**
 * Route a failure to the correct channel.
 * Technical detail → system log only. Estate speaks only in Shari voice when needed.
 */
export function routeCompanionFailure(
  err: unknown,
  context: CompanionFailureContext,
): RoutedCompanionFailure {
  logCompanionSystemFailure(err, context);
  if (!shouldSpeakOnEstateChannel(context)) {
    return { channel: "silent" };
  }
  return {
    channel: "estate",
    message: sanitizeEstateFacingCopy(
      estateMessageForSurface(context.surface, context.userText),
    ),
  };
}

/** Estate copy for workspace shell load — never raw fetch/build text. */
export const ESTATE_WORKSPACE_LOAD_RECOVERY = sanitizeEstateFacingCopy(
  buildShariErrorRecoveryResponse(
    "Give this one more moment, then we can continue.",
  ),
);
