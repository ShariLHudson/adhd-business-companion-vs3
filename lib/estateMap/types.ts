export type EstateMapLocation = {
  id: string;
  name: string;
  image: string;
  mood: string;
  /** Organic placement — percent of map canvas */
  x: number;
  y: number;
  /** Card width in rem */
  width: number;
  /** Slight tilt, degrees */
  rotation: number;
  /** Anchor location — slightly larger when true */
  anchor?: boolean;
};

export type EstateMapFullScreenProps = {
  open: boolean;
  onClose: () => void;
  locations: EstateMapLocation[];
  /** Current environment id — shows “You are here” */
  currentLocationId?: string;
  onSelectLocation?: (location: EstateMapLocation) => void;
};
