"use client";

import { resolveEstateRoomTemplate } from "@/lib/estate/estateRoomTemplate/resolveEstateRoomTemplate";

type Props = {
  roomId: string;
  className?: string;
};

/**
 * Estate Room Template layers 1–2: hero plaque + Shari welcome above invitations.
 */
export function EstateRoomTemplateArrival({ roomId, className }: Props) {
  const template = resolveEstateRoomTemplate(roomId);
  const { hero, welcome } = template;

  return (
    <header
      className={["estate-room-template-arrival", className]
        .filter(Boolean)
        .join(" ")}
      data-testid="estate-room-template-arrival"
      data-room-id={roomId}
    >
      <div className="estate-room-template-arrival__hero" aria-hidden={false}>
        <p className="estate-room-template-arrival__title">{hero.title}</p>
        {hero.subtitle ? (
          <p className="estate-room-template-arrival__subtitle">{hero.subtitle}</p>
        ) : null}
        {hero.purpose ? (
          <p className="estate-room-template-arrival__purpose">{hero.purpose}</p>
        ) : null}
      </div>
      <div className="estate-room-template-arrival__welcome-block">
        <p className="estate-room-template-arrival__welcome">{welcome.shariLine}</p>
        {welcome.shariParagraphs?.map((paragraph) => (
          <p
            key={paragraph}
            className="estate-room-template-arrival__welcome estate-room-template-arrival__welcome--follow"
          >
            {paragraph}
          </p>
        ))}
      </div>
    </header>
  );
}
