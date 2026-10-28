// Browser checks for the home page. Run with the dev server up: npm run check:landing
// Optional: BASE_URL=http://localhost:8732 ONLY=fan-front,targets
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
      const pads = await page.$$eval(".how-card, .benefits li", (els) =>
        els.map((el) => [getComputedStyle(el).paddingLeft, getComputedStyle(el).paddingRight]),
      );
      pads.forEach(([left, right], i) =>
        expect("cards-padded", left === "24px" && right === "24px", `${width}px card ${i}: padding ${left} / ${right}`),
      );
      await context.close();
    }
  },

  async "fan-front"(browser) {
    for (const width of [1440, 390]) {
      const { context, page } = await open(browser, width);
      const count = await page.locator(".fan a").count();
      for (let i = 0; i < count; i++) {
        await page.locator(".fan a").nth(i).focus();
        await page.waitForTimeout(300);
        const front = await page.evaluate((index) => {
          const title = document.querySelectorAll(".fan-title")[index];
          const box = title.getBoundingClientRect();
          return title.closest("li").contains(document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2));
        }, i);
        expect("fan-front", front, `${width}px: focused card ${i + 1} is covered by another card`);
      }
      await page.evaluate(() => document.activeElement?.blur());
      await context.close();
    }
    // A still pointer must keep pointing at the same card while the fan reacts.
    const { context, page } = await open(browser, 1440);
    // Find a point where card 2 is on top at rest, then park the pointer there.
    const [x, y] = await page.evaluate(() => {
      const box = document.querySelectorAll(".fan-num")[1].getBoundingClientRect();
      for (let px = box.left; px < box.right; px += 2) {
        const py = box.top + box.height / 2;
        const li = document.elementFromPoint(px, py)?.closest(".fan li");
        if (li && [...li.parentNode.children].indexOf(li) === 1) return [px, py];
      }
      return [box.left, box.top];
    });
    await page.mouse.move(x, y);
    const seen = new Set();
    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(70);
      seen.add(await page.evaluate(([px, py]) => {
        const li = document.elementFromPoint(px, py)?.closest(".fan li");
        return li ? [...li.parentNode.children].indexOf(li) : -1;
      }, [x, y]));
    }
    expect("fan-front", seen.size === 1 && seen.has(1), `hover over card 2 drifted across cards ${[...seen].join(",")}`);
    await context.close();
  },

  async "fan-opaque"(browser) {
    for (const colorScheme of ["light", "dark"]) {
      const { context, page } = await open(browser, 1440, { colorScheme });
      const alphas = await page.$$eval(".fan a", (els) =>
        els.map((el) => {
          const m = getComputedStyle(el).backgroundColor.match(/[\d.]+/g).map(Number);
          return m.length === 4 ? m[3] : 1;
        }),
      );
      alphas.forEach((a, i) => expect("fan-opaque", a === 1, `${colorScheme}: fan card ${i + 1} background alpha ${a}`));
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
      for (const sel of [".landing-cta", ".deck-grid a", ".fan a", ".fan li", ".landing-links a", ".deck-session", ".landing-toggle span"]) {
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
    const borders = await page.$$eval(".benefits li", (els) => els.map((el) => getComputedStyle(el).borderTopWidth));
    borders.forEach((b, i) => expect("hierarchy", b === "2px", `benefit tile ${i + 1} border ${b}`));
    await context.close();
    const phone = await open(browser, 390);
    const lines = await phone.page.$eval(".fan li:last-child .fan-title", (el) =>
      Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight)),
    );
    expect("hierarchy", lines <= 2, `390px: top fan card title wraps to ${lines} lines`);
    await phone.context.close();
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
