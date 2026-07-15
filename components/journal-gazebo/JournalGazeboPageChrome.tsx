import type { JournalIntentionId } from "@/lib/journalGazebo/journalIntentions";
import { resolveShowPageWatermarks } from "@/lib/journalGazebo/journalIntentions";
import { pageWatermarkUrlForIndex } from "@/lib/journalGazebo/pageWatermarks";

type Props = {
  pageIndex?: number;
  /** Journal type — prayer, gratitude, etc. shapes which Estate places appear. */
  intention?: JournalIntentionId;
  /** When false, pages stay clear — no corner place marks. */
  showPageWatermarks?: boolean;
};

/**
 * Quiet page design — thin gold frame near the edge,
 * soft topic watermark (~2") in the bottom-right corner
 * (prayer verse, gratitude mark, health leaf…).
 * Mark rotates as pages turn; set matches journal intention.
 */
export function JournalGazeboPageChrome({
  pageIndex = 0,
  intention,
  showPageWatermarks,
}: Props) {
  const showWatermark = resolveShowPageWatermarks(showPageWatermarks);
  const watermarkUrl = showWatermark
    ? pageWatermarkUrlForIndex(pageIndex, intention)
    : null;

  return (
    <div className="jg-page-chrome" aria-hidden="true">
      <span className="jg-page-chrome__gold-frame">
        <span className="jg-page-chrome__gold-corner jg-page-chrome__gold-corner--tl" />
        <span className="jg-page-chrome__gold-corner jg-page-chrome__gold-corner--tr" />
        <span className="jg-page-chrome__gold-corner jg-page-chrome__gold-corner--bl" />
        <span className="jg-page-chrome__gold-corner jg-page-chrome__gold-corner--br" />
      </span>
      {watermarkUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={watermarkUrl}
          src={watermarkUrl}
          alt=""
          className="jg-page-chrome__place-mark"
          data-testid="jg-page-place-mark"
          data-watermark-page={pageIndex}
          draggable={false}
        />
      ) : null}
    </div>
  );
}
