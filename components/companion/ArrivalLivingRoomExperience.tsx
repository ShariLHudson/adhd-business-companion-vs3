"use client";

import { useCallback } from "react";
import type { ArrivalIntelligence } from "@/lib/arrivalIntelligence";
import {
  useArrivalExperience,
  type ArrivalRecommendation,
  type HospitalityResponse,
} from "@/lib/arrivalExperience";
import type { AppSection } from "@/lib/companionUi";
import { CompanionWelcomeScene } from "@/components/companion/CompanionWelcomeScene";
import { WelcomeLivingRoomInput } from "@/components/companion/WelcomeLivingRoomInput";
import { isDayStateFromToday } from "@/lib/dayReality";
import { getDayState } from "@/lib/companionStore";

function mergeLivingHospitality(
  life: HospitalityResponse | undefined,
  tone: HospitalityResponse,
): HospitalityResponse {
  return {
    showBlanket: Boolean(life?.showBlanket || tone.showBlanket),
    showMugSteam: tone.showMugSteam && (life?.showMugSteam ?? true),
    warmLamp: Boolean(life?.warmLamp || tone.warmLamp),
    closeCurtains: Boolean(life?.closeCurtains || tone.closeCurtains),
  };
}

type Props = {
  arrival: ArrivalIntelligence;
  input: string;
  isLoading: boolean;
  isListening: boolean;
  speechSupported: boolean;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  onInputChange: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onToggleListening: () => void;
  onImmersionNav: (hidden: boolean) => void;
  onWalkComplete: (section: AppSection) => void;
  onStayAndChat: () => void;
  onSend: () => void;
};

export function ArrivalLivingRoomExperience({
  arrival,
  input,
  isLoading,
  isListening,
  speechSupported,
  inputRef,
  onInputChange,
  onKeyDown,
  onToggleListening,
  onImmersionNav,
  onWalkComplete,
  onStayAndChat,
  onSend,
}: Props) {
  const handleWalk = useCallback(
    (recommendation: ArrivalRecommendation) => {
      if (recommendation.stayInLivingRoom) {
        onStayAndChat();
        return;
      }
      onWalkComplete(recommendation.section);
    },
    [onStayAndChat, onWalkComplete],
  );

  const experience = useArrivalExperience(arrival, onImmersionNav, handleWalk);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;

    if (experience.showRealityQuestion && experience.beat === "reality") {
      experience.submitReality(trimmed);
      onInputChange("");
      return;
    }

    onInputChange("");
    onSend();
  }, [
    experience,
    input,
    onInputChange,
    onSend,
  ]);

  const handleKeyDownWrapped = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSend();
        return;
      }
      onKeyDown(event);
    },
    [handleSend, onKeyDown],
  );

  const handleDecline = useCallback(() => {
    experience.declineRecommendation();
    onStayAndChat();
  }, [experience, onStayAndChat]);

  const handleStay = useCallback(() => {
    experience.stayHere();
    onStayAndChat();
  }, [experience, onStayAndChat]);

  const cached = getDayState();
  const showSameAsYesterday =
    experience.showRealityQuestion &&
    Boolean(cached) &&
    !isDayStateFromToday(cached);

  const lifeHospitality = arrival.livingRoom?.livingChangeSet?.hospitality;
  const hospitality = mergeLivingHospitality(
    lifeHospitality,
    experience.hospitality,
  );

  return (
    <CompanionWelcomeScene
      greeting={experience.greeting}
      invite={experience.realityQuestion}
      echoLine={experience.echo}
      recommendation={experience.recommendation}
      hospitality={hospitality}
      showGreeting={experience.showGreeting}
      showInvite={experience.showRealityQuestion}
      showEcho={experience.showEcho}
      showRecommendation={experience.showInvite}
      showInput={experience.showInput}
      communicationAnchorMode={experience.communicationAnchorMode}
      walking={experience.walking}
      onAcceptRecommendation={experience.acceptRecommendation}
      onDeclineRecommendation={handleDecline}
      onStayHere={handleStay}
      onSameAsYesterday={experience.sameAsYesterday}
      showSameAsYesterday={showSameAsYesterday}
      livingRoom={arrival.livingRoom}
      timeOfDay={arrival.timeOfDay}
    >
      <WelcomeLivingRoomInput
        input={input}
        isLoading={isLoading}
        isListening={isListening}
        speechSupported={speechSupported}
        inputRef={inputRef}
        onInputChange={onInputChange}
        onKeyDown={handleKeyDownWrapped}
        onToggleListening={onToggleListening}
        onSend={handleSend}
        conversationMode
        mode={experience.communicationAnchorMode}
        listeningPlaceholder={
          experience.showRealityQuestion
            ? "A few words is enough."
            : arrival.chatPlaceholder
        }
      />
    </CompanionWelcomeScene>
  );
}
