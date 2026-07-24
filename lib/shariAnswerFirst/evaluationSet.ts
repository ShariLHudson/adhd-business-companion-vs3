/**
 * Reusable answer-quality evaluation cases for answer-first behavior.
 */

export type AnswerFirstEvalCase = {
  id: string;
  category:
    | "how_to"
    | "advice"
    | "comparison"
    | "brainstorming"
    | "troubleshooting"
    | "reflective"
    | "question_vs_action"
    | "current_research"
    | "ordinary"
    | "explicit_nav"
    | "explicit_create";
  text: string;
  expectDirectAnswer: boolean;
  expectRoutingAllowed: boolean;
  expectModeIncludes?: string;
  expectCurrentResearch?: boolean;
};

export const SHARI_ANSWER_FIRST_EVAL_CASES: AnswerFirstEvalCase[] = [
  // How-to (25+)
  { id: "ht01", category: "how_to", text: "How do I set up a vendor table or booth at an event?", expectDirectAnswer: true, expectRoutingAllowed: false, expectModeIncludes: "how_to" },
  { id: "ht02", category: "how_to", text: "How do I find Facebook groups where I can market my business?", expectDirectAnswer: true, expectRoutingAllowed: false, expectModeIncludes: "how_to" },
  { id: "ht03", category: "how_to", text: "How do I create a strategic plan?", expectDirectAnswer: true, expectRoutingAllowed: false, expectModeIncludes: "how_to" },
  { id: "ht04", category: "how_to", text: "How do I hire a virtual assistant?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "ht05", category: "how_to", text: "How do I organize a webinar?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "ht06", category: "how_to", text: "How do I start a podcast?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "ht07", category: "how_to", text: "How do I follow up with leads?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "ht08", category: "how_to", text: "How do I create an SOP?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "ht09", category: "how_to", text: "How do I price a service?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "ht10", category: "how_to", text: "How do I plan an event?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "ht11", category: "how_to", text: "How do I write a proposal?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "ht12", category: "how_to", text: "Walk me through setting up email automation from beginning to end.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "ht13", category: "how_to", text: "How should I onboard a new coaching client?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "ht14", category: "how_to", text: "How do I build a simple content calendar?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "ht15", category: "how_to", text: "How do I collect testimonials?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "ht16", category: "how_to", text: "How do I run a discovery call?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "ht17", category: "how_to", text: "How do I set boundaries with clients?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "ht18", category: "how_to", text: "How do I improve my LinkedIn profile?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "ht19", category: "how_to", text: "How do I prepare for a speaking slot?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "ht20", category: "how_to", text: "How do I create a lead magnet?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "ht21", category: "how_to", text: "How can I reduce no-shows for my webinar?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "ht22", category: "how_to", text: "How do I ask for referrals without feeling pushy?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "ht23", category: "how_to", text: "How do I track my marketing results simply?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "ht24", category: "how_to", text: "How do I choose a niche?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "ht25", category: "how_to", text: "Teach me how to write a welcome email sequence.", expectDirectAnswer: true, expectRoutingAllowed: false },

  // Advice
  { id: "ad01", category: "advice", text: "Do you think it is worth paying for a vendor booth at this event?", expectDirectAnswer: true, expectRoutingAllowed: false, expectModeIncludes: "advice" },
  { id: "ad02", category: "advice", text: "Should I hire a VA right now?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "ad03", category: "advice", text: "Is this offer too complicated?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "ad04", category: "advice", text: "Should I collaborate with this person?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "ad05", category: "advice", text: "Is Facebook the right platform for me?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "ad06", category: "advice", text: "Should I launch now or wait?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "ad07", category: "advice", text: "How should I handle this difficult client?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "ad08", category: "advice", text: "Should I attend this networking event?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "ad09", category: "advice", text: "Would you raise my prices this quarter?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "ad10", category: "advice", text: "Should I keep offering free discovery calls?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "ad11", category: "advice", text: "Is it worth investing in ads yet?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "ad12", category: "advice", text: "Should I say yes to this partnership?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "ad13", category: "advice", text: "Do you think I should quit my side freelancing?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "ad14", category: "advice", text: "Should I focus on one platform only?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "ad15", category: "advice", text: "Is a membership a good idea for my audience?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "ad16", category: "advice", text: "Should I outsource my bookkeeping?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "ad17", category: "advice", text: "Would a retreat be too ambitious this year?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "ad18", category: "advice", text: "Should I discount for early bird buyers?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "ad19", category: "advice", text: "Is my freebie undercutting my paid offer?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "ad20", category: "advice", text: "Should I take this speaking opportunity for free?", expectDirectAnswer: true, expectRoutingAllowed: false },

  // Comparisons
  { id: "cp01", category: "comparison", text: "Would a webinar or a workshop be better for introducing my platform?", expectDirectAnswer: true, expectRoutingAllowed: false, expectModeIncludes: "comparison" },
  { id: "cp02", category: "comparison", text: "Compare Facebook and LinkedIn for my coaching business.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "cp03", category: "comparison", text: "Hiring versus contracting a designer — which fits?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "cp04", category: "comparison", text: "What's the difference between a lead magnet and a free consultation?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "cp05", category: "comparison", text: "Compare two CRM platforms for a solo founder.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "cp06", category: "comparison", text: "In-person event vs virtual summit — tradeoffs?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "cp07", category: "comparison", text: "Newsletter versus social posts for nurturing.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "cp08", category: "comparison", text: "Group coaching vs 1:1 — which should I emphasize?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "cp09", category: "comparison", text: "Canva versus hiring a designer for launch assets.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "cp10", category: "comparison", text: "Short courses vs evergreen membership.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "cp11", category: "comparison", text: "Organic reach vs paid ads for a new offer.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "cp12", category: "comparison", text: "Podcast versus YouTube for authority building.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "cp13", category: "comparison", text: "Local networking vs online communities.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "cp14", category: "comparison", text: "DIY website vs template marketplace.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "cp15", category: "comparison", text: "Async courses versus live cohorts.", expectDirectAnswer: true, expectRoutingAllowed: false },

  // Brainstorming
  { id: "br01", category: "brainstorming", text: "Give me ideas for promoting my webinar.", expectDirectAnswer: true, expectRoutingAllowed: false, expectModeIncludes: "brainstorm" },
  { id: "br02", category: "brainstorming", text: "Brainstorm ways I could fill my booth with interest.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "br03", category: "brainstorming", text: "Suggest some lead magnet ideas for ADHD entrepreneurs.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "br04", category: "brainstorming", text: "Give me options for a soft launch.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "br05", category: "brainstorming", text: "Ideas for re-engaging quiet email subscribers.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "br06", category: "brainstorming", text: "Ways I could partner with complementary businesses.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "br07", category: "brainstorming", text: "Brainstorm podcast episode themes for my audience.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "br08", category: "brainstorming", text: "Give me ideas for a simple referral program.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "br09", category: "brainstorming", text: "Options for celebrating a client win publicly.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "br10", category: "brainstorming", text: "Suggest workshop titles that don't sound salesy.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "br11", category: "brainstorming", text: "Ideas for booth freebies that aren't junk.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "br12", category: "brainstorming", text: "Brainstorm subject lines for a launch sequence.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "br13", category: "brainstorming", text: "Give me ways to start conversations in Facebook groups.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "br14", category: "brainstorming", text: "Ideas for a low-energy marketing week.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "br15", category: "brainstorming", text: "Suggest angles for a case study post.", expectDirectAnswer: true, expectRoutingAllowed: false },

  // Troubleshooting
  { id: "tr01", category: "troubleshooting", text: "My QR code will not scan from my computer screen.", expectDirectAnswer: true, expectRoutingAllowed: false, expectModeIncludes: "troubleshoot" },
  { id: "tr02", category: "troubleshooting", text: "Why isn't anyone registering for my webinar?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "tr03", category: "troubleshooting", text: "My emails keep going to spam.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "tr04", category: "troubleshooting", text: "Checkout isn't working on my sales page.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "tr05", category: "troubleshooting", text: "Nobody replies to my outreach messages.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "tr06", category: "troubleshooting", text: "My Canva link won't open for clients.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "tr07", category: "troubleshooting", text: "Zoom audio isn't working for attendees.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "tr08", category: "troubleshooting", text: "My form submissions aren't arriving.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "tr09", category: "troubleshooting", text: "The printer at the event won't print my price list.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "tr10", category: "troubleshooting", text: "People say they didn't get my confirmation email.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "tr11", category: "troubleshooting", text: "My Facebook post isn't getting any reach.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "tr12", category: "troubleshooting", text: "The payment link keeps failing on mobile.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "tr13", category: "troubleshooting", text: "My microphone sounds muffled on recordings.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "tr14", category: "troubleshooting", text: "Calendar invites aren't showing the right time zone.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "tr15", category: "troubleshooting", text: "My booth banner keeps falling over.", expectDirectAnswer: true, expectRoutingAllowed: false },

  // Reflective
  { id: "rf01", category: "reflective", text: "I keep putting off contacting people about my platform.", expectDirectAnswer: true, expectRoutingAllowed: false, expectModeIncludes: "reflective" },
  { id: "rf02", category: "reflective", text: "I'm stuck and don't know why I'm avoiding this launch.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "rf03", category: "reflective", text: "Talk this through with me — I'm afraid to raise prices.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "rf04", category: "reflective", text: "Why can't I finish the things I start?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "rf05", category: "reflective", text: "I feel overwhelmed about showing up publicly.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "rf06", category: "reflective", text: "I'm stuck between caring too much and shutting down.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "rf07", category: "reflective", text: "Help me understand why this feels heavy.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "rf08", category: "reflective", text: "I keep putting off sending the invoice.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "rf09", category: "reflective", text: "Talk it through — I don't trust my own judgment lately.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "rf10", category: "reflective", text: "I'm afraid this offer isn't good enough.", expectDirectAnswer: true, expectRoutingAllowed: false },

  // Question vs action pairs
  { id: "qa01", category: "question_vs_action", text: "How do I create a strategic plan?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "qa02", category: "explicit_create", text: "Create a strategic plan for my business.", expectDirectAnswer: false, expectRoutingAllowed: true, expectModeIncludes: "formal_creation" },
  { id: "qa03", category: "question_vs_action", text: "What should a client intake form include?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "qa04", category: "explicit_create", text: "Create a client intake form for my coaching business.", expectDirectAnswer: false, expectRoutingAllowed: true },
  { id: "qa05", category: "question_vs_action", text: "What should go into a podcast launch project?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "qa06", category: "question_vs_action", text: "Turn this into a podcast launch project.", expectDirectAnswer: false, expectRoutingAllowed: true },
  { id: "qa07", category: "question_vs_action", text: "How would I research my competitors?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "qa08", category: "question_vs_action", text: "Can you explain how project planning works?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "qa09", category: "question_vs_action", text: "Give me ideas for a Facebook campaign.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "qa10", category: "question_vs_action", text: "How do I use Projects in Spark?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "qa11", category: "question_vs_action", text: "What belongs in a marketing plan?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "qa12", category: "explicit_create", text: "Write a welcome email for new members.", expectDirectAnswer: false, expectRoutingAllowed: true },
  { id: "qa13", category: "question_vs_action", text: "How do I create an SOP?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "qa14", category: "explicit_create", text: "Draft an SOP for client onboarding.", expectDirectAnswer: false, expectRoutingAllowed: true },
  { id: "qa15", category: "question_vs_action", text: "How do I set up a strategic plan for a small business?", expectDirectAnswer: true, expectRoutingAllowed: false },

  // Current research
  { id: "cr01", category: "current_research", text: "Find active Facebook groups for ADHD entrepreneurs that allow promotion.", expectDirectAnswer: true, expectRoutingAllowed: false, expectCurrentResearch: true },
  { id: "cr02", category: "current_research", text: "Research my current competitors in ADHD coaching right now.", expectDirectAnswer: true, expectRoutingAllowed: false, expectCurrentResearch: true },
  { id: "cr03", category: "current_research", text: "What are the best active Facebook groups for coaches today?", expectDirectAnswer: true, expectRoutingAllowed: false, expectCurrentResearch: true },
  { id: "cr04", category: "current_research", text: "Look up current vendor booth fees for major expo halls.", expectDirectAnswer: true, expectRoutingAllowed: false, expectCurrentResearch: true },
  { id: "cr05", category: "ordinary", text: "How do I find Facebook groups for marketing?", expectDirectAnswer: true, expectRoutingAllowed: false, expectCurrentResearch: false },
  { id: "cr06", category: "current_research", text: "Find the latest statistics on webinar attendance.", expectDirectAnswer: true, expectRoutingAllowed: false, expectCurrentResearch: true },
  { id: "cr07", category: "current_research", text: "Which CRM tools are best right now for solo coaches?", expectDirectAnswer: true, expectRoutingAllowed: false, expectCurrentResearch: true },
  { id: "cr08", category: "current_research", text: "Research current Instagram algorithm changes.", expectDirectAnswer: true, expectRoutingAllowed: false, expectCurrentResearch: true },
  { id: "cr09", category: "current_research", text: "Find current events near me for vendors this month.", expectDirectAnswer: true, expectRoutingAllowed: false, expectCurrentResearch: true },
  { id: "cr10", category: "current_research", text: "What are active Slack communities for indie makers right now?", expectDirectAnswer: true, expectRoutingAllowed: false, expectCurrentResearch: true },

  // Ordinary + explicit nav
  { id: "or01", category: "ordinary", text: "What is a sales funnel?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "or02", category: "ordinary", text: "Why might I be procrastinating on this?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "or03", category: "ordinary", text: "Help me plan what I need to do before Friday’s webinar.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "or04", category: "ordinary", text: "What should be included in a strategic plan?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "or05", category: "ordinary", text: "Give me a simple three-step approach for follow-up.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "or06", category: "ordinary", text: "What are some ways I could promote my webinar?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "or07", category: "ordinary", text: "Explain decision fatigue briefly.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "or08", category: "ordinary", text: "Help me prepare for tomorrow’s meeting.", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "or09", category: "ordinary", text: "What is an SOP?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "or10", category: "ordinary", text: "How does a nurture sequence work?", expectDirectAnswer: true, expectRoutingAllowed: false },
  { id: "nv01", category: "explicit_nav", text: "Take me to the Research Library.", expectDirectAnswer: false, expectRoutingAllowed: true, expectModeIncludes: "explicit_navigation" },
  { id: "nv02", category: "explicit_nav", text: "Open Projects.", expectDirectAnswer: false, expectRoutingAllowed: true },
  { id: "nv03", category: "explicit_nav", text: "Take me to Projects.", expectDirectAnswer: false, expectRoutingAllowed: true },
];
