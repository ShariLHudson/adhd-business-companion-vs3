"use client";

import {
  MOMENTUM_INSTITUTE_ARRIVAL,
  MOMENTUM_INSTITUTE_COLLEGES,
} from "@/lib/momentumInstitute/room/instituteColleges";

type Props = {
  visible: boolean;
};

/** Quiet orientation — colleges name the university; drawers are the interface. */
export function InstituteArrivalPlaque({ visible }: Props) {
  if (!visible) return null;

  return (
    <div
      className="institute-arrival-plaque"
      aria-hidden={!visible}
      data-testid="institute-arrival-plaque"
    >
      <div className="institute-arrival-plaque__rule" aria-hidden />
      <p className="institute-arrival-plaque__title">{MOMENTUM_INSTITUTE_ARRIVAL.title}</p>
      <ul className="institute-arrival-plaque__colleges">
        {MOMENTUM_INSTITUTE_COLLEGES.map((college) => (
          <li key={college.id}>{college.title}</li>
        ))}
      </ul>
      <p className="institute-arrival-plaque__invitation">
        {MOMENTUM_INSTITUTE_ARRIVAL.invitation}
      </p>
      <div className="institute-arrival-plaque__rule" aria-hidden />
    </div>
  );
}
