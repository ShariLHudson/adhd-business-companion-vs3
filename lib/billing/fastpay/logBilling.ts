/**
 * Billing logs — non-sensitive identifiers only. Never log secrets or raw PII payloads.
 */

export type BillingLogContext = {
  surface: string;
  eventId?: string | null;
  paymentProviderRef?: string | null;
  userId?: string | null;
  plan?: string | null;
  code?: string | null;
  detail?: string | null;
};

export function logBillingEvent(
  level: "info" | "warn" | "error",
  message: string,
  context: BillingLogContext,
): void {
  const payload = {
    channel: "billing-fastpay",
    message,
    surface: context.surface,
    eventId: context.eventId ?? null,
    paymentProviderRef: context.paymentProviderRef ?? null,
    userId: context.userId ?? null,
    plan: context.plan ?? null,
    code: context.code ?? null,
    detail: context.detail ?? null,
  };
  if (level === "error") {
    console.error("[billing]", payload);
    return;
  }
  if (level === "warn") {
    console.warn("[billing]", payload);
    return;
  }
  console.info("[billing]", payload);
}
