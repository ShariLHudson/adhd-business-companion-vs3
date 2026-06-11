"use client";

type PlaceholderPanelProps = {
  title: string;
  emoji: string;
  description: string;
};

export function PlaceholderPanel({
  title,
  emoji,
  description,
}: PlaceholderPanelProps) {
  return (
    <div className="companion-fade-in flex flex-col items-center justify-center px-8 py-16 text-center">
      <span className="text-5xl" aria-hidden="true">
        {emoji}
      </span>
      <h2 className="mt-4 text-2xl font-semibold text-[#1f1c19]">{title}</h2>
      <p className="mt-3 max-w-md text-lg leading-relaxed text-[#6b635a]">
        {description}
      </p>
    </div>
  );
}
