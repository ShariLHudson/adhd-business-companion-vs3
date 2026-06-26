import type { FocusLandscapeSpace, FocusLandscapeSpaceId } from "./types";

export const FOCUS_LANDSCAPE_GLOBAL_RULES = [
  "environment-first-interface-second",
  "edge-based-life-living-border",
  "no-competing-motion-behind-text",
  "shari-nearby-or-ambient-never-central",
  "transitions-are-movement-through-land",
  "no-pop-modals-or-load-screens",
] as const;

export const FOCUS_LANDSCAPE_FORBIDDEN = [
  "ui-first-dashboard",
  "modal-transition",
  "load-screen-transition",
  "center-screen-animation",
  "scoring-pressure",
  "flashing-visuals",
  "countdown-urgency",
  "shari-centered-in-focus",
] as const;

export function violatesFocusLandscapeRule(patternId: string): boolean {
  const normalized = patternId.trim().toLowerCase().replace(/\s+/g, "-");
  return FOCUS_LANDSCAPE_FORBIDDEN.some(
    (f) => normalized.includes(f) || f.includes(normalized),
  );
}

export const FOCUS_LANDSCAPE_SPACES: Record<
  FocusLandscapeSpaceId,
  FocusLandscapeSpace
> = {
  "garden-path": {
    id: "garden-path",
    name: "Garden Path™",
    hubRole: "entry",
    emotionalStates: ["overwhelmed", "mentally-blocked", "unsure-where-to-start"],
    emotionalPurpose: "Turn confusion into one visible next action",
    environment:
      "Narrow garden path, morning fog, soft sunlight through trees, forward stones",
    movementLanguage: [
      "fog-drifting",
      "light-shifting",
      "leaves-falling",
      "slow-forward-pull",
    ],
    uiFunctionCluster: [
      "next-small-step",
      "prioritize-options",
      "break-smaller",
    ],
    placeId: "garden-path",
    sharisPresence: "nearby",
  },
  "meadow-lake": {
    id: "meadow-lake",
    name: "Meadow / Lake™",
    hubRole: "center",
    emotionalStates: ["overstimulated", "mentally-fatigued", "emotionally-full"],
    emotionalPurpose: "Reduce overload → restore baseline regulation",
    environment:
      "Wide open meadow, lake horizon, soft sky, wind through grass, low object density",
    movementLanguage: ["wind", "water", "distant-birds", "slow-clouds"],
    uiFunctionCluster: ["breathe-reset"],
    placeId: "sunroom-over-pond",
    sharisPresence: "nearby",
  },
  "meadow-stretch": {
    id: "meadow-stretch",
    name: "Forest Clearing™",
    hubRole: "subspace",
    parentSpaceId: "meadow-lake",
    emotionalStates: ["body-held-tension", "mental-fatigue"],
    emotionalPurpose: "Invite physical release",
    environment:
      "Forest clearing at meadow edge, circular open space, trees framing outer edge",
    movementLanguage: ["gentle-wind", "grass-sway"],
    uiFunctionCluster: ["stretch-break", "calm-moment"],
    placeId: "garden",
    sharisPresence: "ambient",
  },
  "forest-pavilion": {
    id: "forest-pavilion",
    name: "Forest Pavilion™",
    hubRole: "subspace",
    parentSpaceId: "meadow-lake",
    emotionalStates: ["overwhelmed-but-working", "need-sensory-isolation"],
    emotionalPurpose: "Sound regulation without visual stimulation",
    environment:
      "Covered wooden structure, rain outside, soft filtered light, enclosed calm acoustics",
    movementLanguage: ["rain-on-roof", "dripping-leaves", "filtered-light"],
    uiFunctionCluster: [
      "calm-audio",
      "focus-audio",
      "nature-audio",
      "sleep-audio",
    ],
    placeId: "greenhouse",
    sharisPresence: "ambient",
  },
  "meadow-object-field": {
    id: "meadow-object-field",
    name: "Meadow Object Field™",
    hubRole: "subspace",
    parentSpaceId: "meadow-lake",
    emotionalStates: ["low-energy", "emotional-depletion"],
    emotionalPurpose: "Gentle dopamine restoration",
    environment:
      "Soft meadow clearing, floating leaves, lanterns, smooth stones, drifting petals",
    movementLanguage: ["slow-playful-drift", "lantern-sway"],
    uiFunctionCluster: ["brain-break-games"],
    placeId: "garden",
    sharisPresence: "ambient",
  },
  "horizon-trail": {
    id: "horizon-trail",
    name: "Horizon Trail™",
    hubRole: "subspace",
    parentSpaceId: "meadow-lake",
    emotionalStates: ["stuck-energy", "restlessness"],
    emotionalPurpose: "Trigger real-world motion, not digital interaction",
    environment:
      "Long open path into distance, prairie edges, sun on horizon, birds across sky",
    movementLanguage: [
      "forward-perspective",
      "birds-crossing",
      "wind-direction-cues",
    ],
    uiFunctionCluster: ["walk-reminder"],
    placeId: "outlook-point",
    sharisPresence: "ambient",
  },
  "deep-forest": {
    id: "deep-forest",
    name: "Deep Forest™",
    hubRole: "subspace",
    parentSpaceId: "meadow-lake",
    emotionalStates: ["overstimulated", "shutdown-mode", "emotional-overload"],
    emotionalPurpose: "Complete nervous system downshift",
    environment:
      "Dense forest, fog layers, minimal contrast, extremely low motion",
    movementLanguage: ["almost-none", "occasional-leaf", "distant-wind"],
    uiFunctionCluster: ["sensory-reset"],
    placeId: "garden-path",
    sharisPresence: "ambient",
  },
};

/** Master map — natural transitions between spaces (no menus) */
export const FOCUS_LANDSCAPE_CONNECTIONS: Record<
  FocusLandscapeSpaceId,
  readonly FocusLandscapeSpaceId[]
> = {
  "garden-path": ["meadow-lake"],
  "meadow-lake": [
    "garden-path",
    "meadow-stretch",
    "forest-pavilion",
    "meadow-object-field",
    "horizon-trail",
    "deep-forest",
  ],
  "meadow-stretch": ["meadow-lake"],
  "forest-pavilion": ["meadow-lake", "deep-forest"],
  "meadow-object-field": ["meadow-lake"],
  "horizon-trail": ["meadow-lake"],
  "deep-forest": ["meadow-lake", "forest-pavilion"],
};

export function focusLandscapeSpace(
  id: FocusLandscapeSpaceId,
): FocusLandscapeSpace {
  return FOCUS_LANDSCAPE_SPACES[id];
}
