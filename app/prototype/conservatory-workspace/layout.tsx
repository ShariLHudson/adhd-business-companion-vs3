/** Full-viewport Conservatory — no companion chrome. */
export default function ConservatoryWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="cw-layout-root">{children}</div>;
}
