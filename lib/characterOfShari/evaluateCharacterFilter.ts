import { violatesShariVoice } from "@/lib/shariVoiceBible";
import type {
  CharacterCheck,
  CharacterFilterContext,
  CharacterVerdict,
} from "./types";
import { violatesCharacterRole, violatesCharacterVoice } from "./rules";

function check(
  id: CharacterCheck["id"],
  passed: boolean,
  reason?: string,
): CharacterCheck {
  return { id, passed, reason };
}

function verdict(
  content: string | null,
  checks: CharacterCheck[],
  reason: string | null,
  violatedRole?: string | null,
): CharacterVerdict {
  const authentic = checks.every((c) => c.passed);
  return {
    authentic,
    content: authentic ? content : null,
    checks,
    reason: authentic ? null : reason,
    violatedRole: authentic ? null : violatedRole,
  };
}

/**
 * Character Filter — "Would the real Shari do this?"
 */
export function evaluateCharacterFilter(
  content: string | null,
  context: CharacterFilterContext,
): CharacterVerdict {
  if (!content?.trim()) {
    return verdict(
      null,
      [check("would_smile_instead", true, "silence is in character")],
      null,
    );
  }

  const text = content.trim();
  const roleViolation = violatesCharacterRole(text);

  if (violatesCharacterVoice(text) || violatesShariVoice(text)) {
    return verdict(
      null,
      [
        check("would_say", false, roleViolation ?? "out of character"),
        check("would_notice", false),
      ],
      roleViolation
        ? `Shari is not a ${roleViolation.replace(/_/g, " ")}`
        : "Not authentic to Shari",
      roleViolation,
    );
  }

  switch (context.kind) {
    case "question":
      if (context.presencePreferSilence || context.recoveryGentle) {
        return verdict(
          null,
          [
            check("would_remain_quiet", false, "Shari would smile instead"),
            check("would_smile_instead", true),
          ],
          "She wouldn't push a question right now",
        );
      }
      return verdict(
        text,
        [
          check("would_say", true),
          check("would_remain_quiet", true),
          check("would_smile_instead", true),
        ],
        null,
      );

    case "room_recommendation":
      return verdict(
        text,
        [
          check("would_recommend", true),
          check("would_say", true),
        ],
        null,
      );

    case "room_preparation":
      return verdict(
        text,
        [check("would_prepare_this_way", true)],
        null,
      );

    case "observation":
      return verdict(
        text,
        [
          check("would_notice", true),
          check("would_say", true),
        ],
        null,
      );

    case "silence":
      return verdict(
        null,
        [check("would_smile_instead", true)],
        null,
      );

    case "spoken_line":
    default:
      return verdict(
        text,
        [check("would_say", true)],
        null,
      );
  }
}

export function passesCharacterFilter(
  content: string | null,
  context: CharacterFilterContext,
): boolean {
  return evaluateCharacterFilter(content, context).authentic;
}
