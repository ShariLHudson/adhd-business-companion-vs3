import type { ReactNode } from "react";

import type { ExecutiveResearchReport } from "@/lib/research/types";

import { ExecutivePanel } from "../executive";

type ResearchReportViewProps = {
  report: ExecutiveResearchReport;
  onClose: () => void;
};

function Section({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <ExecutivePanel title={title} collapsible defaultOpen={defaultOpen}>
      {children}
    </ExecutivePanel>
  );
}

export function ResearchReportView({ report, onClose }: ResearchReportViewProps) {
  return (
    <article className="founder-research__report" aria-labelledby="research-report-title">
      <div className="founder-research__report-header">
        <button type="button" className="founder-research__back-report" onClick={onClose}>
          ← New question
        </button>
        <p className="founder-research__report-meta">
          {report.categoryLabel} · Confidence: {report.confidence}
        </p>
        <h2 id="research-report-title" className="founder-research__report-query">
          {report.query}
        </h2>
      </div>

      <div className="founder-research__answer-block">
        <h3 className="founder-research__answer-label">The answer</h3>
        <p className="founder-research__answer-text">{report.answer}</p>
      </div>

      <ExecutivePanel title="Executive summary" defaultOpen>
        <p className="founder-research__prose">{report.executiveSummary}</p>
        <p className="founder-research__busy">
          <strong>Explain like I&apos;m busy:</strong> {report.explainLikeImBusy}
        </p>
      </ExecutivePanel>

      {report.whatChangedSinceLastTime ? (
        <ExecutivePanel title="What changed since last time">
          <p className="founder-research__prose">{report.whatChangedSinceLastTime}</p>
        </ExecutivePanel>
      ) : null}

      <ExecutivePanel title="Why this matters" defaultOpen>
        <p className="founder-research__prose">{report.whyThisMatters}</p>
      </ExecutivePanel>

      <Section title="Evidence">
        <ul className="founder-research__bullet-list">
          {report.evidence.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>

      <Section title="How this applies to Spark">
        <p className="founder-research__prose">{report.howThisAffectsSpark}</p>
        <ul className="founder-research__spark-apps">
          {report.sparkApplications.map((app) => (
            <li key={app.target}>
              <strong>{app.target}:</strong> {app.summary}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Member & business impact">
        <p className="founder-research__prose">
          <strong>Members:</strong> {report.howThisHelpsMembers}
        </p>
        <p className="founder-research__prose">
          <strong>Business:</strong> {report.howThisHelpsBusiness}
        </p>
        <p className="founder-research__prose">
          <strong>You:</strong> {report.howThisHelpsPersonally}
        </p>
      </Section>

      <Section title="Opportunities & risks">
        <p className="founder-research__subhead">Best opportunities</p>
        <ul className="founder-research__bullet-list">
          {report.bestOpportunities.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="founder-research__subhead">Potential risks</p>
        <ul className="founder-research__bullet-list">
          {report.potentialRisks.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>

      <ExecutivePanel title="Recommended next steps" defaultOpen>
        <ol className="founder-research__steps">
          {report.recommendedNextSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </ExecutivePanel>

      {report.boardPerspectives && report.boardRecommendation ? (
        <Section title="Executive board summary">
          <ul className="founder-research__board-list">
            {report.boardPerspectives.map((p) => (
              <li key={p.id}>
                <strong>{p.label}:</strong> {p.summary} — <em>{p.recommendation}</em>
              </li>
            ))}
          </ul>
          <p className="founder-research__board-rec">
            <strong>Founder recommends:</strong> {report.boardRecommendation}
          </p>
        </Section>
      ) : null}

      <Section title="Outside the box">
        <p className="founder-research__subhead">Unexpected connections</p>
        <ul className="founder-research__bullet-list">
          {report.outsideTheBox.unexpectedConnections.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="founder-research__subhead">Questions worth exploring</p>
        <ul className="founder-research__bullet-list">
          {report.outsideTheBox.questionsWorthExploring.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>

      <Section title="Value estimate">
        <ul className="founder-research__metrics">
          <li>Research time saved: ~{report.valueMetrics.researchTimeSavedHours}h</li>
          <li>Implementation time saved: ~{report.valueMetrics.implementationTimeSavedHours}h</li>
          <li>Strategic importance: {report.valueMetrics.strategicImportance}</li>
          <li>Member impact: {report.valueMetrics.memberImpact}</li>
        </ul>
      </Section>

      <Section title="Sources">
        <ul className="founder-research__sources">
          {report.sources.map((source) => (
            <li key={source.id}>
              {source.title}
              {source.publisher ? ` · ${source.publisher}` : ""}
            </li>
          ))}
        </ul>
        <p className="founder-research__muted">{report.confidenceRationale}</p>
      </Section>
    </article>
  );
}
