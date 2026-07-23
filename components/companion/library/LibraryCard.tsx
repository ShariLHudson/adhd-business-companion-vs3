"use client";

import { formatContinueLastWorkedLabel } from "@/lib/activeWorkspaceRegistry/continueCardProjection";
import { primaryActionLabel } from "@/lib/sparkLibraryCollection/capabilities";
import type {
  LibraryItem,
  LibraryViewMode,
  SparkLibraryCardActionId,
} from "@/lib/sparkLibraryCollection/types";
import { LibraryItemActionMenu } from "./LibraryItemActionMenu";

type Props = {
  item: LibraryItem;
  view: LibraryViewMode;
  busy?: boolean;
  onPrimary: (item: LibraryItem) => void;
  onAction: (action: SparkLibraryCardActionId, item: LibraryItem) => void;
  onOpenRelationship?: (item: LibraryItem) => void;
};

function formatUpdated(iso: string): string {
  return formatContinueLastWorkedLabel(iso);
}

export function LibraryCard({
  item,
  view,
  busy,
  onPrimary,
  onAction,
  onOpenRelationship,
}: Props) {
  const compact = view === "compact";
  return (
    <article
      className={
        compact
          ? "spark-library-card spark-library-card--compact"
          : "spark-library-card"
      }
      data-testid={`library-card-${item.id}`}
      data-library-kind={item.kind}
      data-library-view={view}
    >
      <div className="spark-library-card__top">
        <div className="spark-library-card__body">
          <h3 className="spark-library-card__title">{item.title}</h3>
          <p className="spark-library-card__meta">
            {[item.typeLabel, item.statusLabel, `Updated ${formatUpdated(item.updatedAt)}`]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {item.nextMilestoneLabel && item.kind === "project" ? (
            <p className="spark-library-card__meta">
              Next: {item.nextMilestoneLabel}
            </p>
          ) : null}
          {item.relationship ? (
            <button
              type="button"
              className="spark-library-card__relationship"
              data-testid={`library-relationship-${item.id}`}
              onClick={() => onOpenRelationship?.(item)}
            >
              {item.relationship.kind === "linked_project"
                ? `Linked Project: ${item.relationship.label}`
                : `Source Creation: ${item.relationship.label}`}
            </button>
          ) : null}
        </div>
        {item.capabilities.canFavorite ? (
          <button
            type="button"
            className="spark-library-card__star"
            aria-label={
              item.favorite
                ? `Remove ${item.title} from favorites`
                : `Favorite ${item.title}`
            }
            aria-pressed={item.favorite}
            data-testid={`library-favorite-${item.id}`}
            onClick={() =>
              onAction(item.favorite ? "unfavorite" : "favorite", item)
            }
          >
            {item.favorite ? "★" : "☆"}
          </button>
        ) : null}
        <LibraryItemActionMenu item={item} onAction={onAction} />
      </div>
      <div className="spark-library-card__actions">
        <button
          type="button"
          className="spark-library-card__primary"
          data-testid={`library-primary-${item.id}`}
          disabled={busy}
          onClick={() => onPrimary(item)}
        >
          {busy ? "Working…" : primaryActionLabel(item)}
        </button>
      </div>
    </article>
  );
}
