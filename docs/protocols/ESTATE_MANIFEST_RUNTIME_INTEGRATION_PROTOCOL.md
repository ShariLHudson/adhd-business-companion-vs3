# Estate Manifest Runtime Integration Protocol

Use ESTATE_PLACE_MASTER_MANIFEST.json as the source of truth.

Flow:
User language
-> intent
-> manifest lookup
-> place ID
-> route
-> media

Do not use filename guessing or visual similarity.

Required:
findPlaceByAlias()
findPlaceByIntent()
getPlaceMedia()
getNavigationOptions()
