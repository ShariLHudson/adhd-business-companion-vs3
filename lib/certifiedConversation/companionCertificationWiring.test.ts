import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const client = readFileSync(
  join(process.cwd(), "app/companion/CompanionPageClient.tsx"),
  "utf8",
);

describe("Companion certification wiring", () => {
  it("runs certifyCompanionDelivery before conversational Companion replies commit", () => {
    expect(client).toContain('from "@/lib/certifiedConversation"');
    expect(client).toContain("certifyCompanionDelivery({");
    expect(client).toContain("shouldCertifyCompanionDelivery");
    expect(client).toContain("clearGeneralChatCertifiedRuntime");
    const importAt = client.indexOf('from "@/lib/certifiedConversation"');
    const certCallAt = client.indexOf("certifyCompanionDelivery({");
    expect(importAt).toBeGreaterThan(-1);
    expect(certCallAt).toBeGreaterThan(importAt);
  });

  it("keeps Create-owned and navigation delivery kinds out of forced certification", () => {
    expect(client).toContain("deliveryKind: frictionlessDeliveryKind");
    expect(client).toContain("frictionlessCreateOwned");
    expect(client).toContain("frictionlessNavOnly");
  });

  it("logs advisory contributions separately from finalResponseOwner", () => {
    expect(client).toContain('advisoryContributions: ["confidence_recovery"]');
    expect(client).toContain('advisoryContributions: ["encouragement_vault"]');
    expect(client).not.toContain(
      'finalResponseOwner: "advisory:confidence_recovery"',
    );
  });
});
