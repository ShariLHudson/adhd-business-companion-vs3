type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
};

export function SectionHeader({ eyebrow, title, subtitle }: SectionHeaderProps) {
  return (
    <header className="founder-executive-section-header">
      {eyebrow ? <p className="founder-home__eyebrow">{eyebrow}</p> : null}
      <h2 className="founder-panel__title">{title}</h2>
      {subtitle ? <p className="founder-panel__subtitle">{subtitle}</p> : null}
    </header>
  );
}
