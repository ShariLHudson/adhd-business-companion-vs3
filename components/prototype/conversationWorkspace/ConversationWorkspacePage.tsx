"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ConservatoryScene } from "./ConservatoryScene";
import { ConversationView } from "./ConversationView";
import { EmergingNotebook } from "./EmergingNotebook";
import {
  COMPLETION_LEAD,
  COMPLETION_OPTIONS,
  COMPLETION_REPLIES,
  CONSERVATORY_BG,
  GREETING,
  NOTEBOOK_COMPLETE,
  NOTEBOOK_GROWTH,
  OPENING_USER_HINT,
  ORGANIZING_LINE,
  PROACTIVE_OBSERVATION,
  RESEARCH_STATES,
  RESEARCH_SUMMARY,
  SHARI_AFTER_OPENING,
  SHARI_AFTER_RESEARCH,
  SHARI_FOURTH_QUESTION,
  SHARI_SECOND_QUESTION,
  SHARI_THIRD_QUESTION,
  STUCK_OPTIONS,
  STUCK_RESPONSE,
  WORK_PROMPT,
  type Line,
} from "./mockData";
import { QuietChoices } from "./QuietChoices";
import type { ConversationPhase } from "./types";

let lineId = 0;
function nextLineId() {
  lineId += 1;
  return `line-${lineId}`;
}

const STUCK_PATTERN = /\b(not sure|unsure|don't know|do not know|stuck|fuzzy)\b/i;

/**
 * Spark™ Prototype V4 — The Conversation Creates the Workspace™
 *
 * Conversation drives everything. The notebook emerges when context exists.
 * The room is always the emotional center.
 */

export function ConversationWorkspacePage() {
  const [phase, setPhase] = useState<ConversationPhase>("breathing");
  const [lines, setLines] = useState<Line[]>([]);
  const [exchangeCount, setExchangeCount] = useState(0);
  const [notebookVisible, setNotebookVisible] = useState(false);
  const [notebookEmerging, setNotebookEmerging] = useState(false);
  const [notebookComplete, setNotebookComplete] = useState(false);
  const [showStuckChoices, setShowStuckChoices] = useState(false);
  const [showProactiveChoices, setShowProactiveChoices] = useState(false);
  const [researchStatus, setResearchStatus] = useState<string | null>(null);
  const [showCompletionChoices, setShowCompletionChoices] = useState(false);
  const proactiveShown = useRef(false);
  const organizingShown = useRef(false);

  const addShari = useCallback((text: string, delay = 0) => {
    window.setTimeout(() => {
      setLines((prev) => [...prev, { id: nextLineId(), role: "shari", text }]);
    }, delay);
  }, []);

  const addUser = useCallback((text: string) => {
    setLines((prev) => [...prev, { id: nextLineId(), role: "user", text }]);
  }, []);

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase("greeting"), 2000);
    const t2 = window.setTimeout(() => {
      addShari(GREETING);
      setPhase("work-question");
    }, 3200);
    const t3 = window.setTimeout(() => addShari(WORK_PROMPT), 4800);
    const t4 = window.setTimeout(() => setPhase("chatting"), 5000);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
    };
  }, [addShari]);

  const notebookSections = useMemo(() => {
    if (notebookComplete) return NOTEBOOK_COMPLETE;
    return NOTEBOOK_GROWTH[Math.min(exchangeCount, 4)] ?? [];
  }, [exchangeCount, notebookComplete]);

  const revealNotebook = useCallback(() => {
    if (organizingShown.current) return;
    organizingShown.current = true;
    addShari(ORGANIZING_LINE);
    setNotebookEmerging(true);
    setPhase("notebook-emerging");
    window.setTimeout(() => {
      setNotebookVisible(true);
      setPhase("notebook-active");
    }, 1400);
  }, [addShari]);

  const maybeProactive = useCallback(() => {
    if (proactiveShown.current || !notebookVisible) return;
    if (exchangeCount < 5) return;
    proactiveShown.current = true;
    window.setTimeout(() => {
      addShari(PROACTIVE_OBSERVATION);
      setShowProactiveChoices(true);
      setPhase("proactive-offer");
    }, 1200);
  }, [addShari, exchangeCount, notebookVisible]);

  const shariReplyForExchange = useCallback(
    (count: number) => {
      if (count === 1) return SHARI_AFTER_OPENING;
      if (count === 2) return SHARI_SECOND_QUESTION;
      if (count === 3) {
        revealNotebook();
        return SHARI_THIRD_QUESTION;
      }
      if (count === 4) return SHARI_FOURTH_QUESTION;
      if (count >= 6 && !notebookComplete) {
        setNotebookComplete(true);
        setPhase("complete");
        window.setTimeout(() => {
          addShari(COMPLETION_LEAD);
          window.setTimeout(() => setShowCompletionChoices(true), 1400);
        }, 800);
        return "That lands. I'm updating the notebook quietly.";
      }
      return "Tell me more — I'm listening.";
    },
    [addShari, notebookComplete, revealNotebook],
  );

  const handleSend = useCallback(
    (text: string) => {
      addUser(text);
      setShowStuckChoices(false);
      setShowProactiveChoices(false);

      if (STUCK_PATTERN.test(text)) {
        window.setTimeout(() => {
          addShari(STUCK_RESPONSE);
          setShowStuckChoices(true);
          setPhase("stuck-offer");
        }, 700);
        return;
      }

      if (phase === "research-done") {
        setPhase("notebook-active");
        window.setTimeout(() => addShari(SHARI_AFTER_RESEARCH), 800);
        setExchangeCount((c) => c + 1);
        return;
      }

      const next = exchangeCount + 1;
      setExchangeCount(next);

      window.setTimeout(() => {
        const reply = shariReplyForExchange(next);
        addShari(reply);
        maybeProactive();
      }, 900);
    },
    [
      addShari,
      addUser,
      exchangeCount,
      maybeProactive,
      phase,
      shariReplyForExchange,
    ],
  );

  const handleStuckChoice = useCallback(
    (id: string) => {
      setShowStuckChoices(false);
      setPhase(notebookVisible ? "notebook-active" : "chatting");

      if (id === "easier") {
        addUser("Ask an easier question.");
        addShari("What feels most true — even if it's incomplete?", 800);
        return;
      }
      if (id === "research") {
        addUser("Research this for me.");
        runResearch();
        return;
      }
      if (id === "examples") {
        addUser("Show examples.");
        addShari(
          "Others often say:\n• One clear next move this week\n• Less shame about being behind\n• A plan they can actually follow\n\nDoes any of that feel closer?",
          800,
        );
        return;
      }
      addUser("Skip it and come back later.");
      addShari("Of course. We can leave that space open.", 800);
    },
    [addShari, addUser, notebookVisible],
  );

  const runResearch = useCallback(() => {
    setPhase("researching");
    setShowProactiveChoices(false);
    let step = 0;
    const tick = () => {
      if (step < RESEARCH_STATES.length) {
        setResearchStatus(RESEARCH_STATES[step]);
        step += 1;
        window.setTimeout(tick, 1800);
        return;
      }
      setResearchStatus(null);
      addShari(RESEARCH_SUMMARY);
      setPhase("research-done");
      window.setTimeout(() => addShari(SHARI_AFTER_RESEARCH), 1600);
    };
    window.setTimeout(tick, 400);
  }, [addShari]);

  const handleProactiveChoice = useCallback(
    (id: string) => {
      setShowProactiveChoices(false);
      if (id === "yes") {
        addUser("Yes, that would help.");
        runResearch();
        return;
      }
      if (id === "more") {
        addUser("Tell me more.");
        addShari(
          "Similar workshops often lead with relief — naming the stuck moment — before listing what they'll learn.",
          800,
        );
        setPhase("notebook-active");
        return;
      }
      addUser("Not yet.");
      addShari("No rush. We can stay with what you already know.", 800);
      setPhase("notebook-active");
    },
    [addShari, addUser, runResearch],
  );

  const handleCompletionChoice = useCallback(
    (id: string) => {
      setShowCompletionChoices(false);
      addUser(
        COMPLETION_OPTIONS.find((o) => o.id === id)?.label ?? "Continue",
      );
      addShari(COMPLETION_REPLIES[id] ?? "I'm here.", 900);
    },
    [addShari, addUser],
  );

  const inputVisible =
    phase !== "breathing" &&
    phase !== "greeting" &&
    phase !== "researching" &&
    !showStuckChoices &&
    !showProactiveChoices &&
    !showCompletionChoices;

  const placeholder =
    exchangeCount === 0 ? OPENING_USER_HINT : "Continue the conversation…";

  return (
    <div
      className={`cw4-root cw4-root--${phase}`}
      style={{ backgroundImage: `url(${CONSERVATORY_BG})` }}
    >
      <p className="cw4-dev-link">
        Conversation → Workspace V4 ·{" "}
        <a href="/companion">Companion</a>
        {" · "}
        <a href="/prototype/relationship">Relationship 4 (chat 1)</a>
        {" · "}
        <a href="/workspace-prototype">Workspace</a>
      </p>

      <ConservatoryScene />

      <ConversationView
        lines={lines}
        inputVisible={inputVisible}
        placeholder={placeholder}
        onSend={handleSend}
        researchStatus={researchStatus}
      />

      <EmergingNotebook
        visible={notebookVisible}
        emerging={notebookEmerging}
        sections={notebookSections}
        complete={notebookComplete}
      />

      <QuietChoices
        visible={showStuckChoices}
        options={STUCK_OPTIONS.map((o) => ({ id: o.id, label: o.label }))}
        onChoose={handleStuckChoice}
      />

      <QuietChoices
        visible={showProactiveChoices}
        options={[
          { id: "yes", label: "Yes" },
          { id: "not-yet", label: "Not yet" },
          { id: "more", label: "Tell me more" },
        ]}
        onChoose={handleProactiveChoice}
      />

      <QuietChoices
        visible={showCompletionChoices}
        options={COMPLETION_OPTIONS.map((o) => ({ id: o.id, label: o.label }))}
        onChoose={handleCompletionChoice}
      />
    </div>
  );
}
