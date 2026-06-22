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
import { OTHER_OPTION } from "@/lib/createTypePickers";
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
  onCreate: (catalogLabel: string, customLabel?: string) => void;
}) {
  const [helpOpen, setHelpOpen] = useState(initialSectionOpen);
  const [audienceOpen, setAudienceOpen] = useState(initialSectionOpen);
  const [selectedType, setSelectedType] = useState<
    CreateLauncherDisplayType | typeof NO_CATEGORY
  >(NO_CATEGORY);
  const [customType, setCustomType] = useState("");

  const isCustom = selectedType === OTHER_OPTION;
  const canCreate =
    selectedType !== NO_CATEGORY &&
    (!isCustom || customType.trim().length > 0);

  function toggleSection(id: string) {
    if (id === "create-help") setHelpOpen((open) => !open);
    if (id === "audience-build") setAudienceOpen((open) => !open);
  }

  function handleCreate() {
    if (!canCreate) return;
    if (isCustom) {
      onCreate(OTHER_OPTION, customType.trim());
      return;
    }
    onCreate(selectedType as string);
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
      <div className="shrink-0 border-b border-[#e7dfd4] px-4 py-3 sm:px-6">
        <CollapsibleSection
          id="create-help"
          title="How To Use Create"
          open={helpOpen}
          onToggle={toggleSection}
        >
          <CreateHelpBody />
        </CollapsibleSection>

        <div className="mt-2">
          <CollapsibleSection
            id="audience-build"
            title="Audience Build"
            open={audienceOpen}
            onToggle={toggleSection}
          >
            <AudienceSelector compact />
            <p className="mt-3 text-xs text-[#9a8f82]">
              Future creation settings will live here — defaults for format,
              length, and style.
            </p>
          </CollapsibleSection>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-md">
          <h2 className="text-center text-2xl font-bold text-[#1f1c19]">
            What Would You Like To Create?
          </h2>

          <div className="mt-6">
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
                className="text-sm font-semibold text-[#6b635a]"
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
                className="mt-1.5 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
                autoFocus
              />
            </div>
          ) : null}

          <button
            type="button"
            disabled={!canCreate}
            onClick={handleCreate}
            className="mt-5 w-full rounded-xl bg-[#1e4f4f] px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-[#163c3c] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
