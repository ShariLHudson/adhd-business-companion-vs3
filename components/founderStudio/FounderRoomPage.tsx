import Link from "next/link";

import { FOUNDER_STUDIO_BASE } from "@/lib/founderStudio/founderConfig";
import type { FounderRoomMeta } from "@/lib/founderStudio/types";
import { sampleRoomCards } from "@/lib/founderStudio/sampleData";

import { FounderCard } from "./FounderCard";
import { FounderPanel } from "./FounderPanel";
import { FounderRoomNav } from "./FounderRoomNav";

type FounderRoomPageProps = {
  room: FounderRoomMeta;
};

export function FounderRoomPageView({ room }: FounderRoomPageProps) {
  const cards = sampleRoomCards(room.id);

  return (
    <div className="founder-room-page">
      <header className="founder-room-page__hero">
        <Link href={FOUNDER_STUDIO_BASE} className="founder-room-page__back">
          ← Back to Founder Studio
        </Link>
        <p className="founder-room-page__eyebrow">Founder Studio™</p>
        <h1>{room.title}</h1>
        <p className="founder-room-page__question">{room.question}</p>
        <p className="founder-room-page__purpose">{room.purpose}</p>
      </header>

      <div className="founder-room-page__cards">
        {cards.map((card) => (
          <FounderCard
            key={card.id}
            title={card.title}
            summary={card.summary}
            tone={card.tone}
            toneLabel={
              card.tone === "quick-win"
                ? "Quick Win"
                : card.tone === "on-deck"
                  ? "On Deck"
                  : card.tone
                    ? card.tone.charAt(0).toUpperCase() + card.tone.slice(1)
                    : undefined
            }
          />
        ))}
      </div>

      <FounderPanel title="Coming next" className="founder-room-page__coming">
        <p>
          Real {room.title} intelligence connects here — SPARK™ patterns, FLAME™
          mentoring memory, and FIRE™ briefings when you are ready.
        </p>
      </FounderPanel>

      <FounderRoomNav activeRoomId={room.id} />
    </div>
  );
}
