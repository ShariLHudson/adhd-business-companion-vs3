import type { SparkNoteCategory, SparkNoteDailyCard } from "./types";

export type SparkCardArtAsset = {
  src: string;
  alt: string;
};

/** Topic / person / title patterns — checked before category defaults. */
const SPARK_CARD_TOPIC_ART: readonly {
  pattern: RegExp;
  asset: SparkCardArtAsset;
}[] = [
  {
    pattern: /oscar wilde|SPARK-QUOTE-008/i,
    asset: {
      src: "https://upload.wikimedia.org/wikipedia/commons/a/a7/Oscar_Wilde_Sarony.jpg",
      alt: "Oscar Wilde portrait",
    },
  },
  {
    pattern: /einstein|SPARK-QUOTE-004|SPARK-QUOTE-006/i,
    asset: {
      src: "https://upload.wikimedia.org/wikipedia/commons/d/d3/Albert_Einstein_Head.jpg",
      alt: "Albert Einstein portrait",
    },
  },
  {
    pattern: /steve jobs|SPARK-QUOTE-001|SPARK-QUOTE-002/i,
    asset: {
      src: "https://upload.wikimedia.org/wikipedia/commons/d/dc/Steve_Jobs_Headshot_2010-CROP_%28cropped_2%29.jpg",
      alt: "Steve Jobs portrait",
    },
  },
  {
    pattern: /churchill|SPARK-QUOTE-003/i,
    asset: {
      src: "https://upload.wikimedia.org/wikipedia/commons/b/bc/Sir_Winston_Churchill_-_19086236948.jpg",
      alt: "Winston Churchill portrait",
    },
  },
  {
    pattern: /walt disney|SPARK-QUOTE-005/i,
    asset: {
      src: "https://upload.wikimedia.org/wikipedia/commons/d/df/Walt_Disney_1946.JPG",
      alt: "Walt Disney portrait",
    },
  },
  {
    pattern: /henry ford|SPARK-QUOTE-007/i,
    asset: {
      src: "https://upload.wikimedia.org/wikipedia/commons/6/67/Henry_Ford_1919.jpg",
      alt: "Henry Ford portrait",
    },
  },
  {
    pattern: /arthur ashe|SPARK-QTE-003/i,
    asset: {
      src: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Arthur_Ashe_%281975%29.jpg",
      alt: "Arthur Ashe portrait",
    },
  },
  {
    pattern: /matisse|SPARK-QTE-004/i,
    asset: {
      src: "https://upload.wikimedia.org/wikipedia/commons/0/0a/Henri_Matisse%2C_1913%2C_portrait_by_Alvin_Langdon_Coburn.jpg",
      alt: "Henri Matisse portrait",
    },
  },
  {
    pattern: /post-it|SPARK-INV-001/i,
    asset: {
      src: "https://upload.wikimedia.org/wikipedia/commons/0/04/Post-it_notes.jpg",
      alt: "Colorful sticky notes",
    },
  },
  {
    pattern: /microwave|SPARK-INV-002/i,
    asset: {
      src: "https://upload.wikimedia.org/wikipedia/commons/e/e2/Microwave_oven.jpg",
      alt: "Microwave oven",
    },
  },
  {
    pattern: /mouse|SPARK-INV-010/i,
    asset: {
      src: "https://upload.wikimedia.org/wikipedia/commons/9/97/Computer_mouse_logitech.jpg",
      alt: "Computer mouse",
    },
  },
  {
    pattern: /velcro|SPARK-INV-003/i,
    asset: {
      src: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Close_up_of_Velcro.jpg",
      alt: "Velcro fastener close-up",
    },
  },
  {
    pattern: /penicillin|SPARK-INNOV-001/i,
    asset: {
      src: "https://upload.wikimedia.org/wikipedia/commons/b/bf/Penicillin_production.jpg",
      alt: "Penicillin laboratory culture",
    },
  },
  {
    pattern: /super soaker|SPARK-INNOV-003/i,
    asset: {
      src: "https://upload.wikimedia.org/wikipedia/commons/8/8d/Super_Soaker_CPS_2000.jpg",
      alt: "Super Soaker water toy",
    },
  },
];

const SPARK_CARD_CATEGORY_ART: Record<SparkNoteCategory, SparkCardArtAsset> = {
  invention: {
    src: "https://upload.wikimedia.org/wikipedia/commons/3/3c/Edison_and_light_bulb.jpg",
    alt: "Inventor with early light bulb",
  },
  inventor: {
    src: "https://upload.wikimedia.org/wikipedia/commons/3/3c/Edison_and_light_bulb.jpg",
    alt: "Inventor portrait with invention",
  },
  entrepreneur: {
    src: "https://upload.wikimedia.org/wikipedia/commons/8/8d/New_York_Stock_Exchange_Facade_2015.jpg",
    alt: "Historic business district architecture",
  },
  business: {
    src: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Office_desk_with_typewriter_and_telephone%2C_ca._1910.jpg",
    alt: "Vintage office desk and telephone",
  },
  history: {
    src: "https://upload.wikimedia.org/wikipedia/commons/5/5f/Declaration_of_Independence_1819_by_John_Trumbull.jpg",
    alt: "Historic painting of a pivotal moment",
  },
  holiday: {
    src: "https://upload.wikimedia.org/wikipedia/commons/1/14/Christmas_tree_with_presents.jpg",
    alt: "Holiday tree with warm light",
  },
  fun_fact: {
    src: "https://upload.wikimedia.org/wikipedia/commons/4/4d/Magnifying_glass2.jpg",
    alt: "Magnifying glass — curiosity and discovery",
  },
  quote: {
    src: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Quill_and_ink.jpg",
    alt: "Quill and ink — literary writing atmosphere",
  },
  creativity: {
    src: "https://upload.wikimedia.org/wikipedia/commons/6/6e/Monet_-_Impression%2C_Sunrise.jpg",
    alt: "Impressionist painting — creative atmosphere",
  },
  personal_growth: {
    src: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Fjord_in_Norway.jpg",
    alt: "Path toward open horizon",
  },
  gratitude: {
    src: "https://upload.wikimedia.org/wikipedia/commons/5/57/Sunrise_over_the_sea.jpg",
    alt: "Sunrise over calm water",
  },
  adhd_friendly: {
    src: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Colorful_sticky_notes_on_wall.jpg",
    alt: "Colorful notes and visual organization",
  },
  personal: {
    src: "https://upload.wikimedia.org/wikipedia/commons/1/1e/Journal_and_pen.jpg",
    alt: "Open journal with pen",
  },
};

/**
 * Resolve a meaningful hero image for collectible Spark Cards.
 * Prefers catalog imageSrc, then topic match, then category artwork.
 */
export function resolveSparkCardArtAsset(
  card: SparkNoteDailyCard,
): SparkCardArtAsset {
  const explicit = card.imageSrc?.trim() || card.thumbnailSrc?.trim();
  if (explicit) {
    return {
      src: explicit,
      alt: card.thumbnailAlt?.trim() || `Artwork for ${card.title}`,
    };
  }

  const haystack = [
    card.id,
    card.title,
    card.shortTitle,
    card.categoryLabel,
    ...(card.tags ?? []),
  ].join(" ");

  for (const entry of SPARK_CARD_TOPIC_ART) {
    if (entry.pattern.test(haystack)) {
      return entry.asset;
    }
  }

  return (
    SPARK_CARD_CATEGORY_ART[card.category] ?? {
      src: SPARK_CARD_CATEGORY_ART.quote.src,
      alt: `Themed artwork for ${card.categoryLabel}`,
    }
  );
}
