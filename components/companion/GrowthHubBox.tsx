"use client";

export const GROWTH_VAULT_BOX_THEMES: Record<
  string,
  { border: string; bg: string; iconBg: string; accent: string }
> = {
  "wins-this-week": {
    border: "border-amber-200",
    bg: "bg-gradient-to-br from-amber-50 to-orange-50",
    iconBg: "bg-amber-100",
    accent: "text-amber-800",
  },
  "evidence-bank": {
    border: "border-emerald-200",
    bg: "bg-gradient-to-br from-emerald-50 to-teal-50",
    iconBg: "bg-emerald-100",
    accent: "text-emerald-800",
  },
  portfolio: {
    border: "border-violet-200",
    bg: "bg-gradient-to-br from-violet-50 to-indigo-50",
    iconBg: "bg-violet-100",
    accent: "text-violet-800",
  },
  "my-journey": {
    border: "border-rose-200",
    bg: "bg-gradient-to-br from-rose-50 to-orange-50",
    iconBg: "bg-rose-100",
    accent: "text-rose-800",
  },
};

export function GrowthHubBox({
  emoji,
  title,
  description,
  count,
  onOpen,
  testId,
  vaultVariant = false,
  vaultId,
}: {
  emoji: string;
  title: string;
  description: string;
  count?: number;
  onOpen: () => void;
  testId?: string;
  vaultVariant?: boolean;
  vaultId?: string;
}) {
  const theme =
    vaultVariant && vaultId ? GROWTH_VAULT_BOX_THEMES[vaultId] : null;

  if (vaultVariant && theme) {
    const statusPreview =
      count != null && count > 0
        ? `${count} saved`
        : "Nothing saved yet";

    return (
      <button
        type="button"
        onClick={onOpen}
        data-testid={testId}
        className={`flex h-full min-h-[9.5rem] w-full flex-col rounded-2xl border p-4 text-left shadow-sm transition hover:shadow-md ${theme.border} ${theme.bg}`}
      >
        <span
          aria-hidden="true"
          className={`inline-flex h-11 w-11 items-center justify-center rounded-xl text-2xl ${theme.iconBg}`}
        >
          {emoji}
        </span>
        <span className={`mt-3 block text-base font-bold ${theme.accent}`}>
          {title}
        </span>
        <span className="mt-1 block flex-1 text-sm leading-snug text-[#5c534a]">
          {description}
        </span>
        <span className="mt-3 flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-[#7a7066]">{statusPreview}</span>
          <span className={`text-xs font-bold ${theme.accent}`}>Open →</span>
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      data-testid={testId}
      className="flex w-full items-start gap-3 rounded-2xl border border-[#e7dfd4] bg-white px-4 py-4 text-left transition-colors hover:border-[#1e4f4f]/35 hover:bg-[#faf7f2]"
    >
      <span
        aria-hidden="true"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f5f1ea] text-xl"
      >
        {emoji}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="block text-base font-semibold text-[#1f1c19]">{title}</span>
          {count != null && count > 0 ? (
            <span className="rounded-full bg-[#f0f5f5] px-2 py-0.5 text-xs font-bold text-[#1e4f4f]">
              {count}
            </span>
          ) : null}
        </span>
        <span className="mt-1 block text-sm leading-snug text-[#6b635a]">
          {description}
        </span>
        <span className="mt-2 inline-block text-xs font-semibold text-[#1e4f4f]">
          Open →
        </span>
      </span>
    </button>
  );
}
