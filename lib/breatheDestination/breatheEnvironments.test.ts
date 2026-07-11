import { describe, expect, it } from "vitest";
import {
  BREATHE_PEACEFUL_GARDEN_IMAGE,
  DEFAULT_BREATHE_ENVIRONMENT_ID,
  resolveBreatheEnvironment,
} from "./breatheEnvironments";

describe("breatheEnvironments", () => {
  it("defaults to the peaceful garden water scene", () => {
    const env = resolveBreatheEnvironment();
    expect(env.id).toBe(DEFAULT_BREATHE_ENVIRONMENT_ID);
    expect(env.label).toBe("Peaceful Garden");
    expect(env.imageUrl).toBe(BREATHE_PEACEFUL_GARDEN_IMAGE);
    expect(env.objectFit).toBe("contain");
  });

  it("falls back for unknown environment ids", () => {
    expect(resolveBreatheEnvironment("unknown-place").id).toBe(
      DEFAULT_BREATHE_ENVIRONMENT_ID,
    );
  });
});
