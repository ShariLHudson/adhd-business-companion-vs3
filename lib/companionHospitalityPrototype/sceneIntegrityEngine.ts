import type { WelcomeSeason, WelcomeTimeOfDay } from "@/lib/welcomeLivingRoom";
import type { WelcomeWeather } from "@/lib/companionEnvironmentIntelligence";
import { COMPANION_PRESENCE_WELCOME_IMAGE_ID } from "@/lib/companionPresenceLibrary";
import {
  compositionForImage,
  type SafeCompositionEntry,
} from "./safeCompositionRegistry";
import type {
  AmbientAudioId,
  DirectorSceneState,
  HospitalityMotionId,
  HospitalityObjectId,
  LightingPhase,
  ResolvedHospitalityScene,
  SceneCorrection,
  SceneLifeEvent,
} from "./types";

const MAX_FOREGROUND_OBJECTS = 5;
const MAX_BOOKS = 4;

const BAKED_IN_MOTION = new Set<HospitalityMotionId>(["candle", "steam"]);

const OBJECT_PRIORITY: Record<HospitalityObjectId, number> = {
  cake: 1,
  "birthday-card": 1,
  suitcase: 1,
  "travel-guide": 1,
  "holiday-decor": 1,
  blanket: 2,
  cider: 2,
  tulips: 2,
  flowers: 2,
  coffee: 3,
  "tea-set": 3,
  cookies: 3,
  journal: 4,
  puzzle: 5,
};

const OBJECT_SEASONS: Partial<Record<HospitalityObjectId, WelcomeSeason[]>> = {
  tulips: ["spring"],
  flowers: ["spring", "summer", "autumn"],
  cider: ["autumn"],
  blanket: ["autumn", "winter"],
  "holiday-decor": ["holiday", "winter"],
};

const LIFE_EVENT_OBJECTS: Record<SceneLifeEvent, HospitalityObjectId[]> = {
  everyday: [],
  birthday: ["cake", "birthday-card", "flowers"],
  vacation: ["travel-guide", "suitcase"],
  recovery: ["tea-set", "journal", "blanket"],
  friday: ["flowers", "journal", "cookies"],
  holiday: ["holiday-decor", "cookies"],
};

const PRESET_LIFE_EVENT: Record<string, SceneLifeEvent> = {
  birthday: "birthday",
  "vacation-countdown": "vacation",
  "recovery-day": "recovery",
  "friday-celebration": "friday",
};

const IMAGE_BY_CONTEXT: Record<
  SceneLifeEvent,
  Partial<Record<WelcomeTimeOfDay, string>>
> = {
  everyday: {
    morning: COMPANION_PRESENCE_WELCOME_IMAGE_ID,
    afternoon: COMPANION_PRESENCE_WELCOME_IMAGE_ID,
    evening: "shari-evening-winddown",
    night: "shari-evening-winddown",
  },
  birthday: {
    afternoon: COMPANION_PRESENCE_WELCOME_IMAGE_ID,
    morning: COMPANION_PRESENCE_WELCOME_IMAGE_ID,
  },
  vacation: {
    morning: "shari-coffee-cup",
    afternoon: "shari-coffee-cup",
  },
  recovery: {
    afternoon: "shari-evening-winddown",
    evening: "shari-evening-winddown",
    night: "shari-evening-winddown",
  },
  friday: {
    afternoon: COMPANION_PRESENCE_WELCOME_IMAGE_ID,
  },
  holiday: {
    evening: COMPANION_PRESENCE_WELCOME_IMAGE_ID,
  },
};

function note(
  corrections: SceneCorrection[],
  field: string,
  requested: string,
  resolved: string,
  reason: string,
): void {
  if (requested === resolved) return;
  corrections.push({ field, requested, resolved, reason });
}

function inferLifeEvent(state: DirectorSceneState): SceneLifeEvent {
  if (state.presetId && PRESET_LIFE_EVENT[state.presetId]) {
    return PRESET_LIFE_EVENT[state.presetId]!;
  }
  if (
    state.hospitality.some((item) =>
      ["cake", "birthday-card"].includes(item),
    )
  ) {
    return "birthday";
  }
  if (
    state.hospitality.some((item) =>
      ["travel-guide", "suitcase"].includes(item),
    )
  ) {
    return "vacation";
  }
  if (state.hospitality.includes("holiday-decor")) return "holiday";
  if (
    state.presetId === "recovery-day" ||
    (state.hospitality.length === 1 && state.hospitality[0] === "tea-set")
  ) {
    return "recovery";
  }
  return "everyday";
}

function resolveSeason(
  season: WelcomeSeason,
  weather: WelcomeWeather,
  corrections: SceneCorrection[],
): WelcomeSeason {
  if (weather === "snow" && season === "summer") {
    const resolved = "winter";
    note(
      corrections,
      "season",
      season,
      resolved,
      "Snow belongs to winter — Iowa room adjusted",
    );
    return resolved;
  }
  return season;
}

function resolveWeather(
  weather: WelcomeWeather,
  season: WelcomeSeason,
  corrections: SceneCorrection[],
): WelcomeWeather {
  if (weather === "snow" && season === "summer") {
    note(
      corrections,
      "weather",
      weather,
      "clear",
      "Summer snow removed — clear sky outside",
    );
    return "clear";
  }
  if (weather === "snow" && season === "spring") {
    note(
      corrections,
      "weather",
      weather,
      "rain",
      "Late spring rarely holds snow — gentle rain instead",
    );
    return "rain";
  }
  return weather;
}

function resolveTimeOfDay(
  timeOfDay: WelcomeTimeOfDay,
  lighting: LightingPhase,
  corrections: SceneCorrection[],
): WelcomeTimeOfDay {
  if (
    (lighting === "night" || lighting === "evening") &&
    (timeOfDay === "morning" || timeOfDay === "afternoon")
  ) {
    const resolved: WelcomeTimeOfDay =
      lighting === "night" ? "night" : "evening";
    note(
      corrections,
      "timeOfDay",
      timeOfDay,
      resolved,
      "Time of day aligned with evening lighting",
    );
    return resolved;
  }
  if (
    (lighting === "morning" || lighting === "early-morning") &&
    timeOfDay === "night"
  ) {
    note(
      corrections,
      "timeOfDay",
      timeOfDay,
      "morning",
      "Morning light cannot sit at night",
    );
    return "morning";
  }
  return timeOfDay;
}

function resolveLighting(
  lighting: LightingPhase,
  timeOfDay: WelcomeTimeOfDay,
  weather: WelcomeWeather,
  corrections: SceneCorrection[],
): LightingPhase {
  if (timeOfDay === "night" && lighting !== "night" && lighting !== "evening") {
    note(
      corrections,
      "lighting",
      lighting,
      "night",
      "Night scenes use lamp and candle, not midday sun",
    );
    return "night";
  }
  if (
    timeOfDay === "morning" &&
    (lighting === "night" || lighting === "evening")
  ) {
    note(
      corrections,
      "lighting",
      lighting,
      "morning",
      "Morning visits open with soft daylight",
    );
    return "morning";
  }
  if (weather === "rain" && lighting === "golden-hour") {
    note(
      corrections,
      "lighting",
      lighting,
      "afternoon",
      "Rainy days soften golden hour into gray afternoon",
    );
    return "afternoon";
  }
  return lighting;
}

function resolveCompanionImage(
  requested: string,
  lifeEvent: SceneLifeEvent,
  timeOfDay: WelcomeTimeOfDay,
  corrections: SceneCorrection[],
): string {
  const suggested = IMAGE_BY_CONTEXT[lifeEvent][timeOfDay];
  if (!suggested) return requested;
  if (requested === suggested) return requested;

  const composition = compositionForImage(requested);
  if (composition.id === requested && !composition.hideLogo) {
    return requested;
  }

  if (lifeEvent !== "everyday" && requested !== suggested) {
    note(
      corrections,
      "companionImageId",
      requested,
      suggested,
      `${lifeEvent} scenes feel most believable in this photograph`,
    );
    return suggested;
  }
  return requested;
}

function isDaytime(
  timeOfDay: WelcomeTimeOfDay,
  lighting: LightingPhase,
): boolean {
  return (
    timeOfDay === "morning" ||
    timeOfDay === "afternoon" ||
    lighting === "morning" ||
    lighting === "early-morning" ||
    lighting === "golden-hour"
  );
}

function isEveningOrNight(
  timeOfDay: WelcomeTimeOfDay,
  lighting: LightingPhase,
): boolean {
  return (
    timeOfDay === "evening" ||
    timeOfDay === "night" ||
    lighting === "evening" ||
    lighting === "night"
  );
}

function motionAllowed(
  motion: HospitalityMotionId,
  ctx: {
    season: WelcomeSeason;
    weather: WelcomeWeather;
    timeOfDay: WelcomeTimeOfDay;
    lighting: LightingPhase;
    lifeEvent: SceneLifeEvent;
    imageId: string;
  },
): { allowed: boolean; reason?: string } {
  const { season, weather, timeOfDay, lighting, lifeEvent, imageId } = ctx;

  if (BAKED_IN_MOTION.has(motion) && imageId === COMPANION_PRESENCE_WELCOME_IMAGE_ID) {
    return { allowed: false, reason: "Already in the photograph" };
  }

  if (motion === "butterflies") {
    if (season === "winter" || weather === "snow") {
      return { allowed: false, reason: "Butterflies do not visit Iowa snow" };
    }
    if (season === "autumn") {
      return { allowed: false, reason: "Butterflies leave by autumn" };
    }
    if (!isDaytime(timeOfDay, lighting)) {
      return { allowed: false, reason: "Butterflies need daylight" };
    }
  }

  if (motion === "fireflies") {
    if (season === "winter" || weather === "snow") {
      return { allowed: false, reason: "Fireflies rest in winter" };
    }
    if (timeOfDay === "morning" || lighting === "morning") {
      return { allowed: false, reason: "Fireflies appear at dusk, not morning" };
    }
    if (!isEveningOrNight(timeOfDay, lighting) && season !== "summer") {
      return { allowed: false, reason: "Fireflies belong to warm summer evenings" };
    }
  }

  if (motion === "leaves") {
    if (season !== "autumn") {
      return { allowed: false, reason: "Falling leaves belong to autumn" };
    }
    if (weather === "snow") {
      return { allowed: false, reason: "Snow replaces autumn leaves" };
    }
  }

  if (motion === "foliage") {
    if (season === "winter" || weather === "snow") {
      return { allowed: false, reason: "Winter trees are bare outside" };
    }
  }

  if (motion === "snow") {
    if (season !== "winter" && season !== "holiday") {
      return { allowed: false, reason: "Snow stays outside Iowa winter windows" };
    }
    if (weather !== "snow") {
      return { allowed: false, reason: "Snow only when weather is snowy" };
    }
  }

  if (motion === "rain") {
    if (weather !== "rain" && weather !== "cloudy") {
      return { allowed: false, reason: "Rain only when the sky is wet" };
    }
  }

  if (motion === "sunlight") {
    if (weather === "rain" || weather === "snow") {
      return { allowed: false, reason: "No harsh sun through rain or snow" };
    }
    if (timeOfDay === "night" || lighting === "night") {
      return { allowed: false, reason: "Midday sun cannot light a night room" };
    }
  }

  if (motion === "birds" || motion === "cardinal") {
    if (timeOfDay === "night" || lighting === "night") {
      return { allowed: false, reason: "Birds quiet at night" };
    }
    if (motion === "cardinal" && season !== "winter") {
      return { allowed: false, reason: "Cardinal visits winter feeders" };
    }
  }

  if (motion === "shimmer") {
    if (weather !== "clear" || lifeEvent === "recovery") {
      return { allowed: false, reason: "Shimmer suits clear celebration, not recovery" };
    }
  }

  if (motion === "fireplace") {
    if (season === "summer" && weather === "clear" && timeOfDay === "morning") {
      return { allowed: false, reason: "Fireplace unlikely on a bright summer morning" };
    }
  }

  return { allowed: true };
}

function deriveMotion(
  requested: HospitalityMotionId[],
  ctx: Parameters<typeof motionAllowed>[1],
): {
  motion: HospitalityMotionId[];
  disabled: ResolvedHospitalityScene["disabledMotion"];
} {
  const disabled: ResolvedHospitalityScene["disabledMotion"] = [];
  const chosen = new Set<HospitalityMotionId>();

  for (const item of requested) {
    const verdict = motionAllowed(item, ctx);
    if (verdict.allowed) {
      chosen.add(item);
    } else {
      disabled.push({ id: item, reason: verdict.reason ?? "Not believable" });
    }
  }

  if (ctx.weather === "rain" && !chosen.has("rain")) {
    chosen.add("rain");
  }
  if (ctx.weather === "snow" && !chosen.has("snow")) {
    chosen.add("snow");
  }
  if (
    (ctx.weather === "rain" || ctx.weather === "cloudy") &&
    !chosen.has("lamplight")
  ) {
    chosen.add("lamplight");
  }
  if (ctx.weather === "rain" && chosen.has("sunlight")) {
    chosen.delete("sunlight");
    disabled.push({
      id: "sunlight",
      reason: "Rain softens the window — lamp warmth instead",
    });
  }
  if (ctx.season === "winter" && chosen.has("foliage")) {
    chosen.delete("foliage");
    disabled.push({
      id: "foliage",
      reason: "Bare branches outside — no green foliage",
    });
  }

  return { motion: [...chosen], disabled };
}

function objectAllowed(
  object: HospitalityObjectId,
  ctx: {
    season: WelcomeSeason;
    lifeEvent: SceneLifeEvent;
    hospitality: HospitalityObjectId[];
  },
): { allowed: boolean; reason?: string } {
  const seasons = OBJECT_SEASONS[object];
  if (seasons && !seasons.includes(ctx.season)) {
    return {
      allowed: false,
      reason: `${object} does not belong in ${ctx.season}`,
    };
  }

  const lifeObjects = LIFE_EVENT_OBJECTS[ctx.lifeEvent];
  const isLifeObject = lifeObjects.includes(object);
  const isCelebration =
    ctx.lifeEvent === "birthday" || ctx.lifeEvent === "friday";
  const isVacation = ctx.lifeEvent === "vacation";
  const isRecovery = ctx.lifeEvent === "recovery";

  if (isVacation && ["cake", "birthday-card"].includes(object)) {
    return { allowed: false, reason: "Birthday items stay home on vacation" };
  }
  if (isRecovery && ["cake", "suitcase", "holiday-decor"].includes(object)) {
    return { allowed: false, reason: "Recovery stays quiet — celebration clutter removed" };
  }
  if (
    ctx.lifeEvent === "birthday" &&
    ["suitcase", "travel-guide"].includes(object)
  ) {
    return { allowed: false, reason: "Vacation packing waits for another day" };
  }

  if (!isLifeObject && ctx.hospitality.includes(object)) {
    return { allowed: true };
  }

  return { allowed: true };
}

function rankObjects(
  requested: HospitalityObjectId[],
  ctx: Parameters<typeof objectAllowed>[1],
): {
  objects: HospitalityObjectId[];
  disabled: ResolvedHospitalityScene["disabledObjects"];
} {
  const disabled: ResolvedHospitalityScene["disabledObjects"] = [];
  const candidates: HospitalityObjectId[] = [];

  for (const object of requested) {
    const verdict = objectAllowed(object, ctx);
    if (verdict.allowed) {
      candidates.push(object);
    } else {
      disabled.push({ id: object, reason: verdict.reason ?? "Removed" });
    }
  }

  const sorted = [...new Set(candidates)].sort(
    (a, b) => (OBJECT_PRIORITY[a] ?? 9) - (OBJECT_PRIORITY[b] ?? 9),
  );

  const objects = sorted.slice(0, MAX_FOREGROUND_OBJECTS);
  for (const object of sorted.slice(MAX_FOREGROUND_OBJECTS)) {
    disabled.push({
      id: object,
      reason: `Restraint — room holds ${MAX_FOREGROUND_OBJECTS} meaningful objects`,
    });
  }

  return { objects, disabled };
}

function resolveAudio(
  requested: AmbientAudioId[],
  ctx: {
    weather: WelcomeWeather;
    timeOfDay: WelcomeTimeOfDay;
    season: WelcomeSeason;
    lifeEvent: SceneLifeEvent;
  },
): {
  audio: AmbientAudioId[];
  disabled: ResolvedHospitalityScene["disabledAudio"];
} {
  const disabled: ResolvedHospitalityScene["disabledAudio"] = [];
  const chosen = new Set<AmbientAudioId>();

  for (const item of requested) {
    let allowed = true;
    let reason = "";

    if (item === "birds" && ctx.timeOfDay === "night") {
      allowed = false;
      reason = "Birds quiet at night";
    }
    if (item === "thunder" && ctx.weather !== "rain") {
      allowed = false;
      reason = "Thunder follows rain";
    }
    if (item === "fireplace" && ctx.season === "summer" && ctx.weather === "clear") {
      allowed = false;
      reason = "Fireplace rests on clear summer days";
    }

    if (allowed) {
      chosen.add(item);
    } else {
      disabled.push({ id: item, reason });
    }
  }

  if (ctx.weather === "rain" && !chosen.has("rain")) chosen.add("rain");
  if (ctx.lifeEvent === "recovery" && chosen.size > 2) {
    const keep = [...chosen].slice(0, 2);
    chosen.clear();
    keep.forEach((id) => chosen.add(id));
  }

  return { audio: [...chosen], disabled };
}

function resolveWarmth(
  requested: number,
  season: WelcomeSeason,
  weather: WelcomeWeather,
  lighting: LightingPhase,
): number {
  let warmth = requested;
  if (weather === "snow") warmth = Math.max(warmth, 68);
  if (weather === "rain") warmth = Math.max(warmth, 54);
  if (season === "winter") warmth = Math.max(warmth, 60);
  if (lighting === "evening" || lighting === "night") warmth = Math.max(warmth, 56);
  if (season === "summer" && weather === "clear" && lighting === "morning") {
    warmth = Math.min(warmth, 52);
  }
  return Math.min(90, Math.max(20, warmth));
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function deriveAtmosphere(
  atmosphere: string,
  greeting: string,
  season: WelcomeSeason,
  weather: WelcomeWeather,
  lifeEvent: SceneLifeEvent,
  corrections: SceneCorrection[],
): string {
  const a = atmosphere.trim();
  const g = greeting.trim();
  if (!a) return a;
  if (normalizeText(a) === normalizeText(g)) {
    const resolved = atmosphereForContext(season, weather, lifeEvent);
    note(
      corrections,
      "atmosphere",
      a,
      resolved,
      "Atmosphere cannot repeat the greeting",
    );
    return resolved;
  }
  if (g && normalizeText(a).includes(normalizeText(g))) {
    const resolved = atmosphereForContext(season, weather, lifeEvent);
    note(
      corrections,
      "atmosphere",
      a,
      resolved,
      "Atmosphere shortened so the greeting stands alone",
    );
    return resolved;
  }
  return a;
}

function atmosphereForContext(
  season: WelcomeSeason,
  weather: WelcomeWeather,
  lifeEvent: SceneLifeEvent,
): string {
  if (lifeEvent === "birthday") return "Celebration — quietly prepared";
  if (lifeEvent === "vacation") return "Adventure approaching";
  if (lifeEvent === "recovery") return "Gentle recovery — no rush";
  if (lifeEvent === "friday") return "Friday light — week complete";
  if (weather === "rain") return "Rain on the window — lamp warm inside";
  if (weather === "snow") return "Iowa winter — come in from the cold";
  if (season === "autumn") return "Golden Iowa afternoon outside";
  if (season === "spring") return "Fresh Iowa morning — world waking";
  return "A familiar room on a real day";
}

function deriveGreetingCopy(
  greeting: string,
  invite: string,
  corrections: SceneCorrection[],
): { greeting: string; invite: string } {
  const g = greeting.trim();
  let i = invite.trim();
  if (g && i && normalizeText(g) === normalizeText(i)) {
    i = "I'm here whenever you're ready.";
    note(
      corrections,
      "invite",
      invite,
      i,
      "Invite cannot duplicate the greeting",
    );
  }
  return { greeting: g, invite: i };
}

function resolveBooks(
  books: string[],
  lifeEvent: SceneLifeEvent,
): string[] {
  const limit =
    lifeEvent === "recovery" ? Math.min(3, MAX_BOOKS) : MAX_BOOKS;
  return books.slice(0, limit);
}

/**
 * Scene Integrity Engine™
 * Controls are inputs; the resolved scene is one coherent Iowa day.
 */
export function resolveSceneIntegrity(
  controls: DirectorSceneState,
): ResolvedHospitalityScene {
  const corrections: SceneCorrection[] = [];
  const lifeEvent = inferLifeEvent(controls);

  let season = resolveSeason(controls.season, controls.weather, corrections);
  const weather = resolveWeather(controls.weather, season, corrections);
  season = resolveSeason(season, weather, corrections);

  const timeOfDay = resolveTimeOfDay(
    controls.timeOfDay,
    controls.lighting,
    corrections,
  );
  const lighting = resolveLighting(
    controls.lighting,
    timeOfDay,
    weather,
    corrections,
  );

  const companionImageId = resolveCompanionImage(
    controls.companionImageId,
    lifeEvent,
    timeOfDay,
    corrections,
  );

  const composition: SafeCompositionEntry =
    compositionForImage(companionImageId);

  const objectCtx = {
    season,
    lifeEvent,
    hospitality: controls.hospitality,
  };
  const { objects: hospitality, disabled: disabledObjects } = rankObjects(
    controls.hospitality,
    objectCtx,
  );

  const motionCtx = {
    season,
    weather,
    timeOfDay,
    lighting,
    lifeEvent,
    imageId: companionImageId,
  };
  const { motion, disabled: disabledMotion } = deriveMotion(
    controls.motion,
    motionCtx,
  );

  const { audio, disabled: disabledAudio } = resolveAudio(controls.audio, {
    weather,
    timeOfDay,
    season,
    lifeEvent,
  });

  const warmth = resolveWarmth(controls.warmth, season, weather, lighting);
  const books = resolveBooks(controls.books, lifeEvent);

  const greetingCopy = deriveGreetingCopy(
    controls.greeting,
    controls.invite,
    corrections,
  );
  const atmosphere = deriveAtmosphere(
    controls.atmosphere,
    greetingCopy.greeting,
    season,
    weather,
    lifeEvent,
    corrections,
  );

  return {
    presetId: controls.presetId,
    lifeEvent,
    atmosphere,
    season,
    weather,
    lighting,
    timeOfDay,
    companionImageId,
    hospitality,
    books,
    motion,
    audio,
    greeting: greetingCopy.greeting,
    invite: greetingCopy.invite,
    warmth,
    reduceMotion: controls.reduceMotion,
    audioEnabled: controls.audioEnabled,
    composition,
    showLogo: !composition.hideLogo,
    corrections,
    disabledMotion,
    disabledObjects,
    disabledAudio,
  };
}
