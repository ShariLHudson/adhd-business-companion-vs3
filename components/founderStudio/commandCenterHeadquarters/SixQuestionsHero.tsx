import type { ExecutiveSixQuestions } from "@/lib/executiveCommandCenter/types";

type SixQuestionsHeroProps = {
  questions: ExecutiveSixQuestions;
};

const ENTRIES: { key: keyof ExecutiveSixQuestions; label: string }[] = [
  { key: "whatMattersToday", label: "What matters today?" },
  { key: "whyItMatters", label: "Why does it matter?" },
  { key: "whatWeRecommend", label: "What do you recommend?" },
  { key: "opportunitiesToKnow", label: "What opportunities should I know about?" },
  { key: "decisionsWaiting", label: "What decisions are waiting?" },
  { key: "whatToDoNext", label: "What should I do next?" },
];

export function SixQuestionsHero({ questions }: SixQuestionsHeroProps) {
  return (
    <section className="founder-hq__questions" aria-labelledby="hq-questions-title">
      <h2 className="founder-hq__section-title" id="hq-questions-title">
        Six questions — answered
      </h2>
      <dl className="founder-hq__question-list">
        {ENTRIES.map(({ key, label }) => (
          <div key={key} className="founder-hq__question-row">
            <dt className="founder-hq__question-label">{label}</dt>
            <dd className="founder-hq__question-answer">{questions[key]}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
