"use client";

type Props = {
  onSaveToCabinet?: () => void;
  onDiscuss?: () => void;
  onMakeItMine?: () => void;
  cabinetSaved?: boolean;
  cabinetPrompt?: string | null;
};

export function SaveActions({
  onSaveToCabinet,
  onDiscuss,
  onMakeItMine,
  cabinetSaved,
  cabinetPrompt,
}: Props) {
  return (
    <footer
      className="institute-knowledge-panel__footer institute-curriculum-save-actions"
      data-testid="save-actions"
    >
      <h3 className="institute-knowledge-panel__section-title">Save & continue</h3>
      <div className="institute-knowledge-panel__actions">
        {onSaveToCabinet ? (
          <button
            type="button"
            className="institute-knowledge-panel__action-btn institute-knowledge-panel__action-btn--available"
            onClick={onSaveToCabinet}
          >
            Save to My Institute Cabinet
          </button>
        ) : null}
        {onDiscuss ? (
          <button
            type="button"
            className="institute-knowledge-panel__action-btn institute-knowledge-panel__action-btn--available"
            onClick={onDiscuss}
          >
            Discuss with Shari
          </button>
        ) : null}
        {onMakeItMine ? (
          <button
            type="button"
            className="institute-knowledge-panel__action-btn institute-knowledge-panel__action-btn--available"
            onClick={onMakeItMine}
          >
            Make It Mine
          </button>
        ) : null}
      </div>
      {cabinetPrompt ? (
        <p className="institute-knowledge-panel__cabinet-prompt">{cabinetPrompt}</p>
      ) : null}
      {cabinetSaved ? (
        <p className="institute-knowledge-panel__cabinet-saved" role="status">
          Filed in My Institute Cabinet
        </p>
      ) : null}
    </footer>
  );
}
