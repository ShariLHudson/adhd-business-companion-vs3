"use client";

import { useEffect, useRef, useState } from "react";
import {
  businessContextSummary,
  createTemplate,
  getContentTypes,
  getAvatars,
  getPrefs,
  saveProject,
  type TemplateCategory,
  type IdealClientAvatar,
} from "@/lib/companionStore";
import { ClientPicker } from "@/components/companion/ClientPicker";
import { RefineActions } from "@/components/companion/RefineActions";
import { RemixActions } from "@/components/companion/RemixActions";
import { ScoreActions } from "@/components/companion/ScoreActions";
import { ExportActions } from "@/components/companion/ExportActions";
import type { AppSection } from "@/lib/companionUi";

export type GenSeed = { type?: string; brief?: string } | null;

const TONES = ["Warm & ADHD-friendly", "Friendly", "Professional", "Persuasive", "Storytelling"];

function categoryFor(type: string): TemplateCategory {
  const t = type.toLowerCase();
  if (t.includes("email")) return "emails";
  if (t.includes("strateg")) return "strategy";
  if (t.includes("plan") || t.includes("brain") || t.includes("focus"))
    return "execution";
  if (t.includes("sop") || t.includes("workflow") || t.includes("system"))
    return "systems";
  if (t.includes("offer") || t.includes("pricing")) return "offers";
  if (t.includes("post") || t.includes("script") || t.includes("content"))
    return "content";
  return "other";
}

export function ContentGeneratorPanel({
  seed,
  onOpen,
}: {
  seed: GenSeed;
  onOpen?: (s: AppSection) => void;
}) {
  const [type, setType] = useState(seed?.type ?? "");
  const [brief, setBrief] = useState(seed?.brief ?? "");
  const [tone, setTone] = useState(TONES[0]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [forAvatar, setForAvatar] = useState<string | undefined>(undefined);
  const [avatars, setAvatars] = useState<IdealClientAvatar[]>([]);
  const [advanced, setAdvanced] = useState(false);
  const [multi, setMulti] = useState<
    { name: string; emoji?: string; text: string }[] | null
  >(null);
  const [multiLoading, setMultiLoading] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    setAvatars(getAvatars());
    setAdvanced(getPrefs().advancedAiTools);
  }, []);

  // Multi-Avatar mode — one tailored version per avatar (campaigns/testing).
  async function runAll() {
    if (!type.trim() && !brief.trim()) return;
    setMultiLoading(true);
    setMulti([]);
    const out: { name: string; emoji?: string; text: string }[] = [];
    for (const a of avatars) {
      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            brief,
            tone,
            context: businessContextSummary(a.id),
          }),
        });
        const data = await res.json();
        out.push({
          name: a.name,
          emoji: a.emoji,
          text: res.ok && data.result ? data.result : "(couldn't generate)",
        });
        setMulti([...out]);
      } catch {
        out.push({ name: a.name, emoji: a.emoji, text: "(couldn't generate)" });
        setMulti([...out]);
      }
    }
    setMultiLoading(false);
  }

  function note(msg: string) {
    setFlash(msg);
    window.setTimeout(() => setFlash(null), 2200);
  }

  async function run(t: string, b: string, tn: string) {
    if (!t.trim() && !b.trim()) return;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: t,
          brief: b,
          tone: tn,
          context: businessContextSummary(forAvatar),
        }),
      });
      const data = await res.json();
      if (res.ok && data.result) setDraft(data.result);
      else setError(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  // Auto-generate once when opened with a seed.
  useEffect(() => {
    if (seed && !started.current) {
      started.current = true;
      setType(seed.type ?? "");
      setBrief(seed.brief ?? "");
      void run(seed.type ?? "", seed.brief ?? "", tone);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  function saveToTemplates() {
    if (!draft.trim()) return;
    createTemplate({
      title: (title.trim() || type || draft.split("\n")[0] || "Draft").slice(
        0,
        80,
      ),
      body: draft,
      category: categoryFor(type),
      subcategory: type || undefined,
      status: "saved",
    });
    note("Saved to Templates ✓");
  }

  function saveToProject() {
    if (!draft.trim()) return;
    saveProject({
      name: (title.trim() || type || "New content").slice(0, 60),
      goal: brief.slice(0, 140) || `Create: ${type}`,
      nextAction: "Use / finish this draft",
      horizon: "now",
      status: "in-progress",
    });
    onOpen?.("projects");
  }

  const inputCls =
    "w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]";
  const label = "text-sm font-bold uppercase tracking-wide text-[#6b635a]";

  return (
    <div className="companion-fade-in mx-auto flex h-full max-w-2xl flex-col px-6 py-8">
      <p className="text-2xl font-semibold text-[#1f1c19]">✨ Create with Shari</p>
      <p className="mt-1 text-base text-[#6b635a]">
        Generate a draft you can edit, remix, and save — never just a chat reply.
      </p>

      <div className="mt-5 flex flex-col gap-3">
        <ClientPicker value={forAvatar} onChange={setForAvatar} />
        <div>
          <label className={label} htmlFor="cg-type">
            What are you making?
          </label>
          <select
            value={getContentTypes().includes(type) ? type : ""}
            onChange={(e) => e.target.value && setType(e.target.value)}
            className={`mt-1.5 ${inputCls}`}
          >
            <option value="">Choose a type…</option>
            {getContentTypes().map((ct) => (
              <option key={ct} value={ct}>
                {ct}
              </option>
            ))}
          </select>
          <input
            id="cg-type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="…or type your own content type"
            className={`mt-2 ${inputCls}`}
          />
          {type.trim().toLowerCase() === "email" && onOpen && (
            <button
              type="button"
              onClick={() => onOpen("email-generator")}
              className="mt-2 text-sm font-semibold text-[#1e4f4f] hover:underline"
            >
              Tip: use the full Email generator for subject lines + sequences →
            </button>
          )}
        </div>
        <div>
          <label className={label} htmlFor="cg-brief">
            Brief (optional)
          </label>
          <textarea
            id="cg-brief"
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="What's it about? Any details, scaffold, or template…"
            className={`mt-1.5 min-h-[90px] resize-none ${inputCls}`}
          />
        </div>
        <div className="flex items-end gap-3">
          <div className="min-w-0 flex-1">
            <label className={label} htmlFor="cg-tone">
              Tone
            </label>
            <select
              id="cg-tone"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className={`mt-1.5 ${inputCls}`}
            >
              {TONES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => run(type, brief, tone)}
            disabled={loading || (!type.trim() && !brief.trim())}
            className="shrink-0 rounded-xl bg-[#1e4f4f] px-6 py-2.5 text-base font-semibold text-white hover:bg-[#163a3a] disabled:opacity-50"
          >
            {loading ? "Writing…" : draft ? "Regenerate" : "✨ Generate"}
          </button>
        </div>
        {advanced && avatars.length >= 2 && (
          <button
            type="button"
            onClick={runAll}
            disabled={multiLoading || (!type.trim() && !brief.trim())}
            className="self-start rounded-xl border border-[#1e4f4f]/40 bg-white px-4 py-2 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5] disabled:opacity-50"
          >
            {multiLoading
              ? `Writing ${avatars.length} versions…`
              : `🧪 Generate for all ${avatars.length} audiences`}
          </button>
        )}
        {error && (
          <p className="text-sm text-[#a85c4a]">
            Couldn&apos;t generate just now — try again.
          </p>
        )}
      </div>

      {multi && multi.length > 0 && (
        <div className="companion-fade-in mt-6">
          <p className={label}>One version per audience</p>
          <div className="mt-2 flex flex-col gap-4">
            {multi.map((m, i) => (
              <div
                key={i}
                className="rounded-2xl border border-[#1e4f4f]/20 bg-white/85 p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-base font-semibold text-[#1f1c19]">
                    {m.emoji ?? "👤"} {m.name}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard?.writeText(m.text);
                      note(`Copied ${m.name}'s version ✓`);
                    }}
                    className="rounded-lg bg-[#1e4f4f]/10 px-3 py-1 text-sm font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/20"
                  >
                    Copy
                  </button>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed text-[#2d2926]">
                  {m.text}
                </p>
              </div>
            ))}
          </div>
          {flash && (
            <p className="mt-2 text-sm font-semibold text-[#1e4f4f]">{flash}</p>
          )}
        </div>
      )}

      {draft && (
        <div className="companion-fade-in mt-6">
          <p className={label}>Your draft</p>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="mt-2 min-h-[240px] w-full resize-none rounded-2xl border border-[#c9bfb0] bg-white px-4 py-3 text-base leading-relaxed text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
          />
          <RefineActions text={draft} onApply={(n) => setDraft(n)} />
          <ScoreActions
            content={draft}
            kind={type}
            onApply={(n) => setDraft(n)}
          />
          <RemixActions content={draft} onApply={(n) => setDraft(n)} />

          <div className="sticky bottom-0 mt-4 -mx-6 border-t border-[#e7dfd4] bg-[#faf7f2]/95 px-6 py-3 backdrop-blur">
            {flash && (
              <p className="mb-2 text-sm font-semibold text-[#1e4f4f]">{flash}</p>
            )}
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`Name this ${type || "content"} (for saving)`}
              className="mb-2 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={saveToTemplates}
                className="rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163a3a]"
              >
                💾 Save to Templates
              </button>
              <button
                type="button"
                onClick={saveToProject}
                className="rounded-lg border border-[#1e4f4f]/40 bg-white px-4 py-2 text-sm font-semibold text-[#1e4f4f]"
              >
                📁 Add to Project
              </button>
            </div>
            <ExportActions
              text={draft}
              title={title.trim() || type || "content"}
              social={/post|social|tweet|thread|reel/i.test(type)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
