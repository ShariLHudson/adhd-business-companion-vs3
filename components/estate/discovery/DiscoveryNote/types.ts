import type { DiscoveryNoteData } from "@/lib/estateDiscovery/types";

export type DiscoveryNoteProps = {
  data: DiscoveryNoteData;
  open: boolean;
  unlocking?: boolean;
  onPrimaryAction?: () => void;
  onSaveForLater?: () => void;
  onClose?: () => void;
};

export type { DiscoveryNoteData };
