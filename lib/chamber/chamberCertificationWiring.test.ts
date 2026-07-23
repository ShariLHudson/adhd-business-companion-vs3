import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const client = readFileSync(
  join(process.cwd(), "app/companion/CompanionPageClient.tsx"),
  "utf8",
);

describe("Chamber certification wiring", () => {
  it("runs certifyConversationDelivery before Chamber replies commit", () => {
    expect(client).toContain("certifyConversationDelivery");
    expect(client).toContain('behaviorMode: "advisory"');
    expect(client).toContain("saveChamberCertifiedRuntime");
    const certAt = client.indexOf("certifyConversationDelivery({");
    const setMsgAt = client.indexOf(
      "markAssistantReplied(chatTurnState)",
      certAt,
    );
    expect(certAt).toBeGreaterThan(-1);
    expect(setMsgAt).toBeGreaterThan(certAt);
  });

  it("clears certified runtime on Chamber dismiss", () => {
    const dismiss = readFileSync(
      join(process.cwd(), "lib/chamber/dismissActiveChamberConversation.ts"),
      "utf8",
    );
    expect(dismiss).toContain("clearChamberCertifiedRuntime");
  });
});
