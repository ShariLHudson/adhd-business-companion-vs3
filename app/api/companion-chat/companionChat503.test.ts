import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const routeSource = readFileSync(
  join(process.cwd(), "app/api/companion-chat/route.ts"),
  "utf8",
);

describe("companion-chat 503 / Create reliability", () => {
  it("defines humanEnforcement before using it in the JSON response", () => {
    expect(routeSource).toContain("enforceHumanConversation");
    expect(routeSource).toMatch(
      /const humanEnforcement = enforceHumanConversation\(/,
    );
    const defineAt = routeSource.indexOf(
      "const humanEnforcement = enforceHumanConversation(",
    );
    const useAt = routeSource.indexOf("humanConversationRewritten: humanEnforcement");
    expect(defineAt).toBeGreaterThan(-1);
    expect(useAt).toBeGreaterThan(defineAt);
  });

  it("logs structured alerts for service-unavailable responses", () => {
    expect(routeSource).toContain("logCompanionChatServiceUnavailable");
    expect(routeSource).toContain("[companion-chat-503]");
    expect(routeSource).toContain("unhandled_route_exception");
    expect(routeSource).toContain("openai_api_key_missing");
  });

  it("returns 503 JSON with a recoverable message on unhandled errors", () => {
    expect(routeSource).toMatch(
      /usedCoachingFallback:\s*true,\s*\}\s*,\s*\{\s*status:\s*503/,
    );
  });
});
