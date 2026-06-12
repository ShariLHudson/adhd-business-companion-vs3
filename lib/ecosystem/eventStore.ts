// Founder Ecosystem — Phase 1 Event Store.
//
// Append-only, persistent, queryable, and pluggable. The store talks to an
// EventSink adapter, so the same API works over localStorage now and a
// database/REST endpoint later (swap the adapter, nothing else changes).
// A lightweight subscribe() lets Phase 2 layers (Shari suggestions, live
// dashboards) react to events without polling.

import type { EventType, FounderEvent, NewEvent } from "./events";
import type { ID, ISODateString } from "./models";

// ---- Persistence adapter ------------------------------------------------
export interface EventSink {
  append(event: FounderEvent): void | Promise<void>;
  all(): FounderEvent[];
}

// In-memory adapter — tests, SSR, and a base for others.
export class MemoryEventSink implements EventSink {
  private events: FounderEvent[] = [];
  append(event: FounderEvent) {
    this.events.push(event);
  }
  all() {
    return this.events.slice();
  }
}

// Browser localStorage adapter — durable across reloads with zero backend.
export class LocalStorageEventSink implements EventSink {
  constructor(private key = "founder-ecosystem-events-v1") {}
  all(): FounderEvent[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(this.key);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? (parsed as FounderEvent[]) : [];
    } catch {
      return [];
    }
  }
  append(event: FounderEvent) {
    if (typeof window === "undefined") return;
    try {
      const next = [...this.all(), event];
      window.localStorage.setItem(this.key, JSON.stringify(next));
    } catch {
      /* storage unavailable / quota — events are best-effort */
    }
  }
}

// ---- ids / time ---------------------------------------------------------
function newId(): ID {
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
function nowIso(): ISODateString {
  return new Date().toISOString();
}

// ---- Query options ------------------------------------------------------
export type EventQuery = {
  founderId?: ID;
  type?: EventType | EventType[];
  /** Prefix match on the namespace, e.g. "task." or "workspace." */
  prefix?: string;
  projectId?: ID;
  since?: ISODateString;
  until?: ISODateString;
  limit?: number;
};

export type EventListener = (event: FounderEvent) => void;

// ---- The store ----------------------------------------------------------
export class EventStore {
  private listeners = new Set<EventListener>();

  constructor(private sink: EventSink = new MemoryEventSink()) {}

  /** Append one event. Returns the fully-formed, stored event. */
  emit(input: NewEvent): FounderEvent {
    const event: FounderEvent = {
      id: newId(),
      ts: input.ts ?? nowIso(),
      ...input,
    };
    void this.sink.append(event);
    for (const l of this.listeners) {
      try {
        l(event);
      } catch {
        /* a listener throwing must not break the pipeline */
      }
    }
    return event;
  }

  /** Subscribe to new events (Phase 2 hook). Returns an unsubscribe fn. */
  subscribe(listener: EventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** All events (oldest → newest). */
  all(): FounderEvent[] {
    return this.sink.all();
  }

  /** Filtered, time-bounded query. */
  query(q: EventQuery = {}): FounderEvent[] {
    const types = q.type
      ? Array.isArray(q.type)
        ? q.type
        : [q.type]
      : null;
    let out = this.sink.all().filter((e) => {
      if (q.founderId && e.founderId !== q.founderId) return false;
      if (types && !types.includes(e.type)) return false;
      if (q.prefix && !e.type.startsWith(q.prefix)) return false;
      if (q.projectId && e.refs?.projectId !== q.projectId) return false;
      if (q.since && e.ts < q.since) return false;
      if (q.until && e.ts > q.until) return false;
      return true;
    });
    if (q.limit && out.length > q.limit) out = out.slice(-q.limit);
    return out;
  }

  count(q: EventQuery = {}): number {
    return this.query(q).length;
  }
}

// A default singleton wired to localStorage in the browser, memory on server.
export const eventStore = new EventStore(
  typeof window === "undefined"
    ? new MemoryEventSink()
    : new LocalStorageEventSink(),
);
