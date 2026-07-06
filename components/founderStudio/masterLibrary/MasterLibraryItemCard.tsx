"use client";

import type { MasterLibraryItem } from "@/lib/sparkMasterLibrary/types";

import { CopyPlaceholderButton } from "../shared/CopyPlaceholderButton";

const AUTHORITY_LABEL: Record<MasterLibraryItem["authority"], string> = {
  constitution: "Constitution",
  blueprint: "Blueprint",
  "operating-manual": "Operating Manual",
  prompt: "Prompt",
  reference: "Reference",
  archive: "Archive",
};

type MasterLibraryItemCardProps = {
  item: MasterLibraryItem;
};

export function MasterLibraryItemCard({ item }: MasterLibraryItemCardProps) {
  return (
    <article className="founder-master-lib__card">
      <header className="founder-master-lib__card-header">
        <h4 className="founder-master-lib__card-title">{item.name}</h4>
        <span className="founder-master-lib__authority">
          {AUTHORITY_LABEL[item.authority]}
        </span>
      </header>

      <p className="founder-master-lib__purpose">{item.purpose}</p>

      <dl className="founder-master-lib__meta">
        <div>
          <dt>Location</dt>
          <dd className="founder-master-lib__path">{item.location}</dd>
        </div>
        <div>
          <dt>Owner</dt>
          <dd>{item.owner}</dd>
        </div>
        <div>
          <dt>Last updated</dt>
          <dd>{item.lastUpdated}</dd>
        </div>
        {item.relatedSystems.length > 0 ? (
          <div>
            <dt>Related systems</dt>
            <dd>{item.relatedSystems.join(" · ")}</dd>
          </div>
        ) : null}
        <div>
          <dt>NotebookLM</dt>
          <dd>{item.inNotebookLmLibrary ? "In library" : "Not indexed"}</dd>
        </div>
      </dl>

      <div className="founder-master-lib__actions">
        <CopyPlaceholderButton
          label="Open"
          text={item.location}
          className="founder-master-lib__action founder-master-lib__action--primary"
        />
      </div>
    </article>
  );
}
