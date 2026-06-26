import { describe, expect, it } from "vitest";
import {
  evaluateIntegrationIntent,
  resolveConnectionsRouteLabel,
  shouldRouteToConnectionsSettings,
} from "./index";
import {
  buildAppFeatureNavOffer,
  resolveAppFeatureNavTarget,
} from "../appFeatureNavigation";

function routeConnections(text: string): string | null {
  const target = resolveAppFeatureNavTarget(text);
  if (target?.kind === "settings" && target.section === "connections") {
    return "connections";
  }
  return target?.kind === "settings" ? target.section : null;
}

describe("Meaning Before Matching™ — connect must not hijack", () => {
  it("does not route Pinterest website link help to Connections", () => {
    const text = "How do I connect my website link to a Pinterest post?";
    expect(routeConnections(text)).not.toBe("connections");
    expect(shouldRouteToConnectionsSettings(text)).toBe(false);
    expect(buildAppFeatureNavOffer(text)).toBeNull();
  });

  it("does not route LinkedIn networking to Connections", () => {
    const text = "How do I connect with people on LinkedIn?";
    expect(routeConnections(text)).not.toBe("connections");
    expect(shouldRouteToConnectionsSettings(text)).toBe(false);
  });

  it("does not route idea connection to Connections", () => {
    const text = "Can you help me connect these ideas?";
    expect(routeConnections(text)).not.toBe("connections");
    expect(shouldRouteToConnectionsSettings(text)).toBe(false);
  });

  it("does not route offer-to-audience connection to Connections", () => {
    const text = "How do I connect my offer to my audience?";
    expect(routeConnections(text)).not.toBe("connections");
    expect(shouldRouteToConnectionsSettings(text)).toBe(false);
  });

  it("routes true Google Calendar connection to Connections", () => {
    const text = "Connect my Google Calendar";
    expect(routeConnections(text)).toBe("connections");
    expect(shouldRouteToConnectionsSettings(text)).toBe(true);
    expect(resolveConnectionsRouteLabel(text)).toBe("connections");
  });

  it("routes Gmail connection to Connections", () => {
    const text = "Connect my Gmail";
    expect(routeConnections(text)).toBe("connections");
    expect(shouldRouteToConnectionsSettings(text)).toBe(true);
  });

  it("routes sync calendar integration to Connections", () => {
    expect(routeConnections("Sync my calendar")).toBe("connections");
  });

  it("offers clarification for ambiguous connect without exclusion match", () => {
    const result = evaluateIntegrationIntent("How do I connect things better?");
    expect(result.isIntegration).toBe(false);
    expect(result.clarification).toBeTruthy();
  });
});
