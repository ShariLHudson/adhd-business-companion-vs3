import type { ObjectSeed } from "./builder";

/** Seasonal objects — natural evolution, never decorative-only holiday clutter. */
export const SEASONAL_OBJECT_SEEDS: ObjectSeed[] = [
  { id: "obj-winter-mug-variant", name: "Winter mug with steam", emotionalPurpose: "Cold-day welcome", collection: "seasonal", primaryRoom: "kitchen-table", material: "ceramic", animationCapability: true, animation: "steam", seasonalVariants: ["winter-only"] },
  { id: "obj-summer-flowers-variant", name: "Summer wildflowers", emotionalPurpose: "Peak bloom", collection: "seasonal", primaryRoom: "kitchen-table", material: "cotton", seasonalVariants: ["summer-only"] },
  { id: "obj-autumn-leaves-bowl", name: "Autumn leaves in bowl", emotionalPurpose: "Letting go", collection: "seasonal", primaryRoom: "living-room", material: "wood", seasonalVariants: ["autumn-only"] },
  { id: "obj-holiday-candles", name: "Holiday candles", emotionalPurpose: "Gathered light", collection: "seasonal", primaryRoom: "living-room", material: "cotton", animationCapability: true, animation: "flicker", seasonalVariants: ["winter-holiday"] },
  { id: "obj-fresh-herbs-sill", name: "Fresh herbs on sill", emotionalPurpose: "Cooking season", collection: "seasonal", primaryRoom: "kitchen-table", material: "pottery", seasonalVariants: ["spring-summer"] },
  { id: "obj-pumpkin-porch", name: "Pumpkins on porch", emotionalPurpose: "Harvest threshold", collection: "seasonal", primaryRoom: "front-porch", material: "cotton", seasonalVariants: ["autumn-only"] },
  { id: "obj-bird-feeder-winter", name: "Winter bird feeder", emotionalPurpose: "Feed the cold", collection: "seasonal", primaryRoom: "garden", material: "wood", seasonalVariants: ["winter-only"] },
  { id: "obj-seasonal-wreath-door", name: "Seasonal door wreath", emotionalPurpose: "Season at the door", collection: "seasonal", primaryRoom: "front-porch", material: "cotton", seasonalVariants: ["spring", "summer", "autumn", "winter"] },
  { id: "obj-spring-rain-boots", name: "Rain boots by door", emotionalPurpose: "April mud honest", collection: "seasonal", primaryRoom: "front-porch", material: "cotton", seasonalVariants: ["spring-only"] },
  { id: "obj-summer-picnic-basket", name: "Picnic basket", emotionalPurpose: "Eat outside", collection: "seasonal", primaryRoom: "back-deck", material: "wicker", seasonalVariants: ["summer-only"] },
  { id: "obj-autumn-quilt-drape", name: "Autumn quilt on chair", emotionalPurpose: "Layer up", collection: "seasonal", primaryRoom: "living-room", material: "wool", seasonalVariants: ["autumn-only"] },
  { id: "obj-winter-mittens", name: "Mittens drying", emotionalPurpose: "Came in from cold", collection: "seasonal", primaryRoom: "front-porch", material: "wool", seasonalVariants: ["winter-only"] },
  { id: "obj-spring-seedlings", name: "Seedling trays", emotionalPurpose: "Starting again", collection: "seasonal", primaryRoom: "greenhouse", material: "pottery", seasonalVariants: ["spring-only"] },
  { id: "obj-summer-hydrangea", name: "Hydrangea in vase", emotionalPurpose: "Blue summer", collection: "seasonal", primaryRoom: "living-room", material: "glass", seasonalVariants: ["summer-only"] },
  { id: "obj-autumn-apple-bushel", name: "Apple bushel", emotionalPurpose: "Orchard season", collection: "seasonal", primaryRoom: "kitchen-table", material: "wicker", seasonalVariants: ["autumn-only"] },
  { id: "obj-winter-evergreen-garland", name: "Evergreen garland", emotionalPurpose: "Green in grey", collection: "seasonal", primaryRoom: "living-room", material: "cotton", seasonalVariants: ["winter-only"] },
  { id: "obj-spring-birdhouse", name: "Birdhouse hung", emotionalPurpose: "New neighbors", collection: "seasonal", primaryRoom: "garden", material: "wood", seasonalVariants: ["spring-only"] },
  { id: "obj-summer-hammock", name: "Hammock on deck", emotionalPurpose: "Slow afternoon", collection: "seasonal", primaryRoom: "back-deck", material: "cotton", seasonalVariants: ["summer-only"] },
  { id: "obj-autumn-cider-mug", name: "Cider mug", emotionalPurpose: "Spiced warmth", collection: "seasonal", primaryRoom: "fire-circle", material: "ceramic", animationCapability: true, animation: "steam", seasonalVariants: ["autumn-only"] },
  { id: "obj-winter-snow-globe", name: "Snow globe", emotionalPurpose: "Quiet magic", collection: "seasonal", primaryRoom: "living-room", material: "glass", seasonalVariants: ["winter-holiday"] },
];
