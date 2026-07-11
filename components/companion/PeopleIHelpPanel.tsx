"use client";

import { IdealClientBuilder } from "@/components/companion/IdealClientBuilder";
import { EstateWorkspace } from "@/components/companion/EstateWorkspace";
import { MyBusinessEstateRoomShell } from "@/components/companion/MyBusinessEstateRoomShell";
import "@/app/companion/my-business-estate.css";

type Props = {
  onClose: () => void;
};

/**
 * People I Help — separate Profile destination over existing client avatars.
 */
export function PeopleIHelpPanel({ onClose }: Props) {
  return (
    <MyBusinessEstateRoomShell>
      <EstateWorkspace className="my-business-estate-panel people-i-help-panel">
        <button
          type="button"
          className="people-i-help-panel__back"
          onClick={onClose}
        >
          Close
        </button>
        <header className="people-i-help-panel__header">
          <p className="estate-workspace__kicker">Profile</p>
          <h1 className="estate-workspace__title">People I Help</h1>
          <p className="my-business-estate-panel__lead">
            The people your work is for — saved client avatars and audiences that
            guide your messaging and offers.
          </p>
        </header>
        <IdealClientBuilder
          presentation={{
            destinationKicker: "People I Help",
            listHeading: "Client Avatars",
            newAvatarLabel: "New Avatar",
            backToDestinationLabel: "Back to People I Help",
            newAvatarTitle: "New Client Avatar",
          }}
        />
      </EstateWorkspace>
    </MyBusinessEstateRoomShell>
  );
}
