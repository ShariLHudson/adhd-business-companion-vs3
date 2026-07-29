/**
 * Shared Create vocabulary — NOT a classifier.
 *
 * The existing canonical classifiers (isExplicitCreationRequest, wantsCreate,
 * hasCreateIntent) consume these two predicates so that:
 *   1. a create verb only counts when paired with a real deliverable object, and
 *   2. a sentence that REJECTS Create never counts as a create request just
 *      because it contains the word "create".
 *
 * No routing decisions live here — only shared recognition of deliverable nouns
 * and Create-rejection phrasing. This is reuse, not a parallel classifier.
 */

/**
 * Concrete deliverable / artifact nouns. Kept deliberately concrete — vague words
 * like "message", "content", "copy", or "thing" are excluded so ordinary talk
 * ("make this message clearer") is not mistaken for a create request.
 */
export const CREATE_DELIVERABLE_RE =
  /\b(?:document|google\s+doc|spreadsheet|email|letter|proposal|business\s+plan|marketing\s+plan|content\s+plan|\bplan\b|checklist|worksheet|report|presentation|slide\s+deck|slides?|deck|\bpost\b|social\s+post|article|blog\s+post|\bblog\b|newsletter|caption|script|outline|\bsop\b|standard\s+operating\s+procedure|template|\bdraft\b|\bfile\b|form|questionnaire|workflow|funnel|lead\s+magnet|landing\s+page|sales\s+page|\boffer\b|(?:follow-?up|nurture|sales|email)\s+sequence|contract|invoice|agenda|memo|cover\s+letter|r[eé]sum[eé]|resume|ebook|guide|one[-\s]pager|pitch\s+deck|client\s+avatar|\bavatar\b|policy|brochure|flyer)\b/i;

/** True when the message names a concrete deliverable/artifact to produce. */
export function mentionsCreateDeliverable(text: string): boolean {
  return CREATE_DELIVERABLE_RE.test(text);
}

/**
 * The member is rejecting Create or asking to stay in conversation. Such a
 * sentence must classify as NOT-Create even though it may contain "create".
 */
export const CREATE_REJECTION_RE =
  /(?:\b(?:i\s+)?(?:do\s*n['’]?t|don['’]?t)\s+(?:need|want)\s+(?:to\s+(?:open|use|go\s+to)\s+)?(?:the\s+)?create\b)|(?:\b(?:do\s*n['’]?t|don['’]?t|please\s+do\s*n['’]?t)\s+(?:open|use|go\s+to|take\s+me\s+to|send\s+me\s+to)\s+(?:the\s+)?create\b)|(?:\bstop\s+(?:taking|sending|opening)\b[^.]*\bcreate\b)|(?:\bnot\s+the\s+create\s+room\b)|(?:\bno\s+create\s+room\b)|(?:\bstay\s+(?:right\s+)?here\b)|(?:\bstay\s+in\s+(?:the\s+)?(?:conversation|chat)\b)|(?:\bjust\s+(?:answer|talk|keep\s+talking)\s+(?:me\s+|to\s+me\s+)?(?:right\s+)?here\b)|(?:\banswer\s+(?:me\s+)?(?:right\s+)?here\b)|(?:\bkeep\s+(?:this|us|it)\s+in\s+(?:the\s+)?(?:conversation|chat)\b)/i;

/** True when the message rejects Create / asks to remain in conversation. */
export function isCreateRejection(text: string): boolean {
  return CREATE_REJECTION_RE.test(text.trim());
}
