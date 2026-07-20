import { describe, expect, it } from "vitest";
import {
  classifyCreatePersistencePath,
  isDurableSaveAcknowledged,
  resolveDurableSavePipeline,
} from "./savePipeline";

describe("durable save pipeline", () => {
  it("saved_securely only after durable ack", () => {
    expect(
      isDurableSaveAcknowledged({
        lastDurableOk: true,
        dirty: false,
        hasLocalRecovery: false,
      }),
    ).toBe(true);
    expect(
      isDurableSaveAcknowledged({
        lastDurableOk: false,
        dirty: true,
      }),
    ).toBe(false);
    expect(
      resolveDurableSavePipeline({
        submitting: true,
        lastDurableOk: null,
      }).pipeline,
    ).toBe("saving");
  });

  it("failed durable save and retry", () => {
    expect(
      resolveDurableSavePipeline({
        failureMessage: "That didn’t finish saving securely.",
        submitting: false,
      }).pipeline,
    ).toBe("save_failed");
    expect(
      resolveDurableSavePipeline({
        failureMessage: "That didn’t finish saving securely.",
        submitting: true,
      }).pipeline,
    ).toBe("saving");
  });

  it("local recovery never claims saved securely", () => {
    const r = resolveDurableSavePipeline({
      hasLocalRecovery: true,
      lastDurableOk: false,
    });
    expect(r.pipeline).toBe("recovery_available");
    expect(r.label.startsWith("Saved")).toBe(false);
  });

  it("stale write / multi-tab conflict", () => {
    const r = resolveDurableSavePipeline({
      expectedDurableVersion: 1,
      observedDurableVersion: 3,
      lastDurableOk: true,
    });
    expect(r.pipeline).toBe("conflict_detected");
    expect(r.state).toBe("conflict");
  });

  it("classifies secondary stores as non-durable", () => {
    expect(classifyCreatePersistencePath("creationDurable")).toBe(
      "durable_pipeline",
    );
    expect(classifyCreatePersistencePath("blueprintTemplate")).toBe(
      "local_bookmark_only",
    );
    expect(classifyCreatePersistencePath("eventRecordLs")).toBe(
      "domain_projection",
    );
    expect(classifyCreatePersistencePath("focusRecoveryBuffer")).toBe(
      "local_recovery_only",
    );
  });
});
