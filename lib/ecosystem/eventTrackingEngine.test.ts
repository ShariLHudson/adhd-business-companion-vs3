import { describe, expect, it } from "vitest";

import { MemoryEventSink, EventStore } from "./eventStore";
import {
  EcosystemEventTrackingEngine,
  MemoryEcosystemTrackSink,
  sanitizeEcosystemMetadata,
  trackEcosystemEvent,
} from "./eventTrackingEngine";

describe("sanitizeEcosystemMetadata", () => {
  it("removes conversation content and truncates strings", () => {
    const out = sanitizeEcosystemMetadata({
      message: "secret chat",
      artifactType: "Email",
      count: 2,
    });
    expect(out.message).toBeUndefined();
    expect(out.artifactType).toBe("Email");
    expect(out.count).toBe(2);
  });
});

describe("EcosystemEventTrackingEngine", () => {
  it("persists and queries tracked events", () => {
    const sink = new MemoryEcosystemTrackSink();
    const founderStream = new EventStore(new MemoryEventSink());
    const engine = new EcosystemEventTrackingEngine(sink, founderStream);

    const event = engine.track({
      userId: "usr-1",
      eventType: "feature.project_created",
      feature: "projects",
      metadata: { projectId: "p-1", artifactType: "Launch" },
    });

    expect(event.eventId).toMatch(/^eco-/);
    expect(event.userId).toBe("usr-1");
    expect(engine.count({ userId: "usr-1" })).toBe(1);
    expect(engine.query({ eventType: "feature.project_created" })).toHaveLength(1);
    expect(founderStream.count({ prefix: "project." })).toBe(1);
  });

  it("tracks feature usage via convenience helper", () => {
    const sink = new MemoryEcosystemTrackSink();
    const engine = new EcosystemEventTrackingEngine(sink, new EventStore(new MemoryEventSink()));
    (globalThis as { window?: unknown }).window = undefined;

    const tracked = engine.track({
      userId: "usr-2",
      eventType: "feature.brain_dump_used",
      feature: "brain-dump",
      metadata: { entryKind: "task" },
    });
    expect(tracked.metadata.entryKind).toBe("task");
    expect(engine.query({ feature: "brain-dump" })).toHaveLength(1);
  });
});

describe("document metadata", () => {
  it("drops blocked content fields", () => {
    const sink = new MemoryEcosystemTrackSink();
    const engine = new EcosystemEventTrackingEngine(sink, new EventStore(new MemoryEventSink()));
    const event = engine.track({
      userId: "u",
      eventType: "document.copy_used",
      feature: "documents",
      metadata: { documentId: "d-1", content: "should drop" },
    });
    expect(event.metadata.documentId).toBe("d-1");
    expect(event.metadata.content).toBeUndefined();
  });
});
