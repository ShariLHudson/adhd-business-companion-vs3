import { pageIllustrationForIndex } from "@/lib/journalGazebo/pageIllustrations";

type Props = {
  pageIndex: number;
};

/** Subtle estate illustration on select pages — no watermarks or corner chrome. */
export function JournalGazeboPageChrome({ pageIndex }: Props) {
  const illustration = pageIllustrationForIndex(pageIndex);

  if (illustration.id === "none" || !illustration.imageUrl) {
    return null;
  }

  return (
    <span
      className={[
        "jg-page-chrome__illustration",
        `jg-page-chrome__illustration--${illustration.id}`,
      ].join(" ")}
      style={{ backgroundImage: `url(${illustration.imageUrl})` }}
      aria-hidden="true"
    />
  );
}
