"use client";

import { useMemo } from "react";
import { EstateWorkspace } from "@/components/companion/EstateWorkspace";
import { MyBusinessEstateRoomShell } from "@/components/companion/MyBusinessEstateRoomShell";
import { getBusinessProfile, getPrefs } from "@/lib/companionStore";
import { PROFILE_DESTINATION_CARDS } from "@/lib/profile/profileDestination";
import type { ProfileDestination } from "@/lib/profile/profileDestination";
import "@/app/companion/my-business-estate.css";

type Props = {
  onOpenDestination: (destination: ProfileDestination) => void;
};

function buildBusinessSnapshot(): string {
  const prefs = getPrefs();
  const business = getBusinessProfile();
  const lines: string[] = [];

  if (prefs.name?.trim()) {
    lines.push(`You are ${prefs.name.trim()}.`);
  }
  if (business?.role?.trim()) {
    lines.push(`In business, you show up as ${business.role.trim()}.`);
  }
  if (business?.sells?.trim()) {
    lines.push(`You offer: ${business.sells.trim()}`);
  }
  if (business?.goals?.length) {
    lines.push(`Working toward: ${business.goals.slice(0, 3).join(", ")}.`);
  }

  if (lines.length === 0) {
    return "Your business snapshot will grow here as you add identity and direction. No rush — start wherever feels natural.";
  }

  return lines.join(" ");
}

/** Cycle 1 — Profile landing for My Business Estate™ (read-only snapshot). */
export function MyBusinessEstatePanel({ onOpenDestination }: Props) {
  const snapshot = useMemo(() => buildBusinessSnapshot(), []);

  const otherDestinations = PROFILE_DESTINATION_CARDS.filter(
    (card) => card.destination !== "my-business-estate",
  );

  return (
    <MyBusinessEstateRoomShell>
      <EstateWorkspace className="my-business-estate-panel estate-workspace--landing">
        <header className="my-business-estate-panel__header">
          <p className="estate-workspace__kicker">Profile</p>
          <h1 className="estate-workspace__title">My Business Estate™</h1>
          <p className="my-business-estate-panel__lead">
            Your business home inside Spark Estate™—where the information about
            your business can come together and grow over time.
          </p>
        </header>

        <section className="my-business-estate-panel__snapshot" aria-label="Business Snapshot">
          <h2 className="my-business-estate-panel__snapshot-title">
            Business Snapshot
          </h2>
          <p className="my-business-estate-panel__snapshot-body">{snapshot}</p>
        </section>

        {otherDestinations.length > 0 ? (
          <section
            className="my-business-estate-panel__destinations"
            aria-label="Profile destinations"
          >
            <h2 className="my-business-estate-panel__section-title">
              From here
            </h2>
            <ul className="my-business-estate-panel__destination-list">
              {otherDestinations.map((card) => (
                <li key={card.destination}>
                  <button
                    type="button"
                    className="my-business-estate-panel__destination-card"
                    onClick={() => onOpenDestination(card.destination)}
                  >
                    <span className="my-business-estate-panel__destination-label">
                      {card.label}
                    </span>
                    <span className="my-business-estate-panel__destination-blurb">
                      {card.blurb}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <p className="my-business-estate-panel__note" role="status">
          Full editing for Business Identity and Direction arrives in the next
          cycle. Your conversation with Shari stays right where you left it.
        </p>
      </EstateWorkspace>
    </MyBusinessEstateRoomShell>
  );
}
