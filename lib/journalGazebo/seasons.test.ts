import { afterEach, describe, expect, it, vi } from "vitest";
import { journalGazeboAtmosphereOnly } from "./seasons";

describe("journalGazeboAtmosphereOnly", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("defaults to photo plates in development", () => {
    vi.stubGlobal("window", {});
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_JOURNAL_GAZEBO_ATMOSPHERE", "");
    expect(journalGazeboAtmosphereOnly()).toBe(false);
  });

  it("uses CSS atmosphere only when explicitly enabled", () => {
    vi.stubGlobal("window", {});
    vi.stubEnv("NEXT_PUBLIC_JOURNAL_GAZEBO_ATMOSPHERE", "true");
    expect(journalGazeboAtmosphereOnly()).toBe(true);
  });
});
