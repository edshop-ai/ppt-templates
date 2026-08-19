# Master Prompt — Technical Constraints (always include, unchanged, every generation)

You are designing a REUSABLE SLIDE TEMPLATE, not a one-off slide. This template will later be
filled with dynamic data by a script, and separately converted to PowerPoint XML. Follow these
constraints exactly — they are non-negotiable, not style suggestions.

## Canvas
Exactly 1280x720px, 16:9. The outer container must be exactly this size, no scrolling, no
content overflow past the edge under any content variation (see "content stress test" below).

## Positioning
Every text block, image, and shape must use CSS `position: absolute` with explicit `left`,
`top`, `width`, `height` in px, set on the element itself (not inherited from a flex/grid
parent). Flexbox/grid MAY be used only *inside* a single component for minor alignment (e.g.
centering an icon in a badge), never for overall slide layout.

## Fonts
Use ONLY fonts supplied in the grade-band token file for this generation (see
`styles/grade-bands.json`), unless the archetype brief explicitly allows an exception (e.g.
monospace for code blocks). Import via a single Google Fonts `@import` or `<link>`. State
clearly at the top of your response which font(s) and weights you used. No custom/uploaded
fonts, no font-face tricks, no icon fonts — use inline SVG for icons.

## Color
All colors as hex, no CSS variables that resolve at runtime beyond a single `:root` block
listing every color used with a plain-language name (e.g. `--accent-green: #2F7A4F;`). Use the
palette supplied in the grade-band token file. List the hex values again in plain text in your
response, not just in CSS. No gradients as fills on shapes that will need to become PPTX
shapes (gradients on a background IMAGE are fine — they'll get flattened to a picture).

## Content placeholders
Use `{{token_name}}` syntax for every piece of dynamic content: `{{title}}`, `{{subtitle}}`,
`{{bullet_1}}` through `{{bullet_n}}`, `{{image_url_1}}` etc., `{{accent_color}}` if the theme
color should be swappable per-deck. Every image must be a real `<img src="{{image_url_N}}">`,
never a CSS background-image, so a script can swap the source.

## Content stress test
Before returning your answer, re-render the template mentally with: a title 40% longer than
your example, one extra bullet, and one fewer bullet. Confirm nothing overflows or overlaps.
If long content would break the layout, state the max safe character count for each text field
in your response.

## Shape + text composites (badges, pills, labeled swatches)
Whenever a design element is a shape with text on top of it (a numbered circle badge, a pill
label, a swatch with a caption beside it), report the shape and the text as two separate
sibling entries in the manifest `elements` array — never nest one inside the other. Each gets
its own `id`, its own `role` (`shape` for the background, `label` or `body_text` for the
text), and its own `left/top/width/height`. This is the same pattern already used for legend
swatches (`legend_1_color` as its own shape element, `legend_1_label` as its own text
element) — apply it everywhere a shape carries text, including step-number badges. A
conversion script walks one flat list of typed elements; a nested sub-object breaks that
walk and needs special-casing per archetype, which doesn't scale across 20+ templates.

## Filled example (required every time)
Along with the token template and manifest, always also deliver a second HTML file with
every `{{token}}` replaced by realistic sample content for the stated grade band and subject
— named `{template_id}__filled.html`. Use content lengths that vary across the max_chars
range (not all minimum, not all maximum) so the filled example itself is a useful visual QA
artifact, not just a demo. This filled file is a required deliverable, not optional — a
template isn't considered delivered without it.

## Deliverable format
Return exactly four things, in this order:

1. A single self-contained HTML file (inline CSS in a `<style>` tag, no external CSS files) —
   the token template
2. A second self-contained HTML file — the filled example (see above)
3. A JSON layout manifest matching `schemas/manifest-schema.json` exactly, with every shape
   element carrying `shape_type` and, where relevant, `corner_radius`
4. A one-paragraph note on which content field is most likely to overflow, and your
   recommended max character/word count for it

## Forbidden decoration
Do not add decorative elements not requested by the archetype brief. Do not use accent lines
or stripes under titles, side bars, or "single-side borders" on cards/rectangles — use
whitespace, background tint, or a subtle card shadow instead. Do not default to cream/beige
backgrounds unless the grade-band token file specifies one.
