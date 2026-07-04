type Props = {
  pageIndex: number;
  volumeRoman?: string;
};

/** Barely-there folio — Volume I · flame · Page n */
export function JournalGazeboPageFolio({ pageIndex, volumeRoman = "I" }: Props) {
  const page = pageIndex + 1;
  return (
    <footer className="jg-open-book__folio" aria-label={`Volume ${volumeRoman}, page ${page}`}>
      <span className="jg-open-book__folio-volume">Volume {volumeRoman}</span>
      <span className="jg-open-book__folio-flame jg-estate-flame" aria-hidden="true" />
      <span className="jg-open-book__folio-page">Page {page}</span>
    </footer>
  );
}
