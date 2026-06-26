import type { CompanionPlace } from "./types";
import type { CompanionHospitalityProfile } from "./libraries/hospitalityProfileLibrary";
import { activeTraditions, type HomeTradition } from "./libraries/traditionsLibrary";
import type { ResolvedHospitalityScene } from "@/lib/companionHospitalityPrototype";
import {
  resolveGuestPreparation,
  resolveVisitEnergy,
} from "@/lib/companionHospitalityProfile";
import { SHARI_HOME_ANCHORS } from "./hospitalityPrinciple";
import { SHARI_PERSONALITY_TRAITS } from "./libraries/personalityLibrary";
import { signatureObjectForPlace } from "./libraries/signatureObjectLibrary";

/**
 * Five-layer hospitality model.
 * The house never changes. The welcome does.
 */

export type Layer1Foundation = {
  layer: 1;
  name: "Foundation";
  tagline: "Never changes — unmistakably Shari's";
  place: CompanionPlace;
  signatureObject: string;
  anchors: readonly string[];
  personality: readonly string[];
};

export type Layer2Hospitality = {
  layer: 2;
  name: "Hospitality";
  tagline: "Prepared afresh each visit";
  drinks: string[];
  flowers: string[];
  books: string[];
  audio: string[];
  lighting: string;
  objects: string[];
  candles: boolean;
};

export type Layer3Conversation = {
  layer: 3;
  name: "Conversation";
  tagline: "Shari responds thoughtfully — the room stays the same";
  contextualLines: string[];
  greeting?: string;
  invite?: string;
};

export type Layer4Traditions = {
  layer: 4;
  name: "Traditions";
  tagline: "The home's calendar — not the guest's";
  active: HomeTradition[];
};

export type Layer5GuestHospitality = {
  layer: 5;
  name: "Guest Hospitality";
  tagline: "Gently woven in — the house doesn't become them";
  profileKey?: string;
  woven: string[];
  /** Explicit: we never changed foundation for the guest. */
  foundationUnchanged: true;
};

export type HospitalityLayers = {
  layer1: Layer1Foundation;
  layer2: Layer2Hospitality;
  layer3: Layer3Conversation;
  layer4: Layer4Traditions;
  layer5: Layer5GuestHospitality;
};

function drinkLabel(drink: string): string {
  const labels: Record<string, string> = {
    coffee: "Coffee",
    tea: "Tea",
    "hot-chocolate": "Hot chocolate",
    cider: "Apple cider",
    "tea-set": "Tea",
  };
  return labels[drink] ?? drink;
}

function weaveGuestHospitality(
  profile: CompanionHospitalityProfile,
): string[] {
  const woven: string[] = [];

  if (profile.favoriteDrink) {
    woven.push(`${drinkLabel(profile.favoriteDrink)} is waiting`);
  }
  if (profile.favoriteColor && profile.favoriteFlower) {
    woven.push(
      `Today's flowers lean ${profile.favoriteColor} — ${profile.favoriteFlower}`,
    );
  } else if (profile.favoriteColor) {
    woven.push(`Today's flowers lean ${profile.favoriteColor}`);
  }
  if (profile.lovesHummingbirds) {
    woven.push("A hummingbird feeder quietly appeared outside");
  }
  if (profile.lovesDogs) {
    woven.push("A dog is sleeping by the fireplace — not theirs, just because dogs make them smile");
  }
  if (profile.lovesCats) {
    woven.push("A cat is curled on the chair — quiet company");
  }
  if (profile.lovesGardening) {
    woven.push("Gardening book on the coffee table");
  }
  if (profile.lovesTravel) {
    woven.push("Travel magazine on the side table");
  }
  if (profile.lovesReading) {
    woven.push("A book left open where they'd notice");
  }
  if (profile.enjoysPuzzles) {
    woven.push("Puzzle set out for a quiet moment");
  }
  if (profile.prefersQuiet) {
    woven.push("Soft rain outside — room kept quiet");
  }

  return woven;
}

function conversationLinesFromProfile(
  profile: CompanionHospitalityProfile,
): string[] {
  const lines: string[] = [];

  if (profile.lovesGardening) {
    lines.push("The coneflowers finally started blooming outside.");
  }
  if (profile.lovesDogs) {
    lines.push("There's a dog sleeping by the fireplace today.");
  }
  if (profile.lovesBirds) {
    lines.push("The birds are especially lively outside the window.");
  }
  if (profile.lovesTravel) {
    lines.push("Only a few mornings until your adventure.");
  }
  if (profile.favoriteDrink === "tea") {
    lines.push("I remembered you love tea — it's ready when you are.");
  }
  if (profile.favoriteDrink === "coffee") {
    lines.push("Coffee's waiting — the way you like it.");
  }

  return lines;
}

function visitEnergyFromScene(
  scene: ResolvedHospitalityScene | undefined,
  profile: CompanionHospitalityProfile,
): ReturnType<typeof resolveVisitEnergy> {
  if (scene?.lifeEvent === "recovery") return "recovery";
  return resolveVisitEnergy({
    recoveryGentle: false,
    lowEnergy: false,
    timeOfDay: scene?.timeOfDay,
    weather: scene?.weather,
  });
}

export function resolveHospitalityLayers(input: {
  place: CompanionPlace;
  scene?: ResolvedHospitalityScene;
  profile?: CompanionHospitalityProfile;
  greeting?: string;
  invite?: string;
  now?: Date;
}): HospitalityLayers {
  const now = input.now ?? new Date();
  const profile = input.profile ?? {};
  const scene = input.scene;
  const signature = signatureObjectForPlace(input.place.id);
  const visitEnergy = visitEnergyFromScene(scene, profile);
  const guestPrep = resolveGuestPreparation({ profile, visitEnergy });

  const layer1: Layer1Foundation = {
    layer: 1,
    name: "Foundation",
    tagline: "Never changes — unmistakably Shari's",
    place: input.place,
    signatureObject: signature?.name ?? "Spark mug",
    anchors: SHARI_HOME_ANCHORS,
    personality: SHARI_PERSONALITY_TRAITS,
  };

  const sceneObjects = scene?.hospitality ?? [];

  const layer2: Layer2Hospitality = {
    layer: 2,
    name: "Hospitality",
    tagline: "Prepared afresh each visit",
    drinks: [guestPrep.drink],
    flowers: sceneObjects.filter((o) =>
      ["flowers", "tulips"].includes(o),
    ),
    books: scene?.books ?? [],
    audio: scene?.audio ?? [],
    lighting: scene?.lighting ?? input.place.lightingProfile,
    objects: [
      guestPrep.vesselLabel,
      ...sceneObjects.map((o) => o.replace(/-/g, " ")),
    ],
    candles: scene?.motion.includes("candle") ?? false,
  };

  const contextualLines = [
    guestPrep.line,
    ...conversationLinesFromProfile(profile),
  ].filter((line, index, list) => list.indexOf(line) === index);

  const layer3: Layer3Conversation = {
    layer: 3,
    name: "Conversation",
    tagline: "Shari responds thoughtfully — the room stays the same",
    contextualLines,
    greeting: input.greeting ?? scene?.greeting,
    invite: input.invite ?? scene?.invite,
  };

  const layer4: Layer4Traditions = {
    layer: 4,
    name: "Traditions",
    tagline: "The home's calendar — not the guest's",
    active: activeTraditions(now),
  };

  const layer5: Layer5GuestHospitality = {
    layer: 5,
    name: "Guest Hospitality",
    tagline: "Gently woven in — the house doesn't become them",
    profileKey: profile.guestKey,
    woven: [
      guestPrep.line,
      ...weaveGuestHospitality(profile),
    ].filter((line, index, list) => list.indexOf(line) === index),
    foundationUnchanged: true,
  };

  return { layer1, layer2, layer3, layer4, layer5 };
}
