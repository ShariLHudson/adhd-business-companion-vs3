import type { ReactNode } from "react";

/** Full-viewport shell — Journal Gazebo living prototype. */
export default function JournalGazeboPrototypeLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="journal-gazebo-prototype-root">{children}</div>;
}
