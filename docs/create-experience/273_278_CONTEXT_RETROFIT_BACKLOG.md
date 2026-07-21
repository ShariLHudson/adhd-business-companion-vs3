# Context Retrofit Backlog

**Standard:** 277
**Generated:** 2026-07-21

## critical

- `bp-event-book-signing` · active_business → `business.business_id` · wire_profile_load
- `bp-event-book-signing` · purpose → `business.vision` · wire_profile_load
- `bp-event-business-luncheon` · active_business → `business.business_id` · wire_profile_load
- `bp-event-business-luncheon` · purpose → `business.vision` · wire_profile_load
- `bp-event-one-day-workshop` · active_business → `business.business_id` · wire_profile_load
- `bp-event-one-day-workshop` · purpose → `business.vision` · wire_profile_load
- `bp-event-online-workshop` · active_business → `business.business_id` · wire_profile_load
- `bp-event-online-workshop` · purpose → `business.vision` · wire_profile_load
- `bp-event-three-day-retreat` · active_business → `business.business_id` · wire_profile_load
- `bp-event-three-day-retreat` · purpose → `business.vision` · wire_profile_load
- `business.author` · active_business → `business.business_id` · wire_profile_load
- `business.author` · purpose → `business.vision` · wire_profile_load
- `business.author` · vision → `business.vision` · wire_profile_load
- `business.coaching` · active_business → `business.business_id` · wire_profile_load
- `business.coaching` · purpose → `business.vision` · wire_profile_load
- `business.coaching` · vision → `business.vision` · wire_profile_load
- `business.consulting` · active_business → `business.business_id` · wire_profile_load
- `business.consulting` · purpose → `business.vision` · wire_profile_load
- `business.consulting` · vision → `business.vision` · wire_profile_load
- `business.content_creator` · active_business → `business.business_id` · wire_profile_load
- `business.content_creator` · purpose → `business.vision` · wire_profile_load
- `business.content_creator` · vision → `business.vision` · wire_profile_load
- `business.course_creator` · active_business → `business.business_id` · wire_profile_load
- `business.course_creator` · purpose → `business.vision` · wire_profile_load
- `business.course_creator` · vision → `business.vision` · wire_profile_load
- `business.craft_show` · active_business → `business.business_id` · wire_profile_load
- `business.craft_show` · purpose → `business.vision` · wire_profile_load
- `business.craft_show` · vision → `business.vision` · wire_profile_load
- `business.craft_show` · calendar → `business.constraints` · wire_profile_load
- `business.craft_show` · shows → `business.channels` · wire_profile_load
- `business.ecommerce` · active_business → `business.business_id` · wire_profile_load
- `business.ecommerce` · purpose → `business.vision` · wire_profile_load
- `business.ecommerce` · vision → `business.vision` · wire_profile_load
- `business.ecommerce` · channels → `business.channels` · wire_profile_load
- `business.etsy` · active_business → `business.business_id` · wire_profile_load
- `business.etsy` · purpose → `business.vision` · wire_profile_load
- `business.etsy` · vision → `business.vision` · wire_profile_load
- `business.handmade_online_store` · active_business → `business.business_id` · wire_profile_load
- `business.handmade_online_store` · purpose → `business.vision` · wire_profile_load
- `business.handmade_online_store` · vision → `business.vision` · wire_profile_load
- …and 119 more

## high

- `bp-event-business-luncheon` · audience → `client_avatar.description` · implement_prefill
- `business.author` · readers → `client_avatar.description` · implement_prefill
- `business.author` · audience → `client_avatar.description` · implement_prefill
- `business.author` · buyers → `client_avatar.description` · implement_prefill
- `business.author` · publishing_path → `offer.description` · implement_prefill
- `business.author` · publish → `offer.description` · implement_prefill
- `business.coaching` · fit → `client_avatar.description` · implement_prefill
- `business.coaching` · non_fit → `client_avatar.frustrations` · implement_prefill
- `business.coaching` · offers → `offer.name` · implement_prefill
- `business.content_creator` · audience → `client_avatar.description` · implement_prefill
- `business.content_creator` · buyers → `client_avatar.description` · implement_prefill
- `business.course_creator` · course → `offer.name` · implement_prefill
- `business.course_creator` · learner → `client_avatar.description` · implement_prefill
- `business.course_creator` · demand → `client_avatar.goals` · implement_prefill
- `business.course_creator` · validation → `client_avatar.goals` · implement_prefill
- `business.course_creator` · course_model → `offer.description` · implement_prefill
- `business.course_creator` · delivery → `offer.description` · implement_prefill
- `business.craft_show` · offers → `offer.name` · implement_prefill
- `business.craft_show` · audience → `client_avatar.description` · implement_prefill
- `business.craft_show` · customers → `client_avatar.description` · implement_prefill
- `business.craft_show` · pricing → `offer.description` · implement_prefill
- `business.ecommerce` · audience → `client_avatar.description` · implement_prefill
- `business.ecommerce` · customers → `client_avatar.description` · implement_prefill
- `business.ecommerce` · clients → `client_avatar.description` · implement_prefill
- `business.ecommerce` · offers → `offer.name` · implement_prefill
- `business.etsy` · offers → `offer.name` · implement_prefill
- `business.etsy` · pricing → `offer.description` · implement_prefill
- `business.handmade_online_store` · offers → `offer.name` · implement_prefill
- `business.handmade_online_store` · audience → `client_avatar.description` · implement_prefill
- `business.handmade_online_store` · customers → `client_avatar.description` · implement_prefill
- `business.handmade_online_store` · pricing → `offer.description` · implement_prefill
- `business.hospitality` · audience → `client_avatar.description` · implement_prefill
- `business.hospitality` · customers → `client_avatar.description` · implement_prefill
- `business.hospitality` · clients → `client_avatar.description` · implement_prefill
- `business.membership` · membership → `offer.name` · implement_prefill
- `business.membership` · member → `client_avatar.description` · implement_prefill
- `business.membership` · fit → `client_avatar.description` · implement_prefill
- `business.membership` · non_fit → `client_avatar.frustrations` · implement_prefill
- `business.membership` · membership_model → `offer.description` · implement_prefill
- `business.membership` · model → `offer.description` · implement_prefill
- …and 43 more

## moderate

- `business.author` · author_identity → `business_dna.positioning` · suppress_repeat_question
- `business.hospitality` · specialty → `business_dna.positioning` · suppress_repeat_question
- `business.professional_organizing` · specialty → `business_dna.positioning` · suppress_repeat_question
- `business.restaurant` · specialty → `business_dna.positioning` · suppress_repeat_question
- `business.retail_store` · specialty → `business_dna.positioning` · suppress_repeat_question
- `business.travel_tourism` · specialty → `business_dna.positioning` · suppress_repeat_question
- `organizing.strategic_management` · strategy → `business_dna.positioning` · suppress_repeat_question

## low

- `bp-event-book-signing` · book_title → `blueprint_session.current_goal` · suppress_repeat_question
- `bp-event-book-signing` · inventory → `product_or_service.name` · suppress_repeat_question
- `bp-event-book-signing` · has_partner → `blueprint_session.current_goal` · suppress_repeat_question
- `bp-event-business-luncheon` · guest_count → `blueprint_session.current_goal` · suppress_repeat_question
- `bp-event-business-luncheon` · has_sponsors → `blueprint_session.current_goal` · suppress_repeat_question
- `bp-event-one-day-workshop` · format → `blueprint_session.current_goal` · suppress_repeat_question
- `bp-event-online-workshop` · outcomes → `blueprint_session.current_goal` · suppress_repeat_question
- `bp-event-online-workshop` · platform → `blueprint_session.current_goal` · suppress_repeat_question
- `bp-event-online-workshop` · venue → `blueprint_session.current_goal` · suppress_repeat_question
- `bp-event-online-workshop` · will_record → `blueprint_session.current_goal` · suppress_repeat_question
- `bp-event-three-day-retreat` · venue → `blueprint_session.current_goal` · suppress_repeat_question
- `bp-event-three-day-retreat` · lodging → `blueprint_session.current_goal` · suppress_repeat_question
- `bp-event-three-day-retreat` · needs_volunteers → `blueprint_session.current_goal` · suppress_repeat_question
- `business.author` · next_action → `blueprint_session.current_goal` · suppress_repeat_question
- `business.author` · next_step → `blueprint_session.current_goal` · suppress_repeat_question
- `business.coaching` · coaching_focus → `blueprint_session.current_goal` · suppress_repeat_question
- `business.coaching` · ideal_client → `blueprint_session.current_goal` · suppress_repeat_question
- `business.coaching` · format → `blueprint_session.current_goal` · suppress_repeat_question
- `business.coaching` · next_action → `blueprint_session.current_goal` · suppress_repeat_question
- `business.coaching` · next_step → `blueprint_session.current_goal` · suppress_repeat_question
- `business.consulting` · domain → `blueprint_session.current_goal` · suppress_repeat_question
- `business.consulting` · services → `product_or_service.name` · suppress_repeat_question
- `business.consulting` · formats → `blueprint_session.current_goal` · suppress_repeat_question
- `business.consulting` · diagnosis → `blueprint_session.current_goal` · suppress_repeat_question
- `business.consulting` · discovery → `blueprint_session.current_goal` · suppress_repeat_question
- `business.consulting` · next_action → `blueprint_session.current_goal` · suppress_repeat_question
- `business.consulting` · next_step → `blueprint_session.current_goal` · suppress_repeat_question
- `business.content_creator` · creator → `blueprint_session.current_goal` · suppress_repeat_question
- `business.content_creator` · sponsors → `blueprint_session.current_goal` · suppress_repeat_question
- `business.content_creator` · pillars → `blueprint_session.current_goal` · suppress_repeat_question
- `business.content_creator` · formats → `blueprint_session.current_goal` · suppress_repeat_question
- `business.content_creator` · topics → `blueprint_session.current_goal` · suppress_repeat_question
- `business.content_creator` · next_action → `blueprint_session.current_goal` · suppress_repeat_question
- `business.content_creator` · next_step → `blueprint_session.current_goal` · suppress_repeat_question
- `business.course_creator` · next_action → `blueprint_session.current_goal` · suppress_repeat_question
- `business.course_creator` · next_step → `blueprint_session.current_goal` · suppress_repeat_question
- `business.craft_show` · products → `product_or_service.name` · suppress_repeat_question
- `business.craft_show` · next_actions → `blueprint_session.current_goal` · suppress_repeat_question
- `business.ecommerce` · products → `product_or_service.name` · suppress_repeat_question
- `business.ecommerce` · next_action → `blueprint_session.current_goal` · suppress_repeat_question
- …and 238 more
