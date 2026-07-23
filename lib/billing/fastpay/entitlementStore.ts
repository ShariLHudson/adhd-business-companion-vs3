/**
 * Durable Voice plan entitlement + webhook idempotency store.
 * Uses Supabase when service role is configured; otherwise in-memory (tests / local).
 */

import { getFounderSupabaseAdmin } from "@/lib/supabase/founderServer";
import type { VoicePlanEntitlementRecord } from "./types";

export type ProcessedWebhookEvent = {
  eventId: string;
  paymentProviderRef: string;
  processedAt: string;
  userId: string | null;
  outcome: string;
};

export type VoiceEntitlementStore = {
  getByUserId(userId: string): Promise<VoicePlanEntitlementRecord | null>;
  upsert(record: VoicePlanEntitlementRecord): Promise<void>;
  getProcessedEvent(eventId: string): Promise<ProcessedWebhookEvent | null>;
  markProcessed(event: ProcessedWebhookEvent): Promise<void>;
};

const memoryEntitlements = new Map<string, VoicePlanEntitlementRecord>();
const memoryEvents = new Map<string, ProcessedWebhookEvent>();

export function createMemoryVoiceEntitlementStore(
  seed?: {
    entitlements?: VoicePlanEntitlementRecord[];
    events?: ProcessedWebhookEvent[];
  },
): VoiceEntitlementStore {
  const entitlements = new Map(
    (seed?.entitlements ?? []).map((r) => [r.userId, r]),
  );
  const events = new Map((seed?.events ?? []).map((e) => [e.eventId, e]));
  return {
    async getByUserId(userId) {
      return entitlements.get(userId) ?? null;
    },
    async upsert(record) {
      entitlements.set(record.userId, record);
    },
    async getProcessedEvent(eventId) {
      return events.get(eventId) ?? null;
    },
    async markProcessed(event) {
      events.set(event.eventId, event);
    },
  };
}

/** Shared process memory — used when Supabase admin is unavailable. */
export const globalMemoryVoiceEntitlementStore: VoiceEntitlementStore = {
  async getByUserId(userId) {
    return memoryEntitlements.get(userId) ?? null;
  },
  async upsert(record) {
    memoryEntitlements.set(record.userId, record);
  },
  async getProcessedEvent(eventId) {
    return memoryEvents.get(eventId) ?? null;
  },
  async markProcessed(event) {
    memoryEvents.set(event.eventId, event);
  },
};

export function resetMemoryVoiceEntitlementStoreForTests(): void {
  memoryEntitlements.clear();
  memoryEvents.clear();
}

function rowToRecord(row: Record<string, unknown>): VoicePlanEntitlementRecord {
  return {
    userId: String(row.user_id),
    email: row.email == null ? null : String(row.email),
    plan: row.plan as VoicePlanEntitlementRecord["plan"],
    entitlementStatus:
      row.entitlement_status as VoicePlanEntitlementRecord["entitlementStatus"],
    subscriptionStatus:
      row.subscription_status == null
        ? null
        : (row.subscription_status as VoicePlanEntitlementRecord["subscriptionStatus"]),
    verifiedAt: row.verified_at == null ? null : String(row.verified_at),
    paymentProviderRef:
      row.payment_provider_ref == null
        ? null
        : String(row.payment_provider_ref),
    subscriptionId:
      row.subscription_id == null ? null : String(row.subscription_id),
    productId: row.product_id == null ? null : String(row.product_id),
    updatedAt: String(row.updated_at),
    lastEventId: row.last_event_id == null ? null : String(row.last_event_id),
  };
}

export function createSupabaseVoiceEntitlementStore(): VoiceEntitlementStore | null {
  const admin = getFounderSupabaseAdmin();
  if (!admin) return null;

  return {
    async getByUserId(userId) {
      const { data, error } = await admin
        .from("voice_plan_entitlements")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (error || !data) return null;
      return rowToRecord(data as Record<string, unknown>);
    },
    async upsert(record) {
      const { error } = await admin.from("voice_plan_entitlements").upsert(
        {
          user_id: record.userId,
          email: record.email,
          plan: record.plan,
          entitlement_status: record.entitlementStatus,
          subscription_status: record.subscriptionStatus,
          verified_at: record.verifiedAt,
          payment_provider_ref: record.paymentProviderRef,
          subscription_id: record.subscriptionId,
          product_id: record.productId,
          updated_at: record.updatedAt,
          last_event_id: record.lastEventId,
        },
        { onConflict: "user_id" },
      );
      if (error) throw new Error(error.message);
    },
    async getProcessedEvent(eventId) {
      const { data, error } = await admin
        .from("voice_plan_webhook_events")
        .select("*")
        .eq("event_id", eventId)
        .maybeSingle();
      if (error || !data) return null;
      const row = data as Record<string, unknown>;
      return {
        eventId: String(row.event_id),
        paymentProviderRef: String(row.payment_provider_ref ?? ""),
        processedAt: String(row.processed_at),
        userId: row.user_id == null ? null : String(row.user_id),
        outcome: String(row.outcome ?? ""),
      };
    },
    async markProcessed(event) {
      const { error } = await admin.from("voice_plan_webhook_events").upsert(
        {
          event_id: event.eventId,
          payment_provider_ref: event.paymentProviderRef,
          processed_at: event.processedAt,
          user_id: event.userId,
          outcome: event.outcome,
        },
        { onConflict: "event_id" },
      );
      if (error) throw new Error(error.message);
    },
  };
}

let injectedStore: VoiceEntitlementStore | null = null;

/** Test seam — inject a memory store without touching env. */
export function setVoiceEntitlementStoreForTests(
  store: VoiceEntitlementStore | null,
): void {
  injectedStore = store;
}

export function getVoiceEntitlementStore(): VoiceEntitlementStore {
  if (injectedStore) return injectedStore;
  return (
    createSupabaseVoiceEntitlementStore() ?? globalMemoryVoiceEntitlementStore
  );
}
