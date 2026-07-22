# 375 — Visual Connection Runtime & Data Flow Implementation

## Purpose

Define how automatic visual views are generated from existing platform data.

## Runtime flow

1. receive creation or visual event
2. resolve active object
3. detect meaningful relationships
4. create or update canonical relationships
5. determine whether a visual should be built
6. select the most useful visual type
7. rank relationship relevance
8. apply energy and complexity limits
9. generate focused visual model
10. decide whether to display now or keep available
11. allow navigation and correction
12. persist view state
13. update only through canonical services

## Visual model

```yaml
visual_view:
  view_id:
  view_type:
  anchor_object_id:
  purpose:
  auto_generated:
  generated_reason:
  node_ids:
  relationship_ids:
  hidden_node_ids:
  expanded_node_ids:
  selected_node_id:
  filters:
  focus_depth:
  layout_preferences:
  user_modified:
  created_at:
  updated_at:
```

## Rendering separation

Rendering logic must remain separate from relationship truth.

Different views may render the same canonical relationships differently.

## Performance

- lazy-load branches
- aggregate large clusters
- cache layout, not canonical content
- avoid loading the entire estate graph
- support incremental updates
- preserve exact visual resume
