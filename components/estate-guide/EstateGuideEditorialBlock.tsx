import type { EstateGuideEditorialBlock } from "@/lib/estate/estateGuideEditorial";
import { estateGuideBlockLabel } from "@/lib/estate/estateGuideEditorial";

type Props = {
  block: EstateGuideEditorialBlock;
  blockKey: string;
};

function BlockLabel({ type }: { type: EstateGuideEditorialBlock["type"] }) {
  return (
    <p className="eg-editorial__label" aria-hidden="true">
      {estateGuideBlockLabel(type)}
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

/** One premium editorial block — luxury guidebook spread, not a web card. */
export function EstateGuideEditorialBlock({ block, blockKey }: Props) {
  const modifier = `eg-editorial--${block.type}`;

  switch (block.type) {
    case "around-the-estate":
      return (
        <section
          key={blockKey}
          className={["eg-editorial", modifier].join(" ")}
          aria-labelledby={`${blockKey}-heading`}
        >
          <BlockLabel type={block.type} />
          {block.title ? (
            <h2 id={`${blockKey}-heading`} className="eg-editorial__title">
              {block.title}
            </h2>
          ) : (
            <h2 id={`${blockKey}-heading`} className="eg-editorial__sr-only">
              {estateGuideBlockLabel(block.type)}
            </h2>
          )}
          <Paragraphs lines={block.paragraphs} />
          {block.visitReasons?.length ? (
            <ul className="eg-editorial__list">
              {block.visitReasons.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </section>
      );

    case "estate-tradition":
      return (
        <section
          key={blockKey}
          className={["eg-editorial", modifier].join(" ")}
          aria-labelledby={`${blockKey}-heading`}
        >
          <BlockLabel type={block.type} />
          {block.title ? (
            <h2 id={`${blockKey}-heading`} className="eg-editorial__title">
              {block.title}
            </h2>
          ) : null}
          <Paragraphs lines={block.paragraphs} />
        </section>
      );

    case "found-among-archives":
      return (
        <section
          key={blockKey}
          className={["eg-editorial", modifier].join(" ")}
          aria-labelledby={`${blockKey}-heading`}
        >
          <BlockLabel type={block.type} />
          {block.title ? (
            <h2 id={`${blockKey}-heading`} className="eg-editorial__title">
              {block.title}
            </h2>
          ) : null}
          <Paragraphs lines={block.paragraphs} />
          {block.source ? (
            <p className="eg-editorial__source">{block.source}</p>
          ) : null}
        </section>
      );

    case "from-sharis-notebook":
      return (
        <section
          key={blockKey}
          className={["eg-editorial", modifier].join(" ")}
          aria-labelledby={`${blockKey}-heading`}
        >
          <BlockLabel type={block.type} />
          {block.title ? (
            <h2 id={`${blockKey}-heading`} className="eg-editorial__title">
              {block.title}
            </h2>
          ) : null}
          {block.paragraphs?.length ? (
            <Paragraphs lines={block.paragraphs} />
          ) : null}
          {block.prompts?.length ? (
            <ol className="eg-editorial__prompts">
              {block.prompts.map((prompt) => (
                <li key={prompt}>{prompt}</li>
              ))}
            </ol>
          ) : null}
        </section>
      );

    case "stewards-note":
    case "curators-note":
      return (
        <section
          key={blockKey}
          className={["eg-editorial", modifier].join(" ")}
          aria-labelledby={`${blockKey}-heading`}
        >
          <BlockLabel type={block.type} />
          <div id={`${blockKey}-heading`} className="eg-editorial__sr-only">
            {estateGuideBlockLabel(block.type)}
          </div>
          <Paragraphs lines={block.paragraphs} />
        </section>
      );

    case "leave-remembering-one-thing":
      return (
        <section
          key={blockKey}
          className={["eg-editorial", modifier].join(" ")}
          aria-labelledby={`${blockKey}-heading`}
        >
          <BlockLabel type={block.type} />
          <p id={`${blockKey}-heading`} className="eg-editorial__remember-line">
            {block.line}
          </p>
        </section>
      );

    case "estate-saying":
      return (
        <blockquote
          key={blockKey}
          className={["eg-editorial", modifier, "eg-editorial__saying"].join(" ")}
          cite={block.attribution}
        >
          <BlockLabel type={block.type} />
          <p className="eg-editorial__saying-text">{block.quote}</p>
          {block.attribution ? (
            <footer className="eg-editorial__saying-by">
              — {block.attribution}
            </footer>
          ) : null}
        </blockquote>
      );

    default:
      return null;
  }
}
