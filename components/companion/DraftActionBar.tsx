"use client";

import { DraftDropdownMenu } from "@/components/companion/DraftDropdownMenu";
import {
  DRAFT_EDIT_MENU,
  DRAFT_EXPORT_MENU,
  DRAFT_SAVE_MENU,
  DRAFT_SOCIAL_MENU,
  type DraftEditAction,
  type DraftExportAction,
  type DraftSaveAction,
  type DraftSocialAction,
} from "@/lib/createDraftActions";

export function DraftActionBar({
  onEditAction,
  onSaveAction,
  onExportAction,
  onSocialAction,
  disabled,
}: {
  onEditAction: (action: DraftEditAction) => void;
  onSaveAction: (action: DraftSaveAction) => void;
  onExportAction: (action: DraftExportAction) => void;
  onSocialAction: (action: DraftSocialAction) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className="flex flex-wrap items-center gap-3"
      data-testid="draft-action-bar"
    >
      <DraftDropdownMenu
        label="Edit"
        groups={DRAFT_EDIT_MENU}
        onPick={(id) => onEditAction(id as DraftEditAction)}
        disabled={disabled}
      />
      <DraftDropdownMenu
        label="Save"
        groups={DRAFT_SAVE_MENU}
        onPick={(id) => onSaveAction(id as DraftSaveAction)}
        disabled={disabled}
      />
      <DraftDropdownMenu
        label="Export"
        groups={DRAFT_EXPORT_MENU}
        onPick={(id) => onExportAction(id as DraftExportAction)}
        disabled={disabled}
      />
      <DraftDropdownMenu
        label="Social"
        groups={DRAFT_SOCIAL_MENU}
        onPick={(id) => onSocialAction(id as DraftSocialAction)}
        disabled={disabled}
        align="right"
      />
    </div>
  );
}
