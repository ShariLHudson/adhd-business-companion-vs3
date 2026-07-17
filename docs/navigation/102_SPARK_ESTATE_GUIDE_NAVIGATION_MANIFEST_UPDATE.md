# Spark Estate Guide Navigation Manifest Update

## Change

Move Spark Estate Guide to:

**Welcome Home → Spark Estate → Spark Estate Guide**

Add sibling destination:

**Welcome Home → Spark Estate → Wander the Grounds**

## Remove

- automatic guide loading on Welcome Home arrival
- bottom-corner guide launcher (`SparkEstateGuideAnchor` from `SparkEstateGuideChrome`)
- default guide mount (`showSparkEstateGuideChrome` only when flipbook open)
- shared Wander submenu that nested Explore + Guide

## Preserve

- existing guide content
- approved two-page spread (`EstateGuideFlipbook` lazy)
- history content
- explicit navigation route (`openSparkEstateGuideCore`)
- Wander the Grounds → Explore Estate (`openExploreSparkVisualExplorer`)
- Return to Estate behavior

## Status

- requirement confirmed
- implementation: `implemented_preview`
- preview: see `101` live results
- production not approved
