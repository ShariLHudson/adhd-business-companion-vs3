/**
 * Spark Estate Guidebook — The Treehouse Legacy Room spread.
 * Emotional conclusion of the Possibility House journey — curiosity to significance.
 */

import { estateBackgroundPath } from "@/lib/estate/estatePlaceMedia";
import type { EstateGuideSpreadData } from "@/lib/estate/estateGuideEditorial";

export const POSSIBILITY_LEGACY_ROOM_GUIDE_SPREAD: EstateGuideSpreadData = {
  id: "house-possibility-legacy-room",
  title: "The Treehouse Legacy Room",
  guideSubtitle: "Where the Life You're Living Becomes the Legacy You'll Leave",
  epigraph:
    "Your legacy isn't something you leave behind one day. It's something you create every single day.",
  image: estateBackgroundPath("treehouse-possibility-legacy-room-background.png"),
  imagePlaceId: "house-possibility-legacy-room",
  whisperFromEstate:
    "Your legacy is already growing. Today is simply another page in a story only you can write.",
  guideQuote:
    "Long after people forget what we accomplished, they often remember how we made them feel. That's where true legacy begins.",
  blocks: [
    {
      type: "story-of-possibility-studio",
      paragraphs: [
        "When the Treehouse Possibility House was first imagined, the caretakers assumed the Creative Studio would become its most important room.",
        "After all, that's where ideas were born.",
        "Then they believed the Observatory might become its heart.",
        "It offered perspective when life felt uncertain.",
        "But as years passed, something unexpected happened.",
        "Visitors kept returning to one quiet room.",
        "Not because it helped them accomplish more.",
        "Not because it solved their problems.",
        "They returned because it reminded them of something they never wanted to forget.",
        "That success and significance are not the same thing.",
        "So this room quietly became known as the Legacy Room.",
        "Not because it celebrates the past...",
        "But because it gently reminds every visitor that today's choices become tomorrow's memories.",
        "Every conversation.",
        "Every kindness.",
        "Every lesson.",
        "Every act of courage.",
        "Every ordinary day.",
        "They are all quietly becoming part of the story someone else will remember.",
      ],
    },
    {
      type: "why-this-room-exists",
      paragraphs: [
        "The Legacy Room welcomes you whenever you want to step back from the urgency of life and remember what truly matters.",
        "You may find yourself here when...",
      ],
      bullets: [
        "You've accomplished something meaningful.",
        "You're reflecting on your journey.",
        "You're thinking about the people you love.",
        "You're asking what kind of person you're becoming.",
        "You're celebrating how far you've come.",
        "You simply need a reminder that your life already matters.",
      ],
      closingParagraphs: [
        "This room doesn't measure success.",
        "It celebrates significance.",
      ],
    },
    {
      type: "look-closely",
      paragraphs: [
        "The room feels intentionally quieter than the rest of the Treehouse.",
        "The soft glow of the fireplace.",
        "The books resting on well-worn shelves.",
        "The open doors leading to the valley beyond.",
        "The comfortable chair waiting patiently beside the window.",
        "Nothing here competes for your attention.",
        "Everything quietly invites reflection.",
      ],
    },
    {
      type: "the-fireplace",
      paragraphs: [
        "The fireplace has always burned gently.",
        "Never roaring.",
        "Never demanding attention.",
        "Its warmth reminds visitors that the greatest influence we have in life often feels much the same.",
        "Steady.",
        "Consistent.",
        "Quietly present.",
        "Sometimes the smallest flame brings the greatest comfort.",
      ],
    },
    {
      type: "the-open-doors",
      paragraphs: [
        "The doors remain open throughout the seasons.",
        "Not because the room needs fresh air.",
        "Because legacy never stays inside one place.",
        "It moves outward.",
        "Into families.",
        "Friendships.",
        "Communities.",
        "Conversations.",
        "Lives touched in ways we may never fully know.",
        "The Estate believes that what we carry in our hearts should never remain locked away.",
      ],
    },
    {
      type: "estate-traditions",
      paragraphs: [
        "Before leaving the Legacy Room, many visitors ask themselves one simple question:",
        "\"If someone remembered today, what would I hope they remember?\"",
        "Not what they accomplished.",
        "Not how busy they were.",
        "But how they made someone feel.",
        "It's a small question.",
        "Yet it has quietly changed many lives.",
      ],
    },
    {
      type: "estate-secret",
      paragraphs: [
        "There is one frame in the Legacy Room that always remains empty.",
        "Visitors often assume something is missing.",
        "It isn't.",
        "The frame has never held a photograph.",
        "It waits.",
        "Patiently.",
        "The caretakers say it represents the chapter still being written.",
        "Not because your story is incomplete...",
        "But because your greatest contribution may still lie ahead.",
        "No matter your age.",
        "No matter your circumstances.",
        "No matter how many chapters you've already lived.",
        "The Estate quietly believes there is still more goodness waiting to be shared.",
      ],
    },
    {
      type: "from-shari",
      paragraphs: [
        "For much of my life I believed success would be measured by what I accomplished.",
        "Over the years I've discovered something far more meaningful.",
        "The people we've encouraged, the kindness we've shared, the hope we've offered, and the love we've given become the truest measure of a life.",
        "Those moments rarely make headlines, yet they become the stories others carry long after we're gone.",
      ],
      attribution: ["— Shari Hudson"],
    },
    {
      type: "before-you-leave",
      paragraphs: [
        "Before you quietly close the door behind you...",
        "Pause for one last look around.",
        "Notice the books.",
        "The chair.",
        "The gentle fire.",
        "The valley stretching into the distance.",
        "Everything in this room reminds us of the same beautiful truth.",
        "A meaningful life isn't built through extraordinary moments alone.",
        "It is built through thousands of ordinary moments lived with intention.",
        "As you leave the Treehouse, carry this with you:",
        "Every kind word.",
        "Every brave decision.",
        "Every lesson learned.",
        "Every dream pursued.",
        "Every person you've encouraged.",
        "They are all becoming part of your legacy.",
        "Whether you realize it or not...",
        "You're already writing a story worth remembering.",
      ],
    },
    {
      type: "final-treehouse-tradition",
      paragraphs: [
        "When visitors leave the Treehouse Possibility House, they don't leave with a checklist completed or a score earned.",
        "They leave with something much more valuable.",
        "A little more curiosity.",
        "A little more perspective.",
        "A little more hope.",
        "And perhaps, for the first time in a while...",
        "the quiet belief that the best chapters of their story may still be waiting to be written.",
        "That, more than anything else, is the gift of the Treehouse Possibility House.",
        "It doesn't ask you to become someone different—it gently helps you become more fully yourself.",
      ],
    },
  ],
};
