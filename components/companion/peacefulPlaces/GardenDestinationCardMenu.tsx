"use client";

import type { CSSProperties, MouseEvent } from "react";
import type { GardenDestinationCard } from "@/lib/peacefulPlaces/gardenDestinationCards";
import { crossfadeGardenCardAmbience } from "@/lib/peacefulPlaces/gardenCardAmbience";

type Props = {
  cards: GardenDestinationCard[];
  onSelect: (id: string) => void;
  onMenuPointerLeave?: () => void;
  className?: string;
};

export function GardenDestinationCardMenu({
  cards,
  onSelect,
  onMenuPointerLeave,
  className,
}: Props) {
  if (!cards.length) return null;

  function handleSelect(id: string, e: MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    void crossfadeGardenCardAmbience(null);
    onSelect(id);
  }

  function handleCardEnter(id: string) {
    void crossfadeGardenCardAmbience(id);
  }

  function handleMenuLeave() {
    void crossfadeGardenCardAmbience(null);
    onMenuPointerLeave?.();
  }

  return (
    <ul
      className={["garden-destination-cards", className].filter(Boolean).join(" ")}
      role="list"
      onPointerLeave={handleMenuLeave}
    >
      {cards.map((card) => (
        <li key={card.id} className="garden-destination-cards__item">
          <button
            type="button"
            className="garden-destination-card"
            aria-label={`${card.title}. ${card.description}`}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerEnter={() => handleCardEnter(card.id)}
            onClick={(e) => handleSelect(card.id, e)}
          >
            <span className="garden-destination-card__media" aria-hidden="true">
              <img
                className="garden-destination-card__image"
                src={card.imageUrl}
                alt=""
                loading="lazy"
                decoding="async"
                style={
                  card.imageObjectPosition
                    ? ({ objectPosition: card.imageObjectPosition } as CSSProperties)
                    : undefined
                }
              />
              <span className="garden-destination-card__shade" />
            </span>
            <span className="garden-destination-card__copy">
              <span className="garden-destination-card__title">{card.title}</span>
              <span className="garden-destination-card__description">
                {card.description}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
