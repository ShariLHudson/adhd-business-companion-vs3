/** Full-viewport Conservatory — conversation-first, no companion chrome. */
export default function RelationshipPrototypeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="rel-layout-root">{children}</div>;
}
