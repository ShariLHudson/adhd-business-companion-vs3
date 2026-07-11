"use client";

import type { KnowledgeCardViewerModel } from "@/lib/momentumInstitute/curriculum/types";
import { BusinessMasteryMinute } from "./BusinessMasteryMinute";
import { CompetencyLinks } from "./CompetencyLinks";
import { MakeItMine } from "./MakeItMine";
import { ProgressTracker } from "./ProgressTracker";
import { ReflectionPanel } from "./ReflectionPanel";
import { SaveActions } from "./SaveActions";
import { TryItThisWeek } from "./TryItThisWeek";

export type KnowledgeCardViewerProps = {
  model: KnowledgeCardViewerModel;
  knowledgeCardId: string;
  memberStatus?: string;
  onDiscuss?: () => void;
  onMakeItMine?: () => void;
  onSaveToCabinet?: () => void;
  cabinetSaved?: boolean;
  cabinetPrompt?: string | null;
};

export function KnowledgeCardViewer({
  model,
  knowledgeCardId,
  memberStatus,
  onDiscuss,
  onMakeItMine,
  onSaveToCabinet,
  cabinetSaved,
  cabinetPrompt,
}: KnowledgeCardViewerProps) {
  const { metadata, body } = model;

  return (
    <article
      className="institute-curriculum-viewer"
      data-testid="knowledge-card-viewer"
      data-card-id={knowledgeCardId}
    >
      <header className="institute-knowledge-panel__header">
        <div>
          <p className="institute-knowledge-panel__eyebrow">
            Knowledge Card · {model.drawerLabel}
          </p>
          <h2 className="institute-knowledge-panel__title">{metadata.title}</h2>
          {body.essentialQuestion ? (
            <p className="institute-curriculum-viewer__essential-question">
              {body.essentialQuestion}
            </p>
          ) : null}
          <dl className="institute-knowledge-panel__facts">
            <div>
              <dt>Department</dt>
              <dd>{model.departmentLabel}</dd>
            </div>
            <div>
              <dt>Estimated time</dt>
              <dd>{model.estimatedMinutes} min</dd>
            </div>
            <div>
              <dt>Difficulty</dt>
              <dd>{model.difficultyLabel}</dd>
            </div>
          </dl>
        </div>
        <ProgressTracker
          knowledgeCardId={knowledgeCardId}
          statusLabel={memberStatus}
        />
      </header>

      {body.whyThisMatters ? (
        <section className="institute-knowledge-panel__section">
          <h3 className="institute-knowledge-panel__section-title">
            Why this matters
          </h3>
          <p className="institute-knowledge-panel__prose">{body.whyThisMatters}</p>
        </section>
      ) : null}

      {body.corePrinciple ? (
        <section className="institute-knowledge-panel__section institute-curriculum-viewer__principle">
          <h3 className="institute-knowledge-panel__section-title">
            Core principle
          </h3>
          <p className="institute-knowledge-panel__prose institute-curriculum-viewer__principle-text">
            {body.corePrinciple}
          </p>
        </section>
      ) : null}

      {body.keyIdeas.length > 0 ? (
        <section className="institute-knowledge-panel__section">
          <h3 className="institute-knowledge-panel__section-title">Key ideas</h3>
          <ul className="institute-knowledge-panel__list">
            {body.keyIdeas.map((idea) => (
              <li key={idea}>{idea}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {body.realBusinessExample ? (
        <section className="institute-knowledge-panel__section">
          <h3 className="institute-knowledge-panel__section-title">
            Real business example
          </h3>
          <p className="institute-knowledge-panel__prose institute-knowledge-panel__prose--preline">
            {body.realBusinessExample}
          </p>
        </section>
      ) : null}

      <BusinessMasteryMinute
        title={metadata.title}
        essentialQuestion={body.essentialQuestion}
        corePrinciple={body.corePrinciple}
        keyIdeas={body.keyIdeas}
        estimatedMinutes={Math.min(metadata.estimated_time, 5)}
      />

      <ReflectionPanel questions={body.reflectionQuestions} onDiscuss={onDiscuss} />

      <MakeItMine prompts={body.makeItMine} onMakeItMine={onMakeItMine} />

      <TryItThisWeek action={body.tryItThisWeek} />

      {body.commonMistakes.length > 0 ? (
        <section className="institute-knowledge-panel__section">
          <h3 className="institute-knowledge-panel__section-title">
            Common mistakes
          </h3>
          <ul className="institute-knowledge-panel__list">
            {body.commonMistakes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <CompetencyLinks
        competencyIds={body.relatedCompetencies}
        relatedCards={body.relatedKnowledgeCards}
        relatedApprenticeships={body.relatedApprenticeships}
        relatedBusinessLabs={metadata.related_business_labs}
        relatedSimulations={metadata.related_simulations}
        relatedChallenges={metadata.related_challenges}
      />

      <SaveActions
        onSaveToCabinet={onSaveToCabinet}
        onDiscuss={onDiscuss}
        onMakeItMine={onMakeItMine}
        cabinetSaved={cabinetSaved}
        cabinetPrompt={cabinetPrompt}
      />
    </article>
  );
}
