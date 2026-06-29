"use client";

type Props = {
  title: string;
  description: string;
  onOpen: () => void;
  testId?: string;
};

/** Library catalogue row — typography-first, linen rule, no icons. */
export function GrowthStoryDestinationPanel({
  title,
  description,
  onOpen,
  testId,
}: Props) {
  return (
    <button
      type="button"
      className="growth-story-panel"
      onClick={onOpen}
      data-testid={testId}
    >
      <span className="growth-story-panel__rule" aria-hidden="true" />
      <span className="growth-story-panel__body">
        <span className="growth-story-panel__copy">
          <span className="growth-story-panel__title">{title}</span>
          <span className="growth-story-panel__description">{description}</span>
        </span>
      </span>
    </button>
  );
}
