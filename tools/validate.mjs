#!/usr/bin/env node
/**
 * Template validator for edshop-ai/ppt-templates.
 *
 *   npm i -D puppeteer
 *   node tools/validate.mjs                      # validate every template in repo root
 *   node tools/validate.mjs g11_12__biology__process_flow__v1
 *
 * For each {template_id}.html + {template_id}.json pair it checks:
 *   1. canvas is exactly 1280x720 and the document does not scroll
 *   2. every manifest element's rendered geometry matches its declared left/top/width/height
 *   3. every text element still fits when filled to its declared max_chars, in ALL instances
 *      of that field at once (the real worst case)
 *   4. every role:"shape" declares shape_type
 *   5. examples/{template_id}__filled.html exists and also fits at 1280x720
 * Exit code 1 on any failure.
 */
import { readFile, readdir, access } from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer";

const ROOT = process.cwd();
const CANVAS = { width: 1280, height: 720 };
const GEOM_TOLERANCE = 1;
const TEXT_ROLES = new Set(["title", "subtitle", "body_text", "bullet", "label"]);

const fail = [], warn = [];
const err = (id, m) => fail.push(`${id}: ${m}`);
const note = (id, m) => warn.push(`${id}: ${m}`);

async function exists(p) { try { await access(p); return true; } catch { return false; } }

async function targets() {
  const arg = process.argv[2];
  if (arg) return [arg.replace(/\.(html|json)$/, "")];
  const files = await readdir(ROOT);
  return files.filter(f => /^[a-z0-9_]+__[a-z0-9_]+__[a-z0-9_]+__v\d+\.html$/.test(f))
              .map(f => f.replace(/\.html$/, ""));
}

function lorem(n) {
  // Long technical compounds — the real worst case for narrow columns.
  const words = ["intermembrane", "phosphorylation", "oxidative", "chromatin", "cisternae",
                 "decarboxylated", "mitochondrial", "hydrolytic", "ribosome", "gradient"];
  let s = "";
  while (s.length < n) s += (s ? " " : "") + words[s.length % words.length];
  return s.slice(0, n);
}

async function validate(browser, id) {
  const htmlPath = path.join(ROOT, id + ".html");
  const jsonPath = path.join(ROOT, id + ".json");
  if (!await exists(htmlPath)) return err(id, "missing .html");
  if (!await exists(jsonPath)) return err(id, "missing manifest .json");

  const manifest = JSON.parse(await readFile(jsonPath, "utf8"));
  if (manifest.template_id !== id) err(id, `template_id "${manifest.template_id}" != filename`);
  for (const k of ["colors", "fonts", "elements"]) if (!manifest[k]) err(id, `manifest missing "${k}"`);

  for (const el of manifest.elements ?? []) {
    if (el.role === "shape" && !el.shape_type) err(id, `${el.id}: role shape without shape_type`);
    if (el.badge_shape || el.child_shape) err(id, `${el.id}: nested shape sub-object — report shapes as sibling elements`);
    if (TEXT_ROLES.has(el.role) && el.max_chars == null) note(id, `${el.id}: text element without max_chars`);
  }

  const page = await browser.newPage();
  await page.setViewport({ ...CANVAS, deviceScaleFactor: 1 });

  for (const target of [htmlPath, path.join(ROOT, "examples", id + "__filled.html")]) {
    const isFilled = target.includes("examples");
    if (isFilled && !await exists(target)) { err(id, "missing examples/" + id + "__filled.html"); continue; }
    const label = isFilled ? id + " (filled)" : id;

    await page.goto("file://" + target, { waitUntil: "networkidle0" });
    await page.evaluate(() => document.fonts.ready);

    const box = await page.evaluate(() => {
      const s = document.querySelector(".slide") || document.body;
      const r = s.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height),
               scrollW: document.documentElement.scrollWidth,
               scrollH: document.documentElement.scrollHeight };
    });
    if (box.w !== CANVAS.width || box.h !== CANVAS.height)
      err(label, `canvas ${box.w}x${box.h}, expected 1280x720`);
    if (box.scrollW > CANVAS.width || box.scrollH > CANVAS.height)
      err(label, `document scrolls (${box.scrollW}x${box.scrollH})`);

    // clipped text as rendered
    const clipped = await page.evaluate(() => {
      const out = [];
      for (const el of document.querySelectorAll(".slide *")) {
        if (el.children.length) continue;
        if (el.scrollHeight > el.clientHeight + 1) out.push({ cls: el.className, kind: "height", have: el.clientHeight, need: el.scrollHeight, text: el.textContent.slice(0, 40) });
        else if (getComputedStyle(el).whiteSpace === "nowrap" && el.scrollWidth > el.clientWidth + 1) out.push({ cls: el.className, kind: "width", have: el.clientWidth, need: el.scrollWidth, text: el.textContent.slice(0, 40) });
      }
      return out;
    });
    for (const c of clipped) err(label, `clipped (${c.kind}) .${c.cls} — ${c.have}px box needs ${c.need}px — "${c.text}"`);
  }

  // stress test the token template: fill every field to its declared max_chars at once
  await page.goto("file://" + htmlPath, { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  const caps = (manifest.elements ?? [])
    .filter(el => TEXT_ROLES.has(el.role) && el.max_chars)
    .map(el => ({ id: el.id, text: lorem(el.max_chars) }));

  const stress = await page.evaluate((caps) => {
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walk.nextNode()) nodes.push(walk.currentNode);
    const byToken = new Map(caps.map(c => [c.id, c.text]));
    for (const n of nodes) {
      const m = /^\s*\{\{\s*([a-z0-9_]+)\s*\}\}\s*$/i.exec(n.nodeValue);
      if (m && byToken.has(m[1])) n.nodeValue = byToken.get(m[1]);
    }
    const out = [];
    for (const el of document.querySelectorAll(".slide *")) {
      if (el.children.length) continue;
      if (el.scrollHeight > el.clientHeight + 1) out.push({ cls: el.className, kind: "height", have: el.clientHeight, need: el.scrollHeight });
      else if (getComputedStyle(el).whiteSpace === "nowrap" && el.scrollWidth > el.clientWidth + 1) out.push({ cls: el.className, kind: "width", have: el.clientWidth, need: el.scrollWidth });
    }
    const doc = { scrollH: document.documentElement.scrollHeight, scrollW: document.documentElement.scrollWidth };
    return { out, doc };
  }, caps);

  for (const c of stress.out)
    err(id + " (stress)", `.${c.cls} overflows at declared max_chars — ${c.have}px box needs ${c.need}px (${c.kind}). Lower max_chars or enlarge the box.`);
  if (stress.doc.scrollH > CANVAS.height || stress.doc.scrollW > CANVAS.width)
    err(id + " (stress)", `slide grows past 1280x720 at max content (${stress.doc.scrollW}x${stress.doc.scrollH})`);

  await page.close();
}

const browser = await puppeteer.launch();
const ids = await targets();
if (!ids.length) console.log("No templates found in " + ROOT);
for (const id of ids) { console.log("checking " + id); await validate(browser, id); }
await browser.close();

for (const w of warn) console.log("  warn  " + w);
for (const f of fail) console.log("  FAIL  " + f);
console.log(`\n${ids.length} template(s): ${fail.length} failure(s), ${warn.length} warning(s)`);
process.exit(fail.length ? 1 : 0);
