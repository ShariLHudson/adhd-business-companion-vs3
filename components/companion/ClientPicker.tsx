"use client";

import { useEffect, useState } from "react";
import { getAvatars, type IdealClientAvatar } from "@/lib/companionStore";

// "Which client is this for?" — the user override from the AI decision layer.
// Hidden when there are 0–1 clients (nothing to choose). With 2+, the user can
// pick one, or leave it on Auto and let the resolver use the primary.
export function ClientPicker({
  value,
  onChange,
}: {
  value: string | undefined; // selected avatar id, or undefined = Auto
  onChange: (id: string | undefined) => void;
}) {
  const [avatars, setAvatars] = useState<IdealClientAvatar[]>([]);

  useEffect(() => {
    setAvatars(getAvatars());
  }, []);

  if (avatars.length < 2) return null;

  const primary = avatars.find((a) => a.isPrimary) ?? avatars[0];

  return (
    <div className="mb-3">
      <p className="mb-1 text-sm font-semibold text-[#6b635a]">
        Which client is this for?
      </p>
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
            value === undefined
              ? "border-[#1e4f4f] bg-[#1e4f4f] text-white"
              : "border-[#c9bfb0] bg-white text-[#4b463f] hover:border-[#1e4f4f]"
          }`}
        >
          Auto {primary ? `· ${primary.name}` : ""}
        </button>
        {avatars.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => onChange(a.id)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              value === a.id
                ? "border-[#1e4f4f] bg-[#1e4f4f] text-white"
                : "border-[#c9bfb0] bg-white text-[#4b463f] hover:border-[#1e4f4f]"
            }`}
          >
            {a.emoji ? `${a.emoji} ` : ""}
            {a.name}
          </button>
        ))}
      </div>
    </div>
  );
}
