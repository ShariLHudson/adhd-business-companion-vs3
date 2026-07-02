import type {
  EstateCollectionCardFormat,
  EstateCollectionDisplayStyle,
  EstateCollectionItem,
} from "@/lib/estate/collectionFramework/types";
import {
  openGrowthAttachment,
  resolveGrowthAttachment,
} from "@/lib/growthAttachments";

type Props = {
  item: EstateCollectionItem;
  displayStyle: EstateCollectionDisplayStyle;
  card: EstateCollectionCardFormat;
  removeLabel: string;
  onRemove?: () => void;
  onEdit?: () => void;
  onToggleFavorite?: () => void;
};

function previewBody(body: string, maxLines: number): string {
  const lines = body.split(/\n/);
  if (lines.length <= maxLines) return body;
  return `${lines.slice(0, maxLines).join("\n")}…`;
}

function attachmentNote(count: number): string {
  if (count === 1) return "With a keepsake";
  return `With ${count} keepsakes`;
}

/** Saved entry — journal page, vault record, library volume, garden bloom. */
export function EstateCollectionItemCard({
  item,
  displayStyle,
  card,
  removeLabel,
  onRemove,
  onEdit,
  onToggleFavorite,
}: Props) {
  const bodyClass = [
    "estate-collection-card__body",
    `estate-collection-card__body--${card.bodyEmphasis}`,
  ].join(" ");

  const bodyText = previewBody(item.body, card.previewLines);
  const coverImage = item.attachments
    ?.map((att) => resolveGrowthAttachment(att))
    .find((att) => att.kind === "image" && att.url);
  const isShelf = card.layout === "shelf";
  const isBloom = card.layout === "bloom";

  return (
    <article
      className={[
        "estate-collection-card",
        `estate-collection-card--${displayStyle}`,
        `estate-collection-card--${card.layout}`,
        item.favorite ? "estate-collection-card--treasured" : "",
      ].join(" ")}
    >
      {isShelf ? (
        <div className="estate-collection-card__spine" aria-hidden="true">
          {item.title ? (
            <span className="estate-collection-card__spine-title">
              {item.title}
            </span>
          ) : null}
        </div>
      ) : null}

      {isBloom && card.showIcon ? (
        <div className="estate-collection-card__stem" aria-hidden="true">
          <span className="estate-collection-card__bloom-mark" />
        </div>
      ) : null}

      {coverImage && isShelf ? (
        <button
          type="button"
          className="estate-collection-card__cover estate-collection-card__cover--volume"
          onClick={() => openGrowthAttachment(coverImage)}
          aria-label={`Open ${coverImage.name}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={coverImage.url} alt="" />
        </button>
      ) : null}

      <div className="estate-collection-card__content">
        <div className="estate-collection-card__header-row">
          {card.showBadge && item.badge ? (
            <span className="estate-collection-card__badge">{item.badge}</span>
          ) : null}
          {card.showMeta && item.detail ? (
            <time className="estate-collection-card__meta">{item.detail}</time>
          ) : null}
        </div>

        {card.showTitle && item.title ? (
          <h3 className="estate-collection-card__title">{item.title}</h3>
        ) : null}

        {coverImage && !isShelf ? (
          <button
            type="button"
            className="estate-collection-card__cover"
            onClick={() => openGrowthAttachment(coverImage)}
            aria-label={`Open ${coverImage.name}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverImage.url} alt="" />
          </button>
        ) : null}

        {card.showProgress && typeof item.progressPercent === "number" ? (
          <div className="estate-collection-card__progress" aria-hidden="true">
            <span
              className="estate-collection-card__progress-fill"
              style={{ width: `${item.progressPercent}%` }}
            />
          </div>
        ) : null}

        <p className={bodyClass}>{bodyText}</p>

        {item.attachments && item.attachments.length > 0 ? (
          <p className="estate-collection-card__keepsake">
            {attachmentNote(item.attachments.length)}
          </p>
        ) : null}

        {card.showExtraFields && item.fields?.length
          ? item.fields.map((field) => (
              <div key={field.label} className="estate-collection-card__extra">
                <span className="estate-collection-card__extra-label">
                  {field.label}
                </span>
                <p className="estate-collection-card__extra-value">{field.value}</p>
              </div>
            ))
          : null}
      </div>

      <div className="estate-collection-card__actions">
        {onToggleFavorite ? (
          <button
            type="button"
            className="estate-collection-card__favorite"
            aria-pressed={Boolean(item.favorite)}
            onClick={onToggleFavorite}
          >
            {item.favorite ? "Treasured" : card.favoriteLabel}
          </button>
        ) : null}
        {onEdit ? (
          <button
            type="button"
            className="estate-collection-card__edit"
            onClick={onEdit}
          >
            {card.editLabel}
          </button>
        ) : null}
        {onRemove ? (
          <button
            type="button"
            className="estate-collection-card__remove"
            onClick={onRemove}
          >
            {removeLabel}
          </button>
        ) : null}
      </div>
    </article>
  );
}
