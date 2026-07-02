"use client";

type Props = {
  prompts: string[];
  onMakeItMine?: () => void;
};

export function MakeItMine({ prompts, onMakeItMine }: Props) {
  if (prompts.length === 0 && !onMakeItMine) return null;

  return (
    <section
      className="institute-curriculum-make-it-mine"
      aria-label="Make It Mine"
      data-testid="make-it-mine"
    >
      <h3 className="institute-knowledge-panel__section-title">Make It Mine™</h3>
      {prompts.length > 0 ? (
        <ul className="institute-knowledge-panel__list">
          {prompts.map((prompt) => (
            <li key={prompt}>{prompt}</li>
          ))}
        </ul>
      ) : null}
      {onMakeItMine ? (
        <button
          type="button"
          className="institute-knowledge-panel__action-btn institute-knowledge-panel__action-btn--available"
          onClick={onMakeItMine}
        >
          Apply to my business
        </button>
      ) : null}
    </section>
  );
}
