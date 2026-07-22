"use client";

/**
 * Reusable Related To panel (Prompt 141).
 * Surfaces trusted relationship labels only — never invents from titles.
 */

export type RelatedToGroup = {
  id: string;
  label: string;
  items: string[];
  emptyHint?: string;
};

type Props = {
  title?: string;
  groups: readonly RelatedToGroup[];
  /** Optional test id prefix */
  testId?: string;
};

/**
 * Calm progressive list of related objects already linked by trusted edges
 * or project store hooks. Hide groups with no items when `hideEmpty` is true.
 */
export function RelatedToPanel({
  title = "Related to",
  groups,
  testId = "related-to-panel",
  hideEmpty = false,
}: Props & { hideEmpty?: boolean }) {
  const visible = hideEmpty
    ? groups.filter((g) => g.items.length > 0)
    : groups;

  if (visible.length === 0) {
    return (
      <div className="related-to-panel" data-testid={testId}>
        <h4 className="project-homes-drawer__subtitle">{title}</h4>
        <p className="project-homes-drawer__empty">
          Related work will appear here when it is connected to this place.
        </p>
      </div>
    );
  }

  return (
    <div className="related-to-panel" data-testid={testId}>
      <h4 className="project-homes-drawer__subtitle">{title}</h4>
      {visible.map((group) => (
        <div
          key={group.id}
          className="related-to-panel__group"
          data-testid={`${testId}-group-${group.id}`}
        >
          <h5 className="project-homes-drawer__subtitle">{group.label}</h5>
          {group.items.length > 0 ? (
            <ul>
              {group.items.map((item) => (
                <li key={`${group.id}-${item}`}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="project-homes-drawer__empty">
              {group.emptyHint ?? "Nothing linked yet."}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
