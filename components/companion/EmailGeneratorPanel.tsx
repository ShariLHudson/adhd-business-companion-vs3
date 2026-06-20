"use client";

import { useState } from "react";
import {
  createSnippet,
  createTemplate,
  saveProject,
  type SnippetKind,
} from "@/lib/companionStore";
import { buildGenerationContextWithBusiness } from "@/lib/contentAudience";
import { ClientPicker } from "@/components/companion/ClientPicker";
import { RefineActions } from "@/components/companion/RefineActions";
import { RemixActions } from "@/components/companion/RemixActions";
import { ScoreActions } from "@/components/companion/ScoreActions";
import { ExportActions } from "@/components/companion/ExportActions";
import type { AppSection } from "@/lib/companionUi";
import type { CreationWorkspaceInput } from "@/lib/workspaceCreation";

type Pkg = {
  subjects: string[];
  hooks: string[];
  versions: { label: string; body: string }[];
  ctas: string[];
  psLine: string;
  followUp: string;
};
type SeqItem = { label: string; subject: string; body: string };

// Layer 1 — choose what you're making.
const GOALS = [
  "Welcome a new lead",
  "Follow up after no response",
  "Nudge an existing customer",
  "Reactivation email",
  "Sales conversion email",
  "Educational email",
  "Story-based email",
];

const TONES = ["Warm & ADHD-friendly", "Friendly", "Professional", "Short & direct"];

// Layer 3 — one-tap personalization (regenerates with the twist).
const PERSONALIZE = [
  { label: "More friendly", mod: "make it warmer and more friendly" },
  { label: "More professional", mod: "make it more professional and polished" },
  { label: "More urgent", mod: "add appropriate urgency" },
  { label: "ADHD-simple", mod: "make it very short, simple, and skimmable" },
  { label: "Storytelling", mod: "open with a short relatable story" },
];

export function EmailGeneratorPanel({
  onOpen,
  onBuildWithShari,
}: {
  onOpen?: (s: AppSection) => void;
  onBuildWithShari?: (input: CreationWorkspaceInput) => void;
}) {
  const [goal, setGoal] = useState("");
  const [saveName, setSaveName] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState(TONES[0]);
  const [loading, setLoading] = useState(false);
  const [seqLoading, setSeqLoading] = useState(false);
  const [error, setError] = useState(false);

  const [pkg, setPkg] = useState<Pkg | null>(null);
  const [bodies, setBodies] = useState<string[]>([]);
  const [vIdx, setVIdx] = useState(0);
  const [subjectIdx, setSubjectIdx] = useState(0);
  const [sequence, setSequence] = useState<SeqItem[]>([]);
  const [flash, setFlash] = useState<string | null>(null);
  const [forAvatar, setForAvatar] = useState<string | undefined>(undefined);
  // Guided 3-step flow: 1 Intent → 2 Context → 3 Output. One decision at a time.
  const [step, setStep] = useState(1);

  function note(msg: string) {
    setFlash(msg);
    window.setTimeout(() => setFlash(null), 2200);
  }

  async function generate(personalization = "") {
    if (!goal.trim() || loading) return;
    setLoading(true);
    setError(false);
    setSequence([]);
    try {
      const res = await fetch("/api/email-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal,
          audience,
          tone,
          personalization,
          context: buildGenerationContextWithBusiness({ avatarId: forAvatar }),
        }),
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.versions) && data.versions.length) {
        setPkg(data);
        setBodies(data.versions.map((v: { body: string }) => v.body));
        setVIdx(0);
        setSubjectIdx(0);
        setStep(3);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  async function buildSequence() {
    if (!pkg || seqLoading) return;
    setSeqLoading(true);
    try {
      const res = await fetch("/api/email-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "sequence",
          goal,
          audience,
          baseEmail: bodies[vIdx] ?? "",
          context: buildGenerationContextWithBusiness({ avatarId: forAvatar }),
        }),
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.sequence)) setSequence(data.sequence);
    } catch {
      note("Couldn't build the sequence — try again.");
    } finally {
      setSeqLoading(false);
    }
  }

  function fullArtifact(): string {
    if (!pkg) return "";
    const subject = pkg.subjects[subjectIdx] ?? pkg.subjects[0] ?? "";
    const body = bodies[vIdx] ?? "";
    const ps = pkg.psLine ? `\n\nP.S. ${pkg.psLine}` : "";
    const fu = pkg.followUp
      ? `\n\n---\nFollow-up (if no reply in 2–3 days):\n${pkg.followUp}`
      : "";
    return `Subject: ${subject}\n\n${body}${ps}${fu}`;
  }

  function saveToTemplates() {
    createTemplate({
      title: (saveName.trim() || goal.trim() || "Email").slice(0, 80),
      body: fullArtifact(),
      category: "emails",
      subcategory: "Sales emails",
      status: "saved",
    });
    note("Saved to Templates ✓");
  }

  function saveSequence() {
    if (!sequence.length) return;
    const body = sequence
      .map((s) => `${s.label}\nSubject: ${s.subject}\n\n${s.body}`)
      .join("\n\n========\n\n");
    createTemplate({
      title: `${goal.trim().slice(0, 48) || "Email"} — sequence`,
      body,
      category: "emails",
      subcategory: "Launch sequences",
      status: "saved",
    });
    note("Sequence saved to Templates ✓");
  }

  function saveToProject() {
    const subject = pkg?.subjects[subjectIdx] ?? "the email";
    saveProject({
      name: goal.trim().slice(0, 60) || "Email campaign",
      goal: `Send email: ${goal.trim()}`,
      nextAction: `Send "${subject}"`,
      horizon: "now",
      status: "in-progress",
    });
    onOpen?.("projects");
  }

  function copy() {
    try {
      void navigator.clipboard?.writeText(fullArtifact());
      note("Copied ✓");
    } catch {
      note("Couldn't copy — select manually.");
    }
  }

  function saveSnippet(content: string, kind: SnippetKind, where: string) {
    createSnippet({ content, kind, category: "Email", whereToUse: where });
    note("Saved as snippet ✓");
  }

  const inputCls =
    "w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]";
  const label = "text-sm font-bold uppercase tracking-wide text-[#6b635a]";

  return (
    <div className="companion-fade-in mx-auto flex h-full max-w-2xl flex-col px-6 py-8">
      <p className="text-2xl font-semibold text-[#1f1c19]">✉️ Email generator</p>
      <p className="mt-1 text-base text-[#6b635a]">
        Pick what the email is for — I&apos;ll write a full package you can edit,
        save, and reuse.
      </p>

      {/* STEP 1 — INTENT: one decision, what are you writing? */}
      {step === 1 && (
        <div className="companion-fade-in">
          <p className={`mt-5 ${label}`}>What are you writing?</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {GOALS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGoal(g)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                  goal === g
                    ? "bg-[#1e4f4f] text-white shadow-sm"
                    : "bg-white/80 text-[#3d3630] hover:bg-white"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
          <input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="…or type your own"
            className={`mt-3 ${inputCls}`}
          />
          <button
            type="button"
            onClick={() => setStep(2)}
            disabled={!goal.trim()}
            className="mt-4 self-start rounded-xl bg-[#1e4f4f] px-6 py-3 text-base font-semibold text-white hover:bg-[#163a3a] disabled:opacity-50"
          >
            Continue →
          </button>
        </div>
      )}

      {/* STEP 2 — CONTEXT: who for + tone, nothing else. */}
      {step === 2 && (
        <div className="companion-fade-in">
          <p className={`mt-5 ${label}`}>Who is this for?</p>
          <div className="mt-2">
            <ClientPicker value={forAvatar} onChange={setForAvatar} />
          </div>
          <input
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="Anyone specific? (optional)"
            className={`mt-2 ${inputCls}`}
          />

          <p className={`mt-4 ${label}`}>Tone</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {TONES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTone(t)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                  tone === t
                    ? "bg-[#1e4f4f] text-white shadow-sm"
                    : "bg-white/80 text-[#3d3630] hover:bg-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-xl border-2 border-[#1e4f4f] bg-white px-5 py-3 text-base font-semibold text-[#1e4f4f]"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => generate()}
              disabled={!goal.trim() || loading}
              className="rounded-xl bg-[#1e4f4f] px-6 py-3 text-base font-semibold text-white hover:bg-[#163a3a] disabled:opacity-50"
            >
              {loading ? "Writing…" : "✨ Generate email"}
            </button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-[#a85c4a]">
              Couldn&apos;t generate just now — try again.
            </p>
          )}
        </div>
      )}

      {/* STEP 3 — OUTPUT: edit details shortcut back to context. */}
      {step === 3 && (
        <button
          type="button"
          onClick={() => setStep(2)}
          className="mt-5 self-start text-sm font-semibold text-[#1e4f4f] hover:underline"
        >
          ← Edit details
        </button>
      )}

      {/* Package */}
      {step === 3 && pkg && (
        <div className="companion-fade-in mt-6 flex flex-col gap-5">
          {/* Personalization toggles */}
          <div>
            <p className={label}>Make it…</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {PERSONALIZE.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  disabled={loading}
                  onClick={() => generate(p.mod)}
                  className="rounded-full border border-[#1e4f4f]/30 bg-white px-3 py-1.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/[0.06] disabled:opacity-50"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subjects */}
          {pkg.subjects.length > 0 && (
            <div>
              <p className={label}>Subject lines — pick one</p>
              <div className="mt-2 flex flex-col gap-1.5">
                {pkg.subjects.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSubjectIdx(i)}
                    className={`rounded-lg border px-3 py-2 text-left text-base ${
                      subjectIdx === i
                        ? "border-[#1e4f4f] bg-[#1e4f4f]/[0.06] font-semibold text-[#1f1c19]"
                        : "border-[#d4cdc3] bg-white text-[#3d3630] hover:bg-[#f0f5f5]"
                    }`}
                  >
                    {subjectIdx === i ? "● " : "○ "}
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Hooks */}
          {pkg.hooks.length > 0 && (
            <div>
              <p className={label}>Opening hook options</p>
              <ul className="mt-2 flex flex-col gap-1.5">
                {pkg.hooks.map((h, i) => (
                  <li
                    key={i}
                    className="flex items-start justify-between gap-2 rounded-lg border border-[#d4cdc3] bg-white/85 px-3 py-2 text-base text-[#2d2926]"
                  >
                    <span>{h}</span>
                    <button
                      type="button"
                      onClick={() => saveSnippet(h, "hook", "Email hook")}
                      className="shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/10"
                    >
                      + snippet
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Body versions */}
          <div>
            <p className={label}>Body — 3 versions</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {pkg.versions.map((v, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setVIdx(i)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                    vIdx === i
                      ? "bg-[#1e4f4f] text-white"
                      : "bg-white/80 text-[#3d3630] hover:bg-white"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
            <textarea
              value={bodies[vIdx] ?? ""}
              onChange={(e) => {
                const next = [...bodies];
                next[vIdx] = e.target.value;
                setBodies(next);
              }}
              className="mt-3 min-h-[220px] w-full resize-none rounded-2xl border border-[#c9bfb0] bg-white px-4 py-3 text-base leading-relaxed text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
            />
            <RefineActions
              text={bodies[vIdx] ?? ""}
              onApply={(next) => {
                const arr = [...bodies];
                arr[vIdx] = next;
                setBodies(arr);
              }}
            />
            <ScoreActions
              content={bodies[vIdx] ?? ""}
              kind="email"
              onApply={(next) => {
                const arr = [...bodies];
                arr[vIdx] = next;
                setBodies(arr);
              }}
            />
            <RemixActions
              content={bodies[vIdx] ?? ""}
              onApply={(next) => {
                const arr = [...bodies];
                arr[vIdx] = next;
                setBodies(arr);
              }}
            />
          </div>

          {/* CTAs */}
          {pkg.ctas.length > 0 && (
            <div>
              <p className={label}>CTA options (soft → strong)</p>
              <ul className="mt-2 flex flex-col gap-1.5">
                {pkg.ctas.map((c, i) => (
                  <li
                    key={i}
                    className="flex items-start justify-between gap-2 rounded-lg border border-[#d4cdc3] bg-white/85 px-3 py-2 text-base text-[#2d2926]"
                  >
                    <span>{c}</span>
                    <button
                      type="button"
                      onClick={() => saveSnippet(c, "cta", "Email CTA")}
                      className="shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/10"
                    >
                      + snippet
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* PS line */}
          {pkg.psLine && (
            <div>
              <p className={label}>P.S. line</p>
              <p className="mt-2 rounded-lg border border-[#d4cdc3] bg-white/85 px-3 py-2 text-base italic text-[#2d2926]">
                P.S. {pkg.psLine}
              </p>
            </div>
          )}

          {/* Follow-up + sequence */}
          <div>
            <p className={label}>Follow-up</p>
            {pkg.followUp && (
              <p className="mt-2 whitespace-pre-wrap rounded-2xl border border-[#d4cdc3] bg-white/85 p-4 text-base leading-relaxed text-[#2d2926]">
                {pkg.followUp}
              </p>
            )}
            {sequence.length === 0 ? (
              <button
                type="button"
                onClick={buildSequence}
                disabled={seqLoading}
                className="mt-3 rounded-xl border border-[#1e4f4f]/40 bg-white px-4 py-2.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5] disabled:opacity-50"
              >
                {seqLoading ? "Building…" : "🧵 Turn into a 3-email sequence"}
              </button>
            ) : (
              <div className="mt-3 flex flex-col gap-3">
                {sequence.map((s, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-[#1e4f4f]/20 bg-[#1e4f4f]/[0.04] p-4"
                  >
                    <p className="text-sm font-bold text-[#1e4f4f]">{s.label}</p>
                    <p className="mt-1 text-sm font-semibold text-[#1f1c19]">
                      Subject: {s.subject}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-base leading-relaxed text-[#2d2926]">
                      {s.body}
                    </p>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={saveSequence}
                  className="self-start rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163a3a]"
                >
                  💾 Save sequence to Templates
                </button>
              </div>
            )}
          </div>

          {/* Action layer */}
          <div className="sticky bottom-0 -mx-6 border-t border-[#e7dfd4] bg-[#faf7f2]/95 px-6 py-3 backdrop-blur">
            {flash && (
              <p className="mb-2 text-sm font-semibold text-[#1e4f4f]">{flash}</p>
            )}
            <input
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Name this email (for saving)"
              className="mb-2 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
            />
            <p className={label}>What would you like to do with this?</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {onBuildWithShari && pkg && (
                <button
                  type="button"
                  onClick={() =>
                    onBuildWithShari({
                      itemType: "Email",
                      title: saveName.trim() || goal.trim() || "Email",
                      draftContent: fullArtifact(),
                      brief: goal,
                      stage: "editing draft",
                    })
                  }
                  className="rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163a3a]"
                >
                  ✨ Build With Shari
                </button>
              )}
              <button
                type="button"
                onClick={saveToTemplates}
                className="rounded-lg border border-[#1e4f4f]/40 bg-white px-4 py-2 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
              >
                💾 Save as Template
              </button>
              <button
                type="button"
                onClick={saveToProject}
                className="rounded-lg border border-[#1e4f4f]/40 bg-white px-4 py-2 text-sm font-semibold text-[#1e4f4f]"
              >
                📁 Add to Project
              </button>
              <button
                type="button"
                onClick={() => onOpen?.("time-block")}
                className="rounded-lg border border-[#1e4f4f]/40 bg-white px-4 py-2 text-sm font-semibold text-[#1e4f4f]"
              >
                ⏱ Schedule in Time Block
              </button>
              <button
                type="button"
                onClick={copy}
                className="rounded-lg border border-[#1e4f4f]/40 bg-white px-4 py-2 text-sm font-semibold text-[#1e4f4f]"
              >
                📋 Copy
              </button>
              <button
                type="button"
                onClick={() => generate()}
                disabled={loading}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/10 disabled:opacity-50"
              >
                🔄 Regenerate
              </button>
            </div>
            <ExportActions text={fullArtifact()} title={goal || "email"} />
          </div>
        </div>
      )}
    </div>
  );
}
