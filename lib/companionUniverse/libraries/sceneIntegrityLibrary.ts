/** Scene Integrity Library™ — declarative rules the engine enforces. */

export type SceneIntegrityRule = {
  id: string;
  when: string;
  then: string;
  correct?: string;
};

export const SCENE_INTEGRITY_RULES: SceneIntegrityRule[] = [
  { id: "winter-no-butterflies", when: "season = winter OR weather = snow", then: "No butterflies", correct: "Remove butterflies from motion" },
  { id: "winter-bare-trees", when: "season = winter", then: "No green foliage", correct: "Remove foliage motion" },
  { id: "snow-outside-only", when: "weather = snow", then: "Snow outside window only", correct: "Mask snow to left/outside zone" },
  { id: "rain-no-harsh-sun", when: "weather = rain", then: "No harsh sunny window", correct: "Remove sunlight, add lamplight" },
  { id: "morning-no-fireflies", when: "time = morning", then: "No fireflies", correct: "Fireflies only at dusk/summer evening" },
  { id: "autumn-leaves-only", when: "motion includes leaves", then: "season must be autumn", correct: "Remove leaves outside autumn" },
  { id: "birthday-no-vacation", when: "lifeEvent = birthday", then: "No suitcase or travel guide", correct: "Remove vacation objects" },
  { id: "recovery-restraint", when: "lifeEvent = recovery", then: "Max 3 books, no celebration clutter", correct: "Simplify objects and audio" },
  { id: "object-cap", when: "foreground objects > 5", then: "Rank by priority, keep top 5", correct: "Restraint before clutter" },
  { id: "hospitality-not-personalization", when: "any render", then: "Home stays Shari's — only preparation changes", correct: "Guest feels remembered, never customized-by-app" },
  { id: "no-placeholder-shapes", when: "render", then: "Never show beige blocks or missing assets", correct: "Hide — text in copy panel only" },
  { id: "no-duplicate-greeting", when: "greeting = invite", then: "Rewrite invite", correct: "One greeting block only" },
  { id: "logo-on-mug", when: "image = shari-i-am-here-2", then: "Hide separate logo", correct: "Mug already carries brand" },
  { id: "communication-anchor-always", when: "any primary screen", then: "Chat and mic must remain reachable", correct: "Companion Communication Anchor™ — never hidden behind menus, overlays, or life layers" },
  { id: "environmental-truth", when: "any motion or atmosphere detail", then: "Every effect must trace to a believable cause", correct: "Environmental Truth™ — cause before animation; one coherent Iowa story" },
  { id: "homestead-time", when: "any room render", then: "House lives in the guest's actual day", correct: "Homestead Time™ — seven periods, continuous light, not theme switching" },
];
