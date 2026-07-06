"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { ConciergeDrawerSection } from "@/lib/founder/concierge/types";

type ConciergeDrawerProps = {
  sections: ConciergeDrawerSection[];
};

export function ConciergeDrawer({ sections }: ConciergeDrawerProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="founder-concierge-drawer__trigger"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="founder-concierge-drawer"
      >
        Concierge
      </button>

      <div
        className={`founder-concierge-drawer__backdrop${open ? " founder-concierge-drawer__backdrop--open" : ""}`}
        aria-hidden={!open}
        onClick={() => setOpen(false)}
      />

      <aside
        id="founder-concierge-drawer"
        className={`founder-concierge-drawer${open ? " founder-concierge-drawer--open" : ""}`}
        aria-hidden={!open}
        aria-label="Executive Concierge"
      >
        <header className="founder-concierge-drawer__header">
          <div>
            <p className="founder-concierge-drawer__eyebrow">Executive Concierge</p>
            <h2 className="founder-concierge-drawer__title">Your office</h2>
          </div>
          <button
            type="button"
            className="founder-concierge-drawer__close"
            onClick={() => setOpen(false)}
            aria-label="Close concierge"
          >
            Close
          </button>
        </header>

        <div className="founder-concierge-drawer__body">
          {sections.map((section) => (
            <section key={section.id} className="founder-concierge-drawer__section">
              <h3>{section.title}</h3>
              <ul>
                {section.items.map((item) => (
                  <li key={item.id}>
                    <Link href={item.href} onClick={() => setOpen(false)}>
                      <span>{item.label}</span>
                      {item.meta ? <span>{item.meta}</span> : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </aside>
    </>
  );
}
