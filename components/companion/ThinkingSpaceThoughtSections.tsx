"use client";

import { useState } from "react";
import type { BrainDumpEntry } from "@/lib/companionStore";
import type { ThoughtCollection } from "@/lib/thinkingSpace";
import {
  groupThoughtsByStatusBucket,
  groupThoughtsByTimeBucket,
  PROGRESSIVE_DISCLOSURE_THRESHOLD,
  type StatusBucketId,
  type TimeBucketId,
} from "@/lib/thinkingSpace/thoughtViews";
import { ThoughtCompanionBox } from "@/components/companion/ThoughtCompanionBox";

export type ThoughtSectionBucketMode = "time" | "status" | "none";

type Props = {
  thoughts: BrainDumpEntry[];
  collections: ThoughtCollection[];
  onOpenThought: (entry: BrainDumpEntry) => void;
  bucketMode?: ThoughtSectionBucketMode;
};

function ThoughtRow({
  entry,
  collections,
  onOpenThought,
}: {
  entry: BrainDumpEntry;
  collections: ThoughtCollection[];
  onOpenThought: (entry: BrainDumpEntry) => void;
}) {
  return (
    <li>
      <ThoughtCompanionBox
        entry={entry}
        collections={collections}
        onOpen={onOpenThought}
      />
    </li>
  );
}

type BucketId = TimeBucketId | StatusBucketId;

export function ThinkingSpaceThoughtSections({
  thoughts,
  collections,
  onOpenThought,
  bucketMode = thoughts.length >= PROGRESSIVE_DISCLOSURE_THRESHOLD
    ? "time"
    : "none",
}: Props) {
  if (bucketMode === "none" || thoughts.length < PROGRESSIVE_DISCLOSURE_THRESHOLD) {
    return (
      <ul className="flex flex-col gap-2.5">
        {thoughts.map((entry) => (
          <ThoughtRow
            key={entry.id}
            entry={entry}
            collections={collections}
            onOpenThought={onOpenThought}
          />
        ))}
      </ul>
    );
  }

  if (bucketMode === "status") {
    const sections = groupThoughtsByStatusBucket(thoughts);
    return (
      <BucketedList
        sections={sections}
        testId="thought-status-sections"
        defaultOpen="needs-attention"
        collections={collections}
        onOpenThought={onOpenThought}
      />
    );
  }

  const sections = groupThoughtsByTimeBucket(thoughts);
  return (
    <BucketedList
      sections={sections}
      testId="thought-time-sections"
      defaultOpen="today"
      collections={collections}
      onOpenThought={onOpenThought}
    />
  );
}

function BucketedList({
  sections,
  testId,
  defaultOpen,
  collections,
  onOpenThought,
}: {
  sections: Array<{ id: BucketId; label: string; thoughts: BrainDumpEntry[] }>;
  testId: string;
  defaultOpen: BucketId;
  collections: ThoughtCollection[];
  onOpenThought: (entry: BrainDumpEntry) => void;
}) {
  const [openBuckets, setOpenBuckets] = useState<Set<BucketId>>(
    () => new Set([defaultOpen]),
  );

  return (
    <div className="space-y-3" data-testid={testId}>
      {sections.map((section) => {
        const open = openBuckets.has(section.id);
        return (
          <section
            key={section.id}
            className="rounded-2xl border border-[#e7dfd4]/80"
          >
            <button
              type="button"
              onClick={() => {
                setOpenBuckets((prev) => {
                  const next = new Set(prev);
                  if (next.has(section.id)) next.delete(section.id);
                  else next.add(section.id);
                  return next;
                });
              }}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-[#1f1c19] hover:bg-[#faf7f2]/80"
            >
              <span>
                {open ? "▼" : "▶"} {section.label}
              </span>
              <span className="text-xs font-medium text-[#6b635a]">
                {section.thoughts.length}
              </span>
            </button>
            {open ? (
              <ul className="flex flex-col gap-2.5 border-t border-[#e7dfd4]/60 px-3 py-3">
                {section.thoughts.map((entry) => (
                  <ThoughtRow
                    key={entry.id}
                    entry={entry}
                    collections={collections}
                    onOpenThought={onOpenThought}
                  />
                ))}
              </ul>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
