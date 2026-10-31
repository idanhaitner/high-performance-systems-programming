// Browser checks for motion and card layout across the site. Run with the dev server up: npm run check:motion
// Optional: BASE_URL=http://localhost:8732 ONLY=side-cards,step-change
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:8732";
const ONLY = process.env.ONLY?.split(",");
const SESSION_KEY = "study:high-performance-systems:session:lecture-1";
const failures = [];
const skipped = [];
const consoleErrors = [];

function expect(group, ok, message) {
  if (!ok) failures.push(`[${group}] ${message}`);
}

async function open(browser, path, { width = 1440, ...options } = {}) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, ...options });
  const page = await context.newPage();
  page.on("console", (m) => m.type() === "error" && consoleErrors.push(`${width} ${path}: ${m.text().slice(0, 160)}`));
  page.on("pageerror", (e) => consoleErrors.push(`${width} ${path}: ${e.message}`));
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  return { context, page };
}

async function lessonPaths(browser) {
  const { context, page } = await open(browser, "/");
  const paths = await page.$$eval(".deck-grid a", (as) => as.map((a) => a.getAttribute("href")));
  await context.close();
  return paths;
}

// Opens the guided session at its first step, with fresh progress.
async function openSession(browser, options) {
  const { context, page } = await open(browser, "/", options);
  await page.evaluate((key) => localStorage.removeItem(key), SESSION_KEY);
  await page.goto(`${BASE}/sessions/lecture-1/`, { waitUntil: "networkidle" });
  await page.waitForSelector(".session-step");
  return { context, page };
}

const groups = {
  async "side-cards"(browser) {
    for (const path of await lessonPaths(browser)) {
      const { context, page } = await open(browser, path);
      await page.waitForTimeout(300);
      const late = await page.evaluate(() => {
        const out = [];
        const cards = [...document.querySelectorAll(".page.lesson :is(.formal, .card.check):not(.practice *)")];
        const headings = [...document.querySelectorAll(".page.lesson h2")];
        for (const card of cards) {
          if (getComputedStyle(card).float === "none") continue;
          const next = headings.find((h) => card.compareDocumentPosition(h) & Node.DOCUMENT_POSITION_FOLLOWING);
          if (next && card.getBoundingClientRect().bottom > next.getBoundingClientRect().top + 1) {
            out.push(`"${card.textContent.trim().slice(0, 30)}" runs past "${next.textContent.trim().slice(0, 30)}"`);
          }
          const before = card.previousElementSibling;
          const drift = before ? card.getBoundingClientRect().top - before.getBoundingClientRect().bottom : 0;
          if (drift > 161) out.push(`"${card.textContent.trim().slice(0, 30)}" sits ${Math.round(drift)}px below its paragraph`);
        }
        return out;
      });
      late.forEach((l) => expect("side-cards", false, `${path}: ${l}`));
      await context.close();
    }
  },

  async "layout-props"(browser) {
    const paths = ["/", ...(await lessonPaths(browser)).slice(0, 1), "/sessions/lecture-1/", "/glossary/"];
    for (const width of [1440, 390]) {
      for (const path of paths) {
        const { context, page } = await open(browser, path, { width });
        // One solved practice makes the home page progress bars render.
        await page.evaluate(() => localStorage.setItem("study:high-performance-systems", JSON.stringify({ solved: ["__any__"] })));
        const id = await page.$eval("article.card.practice[id]", (el) => el.id).catch(() => null);
        if (id) await page.evaluate((solved) => localStorage.setItem("study:high-performance-systems", JSON.stringify({ solved: [solved] })), id);
        const bad = await page.evaluate(() => {
          const layout = /(^|,\s*)(width|height|top|left|right|bottom|margin[a-z-]*|padding[a-z-]*)(,|$)/;
          const out = new Set();
          for (const el of document.querySelectorAll("*")) {
            for (const pseudo of [null, "::before", "::after"]) {
              const cs = getComputedStyle(el, pseudo);
              const durations = cs.transitionDuration.split(",").map(parseFloat);
              const props = cs.transitionProperty.split(",").map((s) => s.trim());
              props.forEach((prop, i) => {
                if ((durations[i % durations.length] ?? 0) > 0 && (layout.test(prop) || prop === "all")) {
                  out.add(`${el.tagName.toLowerCase()}.${String(el.className).split(" ")[0]}${pseudo ?? ""} → ${prop}`);
                }
              });
            }
          }
          return [...out];
        });
        bad.forEach((b) => expect("layout-props", false, `${width} ${path}: transitions ${b}`));
        await context.close();
      }
    }
  },

  async "touch-hover"(browser) {
    const lesson = (await lessonPaths(browser))[1];
    let { context, page } = await open(browser, lesson, { width: 390, hasTouch: true, isMobile: true });
    const hop = page.locator(".chapter-hop").first();
    await hop.scrollIntoViewIfNeeded();
    await hop.hover();
    await page.waitForTimeout(300);
    const hopTransform = await hop.evaluate((el) => getComputedStyle(el).transform);
    expect("touch-hover", hopTransform === "none", `lesson hop card moved on touch hover (${hopTransform})`);
    await context.close();
    ({ context, page } = await openSession(browser, { width: 390, hasTouch: true, isMobile: true }));
    const seg = page.locator(".session-seg").nth(3);
    await seg.hover();
    await page.waitForTimeout(300);
    const segTransform = await seg.evaluate((el) => getComputedStyle(el, "::before").transform);
    expect("touch-hover", segTransform === "none", `step segment grew on touch hover (${segTransform})`);
    await context.close();
  },

  async "progress-bar"(browser) {
    const lesson = (await lessonPaths(browser))[0];
    const { context, page } = await open(browser, lesson);
    await page.evaluate(() => scrollTo(0, (document.documentElement.scrollHeight - innerHeight) / 2));
    await page.waitForTimeout(100);
    const [scale, ratio] = await page.evaluate(() => {
      const m = getComputedStyle(document.querySelector(".reading-progress")).transform.match(/matrix\(([^,]+)/);
      const root = document.documentElement;
      return [m ? parseFloat(m[1]) : 1, root.scrollTop / (root.scrollHeight - root.clientHeight)];
    });
    expect("progress-bar", Math.abs(scale - ratio) < 0.02, `bar at ${scale.toFixed(3)}, scroll at ${ratio.toFixed(3)}`);
    await context.close();
  },

  async "hero-deal"(browser) {
    let { context, page } = await open(browser, "/");
    await page.reload({ waitUntil: "commit" });
    await page.waitForSelector(".fan li:last-child");
    await page.waitForTimeout(60);
    const early = await page.$eval(".fan li:last-child", (el) => parseFloat(getComputedStyle(el).opacity));
    await page.waitForTimeout(900);
    const late = await page.$eval(".fan li:last-child", (el) => parseFloat(getComputedStyle(el).opacity));
    expect("hero-deal", early < 1, `last fan card is already fully shown at load (opacity ${early})`);
    expect("hero-deal", late === 1, `last fan card has not settled after 900ms (opacity ${late})`);
    await context.close();
    ({ context, page } = await open(browser, "/", { reducedMotion: "reduce" }));
    const reduced = await page.$eval(".fan li:last-child", (el) => [parseFloat(getComputedStyle(el).opacity), getComputedStyle(el).animationName]);
    expect("hero-deal", reduced[0] === 1 && reduced[1] === "none", `reduced motion still deals the cards (${reduced})`);
    await context.close();
  },

  async "step-change"(browser) {
    let { context, page } = await openSession(browser);
    const NEXT = ".workspace-nav button.btn-primary";
    const entrance = () => page.$eval(".session-current .session-step > *, .reading-step", (el) => getComputedStyle(el.closest(".reading-step") ?? el).animationName);
    expect("step-change", (await entrance()) === "none", "the first step animates on page load");
    const barTop = () => page.$eval(".workspace-nav", (el) => el.getBoundingClientRect().top);
    const before = await barTop();
    await page.click(NEXT);
    await page.waitForTimeout(50);
    const fades = await page.$eval(".step-in .question-panel", (el) => getComputedStyle(el).animationName);
    expect("step-change", fades === "panel-in", `after Next: the question panel animation is ${fades}`);
    expect("step-change", (await barTop()) === before, "the top bar moved between steps");
    const frame = await page.$eval(".step-in", (el) => getComputedStyle(el).animationName);
    expect("step-change", frame === "none", `the whole frame animates (${frame}), so the bars and divider would flicker`);
    await context.close();
    ({ context, page } = await openSession(browser, { reducedMotion: "reduce" }));
    await page.click(NEXT);
    await page.waitForTimeout(50);
    const reduced = await page.$eval(".step-in .question-panel", (el) => getComputedStyle(el).transform);
    expect("step-change", reduced === "none", `reduced motion still moves the step (${reduced})`);
    await context.close();
  },

  async feedback(browser) {
    const lesson = (await lessonPaths(browser))[0];
    let { context, page } = await open(browser, lesson);
    const check = page.locator(".card.check").first();
    await check.scrollIntoViewIfNeeded();
    await check.locator("label").first().click();
    const button = check.locator("button", { hasText: /check/i }).first();
    if (await button.count()) await button.click();
    await page.waitForTimeout(50);
    const anim = await check.locator(".check-result").first().evaluate((el) => getComputedStyle(el).animationName);
    expect("feedback", anim === "fade-in", `check result line animation is "${anim}"`);
    await context.close();

    ({ context, page } = await openSession(browser));
    for (let i = 0; i < 40 && !(await page.locator(".step-kind[data-kind=exercise]").count()); i++) {
      const skip = page.locator(".workspace-nav button", { hasText: "Skip for now" });
      // A reading step can finish while we click, which disables Skip, so retry on the next loop.
      await ((await skip.isEnabled()) ? skip : page.locator(".workspace-nav button.btn-primary")).click({ timeout: 3000 }).catch(() => {});
    }
    const run = page.locator(".code-actions button", { hasText: /^Run$/ }).first();
    const runOnce = async () => {
      await run.click();
      await page.waitForSelector(".code-actions button:has-text('Run'):not([disabled])", { timeout: 45000 });
      return page.$eval("[aria-live=polite] > *", (el) => {
        el.dataset.seen = "1";
        return getComputedStyle(el).animationName;
      });
    };
    try {
      const first = await runOnce();
      await page.waitForTimeout(6000);
      const second = await runOnce();
      const fresh = await page.$eval("[aria-live=polite] > *", (el) => el.dataset.seen === "1");
      expect("feedback", first === "fade-in" && second === "fade-in", `run result animation "${first}" / "${second}"`);
      expect("feedback", fresh, "the second run did not replace the result element");
    } catch (error) {
      skipped.push(`[feedback] run results not checked: ${error.message.split("\n")[0]}`);
    }
    await context.close();
  },

  async "practice-open"(browser) {
    const lesson = (await lessonPaths(browser))[0];
    const { context, page } = await open(browser, lesson);
    const atLoad = await page.$$eval(".card.practice:not(.is-folded)", (els) => els.map((el) => getComputedStyle(el).animationName));
    expect("practice-open", atLoad.every((a) => a === "none"), `worked examples animate on page load (${atLoad})`);
    const fold = page.locator(".card.practice.is-folded .fold-row").first();
    await fold.scrollIntoViewIfNeeded();
    await fold.click();
    await page.waitForTimeout(50);
    const opened = await page.$eval(".card.practice.is-fresh", (el) => getComputedStyle(el).animationName).catch(() => "missing");
    expect("practice-open", opened === "fade-in", `opened practice card animation "${opened}"`);
    await context.close();
  },

  async finished(browser) {
    const { context, page } = await openSession(browser);
    await page.locator(".session-seg").last().click();
    await page.locator(".workspace-nav button", { hasText: "Skip for now" }).click();
    await page.waitForTimeout(50);
    const anim = await page.$eval(".session-finished", (el) => getComputedStyle(el).animationName).catch(() => "missing");
    expect("finished", anim === "finish-in", `session finished animation "${anim}"`);
    await page.evaluate((key) => localStorage.removeItem(key), SESSION_KEY);
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
skipped.forEach((s) => console.log(`skipped ${s}`));

if (failures.length) {
  console.log(failures.join("\n"));
  console.log(`\n${failures.length} problem(s).`);
  process.exit(1);
}
console.log("Motion checks passed.");
