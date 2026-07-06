"use client";

import type { ExecutiveResourceItem } from "@/lib/executiveResourcesCenter/types/resources";

import { CopyPlaceholderButton } from "../shared/CopyPlaceholderButton";

type ResourceItemCardProps = {
  item: ExecutiveResourceItem;
};

export function ResourceItemCard({ item }: ResourceItemCardProps) {
  const openHref = item.bookingLink ?? item.openUrl;
  const openLabel = item.bookingLink ? "Open booking page" : "Open";

  return (
    <article
      className={`founder-resource__card${item.isFuture ? " founder-resource__card--future" : ""}`}
    >
      <header className="founder-resource__card-header">
        <h4 className="founder-resource__card-name">{item.name}</h4>
        {item.isFuture ? (
          <span className="founder-resource__badge">Planned</span>
        ) : null}
      </header>

      <p className="founder-resource__purpose">{item.purpose}</p>

      {item.bestUsedFor ? (
        <div className="founder-resource__field">
          <span className="founder-resource__field-label">Best for</span>
          <span className="founder-resource__field-value">{item.bestUsedFor}</span>
        </div>
      ) : null}

      {item.recommendedUses ? (
        <div className="founder-resource__field">
          <span className="founder-resource__field-label">When Founder recommends</span>
          <span className="founder-resource__field-value">{item.recommendedUses}</span>
        </div>
      ) : null}

      {item.notes ? <p className="founder-resource__notes">{item.notes}</p> : null}

      <div className="founder-resource__actions">
        {openHref ? (
          <a
            className="founder-resource__action founder-resource__action--primary"
            href={openHref}
            target={openHref.startsWith("http") ? "_blank" : undefined}
            rel={openHref.startsWith("http") ? "noopener noreferrer" : undefined}
          >
            {openLabel}
          </a>
        ) : null}
        {item.copyPromptPlaceholder ? (
          <CopyPlaceholderButton
            label="Copy prompt"
            text={item.copyPromptPlaceholder}
            className="founder-resource__action"
          />
        ) : null}
      </div>
    </article>
  );
}
