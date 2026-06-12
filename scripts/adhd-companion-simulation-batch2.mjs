/**
 * Batch 2 — founder emotional QA (pricing, shame, comparison, etc.)
 * Run: npx tsx scripts/adhd-companion-simulation-batch2.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import {
  detectEmotionalState,
  detectObstacle,
  detectSomaticAvoidance,
  EMOTION_LABELS,
  PRESENCE_LINES,
} from "../lib/companionEmotions.ts";
import { buildCompanionSystemPrompt } from "../lib/companionPrompt.ts";

try {
  const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
} catch {
  /* */
}

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("OPENAI_API_KEY missing");
  process.exit(1);
}

const SCENARIOS = [
  {
    id: "pricing-paralysis",
    label: "Pricing Paralysis",
    turns: [
      "I've been circling my pricing page for weeks. I know I'm undercharging but I can't bring myself to raise rates.",
      "Every time I think about sending the new price I imagine them laughing at me.",
    ],
  },
  {
    id: "comparing-others",
    label: "Comparing Yourself to Others",
    turns: [
      "Everyone in my niche seems years ahead of me. I scroll LinkedIn and feel sick comparing myself.",
      "I know comparison is poison but I can't stop looking at what everyone else is doing.",
    ],
  },
  {
    id: "ghosting-clients",
    label: "Ghosting Potential Clients",
    turns: [
      "A prospect reached out three days ago and I still haven't replied. Now it's too awkward.",
      "I keep opening the draft and closing it. They're probably ghosting me in their head already.",
    ],
  },
  {
    id: "inbox-shame",
    label: "Inbox Shame",
    turns: [
      "I have 847 unread emails and I can't open my inbox without a shame spiral starting.",
      "I've missed things that probably cost me money. I feel so stupid.",
    ],
  },
  {
    id: "financial-panic",
    label: "Financial Panic",
    turns: [
      "My income this month is scary and unpredictable — I'm panicking about bills.",
      "It's feast or famine every single month. I can't plan anything.",
    ],
  },
  {
    id: "rejection-spiral",
    label: "Rejection Spiral",
    turns: [
      "Got a no on a proposal yesterday and now I can't send anything else out.",
      "One rejection and my brain says I'm not cut out for this. They'll all say no.",
    ],
  },
  {
    id: "fear-niching",
    label: "Fear of Niching Down",
    turns: [
      "I can't pick a niche — what if I choose wrong and lose everyone?",
      "Staying general feels safer but I'm invisible. I'm afraid of picking the wrong one.",
    ],
  },
  {
    id: "adhd-tax",
    label: "ADHD Tax Frustration",
    turns: [
      "The ADHD tax is real — forgot to invoice again, another late fee, another course I haven't finished.",
      "I keep paying for my own disorganization and I'm so frustrated with myself.",
    ],
  },
  {
    id: "further-along",
    label: "I Should Be Further Along",
    turns: [
      "I thought I'd be further along by now. I feel like I wasted years.",
      "Everyone else my age has a real business. I'm still figuring it out and grieving that.",
    ],
  },
  {
    id: "success-anxiety",
    label: "Success Anxiety",
    turns: [
      "Things are actually going well and that scares me more than failing did.",
      "Growth means visibility and responsibility — I'm afraid of success and what comes next.",
    ],
  },
];

function scoreConnection(userMsg, reply, emotion, { somatic, obstacle }) {
  const r = reply.toLowerCase();
  const u = userMsg.toLowerCase();
  let score = 0;
  const notes = [];

  if (
    /\b(sounds like|i hear|that makes sense|understandable|valid|heavy|hard|real|human|exhausting|bracing|protect)\b/i.test(
      reply,
    )
  ) {
    score += 2;
    notes.push("validates");
  } else notes.push("weak validation");

  const mirrored = u.split(/\W+/).filter((w) => w.length > 5 && r.includes(w)).length;
  if (mirrored >= 2) {
    score += 2;
    notes.push("mirrors language");
  } else if (mirrored === 1) {
    score += 1;
    notes.push("some specificity");
  } else notes.push("generic");

  const questions = (reply.match(/\?/g) || []).length;
  if (questions <= 1) score += 2;
  else if (questions > 2) {
    score -= 2;
    notes.push("question overload");
  }

  const words = reply.split(/\s+/).length;
  if (words <= 85) score += 1;
  else if (words > 150) {
    score -= 2;
    notes.push("too long");
  }

  if (
    /\b(spin the wheel|brain dump|pomodoro|focus session)\b/i.test(reply) &&
    (emotion === "overwhelmed" || emotion === "emotional")
  ) {
    score -= 2;
    notes.push("tool dump");
  }

  if (somatic && /\b(crm|one call|timer|just dial)\b/i.test(r)) {
    score -= 2;
    notes.push("tactic before somatic");
  }

  if (/\b(impostor syndrome|imposter syndrome|executive dysfunction|adhd tax)\b/i.test(r)) {
    score -= 2;
    notes.push("clinical label");
  }

  if (/\b(one|tiny|small|just|single)\b/i.test(reply)) score += 1;

  if (/\b(together|here|we can|let's|you're not|body|scared|fear|shame|grief)\b/i.test(reply)) {
    score += 1;
    notes.push("warm presence");
  }

  if (obstacle) {
    const spoke =
      (obstacle === "self_doubt" && /\b(fraud|worth|charge|price|deserve|inside)\b/i.test(r)) ||
      (obstacle === "comparison" && /\b(compare|ahead|everyone else|scroll)\b/i.test(r)) ||
      (obstacle === "shame" && /\b(shame|ashamed|stupid|missed|ghost)\b/i.test(r)) ||
      (obstacle === "scarcity_fear" && /\b(money|income|bills|feast|famine|unpredictable)\b/i.test(r)) ||
      (obstacle === "rejection_fear" && /\b(reject|no|bracing|no)\b/i.test(r)) ||
      (obstacle === "decision_conflict" && /\b(niche|choose|wrong|pick|general)\b/i.test(r)) ||
      (obstacle === "grief" && /\b(further along|wasted|years|behind|grief)\b/i.test(r)) ||
      (obstacle === "success_anxiety" && /\b(success|growth|visibility|responsibility|scares)\b/i.test(r));
    if (spoke) {
      score += 1;
      notes.push(`speaks to ${obstacle}`);
    } else notes.push(`missed ${obstacle}`);
  }

  return { score, notes, words, questions };
}

function buildAttune(somatic, obstacle) {
  if (!somatic && !obstacle) return "";
  return `\n\nEMOTIONAL READ (apply Presence-Before-Strategy / Somatic rules): ${
    somatic ? "SOMATIC AVOIDANCE present — validate the body response, normalize it, then at most ONE tiny step. " : ""
  }${obstacle ? `Likely obstacle: ${obstacle}. Speak to this blocker, not the surface task.` : ""}`;
}

async function chat(systemPrompt, messages, emotionalState, somatic, obstacle) {
  const finalSystem = `${systemPrompt}\n\nDETECTED STATE THIS TURN:\n${EMOTION_LABELS[emotionalState]}${buildAttune(somatic, obstacle)}`;
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: finalSystem }, ...messages],
      temperature: 0.75,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

async function main() {
  const systemPrompt = buildCompanionSystemPrompt("today", "text", {});
  const results = [];
  const detectionGaps = [];

  console.log("DETECTION CHECK (turn 1):\n");
  for (const s of SCENARIOS) {
    const t = s.turns[0];
    const e = detectEmotionalState(t);
    const o = detectObstacle(t);
    const som = detectSomaticAvoidance(t);
    const gap = e === "unclear" && !o;
    if (gap) detectionGaps.push(s.label);
    console.log(
      `  ${s.label}: emotion=${e} obstacle=${o ?? "—"} somatic=${som} presence="${PRESENCE_LINES[e]}"${gap ? " ⚠ GAP" : ""}`,
    );
  }
  console.log("");

  for (const scenario of SCENARIOS) {
    const messages = [];
    let totalScore = 0;
    const turnDetails = [];

    for (const userMsg of scenario.turns) {
      const emotion = detectEmotionalState(userMsg);
      const obstacle = detectObstacle(userMsg);
      const somatic = detectSomaticAvoidance(userMsg);
      messages.push({ role: "user", content: userMsg });
      const reply = await chat(systemPrompt, messages, emotion, somatic, obstacle);
      messages.push({ role: "assistant", content: reply });
      const scored = scoreConnection(userMsg, reply, emotion, { somatic, obstacle });
      totalScore += scored.score;
      turnDetails.push({
        user: userMsg,
        emotion,
        obstacle,
        somatic,
        reply,
        ...scored,
      });
      await new Promise((r) => setTimeout(r, 350));
    }

    results.push({
      ...scenario,
      avgScore: totalScore / scenario.turns.length,
      totalScore,
      turns: turnDetails,
    });

    console.log(`\n${"=".repeat(60)}\nSCENARIO: ${scenario.label}`);
    for (const t of turnDetails) {
      console.log(
        `\n[${t.emotion}${t.obstacle ? ` / ${t.obstacle}` : ""}] USER: ${t.user}`,
      );
      console.log(`SHARI: ${t.reply}`);
      console.log(`Score: ${t.score} | ${t.notes.join(", ")}`);
    }
  }

  results.sort((a, b) => b.avgScore - a.avgScore);
  const overall = results.reduce((s, r) => s + r.avgScore, 0) / results.length;

  console.log(`\n${"=".repeat(60)}\nRANKING\n`);
  results.forEach((r, i) =>
    console.log(`${i + 1}. ${r.label} — avg ${r.avgScore.toFixed(1)}`),
  );
  console.log(`\nOverall avg: ${overall.toFixed(1)}`);
  if (detectionGaps.length) {
    console.log(`\nDetection gaps (unclear + no obstacle): ${detectionGaps.join(", ")}`);
  }

  const outPath = resolve(process.cwd(), "scripts/adhd-simulation-batch2-results.json");
  writeFileSync(outPath, JSON.stringify({ overall, detectionGaps, results }, null, 2));
  console.log(`\nSaved: ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
