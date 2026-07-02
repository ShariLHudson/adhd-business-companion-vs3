export type WelcomeHomeFirstChoice = "know" | "tour" | "surprise";

export type WelcomeHomeInvitation = {
  id: WelcomeHomeFirstChoice;
  title: string;
  subtitle: string;
};

export const WELCOME_HOME_SHARI_QUESTION =
  "What would you like to do today?" as const;

export const WELCOME_HOME_INVITATIONS: WelcomeHomeInvitation[] = [
  {
    id: "know",
    title: "I know what I want to do",
    subtitle: "Just tell me.",
  },
  {
    id: "tour",
    title: "Show me around the Estate",
    subtitle: "Take the guided tour.",
  },
  {
    id: "surprise",
    title: "Surprise me",
    subtitle: "Introduce me to something wonderful.",
  },
];
