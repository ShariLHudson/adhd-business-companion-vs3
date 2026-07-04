"use client";

type Props = {
  visible: boolean;
  faded?: boolean;
};

/**
 * Decorative layer — leather journal on the writing table.
 * Placeholder art until scene photography is aligned.
 */
export function JournalGazeboScene({ visible, faded = false }: Props) {
  if (!visible) return null;

  return (
    <div
      className={[
        "journal-gazebo__scene",
        faded ? "journal-gazebo__scene--faded" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
    >
      <div className="journal-gazebo__table-surface" />
      <div className="journal-gazebo__leather-journal">
        <div className="journal-gazebo__leather-journal-spine" />
        <div className="journal-gazebo__leather-journal-cover">
          <span className="journal-gazebo__leather-journal-flame" />
        </div>
      </div>
    </div>
  );
}
