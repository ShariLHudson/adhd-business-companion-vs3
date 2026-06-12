/**
 * Simulates ADHD-founder conversations through the Companion chat pipeline.
 * Uses production detection + attunement hints from companion-chat route.
 * Run: npx tsx scripts/adhd-companion-simulation.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import {
  detectEmotionalState,
  detectObstacle,
  detectSomaticAvoidance,
  EMOTION_LABELS,
} from "../lib/companionEmotions.ts";
import { buildCompanionSystemPrompt } from "../lib/companionPrompt.ts";

// Load .env.local
try {
  const envPath = resolve(process.cwd(), ".env.local");
  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
} catch {
  /* no env */
}

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("OPENAI_API_KEY missing in .env.local");
  process.exit(1);
}

const SCENARIOS = [
  {
    id: "overwhelmed",
    label: "Overwhelmed",
    turns: [
      "I have like 17 things on my list and my brain is shutting down. I can't even look at my inbox.",
      "Honestly even picking one thing feels impossible. Everything feels urgent.",
    ],
  },
  {
    id: "avoiding-sales",
    label: "Avoiding sales calls",
    turns: [
      "I know I need to make sales calls but I've been avoiding them for three days. Every time I open my CRM I feel sick.",
      "It's not that I don't know what to say — I just can't make myself dial.",
    ],
  },
  {
    id: "too-many-ideas",
    label: "Too many ideas",
    turns: [
      "I have so many business ideas I can't pick one. I'm starting everything and finishing nothing.",
      "Part of me is scared if I pick the wrong one I'll waste a year.",
    ],
  },
  {
    id: "cant-finish",
    label: "Can't finish projects",
    turns: [
      "I have four half-finished projects and I feel like a failure. I always get to 80% and quit.",
      "The last 20% feels harder than the first 80% somehow.",
    ],
  },
  {
    id: "imposter",
    label: "Imposter syndrome",
    turns: [
      "Who am I to charge these prices? Everyone else seems more put together than me.",
      "A client complimented me yesterday and I still felt like a fraud.",
    ],
  },
  {
    id: "time-blindness",
    label: "Time blindness",
    turns: [
      "I sat down to work at 9 and suddenly it's 3pm and I haven't done the thing I meant to do. Where did the day go?",
      "I was 'busy' all day but nothing important moved forward.",
    ],
  },
  {
    id: "content-paralysis",
    label: "Content creation paralysis",
    turns: [
      "I've been staring at a blank doc for an hour. I need to post but I don't know what to say.",
      "I keep thinking it has to be brilliant or people will judge me.",
    ],
  },
  {
    id: "executive-dysfunction",
    label: "Executive dysfunction",
    turns: [
      "I know exactly what I need to do. My body just won't start. Like I'm frozen.",
      "It's a simple task. Ten minutes. But I've been sitting here for an hour.",
    ],
  },
  {
    id: "perfectionism",
    label: "Perfectionism",
    turns: [
      "I've rewritten this email six times and still won't send it. It has to be perfect before anyone sees it.",
      "Every version feels wrong in a different way.",
    ],
  },
  {
    id: "emotional-overwhelm",
    label: "Emotional overwhelm",
    turns: [
      "I'm exhausted and anxious and everything feels heavy. I might cry at my desk.",
      "I don't even know if it's work or life anymore. It's all blended together.",
    ],
  },
];

function scoreConnection(userMsg, reply, emotion, { somatic, obstacle }) {
  const r = reply.toLowerCase();
  const u = userMsg.toLowerCase();
  let score = 0;
  const notes = [];

  const validation =
    /\b(sounds like|i hear|that makes sense|it's understandable|makes sense|heavy|hard|a lot|not alone|understandable|valid|bracing|protecting|real|human|exhausting)\b/i.test(
      reply,
    );
  if (validation) {
    score += 2;
    notes.push("validates");
  } else notes.push("weak validation");

  const userTokens = u.split(/\W+/).filter((w) => w.length > 5);
  const mirrored = userTokens.filter((w) => r.includes(w)).length;
  if (mirrored >= 2) {
    score += 2;
    notes.push("mirrors language");
  } else if (mirrored === 1) {
    score += 1;
    notes.push("some specificity");
  } else notes.push("generic");

  const questions = (reply.match(/\?/g) || []).length;
  if (questions <= 1) score += 2;
  else if (questions === 2) score += 0;
  else {
    score -= 2;
    notes.push(`${questions} questions — overload`);
  }

  const words = reply.split(/\s+/).length;
  if (words <= 80) score += 1;
  else if (words > 150) {
    score -= 2;
    notes.push("too long");
  }

  if (
    /\b(spin the wheel|brain dump|pomodoro|focus session|reset day)\b/i.test(
      reply,
    ) &&
    (emotion === "overwhelmed" || emotion === "emotional")
  ) {
    score -= 2;
    notes.push("tool dump while distressed");
  }

  if (somatic && /\b(crm|open your|one call|timer|5-?minute|dial)\b/i.test(r)) {
    score -= 2;
    notes.push("tactic before somatic validation");
  }

  if (/\b(impostor syndrome|imposter syndrome|executive dysfunction)\b/i.test(r)) {
    score -= 2;
    notes.push("clinical label");
  }

  if (/\b(one|tiny|small|just|single)\b/i.test(reply)) {
    score += 1;
    notes.push("small step framing");
  }

  if (/\b(together|here|we can|let's|you're not|body|scared|fear)\b/i.test(reply)) {
    score += 1;
    notes.push("warm presence");
  }

  if (
    (emotion === "emotional" || emotion === "overwhelmed" || somatic) &&
    /\b(ground|breathe|moment|pause|slow|bracing|protect)\b/i.test(reply)
  ) {
    score += 1;
    notes.push("grounds first");
  }

  if (obstacle && /\b(rejection|judg|fraud|failure|wrong one|perfect|body|scared)\b/i.test(r)) {
    score += 1;
    notes.push(`speaks to ${obstacle}`);
  }

  return { score, notes, words, questions };
}

function buildAttune(somatic, obstacle) {
  if (!somatic && !obstacle) return "";
  return `\n\nEMOTIONAL READ (apply Presence-Before-Strategy / Somatic rules): ${
    somatic
      ? "SOMATIC AVOIDANCE present — validate the body response, normalize it, then at most ONE tiny step. "
      : ""
  }${obstacle ? `Likely obstacle: ${obstacle}. Speak to this blocker, not the surface task.` : ""}`;
}

async function chat(systemPrompt, messages, emotionalState, somatic, obstacle) {
  const attune = buildAttune(somatic, obstacle);
  const finalSystem = `${systemPrompt}\n\nDETECTED STATE THIS TURN:\n${EMOTION_LABELS[emotionalState]}${attune}`;
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
  const baselinePath = resolve(
    process.cwd(),
    "scripts/adhd-simulation-baseline.json",
  );
  if (!existsSync(baselinePath) && existsSync(resolve(process.cwd(), "scripts/adhd-simulation-results.json"))) {
    writeFileSync(
      baselinePath,
      readFileSync(resolve(process.cwd(), "scripts/adhd-simulation-results.json")),
    );
  }

  const results = [];

  console.log("DETECTION CHECK (turn 1 openers):\n");
  for (const s of SCENARIOS) {
    const t = s.turns[0];
    const e = detectEmotionalState(t);
    const o = detectObstacle(t);
    const som = detectSomaticAvoidance(t);
    console.log(
      `  ${s.label}: emotion=${e} obstacle=${o ?? "—"} somatic=${som}`,
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
      const reply = await chat(
        systemPrompt,
        messages,
        emotion,
        somatic,
        obstacle,
      );
      messages.push({ role: "assistant", content: reply });
      const { score, notes, words, questions } = scoreConnection(
        userMsg,
        reply,
        emotion,
        { somatic, obstacle },
      );
      totalScore += score;
      turnDetails.push({
        user: userMsg,
        emotion,
        obstacle,
        somatic,
        reply,
        score,
        notes,
        words,
        questions,
      });
      await new Promise((r) => setTimeout(r, 400));
    }

    results.push({
      ...scenario,
      avgScore: totalScore / scenario.turns.length,
      totalScore,
      turns: turnDetails,
    });

    console.log(`\n${"=".repeat(60)}`);
    console.log(`SCENARIO: ${scenario.label}`);
    for (const t of turnDetails) {
      console.log(
        `\n[${t.emotion}${t.obstacle ? ` / ${t.obstacle}` : ""}${t.somatic ? " / somatic" : ""}] USER: ${t.user}`,
      );
      console.log(`SHARI: ${t.reply}`);
      console.log(`Score: ${t.score} | ${t.notes.join(", ")}`);
    }
  }

  results.sort((a, b) => b.avgScore - a.avgScore);

  console.log(`\n${"=".repeat(60)}`);
  console.log("RANKING — emotional connection strength\n");
  results.forEach((r, i) => {
    console.log(
      `${i + 1}. ${r.label} — avg ${r.avgScore.toFixed(1)} (total ${r.totalScore})`,
    );
  });

  if (existsSync(baselinePath)) {
    const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
    const byId = Object.fromEntries(baseline.map((b) => [b.id, b]));
    console.log(`\n${"=".repeat(60)}`);
    console.log("DELTA vs baseline\n");
    for (const r of [...results].sort((a, b) => a.label.localeCompare(b.label))) {
      const prev = byId[r.id];
      if (!prev) continue;
      const delta = r.avgScore - prev.avgScore;
      const sign = delta >= 0 ? "+" : "";
      console.log(`  ${r.label}: ${prev.avgScore.toFixed(1)} → ${r.avgScore.toFixed(1)} (${sign}${delta.toFixed(1)})`);
    }
    const prevAvg =
      baseline.reduce((s, b) => s + b.avgScore, 0) / baseline.length;
    const newAvg = results.reduce((s, r) => s + r.avgScore, 0) / results.length;
    console.log(`\n  Overall avg: ${prevAvg.toFixed(1)} → ${newAvg.toFixed(1)} (${newAvg - prevAvg >= 0 ? "+" : ""}${(newAvg - prevAvg).toFixed(1)})`);
  }

  const outPath = resolve(process.cwd(), "scripts/adhd-simulation-results.json");
  writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`\nFull results: ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
