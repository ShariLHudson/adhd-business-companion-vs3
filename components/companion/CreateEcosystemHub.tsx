"use client";

type CreateHubAction = {
  id: string;
  label: string;
  description: string;
  emoji: string;
  onClick: () => void;
  count?: number;
};

export function CreateEcosystemHub({
  onNewDraft,
  onStartFromTemplate,
  onStartFromSnippet,
  onAudienceProfile,
  onResumeDraft,
  resumeDraftCount = 0,
}: {
  onNewDraft: () => void;
  onStartFromTemplate: () => void;
  onStartFromSnippet: () => void;
  onAudienceProfile: () => void;
  onResumeDraft: () => void;
  resumeDraftCount?: number;
}) {
  const actions: CreateHubAction[] = [
    {
      id: "new-draft",
      label: "New Draft",
      description: "Start a fresh document with Shari beside you.",
      emoji: "✨",
      onClick: onNewDraft,
    },
    {
      id: "template",
      label: "Start From Template",
      description: "Pick a framework and adapt it in Create.",
      emoji: "📚",
      onClick: onStartFromTemplate,
    },
    {
      id: "snippet",
      label: "Start From Snippet",
      description: "Reuse a hook, CTA, or short copy block.",
      emoji: "🧩",
      onClick: onStartFromSnippet,
    },
    {
      id: "audience",
      label: "Audience Profile",
      description: "Define who you are creating for.",
      emoji: "👤",
      onClick: onAudienceProfile,
    },
    {
      id: "resume",
      label: "Resume Draft",
      description: "Pick up an in-progress Create draft.",
      emoji: "⏱️",
      onClick: onResumeDraft,
      count: resumeDraftCount,
    },
  ];

  return (
    <div className="px-4 py-4 sm:px-6" data-testid="create-ecosystem-hub">
      <h2 className="text-xl font-bold text-[#1f1c19]">Create</h2>
      <p className="mt-1 text-sm text-[#6b635a]">
        Make something new — templates, snippets, and audience live here.
      </p>
      <ul className="mt-4 flex flex-col gap-2">
        {actions.map((action) => (
          <li key={action.id}>
            <button
              type="button"
              onClick={action.onClick}
              className="flex w-full items-center justify-between gap-3 rounded-2xl border border-[#e7dfd4] bg-white px-4 py-3 text-left transition-colors hover:border-[#1e4f4f]/30 hover:bg-[#faf7f2]"
            >
              <span className="flex min-w-0 items-start gap-3">
                <span className="text-xl" aria-hidden="true">
                  {action.emoji}
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-[#1f1c19]">
                    {action.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-[#6b635a]">
                    {action.description}
                  </span>
                </span>
              </span>
              {action.count != null && action.count > 0 ? (
                <span className="shrink-0 rounded-full bg-[#f0f5f5] px-2.5 py-0.5 text-xs font-bold tabular-nums text-[#1e4f4f]">
                  {action.count}
                </span>
              ) : (
                <span
                  className="shrink-0 text-sm text-[#9a8f82]"
                  aria-hidden="true"
                >
                  →
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
