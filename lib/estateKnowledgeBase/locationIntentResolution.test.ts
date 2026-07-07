import { describe, expect, it } from "vitest";
import { matchEstateAlias } from "./estateAliases";
import { getEstateLocationById } from "./estateLocations";
import { matchExperienceGroupFromQuery } from "./experienceGroups";
import { resolveLocationIntent } from "./locationIntentResolution";

describe("estate asset intelligence", () => {
  it("resolves treehouse to Possibility House asset", () => {
    const alias = matchEstateAlias("Take me to the treehouse");
    expect(alias?.locationId).toBe("house-possibility-outside");

    const intent = resolveLocationIntent("Take me to the treehouse");
    expect(intent.kind).toBe("direct");
    expect(intent.directLocation?.officialDisplayName).toBe("Possibility House");
    expect(intent.directLocation?.primaryAssetFileName).toBe(
      "treehouse-possibility-house-outside-background.png",
    );
  });

  it("resolves swim intent to summer terrace pool asset", () => {
    const intent = resolveLocationIntent("I want to swim");
    expect(intent.kind).toBe("direct");
    expect(intent.directLocation?.locationId).toBe("summer-terrace");
    expect(intent.directLocation?.primaryAssetFileName).toBe(
      "water-swimming-pool-private-background.png",
    );
  });

  it("offers peaceful experience options without choosing randomly", () => {
    const intent = resolveLocationIntent("I want somewhere peaceful");
    expect(intent.kind).toBe("experience_options");
    expect(intent.options?.length).toBe(3);
    expect(intent.options?.map((o) => o.locationId)).toEqual([
      "reflection-pond",
      "personal-library",
      "house-possibility-outside",
    ]);
    expect(intent.memberFacingPrompt).toContain("Reflection Pond");
    expect(intent.memberFacingPrompt).toContain("Personal Library");
    expect(intent.memberFacingPrompt).toContain("Possibility House");
  });

  it("matches nature renewal experience group", () => {
    const match = matchExperienceGroupFromQuery("Show me outside");
    expect(match?.group.id).toBe("nature-renewal");
    expect(match?.locationIds).toContain("greenhouse");
  });

  it("uses exact asset file names from disk", () => {
    const greenhouse = getEstateLocationById("greenhouse");
    expect(greenhouse?.primaryAssetFileName).toBe("greenhouse-background.png");
  });
});
