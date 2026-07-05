/**
 * Compose in-conversation drafts from discovery answers — calm surface, no builder chrome.
 */

import {
  getDocumentCreationProfile,
  type DocumentCreationProfile,
} from "./documentCreationProfiles";
import { pluginById } from "./documentRegistry";
import type { UniversalCreationSession } from "./types";
import { getEmailToneFromMemberSettings } from "./memberCreationTone";

const SKIP_SIGNAL = /\b(?:skip|none|not yet|n\/a)\b/i;

function answer(session: UniversalCreationSession, id: string, fallback = ""): string {
  return session.answers[id]?.trim() || fallback;
}

function toneLine(tone: string): string {
  if (!tone.trim()) return "Using your Conversation Style from Settings.";
  if (/settings|conversation style/i.test(tone)) return tone;
  if (/friend|warm|casual|checking in|gentle|conversational/i.test(tone)) {
    return "Warm and conversational — like someone who gets it.";
  }
  if (/direct|strategic|concise|professional|formal/i.test(tone)) {
    return "Direct and clear — kind, not cold.";
  }
  if (/guide|teach/i.test(tone)) {
    return "Clear and guiding — teaching without talking down.";
  }
  return tone;
}

function emailGreeting(tone: string): string {
  if (/direct|strategic|concise|professional|formal/i.test(tone)) {
    return "Hello,";
  }
  if (/playful|conversational|warm|gentle|friend|casual/i.test(tone)) {
    return "Hi —";
  }
  return "Hi,";
}

function newsletterStoryFromSession(session: UniversalCreationSession): string[] {
  const who = answer(session, "newsletter-who", "someone running a business");
  const core = answer(session, "newsletter-core-message");
  const offering = answer(session, "newsletter-offering", "this companion");
  return [
    "**A quick story**",
    "",
    `Meet Alex — ${who.toLowerCase()}, brilliant at ideas, exhausted by systems that weren't built for how they think.`,
    "",
    core
      ? sentence(
          `Before ${offering}, every planning tool felt like fighting their own brain — ${core.charAt(0).toLowerCase()}${core.slice(1)}`,
        )
      : sentence(
          `Before ${offering}, the gap wasn't talent — it was that every tool expected them to adapt instead of meeting them where they were.`,
        ),
    "",
    sentence(
      `That's what ${offering} is for — support that adapts to them, not the other way around.`,
    ),
    "",
  ];
}

function sentence(text: string): string {
  const t = text.trim();
  if (!t) return "";
  return t.endsWith(".") ? t : `${t}.`;
}

function section(title: string, body: string): string[] {
  if (!body.trim() || SKIP_SIGNAL.test(body)) return [];
  return [`**${title}**`, "", sentence(body), ""];
}

export function composeEmailDraft(session: UniversalCreationSession): string {
  const recipient = answer(session, "email-recipient");
  const relationship = answer(session, "email-relationship");
  const purpose = answer(session, "email-purpose");
  const context = answer(session, "email-context");
  const ask = answer(session, "email-ask");
  const tone =
    answer(session, "email-tone") || getEmailToneFromMemberSettings();
  const success = answer(session, "email-success");

  const subjectOptions = [
    purpose ? purpose.slice(0, 60).replace(/\.$/, "") : null,
    ask ? ask.slice(0, 55).replace(/\.$/, "") : null,
    "Following up",
  ].filter(Boolean) as string[];

  const lines: string[] = [
    "---",
    "**Subject line options**",
    ...subjectOptions.map((s, i) => `${i + 1}. ${s}`),
    "",
    "---",
    "",
  ];

  if (/formal|professional/i.test(tone)) {
    lines.push("Hello,", "");
  } else {
    lines.push(`${emailGreeting(tone)}`, "");
  }

  if (relationship) {
    lines.push(sentence(`Hope you're doing well — ${relationship.toLowerCase()}`), "");
  }

  if (context) {
    lines.push(sentence(context), "");
  }

  if (purpose) {
    lines.push(sentence(purpose), "");
  }

  if (ask) {
    lines.push(`**What I need from you:** ${ask.endsWith(".") ? ask.slice(0, -1) : ask}`, "");
  }

  if (success && !SKIP_SIGNAL.test(success)) {
    lines.push(sentence(`Ideally, ${success.charAt(0).toLowerCase()}${success.slice(1)}`), "");
  }

  lines.push(
    recipient ? `— [Your name] (to: ${recipient})` : "— You",
    "",
    toneLine(tone),
    "---",
  );

  return lines.join("\n");
}

export function composeNewsletterDraft(session: UniversalCreationSession): string {
  const why = answer(session, "newsletter-why");
  const who = answer(session, "newsletter-who");
  const core = answer(session, "newsletter-core-message");
  const offering = answer(session, "newsletter-offering");
  const tone = answer(session, "newsletter-tone");
  const cta = answer(session, "newsletter-cta");
  const proof = answer(session, "newsletter-proof");
  const success = answer(session, "newsletter-success");

  const subjectOptions = [
    offering ? `Something new for your ${who || "business"} brain` : "A note for you",
    core ? core.slice(0, 60).replace(/\.$/, "") : "Worth a few minutes of your attention",
    why ? why.slice(0, 55).replace(/\.$/, "") : "From me to you",
  ].filter(Boolean);

  const lines: string[] = [
    "---",
    "**Subject line options**",
    ...subjectOptions.map((s, i) => `${i + 1}. ${s}`),
    "",
    "**Preview text**",
    core || why || "A short read that respects how your brain works.",
    "",
    "---",
    "",
  ];

  if (/friend|warm|casual/i.test(tone)) {
    lines.push("Hey —", "");
  } else {
    lines.push("Hello,", "");
  }

  if (why) {
    lines.push(sentence(why), "");
  }

  if (core) {
    lines.push(sentence(core), "");
  }

  if (offering) {
    lines.push("**What I wanted you to know**", "", sentence(offering), "");
  }

  if (proof && !SKIP_SIGNAL.test(proof)) {
    if (/\b(?:help me|can you|could you|write a story)\b/i.test(proof)) {
      lines.push(...newsletterStoryFromSession(session));
    } else {
      lines.push("**A quick story**", "", sentence(proof), "");
    }
  }

  if (success) {
    lines.push("**Why this matters**", "", sentence(success), "");
  }

  lines.push(
    cta
      ? `**Your next step:** ${cta.endsWith(".") ? cta.slice(0, -1) : cta}`
      : "**Your next step:** Reply and tell me what would help most.",
    "",
    toneLine(tone),
    "",
    "— You",
    "---",
  );

  return lines.join("\n");
}

function composeProfileDraft(
  session: UniversalCreationSession,
  profile: DocumentCreationProfile,
): string {
  const orderedAnswers = profile.discoveryQuestions
    .map((q) => ({
      id: q.id,
      prompt: q.prompt,
      answer: session.answers[q.id]?.trim() ?? "",
    }))
    .filter((item) => item.answer && !SKIP_SIGNAL.test(item.answer));

  const lines: string[] = [
    "---",
    `**${profile.label} — first draft**`,
    "",
    `_${profile.essence}_`,
    "",
  ];

  profile.draftSections.forEach((sectionTitle, index) => {
    const matched = orderedAnswers[index]?.answer ?? "";
    lines.push(`**${sectionTitle}**`, "");
    if (matched) {
      lines.push(sentence(matched), "");
    } else if (orderedAnswers.length > 0) {
      const fallback = orderedAnswers[Math.min(index, orderedAnswers.length - 1)]!.answer;
      lines.push(sentence(fallback), "");
    } else {
      lines.push("_[To develop together]_", "");
    }
  });

  lines.push("---");
  return lines.join("\n");
}

export function composeSopDraft(session: UniversalCreationSession): string {
  const process = answer(session, "sop-process-name", "this process");
  const audience = answer(session, "sop-audience-type");
  const size = answer(session, "sop-audience-size");
  const frequency = answer(session, "sop-frequency");
  const failure = answer(session, "sop-failure");

  const lines: string[] = [
    "---",
    `**SOP: ${process}**`,
    "",
    ...section("Purpose + scope", `Document how to complete ${process} consistently.`),
    ...section("Who this is for", `${audience || "Your team"}. ${size || "Multiple people may follow this."}`),
    ...section(
      "Prerequisites",
      "List tools, access, and materials needed before starting.",
    ),
    "**Step-by-step procedure**",
    "",
    "1. _[First step — describe the starting action]_",
    "2. _[Continue each step in order]_",
    "3. _[Final verification step]_",
    "",
  ];

  if (frequency) {
    lines.push(...section("Frequency", frequency));
  }

  if (failure && !SKIP_SIGNAL.test(failure)) {
    lines.push(...section("Common mistakes + troubleshooting", failure));
  }

  lines.push(
    "**Checklist**",
    "",
    "- [ ] Prerequisites ready",
    "- [ ] Step 1 complete",
    "- [ ] Final review done",
    "",
    "---",
  );

  return lines.join("\n");
}

export function composeDocumentDraft(session: UniversalCreationSession): string {
  switch (session.documentType) {
    case "email":
      return composeEmailDraft(session);
    case "newsletter":
      return composeNewsletterDraft(session);
    case "sop":
      return composeSopDraft(session);
    default: {
      const profile = getDocumentCreationProfile(session.documentType);
      return composeProfileDraft(session, profile);
    }
  }
}

/** Apply a natural-language revision note to an existing draft. */
export function applyDraftRevision(draft: string, revisionNote: string): string {
  const note = revisionNote.trim();
  if (!note) return draft;
  if (/^looks good|^perfect|^no changes|^nothing|^it'?s ready/i.test(note)) {
    return draft;
  }

  return [
    draft,
    "",
    "---",
    "",
    "**Revised with your notes:**",
    "",
    sentence(note),
  ].join("\n");
}
