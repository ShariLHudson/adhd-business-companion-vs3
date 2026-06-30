/** Full-viewport shell for Spark Workspace prototype — no companion chrome. */
export default function WorkspacePrototypeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="sw-layout-root">{children}</div>;
}
