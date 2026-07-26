"use client";

import { useEffect, useState } from "react";
import { getAvatars, type IdealClientAvatar } from "@/lib/companionStore";
import { ClientAvatarMark } from "@/components/companion/ClientAvatarMark";

/** Multi-select client avatars for Create audience step. */
export function CreateAudienceMultiPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (names: string[]) => void;
}) {
  const [avatars, setAvatars] = useState<IdealClientAvatar[]>([]);

  useEffect(() => {
    setAvatars(getAvatars());
  }, []);

  if (avatars.length === 0) return null;

  const selected = new Set(value.map((v) => v.trim().toLowerCase()));

  function toggle(avatar: IdealClientAvatar) {
    const key = avatar.name.trim().toLowerCase();
    const next = selected.has(key)
      ? value.filter((n) => n.trim().toLowerCase() !== key)
      : [...value, avatar.name];
    onChange(next);
  }

  return (
    <div className="mt-4 text-left">
      <p className="mb-2 text-sm font-semibold text-[#6b635a]">
        Your client avatars
      </p>
      <div className="flex flex-wrap justify-center gap-1.5">
        {avatars.map((a) => {
          const active = selected.has(a.name.trim().toLowerCase());
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => toggle(a)}
              className={`inline-flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-3 text-sm font-medium transition-colors ${
                active
                  ? "border-[#1e4f4f] bg-[#1e4f4f] text-white"
                  : "border-[#c9bfb0] bg-white text-[#4b463f] hover:border-[#1e4f4f]"
              }`}
            >
              <ClientAvatarMark name={a.name} image={a.image} size={20} />
              {a.name}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-[#9a8f82]">
        Select one or more — or answer in chat.
      </p>
    </div>
  );
}
