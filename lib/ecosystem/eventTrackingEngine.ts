// Centralized ecosystem event tracking — lightweight, summarized, queryable.
// Foundation for founder / GHL / product / business intelligence (no dashboards here).

import { getEcosystemUserId } from "./ecosystemUserId";
import type { EventStore } from "./eventStore";
import { eventStore } from "./eventStore";
import { ev, type EventType, type FounderEvent, type NewEvent } from "./events";
import type { ID } from "./models";

// ---- Canonical event types (namespaced) -----------------------------------

export type EcosystemTrackEventType =
  | "user.registered"
  | "user.login"
  | "user.logout"
  | "user.active"
  | "user.inactive"
  | "user.cancelled"
  | "feature.create_opened"
  | "feature.create_completed"
  | "feature.project_created"
  | "feature.project_updated"
  | "feature.focus_audio_started"
  | "feature.focus_audio_completed"
  | "feature.time_block_started"
  | "feature.time_block_completed"
  | "feature.momentum_appointment_checkin"
  | "feature.clear_my_mind_used"
  | "feature.brain_dump_used"
  | "document.google_doc_created"
  | "document.google_sheet_created"
  | "document.google_form_created"
  | "document.pdf_exported"
  | "document.copy_used"
  | "companion.conversation_started"
  | "companion.recommendation_given"
  | "companion.recommendation_accepted";

export type EcosystemFeature =
  | "user"
  | "auth"
  | "create"
  | "projects"
  | "focus-audio"
  | "time-block"
  | "clear-my-mind"
  | "brain-dump"
  | "documents"
  | "companion"
  | "export";

export type EcosystemMetadataValue = string | number | boolean | null;

export type EcosystemMetadata = Record<string, EcosystemMetadataValue>;

/** Normalized event record for intelligence pipelines. */
export type EcosystemTrackEvent = {
  eventId: string;
  timestamp: string;
  userId: string;
  eventType: EcosystemTrackEventType;
  feature: EcosystemFeature;
  metadata: EcosystemMetadata;
};

export type EcosystemTrackInput = {
  userId: string;
  eventType: EcosystemTrackEventType;
  feature: EcosystemFeature;
  metadata?: EcosystemMetadata;
  timestamp?: string;
};

export type EcosystemTrackQuery = {
  userId?: string;
  eventType?: EcosystemTrackEventType | EcosystemTrackEventType[];
  feature?: EcosystemFeature;
  since?: string;
  until?: string;
  limit?: number;
};

const STORAGE_KEY = "adhd-ecosystem-track-v1";
const MAX_EVENTS = 5_000;

const BLOCKED_METADATA_KEYS = new Set([
  "email",
  "password",
  "message",
  "content",
  "body",
  "conversation",
  "transcript",
  "userMessage",
  "prompt",
  "completion",
  "name",
  "phone",
  "address",
  "summary",
  "text",
  "description",
  "draft",
]);

const MAX_META_STRING = 120;

function newEventId(): string {
  return `eco-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

/** Strip PII and conversation content from metadata. */
export function sanitizeEcosystemMetadata(
  raw: EcosystemMetadata | undefined,
): EcosystemMetadata {
  if (!raw) return {};
  const out: EcosystemMetadata = {};
  for (const [key, value] of Object.entries(raw)) {
    const k = key.trim();
    if (!k || BLOCKED_METADATA_KEYS.has(k.toLowerCase())) continue;
    if (value === undefined) continue;
    if (typeof value === "string") {
      out[k] = value.trim().slice(0, MAX_META_STRING);
      continue;
    }
    if (typeof value === "number" || typeof value === "boolean" || value === null) {
      out[k] = value;
    }
  }
  return out;
}

export function defaultFeatureForEvent(
  eventType: EcosystemTrackEventType,
): EcosystemFeature {
  if (eventType.startsWith("user.")) return "user";
  if (eventType.startsWith("feature.create")) return "create";
  if (eventType.startsWith("feature.project")) return "projects";
  if (eventType.startsWith("feature.focus")) return "focus-audio";
  if (eventType.startsWith("feature.time_block")) return "time-block";
  if (eventType === "feature.clear_my_mind_used") return "clear-my-mind";
  if (eventType === "feature.brain_dump_used") return "brain-dump";
  if (eventType.startsWith("document.")) return "documents";
  return "companion";
}

// ---- Persistence ----------------------------------------------------------

export interface EcosystemTrackSink {
  append(event: EcosystemTrackEvent): void;
  all(): EcosystemTrackEvent[];
}

export class MemoryEcosystemTrackSink implements EcosystemTrackSink {
  private events: EcosystemTrackEvent[] = [];
  append(event: EcosystemTrackEvent) {
    this.events.push(event);
    if (this.events.length > MAX_EVENTS) {
      this.events = this.events.slice(-MAX_EVENTS);
    }
  }
  all() {
    return this.events.slice();
  }
}

export class LocalStorageEcosystemTrackSink implements EcosystemTrackSink {
  constructor(private key = STORAGE_KEY) {}
  all(): EcosystemTrackEvent[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(this.key);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? (parsed as EcosystemTrackEvent[]) : [];
    } catch {
      return [];
    }
  }
  append(event: EcosystemTrackEvent) {
    if (typeof window === "undefined") return;
    try {
      const next = [...this.all(), event].slice(-MAX_EVENTS);
      window.localStorage.setItem(this.key, JSON.stringify(next));
    } catch {
      /* best-effort */
    }
  }
}

// ---- Bridge to Phase-1 founder event stream -------------------------------

function bridgeToFounderEvent(event: EcosystemTrackEvent): NewEvent | null {
  const founderId = event.userId as ID;
  const m = event.metadata;
  switch (event.eventType) {
    case "feature.project_created":
      return ev.projectCreated(
        founderId,
        String(m.projectId ?? `proj-${event.eventId}`),
        String(m.artifactType ?? m.itemType ?? "project"),
      );
    case "feature.project_updated":
      return {
        founderId,
        type: "project.updated",
        refs: { projectId: m.projectId ? String(m.projectId) : undefined },
        data: { field: m.field ?? "updated" },
      };
    case "feature.focus_audio_started":
      return ev.focusStarted(
        founderId,
        typeof m.plannedMinutes === "number" ? m.plannedMinutes : 25,
        m.projectId ? String(m.projectId) : undefined,
      );
    case "feature.focus_audio_completed":
      return ev.focusCompleted(
        founderId,
        typeof m.actualMinutes === "number" ? m.actualMinutes : 25,
        m.projectId ? String(m.projectId) : undefined,
      );
    case "feature.time_block_started":
      return ev.timeBlockCreated(
        founderId,
        String(m.timeBlockId ?? `tb-${event.eventId}`),
        typeof m.durationMin === "number" ? m.durationMin : 30,
        m.projectId ? String(m.projectId) : undefined,
      );
    case "feature.time_block_completed":
      return ev.timeBlockCompleted(
        founderId,
        String(m.timeBlockId ?? `tb-${event.eventId}`),
      );
    case "feature.create_opened":
      return ev.workspaceOpened(founderId, "create");
    case "feature.clear_my_mind_used":
      return ev.workspaceOpened(founderId, "clear-my-mind");
    case "feature.brain_dump_used":
      return {
        founderId,
        type: "note.captured",
        refs: { workspace: "clear-my-mind" },
        data: { kind: m.entryKind ?? "idea", summarized: true },
      };
    case "document.google_doc_created":
      return ev.documentExported(
        founderId,
        String(m.documentId ?? `doc-${event.eventId}`),
        "google-doc",
      );
    case "document.google_sheet_created":
      return ev.documentExported(
        founderId,
        String(m.documentId ?? `doc-${event.eventId}`),
        "google-sheet",
      );
    case "document.google_form_created":
      return ev.documentExported(
        founderId,
        String(m.documentId ?? `doc-${event.eventId}`),
        "google-form",
      );
    case "document.pdf_exported":
      return ev.documentExported(
        founderId,
        String(m.documentId ?? `doc-${event.eventId}`),
        "pdf",
      );
    case "document.copy_used":
      return ev.documentExported(
        founderId,
        String(m.documentId ?? `doc-${event.eventId}`),
        "copy",
      );
    case "companion.recommendation_given":
      return ev.actionOffered(
        founderId,
        String(m.actionId ?? `act-${event.eventId}`),
        String(m.actionType ?? "recommendation"),
        String(m.actionType ?? "recommendation"),
        m.projectId ? String(m.projectId) : undefined,
      );
    case "companion.recommendation_accepted":
      return ev.actionCompleted(
        founderId,
        String(m.actionId ?? `act-${event.eventId}`),
        String(m.actionType ?? "recommendation"),
        m.projectId ? String(m.projectId) : undefined,
      );
    case "companion.conversation_started":
      return {
        founderId,
        type: "chat.coaching",
        data: { session: true },
      };
    case "feature.create_completed":
      return ev.documentCreated(
        founderId,
        String(m.documentId ?? `doc-${event.eventId}`),
        String(m.artifactType ?? "document"),
        String(m.artifactType ?? "document"),
        m.projectId ? String(m.projectId) : undefined,
      );
    default:
      return {
        founderId,
        type: "assisted_action.accepted",
        data: {
          ecosystemEventType: event.eventType,
          feature: event.feature,
          ...event.metadata,
        },
      };
  }
}

export function toFounderEventType(
  eventType: EcosystemTrackEventType,
): EventType | null {
  const bridged = bridgeToFounderEvent({
    eventId: "bridge",
    timestamp: nowIso(),
    userId: "bridge",
    eventType,
    feature: defaultFeatureForEvent(eventType),
    metadata: {},
  });
  return bridged?.type ?? null;
}

// ---- Engine ---------------------------------------------------------------

export class EcosystemEventTrackingEngine {
  constructor(
    private sink: EcosystemTrackSink = new MemoryEcosystemTrackSink(),
    private founderStream: EventStore = eventStore,
    private bridgeFounderStream = true,
  ) {}

  track(input: EcosystemTrackInput): EcosystemTrackEvent {
    const event: EcosystemTrackEvent = {
      eventId: newEventId(),
      timestamp: input.timestamp ?? nowIso(),
      userId: input.userId,
      eventType: input.eventType,
      feature: input.feature,
      metadata: sanitizeEcosystemMetadata(input.metadata),
    };
    this.sink.append(event);
    if (this.bridgeFounderStream) {
      const bridged = bridgeToFounderEvent(event);
      if (bridged) {
        this.founderStream.emit({ ...bridged, data: { ...bridged.data, ecosystemEventId: event.eventId, ecosystemEventType: event.eventType, feature: event.feature, ...event.metadata } });
      }
    }
    return event;
  }

  all(): EcosystemTrackEvent[] {
    return this.sink.all();
  }

  query(q: EcosystemTrackQuery = {}): EcosystemTrackEvent[] {
    const types = q.eventType
      ? Array.isArray(q.eventType)
        ? q.eventType
        : [q.eventType]
      : null;
    let out = this.sink.all().filter((e) => {
      if (q.userId && e.userId !== q.userId) return false;
      if (types && !types.includes(e.eventType)) return false;
      if (q.feature && e.feature !== q.feature) return false;
      if (q.since && e.timestamp < q.since) return false;
      if (q.until && e.timestamp > q.until) return false;
      return true;
    });
    if (q.limit && out.length > q.limit) out = out.slice(-q.limit);
    return out;
  }

  count(q: EcosystemTrackQuery = {}): number {
    return this.query(q).length;
  }

  /** Map legacy founder events that predate the tracking engine. */
  fromFounderEvent(event: FounderEvent): EcosystemTrackEvent | null {
    const d = event.data as Record<string, unknown> | undefined;
    const ecoType = d?.ecosystemEventType as EcosystemTrackEventType | undefined;
    if (ecoType) {
      return {
        eventId: String(d?.ecosystemEventId ?? event.id),
        timestamp: event.ts,
        userId: event.founderId,
        eventType: ecoType,
        feature: (d?.feature as EcosystemFeature) ?? defaultFeatureForEvent(ecoType),
        metadata: sanitizeEcosystemMetadata(
          Object.fromEntries(
            Object.entries(d ?? {}).filter(
              ([k]) =>
                !["ecosystemEventId", "ecosystemEventType", "feature"].includes(k),
            ),
          ) as EcosystemMetadata,
        ),
      };
    }
    return null;
  }
}

export const ecosystemEventTracker = new EcosystemEventTrackingEngine(
  typeof window === "undefined"
    ? new MemoryEcosystemTrackSink()
    : new LocalStorageEcosystemTrackSink(),
);

export function trackEcosystemEvent(
  input: Omit<EcosystemTrackInput, "userId"> & { userId?: string },
): EcosystemTrackEvent {
  const event = ecosystemEventTracker.track({
    ...input,
    userId: input.userId ?? getEcosystemUserId(),
  });
  if (typeof window !== "undefined") {
    void import("./clientUserHealthSync").then(({ syncUserHealthFromEcosystemEvent }) => {
      syncUserHealthFromEcosystemEvent(event.eventType);
    });
  }
  return event;
}

const SESSION_ACTIVE_KEY = "ecosystem-session-active-v1";
const REGISTERED_KEY = "ecosystem-user-registered-v1";

/** Once per browser session — user became active. */
export function trackUserActiveSession(): void {
  if (typeof window === "undefined") return;
  if (window.sessionStorage.getItem(SESSION_ACTIVE_KEY)) return;
  trackEcosystemEvent({ eventType: "user.active", feature: "user" });
  window.sessionStorage.setItem(SESSION_ACTIVE_KEY, "1");
}

/** Once ever per browser — first visit registered. */
export function trackUserRegisteredOnce(): void {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(REGISTERED_KEY)) return;
  trackEcosystemEvent({ eventType: "user.registered", feature: "user" });
  window.localStorage.setItem(REGISTERED_KEY, "1");
}
