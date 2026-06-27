/**
 * Meaning Before Matching — account/integration intent only.
 * "connect" alone is not Connections routing.
 */

export const ROUTING_CONFIDENCE_THRESHOLD = 0.85;

export type IntegrationIntentResult = {
  isIntegration: boolean;
  confidence: number;
  clarification: string | null;
};

const INTEGRATION_POSITIVE: { re: RegExp; confidence: number }[] = [
  {
    re: /\bconnect (?:my )?google(?:\s+(?:calendar|drive|gmail|account))?\b/i,
    confidence: 1,
  },
  {
    re: /\b(?:link|sync|connect) (?:my )?(?:gmail|google calendar|google drive|google account)\b/i,
    confidence: 1,
  },
  {
    re: /\bset up (?:my )?google (?:account|integration)\b/i,
    confidence: 1,
  },
  {
    re: /\bconnect (?:my )?(?:email|calendar|drive) to (?:the )?app\b/i,
    confidence: 1,
  },
  {
    re: /\bconnect (?:my )?social account to (?:the )?app\b/i,
    confidence: 1,
  },
  {
    re: /\blink my google account\b/i,
    confidence: 1,
  },
  {
    re: /\b(?:google|gmail|drive) integration\b/i,
    confidence: 0.95,
  },
  {
    re: /\bsync my calendar\b/i,
    confidence: 0.9,
  },
  {
    re: /\bconnect my (?:google )?calendar\b/i,
    confidence: 1,
  },
  {
    re: /\bconnect my (?:google )?gmail\b/i,
    confidence: 1,
  },
  {
    re: /\bconnect my (?:google )?drive\b/i,
    confidence: 1,
  },
  {
    re: /\bconnect (?:my )?email to (?:the )?app\b/i,
    confidence: 1,
  },
];

/** Non-integration "connect" — teach, market, or reason instead of Settings. */
const INTEGRATION_EXCLUSIONS: RegExp[] = [
  /\bconnect (?:my |the )?(?:website|web )?link\b/i,
  /\bconnect (?:with )?(?:people|more people|audience|customers|clients|followers)\b/i,
  /\bconnect (?:these |my )?ideas\b/i,
  /\bconnect the dots\b/i,
  /\bconnect (?:my )?offer\b/i,
  /\bpinterest\b/i,
  /\blinkedin\b/i,
  /\bconnect (?:my )?(?:microphone|mic|camera)\b/i,
  /\bconnect (?:this )?story\b/i,
  /\bconnect (?:my )?(?:pin|board|brand)\b/i,
  /\bhow do i connect\b.*\b(?:post|pin|board|brand|website|link)\b/i,
];

function connectClarification(text: string): string {
  if (/\bpinterest\b/i.test(text)) {
    return "Do you mean connect an account to the app, or add your website link to a Pinterest post?";
  }
  if (/\blinkedin\b/i.test(text)) {
    return "Do you mean connect an account to the app, or connect with people on LinkedIn?";
  }
  if (/\bideas\b/i.test(text)) {
    return "Do you mean connect an account to the app, or help connecting ideas together?";
  }
  return "Do you mean connect an account to the app, or something else you're trying to do?";
}

export function evaluateIntegrationIntent(text: string): IntegrationIntentResult {
  const t = text.trim();
  if (!t) {
    return { isIntegration: false, confidence: 0, clarification: null };
  }

  for (const exclusion of INTEGRATION_EXCLUSIONS) {
    if (exclusion.test(t)) {
      return { isIntegration: false, confidence: 0, clarification: null };
    }
  }

  let confidence = 0;
  for (const positive of INTEGRATION_POSITIVE) {
    if (positive.re.test(t)) {
      confidence = Math.max(confidence, positive.confidence);
    }
  }

  if (confidence >= ROUTING_CONFIDENCE_THRESHOLD) {
    return { isIntegration: true, confidence, clarification: null };
  }

  if (/\bconnect\b/i.test(t)) {
    return {
      isIntegration: false,
      confidence,
      clarification: connectClarification(t),
    };
  }

  if (/\b(?:google|integration|sync)\b/i.test(t) && confidence > 0) {
    return {
      isIntegration: false,
      confidence,
      clarification:
        "Do you mean connect an account to the app, or something else?",
    };
  }

  return { isIntegration: false, confidence, clarification: null };
}

export function shouldRouteToConnectionsSettings(text: string): boolean {
  return evaluateIntegrationIntent(text).isIntegration;
}
