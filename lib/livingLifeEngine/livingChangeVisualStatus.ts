import type { CompanionMotionKind } from "@/lib/companionEnvironmentIntelligence/types";
import type { LivingChangeSet } from "./types";
import { welcomeImageCapabilities } from "@/lib/companionEnvironmentIntelligence/welcomeImageCapabilities";

export type LivingChangeVisualEntry = {
  id: string;
  label: string;
  resolved: boolean;
  rendered: boolean;
  suppressionReason: string | null;
};

export type LivingChangeVisualStatus = {
  entries: LivingChangeVisualEntry[];
  allResolvedRendered: boolean;
};

function motionSuppressionReason(
  kind: CompanionMotionKind,
  photographId: string | undefined,
): string | null {
  const caps = welcomeImageCapabilities(photographId);
  if (caps.suppressCurtains && kind === "curtains") {
    return "Image does not show an open window — curtain motion suppressed";
  }
  if (caps.suppressHospitalitySteam && kind === "steam") {
    return "Mug and steam are baked into the photograph";
  }
  if (!caps.openWindow && kind === "foliage") {
    return "Window foliage motion suppressed — no visible open window";
  }
  return null;
}

/**
 * Dev-only truth check: logic changes do not count unless they render on screen.
 */
export function resolveLivingChangeVisualStatus(input: {
  livingChange?: LivingChangeSet | null;
  motionEnabled: CompanionMotionKind[];
  photographId?: string;
}): LivingChangeVisualStatus {
  const { livingChange, motionEnabled, photographId } = input;
  const entries: LivingChangeVisualEntry[] = [];

  if (livingChange?.kinsey && livingChange.kinsey !== "hidden") {
    entries.push({
      id: "kinsey",
      label: `Kinsey: ${livingChange.kinsey}`,
      resolved: true,
      rendered: true,
      suppressionReason: null,
    });
  }

  if (livingChange?.wildlife) {
    entries.push({
      id: "wildlife",
      label: `Wildlife: ${livingChange.wildlife}`,
      resolved: true,
      rendered: true,
      suppressionReason: null,
    });
  }

  if (livingChange?.heroMotion) {
    const reason = motionSuppressionReason(livingChange.heroMotion, photographId);
    const resolved = motionEnabled.includes(livingChange.heroMotion);
    entries.push({
      id: "hero-motion",
      label: `Hero motion: ${livingChange.heroMotion}`,
      resolved,
      rendered: resolved && !reason,
      suppressionReason: reason,
    });
  }

  for (const kind of motionEnabled) {
    if (livingChange?.heroMotion === kind) continue;
    const reason = motionSuppressionReason(kind, photographId);
    entries.push({
      id: `motion-${kind}`,
      label: `Motion: ${kind}`,
      resolved: true,
      rendered: !reason,
      suppressionReason: reason,
    });
  }

  const allResolvedRendered = entries.every(
    (entry) => !entry.resolved || entry.rendered,
  );

  return { entries, allResolvedRendered };
}
