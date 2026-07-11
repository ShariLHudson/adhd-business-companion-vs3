"use client";

import { IdealClientBuilder } from "@/components/companion/IdealClientBuilder";
import { EstateWorkspace } from "@/components/companion/EstateWorkspace";
import { MyBusinessEstateRoomShell } from "@/components/companion/MyBusinessEstateRoomShell";
import "@/app/companion/my-business-estate.css";

type Props = {
  onBackToProfile: () => void;
};

/**
 * People I Help™ — user-facing adapter over existing Audience Profile data/UI.
 * No duplicate storage; same IdealClientBuilder and companion-ideal-clients-v1.
 */
export function PeopleIHelpPanel({ onBackToProfile }: Props) {
  return (
    <MyBusinessEstateRoomShell>
      <EstateWorkspace className="my-business-estate-panel people-i-help-panel">
        <button
          type="button"
          className="people-i-help-panel__back"
          onClick={onBackToProfile}
        >
          ← Back to Profile
        </button>
        <header className="people-i-help-panel__header">
          <p className="estate-workspace__kicker">Profile</p>
          <h1 className="estate-workspace__title">People I Help™</h1>
          <p className="my-business-estate-panel__lead">
            The people your work is for — saved audiences and client avatars that
            guide your messaging and offers.
          </p>
        </header>
        <IdealClientBuilder />
      </EstateWorkspace>
    </MyBusinessEstateRoomShell>
  );
}
