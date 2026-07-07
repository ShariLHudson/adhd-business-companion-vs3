/**
 * Discovery Note presentation — maps engine selection to UI data only.
 */

import type {
  DiscoveryCategorySlug,
  DiscoveryEngineSelection,
  DiscoveryNoteData,
} from "./types";

const CATEGORY_PRIMARY_LABEL: Record<DiscoveryCategorySlug, string> = {
  welcome: "Continue",
  "estate-discovery": "Take Me There",
  "feature-discovery": "Show Me How",
  "estate-story": "Visit This Place",
  "hidden-treasure": "Explore",
  "personal-discovery": "Continue",
  "new-possibility": "See What's Possible",
  "seasonal-discovery": "Take Me There",
};

export function primaryButtonLabelForCategory(
  category: DiscoveryCategorySlug,
  override: string | null,
): string {
  if (override?.trim()) return override.trim();
  return CATEGORY_PRIMARY_LABEL[category];
}

export function toDiscoveryNoteData(
  selection: DiscoveryEngineSelection,
): DiscoveryNoteData {
  const primaryButtonLabel = primaryButtonLabelForCategory(
    selection.category,
    selection.primaryButton,
  );

  return {
    discoveryId: selection.discoveryId,
    category: selection.category,
    title: selection.title,
    subtitle: selection.subtitle,
    image: selection.image,
    discoveryText: selection.discoveryText,
    whyItMatters: selection.whyItMatters,
    foodForThought: selection.foodForThought,
    primaryButtonLabel,
    showPrimaryButton: Boolean(
      selection.destinationSection || selection.companionResponse?.trim(),
    ),
    showSaveForLater: selection.saveAllowed,
  };
}
