"use client";

import { useEffect, useState } from "react";
import {
  INSTITUTE_CABINET_UPDATED_EVENT,
  listCabinetItems,
  cabinetLocationLabel,
} from "@/lib/momentumInstitute/cabinetStore";
import type { InstituteCabinetItem } from "@/lib/momentumInstitute/types";
import { workspacePanelShellClass } from "@/lib/workspaceLayoutTokens";

export function InstituteCabinetPanel() {
  const [items, setItems] = useState<InstituteCabinetItem[]>([]);

  useEffect(() => {
    const sync = () => setItems(listCabinetItems());
    sync();
    window.addEventListener(INSTITUTE_CABINET_UPDATED_EVENT, sync);
    return () =>
      window.removeEventListener(INSTITUTE_CABINET_UPDATED_EVENT, sync);
  }, []);

  return (
    <div className={workspacePanelShellClass()}>
      <p className="text-sm leading-relaxed text-[#6b635a]">
        Reference copies of Institute lessons you chose to keep — not duplicates
        of the full experience.
      </p>
      {items.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-[#d4cdc3] bg-[#faf7f2] px-4 py-8 text-center text-sm text-[#6b635a]">
          Nothing filed yet. When you finish a lesson, Spark may offer to save a
          reference here for easy return.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-[#e7dfd4] bg-white px-4 py-3"
            >
              <p className="text-base font-semibold text-[#1f1c19]">
                {item.label}
              </p>
              <p className="mt-1 text-sm text-[#6b635a]">
                {cabinetLocationLabel(item)}
              </p>
              <p className="mt-1 text-xs text-[#9a8f82]">
                Filed {new Date(item.filedAt).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
