"use client";

type ResourcesPanelProps = {
  dimmed?: boolean;
};

export function ResourcesPanel({ dimmed }: ResourcesPanelProps) {
  return (
    <aside
      className={`spark-studio-resources${dimmed ? " spark-studio-resources--dimmed" : ""}`}
      aria-label="Resources"
    >
      <h2 className="spark-studio-resources__title">Resources</h2>

      <section className="spark-studio-resources__card">
        <h3>Business Brain</h3>
        <ul>
          <li>Business: Visual Spark Studios™</li>
          <li>Current focus: ADHD Business Ecosystem™</li>
          <li>Voice: warm, clear, encouraging</li>
        </ul>
      </section>

      <section className="spark-studio-resources__card">
        <h3>Client Avatar</h3>
        <ul>
          <li>ADHD entrepreneur</li>
          <li>Easily overwhelmed</li>
          <li>Wants clarity and momentum</li>
        </ul>
      </section>

      <section className="spark-studio-resources__card">
        <h3>Related Assets</h3>
        <ul>
          <li>Workshop Launch</li>
          <li>7-Day Email Sequence</li>
          <li>Founder Invitation</li>
        </ul>
      </section>

      <section className="spark-studio-resources__card spark-studio-resources__card--spark">
        <h3>Spark Card</h3>
        <p>
          <strong>Positioning:</strong> Make the promise clear before creating
          the content
        </p>
      </section>
    </aside>
  );
}
