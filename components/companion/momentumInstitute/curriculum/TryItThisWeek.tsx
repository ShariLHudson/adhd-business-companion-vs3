"use client";

type Props = {
  action: string;
};

export function TryItThisWeek({ action }: Props) {
  if (!action.trim()) return null;

  return (
    <section
      className="institute-curriculum-try-it"
      aria-label="Try It This Week"
      data-testid="try-it-this-week"
    >
      <h3 className="institute-knowledge-panel__section-title">
        Try It This Week™
      </h3>
      <p className="institute-knowledge-panel__prose">{action}</p>
    </section>
  );
}
