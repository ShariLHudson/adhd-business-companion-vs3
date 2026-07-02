"use client";

type Props = {
  questions: string[];
  onDiscuss?: () => void;
};

export function ReflectionPanel({ questions, onDiscuss }: Props) {
  if (questions.length === 0) return null;

  return (
    <section
      className="institute-curriculum-reflection"
      aria-label="Reflection questions"
      data-testid="reflection-panel"
    >
      <h3 className="institute-knowledge-panel__section-title">
        Reflection questions
      </h3>
      <ul className="institute-knowledge-panel__list">
        {questions.map((q) => (
          <li key={q}>{q}</li>
        ))}
      </ul>
      {onDiscuss ? (
        <button
          type="button"
          className="institute-curriculum-reflection__discuss"
          onClick={onDiscuss}
        >
          Discuss with Shari™
        </button>
      ) : null}
    </section>
  );
}
