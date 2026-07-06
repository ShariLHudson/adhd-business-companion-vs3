import Link from "next/link";

import type { FounderWorkspaceId } from "@/lib/founder/types/workspace";
import { workspaceHref } from "@/lib/founder/workspace/config";

type FireViewDetailsLinkProps = {
  workspaceId: FounderWorkspaceId;
  label?: string;
};

export function FireViewDetailsLink({
  workspaceId,
  label = "View Details",
}: FireViewDetailsLinkProps) {
  return (
    <Link href={workspaceHref(workspaceId)} className="fire-portfolio__details-link">
      {label}
      <span className="fire-portfolio__details-arrow" aria-hidden="true">
        →
      </span>
    </Link>
  );
}
