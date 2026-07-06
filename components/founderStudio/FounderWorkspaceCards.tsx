import Link from "next/link";

import { listWorkspaces } from "@/lib/founder/workspace";

import { FOUNDER_ACCENT_CLASS } from "./founderLabelStyles";

export function FounderWorkspaceCards() {
  const workspaces = listWorkspaces();

  return (
    <section className="founder-workspaces" aria-labelledby="founder-workspaces-title">
      <h2 className="founder-workspaces__title" id="founder-workspaces-title">
        Executive Workspaces
      </h2>
      <p className="founder-workspaces__lead">
        When today&apos;s mission shifts, choose a different intention — your office will assemble around it.
      </p>
      <div className="founder-workspaces__grid">
        {workspaces.map((workspace) => (
          <Link
            key={workspace.id}
            href={workspace.href}
            className={`founder-workspace-card ${FOUNDER_ACCENT_CLASS[workspace.accent]}`}
          >
            <span className="founder-workspace-card__icon" aria-hidden="true">
              {workspace.icon}
            </span>
            <span className="founder-workspace-card__title">{workspace.title}</span>
            <span className="founder-workspace-card__purpose">{workspace.purpose}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
