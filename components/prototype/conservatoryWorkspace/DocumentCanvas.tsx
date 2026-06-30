"use client";

import {
  DOCUMENT_PREPARED,
  DOCUMENT_TITLE,
  SPARK_QUESTION,
} from "./mockData";

type DocumentCanvasProps = {
  answer: string;
  addedParagraph: string | null;
  onAnswerChange: (value: string) => void;
  onAddToDocument: () => void;
};

export function DocumentCanvas({
  answer,
  addedParagraph,
  onAnswerChange,
  onAddToDocument,
}: DocumentCanvasProps) {
  return (
    <article className="cw-document">
      <header className="cw-document__header">
        <h1 className="cw-document__title">{DOCUMENT_TITLE}</h1>
        <p className="cw-document__prepared">Prepared for today</p>
      </header>

      <div className="cw-document__body">
        {DOCUMENT_PREPARED.map((section) => (
          <section key={section.id} className="cw-document__section">
            <h2>{section.heading}</h2>
            <p>{section.body}</p>
          </section>
        ))}

        {addedParagraph && (
          <section className="cw-document__section cw-document__section--new">
            <h2>Transformation</h2>
            <p>{addedParagraph}</p>
          </section>
        )}

        {!addedParagraph && (
          <section className="cw-document__conversation">
            <p className="cw-document__spark-question">
              <span className="cw-document__spark-label">Spark</span>
              {SPARK_QUESTION}
            </p>
            <div className="cw-document__answer-row">
              <input
                type="text"
                className="cw-document__answer"
                value={answer}
                onChange={(event) => onAnswerChange(event.target.value)}
                placeholder="Write your answer here…"
                aria-label="Your answer"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    onAddToDocument();
                  }
                }}
              />
              <button
                type="button"
                className="cw-document__add"
                onClick={onAddToDocument}
                disabled={!answer.trim()}
              >
                Add
              </button>
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
