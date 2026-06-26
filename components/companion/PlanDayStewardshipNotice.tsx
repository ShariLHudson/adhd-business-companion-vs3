"use client";

type Props = {
  message: string;
};

/** Quiet acknowledgment when the companion reshapes the board — stewardship, not software. */
export function PlanDayStewardshipNotice({ message }: Props) {
  return (
    <div
      className="plan-day-stewardship rounded-xl border border-[#e7dfd4] bg-[#faf7f2]/90 px-4 py-3"
      role="status"
      aria-live="polite"
      data-testid="plan-day-stewardship-notice"
    >
      {message.split("\n\n").map((paragraph) => (
        <p
          key={paragraph.slice(0, 48)}
          className="text-base leading-relaxed text-[#4b463f] [&+&]:mt-3"
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}
