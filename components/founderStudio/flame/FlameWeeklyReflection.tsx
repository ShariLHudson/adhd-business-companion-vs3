import type { FlameWeeklyReflection } from "@/lib/founder/flame/types";

type FlameWeeklyReflectionProps = {
  reflection: FlameWeeklyReflection;
};

function ReflectionList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="founder-flame-reflection__block">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function FlameWeeklyReflectionCard({ reflection }: FlameWeeklyReflectionProps) {
  return (
    <section
      className="founder-flame-reflection"
      aria-labelledby="flame-reflection-heading"
    >
      <h2 className="founder-flame-reflection__title" id="flame-reflection-heading">
        Weekly Reflection
      </h2>
      <p className="founder-flame-reflection__week">{reflection.weekLabel}</p>
      <div className="founder-flame-reflection__grid">
        <ReflectionList title="Wins" items={reflection.wins} />
        <ReflectionList title="Lessons" items={reflection.lessons} />
        <ReflectionList title="Patterns" items={reflection.patterns} />
        <ReflectionList title="Ideas Worth Revisiting" items={reflection.ideasWorthRevisiting} />
        <ReflectionList title="Future Opportunities" items={reflection.futureOpportunities} />
      </div>
    </section>
  );
}
