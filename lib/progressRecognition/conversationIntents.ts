/**
 * 101 — Natural language recognition intents (conversation layer).
 * Preserves source context; does not invent impact.
 */

export type RecognitionConversationIntent =
  | { type: "save_as_win" }
  | { type: "add_to_hall" }
  | { type: "celebrate" }
  | { type: "open_garden" }
  | { type: "open_hall" }
  | { type: "play_gentle_sound" }
  | { type: "no_sound" }
  | { type: "list_accomplishments_month" }
  | { type: "explain_business_forward" }
  | { type: "what_did_i_learn" }
  | { type: "save_learning_evidence" }
  | { type: "who_helped" }
  | { type: "decline_accomplishment" }
  | { type: "unknown" };

export type RecognitionConversationRoute = {
  intent: RecognitionConversationIntent;
  placeId: string | null;
  memberFacingAck: string;
};

function norm(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Map a member utterance to a recognition intent + optional place.
 */
export function parseRecognitionConversationIntent(
  utterance: string,
): RecognitionConversationRoute {
  const t = norm(utterance);
  if (!t) {
    return {
      intent: { type: "unknown" },
      placeId: null,
      memberFacingAck: "I'm listening — what would you like to do with this?",
    };
  }

  if (
    /do not save (this )?as an accomplishment|don't save (this )?as an accomplishment|not an accomplishment/.test(
      t,
    )
  ) {
    return {
      intent: { type: "decline_accomplishment" },
      placeId: null,
      memberFacingAck: "Understood — I won't save this as an accomplishment.",
    };
  }

  if (/save (that|this|it)? ?as a win|save as a win/.test(t)) {
    return {
      intent: { type: "save_as_win" },
      placeId: null,
      memberFacingAck: "I can save that as a win.",
    };
  }

  if (
    /belongs in (my )?hall|add (it |this )?to (the )?hall|hall of accomplishments/.test(
      t,
    ) &&
    !/take me|go to|open/.test(t)
  ) {
    return {
      intent: { type: "add_to_hall" },
      placeId: null,
      memberFacingAck: "I can add that to your Hall of Accomplishments.",
    };
  }

  if (/^i want to celebrate|celebrate( this)?$|let'?s celebrate/.test(t)) {
    return {
      intent: { type: "celebrate" },
      placeId: null,
      memberFacingAck: "We can celebrate — here, or in the Garden or Hall.",
    };
  }

  if (
    /take me to (the )?celebration garden|open (the )?celebration garden|go to (the )?garden/.test(
      t,
    )
  ) {
    return {
      intent: { type: "open_garden" },
      placeId: "gardens",
      memberFacingAck: "Celebration Garden — whenever you're ready.",
    };
  }

  if (
    /take me to (the )?celebration hall|open (the )?celebration hall|go to (the )?hall/.test(
      t,
    )
  ) {
    return {
      intent: { type: "open_hall" },
      placeId: "portfolio",
      memberFacingAck: "Your Hall of Accomplishments is ready when you are.",
    };
  }

  if (/play a gentle|gentle (celebration )?sound|gentle chime/.test(t)) {
    return {
      intent: { type: "play_gentle_sound" },
      placeId: null,
      memberFacingAck: "I can play a gentle chime — only if you want it.",
    };
  }

  if (/^no sound|without sound|don'?t play (a )?sound|quiet celebration/.test(t)) {
    return {
      intent: { type: "no_sound" },
      placeId: null,
      memberFacingAck: "No sound — we'll keep it quiet.",
    };
  }

  if (/what did i accomplish this month|accomplishments this month/.test(t)) {
    return {
      intent: { type: "list_accomplishments_month" },
      placeId: null,
      memberFacingAck: "I can look at what you've recognized this month.",
    };
  }

  if (/how (did|does) this move|moved (my |the )?business forward/.test(t)) {
    return {
      intent: { type: "explain_business_forward" },
      placeId: null,
      memberFacingAck: "I can explain from the real connections we already have.",
    };
  }

  if (/what did i learn|what (did|have) i discover/.test(t)) {
    return {
      intent: { type: "what_did_i_learn" },
      placeId: null,
      memberFacingAck: "We can look at what you learned — that belongs in Evidence.",
    };
  }

  if (
    /save (what i learned|this lesson|the learning)|evidence vault|save .* evidence/.test(
      t,
    )
  ) {
    return {
      intent: { type: "save_learning_evidence" },
      placeId: "evidence-vault",
      memberFacingAck: "I can save a real discovery in the Evidence Vault.",
    };
  }

  if (/who helped( me)?( solve)?/.test(t)) {
    return {
      intent: { type: "who_helped" },
      placeId: null,
      memberFacingAck: "If you captured who helped, that lives with the Evidence.",
    };
  }

  return {
    intent: { type: "unknown" },
    placeId: null,
    memberFacingAck: "I'm not sure yet — would you like a win, the Hall, or Evidence?",
  };
}
