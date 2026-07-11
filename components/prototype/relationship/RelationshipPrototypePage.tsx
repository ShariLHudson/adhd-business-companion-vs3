"use client";

import { useCallback, useEffect, useState } from "react";
import { ChoiceOptions } from "./ChoiceOptions";
import { ConversationInput } from "./ConversationInput";
import { ConversationThread } from "./ConversationThread";
import { DraftDocument } from "./DraftDocument";
import {
  CONSERVATORY_BG,
  DRAFT_DOCUMENT,
  DRAFT_OFFER,
  EDIT_ACKNOWLEDGMENT,
  GREETING,
  MOCK_FIRST_ANSWER,
  MOCK_SECOND_ANSWER,
  POST_RESEARCH_MESSAGE,
  SAVE_OFFER,
  SAVE_RESPONSES,
  SECOND_QUESTION,
  UNCERTAINTY_MESSAGE,
  WORKSHOP_QUESTION,
  type ChatMessage,
} from "./mockData";
import { RelationshipRoom } from "./RelationshipRoom";
import { ResearchExperience } from "./ResearchExperience";
import type { RelationshipPhase, SaveChoice } from "./types";

let messageCounter = 0;

function nextId() {
  messageCounter += 1;
  return `msg-${messageCounter}`;
}

/**
 * Spark Prototype 4 — The Relationship Prototype
 *
 * The conversation is primary. The document is secondary.
 * The room is always present. Never ask the member to navigate.
 */

export function RelationshipPrototypePage() {
  const [phase, setPhase] = useState<RelationshipPhase>("room-waiting");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showResearch, setShowResearch] = useState(false);
  const [showDraft, setShowDraft] = useState(false);
  const [promiseText, setPromiseText] = useState(
    DRAFT_DOCUMENT.sections.find((s) => s.id === "promise")?.text ?? "",
  );
  const [hasEdited, setHasEdited] = useState(false);
  const [showSaveChoices, setShowSaveChoices] = useState(false);

  const addShari = useCallback((text: string, delay = 0) => {
    window.setTimeout(() => {
      setMessages((prev) => [...prev, { id: nextId(), role: "shari", text }]);
    }, delay);
  }, []);

  const addMember = useCallback((text: string) => {
    setMessages((prev) => [...prev, { id: nextId(), role: "member", text }]);
  }, []);

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase("greeting"), 1400);
    const t2 = window.setTimeout(() => {
      addShari(GREETING);
      setPhase("workshop-question");
    }, 2800);
    const t3 = window.setTimeout(() => {
      addShari(WORKSHOP_QUESTION);
      setPhase("awaiting-first-answer");
    }, 5200);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [addShari]);

  const handleFirstAnswer = useCallback(
    (text: string) => {
      addMember(text || MOCK_FIRST_ANSWER);
      setPhase("uncertainty-offer");
      window.setTimeout(() => addShari(UNCERTAINTY_MESSAGE), 900);
    },
    [addMember, addShari],
  );

  const handleUncertaintyChoice = useCallback(
    (choice: string) => {
      if (choice === "research") {
        setShowResearch(true);
        setPhase("research");
        return;
      }
      if (choice === "question") {
        addMember("Ask me another question.");
        window.setTimeout(() => {
          addShari(SECOND_QUESTION);
          setPhase("awaiting-second-answer");
        }, 800);
        return;
      }
      addMember("Show me examples.");
      window.setTimeout(() => {
        addShari(
          "Here are three ways others phrase relief:\n\n• One clear next move this week\n• Less shame about being behind\n• A plan they can actually follow\n\nDoes any of that feel closer?",
        );
        setPhase("awaiting-second-answer");
      }, 800);
    },
    [addMember, addShari],
  );

  const handleResearchClose = useCallback(() => {
    setShowResearch(false);
    setPhase("post-research");
    window.setTimeout(() => {
      addShari(POST_RESEARCH_MESSAGE);
      window.setTimeout(() => {
        addShari(SECOND_QUESTION);
        setPhase("awaiting-second-answer");
      }, 1600);
    }, 600);
  }, [addShari]);

  const handleSecondAnswer = useCallback(
    (text: string) => {
      addMember(text || MOCK_SECOND_ANSWER);
      setPhase("draft-offer");
      window.setTimeout(() => addShari(DRAFT_OFFER), 1000);
    },
    [addMember, addShari],
  );

  const handleDraftYes = useCallback(() => {
    addMember("Yes, show me.");
    setShowDraft(true);
    setPhase("draft-visible");
  }, [addMember]);

  const handleEdited = useCallback(() => {
    if (!hasEdited) {
      setHasEdited(true);
      window.setTimeout(() => {
        addShari(EDIT_ACKNOWLEDGMENT);
        window.setTimeout(() => {
          addShari(SAVE_OFFER);
          setShowSaveChoices(true);
          setPhase("save-offer");
        }, 1200);
      }, 800);
    }
  }, [addShari, hasEdited]);

  const handleSaveChoice = useCallback(
    (choice: SaveChoice) => {
      if (!choice) return;
      setShowSaveChoices(false);
      addShari(SAVE_RESPONSES[choice]);
      setPhase("complete");
    },
    [addShari],
  );

  const showInput =
    phase === "awaiting-first-answer" || phase === "awaiting-second-answer";

  const inputPlaceholder =
    phase === "awaiting-first-answer"
      ? "Share what’s on your mind…"
      : "Your answer…";

  const handleSend = (text: string) => {
    if (phase === "awaiting-first-answer") handleFirstAnswer(text);
    else if (phase === "awaiting-second-answer") handleSecondAnswer(text);
  };

  return (
    <div className={`rel-root rel-root--${phase}`} style={{ backgroundImage: `url(${CONSERVATORY_BG})` }}>
      <p className="rel-dev-link">
        Relationship prototype 4 ·{" "}
        <a href="/companion">Companion</a>
        {" · "}
        <a href="/prototype/universal-work">Universal Work 01</a>
        {" · "}
        <a href="/prototype/conservatory-workspace">Conservatory V3</a>
      </p>

      <RelationshipRoom />

      <ConversationThread messages={messages} />

      <ResearchExperience visible={showResearch} onClose={handleResearchClose} />

      <DraftDocument
        visible={showDraft}
        promiseText={promiseText}
        onPromiseChange={setPromiseText}
        onEdited={handleEdited}
      />

      <ChoiceOptions
        visible={phase === "uncertainty-offer" && !showResearch}
        options={[
          { id: "question", label: "Ask another question" },
          { id: "examples", label: "Show me examples" },
          { id: "research", label: "Research what people are saying" },
        ]}
        onChoose={handleUncertaintyChoice}
      />

      <ChoiceOptions
        visible={phase === "draft-offer" && !showDraft}
        options={[
          { id: "yes", label: "Yes, show me" },
          { id: "not-yet", label: "Not yet — keep talking" },
        ]}
        onChoose={(id) => {
          if (id === "yes") handleDraftYes();
          else {
            addMember("Not yet — keep talking.");
            addShari("Of course. I'm right here.");
          }
        }}
      />

      <ChoiceOptions
        visible={showSaveChoices}
        options={[
          { id: "yes", label: "Yes" },
          { id: "not-yet", label: "Not Yet" },
          { id: "continue", label: "Continue Thinking" },
        ]}
        onChoose={(id) => handleSaveChoice(id as SaveChoice)}
      />

      <ConversationInput
        visible={showInput && !showResearch && !showDraft}
        placeholder={inputPlaceholder}
        onSend={handleSend}
      />

      {phase === "room-waiting" && (
        <p className="rel-waiting" aria-hidden>
          &nbsp;
        </p>
      )}
    </div>
  );
}
