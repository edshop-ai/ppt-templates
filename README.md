# Slide Template System

Source-of-truth repo for generating PPTX-convertible HTML/CSS slide templates via Claude
Design. Every template you generate should be produced by pointing Claude Design at the
files here, not by re-typing style rules from memory each time.

## Structure

```
prompts/
  master-prompt.md      # non-negotiable technical constraints — always include
  archetypes.md          # the ~13 layout archetypes and their content briefs
styles/
  grade-bands.json        # density/tone/font/color tokens per grade band
  subjects.json            # K-12 subject-specific archetype additions + image policy
  higher-ed-tracks.json    # higher-ed track-specific archetype additions + image policy
schemas/
  manifest-schema.json   # required shape of the JSON layout manifest every template must return
examples/
  (accepted templates land here once approved — see naming convention below)
```

## How to invoke Claude Design

Paste something like this, replacing the bracketed parts and swapping in real raw GitHub URLs
once this is pushed:

```
Refer to these files before designing:
1. Master constraints: https://raw.githubusercontent.com/{org}/{repo}/main/prompts/master-prompt.md
2. Archetype brief for "two_card_compare": https://raw.githubusercontent.com/{org}/{repo}/main/prompts/archetypes.md
3. Style tokens for grade band "g1_2": https://raw.githubusercontent.com/{org}/{repo}/main/styles/grade-bands.json
4. Subject overlay for "science": https://raw.githubusercontent.com/{org}/{repo}/main/styles/subjects.json
5. Required output manifest shape: https://raw.githubusercontent.com/{org}/{repo}/main/schemas/manifest-schema.json

Generate the "two_card_compare" template for grade band "g1_2", subject "science", following
the master constraints exactly and using the grade-band + subject tokens for color/font/density/
tone. Return the manifest matching the required schema.
```

Because the master prompt, tokens, and manifest schema are all in one place, you can update a
color palette or a font choice once in `grade-bands.json` and every future generation picks it
up — no re-explaining style rules in every conversation.

## Naming convention for finished templates

```
{grade_band}__{subject_or_track}__{archetype}__v{n}.html
{grade_band}__{subject_or_track}__{archetype}__v{n}.json     (the manifest)
```

Examples:
```
g1_2__science__two_card_compare__v1.html
g11_12__biology__labeled_diagram__v1.html
highered__cs__code_block__v1.html
highered__medicine__labeled_diagram__v1.html
```

Most archetypes (cover, agenda, section_divider, image_bullets, recall_list,
closing_checklist) are shared across subjects within a band — you generally only need
subject/track-specific variants for the specialized archetypes (labeled_diagram, code_block,
formula_derivation, data_table, process_flow, case_study). Expect ~20-25 templates total
rather than one per band×subject combination.

## Suggested generation order

1. Pick one grade band. Generate all core archetypes for it, in one sitting, so the same
   color/font tokens stay consistent across the batch.
2. Move to the next band.
3. Do subject/track-specific archetypes last, once you know which core archetypes carry over
   unchanged.

## Versioning

Bump `v1` → `v2` etc. rather than overwriting — keeps a history of what your pipeline has
actually been generating from, useful if a template needs a fix later and you need to know
which decks used the old version.
