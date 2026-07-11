/**
 * Global Audio Library — #181 Master Soundscape Inventory as the owned library.
 * Peaceful Places / Focus Audio may still use destination cards; this is the
 * authoritative AUD-### plate list for the Global Audio Player path.
 */

import {
  MASTER_SOUNDSCAPE_INVENTORY,
  MASTER_SOUNDSCAPE_MENU_GROUPS,
  masterSoundscapeById,
  masterSoundscapesForCategory,
  masterSoundscapesForMenuGroup,
  type MasterSoundscapeAsset,
  type MasterSoundscapeMenuGroup,
} from "./masterSoundscapeInventory";

export type GlobalAudioLibraryEntry = {
  id: MasterSoundscapeAsset["id"];
  title: string;
  category: MasterSoundscapeAsset["category"];
  playbackUrl: string;
  loops: boolean;
  signatureSceneHint: string;
  lengthLabel: string;
};

export function globalAudioLibraryEntries(): GlobalAudioLibraryEntry[] {
  return MASTER_SOUNDSCAPE_INVENTORY.map((asset) => ({
    id: asset.id,
    title: asset.displayName,
    category: asset.category,
    playbackUrl: asset.playbackUrl,
    loops: asset.loops,
    signatureSceneHint: asset.signatureSceneHint,
    lengthLabel: asset.lengthLabel,
  }));
}

export function globalAudioLibraryById(
  id: string,
): GlobalAudioLibraryEntry | undefined {
  const asset = masterSoundscapeById(id as MasterSoundscapeAsset["id"]);
  if (!asset) return undefined;
  return {
    id: asset.id,
    title: asset.displayName,
    category: asset.category,
    playbackUrl: asset.playbackUrl,
    loops: asset.loops,
    signatureSceneHint: asset.signatureSceneHint,
    lengthLabel: asset.lengthLabel,
  };
}

export function globalAudioLibraryMenu(
  group: MasterSoundscapeMenuGroup,
): GlobalAudioLibraryEntry[] {
  return masterSoundscapesForMenuGroup(group).map((asset) => ({
    id: asset.id,
    title: asset.displayName,
    category: asset.category,
    playbackUrl: asset.playbackUrl,
    loops: asset.loops,
    signatureSceneHint: asset.signatureSceneHint,
    lengthLabel: asset.lengthLabel,
  }));
}

export {
  MASTER_SOUNDSCAPE_INVENTORY,
  MASTER_SOUNDSCAPE_MENU_GROUPS,
  masterSoundscapeById,
  masterSoundscapesForCategory,
  masterSoundscapesForMenuGroup,
};
