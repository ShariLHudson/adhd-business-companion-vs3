"use client";

import type { ReactNode } from "react";

import type { MemoryReplay } from "@/lib/executiveMemoryTheater/types";

import { ExecutivePanel } from "../executive";

type MemoryReplayDetailProps = {
  replay: MemoryReplay;
  onBack: () => void;
};

function Panel({ title, children, defaultOpen = false }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  return (
    <ExecutivePanel title={title} collapsible defaultOpen={defaultOpen}>
      {children}
    </ExecutivePanel>
  );
}

export function MemoryReplayDetail({ replay, onBack }: MemoryReplayDetailProps) {
  return (
    <article className="founder-memory-theater__detail">
      <button type="button" className="founder-memory-theater__back" onClick={onBack}>
        ← Back to overview
      </button>

      <header className="founder-memory-theater__header">
        <h2 className="founder-memory-theater__title">{replay.title}</h2>
        <p className="founder-memory-theater__subtitle">{replay.subtitle}</p>
      </header>

      {replay.decisionRoom ? (
        <Panel title="The Decision Room" defaultOpen>
          <ul className="founder-memory-theater__metrics">
            <li><strong>Original question:</strong> {replay.decisionRoom.originalQuestion}</li>
            <li><strong>Context:</strong> {replay.decisionRoom.originalContext}</li>
            <li><strong>Chosen direction:</strong> {replay.decisionRoom.chosenDirection}</li>
            <li><strong>Reasoning:</strong> {replay.decisionRoom.reasoning}</li>
            <li><strong>Confidence then:</strong> {replay.decisionRoom.confidence}</li>
            <li><strong>Actual results:</strong> {replay.decisionRoom.actualResults}</li>
            <li><strong>Today recommends:</strong> {replay.decisionRoom.currentRecommendation}</li>
          </ul>
          <p className="founder-memory-theater__subhead">Board discussion then</p>
          <p className="founder-memory-theater__prose">{replay.decisionRoom.boardDiscussion}</p>
          <p className="founder-memory-theater__subhead">Lessons learned</p>
          <ul className="founder-memory-theater__bullets">
            {replay.decisionRoom.lessonsLearned.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </Panel>
      ) : null}

      {replay.historicalSimulation ? (
        <Panel title="Historical Simulation™" defaultOpen>
          <ol className="founder-memory-theater__historical-flow">
            <li><strong>Decision ({replay.historicalSimulation.decisionDate})</strong></li>
            <li>Historical recommendation: {replay.historicalSimulation.historicalRecommendation}</li>
            <li>Actual decision: {replay.historicalSimulation.actualDecision}</li>
            <li>Actual outcome: {replay.historicalSimulation.actualOutcome}</li>
            <li>Today&apos;s recommendation: {replay.historicalSimulation.todaysRecommendation}</li>
          </ol>
          <p className="founder-memory-theater__subhead">What changed</p>
          <ul className="founder-memory-theater__bullets">
            {replay.historicalSimulation.whatChanged.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </Panel>
      ) : null}

      <Panel title="If we could do it again">
        <p className="founder-memory-theater__prose">
          <strong>{replay.ifWeCouldDoItAgain.wouldChooseDifferently ? "Would choose differently." : "Would choose the same."}</strong>{" "}
          {replay.ifWeCouldDoItAgain.summary}
        </p>
        <p className="founder-memory-theater__prose">{replay.ifWeCouldDoItAgain.why}</p>
        <p className="founder-memory-theater__subhead">Teach another founder</p>
        <p className="founder-memory-theater__prose">{replay.ifWeCouldDoItAgain.teachAnotherFounder}</p>
        <div className="founder-memory-theater__assumptions">
          <div>
            <p className="founder-memory-theater__subhead">Assumptions correct</p>
            <ul className="founder-memory-theater__bullets">
              {replay.ifWeCouldDoItAgain.assumptionsCorrect.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
          {replay.ifWeCouldDoItAgain.assumptionsFailed.length > 0 ? (
            <div>
              <p className="founder-memory-theater__subhead">Assumptions failed</p>
              <ul className="founder-memory-theater__bullets">
                {replay.ifWeCouldDoItAgain.assumptionsFailed.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </Panel>

      <Panel title="Executive growth">
        <ul className="founder-memory-theater__bullets">
          {replay.executiveGrowth.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ul>
      </Panel>

      <Panel title="Wisdom Index™" defaultOpen>
        <ul className="founder-memory-theater__metrics">
          <li><strong>Knowledge gained:</strong> {replay.wisdomIndex.knowledgeGained}</li>
          <li><strong>Time saved:</strong> {replay.wisdomIndex.timeSaved}</li>
          <li><strong>Mistakes prevented:</strong> {replay.wisdomIndex.mistakesPrevented}</li>
          <li><strong>Revenue created:</strong> {replay.wisdomIndex.revenueCreated}</li>
          <li><strong>Customer value:</strong> {replay.wisdomIndex.customerValue}</li>
          <li><strong>Founder growth:</strong> {replay.wisdomIndex.founderGrowth}</li>
          <li><strong>Organizational learning:</strong> {replay.wisdomIndex.organizationalLearning}</li>
          <li><strong>Future reusability:</strong> {replay.wisdomIndex.futureReusability}</li>
        </ul>
      </Panel>

      <Panel title="Executive board reflection — today">
        <ul className="founder-memory-theater__board">
          {replay.boardReflection.map((b) => (
            <li key={b.id} className="founder-memory-theater__board-item">
              <strong>{b.label}</strong> — {b.stillRecommend ? "Still recommend" : "Would reconsider"}
              <p className="founder-memory-theater__prose">Would change: {b.wouldChange}</p>
              <p className="founder-memory-theater__muted">Concerns: {b.concerns} · Missed: {b.missedOpportunity}</p>
            </li>
          ))}
        </ul>
        <p className="founder-memory-theater__prose"><strong>Summary:</strong> {replay.boardSummary}</p>
      </Panel>

      <Panel title="The Shari reflection" defaultOpen>
        <p className="founder-memory-theater__prose"><strong>To Past Shari:</strong> {replay.shariReflection.presentToPast}</p>
        <p className="founder-memory-theater__prose"><strong>Future Shari should remember:</strong> {replay.shariReflection.futureShouldRemember}</p>
        <p className="founder-memory-theater__subhead">Strengths that helped</p>
        <ul className="founder-memory-theater__bullets">
          {replay.shariReflection.strengthsHelped.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        {replay.shariReflection.habitsSlowed.length > 0 ? (
          <>
            <p className="founder-memory-theater__subhead">Habits that slowed us</p>
            <ul className="founder-memory-theater__bullets">
              {replay.shariReflection.habitsSlowed.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </>
        ) : null}
        <p className="founder-memory-theater__prose"><strong>Growth:</strong> {replay.shariReflection.growthSummary}</p>
      </Panel>

      <Panel title="Never again · Do this again">
        <div className="founder-memory-theater__library-pair">
          <div>
            <p className="founder-memory-theater__subhead">Never again</p>
            <ul className="founder-memory-theater__bullets">
              {replay.neverAgain.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="founder-memory-theater__subhead">Do this again</p>
            <ul className="founder-memory-theater__bullets">
              {replay.doThisAgain.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
        </div>
      </Panel>
    </article>
  );
}
