export type AudioLink = {
  id: string;
  name: string;
  url: string;
  playlistId: string;
  category?: string; // for saved audio: what it helps you do (focus/calm/…)
  /** Personal note — why this place helps (Peaceful Places / My Audio). */
  note?: string;
};

// Simple, human "what does this help you do?" buckets for SAVED audio — kept
// deliberately lightweight (no playlists, folders, or tags).
export const SAVED_AUDIO_CATEGORIES: {
  id: string;
  emoji: string;
  name: string;
}[] = [
  { id: "focus", emoji: "🎯", name: "Focus" },
  { id: "calm", emoji: "🌿", name: "Calm" },
  { id: "energy", emoji: "⚡", name: "Energy" },
  { id: "sleep", emoji: "😴", name: "Sleep" },
  { id: "affirmations", emoji: "💬", name: "Affirmations" },
  { id: "meditation", emoji: "🧘", name: "Meditation" },
  { id: "other", emoji: "📁", name: "Other" },
];

export type AudioPlaylist = {
  id: string;
  name: string;
};

const PLAYLISTS_KEY = "audioPlaylistsV2";
const LINKS_KEY = "audioPlaylistLinksV2";
const LEGACY_LINKS_KEY = "myMusicLinks";
const AUDIO_FAVORITES_KEY = "audioFavoritesV1";
const AUDIO_PREFS_KEY = "audioPreferencesV1";

/** Personal audio — voice notes, affirmations, saved links (not a curated category). */
export const MY_AUDIO_PLAYLIST_ID = "my-audio" as const;
export const RESET_AUDIO_NONE = "none" as const;
export const FAVORITES_PLAYLIST_ID = "favorites" as const;

/** Surfaces that remember category + last track independently. */
export type AudioPickerContext =
  | "focus-audio"
  | "focus-session"
  | "focus-sprint"
  | "make-plan"
  | "reset-brain";

/** Master library — Focus Audio is source of truth; all surfaces are shortcuts. */
export const MASTER_AUDIO_CATEGORIES: { id: string; name: string }[] = [
  { id: "deep-work", name: "Deep Work" },
  { id: "morning-focus", name: "Morning Focus" },
  { id: "energetic", name: "Energetic" },
  { id: "motivation-boost", name: "Motivation Boost" },
  { id: "calm-brain", name: "Calm My Brain" },
  { id: "sleep-sounds", name: "Sleep Sounds" },
  { id: MY_AUDIO_PLAYLIST_ID, name: "My Audio" },
  { id: FAVORITES_PLAYLIST_ID, name: "Favorites" },
];

export const AUDIO_CATEGORY_PRESETS = {
  /** Focus work sessions — sprint, plan, Work With Shari */
  focus: [
    "deep-work",
    "morning-focus",
    "energetic",
    "motivation-boost",
    MY_AUDIO_PLAYLIST_ID,
    FAVORITES_PLAYLIST_ID,
  ],
  /** Recovery / Reset My Brain */
  calm: ["calm-brain", "sleep-sounds", MY_AUDIO_PLAYLIST_ID, FAVORITES_PLAYLIST_ID],
  all: MASTER_AUDIO_CATEGORIES.map((c) => c.id),
} as const;

const DEFAULT_PLAYLISTS: AudioPlaylist[] = [
  { id: "deep-work", name: "Deep Work" },
  { id: "morning-focus", name: "Morning Focus" },
  { id: "energetic", name: "Energetic" },
  { id: "calm-brain", name: "Calm My Brain" },
  { id: "sleep-sounds", name: "Sleep Sounds" },
  { id: "motivation-boost", name: "Motivation Boost" },
  { id: MY_AUDIO_PLAYLIST_ID, name: "My Audio" },
];

const DEFAULT_LINKS: AudioLink[] = [
  {
    id: "dw-brown",
    playlistId: "deep-work",
    name: "Brown Noise",
    url: "https://www.youtube.com/watch?v=nMfPqeZjc2c",
  },
  {
    id: "dw-focus",
    playlistId: "deep-work",
    name: "ADHD Focus Mix",
    url: "https://www.youtube.com/watch?v=5qap5aO4i9A",
  },
  {
    id: "dw-spotify",
    playlistId: "deep-work",
    name: "Spotify Deep Focus",
    url: "https://open.spotify.com/search/deep%20focus",
  },
  {
    id: "mf-morning",
    playlistId: "morning-focus",
    name: "Morning Energy Boost",
    url: "https://www.youtube.com/watch?v=36YnV9STBqc",
  },
  {
    id: "mf-lofi",
    playlistId: "morning-focus",
    name: "Lo-Fi Study Beats",
    url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
  },
  {
    id: "cb-rain",
    playlistId: "calm-brain",
    name: "Rain & Thunder",
    url: "https://www.youtube.com/watch?v=mPZkdNFkNps",
  },
  {
    id: "cb-ambient",
    playlistId: "calm-brain",
    name: "Soft Ambient Calm",
    url: "https://www.youtube.com/watch?v=lTRiuFIWV54",
  },
  {
    id: "ss-rain",
    playlistId: "sleep-sounds",
    name: "Sleep Rain",
    url: "https://www.youtube.com/watch?v=mPZkdNFkNps",
  },
  {
    id: "mb-motivation",
    playlistId: "motivation-boost",
    name: "Motivation Mix",
    url: "https://www.youtube.com/watch?v=KQ6zr6kCPj8",
  },
  {
    id: "en-happy-pop",
    playlistId: "energetic",
    name: "Upbeat Happy Energy",
    url: "https://www.youtube.com/watch?v=atdm_5zcrts",
  },
  {
    id: "en-festival",
    playlistId: "energetic",
    name: "Festival Energy Mix",
    url: "https://www.youtube.com/watch?v=eLB2xOnJn_8",
  },
  {
    id: "en-edm-power",
    playlistId: "energetic",
    name: "High-Energy EDM",
    url: "https://www.youtube.com/watch?v=l4jWSjUHaxY",
  },
];

type AudioPreferences = {
  lastTrackByCategory: Record<string, string>;
  lastCategoryByContext: Record<string, string>;
};

function uid() {
  return Math.random().toString(36).slice(2, 11);
}

/** Curated tracks that shipped with search URLs — patch to direct embeddable videos. */
const CATALOG_EMBED_URL_BY_ID: Record<string, string> = {
  "dw-brown": "https://www.youtube.com/watch?v=nMfPqeZjc2c",
  "cb-ambient": "https://www.youtube.com/watch?v=lTRiuFIWV54",
};

function mergeCatalogPlaylists(stored: AudioPlaylist[]): AudioPlaylist[] {
  const byId = new Map(stored.map((playlist) => [playlist.id, playlist]));
  let changed = false;
  for (const playlist of DEFAULT_PLAYLISTS) {
    if (!byId.has(playlist.id)) {
      byId.set(playlist.id, playlist);
      changed = true;
    }
  }
  const next = Array.from(byId.values());
  if (changed) writeJson(PLAYLISTS_KEY, next);
  return next;
}

function mergeCatalogLinks(stored: AudioLink[]): AudioLink[] {
  const byId = new Map(stored.map((link) => [link.id, link]));
  let changed = false;
  for (const link of DEFAULT_LINKS) {
    if (!byId.has(link.id)) {
      byId.set(link.id, link);
      changed = true;
    }
  }
  if (!changed) return stored;
  const next = Array.from(byId.values());
  writeJson(LINKS_KEY, next);
  return next;
}

function normalizeEmbeddableCatalogLinks(links: AudioLink[]): AudioLink[] {
  let changed = false;
  const next = links.map((link) => {
    const preferred = CATALOG_EMBED_URL_BY_ID[link.id];
    if (!preferred || link.url === preferred) return link;
    if (/youtube\.com\/results|search_query/i.test(link.url)) {
      changed = true;
      return { ...link, url: preferred };
    }
    return link;
  });
  if (changed) writeJson(LINKS_KEY, next);
  return next;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function migrateLegacyLinks(): AudioLink[] {
  const legacy = readJson<{ id: string; name: string; url: string }[]>(LEGACY_LINKS_KEY, []);
  if (!legacy.length) return [];
  return legacy.map((l) => ({
    id: l.id || uid(),
    name: l.name,
    url: l.url,
    playlistId: "deep-work",
  }));
}

export function getAudioPreferences(): AudioPreferences {
  return readJson<AudioPreferences>(AUDIO_PREFS_KEY, {
    lastTrackByCategory: {},
    lastCategoryByContext: {},
  });
}

function saveAudioPreferences(prefs: AudioPreferences) {
  writeJson(AUDIO_PREFS_KEY, prefs);
}

export function rememberAudioSelection(
  context: AudioPickerContext,
  categoryId: string,
  trackId?: string
) {
  const prefs = getAudioPreferences();
  prefs.lastCategoryByContext[context] = categoryId;
  if (trackId && categoryId !== RESET_AUDIO_NONE) {
    prefs.lastTrackByCategory[categoryId] = trackId;
  }
  saveAudioPreferences(prefs);
}

export function getStoredCategoryForContext(context: AudioPickerContext): string | null {
  const prefs = getAudioPreferences();
  return prefs.lastCategoryByContext[context] ?? null;
}

export function getAudioPlaylists(): AudioPlaylist[] {
  const stored = readJson<AudioPlaylist[]>(PLAYLISTS_KEY, []);
  if (!stored.length) {
    const migrated = migrateLegacyLinks();
    if (migrated.length) {
      writeJson(LINKS_KEY, [...DEFAULT_LINKS, ...migrated]);
    }
    return DEFAULT_PLAYLISTS;
  }
  return mergeCatalogPlaylists(stored);
}

export function saveAudioPlaylists(playlists: AudioPlaylist[]) {
  writeJson(PLAYLISTS_KEY, playlists);
}

export function getAudioLinks(): AudioLink[] {
  const stored = readJson<AudioLink[]>(LINKS_KEY, []);
  if (!stored.length) {
    const migrated = migrateLegacyLinks();
    const links = migrated.length ? [...DEFAULT_LINKS, ...migrated] : DEFAULT_LINKS;
    writeJson(LINKS_KEY, links);
    return links;
  }
  return normalizeEmbeddableCatalogLinks(mergeCatalogLinks(stored));
}

export function saveAudioLinks(links: AudioLink[]) {
  writeJson(LINKS_KEY, links);
}

export function masterAudioCategories(
  categoryIds: readonly string[] = AUDIO_CATEGORY_PRESETS.all
): { id: string; name: string }[] {
  const allowed = new Set(categoryIds);
  return MASTER_AUDIO_CATEGORIES.filter((c) => allowed.has(c.id));
}

export function categoryDisplayName(categoryId: string): string {
  return (
    MASTER_AUDIO_CATEGORIES.find((c) => c.id === categoryId)?.name ??
    getAudioPlaylists().find((p) => p.id === categoryId)?.name ??
    categoryId
  );
}

export function linksForPlaylist(playlistId: string, links = getAudioLinks()): AudioLink[] {
  return links.filter((l) => l.playlistId === playlistId);
}

export function myAudioLinks(links = getAudioLinks()): AudioLink[] {
  return linksForPlaylist(MY_AUDIO_PLAYLIST_ID, links);
}

export function favoriteAudioLinks(links = getAudioLinks()): AudioLink[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(AUDIO_FAVORITES_KEY);
    const ids = raw ? (JSON.parse(raw) as string[]) : [];
    if (!Array.isArray(ids) || !ids.length) return [];
    const byId = new Map(links.map((l) => [l.id, l]));
    return ids.map((id) => byId.get(id)).filter((l): l is AudioLink => !!l);
  } catch {
    return [];
  }
}

export function linksForAudioCategory(categoryId: string, links = getAudioLinks()): AudioLink[] {
  if (categoryId === RESET_AUDIO_NONE) return [];
  if (categoryId === FAVORITES_PLAYLIST_ID) return favoriteAudioLinks(links);
  if (categoryId === MY_AUDIO_PLAYLIST_ID) return myAudioLinks(links);
  return linksForPlaylist(categoryId, links);
}

export function trackCountForCategory(categoryId: string, links = getAudioLinks()): number {
  return linksForAudioCategory(categoryId, links).length;
}

export function trackCountLabel(count: number): string {
  if (count === 0) return "No tracks yet";
  if (count === 1) return "1 track available";
  return `${count} tracks available`;
}

export function getRecommendedTrack(
  categoryId: string,
  links = getAudioLinks()
): AudioLink | null {
  const tracks = linksForAudioCategory(categoryId, links);
  if (!tracks.length) return null;
  const prefs = getAudioPreferences();
  const lastId = prefs.lastTrackByCategory[categoryId];
  if (lastId) {
    const found = tracks.find((t) => t.id === lastId);
    if (found) return found;
  }
  return tracks[0] ?? null;
}

export function openAudioLink(url?: string | null) {
  if (!url?.trim()) return false;
  window.open(url.trim(), "_blank", "noopener,noreferrer");
  return true;
}

export function playAudioTrack(
  track: AudioLink,
  context?: AudioPickerContext,
  categoryId?: string
): boolean {
  const opened = openAudioLink(track.url);
  if (opened && context === "focus-audio") {
    void import("@/lib/ecosystem/eventTrackingEngine").then(({ trackEcosystemEvent }) => {
      trackEcosystemEvent({
        eventType: "feature.focus_audio_started",
        feature: "focus-audio",
        metadata: {
          categoryId: categoryId ?? "focus",
          trackId: track.id,
        },
      });
    });
  }
  if (opened && context && categoryId) {
    rememberAudioSelection(context, categoryId, track.id);
  } else if (opened && categoryId) {
    const prefs = getAudioPreferences();
    prefs.lastTrackByCategory[categoryId] = track.id;
    saveAudioPreferences(prefs);
  }
  return opened;
}

export function playRecommendedTrack(
  categoryId: string,
  context?: AudioPickerContext
): boolean {
  const track = getRecommendedTrack(categoryId);
  if (!track) return false;
  return playAudioTrack(track, context, categoryId);
}

export function addMyAudioLink(
  name: string,
  url: string,
  category?: string,
  note?: string,
): AudioLink {
  return addAudioLink(name, url, MY_AUDIO_PLAYLIST_ID, category, note);
}

/** @deprecated Use focus preset via masterAudioCategories */
export function focusSessionPlaylists(): AudioPlaylist[] {
  return getAudioPlaylists().filter((p) =>
    AUDIO_CATEGORY_PRESETS.focus.includes(p.id as (typeof AUDIO_CATEGORY_PRESETS.focus)[number])
  );
}

/** @deprecated Use calm preset */
export function breathePlaylists(): AudioPlaylist[] {
  return getAudioPlaylists().filter((p) =>
    AUDIO_CATEGORY_PRESETS.calm.includes(p.id as (typeof AUDIO_CATEGORY_PRESETS.calm)[number])
  );
}

export function openPlaylistFirstLink(playlistId: string) {
  playRecommendedTrack(playlistId);
}

export type RecoveryAudioCategory = {
  id: string;
  name: string;
  playlistId: string;
};

/** @deprecated Use masterAudioCategories with calm preset */
export function recoveryAudioCategories(): RecoveryAudioCategory[] {
  return masterAudioCategories(AUDIO_CATEGORY_PRESETS.calm).map((c) => ({
    id: c.id,
    name: c.name,
    playlistId: c.id,
  }));
}

export type ResetAudioOption = {
  id: string;
  name: string;
  playlistId: string | null;
};

/** @deprecated Use AudioCategoryPicker with calm preset */
export function resetMyBrainAudioOptions(): ResetAudioOption[] {
  return [
    { id: RESET_AUDIO_NONE, name: "None", playlistId: null },
    ...masterAudioCategories(AUDIO_CATEGORY_PRESETS.calm).map((c) => ({
      id: c.id,
      name: c.name,
      playlistId: c.id,
    })),
  ];
}

/** @deprecated Use linksForAudioCategory */
export function linksForResetAudioCategory(categoryId: string): AudioLink[] {
  return linksForAudioCategory(categoryId);
}

export function createPlaylist(name: string): AudioPlaylist {
  const playlists = getAudioPlaylists();
  const pl: AudioPlaylist = { id: "pl-" + uid(), name: name.trim() };
  saveAudioPlaylists([...playlists, pl]);
  return pl;
}

export function addAudioLink(
  name: string,
  url: string,
  playlistId: string,
  category?: string,
  note?: string,
): AudioLink {
  const links = getAudioLinks();
  const link: AudioLink = {
    id: "lnk-" + uid(),
    name: name.trim(),
    url: url.trim(),
    playlistId,
    ...(category ? { category } : {}),
    ...(note?.trim() ? { note: note.trim() } : {}),
  };
  saveAudioLinks([link, ...links]);
  return link;
}

export function deleteAudioLink(id: string) {
  saveAudioLinks(getAudioLinks().filter((l) => l.id !== id));
}

export function updateAudioLink(
  id: string,
  patch: { name: string; url: string; category: string; note?: string },
): AudioLink | null {
  const links = getAudioLinks();
  const index = links.findIndex((l) => l.id === id);
  if (index < 0) return null;
  const updated: AudioLink = {
    ...links[index]!,
    name: patch.name.trim(),
    url: patch.url.trim(),
    category: patch.category,
    note: patch.note?.trim() ? patch.note.trim() : undefined,
  };
  const next = [...links];
  next[index] = updated;
  saveAudioLinks(next);
  return updated;
}

export function savedAudioCategoryName(categoryId?: string): string {
  const id = categoryId ?? "other";
  return (
    SAVED_AUDIO_CATEGORIES.find((c) => c.id === id)?.name ?? "Other"
  );
}

export function deleteAudioPlaylist(id: string) {
  const playlists = getAudioPlaylists().filter((p) => p.id !== id);
  saveAudioPlaylists(playlists);
  saveAudioLinks(getAudioLinks().filter((l) => l.playlistId !== id));
}
