/**
 * Estate place scene views — member chooses among intentional backgrounds (not load fallbacks).
 */

import { estateBackgroundPath } from "./estatePlaceMedia";
import { getCanonicalEstatePlaceById } from "./canonicalEstateRegistry";
import {
  ESTATE_PLACE_SUGGESTION_CLOSER,
} from "./estatePlaceIdentityLock";

export type EstatePlaceSceneView = {
  viewId: string;
  label: string;
  blurb: string;
  backgroundUrl: string;
};

export const ESTATE_PLACE_SCENE_VIEWS: Readonly<
  Record<string, readonly EstatePlaceSceneView[]>
> = {
  observatory: [
    {
      viewId: "day-outside",
      label: "Observatory — Daytime Outside",
      blurb: "wide sky, open air",
      backgroundUrl: estateBackgroundPath(
        "observatory-daytime-outside-background.png",
      ),
    },
    {
      viewId: "day-inside",
      label: "Observatory — Daytime Inside",
      blurb: "quiet study, curated stacks",
      backgroundUrl: estateBackgroundPath("observatory-daytime-inside.png"),
    },
    {
      viewId: "night-outside",
      label: "Observatory — Night Outside",
      blurb: "stars, calm night air",
      backgroundUrl: estateBackgroundPath(
        "observatory-night-outside-background.png",
      ),
    },
  ],
  "house-possibility-outside": [
    {
      viewId: "discovery-chest",
      label: "Treehouse Discovery Chest",
      blurb: "curious finds, gentle surprises",
      backgroundUrl: estateBackgroundPath(
        "treehouse-possibility-discovery-chest-background.png",
      ),
    },
    {
      viewId: "reflection-desk",
      label: "Treehouse Reflection Desk",
      blurb: "quiet writing, soft light",
      backgroundUrl: estateBackgroundPath(
        "treehouse-possibility-reflection-desk-background.png",
      ),
    },
    {
      viewId: "staircase-nook",
      label: "Treehouse Staircase / Reading Nook",
      blurb: "stairs, window light, a place to pause",
      backgroundUrl: estateBackgroundPath(
        "treehouse-possibility-staircase-window-reading-nook-background.png",
      ),
    },
    {
      viewId: "possibility-studio",
      label: "Treehouse Possibility Studio",
      blurb: "ideas, sketches, open canvas",
      backgroundUrl: estateBackgroundPath("treehouse-possibility-studio.png"),
    },
  ],
  "summer-terrace": [
    {
      viewId: "pool",
      label: "Swimming Pool",
      blurb: "private pool, open sky",
      backgroundUrl: estateBackgroundPath(
        "water-swimming-pool-private-background.png",
      ),
    },
    {
      viewId: "verandah",
      label: "Lakeside verandah",
      blurb: "shade, water in the distance",
      backgroundUrl: estateBackgroundPath(
        "water-lakeside-deck-verandah-background.png",
      ),
    },
    {
      viewId: "hammock",
      label: "Water / Lakeside Hammock",
      blurb: "slow rest by the water",
      backgroundUrl: estateBackgroundPath("water-lakeside-hammock-background.png"),
    },
  ],
};

const SCENE_VIEW_TOKEN = "::";

export function placeHasSceneViewChoice(placeId: string): boolean {
  return (ESTATE_PLACE_SCENE_VIEWS[placeId]?.length ?? 0) > 1;
}

export function listSceneViewsForPlace(
  placeId: string,
): readonly EstatePlaceSceneView[] {
  return ESTATE_PLACE_SCENE_VIEWS[placeId] ?? [];
}

export function encodeSceneViewPlaceToken(
  placeId: string,
  viewId: string,
): string {
  return `${placeId}${SCENE_VIEW_TOKEN}${viewId}`;
}

export function decodeSceneViewPlaceToken(
  token: string,
): { placeId: string; viewId: string } | null {
  const idx = token.indexOf(SCENE_VIEW_TOKEN);
  if (idx <= 0) return null;
  const placeId = token.slice(0, idx);
  const viewId = token.slice(idx + SCENE_VIEW_TOKEN.length);
  if (!placeId || !viewId) return null;
  return { placeId, viewId };
}

export function resolveSceneViewBackgroundUrl(
  placeId: string,
  viewId: string,
): string | null {
  const view = listSceneViewsForPlace(placeId).find((row) => row.viewId === viewId);
  return view?.backgroundUrl ?? null;
}

const OBSERVATORY_VIEW_HINTS: ReadonlyArray<{ viewId: string; pattern: RegExp }> =
  [
    { viewId: "day-inside", pattern: /\b(?:inside|indoors|interior)\b/i },
    {
      viewId: "night-outside",
      pattern: /\b(?:night|evening|stars|starry)\b/i,
    },
    {
      viewId: "day-outside",
      pattern: /\b(?:outside|outdoors|daytime|day time)\b/i,
    },
  ];

const POOL_VIEW_HINTS: ReadonlyArray<{ viewId: string; pattern: RegExp }> = [
  { viewId: "pool", pattern: /\b(?:swim(?:ming)?|pool)\b/i },
  { viewId: "verandah", pattern: /\bverandah\b/i },
  { viewId: "hammock", pattern: /\bhammock\b/i },
];

export function sceneViewIdFromUserText(
  placeId: string,
  userText: string,
): string | null {
  const text = userText.trim();
  if (!text) return null;

  const hints =
    placeId === "observatory"
      ? OBSERVATORY_VIEW_HINTS
      : placeId === "summer-terrace"
        ? POOL_VIEW_HINTS
        : [];

  for (const hint of hints) {
    if (hint.pattern.test(text)) return hint.viewId;
  }

  for (const view of listSceneViewsForPlace(placeId)) {
    const normalized = text.toLowerCase();
    const label = view.label.toLowerCase().replace(/\u2122/g, "");
    if (normalized.includes(view.viewId.replace(/-/g, " "))) return view.viewId;
    if (normalized.includes(label)) return view.viewId;
  }

  return null;
}

export function formatSceneViewMenuLine(placeId: string): string {
  const views = listSceneViewsForPlace(placeId);
  const place = getCanonicalEstatePlaceById(placeId);
  const name = place?.officialName ?? placeId;
  if (views.length === 0) return "";

  const lines = views.map(
    (view, index) => `${index + 1}. ${view.label} — ${view.blurb}`,
  );

  const lead =
    placeId === "observatory"
      ? "The Observatory has a few spots. Which one are you picturing?"
      : placeId === "summer-terrace"
        ? "The terrace opens a few different ways. Which feels right?"
        : `${name} has a few views — which feels right?`;

  return `${lead}\n${lines.join("\n")}\n${ESTATE_PLACE_SUGGESTION_CLOSER}`;
}

export function sceneViewTokensForPlace(placeId: string): string[] {
  return listSceneViewsForPlace(placeId).map((view) =>
    encodeSceneViewPlaceToken(placeId, view.viewId),
  );
}

export function extractSceneViewTokensFromNumberedMenu(
  text: string,
): string[] {
  const lines = [...text.matchAll(/^\s*\d+[.)]\s+(.+)$/gm)];
  const out: string[] = [];

  for (const match of lines) {
    const body = match[1]!.trim().toLowerCase();
    for (const [placeId, placeViews] of Object.entries(ESTATE_PLACE_SCENE_VIEWS)) {
      for (const view of placeViews) {
        const label = view.label.toLowerCase().replace(/\u2122/g, "");
        if (
          body.includes(label) ||
          body.includes(view.blurb.toLowerCase()) ||
          body.includes(view.viewId.replace(/-/g, " "))
        ) {
          out.push(encodeSceneViewPlaceToken(placeId, view.viewId));
          break;
        }
      }
    }
  }

  return out.slice(0, 3);
}
