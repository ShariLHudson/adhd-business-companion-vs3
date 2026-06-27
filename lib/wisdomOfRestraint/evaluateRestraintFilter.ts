import type {
  RestraintCheck,
  RestraintContext,
  RestraintVerdict,
} from "./types";
import {
  asksWhyAfterAbsence,
  violatesRestraintVoice,
} from "./rules";
import { toneNeedsSittingFirst } from "./resolveUserExpressedNeed";

function check(
  id: RestraintCheck["id"],
  passed: boolean,
  reason?: string,
): RestraintCheck {
  return { id, passed, reason };
}

function verdict(
  content: string | null,
  checks: RestraintCheck[],
  reason: string | null,
): RestraintVerdict {
  const allowed = checks.every((c) => c.passed);
  return {
    allowed,
    content: allowed ? content : null,
    checks,
    reason: allowed ? null : reason,
  };
}

/**
 * Restraint Filter — every outgoing interaction passes through here.
 * "Would a caring human actually say or do this right now?"
 */
export function evaluateRestraintFilter(
  content: string | null,
  context: RestraintContext,
): RestraintVerdict {
  if (!content?.trim()) {
    return verdict(null, [check("necessary", false, "nothing to say")], "silence");
  }

  const text = content.trim();
  const checks: RestraintCheck[] = [];

  if (violatesRestraintVoice(text)) {
    checks.push(
      check("shari_would_say", false, "performance or surveillance voice"),
      check("no_pressure", false),
      check("reduces_stress", false),
    );
    return verdict(
      null,
      checks,
      "Would not impress or monitor — silence is better",
    );
  }

  if (asksWhyAfterAbsence(text, context.returnIntervalDays)) {
    checks.push(
      check("kind", false, "long absence — welcome, never interrogate"),
      check("right_time", false),
    );
    return verdict(null, checks, "Simply welcome them back");
  }

  switch (context.kind) {
    case "question":
    case "curiosity_probe": {
      if (context.presencePreferSilence) {
        checks.push(
          check("silence_better", false, "kin visit — room speaks first"),
          check("necessary", false),
        );
        return verdict(null, checks, "Silence is hospitality");
      }
      if (context.recoveryGentle || context.lowEnergy) {
        checks.push(
          check("right_time", false, "gentle day — no extra asks"),
          check("reduces_stress", false),
        );
        return verdict(null, checks, "Sit with them first");
      }
      if (
        context.tone &&
        toneNeedsSittingFirst(context.tone) &&
        !context.userExpressedNeed
      ) {
        checks.push(
          check("right_time", false, "emotional timing — be with them"),
          check("necessary", false),
        );
        return verdict(null, checks, "Not the right moment for a question");
      }
      checks.push(
        check("necessary", true),
        check("kind", true),
        check("right_time", true),
        check("not_too_much", true),
        check("shari_would_say", true),
        check("reduces_stress", true),
        check("no_pressure", true),
        check("silence_better", true),
      );
      return verdict(text, checks, null);
    }

    case "room_recommendation": {
      if (context.fromContinueResolution) {
        checks.push(
          check("necessary", true, "guest already chose to continue"),
          check("kind", true),
          check("right_time", true),
          check("not_too_much", true),
          check("shari_would_say", true),
          check("reduces_stress", true),
          check("no_pressure", true),
          check("silence_better", true),
        );
        return verdict(text, checks, null);
      }
      if (!context.userExpressedNeed) {
        checks.push(
          check("necessary", false, "no expressed need — stay in this room"),
          check("not_too_much", false),
        );
        return verdict(null, checks, "Stay in the current room");
      }
      checks.push(
        check("necessary", true),
        check("kind", true),
        check("right_time", true),
        check("not_too_much", true),
        check("shari_would_say", true),
        check("reduces_stress", true),
        check("no_pressure", true),
        check("silence_better", true),
      );
      return verdict(text, checks, null);
    }

    case "planning_nudge":
    case "celebration_redirect": {
      checks.push(
        check("necessary", false, "do not optimize or redirect uninvited"),
        check("right_time", false),
      );
      return verdict(null, checks, "One caring response — not a redirect");
    }

    case "memory_mention": {
      checks.push(
        check("shari_would_say", false, "room may reflect care — mouth stays quiet"),
        check("necessary", false),
      );
      return verdict(null, checks, "Never perform memory");
    }

    case "performance_display": {
      checks.push(check("no_pressure", false), check("shari_would_say", false));
      return verdict(null, checks, "Never try to impress");
    }

    case "spoken_line":
    default: {
      checks.push(
        check("necessary", true),
        check("kind", true),
        check("right_time", true),
        check("not_too_much", true),
        check("shari_would_say", true),
        check("reduces_stress", true),
        check("no_pressure", true),
        check("silence_better", true),
      );
      return verdict(text, checks, null);
    }
  }
}

export function passesRestraintFilter(
  content: string | null,
  context: RestraintContext,
): boolean {
  return evaluateRestraintFilter(content, context).allowed;
}
