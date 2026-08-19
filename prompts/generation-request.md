# Generation Request — copy, fill the three brackets, send

```
Refer to these files in edshop-ai/ppt-templates@main before designing:
  prompts/master-prompt.md          (technical constraints — non-negotiable)
  prompts/measured-limits.md        (how to set max_chars)
  prompts/archetypes.md             (layout briefs)
  styles/grid.json                  (shared 1280x720 geometry — snap to it)
  styles/grade-bands.json           -> band [GRADE_BAND]
  styles/subjects.json              -> subject [SUBJECT_KEY]
  schemas/manifest-schema.json      (manifest shape)
  registry.json                     (what already exists — bump versions, don't overwrite)

Generate these archetypes: [ARCHETYPE_LIST]

Deliver per archetype:
  1. {grade_band}__{subject}__{archetype}__v{n}.html
  2. {grade_band}__{subject}__{archetype}__v{n}.json   (manifest, measured max_chars)
  3. examples/{template_id}__filled.html               (every token substituted)
Plus: one contact-sheet preview page showing all templates and their filled examples,
and an updated registry.json entry per template.
Run tools/validate.mjs before delivering and state the result.
```

## Values

`GRADE_BAND` — `pre_primary` · `g1_2` · `g3_5` · `g6_8` · `g9_10` · `g11_12` · `higher_ed`

`SUBJECT_KEY` — `science_biology` · `chemistry` · `physics` · `math` ·
`history_social_studies` · `language_arts` · `computer_science_k12` · `general_default`

`ARCHETYPE_LIST` — core set, shared across subjects within a band:
`cover, agenda, section_divider, image_bullets, multi_image_grid, data_table, recall_list, closing_checklist`

Subject-specific, generate only after the core set for that band is approved:

| Subject | Add |
| --- | --- |
| science_biology | labeled_diagram, process_flow |
| chemistry | labeled_diagram, formula_derivation, data_table |
| physics | formula_derivation, process_flow, data_table |
| math | formula_derivation, process_flow, data_table |
| history_social_studies | process_flow, data_table |
| language_arts | case_study |
| computer_science_k12 | code_block, process_flow |

## Batching

One band per session, whole core set in one batch, so a single set of tokens stays consistent
across it and you review in one pass. Subject-specific archetypes come after, and inherit the
approved geometry from `grid.json` rather than being redesigned.

## Standing rules learned in review (already folded into master-prompt.md)

- No divider rule or accent line under a title.
- Shape + text composites are **sibling** top-level manifest elements, never nested
  (`step_N_badge_circle` + `step_N_number`), matching how legend swatches are reported.
- Every `role: "shape"` carries `shape_type` and `corner_radius`.
- A multi-part connector is reported as one `shape_type: "arrow"` element with its true
  bounding box plus an `arrow` sub-object giving line and head geometry.
- List pitch must exceed row content height by >=20px; last row clears the citation by >=20px.
- Every template ships with `examples/{template_id}__filled.html`.
