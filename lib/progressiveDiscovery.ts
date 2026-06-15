/** @deprecated Use @/lib/companionDiscovery — re-exports for backward compatibility. */
import {
  disableDiscovery,
  discoveryDisabled,
  enableDiscovery,
  nextProgressiveQuestion,
  recordDiscoveryAnswer,
  skipDiscoveryForSession,
  type DiscoveryQuestion,
  type DiscoveryQuestionId,
} from "@/lib/companionDiscovery";

export {
  disableDiscovery,
  discoveryDisabled,
  enableDiscovery,
  recordDiscoveryAnswer,
  skipDiscoveryForSession,
  type DiscoveryQuestion,
};

export type DiscoveryTopicId = DiscoveryQuestionId;

/** @deprecated Pass hasMeaningfulUsage via companionDiscovery.nextProgressiveQuestion */
export function nextDiscoveryQuestion(now?: Date): DiscoveryQuestion | null {
  return nextProgressiveQuestion({ hasMeaningfulUsage: true, now });
}
