"use client";

import { FocusHubPlaqueStrip } from "@/components/companion/FocusHubPlaqueStrip";
import {
  focusFeelingById,
  focusHubDropdownTools,
  type FocusFeelingId,
  type FocusHubAction,
} from "@/lib/focusHub";
import { focusHubCardArt, focusToolCardArt } from "@/lib/focusMyBrain/focusCardArt";
import { FOCUS_MY_BRAIN_HUB_CARDS } from "@/lib/focusMyBrain/focusRoom";

/** Dock banners — image strips swapped between the two hub choices. */
const DOCK_BANNER_FEELING: Record<FocusFeelingId, FocusFeelingId> = {
  stuck: "need-break",
  "need-break": "stuck",
};

type Props = {
  feelingId: FocusFeelingId;
  align: "left" | "right";
  expanded: boolean;
  onToggle: () => void;
  onSelectTool: (action: FocusHubAction) => void;
};

function DestinationToolItem({
  item,
  onSelect,
}: {
  item: { id: string; label: string; description?: string; action: FocusHubAction };
  onSelect: (action: FocusHubAction) => void;
}) {
  return (
    <li>
      <button
        type="button"
        className="focus-hub-dropdown__item focus-hub-plaque"
        data-testid={`focus-tool-${item.id}`}
        onClick={() => onSelect(item.action)}
      >
        <FocusHubPlaqueStrip imageUrl={focusToolCardArt(item.id)} compact />
        <span className="focus-hub-plaque__content">
          <span className="focus-hub-dropdown__item-title">{item.label}</span>
          {item.description ? (
            <span className="focus-hub-dropdown__item-desc">{item.description}</span>
          ) : null}
        </span>
      </button>
    </li>
  );
}

/** Handcrafted homestead destination — panoramic banner, parchment body, lantern glow. */
export function FocusDestinationPlaque({
  feelingId,
  align,
  expanded,
  onToggle,
  onSelectTool,
}: Props) {
  const feeling = focusFeelingById(feelingId);
  const destination = FOCUS_MY_BRAIN_HUB_CARDS[feelingId];
  if (!feeling || !destination) return null;

  const tools = focusHubDropdownTools(feeling);
  const bannerUrl = focusHubCardArt(DOCK_BANNER_FEELING[feelingId]);

  return (
    <div
      className={[
        "focus-destination-plaque",
        "focus-brain-menu-card",
        `focus-destination-plaque--${align}`,
        expanded ? "focus-destination-plaque--expanded" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-testid={`focus-feeling-row-${feelingId}`}
    >
      <button
        type="button"
        className="focus-destination-plaque__main"
        data-testid={`focus-feeling-${feelingId}`}
        aria-expanded={expanded}
        onClick={onToggle}
      >
        <span
          className="focus-destination-plaque__banner"
          style={{ backgroundImage: `url('${bannerUrl}')` }}
          aria-hidden
        />
        <span className="focus-destination-plaque__body">
          <span className="focus-destination-plaque__title">{destination.title}</span>
          <span className="focus-destination-plaque__tagline">
            {destination.tagline}
          </span>
        </span>
        <span className="focus-destination-plaque__lantern-glow" aria-hidden />
      </button>
      {expanded ? (
        <ul
          className="focus-destination-plaque__paths"
          data-testid={`focus-dropdown-${feelingId}`}
        >
          {tools.map((item) => (
            <DestinationToolItem
              key={item.id}
              item={item}
              onSelect={onSelectTool}
            />
          ))}
        </ul>
      ) : null}
    </div>
  );
}
