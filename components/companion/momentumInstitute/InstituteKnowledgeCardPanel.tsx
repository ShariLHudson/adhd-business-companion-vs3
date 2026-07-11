"use client";

import type { KnowledgeCardLearningPanelModel } from "@/lib/momentumInstitute/drawerWall/knowledgeCardViewModel";
import type { InstituteLearningActionId } from "@/lib/momentumInstitute/drawerWall/knowledgeCardContent";
import type { InstituteDiscussMode } from "@/lib/momentumInstitute/drawerWall/instituteLearningChat";
import { useInstituteCabinetSave } from "@/lib/momentumInstitute/drawerWall/useInstituteCabinetSave";
import { cabinetFilingPrompt } from "@/lib/momentumInstitute/cabinetStore";
import { KnowledgeCardViewer } from "./curriculum";

type Props = {
  model: KnowledgeCardLearningPanelModel;
  onClose: () => void;
  onDiscuss: (mode: InstituteDiscussMode) => void;
  onMakeItMine: () => void;
};

export function InstituteKnowledgeCardPanel({
  model,
  onClose,
  onDiscuss,
  onMakeItMine,
}: Props) {
  const {
    card,
    drawer,
    viewModel,
    content,
    actions,
    relatedLearning,
    completionLines,
    curriculumViewerModel,
  } = model;
  const cabinet = useInstituteCabinetSave(card.id);

  const handleAction = (actionId: InstituteLearningActionId) => {
    switch (actionId) {
      case "discuss_with_shari":
        onDiscuss("apply");
        break;
      case "apply_to_my_business":
        onMakeItMine();
        break;
      case "save_to_cabinet":
        cabinet.saveToCabinet();
        break;
      default:
        break;
    }
  };

  if (curriculumViewerModel) {
    return (
      <aside
        className="institute-knowledge-panel"
        role="dialog"
        aria-label={`${card.title} — learning panel`}
        data-testid="institute-knowledge-panel"
        data-curriculum="true"
      >
        <div className="institute-knowledge-panel__surface">
          <button
            type="button"
            className="institute-knowledge-panel__close institute-knowledge-panel__close--curriculum"
            onClick={onClose}
            aria-label="Close learning panel"
          >
            ×
          </button>
          <KnowledgeCardViewer
            model={curriculumViewerModel}
            knowledgeCardId={card.id}
            memberStatus={viewModel.statusLabel}
            onDiscuss={() => onDiscuss("apply")}
            onMakeItMine={onMakeItMine}
            onSaveToCabinet={() => cabinet.saveToCabinet()}
            cabinetSaved={cabinet.saved}
            cabinetPrompt={
              cabinet.filingPrompt ? cabinetFilingPrompt(card.title) : null
            }
          />
          <section
            className="institute-knowledge-panel__completion"
            aria-label="Completion"
          >
            {completionLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </section>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className="institute-knowledge-panel"
      role="dialog"
      aria-label={`${card.title} — learning panel`}
      data-testid="institute-knowledge-panel"
    >
      <div className="institute-knowledge-panel__surface">
        <header className="institute-knowledge-panel__header">
          <div>
            <p className="institute-knowledge-panel__eyebrow">
              Knowledge Card · {drawer.title}
            </p>
            <h2 className="institute-knowledge-panel__title">{card.title}</h2>
            <dl className="institute-knowledge-panel__facts">
              <div>
                <dt>Competency</dt>
                <dd>{viewModel.competencyLabel}</dd>
              </div>
              <div>
                <dt>Estimated time</dt>
                <dd>{viewModel.estimatedMinutes} min</dd>
              </div>
              <div>
                <dt>Drawer</dt>
                <dd>{drawer.title}</dd>
              </div>
            </dl>
          </div>
          <button
            type="button"
            className="institute-knowledge-panel__close"
            onClick={onClose}
            aria-label="Close learning panel"
          >
            ×
          </button>
        </header>

        <section className="institute-knowledge-panel__section">
          <h3 className="institute-knowledge-panel__section-title">Introduction</h3>
          <p className="institute-knowledge-panel__prose">{content.introduction}</p>
        </section>

        <section className="institute-knowledge-panel__section">
          <h3 className="institute-knowledge-panel__section-title">
            Learning objectives
          </h3>
          <ul className="institute-knowledge-panel__list">
            {content.objectives.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="institute-knowledge-panel__section">
          <h3 className="institute-knowledge-panel__section-title">Main content</h3>
          <p className="institute-knowledge-panel__prose institute-knowledge-panel__prose--preline">
            {content.mainContent}
          </p>
        </section>

        <section className="institute-knowledge-panel__section">
          <h3 className="institute-knowledge-panel__section-title">
            Reflection questions
          </h3>
          <ul className="institute-knowledge-panel__list">
            {content.reflectionQuestions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="institute-knowledge-panel__section">
          <h3 className="institute-knowledge-panel__section-title">
            Related resources
          </h3>
          <ul className="institute-knowledge-panel__list">
            {content.relatedResources.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="institute-knowledge-panel__section institute-knowledge-panel__related">
          <h3 className="institute-knowledge-panel__section-title">Related learning</h3>
          <ul className="institute-knowledge-panel__related-list">
            {relatedLearning.map((item) => (
              <li key={item.label}>
                <span className="institute-knowledge-panel__related-chip">
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section
          className="institute-knowledge-panel__completion"
          aria-label="Completion"
        >
          {completionLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </section>

        <footer className="institute-knowledge-panel__footer">
          <h3 className="institute-knowledge-panel__section-title">Actions</h3>
          <div className="institute-knowledge-panel__actions">
            {actions.map((action) => (
              <button
                key={action.id}
                type="button"
                className={[
                  "institute-knowledge-panel__action-btn",
                  action.available
                    ? "institute-knowledge-panel__action-btn--available"
                    : "institute-knowledge-panel__action-btn--soon",
                ].join(" ")}
                disabled={
                  !action.available &&
                  action.id !== "save_to_cabinet" &&
                  action.id !== "discuss_with_shari" &&
                  action.id !== "apply_to_my_business"
                }
                onClick={() => handleAction(action.id)}
              >
                {action.label}
                {action.note ? (
                  <span className="institute-knowledge-panel__action-note">
                    {action.note}
                  </span>
                ) : null}
              </button>
            ))}
          </div>

          <div className="institute-knowledge-panel__discuss">
            <p className="institute-knowledge-panel__discuss-lead">Discuss with Shari</p>
            <div className="institute-knowledge-panel__discuss-links">
              <button type="button" onClick={() => onDiscuss("understand")}>
                Help me understand this
              </button>
              <button type="button" onClick={() => onDiscuss("apply")}>
                Apply to my business
              </button>
              <button type="button" onClick={() => onDiscuss("advise")}>
                What would you do?
              </button>
            </div>
          </div>

          {cabinet.filingPrompt ? (
            <p className="institute-knowledge-panel__cabinet-prompt">
              {cabinetFilingPrompt(card.title)}
            </p>
          ) : null}

          {cabinet.error ? (
            <p className="institute-knowledge-panel__cabinet-error" role="status">
              {cabinet.error}
            </p>
          ) : null}
          {cabinet.saved ? (
            <p className="institute-knowledge-panel__cabinet-saved" role="status">
              Filed in My Institute Cabinet
            </p>
          ) : null}
        </footer>
      </div>
    </aside>
  );
}
