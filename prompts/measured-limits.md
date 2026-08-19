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
