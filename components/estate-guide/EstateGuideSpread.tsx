import type { EstateGuideSpreadData } from "@/data/estateGuideSpreads";
import { EstateGuideEditorialBlock } from "./EstateGuideEditorialBlock";
import { EstateGuideSpreadPlate } from "./EstateGuideSpreadPlate";
import "./estate-guide-spread.css";

type Props = {
  spread: EstateGuideSpreadData;
  className?: string;
};

function blockKey(
  spreadId: string,
  block: EstateGuideSpreadData["leftBlocks"][number],
  index: number,
  side: "left" | "right",
): string {
  return block.id ?? `${spreadId}-${side}-${block.type}-${index}`;
}

function renderBlocks(
  spreadId: string,
  blocks: EstateGuideSpreadData["leftBlocks"],
  side: "left" | "right",
) {
  return blocks.map((block, index) => {
    const key = blockKey(spreadId, block, index, side);
    return (
      <EstateGuideEditorialBlock key={key} block={block} blockKey={key} />
    );
  });
}

/**
 * Spark Estate Guidebook™ — two-page spread composed of editorial blocks.
 * Left: scene · orientation. Right: wisdom · remembrance. Layout varies per spread.
 */
export function EstateGuideSpread({ spread, className }: Props) {
  const placeId = spread.imagePlaceId ?? spread.id;

  return (
    <article
      className={["eg-guide-spread", className].filter(Boolean).join(" ")}
      aria-label={spread.title}
    >
      <section
        className="eg-guide-page eg-guide-page--left"
        aria-label="Room introduction"
      >
        <EstateGuideSpreadPlate
          placeId={placeId}
          imageUrl={spread.image}
          alt={spread.title}
          className="eg-guide-page__plate"
        />

        <header className="eg-guide-page__header">
          <h1 className="eg-guide-page__title">{spread.title}</h1>
          <p className="eg-guide-page__tagline">{spread.tagline}</p>
        </header>

        <div className="eg-guide-page__body eg-guide-page__body--editorial">
          {renderBlocks(spread.id, spread.leftBlocks, "left")}
        </div>
      </section>

      <div className="eg-guide-gutter" aria-hidden="true" />

      <section
        className="eg-guide-page eg-guide-page--right"
        aria-label="Wisdom and remembrance"
      >
        <div className="eg-guide-page__body eg-guide-page__body--editorial">
          {renderBlocks(spread.id, spread.rightBlocks, "right")}
        </div>
      </section>
    </article>
  );
}
