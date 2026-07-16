"use client";

import { useState } from "react";
import { IdealClientBuilder } from "@/components/companion/IdealClientBuilder";
import { EstateWorkspace } from "@/components/companion/EstateWorkspace";
import { MyBusinessEstateRoomShell } from "@/components/companion/MyBusinessEstateRoomShell";
import { GetExpertHelpAction } from "@/components/companion/advisory/GetExpertHelpAction";
import { GetExpertHelpPanel } from "@/components/companion/advisory/GetExpertHelpPanel";
import { getActiveAvatar } from "@/lib/companionStore";
import { businessEstateAreaBreadcrumb } from "@/lib/profile/profileDestination";
import { useDismissibleWindow } from "@/lib/windowDismiss";
import "@/app/companion/my-business-estate.css";

type Props = {
  onClose: () => void;
};

/**
 * People I Help — area inside My Business Estate over existing client avatars.
 * Quick Understanding is enough; Client Avatar depth stays optional.
 * Shared Need Another Perspective? (not per-field).
 */
export function PeopleIHelpPanel({ onClose }: Props) {
  const [expertHelpOpen, setExpertHelpOpen] = useState(false);
  const [avatarIdForHelp, setAvatarIdForHelp] = useState<string | undefined>();
  const { requestClose } = useDismissibleWindow({
    open: true,
    onClose,
  });

  function dismissOutside() {
    if (expertHelpOpen) {
      setExpertHelpOpen(false);
      return;
    }
    requestClose();
  }

  return (
    <MyBusinessEstateRoomShell>
      <EstateWorkspace
        className="my-business-estate-panel people-i-help-panel"
        onDismissOutside={dismissOutside}
      >
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
            onClick={requestClose}
          >
            Close
          </button>
          <header className="people-i-help-panel__header">
            <p className="estate-workspace__kicker" data-testid="people-i-help-breadcrumb">
              {businessEstateAreaBreadcrumb("People I Help")}
            </p>
            <h1 className="estate-workspace__title">People I Help</h1>
            <p className="my-business-estate-panel__lead">
              A calm place for who you serve — start with a Quick Understanding.
              A fuller Client Avatar is optional when you want more depth.
            </p>
            <p className="people-i-help-panel__meta">
              About 5 minutes · Primary, Secondary, and Future audiences welcome
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

          <GetExpertHelpAction
            onOpen={() => {
              setAvatarIdForHelp(getActiveAvatar()?.id);
              setExpertHelpOpen(true);
            }}
          />
        </div>
      </EstateWorkspace>
    </MyBusinessEstateRoomShell>
  );
}
