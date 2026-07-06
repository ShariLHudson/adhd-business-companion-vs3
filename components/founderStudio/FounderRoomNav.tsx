import Link from "next/link";

import { FOUNDER_STUDIO_BASE } from "@/lib/founderStudio/founderConfig";
import { FOUNDER_ROOMS } from "@/lib/founderStudio/rooms";

import { FOUNDER_ACCENT_CLASS } from "./founderLabelStyles";

type FounderRoomNavProps = {
  activeRoomId?: string;
};

export function FounderRoomNav({ activeRoomId }: FounderRoomNavProps) {
  return (
    <nav className="founder-room-nav" aria-label="Founder Studio rooms">
      <Link
        href={FOUNDER_STUDIO_BASE}
        className={`founder-room-nav__home${activeRoomId ? "" : " founder-room-nav__home--active"}`}
      >
        Studio Home
      </Link>
      <div className="founder-room-nav__grid">
        {FOUNDER_ROOMS.map((room) => (
          <Link
            key={room.id}
            href={room.href}
            className={`founder-room-nav__card ${FOUNDER_ACCENT_CLASS[room.accent]}${activeRoomId === room.id ? " founder-room-nav__card--active" : ""}`}
          >
            <span className="founder-room-nav__card-title">{room.title}</span>
            <span className="founder-room-nav__card-question">{room.question}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
