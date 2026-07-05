import type { EstateGuideSpreadData } from "@/data/estateGuideSpreads";
import {
  resolveBlocksForEstateGuideRoomPage,
  type EstateGuideRoomPageKind,
} from "@/lib/estate/estateGuidePages";
import { EstateGuideEditorialBlock } from "./EstateGuideEditorialBlock";
import { EstateGuideSpreadPlate } from "./EstateGuideSpreadPlate";
import { EstateGuideTreehouseJourney } from "./EstateGuideTreehouseJourney";
import { EstateGuideWhisperFromEstate } from "./EstateGuideWhisperFromEstate";
import { resolveTreehouseJourneyFooter } from "@/data/estateGuideSpreads/treehouseGuideJourney";
import "./estate-guide-spread.css";

type Props = {
  spread: EstateGuideSpreadData;
  pageKind: EstateGuideRoomPageKind;
  className?: string;
};

function blockKey(spreadId: string, index: number, type: string): string {
  return `${spreadId}-${type}-${index}`;
}

function RoomHeader({ spread }: { spread: EstateGuideSpreadData }) {
  return (
    <header className="eg-guide-room-page__header">
      <h1 className="eg-guide-room-page__title">{spread.title}</h1>
      {spread.roomSubtitle ? (
        <p className="eg-guide-room-page__room-subtitle">{spread.roomSubtitle}</p>
      ) : null}
      {spread.guideSubtitle ? (
        <p className="eg-guide-room-page__guide-subtitle">{spread.guideSubtitle}</p>
      ) : null}
      {spread.openingLine ? (
        <p className="eg-guide-room-page__opening-line">{spread.openingLine}</p>
      ) : null}
      {spread.epigraph ? (
        <p className="eg-guide-room-page__epigraph">
          &ldquo;{spread.epigraph}&rdquo;
        </p>
      ) : null}
    </header>
  );
}

/**
 * Spark Estate Guidebook™ — one flipbook page for a room.
 * Photo page: top-half photograph, title tucked under the image, opening sections below.
 * Text page: remaining caretaker copy (no photograph).
 */
export function EstateGuideRoomPage({ spread, pageKind, className }: Props) {
  const blocks = resolveBlocksForEstateGuideRoomPage(spread, pageKind);
  const placeId = spread.imagePlaceId ?? spread.id;
  const whisper = spread.whisperFromEstate?.trim();
  const treehouseJourney = resolveTreehouseJourneyFooter(spread.id);

  if (pageKind === "photo") {
    return (
      <article
        className={[
          "eg-guide-room-page",
          "eg-guide-room-page--photo",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label={`${spread.title} — photograph`}
        data-room-id={spread.id}
        data-page-kind="photo"
      >
        <div className="eg-guide-room-page__hero" aria-hidden={false}>
          <EstateGuideSpreadPlate
            placeId={placeId}
            imageUrl={spread.image}
            alt={spread.title}
            className="eg-guide-room-page__plate"
          />
        </div>

        <div className="eg-guide-room-page__lower">
          <RoomHeader spread={spread} />
          {blocks.length > 0 ? (
            <>
              <hr className="eg-guide-room-page__header-rule" aria-hidden="true" />
              <div className="eg-guide-room-page__body eg-guide-room-page__body--photo">
                {blocks.map((block, index) => {
                  const key = blockKey(spread.id, index, block.type);
                  return (
                    <EstateGuideEditorialBlock
                      key={key}
                      block={block}
                      blockKey={key}
                    />
                  );
                })}
              </div>
            </>
          ) : null}
        </div>
        {treehouseJourney ? (
          <EstateGuideTreehouseJourney journey={treehouseJourney} />
        ) : null}
        {whisper ? <EstateGuideWhisperFromEstate line={whisper} /> : null}
      </article>
    );
  }

  return (
    <article
      className={[
        "eg-guide-room-page",
        "eg-guide-room-page--text",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={`${spread.title} — guide`}
      data-room-id={spread.id}
      data-page-kind="text"
    >
      <div className="eg-guide-room-page__text-shell">
        <p className="eg-guide-room-page__running-title" aria-hidden="true">
          {spread.title}
        </p>
        <div className="eg-guide-room-page__body">
          {blocks.map((block, index) => {
            const key = blockKey(spread.id, index, block.type);
            return (
              <EstateGuideEditorialBlock key={key} block={block} blockKey={key} />
            );
          })}
        </div>
        {spread.guideQuote?.trim() ? (
          <p className="eg-guide-room-page__guide-quote">
            &ldquo;{spread.guideQuote.trim()}&rdquo;
          </p>
        ) : null}
      </div>
      {treehouseJourney ? (
        <EstateGuideTreehouseJourney journey={treehouseJourney} />
      ) : null}
      {whisper ? <EstateGuideWhisperFromEstate line={whisper} /> : null}
    </article>
  );
}

/** @deprecated Use EstateGuideRoomPage */
export const EstateGuideSpread = EstateGuideRoomPage;
