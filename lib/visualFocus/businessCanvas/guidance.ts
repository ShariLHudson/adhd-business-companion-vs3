import type { BusinessCanvasSectionGuidance, BusinessCanvasSectionId } from "./types";

export const BUSINESS_CANVAS_SECTION_GUIDANCE: Record<
  BusinessCanvasSectionId,
  BusinessCanvasSectionGuidance
> = {
  "customer-segments": {
    id: "customer-segments",
    title: "Customer Segments",
    prompt: "Who do you serve?",
    explanation:
      "The specific groups of people your business is built to help — not everyone, just the audiences that matter most.",
    whyItMatters:
      "Different audiences need different offers, messaging, pricing, and support.",
    examples: [
      "ADHD entrepreneurs",
      "Coaches",
      "Consultants",
      "Authors",
      "Small business owners",
    ],
    suggestionSource: "Populate from Audience Intelligence.",
    changeRipples: [
      "Your value proposition may need to shift",
      "Marketing channels may need to change",
      "Pricing and packaging may need adjustment",
      "Support and delivery expectations may change",
    ],
  },
  "value-proposition": {
    id: "value-proposition",
    title: "Value Proposition",
    prompt: "Why should people choose you?",
    explanation:
      "The core promise — what outcome or transformation you deliver that makes you worth choosing.",
    whyItMatters: "This is the primary value your business delivers.",
    examples: [
      "Save time",
      "Reduce overwhelm",
      "Improve productivity",
      "Increase revenue",
      "Better customer experience",
    ],
    suggestionSource: "Populate from offers and positioning.",
    changeRipples: [
      "Messaging across channels may need to update",
      "Offers and pricing may need to realign",
      "Key activities and resources may shift",
      "Customer relationships and expectations may change",
    ],
  },
  channels: {
    id: "channels",
    title: "Channels",
    prompt: "How do people discover you?",
    explanation:
      "Where your audience finds you before they buy — marketing, content, referrals, and touchpoints.",
    whyItMatters: "Customers cannot buy what they never find.",
    examples: [
      "Pinterest",
      "LinkedIn",
      "Facebook",
      "Instagram",
      "Email marketing",
      "Workshops",
      "Referrals",
    ],
    suggestionSource: "Use known marketing channels.",
    changeRipples: [
      "Audience reach may grow or shrink",
      "Content and activity priorities may shift",
      "Cost structure may change",
      "Revenue timing and volume may be affected",
    ],
  },
  "customer-relationships": {
    id: "customer-relationships",
    title: "Customer Relationships",
    prompt: "How do you stay connected?",
    explanation:
      "How you nurture trust after someone discovers you — ongoing connection, support, and community.",
    whyItMatters:
      "Relationships create trust, retention, and referrals.",
    examples: [
      "Email newsletter",
      "Membership",
      "Coaching",
      "Community",
      "Follow-up sequences",
    ],
    suggestionSource: "Use existing delivery methods.",
    changeRipples: [
      "Retention and referrals may rise or fall",
      "Support workload may increase",
      "Key activities may need more or less time",
      "Revenue stability may improve or weaken",
    ],
  },
  "revenue-streams": {
    id: "revenue-streams",
    title: "Revenue Streams",
    prompt: "How does money enter the business?",
    explanation:
      "Every way your business earns — products, services, subscriptions, and recurring income.",
    whyItMatters:
      "Understanding revenue reveals growth opportunities and risks.",
    examples: [
      "Memberships",
      "Courses",
      "Coaching",
      "Consulting",
      "Digital products",
      "Affiliate revenue",
    ],
    suggestionSource: "Use current offers.",
    changeRipples: [
      "Revenue may increase or decrease",
      "Marketing priorities may shift",
      "Customer relationships may change",
      "Support requirements may grow",
    ],
  },
  "key-activities": {
    id: "key-activities",
    title: "Key Activities",
    prompt: "What must happen for the business to operate?",
    explanation:
      "The essential work that creates value — what you (and your team) must do regularly.",
    whyItMatters: "These activities create value and drive growth.",
    examples: [
      "Content creation",
      "Marketing",
      "Sales",
      "Client support",
      "Product development",
    ],
    suggestionSource: "Infer from projects and offers.",
    changeRipples: [
      "Time and energy demands may shift",
      "Partners or hires may become necessary",
      "Costs may rise with increased activity",
      "Delivery quality and speed may change",
    ],
  },
  "key-resources": {
    id: "key-resources",
    title: "Key Resources",
    prompt: "What assets support the business?",
    explanation:
      "What you need to deliver — skills, tools, content, audience, brand, and people.",
    whyItMatters: "Resources enable delivery and growth.",
    examples: [
      "Knowledge",
      "Team",
      "Software",
      "Content library",
      "Audience",
      "Brand",
    ],
    suggestionSource: "Populate from ecosystem data.",
    changeRipples: [
      "Capacity to deliver may expand or limit growth",
      "Costs may increase for new tools or people",
      "Activities may speed up or slow down",
      "Partnerships may become more or less important",
    ],
  },
  "key-partners": {
    id: "key-partners",
    title: "Key Partners",
    prompt: "Who helps make this work?",
    explanation:
      "People and organizations that extend your capacity — collaborators, vendors, and allies.",
    whyItMatters:
      "Partnerships can accelerate growth and reduce workload.",
    examples: [
      "Affiliates",
      "Contractors",
      "Virtual assistants",
      "Strategic partners",
      "Vendors",
    ],
    suggestionSource: "Use known relationships.",
    changeRipples: [
      "Costs and revenue share may shift",
      "Delivery capacity may change",
      "Risk may spread or concentrate",
      "Key activities you own may shrink or grow",
    ],
  },
  "cost-structure": {
    id: "cost-structure",
    title: "Cost Structure",
    prompt: "What costs support the business?",
    explanation:
      "What you spend to run and grow — tools, ads, help, education, and overhead.",
    whyItMatters: "Costs affect profitability and scalability.",
    examples: [
      "Software subscriptions",
      "Advertising",
      "Contractors",
      "Staff",
      "Education",
      "Services",
    ],
    suggestionSource: "User-editable only unless known.",
    changeRipples: [
      "Profit margins may tighten or improve",
      "Pricing decisions may need to change",
      "Growth pace may speed up or slow down",
      "Which activities and partners you afford may shift",
    ],
  },
};

export function guidanceForSection(
  id: BusinessCanvasSectionId,
): BusinessCanvasSectionGuidance {
  return BUSINESS_CANVAS_SECTION_GUIDANCE[id];
}
