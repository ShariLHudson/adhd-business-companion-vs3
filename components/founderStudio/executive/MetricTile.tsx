type MetricTileProps = {
  label: string;
  value: string;
  note?: string;
  trend?: "up" | "down" | "flat" | "watch";
};

function trendGlyph(trend?: MetricTileProps["trend"]) {
  if (trend === "up") return "↑";
  if (trend === "down") return "↓";
  if (trend === "watch") return "◎";
  return "→";
}

export function MetricTile({ label, value, note, trend }: MetricTileProps) {
  return (
    <article className="founder-metric-tile">
      <p className="founder-metric-tile__label">{label}</p>
      <p className="founder-metric-tile__value">
        {trend ? (
          <span className="founder-metric-tile__trend" aria-hidden="true">
            {trendGlyph(trend)}
          </span>
        ) : null}
        {value}
      </p>
      {note ? <p className="founder-metric-tile__note">{note}</p> : null}
    </article>
  );
}
