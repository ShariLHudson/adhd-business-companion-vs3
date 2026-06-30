/** Full-viewport Conservatory shell — no companion chrome. */
export default function UniversalWorkPrototypeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="uw-layout-root">{children}</div>;
}
