"use client";

import { STABLES_ARRIVAL } from "@/lib/stables/stablesVoice";
import { STABLES_QUALITIES } from "@/lib/stables/stablesQualities";

type Props = {
  visible: boolean;
};

/** Quiet grounded arrival — slower than the Institute; no rush. */
export function StablesArrivalPlaque({ visible }: Props) {
  if (!visible) return null;

  return (
    <div
      className="stables-arrival-plaque"
      aria-hidden={!visible}
      data-testid="stables-arrival-plaque"
    >
      <div className="stables-arrival-plaque__rule" aria-hidden />
      <p className="stables-arrival-plaque__title">{STABLES_ARRIVAL.title}</p>
      <p className="stables-arrival-plaque__lead">{STABLES_ARRIVAL.invitation}</p>
      <ul className="stables-arrival-plaque__qualities" aria-label="Qualities we build here">
        {STABLES_QUALITIES.slice(0, 6).map((quality) => (
          <li key={quality.id}>{quality.title}</li>
        ))}
        <li className="stables-arrival-plaque__qualities-more">and more…</li>
      </ul>
      <div className="stables-arrival-plaque__rule" aria-hidden />
    </div>
  );
}
