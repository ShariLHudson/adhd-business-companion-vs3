import type { BuildEntryPoint } from "@/lib/executiveBuilder/types";

type BuildEntryPointsProps = {
  entryPoints: BuildEntryPoint[];
  onSelect: (label: string) => void;
};

export function BuildEntryPoints({ entryPoints, onSelect }: BuildEntryPointsProps) {
  return (
    <section className="founder-builder__sources" aria-labelledby="builder-sources-title">
      <h2 className="founder-builder__section-title" id="builder-sources-title">
        Start from anything
      </h2>
      <p className="founder-builder__muted">Idea · research · opportunity · mission · customer problem…</p>
      <ul className="founder-builder__source-grid">
        {entryPoints.map((ep) => (
          <li key={ep.id}>
            <button type="button" className="founder-builder__source-chip" onClick={() => onSelect(ep.label)}>
              {ep.label}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
