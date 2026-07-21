import { beforeEach, describe, expect, it } from "vitest";
import {
  allocateCanonicalWorkId,
  CANONICAL_WORK_ID_PREFIX,
  coalesceWorkflowWorkId,
  resolveCanonicalWorkId,
  adoptLegacyWorkIdAsCanonical,
  resetWorkIdentityStoreForTests,
  getWorkIdentity,
  detectLegacyWorkIdKind,
} from "../index";

describe("Universal Work Engine — identity", () => {
  beforeEach(() => {
    resetWorkIdentityStoreForTests();
  });

  it("mints one canonical work- prefix id", () => {
    const a = allocateCanonicalWorkId({ origin: "create", workTypeId: "event_plan" });
    const b = allocateCanonicalWorkId({ origin: "event" });
    expect(a.startsWith(CANONICAL_WORK_ID_PREFIX)).toBe(true);
    expect(b.startsWith(CANONICAL_WORK_ID_PREFIX)).toBe(true);
    expect(a).not.toBe(b);
    expect(getWorkIdentity(a)?.workTypeId).toBe("event_plan");
  });

  it("adopts existing evt- Event records as canonical without rewriting", () => {
    const adopted = adoptLegacyWorkIdAsCanonical("evt-certified-1", {
      workTypeId: "event_plan",
      origin: "event",
    });
    expect(adopted.workId).toBe("evt-certified-1");
    expect(resolveCanonicalWorkId("evt-certified-1")).toBe("evt-certified-1");
    expect(detectLegacyWorkIdKind("evt-certified-1")).toBe("evt-");
  });

  it("prevents competing masters — aliases resolve to one work id", () => {
    const workId = allocateCanonicalWorkId({ origin: "create" });
    resolveCanonicalWorkId("create-old-session", { aliasOf: workId });
    resolveCanonicalWorkId("cw-projects-link", { aliasOf: workId });
    expect(resolveCanonicalWorkId("create-old-session")).toBe(workId);
    expect(resolveCanonicalWorkId("cw-projects-link")).toBe(workId);
    expect(resolveCanonicalWorkId(workId)).toBe(workId);
  });

  it("coalesceWorkflowWorkId links session + event to one master", () => {
    const eventId = "evt-coalesce-1";
    const sessionId = "create-coalesce-session";
    const canonical = coalesceWorkflowWorkId({
      eventRecordId: eventId,
      sessionId,
      workTypeId: "event_plan",
    });
    expect(canonical).toBe(eventId);
    expect(resolveCanonicalWorkId(sessionId)).toBe(eventId);
  });

  it("does not mint legacy prefixes for new work", () => {
    const id = allocateCanonicalWorkId({ origin: "duplicate" });
    expect(detectLegacyWorkIdKind(id)).toBeNull();
  });
});
