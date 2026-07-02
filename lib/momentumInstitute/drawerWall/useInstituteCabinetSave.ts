"use client";

import { useCallback, useState } from "react";
import {
  cabinetFilingPrompt,
  fileInCabinet,
  type FileInCabinetInput,
} from "@/lib/momentumInstitute/cabinetStore";
import { getKnowledgeCardById } from "@/lib/momentumInstitute/catalog/provider";

export type InstituteCabinetSaveState = {
  saved: boolean;
  saving: boolean;
  error: string | null;
};

/**
 * My Institute Cabinet™ — save hook (Phase 1 placeholder wiring).
 */
export function useInstituteCabinetSave(knowledgeCardId: string | null) {
  const [state, setState] = useState<InstituteCabinetSaveState>({
    saved: false,
    saving: false,
    error: null,
  });

  const saveToCabinet = useCallback(
    (input?: Partial<FileInCabinetInput>) => {
      if (!knowledgeCardId) return;
      setState({ saved: false, saving: true, error: null });
      try {
        fileInCabinet({
          knowledgeCardId,
          ...input,
        });
        setState({ saved: true, saving: false, error: null });
      } catch (error) {
        setState({
          saved: false,
          saving: false,
          error:
            error instanceof Error ? error.message : "Could not save to cabinet.",
        });
      }
    },
    [knowledgeCardId],
  );

  return {
    ...state,
    saveToCabinet,
    filingPrompt: knowledgeCardId
      ? cabinetFilingPrompt(getKnowledgeCardById(knowledgeCardId)?.title ?? "this card")
      : null,
  };
}
