"use client";

type Props = {
  pen: string;
  imageUrl?: string;
};

/** Pen preview — photo-style SVG assets for the design studio. */
export function JournalGazeboPenPreview({ pen, imageUrl }: Props) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt=""
        className={`jg-design-pen__photo jg-design-pen__photo--${pen}`}
        aria-hidden="true"
      />
    );
  }

  return <span className="jg-design-pen__placeholder" aria-hidden="true" />;
}
