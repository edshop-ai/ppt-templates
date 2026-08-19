# Status — slide template system

Last updated: 2026-08-19

Read this first, then `registry.json`, `styles/styles.json`, and `prompts/measured-limits.md`.
Those three files are the contract; this one is the orientation.

## What exists

104 templates, each with a manifest (`.json`) and a filled example
(`examples/{template_id}__filled.html`). All 1280×720, absolutely positioned px.

| Style | Subject | Bands | Templates | Export |
| --- | --- | --- | --- | --- |
| `clean` (default) | all — the g11_12 core set | g11_12 | 10 | editable |
| `notebook` | language_arts | g1_2, g3_5, g6_8 | 30 | rasterize / rasterize / editable |
| `grid_studio` | math | g1_2, g3_5, g6_8 | 24 | rasterize / rasterize / editable |
| `field_lab` | science | g1_2, g3_5, g6_8 | 24 | rasterize / rasterize / editable |
| `archive_desk` | social_studies | g3_5, g6_8 | 16 | rasterize / editable |

The two `g11_12__biology__*` templates are **superseded** by the `__core__` pair (geometry was
subject-agnostic, so it moved to the core slot). Registry records the supersession.

## Architecture, in one paragraph

A template is identified by **grade_band × subject × archetype × style**. `style` is an optional
request param; absent or inapplicable, it falls back to `clean` **per slide**, not per deck.
A style is a **surface** (paper, palette, frame idiom, fonts) plus a **grammar** (its own named
archetype set, surfaced per slide in `stage_label`, which teachers navigate by). A style is
band-agnostic; its **variants** are band-specific — type scale, letterforms, item counts and
export mode change with band, surface and grammar never do. Shared geometry lives in
`styles/grid.json`; per-subject palettes in `styles/subject-accents.json`.

## Settled decisions — do not re-open without evidence

- **Band boundaries** are `g1_2 / g3_5 / g6_8 / g9_10 / g11_12`. Target schools genuinely group
  grades 3–5. Any earlier `g1_3 / g4_5` proposal is superseded. Recorded in both
  `registry.json` (`decisions.band_boundaries`) and `styles.json` (`band_boundaries`).
- **Colour direction** for the clean g11_12 set is the subject colour field (accent header with
  reverse type, white panels on a tinted page, full-bleed accent on cover/divider/closing).
- **Export mode is per variant**, never per style. Handwriting faces rasterize; Inter and
  Source Serif 4 variants stay natively editable.
- **Image policy** is per style. `archive_desk` is strictest: archival/extracted only, never
  generated, because an invented artefact or a wrong coastline teaches something false.

## Five rules learned the hard way — a new session should not rediscover these

1. **Measure caps in the browser with the webfont confirmed loaded.** `document.fonts.load()` per
   exact weight/size, then `document.fonts.check()`. A sweep against a fallback records caps
   that are far too generous. This shipped once and had to be corrected.
2. **Size text boxes from the face's intrinsic line box, not the nominal font size.** Andika
   1.62×, Caveat 1.38×, Source Serif 4 1.25×, Inter 1.21× — and at display sizes (≥150px) even
   those understate it; the 180px section number needed 1.4×. Box = lines × line-height + safety.
3. **Derive dependent positions from each other, never from independent anchors.** Two elements
   pinned to different things will collide the moment a type size changes, and a clipping check
   won't catch it because each box overflows its *neighbour*, not itself. Check bounds and
   pairwise text-box overlap in the spec before emitting.
4. **Generate template HTML and its manifest from one geometry spec, in one pass.** Authored
   separately they drift, and the filled example then contradicts the manifest the generator
   reads — which makes the example useless as a QA artifact.
5. **Check contrast at the smallest variant, not the largest.** The younger bands pass on size
   alone; the g6_8 variants nearly shipped with 3.3:1 label text. Decorative colours (rules,
   markers, tape) and text colours are separate roles — `pen`/`pencil` vs `pen_text`/`pencil_text`.

Filler for measurement must be mixed case with capitals and descenders (`Wonderful Ágjpqy`);
lowercase-only understates vertical ink. Skip elements still holding `{{token}}` — the literal
placeholder is often wider than any real value.

## Repo files this project adds

```
STATUS.md                      this file
registry.json                  index of every template + decisions + next_up
styles/grid.json               shared 1280x720 geometry contract
styles/styles.json             the style axis: surfaces, grammars, variants, fallbacks
styles/subject-accents.json    palette per subject × band treatment
styles/subjects.additions.json two keys to merge into subjects.json (electronics, computer_science)
prompts/measured-limits.md     how to set max_chars, and the failure modes
prompts/generation-request.md  fill-in-the-brackets request template
tools/validate.mjs             puppeteer checker — run before delivering
```

`validate.mjs` checks canvas size, manifest-vs-DOM geometry, webfont load, intrinsic line box
sufficiency, clipped text, example copy vs manifest caps, and the all-fields-at-max stress test.
`npm i -D puppeteer && node tools/validate.mjs`.

## Where the manifests go

The **manifests are what the generator consumes** — copy them to `videoCreatorSvc/templates/`
along with `styles/subject-accents.json` and `styles/styles.json`. The HTML is the design source
and the review artifact; keep it in `ppt-templates` so `validate.mjs` can check the pair, but the
service never reads it.

## Next up

1. **9–10 academic surfaces**, science first. Polished academic / documentary tier.
2. **11–12 Exam Mastery grammar** on the existing clean surface — likely the highest classroom
   value of anything remaining, and needs no new surface: Key Concept / NCERT Must-Know /
   Common Mistake / Board Question Pattern / Derivation / Previous-Year Question / 30-second
   Revision. This is the case that argued for separating surface from grammar.
3. **Contrast pass** over the g1_2 and g3_5 variants of notebook, grid_studio and field_lab.
   They pass on size, but were checked less rigorously than the g6_8 variants and archive_desk.
4. **Imagery pipeline.** Every style currently ships striped placeholder figures. This, not
   template design, is what will decide whether the mature 9–12 styles read as premium or
   unfinished — those surfaces lean on real photography, microscopy and schematics.

## Open questions

- Which board's grade groupings apply above grade 8 — does `g9_10` match how those schools
  actually stage senior secondary?
- Does `clean` need variants below g11_12, or do the subject styles cover every band that
  matters? Today `clean` exists only at g11_12.
- For Exam Mastery: is it a grammar riding the clean surface (recommended) or its own style?
