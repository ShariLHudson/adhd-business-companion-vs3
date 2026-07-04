/** Spark flame ornament — teardrop divider between room name and photograph. */
export function EstateGuideFlameDivider({ className }: { className?: string }) {
  return (
    <div
      className={["eg-guide-flame-divider", className].filter(Boolean).join(" ")}
      aria-hidden="true"
    >
      <span className="eg-guide-flame-divider__line" />
      <span className="eg-guide-flame-divider__flame eg-estate-flame" />
      <span className="eg-guide-flame-divider__line" />
    </div>
  );
}
