/**
 * Settings Fix 6 — Full celebrations must actually show a visual effect;
 * Simple must stay message-only; Off must show nothing. CelebrationEffects
 * (components/companion/CelebrationEffects.tsx) was fully built and
 * accessible but never mounted anywhere. CompanionPageClient.tsx is too
 * large to mount in a unit test, so this locks the mount site directly,
 * matching this codebase's established pattern for that file (see
 * CompanionPageClient.notificationSoundWiring.test.ts).
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const COMPANION_PAGE_CLIENT = path.join(
  process.cwd(),
  "app/companion/CompanionPageClient.tsx",
);

function recognitionRenderBlock(): string {
  const source = readFileSync(COMPANION_PAGE_CLIENT, "utf8");
  const match = source.match(
    /\{homeCalm \? null : isIdle && recognitionMoment[\s\S]*?<RecognitionMomentCard[\s\S]*?\) : null\}/,
  );
  if (!match) {
    throw new Error(
      "RecognitionMomentCard render block not found in CompanionPageClient.tsx",
    );
  }
  return match[0];
}

describe("CompanionPageClient — CelebrationEffects is mounted (Settings Fix 6)", () => {
  it("imports CelebrationEffects exactly once", () => {
    const source = readFileSync(COMPANION_PAGE_CLIENT, "utf8");
    const imports =
      source.match(
        /import \{ CelebrationEffects \} from "@\/components\/companion\/CelebrationEffects";/g,
      ) ?? [];
    expect(imports.length).toBe(1);
  });

  it("mounts CelebrationEffects alongside RecognitionMomentCard, under the same gate", () => {
    const block = recognitionRenderBlock();
    expect(block).toContain("<CelebrationEffects");
    expect(block).toContain("effect={recognitionMoment.plannedEffect}");
  });

  it("does not gate CelebrationEffects on anything the card itself isn't already gated on (same visibility as the text card)", () => {
    const source = readFileSync(COMPANION_PAGE_CLIENT, "utf8");
    const mountIndex = source.indexOf("<CelebrationEffects");
    const gateIndex = source.lastIndexOf(
      "homeCalm ? null : isIdle && recognitionMoment && !hasInlineIntelligenceOffer && !suppressInterventionCards",
      mountIndex,
    );
    expect(gateIndex).toBeGreaterThan(-1);
    expect(mountIndex - gateIndex).toBeLessThan(500);
  });
});
