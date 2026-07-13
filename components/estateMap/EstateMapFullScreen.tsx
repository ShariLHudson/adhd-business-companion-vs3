"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { EstateMapFullScreenProps, EstateMapLocation } from "@/lib/estateMap/types";
import "./estate-map-full-screen.css";

type LocationCardProps = {
  location: EstateMapLocation;
  isHere: boolean;
  onSelect: (location: EstateMapLocation) => void;
};

function LocationCard({ location, isHere, onSelect }: LocationCardProps) {
  return (
    <button
      type="button"
      className={`emfs-card${location.anchor ? " emfs-card--anchor" : ""}${isHere ? " emfs-card--here" : ""}`}
      style={{
        left: `${location.x}%`,
        top: `${location.y}%`,
        width: `${location.width}rem`,
        transform: `translate(-50%, -50%) rotate(${location.rotation}deg)`,
      }}
      onClick={() => onSelect(location)}
      aria-label={`${location.name}. ${location.mood}`}
    >
      <span className="emfs-card__frame">
        <Image
          src={location.image}
          alt=""
          fill
          sizes="(max-width: 768px) 40vw, 180px"
          className="emfs-card__image"
          draggable={false}
        />
      </span>
      <span className="emfs-card__caption">
        <span className="emfs-card__name">{location.name}</span>
        <span className="emfs-card__mood">{location.mood}</span>
      </span>
      {isHere && <span className="emfs-card__here">You are here</span>}
    </button>
  );
}

export function EstateMapFullScreen({
  open,
  onClose,
  locations,
  currentLocationId,
  onSelectLocation,
}: EstateMapFullScreenProps) {
  const [visible, setVisible] = useState(false);
  const [entering, setEntering] = useState<EstateMapLocation | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      setEntering(null);
      return;
    }
    const frame = window.requestAnimationFrame(() => setVisible(true));
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (entering) setEntering(null);
        else onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, entering, onClose]);

  const handleSelect = useCallback(
    (location: EstateMapLocation) => {
      setEntering(location);
      window.setTimeout(() => {
        onSelectLocation?.(location);
        setEntering(null);
        onClose();
      }, 1100);
    },
    [onClose, onSelectLocation],
  );

  const handleRecenter = useCallback(() => {
    mapRef.current?.scrollTo({ left: 0, top: 0, behavior: "smooth" });
  }, []);

  if (!open && !visible) return null;

  return (
    <div
      className={`emfs-root${visible ? " emfs-root--visible" : ""}${entering ? " emfs-root--entering" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Explore Spark"
    >
      <div className="emfs-parchment">
        <header className="emfs-toolbar">
          <div className="emfs-toolbar__title">
            <h1>Explore Spark</h1>
            <p>A memory map of places you belong</p>
          </div>
          <div className="emfs-toolbar__actions">
            <button type="button" className="emfs-toolbar__btn" onClick={handleRecenter}>
              Recenter
            </button>
            <button type="button" className="emfs-toolbar__btn emfs-toolbar__btn--primary" onClick={onClose}>
              Fold map
            </button>
          </div>
        </header>

        <div className="emfs-canvas-wrap" ref={mapRef}>
          <div className="emfs-canvas" aria-label="Estate locations">
            {locations.map((location) => (
              <LocationCard
                key={location.id}
                location={location}
                isHere={location.id === currentLocationId}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </div>
      </div>

      {entering && (
        <div className="emfs-enter" aria-hidden>
          <div
            className="emfs-enter__image"
            style={{ backgroundImage: `url(${entering.image})` }}
          />
          <p className="emfs-enter__label">Stepping into {entering.name}…</p>
        </div>
      )}
    </div>
  );
}
