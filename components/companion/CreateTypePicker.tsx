"use client";

import { CategoryPickerSelect } from "@/components/companion/CategoryPickerSelect";
import { WorkspaceStepCard } from "@/components/companion/WorkspaceStepCard";
import { NO_CATEGORY } from "@/lib/categoryRevealUx";
import { VoiceAnswerField } from "@/components/companion/VoiceAnswerField";
import { CREATE_WORKSPACE_V2 } from "@/lib/createWorkspaceV2";
import {
  OTHER_OPTION,
  PRIMARY_CREATE_ITEMS,
  userFacingCreateTypeLabel,
} from "@/lib/createTypePickers";
import { useState } from "react";

/** Type picker only — selecting an item immediately starts the companion conversation. */
export function CreateTypePicker({
  onPick,
}: {
  onPick: (label: string) => void;
}) {
  const [customItemText, setCustomItemText] = useState("");
  const [showingCustom, setShowingCustom] = useState(false);

  const itemOptions = PRIMARY_CREATE_ITEMS.map((label) => ({
    value: label,
    label: userFacingCreateTypeLabel(label) ?? label,
  }));

  function handlePick(label: string) {
    if (label === OTHER_OPTION) {
      setShowingCustom(true);
      return;
    }
    onPick(label);
  }

  return (
    <div className="flex flex-1 flex-col justify-center px-4 py-6">
      <WorkspaceStepCard
        sectionLabel="Create"
        title="What would you like to create?"
        showCreateTooltip
        footer={
          CREATE_WORKSPACE_V2
            ? "Choose a type — your blueprint opens in the workspace."
            : "Choose a type — then we'll talk it through together."
        }
      >
        <CategoryPickerSelect
          label="Content type"
          hideLabel
          value={NO_CATEGORY}
          onChange={(v) => {
            if (!v) return;
            handlePick(v);
          }}
          options={itemOptions}
          placeholder="Marketing Plan, Workshop, Lead Magnet…"
        />
        {showingCustom ? (
          <div className="mt-3">
            <VoiceAnswerField
              value={customItemText}
              onChange={setCustomItemText}
              multiline={false}
              compact
              placeholder="e.g. Case study, podcast outline…"
              autoFocus
              micTitle="Tell me what you want to create"
            />
            <button
              type="button"
              disabled={!customItemText.trim()}
              onClick={() => onPick(customItemText.trim())}
              className="mt-3 w-full rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        ) : null}
      </WorkspaceStepCard>
    </div>
  );
}
