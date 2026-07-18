/**
 * Package 208 — pre-send certification: conversation quality + topic fidelity.
 */

import {
  containsGenericConversationTemplate,
  failsHumanLanguageTest,
} from "./genericTemplateBan";
import { passesFriendTest } from "./naturalVoice";
import { responseCentersOnRejectedBackground } from "./topicDiscipline";

export type NaturalConversationFailure =
  | "GENERIC_TEMPLATE"
  | "ARTIFICIAL_VOICE"
  | "TOPIC_FIDELITY"
  | "FRIEND_TEST";

export type NaturalConversationResult = {
  passed: boolean;
  failures: NaturalConversationFailure[];
};

export function certifyNaturalConversation(input: {
  responseText: string;
  activeTopic?: string | null;
  rejectedSubjects?: readonly string[];
}): NaturalConversationResult {
  const failures: NaturalConversationFailure[] = [];
  const text = input.responseText.trim();

  if (!text) {
    return { passed: false, failures: ["ARTIFICIAL_VOICE"] };
  }

  if (containsGenericConversationTemplate(text)) {
    failures.push("GENERIC_TEMPLATE");
  }
  if (failsHumanLanguageTest(text)) {
    failures.push("ARTIFICIAL_VOICE");
  }
  if (!passesFriendTest(text)) {
    failures.push("FRIEND_TEST");
  }
  if (
    responseCentersOnRejectedBackground({
      responseText: text,
      activeTopic: input.activeTopic,
      rejectedSubjects: input.rejectedSubjects,
    })
  ) {
    failures.push("TOPIC_FIDELITY");
  }

  const unique = [...new Set(failures)];
  return { passed: unique.length === 0, failures: unique };
}
