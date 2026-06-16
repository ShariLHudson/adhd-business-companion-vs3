import { describe, expect, it } from "vitest";
import {
  normalizeHowDoIQuery,
  resolveHowDoI,
  searchHowDoI,
} from "./howDoIContent";

describe("howDoIContent", () => {
  it("normalizes how-do-i phrasing", () => {
    expect(normalizeHowDoIQuery("How do I create a strategy?")).toBe(
      "create a strategy",
    );
  });

  it("finds create strategy guide", () => {
    const hits = searchHowDoI("How do I create a strategy?");
    expect(hits[0]?.id).toBe("create-strategy");
  });

  it("finds calendar for schedule appointment", () => {
    const hits = searchHowDoI("How do I schedule an appointment?");
    expect(hits[0]?.openLabel).toBe("Open Calendar");
  });

  it("finds create for workshop", () => {
    const hits = searchHowDoI("How do I create a workshop?");
    expect(hits[0]?.openLabel).toBe("Open Create");
  });

  it("always resolves to actionable guidance", () => {
    const entry = resolveHowDoI("xyzzy unknown thing");
    expect(entry.steps.length).toBeGreaterThan(0);
    expect(entry.openLabel).toBeTruthy();
  });

  it("finds dynamic vs meaning-based colors guide", () => {
    const hits = searchHowDoI(
      "what is the difference between dynamic and meaning based colors",
    );
    expect(hits[0]?.id).toBe("colors");
    expect(hits[0]?.details?.length).toBeGreaterThan(1);
    expect(hits[0]?.openSettingsSection).toBe("appearance");
  });
});
