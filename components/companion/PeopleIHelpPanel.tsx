"use client";

import { IdealClientBuilder } from "@/components/companion/IdealClientBuilder";
import { MyBusinessEstateRoomShell } from "@/components/companion/MyBusinessEstateRoomShell";
import { CLIENT_AVATAR_BACKGROUND_SRC } from "@/lib/estateExperienceBackgrounds";
import { businessEstateAreaBreadcrumb } from "@/lib/profile/profileDestination";
import { useDismissibleWindow } from "@/lib/windowDismiss";
import "@/app/companion/my-business-estate.css";

type Props = {
  onClose: () => void;
};

/**
 * People I Help — the Client Avatar room.
 *
 * One room, no frosted panel: the builder renders directly over the room
 * background (Contextual Workspace pattern), so the room fills the workspace and
 * content scrolls over it. There is no Chamber / Board escalation in the avatar
 * flow — per-question help lives inline via ContextualResearchPanel inside the
 * builder, keeping every action inside Client Avatar.
 */
export function PeopleIHelpPanel({ onClose }: Props) {
  const { requestClose } = useDismissibleWindow({ open: true, onClose });

  return (
    <MyBusinessEstateRoomShell backgroundUrl={CLIENT_AVATAR_BACKGROUND_SRC}>
      <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col px-6 py-8">
        <button
          type="button"
          className="people-i-help-panel__back self-start"
          onClick={requestClose}
        >
          Close
        </button>
        <header className="mt-2">
          <p
            className="text-xs font-semibold uppercase tracking-wide text-[#9a8f82]"
            data-testid="people-i-help-breadcrumb"
          >
            {businessEstateAreaBreadcrumb("People I Help")}
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-[#1f1c19]">
            People I Help
          </h1>
          <p className="mt-1 max-w-xl text-base text-[#4b463f]">
            A calm place for who you serve — start with a Quick Understanding. A
            fuller Client Avatar is optional when you want more depth.
          </p>
          <p className="mt-1 text-sm text-[#9a8f82]">
            About 5 minutes · Primary, Secondary, and Future audiences welcome
          </p>
        </header>

        <div className="mt-4 flex-1">
          <IdealClientBuilder
            presentation={{
              destinationKicker: "People I Help",
              listHeading: "Client Avatars",
              newAvatarLabel: "New Avatar",
              backToDestinationLabel: "Back to People I Help",
              newAvatarTitle: "New Client Avatar",
            }}
          />
        </div>
      </div>
    </MyBusinessEstateRoomShell>
  );
}
