import { sortByDropdownLabel } from "@/lib/dropdownSort";
import type { PersonalDateCategory, PersonalDateKind } from "./types";

const PERSONAL_DATE_CATEGORY_LABEL: Record<PersonalDateCategory, string> = {
  business: "Business",
  custom: "Custom",
  family: "Family",
  health: "Health",
  personal: "Personal",
  travel: "Travel",
};

const PERSONAL_DATE_KIND_LABEL: Record<PersonalDateKind, string> = {
  anniversary: "Anniversary",
  birthday: "Birthday",
  custom: "Custom",
  due_date: "Due date",
  launch: "Launch",
  milestone: "Milestone",
  speaking: "Speaking event",
  vacation: "Vacation countdown",
  workshop: "Workshop",
};

export const PERSONAL_DATE_CATEGORY_OPTIONS: {
  value: PersonalDateCategory;
  label: string;
}[] = sortByDropdownLabel(
  (Object.keys(PERSONAL_DATE_CATEGORY_LABEL) as PersonalDateCategory[]).map(
    (value) => ({ value, label: PERSONAL_DATE_CATEGORY_LABEL[value] }),
  ),
  (o) => o.label,
);

export const PERSONAL_DATE_KIND_OPTIONS: {
  value: PersonalDateKind;
  label: string;
}[] = sortByDropdownLabel(
  (Object.keys(PERSONAL_DATE_KIND_LABEL) as PersonalDateKind[]).map((value) => ({
    value,
    label: PERSONAL_DATE_KIND_LABEL[value],
  })),
  (o) => o.label,
);
