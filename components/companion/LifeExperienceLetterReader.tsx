"use client";

import type { LifeExperienceLetter } from "@/lib/lifeExperienceRoom";

type Props = {
  letter: LifeExperienceLetter;
  onBackToShelf: () => void;
};

export function LifeExperienceLetterReader({ letter, onBackToShelf }: Props) {
  return (
    <article
      className="life-experience-letter-reader"
      data-testid="life-experience-letter-reader"
    >
      <button
        type="button"
        className="life-experience-letter-reader__back"
        onClick={onBackToShelf}
      >
        ← Back to the shelf
      </button>

      <header className="life-experience-letter-reader__header">
        <h2 className="life-experience-letter-reader__title">{letter.title}</h2>
        <p className="life-experience-letter-reader__invitation">
          {letter.invitation}
        </p>
      </header>

      <div className="life-experience-letter-reader__body">
        {letter.paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 48)} className="life-experience-letter-reader__paragraph">
            {paragraph}
          </p>
        ))}
      </div>

      <footer className="life-experience-letter-reader__reflection">
        <p className="life-experience-letter-reader__reflection-lead">
          A quiet moment, if you want it
        </p>
        <ul className="life-experience-letter-reader__reflection-list">
          {letter.reflectionQuestions.map((question) => (
            <li key={question}>{question}</li>
          ))}
        </ul>
      </footer>
    </article>
  );
}
