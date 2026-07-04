"use client";

type Props = {
  penVariant?: string;
};

/** The member's chosen pen — resting beside the journal on the desk. */
export function JournalGazeboDeskPen({ penVariant }: Props) {
  if (!penVariant) return null;

  return (
    <div
      className="journal-desk-pen"
      data-pen={penVariant}
      aria-hidden="true"
    />
  );
}
