"use client";

import { useCallback, useEffect, useState } from "react";
import { CreateDraftResumeList } from "@/components/companion/CreateDraftResumeList";
import {
  CREATE_DRAFT_LIBRARY_UPDATED_EVENT,
  listCreateDraftEntries,
} from "@/lib/createDraftLibrary";
import { isOlderDraft, isRecentDraft } from "@/lib/createEstate/findPreviousWork";
import {
  CREATE_ESTATE_OLDER_WORK_HEADING,
  CREATE_ESTATE_RECENT_SECTION_HEADING,
  CREATE_ESTATE_SAVED_CREATIONS_EMPTY,
} from "@/lib/createEstate/copy";

type Props = {
  onOpen: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
};

/**
 * Part 2 — Find Previous Work.
 * Previous work never mixes with idea discovery. In Progress stays under
 * Continue Working above (Spec 133); this section holds only Recent and
 * Older Work, each hidden when empty (Part 2 / 131 Rule 11).
 */
export function CreateFindPreviousWorkPanel({
  onOpen,
  onRename,
  onDuplicate,
  onDelete,
}: Props) {
  const [recentCount, setRecentCount] = useState(0);
  const [olderCount, setOlderCount] = useState(0);

  const refresh = useCallback(() => {
    const all = listCreateDraftEntries();
    setRecentCount(all.filter((e) => isRecentDraft(e)).length);
    setOlderCount(all.filter((e) => isOlderDraft(e)).length);
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(CREATE_DRAFT_LIBRARY_UPDATED_EVENT, refresh);
    return () =>
      window.removeEventListener(CREATE_DRAFT_LIBRARY_UPDATED_EVENT, refresh);
  }, [refresh]);

  const totalCount = recentCount + olderCount;

  if (totalCount === 0) {
    return (
      <p
        className="text-sm leading-relaxed text-[#6b635a]"
        data-testid="create-find-previous-work-empty"
      >
        {CREATE_ESTATE_SAVED_CREATIONS_EMPTY}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4" data-testid="create-find-previous-work-body">
      {recentCount > 0 ? (
        <section
          data-testid="create-previous-work-recent"
          aria-labelledby="create-previous-work-recent-heading"
        >
          <h4
            id="create-previous-work-recent-heading"
            className="mb-2 text-sm font-semibold text-[#3d3429]"
          >
            {CREATE_ESTATE_RECENT_SECTION_HEADING}
          </h4>
          <CreateDraftResumeList
            onOpen={onOpen}
            onRename={onRename}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            filter={(entry) => isRecentDraft(entry)}
            listLabel="Recent"
          />
        </section>
      ) : null}

      {olderCount > 0 ? (
        <section
          data-testid="create-previous-work-older"
          aria-labelledby="create-previous-work-older-heading"
        >
          <h4
            id="create-previous-work-older-heading"
            className="mb-2 text-sm font-semibold text-[#3d3429]"
          >
            {CREATE_ESTATE_OLDER_WORK_HEADING}
          </h4>
          <CreateDraftResumeList
            onOpen={onOpen}
            onRename={onRename}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            filter={(entry) => isOlderDraft(entry)}
            listLabel="Older work"
          />
        </section>
      ) : null}
    </div>
  );
}
