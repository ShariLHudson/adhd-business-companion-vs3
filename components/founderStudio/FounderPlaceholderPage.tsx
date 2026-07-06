import Link from "next/link";

import { FOUNDER_STUDIO_BASE } from "@/lib/founderStudio/founderConfig";

import { RoomHeader } from "./executive";

type PlaceholderPageProps = {
  title: string;
  message: string;
};

export function FounderPlaceholderPage({ title, message }: PlaceholderPageProps) {
  return (
    <div className="founder-placeholder">
      <RoomHeader
        backHref={FOUNDER_STUDIO_BASE}
        backLabel="← Back to the Office"
        eyebrow="Executive Office"
        title={title}
        purpose={message}
      />
      <p className="founder-placeholder__note">
        Pinning and history will live here — calm, optional, never required.
      </p>
      <Link href={FOUNDER_STUDIO_BASE} className="founder-placeholder__link">
        Return to the office
      </Link>
    </div>
  );
}
