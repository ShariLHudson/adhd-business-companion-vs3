import type { EstateSignId } from "@/lib/peacefulPlaces/signpostLayout";
import { gardenFlagPhotoFor } from "@/lib/peacefulPlaces/gardenFlagPhotos";

type Props = {
  id: EstateSignId;
};

/** Trail-marker photograph — framed on linen, moves with the cloth. */
export function GardenFlagPhoto({ id }: Props) {
  const photo = gardenFlagPhotoFor(id);

  return (
    <img
      className="pathway-garden-stake__photo"
      src={photo.src}
      alt=""
      draggable={false}
      style={{ objectPosition: photo.position }}
    />
  );
}
