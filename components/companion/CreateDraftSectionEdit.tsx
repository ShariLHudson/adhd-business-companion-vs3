"use client";

import { buildTemplateEditOptions } from "@/lib/createTemplateEditOptions";

type Section = {
  id: string;
  label: string;
};

export function CreateDraftSectionEdit({
  sections,
  onSelectSection,
  disabled,
}: {
  sections: Section[];
  onSelectSection: (sectionId: string, opener: string) => void;
  disabled?: boolean;
}) {
  const options = buildTemplateEditOptions(sections);

  if (!sections.length) return null;

  return (
    <div className="mt-4 rounded-2xl border border-[#e7d9c8] bg-white p-4">
      <label
        htmlFor="draft-section-edit"
        className="block text-sm font-bold text-[#3b2f27]"
      >
        What would you like to change?
      </label>
      <p className="mt-1 text-sm text-[#6b635a]">
        Pick one section — Shari will help you improve just that part in chat.
      </p>
      <select
        id="draft-section-edit"
        disabled={disabled}
        className="mt-2 w-full rounded-xl border border-[#d7c8b8] bg-white px-3 py-2 text-sm font-medium text-[#1f1c19] outline-none focus:border-[#1e4f4f] disabled:opacity-50"
        defaultValue=""
        onChange={(event) => {
          const option = options.find((item) => item.id === event.target.value);
          if (!option) return;
          onSelectSection(option.id, option.opener);
          event.currentTarget.value = "";
        }}
      >
        <option value="" disabled>
          Choose a section
        </option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
