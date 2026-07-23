/**
 * Normalize FastPay (and FastPayDirect-shaped) webhook JSON into one event model.
 */

import type {
  FastPayWebhookEventType,
  NormalizedFastPayEvent,
  VoiceEntitlementLifecycleStatus,
} from "./types";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const t = value.trim();
  return t ? t : null;
}

function collectStrings(...values: unknown[]): string[] {
  const out: string[] = [];
  for (const v of values) {
    if (typeof v === "string" && v.trim()) out.push(v.trim());
    if (Array.isArray(v)) {
      for (const item of v) {
        if (typeof item === "string" && item.trim()) out.push(item.trim());
      }
    }
  }
  return out;
}

function mapEventType(raw: string | null): FastPayWebhookEventType {
  const t = (raw ?? "").toLowerCase();
  if (t === "payment.created" || t === "payment_created") return "payment.created";
  if (
    t === "payment.completed" ||
    t === "payment_completed" ||
    t === "payment.captured" ||
    t === "order.paid" ||
    t === "invoice.paid"
  ) {
    return "payment.completed";
  }
  if (t === "payment.failed" || t === "payment_failed") return "payment.failed";
  if (t === "payment.expired" || t === "payment_expired") return "payment.expired";
  if (t === "subscription.active" || t === "subscription_active") {
    return "subscription.active";
  }
  if (
    t === "subscription.canceled" ||
    t === "subscription.cancelled" ||
    t === "subscription_canceled"
  ) {
    return "subscription.canceled";
  }
  if (t === "subscription.expired" || t === "subscription_expired") {
    return "subscription.expired";
  }
  if (t === "subscription.updated" || t === "subscription_updated") {
    return "subscription.updated";
  }
  return "unknown";
}

function lifecycleFromEvent(
  eventType: FastPayWebhookEventType,
  providerStatus: string | null,
): VoiceEntitlementLifecycleStatus {
  const status = (providerStatus ?? "").toLowerCase();
  if (
    status === "pending" ||
    status === "processing" ||
    eventType === "payment.created"
  ) {
    return "pending";
  }
  if (
    status === "canceled" ||
    status === "cancelled" ||
    eventType === "subscription.canceled"
  ) {
    return "canceled";
  }
  if (status === "expired" || eventType === "payment.expired" || eventType === "subscription.expired") {
    return "expired";
  }
  if (
    status === "completed" ||
    status === "succeeded" ||
    status === "paid" ||
    status === "active" ||
    eventType === "payment.completed" ||
    eventType === "subscription.active"
  ) {
    return "active";
  }
  if (eventType === "payment.failed") return "unknown";
  return "unknown";
}

/**
 * Parse JSON webhook body. Throws nothing — returns null when unusable.
 */
export function parseFastPayWebhookEvent(
  body: unknown,
): NormalizedFastPayEvent | null {
  const root = asRecord(body);
  if (!root) return null;

  const data =
    asRecord(root.data) ??
    asRecord(root.payment) ??
    asRecord(root.chargeSnapshot) ??
    root;

  const metadata =
    asRecord(data.metadata) ??
    asRecord(root.metadata) ??
    asRecord(asRecord(data.customer)?.metadata) ??
    {};

  const customer =
    asRecord(data.customer) ??
    asRecord(root.customer) ??
    asRecord(root.contact) ??
    {};

  const eventType = mapEventType(
    asString(root.type) ?? asString(root.event) ?? asString(root.event_type),
  );

  const eventId =
    asString(root.id) ??
    asString(root.event_id) ??
    asString(root.eventId) ??
    asString(data.id) ??
    asString(root.ghlTransactionId) ??
    null;
  if (!eventId) return null;

  const paymentProviderRef =
    asString(data.id) ??
    asString(root.chargeId) ??
    asString(root.ghlTransactionId) ??
    asString(root.transaction_id) ??
    asString(root.transactionId) ??
    asString(data.transaction_id) ??
    eventId;

  const providerStatus =
    asString(data.status) ??
    asString(root.status) ??
    asString(asRecord(root.chargeSnapshot)?.status);

  const productCandidates = collectStrings(
    data.product_id,
    data.productId,
    data.payment_link_id,
    data.paymentLinkId,
    data.price_id,
    data.priceId,
    metadata.product_id,
    metadata.productId,
    metadata.payment_link_id,
    metadata.paymentLinkId,
    metadata.plan,
    metadata.voice_plan,
    metadata.voicePlan,
    root.product_id,
    root.productId,
    asRecord(data.productDetails)?.productId,
    asRecord(data.productDetails)?.priceId,
    asString(data.description),
    asString(root.description),
  );

  const customerEmail =
    asString(customer.email) ??
    asString(root.email) ??
    asString(metadata.email) ??
    asString(metadata.customer_email);

  const sparkUserId =
    asString(metadata.spark_user_id) ??
    asString(metadata.sparkUserId) ??
    asString(metadata.user_id) ??
    asString(metadata.userId) ??
    asString(root.spark_user_id) ??
    asString(root.sparkUserId);

  const subscriptionId =
    asString(data.subscription_id) ??
    asString(data.subscriptionId) ??
    asString(root.subscription_id) ??
    asString(root.subscriptionId);

  const occurredAt =
    asString(root.created_at) ??
    asString(root.createdAt) ??
    asString(data.created_at) ??
    new Date().toISOString();

  return {
    eventId,
    eventType,
    paymentProviderRef,
    subscriptionId,
    providerStatus,
    lifecycleStatus: lifecycleFromEvent(eventType, providerStatus),
    productCandidates,
    customerEmail: customerEmail ? customerEmail.toLowerCase() : null,
    sparkUserId,
    occurredAt,
  };
}
