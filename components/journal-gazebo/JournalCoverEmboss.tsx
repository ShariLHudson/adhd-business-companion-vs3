/** Embossed title on printed journal covers — member name only, top band. */

type Props = {
  title?: string;
};

export function JournalCoverEmboss({ title }: Props) {
  const display = title?.trim() || "My Journey";

  return (
    <div className="jg-cover-emboss jg-cover-emboss--gift" aria-hidden="true">
      <p className="jg-cover-emboss__title">{display}</p>
    </div>
  );
}
