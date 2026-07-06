"use client";

import type { ExecutiveJudgmentView, JudgmentRecommendation } from "@/lib/executiveJudgmentEngine/types";

type JudgmentPyramidViewProps = {
  view: ExecutiveJudgmentView;
  onSelectRecommendation: (id: string) => void;
  onBack: () => void;
};

function RecommendationCard({
  label,
  recommendation,
  onSelect,
}: {
  label: string;
  recommendation: JudgmentRecommendation;
  onSelect: () => void;
}) {
  return (
    <button type="button" className="founder-judgment__card" onClick={onSelect}>
      <span className="founder-judgment__card-label">{label}</span>
      <span className="founder-judgment__card-headline">{recommendation.headline}</span>
      <span className="founder-judgment__card-why">{recommendation.whyThis}</span>
      <span className="founder-judgment__card-meta">
        Score {recommendation.compositeScore} · {recommendation.reasoning.confidence} confidence
      </span>
    </button>
  );
}

export function JudgmentPyramidView({ view, onSelectRecommendation, onBack }: JudgmentPyramidViewProps) {
  const { pyramid, whyNot, notNowLibrary, learningLoop } = view;

  return (
    <article className="founder-judgment__pyramid">
      <button type="button" className="founder-judgment__back" onClick={onBack}>
        ← Back
      </button>

      <header className="founder-judgment__header">
        <p className="founder-judgment__meta">Recommendation Pyramid</p>
        <h2 className="founder-judgment__title">What deserves attention today</h2>
      </header>

      <section aria-labelledby="judgment-primary">
        <h3 className="founder-judgment__section-title" id="judgment-primary">
          One Primary Recommendation
        </h3>
        <RecommendationCard
          label="Do this first"
          recommendation={pyramid.primary}
          onSelect={() => onSelectRecommendation(pyramid.primary.id)}
        />
      </section>

      <section aria-labelledby="judgment-supporting">
        <h3 className="founder-judgment__section-title" id="judgment-supporting">
          Two Supporting Opportunities
        </h3>
        <ul className="founder-judgment__card-grid">
          {pyramid.supporting.map((rec) => (
            <li key={rec.id}>
              <RecommendationCard
                label="Supporting"
                recommendation={rec}
                onSelect={() => onSelectRecommendation(rec.id)}
              />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="judgment-wait">
        <h3 className="founder-judgment__section-title" id="judgment-wait">
          Three Items That Can Wait
        </h3>
        <ul className="founder-judgment__card-grid">
          {pyramid.canWait.map((rec) => (
            <li key={rec.id}>
              <RecommendationCard
                label="Can wait"
                recommendation={rec}
                onSelect={() => onSelectRecommendation(rec.id)}
              />
            </li>
          ))}
        </ul>
      </section>

      <section className="founder-judgment__why-not" aria-labelledby="judgment-why-not">
        <h3 className="founder-judgment__section-title" id="judgment-why-not">
          Why Not? — Executive thinking
        </h3>
        <ul className="founder-judgment__bullets">
          {whyNot.map((entry) => (
            <li key={entry.id}>
              <strong>{entry.title}</strong> — {entry.summary}
              <span className="founder-judgment__kind"> ({entry.kind.replace(/-/g, " ")})</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="judgment-not-now">
        <h3 className="founder-judgment__section-title" id="judgment-not-now">
          Not Now Library — ideas are never lost
        </h3>
        <ul className="founder-judgment__bullets">
          {notNowLibrary.map((item) => (
            <li key={item.id}>
              <strong>{item.title}</strong> — {item.whyNotNow}
              <span className="founder-judgment__muted"> Revisit when: {item.revisitWhen}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="judgment-learning">
        <h3 className="founder-judgment__section-title" id="judgment-learning">
          Learning Loop — judgment improves
        </h3>
        <ul className="founder-judgment__bullets">
          {learningLoop.map((entry) => (
            <li key={entry.id}>
              <strong>{entry.recommendation}</strong> → {entry.decision} → {entry.lesson}
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
