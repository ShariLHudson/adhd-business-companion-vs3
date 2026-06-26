import type { CompanionPlaceId } from "@/lib/companionUniverse/types";
import type { WelcomeSeason, WelcomeTimeOfDay } from "@/lib/welcomeLivingRoom";
import type { WelcomeWeather } from "@/lib/companionEnvironmentIntelligence";
import { COMPANION_PRESENCE_WELCOME_IMAGE_ID } from "@/lib/companionPresenceLibrary";
import { placeById } from "@/lib/companionUniverse/libraries/placeLibrary";
import {
  BUSINESS_BOOKS,
  CREATIVE_BOOKS,
  FRIDAY_BOOKS,
  RECOVERY_BOOKS,
} from "./bookSets";
import { presetById } from "./scenePresets";
import type {
  AmbientAudioId,
  DirectorSceneState,
  HospitalityMotionId,
  HospitalityObjectId,
  LightingPhase,
  SceneLifeEvent,
} from "./types";

/** Experience-facing weather — maps to engine weather + motion. */
export type DirectorWeather =
  | "sunny"
  | "cloudy"
  | "rain"
  | "thunderstorm"
  | "snow"
  | "windy";

/** Experience-facing time — maps to lighting + timeOfDay. */
export type DirectorTime =
  | "sunrise"
  | "morning"
  | "afternoon"
  | "golden-hour"
  | "evening"
  | "night";

export type DirectorLifeEvent =
  | "none"
  | "birthday"
  | "vacation-countdown"
  | "project-complete"
  | "recovery"
  | "first-day"
  | "holiday"
  | "anniversary"
  | "welcome-back"
  | "launch-week";

export type AtmosphereTone =
  | "calm"
  | "cozy"
  | "reflective"
  | "creative"
  | "celebratory"
  | "encouraging"
  | "focused"
  | "quiet";

/** High-level direction — what the director describes, not engine knobs. */
export type DirectorBrief = {
  placeId: CompanionPlaceId;
  season: WelcomeSeason;
  weather: DirectorWeather;
  time: DirectorTime;
  lifeEvent: DirectorLifeEvent;
  atmosphereTone: AtmosphereTone;
  /** Iowa Reality™ — block impossible combinations. */
  iowaReality: boolean;
  /** Future experimentation — bypass Iowa rules when true. */
  fantasyMode: boolean;
};

export type ExperienceScenario = {
  id: string;
  label: string;
  emoji?: string;
  brief: Partial<DirectorBrief>;
  presetId?: string;
};

export const DEFAULT_DIRECTOR_BRIEF: DirectorBrief = {
  placeId: "living-room",
  season: "spring",
  weather: "sunny",
  time: "morning",
  lifeEvent: "none",
  atmosphereTone: "cozy",
  iowaReality: true,
  fantasyMode: false,
};

export const DIRECTOR_DEMO_PROFILES = [
  { key: "tea-gardener", label: "Tea + Gardening" },
  { key: "coffee-traveler", label: "Coffee + Dogs" },
  { key: "reading-quiet", label: "Reading + Quiet" },
  { key: "creative-color", label: "Creative + Color" },
  { key: "traveler", label: "Traveler" },
  { key: "minimalist", label: "Minimalist" },
] as const;

export const SEASON_EXPERIENCES: ExperienceScenario[] = [
  {
    id: "spring",
    label: "Spring",
    emoji: "🌷",
    brief: { season: "spring", weather: "sunny", time: "morning", atmosphereTone: "encouraging" },
    presetId: "iowa-spring-morning",
  },
  {
    id: "summer",
    label: "Summer",
    emoji: "☀️",
    brief: { season: "summer", weather: "sunny", time: "afternoon", atmosphereTone: "celebratory" },
    presetId: "friday-celebration",
  },
  {
    id: "autumn",
    label: "Autumn",
    emoji: "🍂",
    brief: { season: "autumn", weather: "sunny", time: "golden-hour", atmosphereTone: "reflective" },
    presetId: "iowa-autumn-afternoon",
  },
  {
    id: "winter",
    label: "Winter",
    emoji: "❄️",
    brief: { season: "winter", weather: "snow", time: "evening", atmosphereTone: "cozy" },
    presetId: "winter-snow",
  },
];

export const HOSPITALITY_EXPERIENCES: ExperienceScenario[] = [
  {
    id: "recovery",
    label: "Recovery",
    emoji: "🫖",
    brief: { lifeEvent: "recovery", weather: "rain", time: "afternoon", atmosphereTone: "quiet" },
    presetId: "recovery-day",
  },
  {
    id: "birthday",
    label: "Birthday",
    emoji: "🎂",
    brief: { lifeEvent: "birthday", weather: "sunny", time: "golden-hour", atmosphereTone: "celebratory" },
    presetId: "birthday",
  },
  {
    id: "vacation",
    label: "Vacation",
    emoji: "✈️",
    brief: { lifeEvent: "vacation-countdown", weather: "sunny", time: "morning", atmosphereTone: "encouraging" },
    presetId: "vacation-countdown",
  },
  {
    id: "launch",
    label: "Launch",
    emoji: "🚀",
    brief: { lifeEvent: "launch-week", weather: "sunny", time: "morning", atmosphereTone: "focused" },
  },
  {
    id: "monday-morning",
    label: "Monday Morning",
    emoji: "☕",
    brief: { lifeEvent: "first-day", season: "spring", weather: "cloudy", time: "morning", atmosphereTone: "encouraging" },
  },
  {
    id: "friday-evening",
    label: "Friday Evening",
    emoji: "🌅",
    brief: { lifeEvent: "none", season: "summer", weather: "sunny", time: "golden-hour", atmosphereTone: "celebratory" },
    presetId: "friday-celebration",
  },
  {
    id: "snow-day",
    label: "Snow Day",
    emoji: "🌨️",
    brief: { season: "winter", weather: "snow", time: "afternoon", atmosphereTone: "cozy" },
    presetId: "winter-snow",
  },
  {
    id: "rainy-afternoon",
    label: "Rainy Afternoon",
    emoji: "🌧️",
    brief: { weather: "rain", time: "afternoon", atmosphereTone: "calm" },
    presetId: "cozy-rainy-tuesday",
  },
];

const FAVORITES_KEY = "companion-directors-studio-favorites-v2";
const SCENE_LIBRARY_KEY = "companion-directors-studio-library-v2";

export function mergeBrief(
  base: DirectorBrief,
  partial: Partial<DirectorBrief>,
): DirectorBrief {
  return { ...base, ...partial };
}

export function briefFromScenario(scenario: ExperienceScenario): DirectorBrief {
  return mergeBrief(DEFAULT_DIRECTOR_BRIEF, scenario.brief);
}

function mapWeather(weather: DirectorWeather): WelcomeWeather {
  switch (weather) {
    case "sunny":
      return "clear";
    case "cloudy":
    case "windy":
      return "cloudy";
    case "rain":
    case "thunderstorm":
      return "rain";
    case "snow":
      return "snow";
    default:
      return "clear";
  }
}

function mapTime(time: DirectorTime): {
  timeOfDay: WelcomeTimeOfDay;
  lighting: LightingPhase;
} {
  switch (time) {
    case "sunrise":
      return { timeOfDay: "morning", lighting: "early-morning" };
    case "morning":
      return { timeOfDay: "morning", lighting: "morning" };
    case "afternoon":
      return { timeOfDay: "afternoon", lighting: "afternoon" };
    case "golden-hour":
      return { timeOfDay: "afternoon", lighting: "golden-hour" };
    case "evening":
      return { timeOfDay: "evening", lighting: "evening" };
    case "night":
      return { timeOfDay: "night", lighting: "night" };
    default:
      return { timeOfDay: "morning", lighting: "morning" };
  }
}

function mapLifeEvent(event: DirectorLifeEvent): SceneLifeEvent {
  switch (event) {
    case "birthday":
    case "anniversary":
      return "birthday";
    case "vacation-countdown":
      return "vacation";
    case "recovery":
      return "recovery";
    case "holiday":
      return "holiday";
    case "project-complete":
    case "launch-week":
      return "friday";
    default:
      return "everyday";
  }
}

function objectsForLifeEvent(event: DirectorLifeEvent): HospitalityObjectId[] {
  switch (event) {
    case "birthday":
    case "anniversary":
      return ["cake", "birthday-card", "flowers"];
    case "vacation-countdown":
      return ["travel-guide", "suitcase", "coffee"];
    case "recovery":
      return ["tea-set", "journal", "blanket"];
    case "holiday":
      return ["holiday-decor", "cookies"];
    case "project-complete":
    case "launch-week":
      return ["flowers", "journal"];
    case "first-day":
      return ["coffee"];
    case "welcome-back":
      return ["tea-set", "cookies"];
    default:
      return ["coffee"];
  }
}

function motionForContext(
  brief: DirectorBrief,
  weather: WelcomeWeather,
): HospitalityMotionId[] {
  const motion = new Set<HospitalityMotionId>();

  if (weather === "rain" || brief.weather === "thunderstorm") {
    motion.add("rain");
    motion.add("lamplight");
    motion.add("curtains");
  }
  if (brief.weather === "thunderstorm") motion.add("thunder");
  if (weather === "snow") {
    motion.add("snow");
    motion.add("lamplight");
    if (brief.season === "winter") motion.add("cardinal");
  }
  if (weather === "clear" && brief.time !== "night") {
    motion.add("sunlight");
  }
  if (brief.season === "spring" || brief.season === "summer") {
    motion.add("foliage");
    motion.add("curtains");
  }
  if (brief.season === "autumn") {
    motion.add("leaves");
    motion.add("foliage");
  }
  if (brief.season === "summer" && (brief.time === "evening" || brief.time === "golden-hour")) {
    motion.add("fireflies");
  }
  if (brief.season === "spring" && brief.weather === "sunny") {
    motion.add("butterflies");
  }
  if (brief.weather === "windy") motion.add("curtains");
  if (brief.atmosphereTone === "cozy" || brief.time === "evening" || brief.time === "night") {
    motion.add("lamplight");
  }
  if (brief.lifeEvent === "launch-week") motion.add("shimmer");

  return [...motion];
}

function audioForContext(
  brief: DirectorBrief,
  weather: WelcomeWeather,
): AmbientAudioId[] {
  const audio = new Set<AmbientAudioId>();
  if (weather === "rain" || brief.weather === "thunderstorm") {
    audio.add("rain");
    if (brief.weather === "thunderstorm") audio.add("thunder");
  }
  if (weather === "snow" || brief.time === "evening") audio.add("fireplace");
  if (brief.weather === "windy") audio.add("wind");
  if (brief.time === "morning" || brief.time === "sunrise") audio.add("birds");
  if (brief.atmosphereTone === "calm" || brief.atmosphereTone === "quiet") {
    audio.add("wind-chimes");
  }
  if (brief.lifeEvent === "recovery") return ["rain"];
  return audio.size > 0 ? [...audio] : ["birds"];
}

function booksForContext(brief: DirectorBrief): string[] {
  const life = mapLifeEvent(brief.lifeEvent);
  if (life === "recovery") return RECOVERY_BOOKS.slice(0, 3);
  if (life === "friday" || brief.lifeEvent === "launch-week") return FRIDAY_BOOKS.slice(0, 3);
  if (brief.atmosphereTone === "creative") return CREATIVE_BOOKS.slice(0, 3);
  if (brief.atmosphereTone === "focused") return BUSINESS_BOOKS.slice(0, 3);
  return CREATIVE_BOOKS.slice(0, 3);
}

function warmthForContext(brief: DirectorBrief, weather: WelcomeWeather): number {
  if (weather === "snow") return 72;
  if (weather === "rain") return 58;
  if (brief.atmosphereTone === "cozy") return 64;
  if (brief.time === "night" || brief.time === "evening") return 60;
  if (brief.season === "summer") return 46;
  return 52;
}

function atmosphereLine(brief: DirectorBrief, placeName: string): string {
  const tone: Record<AtmosphereTone, string> = {
    calm: "A calm day — nothing rushed",
    cozy: "Cozy inside while the world does its thing outside",
    reflective: "Room for reflection — the day can wait",
    creative: "Ideas have room to breathe here",
    celebratory: "Something worth marking — quietly prepared",
    encouraging: "A gentle start — we'll take it together",
    focused: "Clear enough to begin one honest thing",
    quiet: "Quiet recovery — the room holds you",
  };
  const eventLines: Partial<Record<DirectorLifeEvent, string>> = {
    birthday: "Celebration — quietly prepared",
    "vacation-countdown": "Adventure approaching — three mornings away",
    recovery: "Gentle recovery — no rush",
    "launch-week": "Launch week — the room is ready when you are",
    "project-complete": "You finished something — it matters",
    "welcome-back": "Welcome back — the house kept your place",
    "first-day": "Fresh Monday — one step at a time",
    holiday: "Holiday warmth — traditions remembered",
    anniversary: "A day worth honoring",
  };
  if (brief.lifeEvent !== "none" && eventLines[brief.lifeEvent]) {
    return eventLines[brief.lifeEvent]!;
  }
  if (brief.weather === "snow") return "Iowa winter — come in from the cold";
  if (brief.weather === "rain" || brief.weather === "thunderstorm") {
    return "Rain on the window — lamp warm inside";
  }
  return `${tone[brief.atmosphereTone]} · ${placeName}`;
}

function greetingForContext(brief: DirectorBrief, placePromise: string): string {
  const eventGreetings: Partial<Record<DirectorLifeEvent, string>> = {
    birthday: "Happy Birthday.",
    anniversary: "Happy Anniversary.",
    "vacation-countdown": "Only three mornings until your adventure.",
    recovery: "We'll keep today gentle.",
    "project-complete": "You finished something that mattered.",
    "launch-week": "Launch week — I'm glad you're here.",
    "welcome-back": "Welcome back.",
    "first-day": "Good morning — fresh start today.",
    holiday: "Happy holidays.",
  };
  if (brief.lifeEvent !== "none" && eventGreetings[brief.lifeEvent]) {
    return eventGreetings[brief.lifeEvent]!;
  }
  if (brief.time === "morning" || brief.time === "sunrise") return "Good morning, Shari.";
  if (brief.time === "evening" || brief.time === "night") return "Come in from the day.";
  return placePromise.split(".")[0] ?? "It's good to see you.";
}

function inviteForContext(brief: DirectorBrief): string {
  const invites: Record<AtmosphereTone, string> = {
    calm: "Stay as long as you need.",
    cozy: "The room is warm. Take your time.",
    reflective: "What's on your heart today?",
    creative: "What wants to come through today?",
    celebratory: "I'm really glad we get to mark this together.",
    encouraging: "I'm here for you. What's on your mind today?",
    focused: "What feels like the one honest next step?",
    quiet: "There's no hurry here.",
  };
  return invites[brief.atmosphereTone];
}

function imageForContext(brief: DirectorBrief, timeOfDay: WelcomeTimeOfDay): string {
  if (brief.lifeEvent === "recovery" || brief.time === "evening" || brief.time === "night") {
    return "shari-evening-winddown";
  }
  if (brief.lifeEvent === "vacation-countdown") return "shari-coffee-cup";
  if (timeOfDay === "evening" || timeOfDay === "night") return "shari-evening-winddown";
  return COMPANION_PRESENCE_WELCOME_IMAGE_ID;
}

function applyIowaReality(brief: DirectorBrief): DirectorBrief {
  if (!brief.iowaReality || brief.fantasyMode) return brief;
  let { season, weather } = brief;
  if (weather === "snow" && season === "summer") {
    season = "winter";
  }
  if (weather === "snow" && season === "spring") {
    weather = "rain";
  }
  if (weather === "snow" && season !== "winter" && season !== "holiday") {
    season = "winter";
  }
  return { ...brief, season, weather };
}

/**
 * Companion Brain prepares a complete scene from a director's brief.
 * Controls are derived — the director describes the day, not the engine.
 */
export function prepareHomeFromBrief(brief: DirectorBrief): DirectorSceneState {
  const resolvedBrief = applyIowaReality(brief);
  const place = placeById(resolvedBrief.placeId);
  const preset = resolvedBrief.lifeEvent === "none"
    ? undefined
    : HOSPITALITY_EXPERIENCES.find(
        (scenario) => scenario.brief.lifeEvent === resolvedBrief.lifeEvent,
      )?.presetId;

  const presetState = preset ? presetById(preset) : undefined;
  const weather = mapWeather(resolvedBrief.weather);
  const { timeOfDay, lighting } = mapTime(resolvedBrief.time);
  const lifeScene = mapLifeEvent(resolvedBrief.lifeEvent);

  const hospitality = objectsForLifeEvent(resolvedBrief.lifeEvent);
  const motion = motionForContext(resolvedBrief, weather);
  const audio = audioForContext(resolvedBrief, weather);

  return {
    presetId: presetState?.id ?? null,
    season: resolvedBrief.season === "holiday" ? "winter" : resolvedBrief.season,
    weather,
    lighting,
    timeOfDay,
    atmosphere: atmosphereLine(resolvedBrief, place.name),
    hospitality: presetState?.hospitality ?? hospitality,
    books: presetState?.books ?? booksForContext(resolvedBrief),
    motion: presetState?.motion ?? motion,
    audio: presetState?.audio ?? audio,
    greeting: presetState?.greeting ?? greetingForContext(resolvedBrief, place.emotionalPromise),
    invite: presetState?.invite ?? inviteForContext(resolvedBrief),
    companionImageId:
      presetState?.companionImageId ?? imageForContext(resolvedBrief, timeOfDay),
    reduceMotion: resolvedBrief.atmosphereTone === "quiet" || lifeScene === "recovery",
    warmth: presetState?.warmth ?? warmthForContext(resolvedBrief, weather),
    audioEnabled: true,
  };
}

export function briefFromDirectorState(state: DirectorSceneState): DirectorBrief {
  const weather: DirectorWeather =
    state.weather === "clear"
      ? "sunny"
      : state.weather === "cloudy"
        ? "cloudy"
        : state.weather === "rain"
          ? state.motion.includes("thunder")
            ? "thunderstorm"
            : "rain"
          : "snow";

  let time: DirectorTime = "morning";
  if (state.lighting === "early-morning") time = "sunrise";
  else if (state.lighting === "golden-hour") time = "golden-hour";
  else if (state.lighting === "evening") time = "evening";
  else if (state.lighting === "night" || state.timeOfDay === "night") time = "night";
  else if (state.timeOfDay === "afternoon") time = "afternoon";

  let lifeEvent: DirectorLifeEvent = "none";
  if (state.presetId === "birthday") lifeEvent = "birthday";
  else if (state.presetId === "vacation-countdown") lifeEvent = "vacation-countdown";
  else if (state.presetId === "recovery-day") lifeEvent = "recovery";
  else if (state.presetId === "friday-celebration") lifeEvent = "project-complete";

  return {
    placeId: "living-room",
    season: state.season,
    weather,
    time,
    lifeEvent,
    atmosphereTone: "cozy",
    iowaReality: true,
    fantasyMode: false,
  };
}

/** Production-like surprise — Companion Brain chooses the whole day. */
export function productionSurpriseBrief(): DirectorBrief {
  const scenarios = [
    ...SEASON_EXPERIENCES,
    ...HOSPITALITY_EXPERIENCES,
    {
      id: "everyday",
      label: "Everyday",
      brief: {
        lifeEvent: "none" as const,
        atmosphereTone: "encouraging" as const,
      },
    },
  ];
  const pick = scenarios[Math.floor(Math.random() * scenarios.length)]!;
  return mergeBrief(DEFAULT_DIRECTOR_BRIEF, pick.brief);
}

export function snowyBirthdayAfternoonBrief(): DirectorBrief {
  return mergeBrief(DEFAULT_DIRECTOR_BRIEF, {
    season: "winter",
    weather: "snow",
    time: "afternoon",
    lifeEvent: "birthday",
    atmosphereTone: "celebratory",
  });
}

export type SavedScenePreset = {
  id: string;
  label: string;
  brief: DirectorBrief;
  savedAt: string;
};

export function loadSceneLibrary(): SavedScenePreset[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SCENE_LIBRARY_KEY);
    return raw ? (JSON.parse(raw) as SavedScenePreset[]) : [];
  } catch {
    return [];
  }
}

export function saveSceneToLibrary(label: string, brief: DirectorBrief): SavedScenePreset[] {
  const entry: SavedScenePreset = {
    id: `scene-${Date.now()}`,
    label,
    brief,
    savedAt: new Date().toISOString(),
  };
  const next = [entry, ...loadSceneLibrary()].slice(0, 24);
  if (typeof window !== "undefined") {
    localStorage.setItem(SCENE_LIBRARY_KEY, JSON.stringify(next));
  }
  return next;
}

export function loadFavoriteBriefs(): DirectorBrief[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? (JSON.parse(raw) as DirectorBrief[]) : [];
  } catch {
    return [];
  }
}

export function saveFavoriteBrief(brief: DirectorBrief): DirectorBrief[] {
  const next = [brief, ...loadFavoriteBriefs()].slice(0, 12);
  if (typeof window !== "undefined") {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  }
  return next;
}

export function exportSceneJson(
  brief: DirectorBrief,
  state: DirectorSceneState,
): string {
  return JSON.stringify(
    {
      brief,
      directorState: state,
      exportedAt: new Date().toISOString(),
      question:
        "If I walked into Shari's home on this day, would I believe this room was naturally prepared for me?",
    },
    null,
    2,
  );
}
