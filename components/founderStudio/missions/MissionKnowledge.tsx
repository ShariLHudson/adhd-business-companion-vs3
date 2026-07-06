import type { MissionKnowledgeGroup } from "@/lib/founder/missions";

type MissionKnowledgeProps = {
  groups: MissionKnowledgeGroup[];
};

export function MissionKnowledge({ groups }: MissionKnowledgeProps) {
  const nonEmpty = groups.filter((g) => g.items.length > 0);
  if (nonEmpty.length === 0) return null;

  return (
    <section className="founder-mission-knowledge" aria-labelledby="founder-mission-knowledge-title">
      <h3 className="founder-mission-knowledge__title" id="founder-mission-knowledge-title">
        Mission knowledge
      </h3>
      <div className="founder-mission-knowledge__grid">
        {nonEmpty.map((group) => (
          <div key={group.id} className="founder-mission-knowledge__group">
            <h4 className="founder-mission-knowledge__group-title">{group.title}</h4>
            <ul className="founder-mission-knowledge__list">
              {group.items.map((item) => (
                <li key={item.id} className="founder-mission-knowledge__item">
                  <span className="founder-mission-knowledge__item-title">{item.title}</span>
                  {item.summary ? (
                    <p className="founder-mission-knowledge__item-summary">{item.summary}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
