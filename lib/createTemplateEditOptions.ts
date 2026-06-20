export type TemplateEditOption = {
  id: string;
  label: string;
  opener: string;
};

export type CreateTemplateSection = {
  id: string;
  label: string;
};

export function buildTemplateEditOptions(
  sections: CreateTemplateSection[],
): TemplateEditOption[] {
  const base = sections
    .filter((section) => section.id && section.label)
    .map((section) => ({
      id: section.id,
      label: section.label,
      opener: buildSectionEditOpener(section.label),
    }));

  return [
    ...base,
    {
      id: "other",
      label: "Other",
      opener: "What would you like to change?",
    },
  ];
}

export function buildSectionEditOpener(label: string): string {
  return `Let's work on the ${label.toLowerCase()} section. What doesn't feel right about it?`;
}

export function openerForSectionId(
  sections: CreateTemplateSection[],
  sectionId: string,
): string | null {
  const options = buildTemplateEditOptions(sections);
  return options.find((option) => option.id === sectionId)?.opener ?? null;
}
