import { describe, expect, it, vi } from "vitest";
import { routeCompanionFailure } from "./routeCompanionFailure";

describe("Companion Context Routing", () => {
  it("never puts Failed to fetch in estate channel", () => {
    const routed = routeCompanionFailure(new TypeError("Failed to fetch"), {
      surface: "chat",
      userText: "I need help with my client call",
    });
    expect(routed.channel).toBe("estate");
    if (routed.channel === "estate") {
      expect(routed.message.toLowerCase()).not.toContain("fetch");
      expect(routed.message.toLowerCase()).not.toContain("network");
      expect(routed.message.toLowerCase()).not.toContain("webpack");
      expect(routed.message.toLowerCase()).not.toContain("next.js");
    }
  });

  it("stays silent for background chat failures with no member turn", () => {
    const routed = routeCompanionFailure(new TypeError("Failed to fetch"), {
      surface: "chat",
    });
    expect(routed).toEqual({ channel: "silent" });
  });

  it("uses estate presence for fresh-start failures", () => {
    const routed = routeCompanionFailure(new Error("internal"), {
      surface: "fresh-start",
    });
    expect(routed.channel).toBe("estate");
    if (routed.channel === "estate") {
      expect(routed.message).toContain("still here");
    }
  });

  it("logs technical detail to system channel only", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    routeCompanionFailure(new TypeError("Failed to fetch"), {
      surface: "workspace-load",
    });

    expect(warn).toHaveBeenCalledWith(
      "[companion-system]",
      expect.objectContaining({
        surface: "workspace-load",
        detail: "Failed to fetch",
        technical: true,
      }),
    );

    process.env.NODE_ENV = prev;
    warn.mockRestore();
  });
});
