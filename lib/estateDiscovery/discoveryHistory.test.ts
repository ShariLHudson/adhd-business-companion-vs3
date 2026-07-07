import { describe, expect, it, vi } from "vitest";

import {
  InMemoryDiscoveryHistoryStore,
  recordDiscoveryShown,
  recordDiscoveryOpened,
  recordDiscoverySavedForLater,
  recordDiscoveryCompleted,
  recordDiscoveryIgnored,
  recordDiscoveryDestinationVisited,
  listSavedDiscoveries,
  hasDiscoveryBeenCompleted,
} from "./discoveryHistory";
import {
  DISCOVERY_IGNORE_COOLDOWN_MS,
  DISCOVERY_IGNORE_WINDOW_MS,
  isDiscoveryBlockedByHistory,
  isDiscoveryIgnoredRecently,
  shouldRecordSilentIgnore,
} from "./discoveryHistoryPolicy";

describe("discoveryHistory", () => {
  const userId = "user-1";
  const discoveryId = "DISC-001";

  it("upserts one record per member and discovery", () => {
    const store = new InMemoryDiscoveryHistoryStore();

    recordDiscoveryShown(store, userId, discoveryId, {
      roomWhereShown: "greenhouse",
      placementLocation: "garden-bench",
      destinationRoute: "/companion?section=growth-greenhouse",
    });

    const entry = store.get(userId, discoveryId);
    expect(entry?.status).toBe("shown");
    expect(entry?.shownAt).toBeTruthy();
    expect(entry?.roomWhereShown).toBe("greenhouse");
    expect(entry?.placementLocation).toBe("garden-bench");
    expect(store.list(userId)).toHaveLength(1);
  });

  it("advances status through opened and completed", () => {
    const store = new InMemoryDiscoveryHistoryStore();

    recordDiscoveryShown(store, userId, discoveryId);
    recordDiscoveryOpened(store, userId, discoveryId);
    recordDiscoveryCompleted(store, userId, discoveryId);

    const entry = store.get(userId, discoveryId);
    expect(entry?.status).toBe("completed");
    expect(entry?.openedAt).toBeTruthy();
    expect(entry?.completedAt).toBeTruthy();
  });

  it("records saved discoveries for future shelf", () => {
    const store = new InMemoryDiscoveryHistoryStore();

    recordDiscoveryShown(store, userId, discoveryId);
    recordDiscoverySavedForLater(store, userId, discoveryId);

    expect(listSavedDiscoveries(store, userId)).toHaveLength(1);
    expect(hasDiscoveryBeenCompleted(store, userId, discoveryId)).toBe(true);
  });

  it("records destination visited as terminal", () => {
    const store = new InMemoryDiscoveryHistoryStore();

    recordDiscoveryDestinationVisited(store, userId, discoveryId);

    expect(hasDiscoveryBeenCompleted(store, userId, discoveryId)).toBe(true);
    expect(
      isDiscoveryBlockedByHistory(store, userId, discoveryId),
    ).toBe(true);
  });

  it("does not mark ignored when discovery was opened", () => {
    const store = new InMemoryDiscoveryHistoryStore();

    recordDiscoveryShown(store, userId, discoveryId);
    recordDiscoveryOpened(store, userId, discoveryId);
    recordDiscoveryIgnored(store, userId, discoveryId);

    expect(store.get(userId, discoveryId)?.status).toBe("opened");
  });

  it("blocks ignored discoveries during cooldown", () => {
    const store = new InMemoryDiscoveryHistoryStore();
    const now = Date.parse("2026-07-06T12:00:00.000Z");

    store.upsert({
      userId,
      discoveryId,
      status: "ignored",
      shownAt: new Date(now - DISCOVERY_IGNORE_WINDOW_MS - 1000).toISOString(),
      ignoredAt: new Date(now - 1000).toISOString(),
      updatedAt: new Date(now - 1000).toISOString(),
    });

    expect(isDiscoveryIgnoredRecently(store.get(userId, discoveryId)!, now)).toBe(
      true,
    );
    expect(isDiscoveryBlockedByHistory(store, userId, discoveryId, now)).toBe(
      true,
    );
  });

  it("allows rediscovery after ignore cooldown", () => {
    const store = new InMemoryDiscoveryHistoryStore();
    const now = Date.parse("2026-07-06T12:00:00.000Z");

    store.upsert({
      userId,
      discoveryId,
      status: "ignored",
      ignoredAt: new Date(now - DISCOVERY_IGNORE_COOLDOWN_MS - 1000).toISOString(),
      updatedAt: new Date(now - DISCOVERY_IGNORE_COOLDOWN_MS - 1000).toISOString(),
    });

    expect(isDiscoveryBlockedByHistory(store, userId, discoveryId, now)).toBe(
      false,
    );
  });

  it("requires ignore window before silent ignore", () => {
    const shownAt = new Date("2026-07-06T12:00:00.000Z").toISOString();
    const entry = {
      userId,
      discoveryId,
      status: "shown" as const,
      shownAt,
      updatedAt: shownAt,
    };

    expect(
      shouldRecordSilentIgnore(
        entry,
        Date.parse("2026-07-06T12:02:00.000Z"),
      ),
    ).toBe(false);

    expect(
      shouldRecordSilentIgnore(
        entry,
        Date.parse(shownAt) + DISCOVERY_IGNORE_WINDOW_MS + 1,
      ),
    ).toBe(true);
  });
});

describe("discoveryHistory migration", () => {
  it("merges legacy v1 events into consolidated entries", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-06T12:00:00.000Z"));

    const store = new InMemoryDiscoveryHistoryStore();
    const at = new Date().toISOString();

    store.upsert({
      userId: "legacy-user",
      discoveryId: "DISC-002",
      status: "shown",
      shownAt: at,
      updatedAt: at,
      roomWhereShown: "sunroom",
    });

    recordDiscoveryOpened(store, "legacy-user", "DISC-002");
    recordDiscoveryCompleted(store, "legacy-user", "DISC-002");

    const entry = store.get("legacy-user", "DISC-002");
    expect(entry?.status).toBe("completed");
    expect(entry?.roomWhereShown).toBe("sunroom");

    vi.useRealTimers();
  });
});
