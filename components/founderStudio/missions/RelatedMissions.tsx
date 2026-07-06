import type { MissionId, MissionRelationship } from "@/lib/founder/missions";
import { getSampleMission } from "@/lib/founder/missions/sample";

const RELATIONSHIP_LABELS: Record<MissionRelationship["relationship"], string> = {
  supports: "supports",
  connects_to: "connects to",
  creates_content_for: "creates content for",
  launches_through: "launches through",
  depends_on: "depends on",
  informs: "informs",
};

type RelatedMissionsProps = {
  missionId: MissionId;
  relationships: MissionRelationship[];
};

export function RelatedMissions({ missionId, relationships }: RelatedMissionsProps) {
  const related = relationships.filter(
    (r) => r.fromMissionId === missionId || r.toMissionId === missionId,
  );

  if (related.length === 0) return null;

  return (
    <section className="founder-mission-related" aria-labelledby="founder-mission-related-title">
      <h3 className="founder-mission-related__title" id="founder-mission-related-title">
        Related missions
      </h3>
      <ul className="founder-mission-related__list">
        {related.map((rel) => {
          const isFrom = rel.fromMissionId === missionId;
          const otherId = isFrom ? rel.toMissionId : rel.fromMissionId;
          const other = getSampleMission(otherId);
          const verb = isFrom
            ? RELATIONSHIP_LABELS[rel.relationship]
            : `is supported by`;

          return (
            <li key={rel.id} className="founder-mission-related__item">
              <span className="founder-mission-related__verb">{verb}</span>
              <span className="founder-mission-related__name">{other?.name ?? otherId}</span>
              <p className="founder-mission-related__summary">{rel.summary}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
