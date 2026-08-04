"use client";

import { useState } from "react";
import { AudienceSelector } from "@/components/companion/AudienceSelector";
import { CategoryPickerSelect } from "@/components/companion/CategoryPickerSelect";
import { CollapsibleSection } from "@/components/companion/CollapsibleSection";
import { NO_CATEGORY } from "@/lib/categoryRevealUx";
import {
  CREATE_LAUNCHER_TYPE_OPTIONS,
  type CreateLauncherDisplayType,
} from "@/lib/createLauncherTypes";
import { createTitleLabelForType } from "@/lib/createTitleLabels";
import { OTHER_OPTION } from "@/lib/createTypePickers";
import {
  COMPANION_INPUT_CLASS,
  COMPANION_SETUP_LABEL_CLASS,
} from "@/lib/companionFormControls";
import { initialSectionOpen } from "@/lib/expandableUi";
import { getWorkspaceHelpContent } from "@/lib/workspaceHelpContent";
import { workspacePanelShellClass } from "@/lib/workspaceLayoutTokens";

const GOLD_LABEL = "text-xs font-bold uppercase tracking-wide text-[#b45309]";

function CreateHelpBody() {
  const help = getWorkspaceHelpContent("content-generator");
  if (!help) return null;

  return (
    <div className="space-y-3 text-sm leading-relaxed text-[#2d2926]">
      <section>
        <p className={GOLD_LABEL}>What this area is</p>
        <p className="mt-1">{help.whatItIs}</p>
      </section>
      <section>
        <p className={GOLD_LABEL}>When to use it</p>
        <p className="mt-1">{help.whenToUse}</p>
      </section>
      <section>
        <p className={GOLD_LABEL}>Recommended workflow</p>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5">
          {help.workflow.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>
      {help.tips.length > 0 ? (
        <section>
          <p className={GOLD_LABEL}>Helpful tips</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-[#4b463f]">
            {help.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

export function CreateLauncherPanel({
  onCreate,
}: {
  onCreate: (catalogLabel: string, customLabel?: string, title?: string) => void;
}) {
  const [helpOpen, setHelpOpen] = useState(initialSectionOpen);
  const [title, setTitle] = useState("");
  const [selectedType, setSelectedType] = useState<
    CreateLauncherDisplayType | typeof NO_CATEGORY
  >(NO_CATEGORY);
  const [customType, setCustomType] = useState("");

  const isCustom = selectedType === OTHER_OPTION;
  const typeForLabel = isCustom
    ? customType.trim() || OTHER_OPTION
    : selectedType === NO_CATEGORY
      ? ""
      : selectedType;
  const titleLabel = createTitleLabelForType(typeForLabel);

  const canCreate =
    title.trim().length > 0 &&
    selectedType !== NO_CATEGORY &&
    (!isCustom || customType.trim().length > 0);

  function toggleSection(id: string) {
    if (id === "create-help") setHelpOpen((open) => !open);
  }

  function handleCreate() {
    if (!canCreate) return;
    const artifactTitle = title.trim();
    if (isCustom) {
      onCreate(OTHER_OPTION, customType.trim(), artifactTitle);
      return;
    }
    onCreate(selectedType as string, undefined, artifactTitle);
  }

  const typeOptions = CREATE_LAUNCHER_TYPE_OPTIONS.map((label) => ({
    value: label,
    label,
  }));

  return (
    <div
      className={workspacePanelShellClass({
        width: "standard",
        inSplit: true,
        extra: "flex min-h-0 flex-1 flex-col",
      })}
      data-testid="create-launcher"
    >
      <div className="shrink-0 border-b border-[#e7dfd4] px-4 py-2 sm:px-6">
        <CollapsibleSection
          id="create-help"
          title="How To Use Create"
          open={helpOpen}
          onToggle={toggleSection}
        >
          <CreateHelpBody />
        </CollapsibleSection>

        <div className="mt-2 space-y-2">
          <label htmlFor="create-artifact-title" className={COMPANION_SETUP_LABEL_CLASS}>
            {titleLabel}
          </label>
          <input
            id="create-artifact-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={`Enter ${titleLabel.toLowerCase()}…`}
            className={COMPANION_INPUT_CLASS}
            data-testid="create-artifact-title"
          />
          <AudienceSelector />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-4 py-4 sm:px-6">
        <div className="mx-auto w-full max-w-md">
          <h2 className="text-lg font-bold text-[#1f1c19]">
            What would you like to create?
          </h2>

          <div className="mt-3">
            <CategoryPickerSelect
              label="Content type"
              hideLabel
              value={selectedType}
              onChange={(value) => {
                setSelectedType(value);
                if (value !== OTHER_OPTION) setCustomType("");
              }}
              options={typeOptions}
              placeholder="Choose a content type…"
            />
          </div>

          {isCustom ? (
            <div className="mt-3">
              <label
                htmlFor="create-custom-type"
                className={COMPANION_SETUP_LABEL_CLASS}
              >
                Describe your custom piece
              </label>
              <input
                id="create-custom-type"
                type="text"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canCreate) handleCreate();
                }}
                placeholder="e.g. Case study, podcast show notes…"
                className={`${COMPANION_INPUT_CLASS} mt-1`}
                autoFocus
              />
            </div>
          ) : null}

          <button
            type="button"
            disabled={!canCreate}
            onClick={handleCreate}
            className="mt-4 w-full rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-base font-semibold text-white transition-colors hover:bg-[#163c3c] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
