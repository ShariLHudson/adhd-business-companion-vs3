import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyVerifiedVoiceEntitlementEvent,
  computeFastPaySignature,
  createMemoryVoiceEntitlementStore,
  parseFastPayWebhookEvent,
  processFastPayWebhook,
  publicViewFromRecord,
  setVoiceEntitlementStoreForTests,
  verifyFastPaySignature,
} from "@/lib/billing/fastpay";
import type { NormalizedFastPayEvent } from "@/lib/billing/fastpay/types";

const SECRET = "whsec_test_voice_billing";
const LITE_ID = "69ff6b3034d67b041e7e886e";
const PRO_ID = "69ff6b81c43a7488828c26be";

function completedEvent(
  overrides: Partial<NormalizedFastPayEvent> &
    Pick<NormalizedFastPayEvent, "eventId" | "productCandidates">,
): NormalizedFastPayEvent {
  return {
    eventId: overrides.eventId,
    eventType: "payment.completed",
    paymentProviderRef: overrides.paymentProviderRef ?? `pay_${overrides.eventId}`,
    subscriptionId: overrides.subscriptionId ?? null,
    providerStatus: "completed",
    lifecycleStatus: "active",
    productCandidates: overrides.productCandidates,
    customerEmail: overrides.customerEmail ?? "member@example.com",
    sparkUserId: overrides.sparkUserId ?? "user-1",
    occurredAt: overrides.occurredAt ?? "2026-07-23T12:00:00.000Z",
  };
}

beforeEach(() => {
  process.env.FASTPAY_WEBHOOK_SECRET = SECRET;
  process.env.FASTPAY_VOICE_LITE_PRODUCT_IDS = LITE_ID;
  process.env.FASTPAY_VOICE_PRO_PRODUCT_IDS = PRO_ID;
  setVoiceEntitlementStoreForTests(createMemoryVoiceEntitlementStore());
});

afterEach(() => {
  setVoiceEntitlementStoreForTests(null);
  vi.unstubAllEnvs();
});

describe("FastPay signature verification", () => {
  it("accepts a valid HMAC signature", () => {
    const body = '{"id":"evt_1"}';
    const sig = computeFastPaySignature(body, SECRET);
    expect(verifyFastPaySignature(body, sig, SECRET)).toBe(true);
    expect(verifyFastPaySignature(body, `sha256=${sig}`, SECRET)).toBe(true);
  });

  it("rejects an invalid signature", () => {
    const body = '{"id":"evt_1"}';
    expect(verifyFastPaySignature(body, "deadbeef", SECRET)).toBe(false);
    expect(verifyFastPaySignature(body, null, SECRET)).toBe(false);
  });
});

describe("applyVerifiedVoiceEntitlementEvent", () => {
  it("activates Voice Lite from a verified payment", async () => {
    const result = await applyVerifiedVoiceEntitlementEvent(
      completedEvent({
        eventId: "evt_lite_1",
        productCandidates: [LITE_ID],
      }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.applied).toBe(true);
    expect(result.record?.plan).toBe("voice-lite");
    expect(result.record?.entitlementStatus).toBe("active");
    expect(result.record?.verifiedAt).toBeTruthy();
    expect(result.record?.paymentProviderRef).toBeTruthy();
    expect(publicViewFromRecord(result.record).plan).toBe("voice-lite");
  });

  it("activates Voice Pro from a verified payment", async () => {
    const result = await applyVerifiedVoiceEntitlementEvent(
      completedEvent({
        eventId: "evt_pro_1",
        productCandidates: [PRO_ID],
        sparkUserId: "user-pro",
      }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.record?.plan).toBe("voice-pro");
    expect(publicViewFromRecord(result.record).plan).toBe("voice-pro");
  });

  it("handles duplicate events without changing state inconsistently", async () => {
    const event = completedEvent({
      eventId: "evt_dup",
      productCandidates: [LITE_ID],
    });
    const first = await applyVerifiedVoiceEntitlementEvent(event);
    const second = await applyVerifiedVoiceEntitlementEvent(event);
    expect(first.ok && first.applied).toBe(true);
    expect(second.ok && second.duplicate).toBe(true);
    expect(second.ok && second.applied).toBe(false);
    if (first.ok && second.ok) {
      expect(second.record?.plan).toBe(first.record?.plan);
      expect(second.record?.paymentProviderRef).toBe(
        first.record?.paymentProviderRef,
      );
    }
  });

  it("rejects unknown products and preserves entitlement", async () => {
    const store = createMemoryVoiceEntitlementStore({
      entitlements: [
        {
          userId: "user-1",
          email: "member@example.com",
          plan: "essential",
          entitlementStatus: "active",
          subscriptionStatus: null,
          verifiedAt: null,
          paymentProviderRef: null,
          subscriptionId: null,
          productId: null,
          updatedAt: "2026-07-23T11:00:00.000Z",
          lastEventId: null,
        },
      ],
    });
    setVoiceEntitlementStoreForTests(store);

    const result = await applyVerifiedVoiceEntitlementEvent(
      completedEvent({
        eventId: "evt_unknown",
        productCandidates: ["not-a-voice-product"],
      }),
      { store },
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("unknown_product");
    expect(result.preserveEntitlement).toBe(true);
    const kept = await store.getByUserId("user-1");
    expect(kept?.plan).toBe("essential");
  });

  it("keeps current entitlement unchanged when user matching fails", async () => {
    const store = createMemoryVoiceEntitlementStore({
      entitlements: [
        {
          userId: "user-keep",
          email: "keep@example.com",
          plan: "voice-lite",
          entitlementStatus: "active",
          subscriptionStatus: "active",
          verifiedAt: "2026-07-20T00:00:00.000Z",
          paymentProviderRef: "pay_old",
          subscriptionId: null,
          productId: LITE_ID,
          updatedAt: "2026-07-20T00:00:00.000Z",
          lastEventId: "evt_old",
        },
      ],
    });
    setVoiceEntitlementStoreForTests(store);

    const result = await applyVerifiedVoiceEntitlementEvent(
      completedEvent({
        eventId: "evt_nomatch",
        productCandidates: [PRO_ID],
        sparkUserId: null,
        customerEmail: "unknown@example.com",
      }),
      {
        store,
        resolveUser: async () => ({
          ok: false,
          reason: "No Spark Estate user matched the payment email.",
        }),
      },
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("user_match_failed");
    const kept = await store.getByUserId("user-keep");
    expect(kept?.plan).toBe("voice-lite");
  });

  it("records pending without unlocking paid capabilities", async () => {
    const result = await applyVerifiedVoiceEntitlementEvent({
      ...completedEvent({
        eventId: "evt_pending",
        productCandidates: [LITE_ID],
      }),
      eventType: "payment.created",
      lifecycleStatus: "pending",
      providerStatus: "pending",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.record?.plan).toBe("essential");
    expect(result.record?.subscriptionStatus).toBe("pending");
    expect(publicViewFromRecord(result.record).plan).toBe("essential");
  });

  it("moves canceled subscriptions to Essential fallback", async () => {
    const store = createMemoryVoiceEntitlementStore({
      entitlements: [
        {
          userId: "user-1",
          email: "member@example.com",
          plan: "voice-pro",
          entitlementStatus: "active",
          subscriptionStatus: "active",
          verifiedAt: "2026-07-01T00:00:00.000Z",
          paymentProviderRef: "pay_pro",
          subscriptionId: "sub_1",
          productId: PRO_ID,
          updatedAt: "2026-07-01T00:00:00.000Z",
          lastEventId: "evt_pro_old",
        },
      ],
    });
    setVoiceEntitlementStoreForTests(store);

    const result = await applyVerifiedVoiceEntitlementEvent(
      {
        ...completedEvent({
          eventId: "evt_cancel",
          productCandidates: [PRO_ID],
          subscriptionId: "sub_1",
        }),
        eventType: "subscription.canceled",
        lifecycleStatus: "canceled",
        providerStatus: "canceled",
      },
      { store },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.record?.plan).toBe("essential");
    expect(result.record?.entitlementStatus).toBe("canceled");
    expect(publicViewFromRecord(result.record).plan).toBe("essential");
  });

  it("moves expired subscriptions to Essential fallback", async () => {
    await applyVerifiedVoiceEntitlementEvent(
      completedEvent({
        eventId: "evt_lite_before_expire",
        productCandidates: [LITE_ID],
      }),
    );
    const expired = await applyVerifiedVoiceEntitlementEvent({
      ...completedEvent({
        eventId: "evt_expired_2",
        productCandidates: [LITE_ID],
      }),
      eventType: "payment.expired",
      lifecycleStatus: "expired",
      providerStatus: "expired",
    });
    expect(expired.ok).toBe(true);
    if (!expired.ok) return;
    expect(expired.record?.plan).toBe("essential");
    expect(expired.record?.entitlementStatus).toBe("expired");
  });
});

describe("processFastPayWebhook", () => {
  it("rejects invalid signatures without mutating entitlement", async () => {
    const body = JSON.stringify({
      id: "evt_bad_sig",
      type: "payment.completed",
      data: {
        id: "pay_bad",
        status: "completed",
        metadata: {
          product_id: LITE_ID,
          spark_user_id: "user-1",
        },
      },
    });
    const result = await processFastPayWebhook({
      rawBody: body,
      signatureHeader: "invalid",
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("invalid_signature");
    expect(result.httpStatus).toBe(401);
  });

  it("activates Lite through the verified webhook path", async () => {
    const body = JSON.stringify({
      id: "evt_wh_lite",
      type: "payment.completed",
      created_at: "2026-07-23T12:00:00.000Z",
      data: {
        id: "pay_wh_lite",
        status: "completed",
        metadata: {
          product_id: LITE_ID,
          spark_user_id: "user-wh",
        },
      },
    });
    const sig = computeFastPaySignature(body, SECRET);
    const result = await processFastPayWebhook({
      rawBody: body,
      signatureHeader: sig,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.applied).toBe(true);
    expect(result.record?.plan).toBe("voice-lite");
  });
});

describe("parseFastPayWebhookEvent", () => {
  it("parses payment.completed payloads", () => {
    const event = parseFastPayWebhookEvent({
      id: "evt_parse",
      type: "payment.completed",
      data: {
        id: "pay_parse",
        status: "completed",
        metadata: { product_id: LITE_ID, email: "a@b.com" },
      },
    });
    expect(event?.lifecycleStatus).toBe("active");
    expect(event?.productCandidates).toContain(LITE_ID);
    expect(event?.customerEmail).toBe("a@b.com");
  });
});
