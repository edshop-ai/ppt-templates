# Measured Limits — how to set `max_chars` (always include)

Every `max_chars` in a manifest is a **measured** value, never an estimate. A guessed cap is
worse than no cap: the fill script trusts it and emits clipped slides. Three review rounds on
`g11_12__biology` were spent on exactly this.

## Rule

For each text element, before writing the manifest:

1. Render the template with a string of the proposed max length in **every** instance of that
   field simultaneously (not one instance — a list of five rows each at max length is the real
   worst case).
2. Compare `scrollHeight` to `clientHeight` (wrapping fields) or `scrollWidth` to
   `clientWidth` (`white-space: nowrap` fields).
3. If it overflows, reduce and repeat. Binary-sweep to the largest string that fits.
4. Subtract a safety margin of ~10% for wide glyph runs (uppercase, numerals, chemical
   formulae, long technical compounds).
5. Write that number as `max_chars`, and state the reasoning in `notes.guidance`.

`tools/validate.mjs` automates steps 1-2 — run it before delivering, not after review.

## Two ways measurement itself goes wrong

Both of these shipped once and had to be corrected in review. `tools/validate.mjs`
now fails the build on either.

**1. Measuring before the webfont loads.** A sweep run against the fallback font records
caps that are far too generous. Before measuring, force-load every font/size/weight the
template actually uses and confirm it:

    for (const spec of specs) await document.fonts.load(spec);   // '700 38px "Andika"'
    await document.fonts.ready;
    if (!document.fonts.check(spec)) throw new Error('measured against a fallback');

**2. Sizing a box to nominal line-height instead of the font's intrinsic line box.**
Fonts differ enormously here. Measure the real ratio with `line-height: normal`:

| Font | Intrinsic line box |
| --- | --- |
| Andika | 1.62x font-size |
| Caveat | 1.38x font-size |
| Inter | ~1.21x font-size |
| Source Serif 4 | ~1.25x font-size |

Set `line-height >= intrinsic ratio x font-size`, then `height = lines x line-height`
plus a few px of safety. A box at 1.16x for a 1.62x font clips every single element on
the page, which is how one whole style shipped broken.

**Filler text matters too.** Lowercase-only words understate vertical ink. Use mixed case
with capitals and descenders — `Wonderful Ágjpqy` — alongside the long-compound words.

**Placeholder tokens are not content.** When sweeping a token template, skip elements
whose text is still `{{token}}`: the literal placeholder is often wider than any real
value (`{{item_1_number}}` versus `1`) and produces false failures.

## Why estimates fail

Characters-per-line is not width ÷ average glyph width. Narrow columns break early on long
words: a 152px column at 17px Source Serif 4 fits ~19 characters of ordinary prose but only
~12 when the text contains words like "intermembrane" or "phosphorylation", because the whole
word wraps. Subject vocabulary makes science templates the worst case in the whole system.

## Derivation, as a sanity check only

    lines_available = box_height / line_height
    chars_per_line  = (column_width / (font_size_px * 0.5))  <- prose only
    estimate        = lines_available * chars_per_line * 0.7 <- long-word penalty

Use this to pick a *starting* value to measure, never as the delivered number.

## Measured caps — g11_12 (Inter heading / Source Serif 4 body)

| Field | Box | Type | Measured cap |
| --- | --- | --- | --- |
| `title` | 1152x44, nowrap | Inter 26pt | 64 |
| `eyebrow_label` | 1152x20, nowrap | Inter 10pt | 60 |
| `intro_line` | 900x48, 2 lines | Serif 14pt | 180 |
| `legend_N_label` | 414x22, nowrap | Inter 14pt | 34 (39 exactly fills) |
| `legend_N_desc` | 414x44, 2 lines | Serif 13pt | 96 |
| `step_N_title` | 152x56, 2 lines | Inter 16pt | 23 (24+ clips a 3rd line) |
| `step_N_desc` | 152x161, 7 lines | Serif 13pt | 80 |
| `takeaway` | 1152x52, 2 lines | Serif 14pt | 220 |
| `source_citation` | 1152x18, nowrap | Inter 9pt | 90 |

Narrow-column fields (`step_N_*`) scale roughly with band body size; re-measure per band
rather than reusing these numbers outside g11_12.

## Numeric fields

A cap measured with letter filler is meaningless for a digits-only field: a capital W is far
wider than any numeral. Report those as `max_chars: 2` with a `value_note` saying digits
only, rather than passing through a measured 1.

## Caps belong to one face, not to a stack

A `max_chars` value is a property of the FACE it was measured in. Every sensible fallback is
wider than its primary — a stack is chosen for letterform fidelity, not for identical advance
widths — so a cap measured in Andika will clip in Comic Sans MS.

This is the real reason the handwriting variants rasterize on export. It is not only that
Arial destroys the look; it is that any substitution invalidates every cap on the slide, and
the tightest fields (a 9-character picture-word label) have no slack to absorb it.

If you ever ship those variants as native text, re-measure against the actual fallback, or
apply a conservative 0.85 factor to every cap. `styles/styles.json` carries the stacks under
`font_fallbacks`, with the reasoning for each choice and the faces explicitly rejected.

## One source of truth

Generate the template HTML and its manifest from the SAME geometry spec, in one pass. When
they are authored separately they drift, and the filled example then disagrees with the
manifest that your generator reads — which makes the example useless as a QA artifact.
`validate.mjs` cross-checks all three.
