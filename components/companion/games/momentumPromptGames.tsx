"use client";

import { useMemo, useState } from "react";
import { GameFrame, rand } from "./gameUtils";

type GameProps = { onDone: () => void };

const FIRST_STEPS = [
  "Open the doc or app you need.",
  "Write one sentence — anything counts.",
  "Set a 2-minute timer and start.",
  "Send one short message.",
  "Gather the one thing you need on your desk.",
];

export function FirstStepFinder({ onDone }: GameProps) {
  const step = useMemo(() => FIRST_STEPS[rand(FIRST_STEPS.length)]!, []);
  return (
    <GameFrame
      title="First Step Finder"
      hint="What thoughts belong with getting unstuck? Here's one tiny move."
    >
      <p className="mt-6 rounded-2xl border border-[#d4cdc3] bg-white px-4 py-4 text-base font-semibold text-[#1f1c19]">
        {step}
      </p>
      <button
        type="button"
        onClick={onDone}
        className="mt-6 rounded-2xl bg-[#1e4f4f] px-8 py-3 text-base font-bold text-white"
      >
        I'll try that
      </button>
    </GameFrame>
  );
}

const RANDOM_ACTIONS = [
  "Drink a glass of water.",
  "Stand up and stretch for 30 seconds.",
  "Clear one item off your desk.",
  "Reply to one short message.",
  "Write down the next thing on your mind.",
  "Put on one song you like.",
];

export function RandomActionGenerator({ onDone }: GameProps) {
  const action = useMemo(() => RANDOM_ACTIONS[rand(RANDOM_ACTIONS.length)]!, []);
  return (
    <GameFrame title="Random Action Generator" hint="One small action — right now.">
      <p className="mt-6 rounded-2xl border border-[#d4cdc3] bg-white px-4 py-4 text-base text-[#1f1c19]">
        {action}
      </p>
      <button
        type="button"
        onClick={onDone}
        className="mt-6 rounded-2xl bg-[#1e4f4f] px-8 py-3 text-base font-bold text-white"
      >
        Done
      </button>
    </GameFrame>
  );
}

const TINY_WINS = [
  "Made the bed or straightened one surface",
  "Drank water",
  "Sent one message",
  "Opened what you were avoiding",
  "Wrote one line",
  "Took three deep breaths",
];

export function TinyWinChallenge({ onDone }: GameProps) {
  const wins = useMemo(() => {
    const pool = [...TINY_WINS];
    const picked: string[] = [];
    while (picked.length < 3 && pool.length) {
      const i = rand(pool.length);
      picked.push(pool.splice(i, 1)[0]!);
    }
    return picked;
  }, []);
  const [count, setCount] = useState(0);

  return (
    <GameFrame
      title="Tiny Win Challenge"
      hint={`Claim 3 micro-wins (${count}/3)`}
    >
      <div className="mt-6 flex flex-col gap-2">
        {wins.map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => {
              const next = count + 1;
              setCount(next);
              if (next >= 3) onDone();
            }}
            className="rounded-2xl border border-[#d4cdc3] bg-white px-4 py-3 text-left text-sm font-semibold text-[#1f1c19]"
          >
            + {w}
          </button>
        ))}
      </div>
    </GameFrame>
  );
}

const OPPOSITES = [
  ["Fast", "Slow"],
  ["Loud", "Quiet"],
  ["Big", "Small"],
  ["More", "Less"],
];

export function OppositeThinking({ onDone }: GameProps) {
  const [round, setRound] = useState(0);
  const pair = OPPOSITES[round % OPPOSITES.length]!;
  return (
    <GameFrame
      title="Opposite Thinking"
      hint={`Think of the opposite of "${pair[0]}" — tap when you have one. (${round + 1}/3)`}
    >
      <button
        type="button"
        onClick={() => (round + 1 >= 3 ? onDone() : setRound(round + 1))}
        className="mt-6 rounded-2xl bg-[#1e4f4f] px-8 py-3 text-base font-bold text-white"
      >
        Got one: {pair[1]}
      </button>
    </GameFrame>
  );
}

const IDEA_PROMPTS = [
  "What would make this easier for a tired brain?",
  "What would a kind friend suggest right now?",
  "What's the smallest version that still counts?",
  "What could you try for just 5 minutes?",
  "What would you do if perfection didn't matter?",
];

export function RandomIdeaGenerator({ onDone }: GameProps) {
  const prompt = useMemo(() => IDEA_PROMPTS[rand(IDEA_PROMPTS.length)]!, []);
  return (
    <GameFrame title="Random Idea Generator" hint="Let this prompt loosen your thinking.">
      <p className="mt-6 rounded-2xl border border-[#d4cdc3] bg-white px-4 py-4 text-base text-[#1f1c19]">
        {prompt}
      </p>
      <button
        type="button"
        onClick={onDone}
        className="mt-6 rounded-2xl bg-[#1e4f4f] px-8 py-3 text-base font-bold text-white"
      >
        That helped
      </button>
    </GameFrame>
  );
}

const STORY_STARTERS = [
  "The day everything finally clicked started with…",
  "Nobody expected the email to say…",
  "She opened the drawer and found…",
  "The smallest decision changed…",
];

export function StoryStarter({ onDone }: GameProps) {
  const line = useMemo(() => STORY_STARTERS[rand(STORY_STARTERS.length)]!, []);
  return (
    <GameFrame title="Story Starter" hint="Read it — let your brain wander for a moment.">
      <p className="mt-6 rounded-2xl border border-[#d4cdc3] bg-white px-4 py-4 text-base italic text-[#1f1c19]">
        {line}
      </p>
      <button
        type="button"
        onClick={onDone}
        className="mt-6 rounded-2xl bg-[#1e4f4f] px-8 py-3 text-base font-bold text-white"
      >
        Nice spark
      </button>
    </GameFrame>
  );
}

const WHAT_IFS = [
  "What if you only had 10 minutes?",
  "What if the goal was fun, not perfect?",
  "What if someone else handled the hard part?",
  "What if you started with the easiest piece?",
];

export function WhatIfChallenge({ onDone }: GameProps) {
  const q = useMemo(() => WHAT_IFS[rand(WHAT_IFS.length)]!, []);
  return (
    <GameFrame title="What If Challenge" hint="Play with the question — no pressure to solve it.">
      <p className="mt-6 rounded-2xl border border-[#d4cdc3] bg-white px-4 py-4 text-base font-semibold text-[#1f1c19]">
        {q}
      </p>
      <button
        type="button"
        onClick={onDone}
        className="mt-6 rounded-2xl bg-[#1e4f4f] px-8 py-3 text-base font-bold text-white"
      >
        Done playing
      </button>
    </GameFrame>
  );
}

export function HiddenObjects({ onDone }: GameProps) {
  const setup = useMemo(() => {
    const hidden = new Set<number>();
    while (hidden.size < 3) hidden.add(rand(16));
    return hidden;
  }, []);
  const [found, setFound] = useState<Set<number>>(new Set());

  function tap(i: number) {
    if (!setup.has(i)) return;
    const next = new Set(found);
    next.add(i);
    setFound(next);
    if (next.size >= 3) onDone();
  }

  return (
    <GameFrame title="Hidden Objects" hint={`Find 3 hidden objects (${found.size}/3)`}>
      <div className="mt-6 grid grid-cols-4 gap-2">
        {Array.from({ length: 16 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => tap(i)}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#d4cdc3]/50 text-lg"
          >
            {found.has(i) ? "🔍" : "·"}
          </button>
        ))}
      </div>
    </GameFrame>
  );
}

const WYR_PAIRS = [
  ["Always be 10 min early", "Always be 10 min late"],
  ["Unlimited coffee", "Unlimited snacks"],
  ["Work by the ocean", "Work in the mountains"],
  ["Read minds", "See the future"],
];

export function WouldYouRather({ onDone }: GameProps) {
  const [round, setRound] = useState(0);
  const pair = WYR_PAIRS[round % WYR_PAIRS.length]!;
  return (
    <GameFrame title="Would You Rather" hint={`Pick one — no wrong answer (${round + 1}/3)`}>
      <div className="mt-6 flex flex-col gap-2">
        {pair.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => (round + 1 >= 3 ? onDone() : setRound(round + 1))}
            className="rounded-2xl border-2 border-[#1e4f4f]/25 bg-white px-4 py-3 text-sm font-semibold"
          >
            {opt}
          </button>
        ))}
      </div>
    </GameFrame>
  );
}

export function TwoTruthsLie({ onDone }: GameProps) {
  const lieIndex = useMemo(() => rand(3), []);
  const statements = useMemo(
    () => [
      "I once forgot my own birthday.",
      "I can name every planet in order.",
      "I've never lost a sock in the laundry.",
    ],
    [],
  );
  return (
    <GameFrame title="Two Truths And A Lie" hint="Tap the statement that feels like the lie.">
      <div className="mt-6 flex flex-col gap-2">
        {statements.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => i === lieIndex && onDone()}
            className="rounded-2xl border border-[#d4cdc3] bg-white px-4 py-3 text-left text-sm font-semibold"
          >
            {s}
          </button>
        ))}
      </div>
    </GameFrame>
  );
}

const SENTENCE_STARTERS = [
  "The best part of today was…",
  "If I had a superpower it would be…",
  "My brain feels like a…",
  "The weirdest thing I believe is…",
];

export function FinishTheSentence({ onDone }: GameProps) {
  const starter = useMemo(
    () => SENTENCE_STARTERS[rand(SENTENCE_STARTERS.length)]!,
    [],
  );
  return (
    <GameFrame title="Finish The Sentence" hint="Say it out loud or in your head — then tap done.">
      <p className="mt-6 rounded-2xl border border-[#d4cdc3] bg-white px-4 py-4 text-base text-[#1f1c19]">
        {starter}
      </p>
      <button
        type="button"
        onClick={onDone}
        className="mt-6 rounded-2xl bg-[#1e4f4f] px-8 py-3 text-base font-bold text-white"
      >
        Finished
      </button>
    </GameFrame>
  );
}

const TRIVIA = [
  { q: "How many minutes is a classic Pomodoro?", a: "25" },
  { q: "What color is a calm ocean in emoji?", a: "Blue 🌊" },
  { q: "What do bees make?", a: "Honey" },
];

export function RandomTrivia({ onDone }: GameProps) {
  const item = useMemo(() => TRIVIA[rand(TRIVIA.length)]!, []);
  const [revealed, setRevealed] = useState(false);
  return (
    <GameFrame title="Random Trivia" hint="Guess or just enjoy the fact.">
      <p className="mt-6 text-base font-semibold text-[#1f1c19]">{item.q}</p>
      {revealed ? (
        <p className="mt-3 text-base text-[#6b635a]">{item.a}</p>
      ) : (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="mt-4 rounded-xl border border-[#d4cdc3] px-4 py-2 text-sm font-semibold"
        >
          Reveal
        </button>
      )}
      <button
        type="button"
        onClick={onDone}
        className="mt-6 rounded-2xl bg-[#1e4f4f] px-8 py-3 text-base font-bold text-white"
      >
        Fun enough
      </button>
    </GameFrame>
  );
}

const FUN_TOT_PAIRS = [
  ["Pizza 🍕", "Tacos 🌮"],
  ["Cats 🐱", "Dogs 🐶"],
  ["Beach 🏖️", "Forest 🌲"],
  ["Comedy 😂", "Drama 🎭"],
];

export function ThisOrThatFun({ onDone }: GameProps) {
  const [round, setRound] = useState(0);
  const pair = FUN_TOT_PAIRS[round % FUN_TOT_PAIRS.length]!;
  return (
    <GameFrame title="This Or That (Fun)" hint={`Just for fun (${round + 1}/4)`}>
      <div className="mt-6 flex gap-3">
        {pair.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => (round + 1 >= 4 ? onDone() : setRound(round + 1))}
            className="rounded-2xl border-2 border-[#e0795a]/30 bg-white px-4 py-3 text-sm font-semibold"
          >
            {opt}
          </button>
        ))}
      </div>
    </GameFrame>
  );
}
