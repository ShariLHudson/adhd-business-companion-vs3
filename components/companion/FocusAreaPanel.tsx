"use client";

import { useMemo, useState } from "react";
import { FocusConservatoryDock } from "@/components/companion/FocusConservatoryDock";
import { FocusMyBrainRoomShell } from "@/components/companion/FocusMyBrainRoomShell";
import { FocusHubPlaqueStrip } from "@/components/companion/FocusHubPlaqueStrip";
import {
  FOCUS_FEELING_ENTRIES,
  focusFeelingById,
  focusHubDropdownTools,
  type FocusFeelingId,
  type FocusHubAction,
  type FocusHubTool,
} from "@/lib/focusHub";
import { evaluateFocusLandscape } from "@/lib/focusLandscape";
import { FOCUS_MY_BRAIN_HUB_CARDS } from "@/lib/focusMyBrain/focusRoom";
import {
  focusHubCardArt,
  focusToolCardArt,
} from "@/lib/focusMyBrain/focusCardArt";

function FocusHubDropdownItem({
  item,
  onSelect,
}: {
  item: FocusHubTool;
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

function FocusHubChoice({
  feelingId,
  expanded,
  onToggle,
  onSelectTool,
}: {
  feelingId: FocusFeelingId;
  expanded: boolean;
  onToggle: (id: FocusFeelingId) => void;
  onSelectTool: (action: FocusHubAction) => void;
}) {
  const feeling = focusFeelingById(feelingId);
  const cardCopy = FOCUS_MY_BRAIN_HUB_CARDS[feelingId];
  if (!feeling) return null;

  const tools = focusHubDropdownTools(feeling);
  const rowClass = [
    "focus-hub-choice",
    expanded ? "focus-hub-choice--expanded" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <li className={rowClass} data-testid={`focus-feeling-row-${feelingId}`}>
      <button
        type="button"
        className="focus-hub-choice__main focus-hub-plaque"
        data-testid={`focus-feeling-${feelingId}`}
        aria-expanded={expanded}
        onClick={() => onToggle(feelingId)}
      >
        <FocusHubPlaqueStrip imageUrl={focusHubCardArt(feelingId)} />
        <span className="focus-hub-plaque__content">
          <span className="focus-hub-choice__heading">
            <span className="focus-hub-choice__title">{cardCopy.title}</span>
            <span className="focus-hub-choice__chevron" aria-hidden>
              {expanded ? "▾" : "▸"}
            </span>
          </span>
          <span className="focus-hub-choice__descriptions">
            <span className="focus-hub-choice__description">{cardCopy.tagline}</span>
          </span>
        </span>
      </button>
      {expanded ? (
        <ul
          className="focus-hub-dropdown"
          data-testid={`focus-dropdown-${feelingId}`}
        >
          {tools.map((item) => (
            <FocusHubDropdownItem
              key={item.id}
              item={item}
              onSelect={onSelectTool}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function FocusMyBrainHub({
  expandedFeeling,
  onToggleFeeling,
  onSelectTool,
  landing = false,
}: {
  expandedFeeling: FocusFeelingId | null;
  onToggleFeeling: (id: FocusFeelingId) => void;
  onSelectTool: (action: FocusHubAction) => void;
  landing?: boolean;
}) {
  if (landing) {
    return (
      <FocusConservatoryDock
        expandedFeeling={expandedFeeling}
        onToggleFeeling={onToggleFeeling}
        onSelectTool={onSelectTool}
      />
    );
  }

  return (
    <div
      className="focus-my-brain-hub"
      data-testid="focus-area-panel"
      data-focus-view="feelings"
    >
      <ul className="focus-hub-choices">
        {FOCUS_FEELING_ENTRIES.map((feeling) => (
          <FocusHubChoice
            key={feeling.id}
            feelingId={feeling.id}
            expanded={expandedFeeling === feeling.id}
            onToggle={onToggleFeeling}
            onSelectTool={onSelectTool}
          />
        ))}
      </ul>
    </div>
  );
}

export function FocusAreaPanel({
  onAction,
  standalone = false,
}: {
  onAction: (action: FocusHubAction) => void;
  standalone?: boolean;
  onBackToChat?: () => void;
}) {
  const [expandedFeeling, setExpandedFeeling] = useState<FocusFeelingId | null>(
    null,
  );
  const [videoPlayKey, setVideoPlayKey] = useState(0);

  const landscape = useMemo(
    () => evaluateFocusLandscape({ workspaceId: "focus-hub" }),
    [],
  );

  function handleToggleFeeling(id: FocusFeelingId) {
    setExpandedFeeling((current) => (current === id ? null : id));
  }

  function handleSelectTool(action: FocusHubAction) {
    setVideoPlayKey((key) => key + 1);
    onAction(action);
  }

  const hub = (
    <div
      data-room-whisper={landscape.landscapeWhisper}
      data-focus-landscape-space={landscape.spaceId}
      data-focus-view="hub"
    >
      <FocusMyBrainHub
        expandedFeeling={expandedFeeling}
        onToggleFeeling={handleToggleFeeling}
        onSelectTool={handleSelectTool}
        landing={standalone}
      />
    </div>
  );

  if (standalone) {
    return (
      <FocusMyBrainRoomShell hubOverlay videoPlayKey={videoPlayKey}>
        {hub}
      </FocusMyBrainRoomShell>
    );
  }

  return (
    <div className="focus-my-brain-inline companion-fade-in h-full min-h-0">
      {hub}
    </div>
  );
}
