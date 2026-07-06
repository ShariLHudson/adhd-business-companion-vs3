import Link from "next/link";

import type { FireArchiveListItem } from "@/lib/founder/types/fireBrief";
import { FOUNDER_STUDIO_BASE } from "@/lib/founderStudio/founderConfig";

type FireArchiveCardProps = {
  archive: FireArchiveListItem;
};

function statusLabel(status: FireArchiveListItem["status"]): string {
  if (status === "draft") return "Draft";
  if (status === "reviewed") return "Reviewed";
  return "Archived";
}

export function FireArchiveCard({ archive }: FireArchiveCardProps) {
  const preview = archive.executiveSummary.slice(0, 3);

  return (
    <article className="fire-archive-card">
      <header className="fire-archive-card__head">
        <p className="fire-archive-card__issue">Issue No. {archive.issueNumber}</p>
        <span
          className={`fire-archive-card__status fire-archive-card__status--${archive.status}`}
        >
          {statusLabel(archive.status)}
        </span>
      </header>
      <p className="fire-archive-card__date">{archive.dateDisplay}</p>
      <p className="fire-archive-card__focus">{archive.primaryFocus}</p>
      <ul className="fire-archive-card__summary">
        {preview.map((line) => (
          <li key={line.slice(0, 24)}>{line}</li>
        ))}
      </ul>
      <Link
        href={`${FOUNDER_STUDIO_BASE}/archives/${archive.id}`}
        className="fire-archive-card__open"
      >
        Open Brief
      </Link>
    </article>
  );
}
