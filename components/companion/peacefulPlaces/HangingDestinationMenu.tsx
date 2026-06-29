"use client";

import type { MouseEvent } from "react";

type MenuItem = {
  id: string;
  name: string;
};

type Props = {
  items: MenuItem[];
  onSelect: (id: string) => void;
  className?: string;
};

export function HangingDestinationMenu({ items, onSelect, className }: Props) {
  if (!items.length) return null;

  function handleSelect(id: string, e: MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    onSelect(id);
  }

  return (
    <ul
      className={["hanging-destination-menu", "hanging-destination-menu--garden-cloth", className]
        .filter(Boolean)
        .join(" ")}
      role="list"
    >
      {items.map((item) => (
        <li key={item.id} className="hanging-destination-menu__item-wrap">
          <span className="hanging-destination-menu__chain" aria-hidden="true" />
          <button
            type="button"
            className="hanging-destination-menu__sign-board"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => handleSelect(item.id, e)}
          >
            <span className="hanging-destination-menu__name">{item.name}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
