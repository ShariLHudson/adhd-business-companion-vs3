"use client";

import type { MouseEvent } from "react";

type MenuItem = {
  id: string;
  name: string;
};

type Props = {
  items: MenuItem[];
  onSelect: (id: string) => void;
};

export function HangingDestinationMenu({ items, onSelect }: Props) {
  if (!items.length) return null;

  function handleSelect(id: string, e: MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    onSelect(id);
  }

  return (
    <ul className="hanging-destination-menu" role="list">
      {items.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            className="hanging-destination-menu__item"
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
