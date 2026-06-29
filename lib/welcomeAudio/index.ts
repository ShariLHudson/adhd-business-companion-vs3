export { chunkSpeechText } from "./chunkSpeechText";
export { fadeAudioVolume, fadeAudioVolumeAsync } from "./fadeVolume";
export {
  registerWelcomeAudioProfile,
  resolveWelcomeAudioProfile,
  WELCOME_ROOM_AUDIO_PROFILE,
} from "./profiles";
export type {
  WelcomeAmbienceTrack,
  WelcomeAudioProfile,
  WelcomeVoiceTrack,
  WelcomeVoiceTransportState,
} from "./types";
export { WelcomeAudioManager } from "./WelcomeAudioManager";
export { useWelcomeAudioExperience } from "./useWelcomeAudioExperience";
export {
  attachWelcomeRoomAudioManager,
  destroyWelcomeRoomAudioManager,
  primeWelcomeRoomAudioFromGesture,
} from "./welcomeRoomAudioSession";
export {
  WELCOME_ROOM_GREETING_AUDIO_SRC,
  WELCOME_ROOM_FULL_WELCOME_AUDIO_SRC,
  WELCOME_ROOM_WELCOME_AUDIO_PARTS,
} from "./welcomeVoiceCache";
