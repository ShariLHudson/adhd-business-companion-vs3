export type CanonEstateFacts = {
  nature: string;
  purpose: string;
  location: string;
  inspiration: string;
  role: string;
  isRealPlace: boolean;
  identityAnswer: string;
  purposeAnswer: string;
  realPlaceAnswer: string;
  locationAnswer: string;
  creatorAnswer: string;
  fictionVsReality: string[];
};

export type CanonCharacterFacts = {
  name: string;
  species: string;
  relationship: string;
  traits: string[];
  pictureAnswer: string;
  identifyAnswer: string;
};

export type CanonShariFacts = {
  name: string;
  roles: string[];
  inspirationRole: string;
  identifyAnswer: string;
};

export type CanonContextPayload = {
  estate: {
    facts: CanonEstateFacts;
    rooms: string[];
    liveRooms: Array<{
      id: string;
      name: string;
      purpose: string;
      description: string;
    }>;
    history: string[];
    philosophy: string[];
  };
  characters: {
    kinsey: CanonCharacterFacts;
    shari: CanonShariFacts;
  };
  matchedTopics: CanonTopic[];
  retrievalNotes: string[];
};

export type CanonTopic =
  | "estate"
  | "estate_identity"
  | "estate_reality"
  | "estate_location"
  | "estate_creator"
  | "estate_purpose"
  | "kinsey"
  | "kinsey_picture"
  | "shari"
  | "rooms";

export type CanonRetrievalInput = {
  userText: string;
  roomId?: string | null;
};

export type CanonRetrievalResult = {
  payload: CanonContextPayload;
  topics: CanonTopic[];
};
