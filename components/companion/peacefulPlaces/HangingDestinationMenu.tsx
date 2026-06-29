"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";

type MenuItem = {
  id: string;
  name: string;
};

type Props = {
  items: MenuItem[];
  onSelect: (id: string) => void;
  className?: string;
};

const LANTERN_GLOW_MS = 950;

/** Cloth / wooden hanging destination tags — lantern glow on choose. */
export function HangingDestinationMenu({ items, onSelect, className }: Props) {
  const [litId, setLitId] = useState<string | null>(null);
  const glowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (glowTimerRef.current) clearTimeout(glowTimerRef.current);
    };
  }, []);

  function handleSelect(id: string, e: MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    setLitId(id);
    if (glowTimerRef.current) clearTimeout(glowTimerRef.current);
    glowTimerRef.current = setTimeout(() => setLitId(null), LANTERN_GLOW_MS);
    onSelect(id);
  }

  if (!items.length) return null;

  return (
    <ul
      className={["hanging-destination-menu", "hanging-destination-menu--garden-cloth", className]
        .filter(Boolean)
        .join(" ")}
      role="list"
    >
      {items.map((item) => {
        const isLit = litId === item.id;
        return (
          <li key={item.id} className="hanging-destination-menu__item-wrap">
            <span className="hanging-destination-menu__chain" aria-hidden="true" />
            <span
              className="hanging-destination-menu__lantern-glow"
              data-lit={isLit ? "1" : undefined}
              aria-hidden="true"
            />
            <button
              type="button"
              className="hanging-destination-menu__sign-board"
              data-lit={isLit ? "1" : undefined}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => handleSelect(item.id, e)}
            >
              <span className="hanging-destination-menu__name">{item.name}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
