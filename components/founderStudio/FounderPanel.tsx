import type { ReactNode } from "react";

type FounderPanelProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
};

export function FounderPanel({
  title,
  subtitle,
  children,
  className = "",
  collapsible = false,
  defaultOpen = true,
}: FounderPanelProps) {
  if (collapsible && title) {
    return (
      <details
        className={`founder-panel founder-panel--collapsible ${className}`.trim()}
        open={defaultOpen}
      >
        <summary className="founder-panel__summary">
          <span className="founder-panel__title">{title}</span>
          {subtitle ? (
            <span className="founder-panel__subtitle">{subtitle}</span>
          ) : null}
        </summary>
        <div className="founder-panel__body">{children}</div>
      </details>
    );
  }

  return (
    <section className={`founder-panel ${className}`.trim()}>
      {title ? (
        <header className="founder-panel__header">
          <h2 className="founder-panel__title">{title}</h2>
          {subtitle ? (
            <p className="founder-panel__subtitle">{subtitle}</p>
          ) : null}
        </header>
      ) : null}
      <div className="founder-panel__body">{children}</div>
    </section>
  );
}
