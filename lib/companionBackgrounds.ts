// Slim v3 background engine — organic scenery that shifts by mood + time of day.
// Pools are carried over from the v2 background library (page × time-of-day),
// but the selection here is a pure deterministic pick keyed on a seed, so it
// stays stable within a context yet changes when the mood (e.g. music type) or
// time of day changes. No adaptive/energy dependencies.

export const BACKGROUND_BASE = "/backgrounds" as const;

export type ScenePage = "today" | "focus" | "business" | "progress" | "recovery";
export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

/** Light warm wash over photos so dark text + glass cards stay readable. */
export const SCENE_OVERLAY = "rgba(252, 246, 236, 0.62)";

const B = BACKGROUND_BASE;

/** Image pools by page × time-of-day (from public/backgrounds). */
export const BACKGROUND_GROUPS: Record<
  ScenePage,
  Record<TimeOfDay, readonly string[]>
> = {
  today: {
    morning: [
      `${B}/today/morning-bg.png`,
      `${B}/today/background_01.png`,
      `${B}/today/background_02.png`,
      `${B}/today/background_05.png`,
      `${B}/progress/serene-sunrise-bg.png`,
    ],
    afternoon: [
      `${B}/today/afternoon-bg.png`,
      `${B}/today/background_04.png`,
      `${B}/today/background_05.png`,
      `${B}/today/background_01.png`,
    ],
    evening: [
      `${B}/evening/evening-bg.png`,
      `${B}/evening/living-room-at-twilight-bg.png`,
      `${B}/today/background_05.png`,
    ],
    night: [
      `${B}/evening/night-bg.png`,
      `${B}/evening/living-room-at-twilight-bg.png`,
      `${B}/low-energy-bg.png`,
    ],
  },
  focus: {
    morning: [
      `${B}/focus/background_06.png`,
      `${B}/focus/background_07.png`,
      `${B}/progress/serene-sunrise-bg.png`,
    ],
    afternoon: [
      `${B}/focus/background_08.png`,
      `${B}/focus/background_14.png`,
      `${B}/focus/background_15.png`,
    ],
    evening: [
      `${B}/focus/background_16.png`,
      `${B}/evening/living-room-at-twilight-bg.png`,
      `${B}/recovery/background_09.png`,
    ],
    night: [
      `${B}/focus/background_17.png`,
      `${B}/evening/night-bg.png`,
      `${B}/recovery/background_11.png`,
    ],
  },
  business: {
    morning: [
      `${B}/business/background_18.png`,
      `${B}/business/background_19.png`,
      `${B}/today/morning-bg.png`,
    ],
    afternoon: [
      `${B}/business/background_19.png`,
      `${B}/business/background_20.png`,
      `${B}/today/afternoon-bg.png`,
    ],
    evening: [
      `${B}/business/background_20.png`,
      `${B}/evening/evening-bg.png`,
      `${B}/business/background_18.png`,
    ],
    night: [
      `${B}/business/background_18.png`,
      `${B}/evening/night-bg.png`,
      `${B}/evening/living-room-at-twilight-bg.png`,
    ],
  },
  progress: {
    morning: [
      `${B}/progress/serene-sunrise-bg.png`,
      `${B}/progress/blue-sky-clouds-bg.png`,
      `${B}/progress/background_10.png`,
    ],
    afternoon: [
      `${B}/progress/background_10.png`,
      `${B}/progress/background_12.png`,
      `${B}/progress/blue-sky-clouds-bg.png`,
    ],
    evening: [
      `${B}/progress/background_12.png`,
      `${B}/progress/serene-sunrise-bg.png`,
      `${B}/evening/evening-bg.png`,
    ],
    night: [
      `${B}/progress/background_12.png`,
      `${B}/evening/night-bg.png`,
      `${B}/progress/blue-sky-clouds-bg.png`,
    ],
  },
  recovery: {
    morning: [
      `${B}/overwhelm-reset-bg.png`,
      `${B}/low-energy-bg.png`,
      `${B}/recovery/background_09.png`,
      `${B}/recovery/background_11.png`,
    ],
    afternoon: [
      `${B}/recovery/background_09.png`,
      `${B}/recovery/background_11.png`,
      `${B}/low-energy-bg.png`,
    ],
    evening: [
      `${B}/recovery/background_11.png`,
      `${B}/recovery/background_13.png`,
      `${B}/evening/living-room-at-twilight-bg.png`,
    ],
    night: [
      `${B}/recovery/background_13.png`,
      `${B}/low-energy-bg.png`,
      `${B}/evening/night-bg.png`,
    ],
  },
};

export function getTimeOfDay(hour: number = new Date().getHours()): TimeOfDay {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

function stableHash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Pick one scene for a page. Deterministic on (seed, page, time-of-day): the
 * same seed yields the same image within an hour, but changing the seed (e.g.
 * the audio mood) or the time of day swaps it organically.
 */
export function pickScene(
  page: ScenePage,
  seed: string,
  hour: number = new Date().getHours(),
): string {
  const tod = getTimeOfDay(hour);
  const pool = BACKGROUND_GROUPS[page]?.[tod] ?? BACKGROUND_GROUPS.today[tod];
  if (pool.length === 0) return `${B}/today/morning-bg.png`;
  return pool[stableHash(`${seed}:${page}:${tod}`) % pool.length]!;
}
