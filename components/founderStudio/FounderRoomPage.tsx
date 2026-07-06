import { getRoomCards } from "@/lib/founder/services/roomContentService";
import { FOUNDER_STUDIO_BASE } from "@/lib/founderStudio/founderConfig";
import type { FounderRoomMeta } from "@/lib/founderStudio/types";

import { ExecutiveCard, ExecutivePanel, RoomHeader } from "./executive";
import { FounderRoomNav } from "./FounderRoomNav";

type FounderRoomPageProps = {
  room: FounderRoomMeta;
};

export function FounderRoomPageView({ room }: FounderRoomPageProps) {
  const cards = getRoomCards(room.id);

  return (
    <div className="founder-room-page">
      <RoomHeader
        backHref={FOUNDER_STUDIO_BASE}
        title={room.title}
        question={room.question}
        purpose={room.purpose}
      />

      <div className="founder-room-page__cards">
        {cards.map((card) => (
          <ExecutiveCard
            key={card.id}
            title={card.title}
            summary={card.summary}
            tone={card.tone}
          />
        ))}
      </div>

      <ExecutivePanel title="Coming next" className="founder-room-page__coming">
        <p>
          Real {room.title} intelligence connects here — SPARK™ patterns, FLAME™
          mentoring memory, and FIRE™ briefings when you are ready.
        </p>
      </ExecutivePanel>

      <FounderRoomNav activeRoomId={room.id} />
    </div>
  );
}
