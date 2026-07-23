/**
 * End-to-end FastPay webhook processing after raw body + signature header arrive.
 */

import { applyVerifiedVoiceEntitlementEvent } from "./applyVoiceEntitlement";
import { logBillingEvent } from "./logBilling";
import { parseFastPayWebhookEvent } from "./parseWebhookEvent";
import { verifyFastPaySignature } from "./verifySignature";
import type { ApplyEntitlementResult } from "./types";

export type ProcessFastPayWebhookResult = ApplyEntitlementResult & {
  httpStatus: number;
};

export async function processFastPayWebhook(args: {
  rawBody: string;
  signatureHeader: string | null;
}): Promise<ProcessFastPayWebhookResult> {
  if (!verifyFastPaySignature(args.rawBody, args.signatureHeader)) {
    logBillingEvent("warn", "Rejected FastPay webhook — invalid signature", {
      surface: "webhook",
      code: "invalid_signature",
    });
    return {
      ok: false,
      code: "invalid_signature",
      reason: "Invalid webhook signature.",
      preserveEntitlement: true,
      httpStatus: 401,
    };
  }

  let json: unknown;
  try {
    json = JSON.parse(args.rawBody) as unknown;
  } catch {
    logBillingEvent("warn", "Rejected FastPay webhook — malformed JSON", {
      surface: "webhook",
      code: "malformed",
    });
    return {
      ok: false,
      code: "malformed",
      reason: "Malformed webhook body.",
      preserveEntitlement: true,
      httpStatus: 400,
    };
  }

  const event = parseFastPayWebhookEvent(json);
  if (!event) {
    logBillingEvent("warn", "Rejected FastPay webhook — unusable payload", {
      surface: "webhook",
      code: "malformed",
    });
    return {
      ok: false,
      code: "malformed",
      reason: "Webhook payload missing required identifiers.",
      preserveEntitlement: true,
      httpStatus: 400,
    };
  }

  const result = await applyVerifiedVoiceEntitlementEvent(event);
  if (!result.ok) {
    // Acknowledge unknown product / user mismatch with 200 so the provider
    // does not endlessly retry; entitlement remains unchanged.
    return {
      ...result,
      httpStatus:
        result.code === "store_error"
          ? 500
          : result.code === "unknown_product" ||
              result.code === "user_match_failed"
            ? 200
            : 400,
    };
  }

  return { ...result, httpStatus: 200 };
}
