/**
 * Facebook Community domain detection for Create / Anywhere-Origin (587–598).
 * Leaves plain "Facebook post" content requests to the existing Social
 * Content / Facebook Post catalog path — only claims group/community wording.
 */

const FACEBOOK_COMMUNITY_RE =
  /\bfacebook\s+(?:group|community|groups)\b|\bfb\s+group\b|\b(?:build|start|create|launch|grow)\s+(?:a |an |my )?(?:community|group)\s+(?:on\s+facebook|for\s+(?:my\s+)?(?:clients|members|customers|business))\b|\bturn\s+this\s+(?:project|offer)\s+into\s+a\s+facebook\s+(?:group|community)\b/i;

/**
 * True when the request should resolve through UWE Facebook Community Work Type.
 * Does not claim every use of the word "facebook" (e.g. "write a Facebook post").
 */
export function isFacebookCommunityCreationRequest(userText: string): boolean {
  const t = userText.trim();
  if (!t) return false;
  return FACEBOOK_COMMUNITY_RE.test(t);
}
