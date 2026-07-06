"use client";

type ExecutiveQuestionZoneProps = {
  question: string;
  onChange: (value: string) => void;
};

export function ExecutiveQuestionZone({ question, onChange }: ExecutiveQuestionZoneProps) {
  return (
    <section className="strategy-question" aria-labelledby="strategy-question-heading">
      <p className="strategy-zone__eyebrow" id="strategy-question-heading">
        Executive Question
      </p>
      <textarea
        className="strategy-question__input"
        value={question}
        onChange={(event) => onChange(event.target.value)}
        rows={2}
        aria-label="Executive question"
        placeholder="What problem are we trying to solve?"
      />
    </section>
  );
}
