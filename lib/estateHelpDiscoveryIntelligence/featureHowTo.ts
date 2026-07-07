/**
 * Feature how-to guides — what · why · how to access.
 */

import featureHowToJson from "@/docs/estate-knowledge-base/feature-how-to.json";
import type { FeatureHowToGuide } from "./types";

type FeatureHowToFile = {
  guides: FeatureHowToGuide[];
};

const FILE = featureHowToJson as FeatureHowToFile;

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

const SORTED_GUIDES = [...FILE.guides].sort(
  (a, b) =>
    Math.max(...b.aliases.map((alias) => alias.length)) -
    Math.max(...a.aliases.map((alias) => alias.length)),
);

export function getFeatureHowToGuides(): FeatureHowToGuide[] {
  return FILE.guides;
}

export function getLiveFeatureHowToGuides(): FeatureHowToGuide[] {
  return FILE.guides.filter((guide) => guide.status === "Live");
}

export function matchFeatureHowToGuide(query: string): {
  guide: FeatureHowToGuide;
  matchedPhrase: string;
} | null {
  const normalized = normalize(query);
  if (!normalized) return null;

  for (const guide of getLiveFeatureHowToGuides()) {
    for (const alias of [...guide.aliases].sort(
      (a, b) => b.length - a.length,
    )) {
      const phrase = normalize(alias);
      if (normalized.includes(phrase)) {
        return { guide, matchedPhrase: alias };
      }
    }
  }

  const genericHowTo =
    /\bhow do i\b/i.test(query) ||
    /\bhow can i\b/i.test(query) ||
    /\bhow does (?:this|that) work\b/i.test(query);

  if (genericHowTo) {
    for (const guide of getLiveFeatureHowToGuides()) {
      for (const alias of guide.aliases) {
        const words = normalize(alias).split(" ");
        if (words.some((word) => word.length > 3 && normalized.includes(word))) {
          return { guide, matchedPhrase: alias };
        }
      }
    }
  }

  return null;
}

export function formatFeatureHowToResponse(guide: FeatureHowToGuide): string {
  const lines = [
    guide.whatItDoes,
    guide.whyHelpful,
    guide.howToAccess,
  ];

  if (guide.offerNavigation) {
    lines.push("", "Would you like me to take you there?");
  }

  return lines.filter(Boolean).join("\n\n");
}
