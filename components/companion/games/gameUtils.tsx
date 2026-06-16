"use client";

import type { ReactNode } from "react";

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export const rand = (n: number) => Math.floor(Math.random() * n);

export const SWATCHES = ["#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ec4899"];

export const SHAPES = ["●", "■", "▲", "◆", "★", "⬡"] as const;

export function GameFrame({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <p className="text-xl font-bold text-[#1f1c19]">{title}</p>
      <p className="mt-1 text-base text-[#6b635a]">{hint}</p>
      {children}
    </div>
  );
}
