import type { ReactNode } from "react";

export const DASHBOARD = {
  bg: "bg-[#f7f5f1]",
  card: "rounded-2xl border border-[#e8e2d8] bg-white shadow-sm",
  heading: "text-[#1e4f4f]",
  gold: "text-[#9a7b1a]",
  goldBg: "bg-[#f5edd4]",
  goldBorder: "border-[#e8d48a]",
  muted: "text-[#6b635a]",
  body: "text-[#2d2926]",
  tealBtn: "rounded-xl bg-[#1e4f4f] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#163a3a]",
  outlineBtn:
    "rounded-xl border border-[#d4cdc3] bg-white px-3 py-1.5 text-xs font-medium text-[#1e4f4f] hover:bg-[#faf8f5]",
  goldBtn:
    "rounded-xl border border-[#e8d48a] bg-[#f5edd4] px-3 py-1.5 text-xs font-medium text-[#7a5c00] hover:bg-[#efe3b8]",
} as const;

export function DashboardSection({
  title,
  subtitle,
  accent,
  children,
  id,
}: {
  title: string;
  subtitle?: string;
  accent?: "teal" | "gold";
  children: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className={`${DASHBOARD.card} overflow-hidden`}>
      <div
        className={`border-b px-4 py-3 ${
          accent === "gold"
            ? "border-[#e8d48a] bg-gradient-to-r from-[#f5edd4]/80 to-white"
            : "border-[#e8e2d8] bg-gradient-to-r from-[#1e4f4f]/5 to-white"
        }`}
      >
        <h2
          className={`text-xs font-bold uppercase tracking-wide ${DASHBOARD.heading}`}
        >
          {title}
        </h2>
        {subtitle ? (
          <p className={`mt-0.5 text-xs ${DASHBOARD.muted}`}>{subtitle}</p>
        ) : null}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-[#ebe4d9] bg-[#faf8f5] p-3">
      <p className={`text-[10px] font-bold uppercase tracking-wide ${DASHBOARD.muted}`}>
        {label}
      </p>
      <p className={`mt-1 text-xl font-semibold ${DASHBOARD.body}`}>{value}</p>
      {hint ? <p className={`mt-0.5 text-xs ${DASHBOARD.muted}`}>{hint}</p> : null}
    </div>
  );
}

export function ActionChip({
  label,
  onClick,
  variant = "outline",
  disabled,
}: {
  label: string;
  onClick: () => void;
  variant?: "outline" | "teal" | "gold";
  disabled?: boolean;
}) {
  const cls =
    variant === "teal"
      ? DASHBOARD.tealBtn
      : variant === "gold"
        ? DASHBOARD.goldBtn
        : DASHBOARD.outlineBtn;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`${cls} disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {label}
    </button>
  );
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
