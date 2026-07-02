"use client";

import { useEffect, useState } from "react";
import {
  getGrowthProfile,
  INSTITUTE_GROWTH_PROFILE_UPDATED_EVENT,
} from "@/lib/momentumInstitute/growthProfileStore";
import type { MemberGrowthProfile } from "@/lib/momentumInstitute/types";
import type { EstateMenuActionId } from "@/lib/estateMenu";
import { GrowthProfileEstatePlaceCard } from "@/components/companion/GrowthProfileEstatePlaceCard";
import { GROWTH_PROFILE_ESTATE_PLACES } from "@/lib/growth/growthProfileEstatePlaces";
import { workspacePanelShellClass } from "@/lib/workspaceLayoutTokens";
import "@/app/companion/growth-story-hub.css";

type Props = {
  /** Emphasize timeline when opened from Progress Timeline™ */
  emphasizeTimeline?: boolean;
  /** Inside frosted estate workspace — skip modal padding shell */
  embedded?: boolean;
  onOpenEstatePlace?: (actionId: EstateMenuActionId) => void;
};

export function GrowthProfilePanel({
  emphasizeTimeline = false,
  embedded = false,
  onOpenEstatePlace,
}: Props) {
  const [profile, setProfile] = useState<MemberGrowthProfile | null>(null);

  useEffect(() => {
    const sync = () => setProfile(getGrowthProfile());
    sync();
    window.addEventListener(INSTITUTE_GROWTH_PROFILE_UPDATED_EVENT, sync);
    return () =>
      window.removeEventListener(INSTITUTE_GROWTH_PROFILE_UPDATED_EVENT, sync);
  }, []);

  if (!profile) return null;

  const body = (
    <>
      {!embedded ? (
        <p className="text-sm leading-relaxed text-[#6b635a]">
          Updated quietly as you learn — you never have to organize this yourself.
        </p>
      ) : null}

      {embedded && onOpenEstatePlace ? (
        <section className="mt-6">
          <h3 className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
            Your places
          </h3>
          <div className="mt-3 flex flex-col gap-3">
            {GROWTH_PROFILE_ESTATE_PLACES.map((place) => (
              <GrowthProfileEstatePlaceCard
                key={place.actionId}
                place={place}
                onOpen={() => onOpenEstatePlace(place.actionId)}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className={embedded ? "mt-6" : "mt-5"}>
        <h3 className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
          Capabilities
        </h3>
        {profile.competencies.length === 0 ? (
          <p className="mt-2 text-sm text-[#6b635a]">
            Your capability map will grow as you explore the Institute.
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {profile.competencies.map((record) => (
              <li
                key={record.competencyId}
                className="flex items-center justify-between rounded-lg border border-[#e7dfd4] bg-white px-3 py-2 text-sm"
              >
                <span className="font-medium text-[#1f1c19]">
                  {record.competencyId.replace(/^comp-/, "").replace(/-/g, " ")}
                </span>
                <span className="text-[#6b635a]">Level {record.level}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section
        className={`mt-6${emphasizeTimeline ? " rounded-xl border border-[#d4cdc3] bg-[#faf7f2] p-4" : ""}`}
      >
        <h3 className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
          {emphasizeTimeline ? "Progress Timeline™" : "Recent activity"}
        </h3>
        {profile.timeline.length === 0 ? (
          <p className="mt-2 text-sm text-[#6b635a]">
            Your timeline will appear as you learn, reflect, and return.
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {profile.timeline.slice(0, emphasizeTimeline ? 40 : 12).map((entry) => (
              <li
                key={entry.id}
                className="rounded-lg border border-[#e7dfd4] bg-white px-3 py-2 text-sm"
              >
                <p className="font-medium text-[#1f1c19]">{entry.label}</p>
                <p className="mt-0.5 text-xs text-[#9a8f82]">
                  {new Date(entry.at).toLocaleString()} · {entry.event.replace(/_/g, " ")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );

  if (embedded) return body;

  return <div className={workspacePanelShellClass()}>{body}</div>;
}
