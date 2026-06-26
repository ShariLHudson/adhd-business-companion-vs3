"use client";

import { useState } from "react";
import {
  FOCUS_FEELING_ENTRIES,
  focusFeelingById,
  type FocusFeelingId,
  type FocusHubAction,
  type FocusHubTool,
  type FocusHubToolGroup,
} from "@/lib/focusHub";
import { initialSectionOpen } from "@/lib/expandableUi";
import { workspacePanelShellClass } from "@/lib/workspaceLayoutTokens";
import { CompanionObjectVisual } from "@/components/companion/CompanionObjectVisual";
import { CompanionNavCard } from "@/components/companion/CompanionNavCard";

function ToolButton({
  item,
  starred,
  onSelect,
}: {
  item: FocusHubTool;
  starred?: boolean;
  onSelect: (action: FocusHubAction) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item.action)}
      data-testid={`focus-tool-${item.id}`}
      className="flex w-full items-start gap-2 rounded-xl border border-[#e4ddd2] bg-[#faf7f2] px-3 py-2.5 text-left transition-colors hover:border-[#1e4f4f]/35 hover:bg-white"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-[#1f1c19]">
          {starred ? "⭐ " : null}
          {item.label}
          {starred ? (
            <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wide text-[#1e4f4f]">
              Recommended
            </span>
          ) : null}
        </span>
        {item.description ? (
          <span className="mt-0.5 block text-xs leading-snug text-[#6b635a]">
            {item.description}
          </span>
        ) : null}
      </span>
    </button>
  );
}

function ToolGroupSection({
  group,
  recommendedId,
  onSelect,
}: {
  group: FocusHubToolGroup;
  recommendedId?: string;
  onSelect: (action: FocusHubAction) => void;
}) {
  const [open, setOpen] = useState(
    group.collapsible ? initialSectionOpen() : true,
  );

  const toolList = (
    <ul className="flex flex-col gap-1.5">
      {group.tools.map((item) => (
        <li key={item.id}>
          <ToolButton
            item={item}
            starred={item.id === recommendedId}
            onSelect={onSelect}
          />
        </li>
      ))}
    </ul>
  );

  if (!group.collapsible) {
    return (
      <section className="flex flex-col gap-2" data-testid={`focus-group-${group.id}`}>
        <h3 className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
          {group.title}
        </h3>
        {toolList}
      </section>
    );
  }

  return (
    <section
      className="overflow-hidden rounded-2xl border border-[#e7dfd4] bg-white/90"
      data-testid={`focus-group-${group.id}`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`focus-group-panel-${group.id}`}
        className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left"
      >
        <span className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
          {group.title}
        </span>
        <span className="text-[#9a9289]" aria-hidden="true">
          {open ? "▾" : "▸"}
        </span>
      </button>
      {open ? (
        <div
          id={`focus-group-panel-${group.id}`}
          className="border-t border-[#efe8de] px-3 pb-3 pt-2"
        >
          {toolList}
        </div>
      ) : null}
    </section>
  );
}

export function FocusAreaPanel({
  onAction,
}: {
  onAction: (action: FocusHubAction) => void;
}) {
  const [selectedFeeling, setSelectedFeeling] = useState<FocusFeelingId | null>(
    null,
  );

  const category = selectedFeeling ? focusFeelingById(selectedFeeling) : null;

  function handleFeelingSelect(id: FocusFeelingId) {
    setSelectedFeeling(id);
  }

  function handleBack() {
    setSelectedFeeling(null);
  }

  if (category) {
    const recommendedInFirstGroup = Boolean(
      category.recommended &&
        category.groups[0]?.tools.some((t) => t.id === category.recommended?.id),
    );

    return (
      <div
        className={workspacePanelShellClass({ width: "narrow" })}
        data-testid="focus-area-panel"
        data-focus-view="category"
        data-focus-category={category.id}
      >
        <button
          type="button"
          onClick={handleBack}
          className="mb-3 self-start text-sm font-semibold text-[#1e4f4f]"
        >
          ‹ Focus
        </button>
        <p className="flex items-center gap-2 text-2xl font-semibold text-[#1f1c19]">
          <CompanionObjectVisual objectId={category.objectId} size="md" variant="mini-scene" />
          {category.label}
        </p>
        <p className="mt-1 text-sm text-[#6b635a]">{category.tagline}</p>

        {category.recommended && !recommendedInFirstGroup ? (
          <div className="mt-5">
            <ToolButton
              item={category.recommended}
              starred
              onSelect={onAction}
            />
          </div>
        ) : null}

        <div className="mt-5 flex flex-col gap-3">
          {category.groups.map((group) => (
            <ToolGroupSection
              key={group.id}
              group={group}
              recommendedId={category.recommended?.id}
              onSelect={onAction}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={workspacePanelShellClass({ width: "narrow" })}
      data-testid="focus-area-panel"
      data-focus-view="feelings"
    >
      <p className="text-2xl font-semibold text-[#1f1c19]">Focus</p>
      <p className="mt-1 text-base text-[#6b635a]">
        How are you feeling right now?
      </p>

      <ul className="mt-5 flex flex-col gap-2">
        {FOCUS_FEELING_ENTRIES.map((feeling) => (
          <li key={feeling.id}>
            <CompanionNavCard
              objectId={feeling.objectId}
              title={feeling.label}
              tagline={feeling.immediate ? feeling.tagline : undefined}
              onClick={() => handleFeelingSelect(feeling.id)}
              visualVariant="mini-scene"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
