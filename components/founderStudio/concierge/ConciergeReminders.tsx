import Link from "next/link";

import type { ExecutiveReminder } from "@/lib/founder/concierge/types";

type ConciergeRemindersProps = {
  reminders: ExecutiveReminder[];
};

const KIND_LABELS: Record<ExecutiveReminder["kind"], string> = {
  "pending-decision": "Decision",
  "strategy-session": "Strategy",
  "idea-revisit": "Idea",
  "workshop-approval": "Approval",
};

export function ConciergeReminders({ reminders }: ConciergeRemindersProps) {
  return (
    <section className="founder-concierge-reminders" aria-labelledby="concierge-reminders-heading">
      <h2 className="founder-concierge-reminders__title" id="concierge-reminders-heading">
        Prepared for You
      </h2>
      <ul className="founder-concierge-reminders__list">
        {reminders.map((reminder) => (
          <li key={reminder.id} className="founder-concierge-reminders__item">
            <span className="founder-concierge-reminders__kind">
              {KIND_LABELS[reminder.kind]}
            </span>
            <div className="founder-concierge-reminders__body">
              <p className="founder-concierge-reminders__title">{reminder.title}</p>
              <p className="founder-concierge-reminders__note">{reminder.note}</p>
            </div>
            {reminder.href ? (
              <Link href={reminder.href} className="founder-concierge-reminders__open">
                Review
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
