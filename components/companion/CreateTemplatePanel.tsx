"use client";

import { useMemo, useState } from "react";
import type { CreateWorkflowState } from "@/lib/createWorkflow";
import {
  applyTemplateSelection,
  defaultTemplateFor,
  findCustomTemplate,
  findPresetTemplate,
  listAllTemplatesForItem,
  loadCustomTemplates,
  newSectionId,
  resolveTemplateName,
  resolveTemplateSections,
  saveCustomTemplate,
  type CreateTemplateSection,
} from "@/lib/createTemplates";
import { effectiveSubtypeLabel, OTHER_OPTION } from "@/lib/createTypePickers";
import { resolvedTypeLabel } from "@/lib/createWorkflow";

const btnPrimary =
  "w-full rounded-xl bg-[#1e4f4f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#163a3a] disabled:cursor-not-allowed disabled:opacity-40";
const btnSecondary =
  "w-full rounded-xl border border-[#1e4f4f]/30 bg-white px-5 py-3 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]";

type PanelMode = "view" | "change" | "edit" | "create-custom";

function SectionEditor({
  sections,
  onChange,
}: {
  sections: CreateTemplateSection[];
  onChange: (next: CreateTemplateSection[]) => void;
}) {
  function move(index: number, dir: -1 | 1) {
    const next = [...sections];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target]!, next[index]!];
    onChange(next);
  }

  return (
    <ul className="mt-3 space-y-2">
      {sections.map((sec, i) => (
        <li
          key={sec.id}
          className="flex items-center gap-2 rounded-lg border border-[#e7dfd4] bg-[#faf7f2] px-2 py-1.5"
        >
          <input
            type="text"
            value={sec.label}
            onChange={(e) => {
              const next = [...sections];
              next[i] = { ...sec, label: e.target.value };
              onChange(next);
            }}
            className="min-w-0 flex-1 rounded border border-[#e7dfd4] bg-white px-2 py-1 text-sm"
            aria-label={`Section ${i + 1} name`}
          />
          <button
            type="button"
            disabled={i === 0}
            onClick={() => move(i, -1)}
            className="text-xs font-semibold text-[#1e4f4f] disabled:opacity-30"
            aria-label="Move up"
          >
            ↑
          </button>
          <button
            type="button"
            disabled={i === sections.length - 1}
            onClick={() => move(i, 1)}
            className="text-xs font-semibold text-[#1e4f4f] disabled:opacity-30"
            aria-label="Move down"
          >
            ↓
          </button>
          <button
            type="button"
            disabled={sections.length <= 1}
            onClick={() => onChange(sections.filter((_, j) => j !== i))}
            className="text-xs font-semibold text-[#9a4a4a] disabled:opacity-30"
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  );
}

export function CreateTemplatePanel({
  workflow,
  onWorkflowChange,
  compact = false,
}: {
  workflow: CreateWorkflowState;
  onWorkflowChange: (next: CreateWorkflowState) => void;
  /** Read-only summary on readiness step */
  compact?: boolean;
}) {
  const itemType = resolvedTypeLabel(workflow);
  const subtype = effectiveSubtypeLabel(
    workflow.selectedSubtype,
    workflow.customSubtype,
  );
  const [mode, setMode] = useState<PanelMode>("view");
  const [editSections, setEditSections] = useState<CreateTemplateSection[]>([]);
  const [customName, setCustomName] = useState("");
  const [saveAsCustomName, setSaveAsCustomName] = useState("");

  const templateName = resolveTemplateName(workflow);
  const sections = resolveTemplateSections(workflow);
  const templateOptions = useMemo(
    () => (itemType ? listAllTemplatesForItem(itemType, subtype) : []),
    [itemType, subtype],
  );

  if (!itemType) return null;

  function openEdit() {
    const current =
      resolveTemplateSections(workflow) ??
      defaultTemplateFor(itemType, subtype).sections;
    setEditSections(current.map((s) => ({ ...s })));
    setMode("edit");
  }

  function applySections(sectionsNext: CreateTemplateSection[], name?: string) {
    onWorkflowChange({
      ...workflow,
      useTemplate: true,
      templateSections: sectionsNext,
      selectedTemplateName: name ?? workflow.selectedTemplateName,
    });
    setMode("view");
  }

  if (compact && mode === "view") {
    return (
      <div className="mt-4 rounded-xl border border-[#e7dfd4] bg-[#faf7f2] px-3 py-2 text-sm">
        <p className="font-semibold text-[#6b635a]">Template</p>
        <p className="mt-0.5 text-[#1f1c19]">{templateName}</p>
        {sections?.length ? (
          <p className="mt-1 text-xs text-[#6b635a]">
            {sections.map((s) => s.label).join(" · ")}
          </p>
        ) : (
          <p className="mt-1 text-xs text-[#6b635a]">Freeform — no section scaffold</p>
        )}
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode("change")}
            className="text-xs font-semibold text-[#1e4f4f] hover:underline"
          >
            Change Template
          </button>
          <button
            type="button"
            onClick={openEdit}
            className="text-xs font-semibold text-[#1e4f4f] hover:underline"
          >
            Edit Template
          </button>
        </div>
      </div>
    );
  }

  if (mode === "change") {
    return (
      <div className="mt-4 border-t border-[#e7dfd4] pt-4">
        <p className="text-base font-semibold text-[#1f1c19]">Change template</p>
        <ul className="mt-3 space-y-2">
          {templateOptions.map((opt) => (
            <li key={opt.id}>
              <button
                type="button"
                onClick={() => {
                  if (opt.id === OTHER_OPTION) {
                    setCustomName("");
                    setEditSections(
                      defaultTemplateFor(itemType, subtype).sections.map((s) => ({
                        ...s,
                        id: newSectionId(),
                      })),
                    );
                    setMode("create-custom");
                    return;
                  }
                  const preset = findPresetTemplate(opt.id);
                  const custom = findCustomTemplate(opt.id);
                  const name = preset?.name ?? custom?.name ?? opt.name;
                  onWorkflowChange(
                    applyTemplateSelection(workflow, opt.id, name, null),
                  );
                  setMode("view");
                }}
                className={`${btnSecondary} text-left`}
              >
                {opt.name}
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() =>
                onWorkflowChange(applyTemplateSelection(workflow, "none", "No template (freeform)"))
              }
              className={`${btnSecondary} text-left`}
            >
              Use Without Template
            </button>
          </li>
        </ul>
        <button
          type="button"
          onClick={() => setMode("view")}
          className="mt-3 text-sm font-semibold text-[#6b635a]"
        >
          Cancel
        </button>
      </div>
    );
  }

  if (mode === "edit") {
    return (
      <div className="mt-4 border-t border-[#e7dfd4] pt-4">
        <p className="text-base font-semibold text-[#1f1c19]">
          {itemType} template structure
        </p>
        <SectionEditor sections={editSections} onChange={setEditSections} />
        <button
          type="button"
          onClick={() =>
            setEditSections([
              ...editSections,
              { id: newSectionId(), label: "New Section" },
            ])
          }
          className="mt-2 text-sm font-semibold text-[#1e4f4f]"
        >
          + Add section
        </button>
        <input
          type="text"
          value={saveAsCustomName}
          onChange={(e) => setSaveAsCustomName(e.target.value)}
          placeholder="Save as custom template (optional name)"
          className="mt-4 w-full rounded-lg border border-[#c9bfb0] px-3 py-2 text-sm"
        />
        <div className="mt-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              let next: CreateWorkflowState = {
                ...workflow,
                useTemplate: true,
                templateSections: editSections,
              };
              if (saveAsCustomName.trim()) {
                const saved = saveCustomTemplate({
                  name: saveAsCustomName.trim(),
                  itemType,
                  subtype,
                  sections: editSections,
                });
                next = applyTemplateSelection(
                  next,
                  saved.id,
                  saved.name,
                  editSections,
                );
              }
              onWorkflowChange(next);
              setMode("view");
              setSaveAsCustomName("");
            }}
            className={btnPrimary}
          >
            Save template
          </button>
          <button type="button" onClick={() => setMode("view")} className={btnSecondary}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (mode === "create-custom") {
    return (
      <div className="mt-4 border-t border-[#e7dfd4] pt-4">
        <p className="text-base font-semibold text-[#1f1c19]">Create custom template</p>
        <label className="mt-3 block text-sm font-semibold text-[#6b635a]">
          Template name
        </label>
        <input
          type="text"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          placeholder="e.g. Shari Weekly Newsletter"
          className="mt-1 w-full rounded-lg border border-[#c9bfb0] px-3 py-2 text-sm"
        />
        <p className="mt-3 text-sm font-semibold text-[#6b635a]">Sections</p>
        <SectionEditor sections={editSections} onChange={setEditSections} />
        <button
          type="button"
          onClick={() =>
            setEditSections([
              ...editSections,
              { id: newSectionId(), label: "New Section" },
            ])
          }
          className="mt-2 text-sm font-semibold text-[#1e4f4f]"
        >
          + Add section
        </button>
        <div className="mt-3 flex flex-col gap-2">
          <button
            type="button"
            disabled={!customName.trim()}
            onClick={() => {
              const saved = saveCustomTemplate({
                name: customName.trim(),
                itemType,
                subtype,
                sections: editSections,
              });
              onWorkflowChange(
                applyTemplateSelection(workflow, saved.id, saved.name, editSections),
              );
              setMode("view");
            }}
            className={btnPrimary}
          >
            Save template
          </button>
          <button type="button" onClick={() => setMode("view")} className={btnSecondary}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 border-t border-[#e7dfd4] pt-4">
      <p className="text-sm font-bold uppercase tracking-wide text-[#6b635a]">
        Template
      </p>
      <p className="mt-1 text-sm text-[#6b635a]">
        Selected:{" "}
        <span className="font-semibold text-[#1f1c19]">{templateName}</span>
      </p>
      {sections?.length ? (
        <ul className="mt-2 list-inside list-disc text-sm text-[#4b463f]">
          {sections.map((s) => (
            <li key={s.id}>{s.label}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-[#6b635a]">
          Freeform — draft will use your answers only.
        </p>
      )}
      <div className="mt-3 flex flex-col gap-2">
        <button type="button" onClick={() => setMode("change")} className={btnSecondary}>
          Change Template
        </button>
        <button
          type="button"
          onClick={openEdit}
          disabled={!workflow.useTemplate}
          className={btnSecondary}
        >
          Edit Template
        </button>
        <button
          type="button"
          onClick={() =>
            onWorkflowChange(
              applyTemplateSelection(workflow, "none", "No template (freeform)"),
            )
          }
          className={btnSecondary}
        >
          Use Without Template
        </button>
        <button
          type="button"
          onClick={() => {
            setCustomName("");
            setEditSections(
              (sections ?? defaultTemplateFor(itemType, subtype).sections).map(
                (s) => ({ ...s, id: newSectionId() }),
              ),
            );
            setMode("create-custom");
          }}
          className="text-sm font-semibold text-[#1e4f4f] hover:underline"
        >
          Create Custom Template
        </button>
      </div>
    </div>
  );
}
