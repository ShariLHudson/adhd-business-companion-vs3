"use client";

import type { ReactNode } from "react";

type Props = {
  id: string;
  emoji: string;
  label: string;
  description: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
  sectionRef?: (node: HTMLElement | null) => void;
};

export function EstateDirectorySign({
  id,
  emoji,
  label,
  description,
  open,
  onToggle,
  children,
  sectionRef,
}: Props) {
  return (
    <section ref={sectionRef} className="estate-directory-sign">
      <button
        type="button"
        id={`estate-directory-sign-${id}`}
        aria-expanded={open}
        aria-controls={`estate-directory-panel-${id}`}
        onClick={onToggle}
        className="estate-directory-sign__trigger"
      >
        <span className="estate-directory-sign__face">
          <span className="estate-directory-sign__emoji" aria-hidden="true">
            {emoji}
          </span>
          <span className="estate-directory-sign__copy">
            <span className="estate-directory-sign__label">{label}</span>
            <span className="estate-directory-sign__description">
              {description}
            </span>
          </span>
          <span className="estate-directory-sign__chevron" aria-hidden="true">
            {open ? "▾" : "▸"}
          </span>
        </span>
      </button>
      {open ? (
        <div
          id={`estate-directory-panel-${id}`}
          role="region"
          aria-labelledby={`estate-directory-sign-${id}`}
          className="estate-directory-sign__panel"
        >
          {children}
        </div>
      ) : null}
    </section>
  );
}
