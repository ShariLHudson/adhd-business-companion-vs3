"use client";

import { useState } from "react";
import { IdealClientBuilder } from "@/components/companion/IdealClientBuilder";
import { EstateWorkspace } from "@/components/companion/EstateWorkspace";
import { MyBusinessEstateRoomShell } from "@/components/companion/MyBusinessEstateRoomShell";
import { GetExpertHelpAction } from "@/components/companion/advisory/GetExpertHelpAction";
import { GetExpertHelpPanel } from "@/components/companion/advisory/GetExpertHelpPanel";
import { getActiveAvatar } from "@/lib/companionStore";
import "@/app/companion/my-business-estate.css";

type Props = {
  onClose: () => void;
};

/**
 * People I Help — separate Profile destination over existing client avatars.
 * Shared Need Another Perspective? (not per-field).
 */
export function PeopleIHelpPanel({ onClose }: Props) {
  const [expertHelpOpen, setExpertHelpOpen] = useState(false);
  const [avatarIdForHelp, setAvatarIdForHelp] = useState<string | undefined>();

  return (
    <MyBusinessEstateRoomShell>
      <EstateWorkspace className="my-business-estate-panel people-i-help-panel">
        {expertHelpOpen ? (
          <GetExpertHelpPanel
            sourceType="people_i_help"
            areaId="people-i-help"
            avatarId={avatarIdForHelp ?? getActiveAvatar()?.id}
            onClose={() => setExpertHelpOpen(false)}
            onReturn={() => setExpertHelpOpen(false)}
          />
        ) : null}

        <div hidden={expertHelpOpen ? true : undefined} aria-hidden={expertHelpOpen || undefined}>
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

          <GetExpertHelpAction
            onOpen={() => {
              setAvatarIdForHelp(getActiveAvatar()?.id);
              setExpertHelpOpen(true);
            }}
          />

          <IdealClientBuilder
            presentation={{
              destinationKicker: "People I Help",
              listHeading: "Client Avatars",
              newAvatarLabel: "New Avatar",
              backToDestinationLabel: "Back to People I Help",
              newAvatarTitle: "New Client Avatar",
            }}
            onExpertHelpRequest={(avatarId) => {
              setAvatarIdForHelp(avatarId);
              setExpertHelpOpen(true);
            }}
          />
        </div>
      </EstateWorkspace>
    </MyBusinessEstateRoomShell>
  );
}
