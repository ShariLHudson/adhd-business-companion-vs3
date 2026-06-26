import type { ReactNode } from "react";

/** Full-viewport shell for the hospitality experience prototype. */
export default function HospitalityPrototypeLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="hospitality-prototype-root">{children}</div>;
}
