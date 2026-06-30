"use client";

import type { DeskObjectId } from "./types";

type DeskObjectsProps = {
  visible: boolean;
  openObject: DeskObjectId;
  onOpen: (id: Exclude<DeskObjectId, null>) => void;
};

export function DeskObjects({ visible, openObject, onOpen }: DeskObjectsProps) {
  if (!visible) return null;

  return (
    <div className="cw-desk-objects" aria-label="Desk resources">
      <button
        type="button"
        className={`cw-desk-object cw-desk-object--folio${openObject === "folio" ? " cw-desk-object--active" : ""}`}
        onClick={() => onOpen("folio")}
        aria-label="Open leather folio"
      />
      <button
        type="button"
        className={`cw-desk-object cw-desk-object--journal${openObject === "journal" ? " cw-desk-object--active" : ""}`}
        onClick={() => onOpen("journal")}
        aria-label="Open business journal"
      />
      <button
        type="button"
        className={`cw-desk-object cw-desk-object--blueprint${openObject === "blueprint" ? " cw-desk-object--active" : ""}`}
        onClick={() => onOpen("blueprint")}
        aria-label="Open blueprint folder"
      />
    </div>
  );
}
