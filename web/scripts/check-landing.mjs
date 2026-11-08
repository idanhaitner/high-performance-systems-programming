// Browser checks for the home page. Run with the dev server up: npm run check:landing
// Optional: BASE_URL=http://localhost:8732 ONLY=board,targets
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:8732";
const ONLY = process.env.ONLY?.split(",");
const WIDTHS = [1440, 1024, 768, 390];
const failures = [];
const consoleErrors = [];

function expect(group, ok, message) {
  if (!ok) failures.push(`[${group}] ${message}`);
}

async function open(browser, width, options = {}) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, ...options });
  const page = await context.newPage();
  page.on("console", (m) => m.type() === "error" && consoleErrors.push(`${width}: ${m.text()}`));
  page.on("pageerror", (e) => consoleErrors.push(`${width}: ${e.message}`));
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  return { context, page };
}

const groups = {
  async "cards-padded"(browser) {
    for (const width of WIDTHS) {
      const { context, page } = await open(browser, width);
      const pads = await page.$$eval(".how-card, .bento-tile", (els) =>
        els.map((el) => [getComputedStyle(el).paddingLeft, getComputedStyle(el).paddingRight]),
      );
      pads.forEach(([left, right], i) =>
        expect("cards-padded", parseFloat(left) >= 24 && parseFloat(right) >= 24, `${width}px card ${i}: padding ${left} / ${right}`),
      );
      await context.close();
    }
  },

  async board(browser) {
    const { context, page } = await open(browser, 1440);
    const box = await page.locator(".pboard-canvas").boundingBox();
    expect("board", !!box && box.width > 200 && Math.abs(box.width - box.height) < 2, "the hero progress canvas is missing or not square");
    await context.close();
    // With reduced motion the picture is still there, just still.
    const still = await open(browser, 1440, { reducedMotion: "reduce" });
    expect("board", (await still.page.locator(".pboard-canvas").count()) === 1, "with reduced motion the board is missing");
    await still.context.close();
  },

  async ladder(browser) {
    const { context, page } = await open(browser, 1440);
    await page.waitForTimeout(300);
    await page.evaluate(() => document.querySelector(".ladder-step:nth-child(3)").scrollIntoView({ block: "center" }));
    await page.waitForTimeout(900);
    const state = await page.evaluate(() => ({
      on: [...document.querySelectorAll(".ladder-row")].map((row) => row.classList.contains("is-on")),
      readout: [...document.querySelectorAll(".ladder-readout")].findIndex((el) => el.classList.contains("is-active")),
    }));
    expect("ladder", state.readout === 2, `the big number shows step ${state.readout + 1}, expected 3`);
    expect("ladder", state.on.join() === "true,true,true,false", `rows filled: ${state.on.join()}`);
    await context.close();
    // Without motion the whole chart is already filled in.
    const still = await open(browser, 1440, { reducedMotion: "reduce" });
    const filled = await still.page.$$eval(".ladder-row", (rows) => rows.every((row) => row.classList.contains("is-on")));
    expect("ladder", filled, "with reduced motion the ladder chart is not fully filled");
    await still.context.close();
  },

  async "no-overflow"(browser) {
    for (const width of WIDTHS) {
      const { context, page } = await open(browser, width);
      const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect("no-overflow", wide <= 0, `${width}px: the page scrolls sideways by ${wide}px`);
      await context.close();
    }
  },

  async "tagline-readable"(browser) {
    const fullInk = async (page) =>
      page.$$eval(".tagline-word", (els) => els.every((el) => !/\/ 0\.[0-9]|, 0\.[0-9]+\)$/.test(getComputedStyle(el).color)));
    let { context, page } = await open(browser, 1440, { javaScriptEnabled: false });
    expect("tagline-readable", await fullInk(page), "without JavaScript the tagline words are dimmed");
    await context.close();
    ({ context, page } = await open(browser, 1440, { reducedMotion: "reduce" }));
    await page.waitForTimeout(300);
    expect("tagline-readable", await fullInk(page), "with reduced motion the tagline words are dimmed");
    await context.close();
    ({ context, page } = await open(browser, 1440));
    await page.waitForTimeout(300);
    const dimAtTop = await page.$$eval(".tagline-word", (els) => els.some((el) => !el.classList.contains("is-lit")));
    expect("tagline-readable", dimAtTop, "with motion allowed the words should start dim and light on scroll");
    await page.locator(".how").scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    expect("tagline-readable", await fullInk(page), "after scrolling past, the tagline is not fully lit");
    await context.close();
  },

  async motion(browser) {
    const { context, page } = await open(browser, 1440);
    const slow = await page.evaluate(() => {
      const out = [];
      for (const sel of [".landing-cta", ".deck-grid a", ".pboard-canvas", ".landing-links a", ".deck-session", ".landing-toggle span"]) {
        const el = document.querySelector(sel);
        if (!el) continue;
        const max = Math.max(...getComputedStyle(el).transitionDuration.split(",").map((s) => parseFloat(s)));
        if (max > 0.3) out.push(`${sel} ${max}s`);
      }
      return out;
    });
    slow.forEach((s) => expect("motion", false, `transition slower than 300ms: ${s}`));
    await context.close();

    const touch = await open(browser, 390, { hasTouch: true, isMobile: true });
    await touch.page.locator(".deck-grid a").first().scrollIntoViewIfNeeded();
    await touch.page.locator(".deck-grid a").first().hover();
    await touch.page.waitForTimeout(300);
    const transform = await touch.page.$eval(".deck-grid a", (el) => getComputedStyle(el).transform);
    expect("motion", transform === "none", `touch: lesson card moved on hover (${transform})`);
    await touch.context.close();
  },

  async targets(browser) {
    const { context, page } = await open(browser, 390);
    const small = await page.$$eval(".landing-nav .landing-bar a, .landing-nav button, .landing-foot a", (els) =>
      els
        .filter((el) => el.getClientRects().length)
        .map((el) => [el.textContent.trim() || el.getAttribute("aria-label"), el.getBoundingClientRect()])
        .filter(([, r]) => r.height < 44 || r.width < 44)
        .map(([name, r]) => `${name} ${Math.round(r.width)}x${Math.round(r.height)}`),
    );
    small.forEach((s) => expect("targets", false, `390px tap target under 44px: ${s}`));
    await context.close();
    const wide = await open(browser, 1024);
    const linksShown = await wide.page.$eval(".landing-links", (el) => getComputedStyle(el).display !== "none");
    expect("targets", linksShown, "1024px: the nav section links are hidden");
    await wide.context.close();
  },

  async hierarchy(browser) {
    const { context, page } = await open(browser, 1440);
    const [h1, tagline] = await page.evaluate(() => [
      parseFloat(getComputedStyle(document.querySelector(".hero h1")).fontSize),
      parseFloat(getComputedStyle(document.querySelector(".tagline p")).fontSize),
    ]);
    expect("hierarchy", h1 > tagline, `hero h1 ${h1}px is not larger than tagline ${tagline}px`);
    const borders = await page.$$eval(".bento-tile", (els) => els.map((el) => getComputedStyle(el).borderTopWidth));
    borders.forEach((b, i) => expect("hierarchy", b === "2px", `bento tile ${i + 1} border ${b}`));
    await context.close();
  },

  async progress(browser) {
    let { context, page } = await open(browser, 1440);
    await page.waitForTimeout(300);
    const empty = await page.locator(".deck .chapter-progress").count();
    expect("progress", empty === 0, `first visit shows ${empty} empty progress bars`);
    // Solve the first practice of lesson 1, then the deck should show progress for it.
    const lesson = await page.locator(".deck-grid a").first().getAttribute("href");
    await page.goto(`${BASE}${lesson}`, { waitUntil: "networkidle" });
    const practiceId = await page.$eval("article.card.practice[id]", (el) => el.id);
    await page.evaluate((id) => localStorage.setItem("study:high-performance-systems", JSON.stringify({ solved: [id] })), practiceId);
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    const shown = await page.locator(".deck-grid li:first-child .chapter-progress").count();
    expect("progress", shown === 1, "after solving a practice, lesson 1 shows no progress");
    await context.close();
  },

  async "practice-button-readable"(browser) {
    const luminance = (rgb) => {
      const [r, g, b] = rgb.match(/[\d.]+/g).map((v) => {
        const c = Number(v) / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    for (const colorScheme of ["light", "dark"]) {
      const { context, page } = await open(browser, 1440, { colorScheme });
      const [color, background] = await page.$eval(".deck-lecture:not([hidden]) .deck-practice-go", (el) => {
        const style = getComputedStyle(el);
        return [style.color, style.backgroundColor];
      });
      const [lighter, darker] = [luminance(color), luminance(background)].sort((a, b) => b - a);
      const ratio = (lighter + 0.05) / (darker + 0.05);
      expect("practice-button-readable", ratio >= 4.5, `${colorScheme}: Start practice contrast is ${ratio.toFixed(2)}, needs 4.5`);
      await context.close();
    }
  },
};

const browser = await chromium.launch();
for (const [name, run] of Object.entries(groups)) {
  if (ONLY && !ONLY.includes(name)) continue;
  try {
    await run(browser);
  } catch (error) {
    failures.push(`[${name}] crashed: ${error.message.split("\n")[0]}`);
  }
}
await browser.close();
consoleErrors.forEach((e) => failures.push(`[console] ${e}`));

if (failures.length) {
  console.log(failures.join("\n"));
  console.log(`\n${failures.length} problem(s).`);
  process.exit(1);
}
console.log("Landing checks passed.");
