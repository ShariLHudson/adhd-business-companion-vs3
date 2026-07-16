/**
 * Contract: top-right avatar is the signed-in member — never hard-coded SH.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("GlobalEstateMenu member identity", () => {
  const menu = readFileSync(
    resolve(process.cwd(), "components/companion/GlobalEstateMenu.tsx"),
    "utf8",
  );
  const chrome = readFileSync(
    resolve(process.cwd(), "components/companion/estate/EstateTopRightChrome.tsx"),
    "utf8",
  );

  it("uses dynamic identity helpers instead of hard-coded initials", () => {
    expect(menu).toContain("userProfileInitials");
    expect(menu).toContain("userProfileImageUrl");
    expect(menu).toContain("userProfileMenuGreeting");
    expect(menu).not.toMatch(/["']SH["']/);
    expect(menu).toContain('aria-label="Open profile menu"');
    expect(menu).toContain("GenericProfileIcon");
    expect(menu).toContain("companion-prefs-updated");
  });

  it("keeps Experience Controls on the member profile menu path", () => {
    expect(chrome).toContain("GlobalEstateMenu");
    expect(chrome).toContain("member profile menu");
    expect(chrome).not.toContain("SH profile menu");
  });
});
