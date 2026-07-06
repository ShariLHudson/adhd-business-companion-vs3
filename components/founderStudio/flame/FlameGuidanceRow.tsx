import type { FlameChallenge, FlameSuggestedQuestion } from "@/lib/founder/flame/types";

type FlameGuidanceRowProps = {
  challenge: FlameChallenge;
  suggestedQuestion: FlameSuggestedQuestion;
};

export function FlameGuidanceRow({
  challenge,
  suggestedQuestion,
}: FlameGuidanceRowProps) {
  return (
    <section className="founder-flame-guidance" aria-labelledby="flame-guidance-heading">
      <h2 className="founder-flame-guidance__title" id="flame-guidance-heading">
        Worth Pausing On
      </h2>
      <div className="founder-flame-guidance__grid">
        <article className="founder-flame-guidance__card founder-flame-guidance__card--challenge">
          <h3>Gentle Challenge</h3>
          <p>{challenge.text}</p>
        </article>
        <article className="founder-flame-guidance__card founder-flame-guidance__card--question">
          <h3>Thoughtful Question</h3>
          <p>{suggestedQuestion.question}</p>
        </article>
      </div>
    </section>
  );
}
