"use client";

import { JOURNAL_CREATE_INVITE } from "@/lib/journalGazebo/hospitality";

type Props = {
  onClick: () => void;
};

/** Gold-embossed invitation on the desk. */
export function JournalGazeboLeatherOvalCta({ onClick }: Props) {
  return (
    <button
      type="button"
      className="jg-gold-emboss-cta"
      onClick={onClick}
    >
      <span className="jg-gold-emboss-cta__shadow" aria-hidden="true" />
      <span className="jg-gold-emboss-cta__text">{JOURNAL_CREATE_INVITE}</span>
    </button>
  );
}
