# Archetype Briefs

Reference an archetype by its `id`. Combine with the relevant grade-band and subject/track
token files before generating.

---
### id: cover
Full-bleed background color or subtle background image. Large title (2 lines max), a smaller
subtitle/description line, a small "unit/chapter" eyebrow label above the title, and space for
one supporting illustration or icon on the right half.
Placeholders: `{{eyebrow_label}}`, `{{title}}`, `{{subtitle}}`, `{{image_url_1}}`

---
### id: agenda
Agenda slide showing 3-5 upcoming topics as a horizontal row of cards, each with a numbered
badge, short title, and one-line description. All cards equal width, evenly spaced.
Placeholders: `{{title}}`, `{{item_1_number}}`, `{{item_1_title}}`, `{{item_1_desc}}` ...
repeat per item.

---
### id: section_divider
Full-bleed accent-color background, section title centered or left-aligned, optional short
subtitle, optional small category grid (numbered list of what's covered in this section).
Placeholders: `{{section_title}}`, `{{section_subtitle}}`, `{{category_1}}` ... `{{category_n}}`

---
### id: image_bullets
One large image on one side (left or right), title + 3-5 short bullets on the other side.
Bullets should have a small colored marker (dot or icon), not a plain browser bullet.
Placeholders: `{{title}}`, `{{image_url_1}}`, `{{bullet_1}}` ... `{{bullet_n}}`

---
### id: two_card_compare
Two equal-width cards side by side, each with its own image, short title/label pill, and 2-4
bullets. Used for contrasting two related concepts.
Placeholders: `{{title}}`, `{{card_1_label}}`, `{{card_1_image_url}}`, `{{card_1_bullet_1}}`...,
`{{card_2_label}}`, `{{card_2_image_url}}`, `{{card_2_bullet_1}}`...

---
### id: multi_image_grid
A row or grid of 3-5 equal-size image cards, each with a short label pill/caption beneath it.
Used for "types of X" content.
Placeholders: `{{title}}`, `{{item_1_image_url}}`, `{{item_1_label}}` ... repeat per item (max 5)

---
### id: labeled_diagram
One large diagram/figure image, with a legend list beside it — each legend row has a small
color swatch matching a callout on the diagram, a label, and a one-line description.
Placeholders: `{{title}}`, `{{diagram_image_url}}`, `{{legend_1_color}}`, `{{legend_1_label}}`,
`{{legend_1_desc}}` ... repeat per legend item

---
### id: data_table
A clean table with a header row (2-4 columns) and 3-6 data rows. No heavy borders — use row
banding or whitespace to separate rows. Higher-ed/9-12 appropriate, not playful.
Placeholders: `{{title}}`, `{{col_1_header}}` ... `{{col_n_header}}`, `{{row_1_col_1}}` ... etc.

---
### id: process_flow
A horizontal or vertical sequence of 3-6 numbered steps, each with a short title and
description, connected by a simple arrow or connector line (not a full connecting bar — keep
it minimal).
Placeholders: `{{title}}`, `{{step_1_title}}`, `{{step_1_desc}}` ... repeat per step

---
### id: recall_list
A vertical list of 5-8 short recap statements, each with a small colored icon/dot marker at
the left. Clean, readable, used as an end-of-lesson recap.
Placeholders: `{{title}}`, `{{point_1}}` ... `{{point_n}}`

---
### id: closing_checklist
Full-bleed accent-color background (often dark), a title, and a short vertical list of 3-5
checklist items each with a checkmark icon. Used as the final slide.
Placeholders: `{{title}}`, `{{subtitle}}`, `{{item_1}}` ... `{{item_n}}`

---
### id: code_block
(Higher Ed — CS) A syntax-highlighted code panel on one side — use "JetBrains Mono" or "Source
Code Pro" for code only, both open-source, exception to the grade-band font rule — title and
2-3 explanatory bullets on the other side.
Placeholders: `{{title}}`, `{{code_content}}`, `{{language_label}}`, `{{bullet_1}}` ...
`{{bullet_n}}`

---
### id: formula_derivation
(Higher Ed — Math/Physics/Chem) A large centered formula/equation area (leave clear space —
actual math rendering will be inserted via image or MathML separately, do not attempt to
hand-code equations in CSS), with 2-4 short annotation bullets below or beside explaining each
term.
Placeholders: `{{title}}`, `{{equation_image_url}}`, `{{annotation_1}}` ... `{{annotation_n}}`

---
### id: case_study
(Higher Ed — Medicine/Engineering) A scenario/case description block, followed by 2-4
structured findings or steps (e.g. symptom → diagnosis → treatment, or problem → analysis →
solution). More text-dense than K-12 archetypes; formal tone.
Placeholders: `{{title}}`, `{{scenario_text}}`, `{{finding_1_label}}`, `{{finding_1_text}}` ...
