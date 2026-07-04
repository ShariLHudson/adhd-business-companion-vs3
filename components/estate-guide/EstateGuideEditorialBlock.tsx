import type { ReactNode } from "react";
import type {
  EstateGuideCaretakersNotebookBlock,
  EstateGuideCaretakersObservationBlock,
  EstateGuideEditorialBlock,
  EstateGuideJournalBlock,
  EstateGuideParagraphBlock,
} from "@/lib/estate/estateGuideEditorial";
import { estateGuideBlockDisplayLabel } from "@/lib/estate/estateGuideEditorial";

type Props = {
  block: EstateGuideEditorialBlock;
  blockKey: string;
};

function BlockLabel({ type }: { type: EstateGuideEditorialBlock["type"] }) {
  return (
    <p className="eg-editorial__label" aria-hidden="true">
      {estateGuideBlockDisplayLabel(type)}
    </p>
  );
}

function Paragraphs({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((paragraph) => (
        <p key={paragraph} className="eg-editorial__paragraph">
          {paragraph}
        </p>
      ))}
    </>
  );
}

function ParagraphBlock({
  blockKey,
  block,
  children,
}: {
  blockKey: string;
  block: EstateGuideParagraphBlock;
  children?: ReactNode;
}) {
  return (
    <section
      className={["eg-editorial", `eg-editorial--${block.type}`].join(" ")}
      aria-labelledby={`${blockKey}-heading`}
    >
      <BlockLabel type={block.type} />
      <h2 id={`${blockKey}-heading`} className="eg-editorial__sr-only">
        {estateGuideBlockDisplayLabel(block.type)}
      </h2>
      <Paragraphs lines={block.paragraphs} />
      {block.bullets?.length ? (
        <ul className="eg-editorial__bullets">
          {block.bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
      {block.closingParagraphs?.length ? (
        <Paragraphs lines={block.closingParagraphs} />
      ) : null}
      {block.moments?.length ? (
        <div className="eg-editorial__moments">
          {block.moments.map((moment) => (
            <div key={moment.title} className="eg-editorial__moment">
              <p className="eg-editorial__moment-title">{moment.title}</p>
              {moment.paragraphs?.length ? (
                moment.paragraphs.map((line) => (
                  <p key={line} className="eg-editorial__moment-text">
                    {line}
                  </p>
                ))
              ) : moment.text ? (
                <p className="eg-editorial__moment-text">{moment.text}</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
      {children}
    </section>
  );
}

function JournalBlock({ blockKey, block }: { blockKey: string; block: EstateGuideJournalBlock }) {
  return (
    <section
      className="eg-editorial eg-editorial--estate-journals"
      aria-labelledby={`${blockKey}-heading`}
    >
      <BlockLabel type={block.type} />
      <h2 id={`${blockKey}-heading`} className="eg-editorial__sr-only">
        {estateGuideBlockDisplayLabel(block.type)}
      </h2>
      {block.date ? <p className="eg-editorial__journal-date">{block.date}</p> : null}
      <div className="eg-editorial__journal-body">
        <Paragraphs lines={block.paragraphs} />
      </div>
      {block.attribution?.length ? (
        <footer className="eg-editorial__journal-attribution">
          {block.attribution.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </footer>
      ) : null}
    </section>
  );
}

function CaretakersNotebookBlock({
  blockKey,
  block,
}: {
  blockKey: string;
  block: EstateGuideCaretakersNotebookBlock;
}) {
  return (
    <section
      className="eg-editorial eg-editorial--caretakers-notebook"
      aria-labelledby={`${blockKey}-heading`}
    >
      <BlockLabel type={block.type} />
      <h2 id={`${blockKey}-heading`} className="eg-editorial__sr-only">
        {estateGuideBlockDisplayLabel(block.type)}
      </h2>
      <div className="eg-editorial__journal-body">
        <Paragraphs lines={block.paragraphs} />
      </div>
      {block.attribution?.length ? (
        <footer className="eg-editorial__journal-attribution">
          {block.attribution.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </footer>
      ) : null}
    </section>
  );
}

function CaretakersObservationBlock({
  blockKey,
  block,
}: {
  blockKey: string;
  block: EstateGuideCaretakersObservationBlock;
}) {
  return (
    <section
      className="eg-editorial eg-editorial--caretakers-observation"
      aria-labelledby={`${blockKey}-heading`}
    >
      <BlockLabel type={block.type} />
      <h2 id={`${blockKey}-heading`} className="eg-editorial__sr-only">
        {estateGuideBlockDisplayLabel(block.type)}
      </h2>
      <div className="eg-editorial__journal-body">
        <Paragraphs lines={block.paragraphs} />
      </div>
      {block.attribution?.length ? (
        <footer className="eg-editorial__journal-attribution">
          {block.attribution.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </footer>
      ) : null}
    </section>
  );
}

/** One caretaker-written block — premium guidebook, not app UI. */
export function EstateGuideEditorialBlock({ block, blockKey }: Props) {
  const modifier = `eg-editorial--${block.type}`;

  if (block.type === "estate-journals") {
    return <JournalBlock blockKey={blockKey} block={block} />;
  }

  if (block.type === "caretakers-observation") {
    return <CaretakersObservationBlock blockKey={blockKey} block={block} />;
  }

  if (block.type === "caretakers-notebook") {
    return <CaretakersNotebookBlock blockKey={blockKey} block={block} />;
  }

  if (block.type === "next-stop") {
    return (
      <section
        className={["eg-editorial", modifier, "eg-editorial--nav"].join(" ")}
        aria-labelledby={`${blockKey}-heading`}
      >
        <BlockLabel type={block.type} />
        <p id={`${blockKey}-heading`} className="eg-editorial__next-stop">
          {block.destination}
        </p>
      </section>
    );
  }

  if (block.type === "enjoy-visiting-next") {
    const visits: Array<{ place: string; note?: string }> =
      block.visits ??
      block.destinations?.map((place) => ({ place })) ??
      [];

    return (
      <section
        className={["eg-editorial", modifier, "eg-editorial--nav"].join(" ")}
        aria-labelledby={`${blockKey}-heading`}
      >
        <BlockLabel type={block.type} />
        <ul
          id={`${blockKey}-heading`}
          className="eg-editorial__visit-list"
          aria-label="Places you may enjoy visiting next"
        >
          {visits.map((visit) => (
            <li key={visit.place} className="eg-editorial__visit-item">
              <span className="eg-editorial__visit-place">{visit.place}</span>
              {visit.note ? (
                <span className="eg-editorial__visit-note">{visit.note}</span>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return <ParagraphBlock blockKey={blockKey} block={block} />;
}
