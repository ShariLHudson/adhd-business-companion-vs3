import { FOUNDER_INTEL } from "@/lib/founderStudio/founderConfig";

const ENGINES = [
  FOUNDER_INTEL.spark,
  FOUNDER_INTEL.flame,
  FOUNDER_INTEL.fire,
] as const;

export function FounderIntelStrip() {
  return (
    <section className="founder-intel" aria-label="Founder intelligence architecture">
      {ENGINES.map((engine) => (
        <article key={engine.acronym} className="founder-intel__chip">
          <p className="founder-intel__acronym">{engine.acronym}</p>
          <p className="founder-intel__name">{engine.name}</p>
          <p className="founder-intel__purpose">{engine.purpose}</p>
        </article>
      ))}
    </section>
  );
}
