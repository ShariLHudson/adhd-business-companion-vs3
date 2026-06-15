import { describe, expect, it } from "vitest";

import {
  companionProvisionSecret,
  verifyCompanionProvisionToken,
} from "@/lib/companionAuthProvision";

describe("verifyCompanionProvisionToken", () => {
  it("rejects missing or wrong tokens", () => {
    const prev = process.env.COMPANION_PROVISION_SECRET;
    process.env.COMPANION_PROVISION_SECRET = "test-secret";
    expect(verifyCompanionProvisionToken(null)).toBe(false);
    expect(verifyCompanionProvisionToken("wrong")).toBe(false);
    expect(verifyCompanionProvisionToken("test-secret")).toBe(true);
    process.env.COMPANION_PROVISION_SECRET = prev;
  });

  it("reads companionProvisionSecret from env", () => {
    const prev = process.env.COMPANION_PROVISION_SECRET;
    process.env.COMPANION_PROVISION_SECRET = "abc";
    expect(companionProvisionSecret()).toBe("abc");
    process.env.COMPANION_PROVISION_SECRET = prev;
  });
});
