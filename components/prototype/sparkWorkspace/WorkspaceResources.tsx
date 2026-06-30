"use client";

import type { WorkspaceMode } from "./types";
import { RESOURCES } from "./mockData";

type WorkspaceResourcesProps = {
  mode: WorkspaceMode;
};

export function WorkspaceResources({ mode }: WorkspaceResourcesProps) {
  const collapsed = mode === "writing";

  return (
    <aside
      className={`sw-resources sw-resources--${mode}${collapsed ? " sw-resources--collapsed" : ""}`}
      aria-label="Resources"
    >
      <h2 className="sw-resources__title">Resources</h2>

      <section className="sw-resources__card">
        <h3>Client Avatar</h3>
        <ul>
          {RESOURCES.clientAvatar.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="sw-resources__card">
        <h3>Brand Voice</h3>
        <ul>
          {RESOURCES.brandVoice.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="sw-resources__card">
        <h3>Related Business Assets</h3>
        <ul>
          {RESOURCES.relatedAssets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="sw-resources__card sw-resources__card--spark">
        <h3>Spark Card</h3>
        <p>{RESOURCES.sparkCard}</p>
      </section>

      <section className="sw-resources__card">
        <h3>Previous Decision</h3>
        <p>{RESOURCES.previousDecision}</p>
      </section>

      <section className="sw-resources__card">
        <h3>Research Note</h3>
        <p>{RESOURCES.researchNote}</p>
      </section>
    </aside>
  );
}
