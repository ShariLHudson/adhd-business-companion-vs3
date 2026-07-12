"use client";

import { buildShariNote } from "@/lib/profile/executiveOfficePresentation";

type Props = {
  revision: number;
};

/** Companion insight from profile completeness — presentation only. */
export function ShariNote({ revision }: Props) {
  const note = buildShariNote();

  return (
    <aside
      className="executive-office-shari-note"
      aria-label="Shari's Note"
      key={revision}
    >
      <p className="executive-office-shari-note__label">Shari&apos;s Note</p>
      <p className="executive-office-shari-note__body">{note}</p>
    </aside>
  );
}
