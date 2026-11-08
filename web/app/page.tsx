import Link from "next/link";
import { Fragment } from "react";
import { CoreGrid } from "@/components/landing/CoreGrid";
import { HeroCta } from "@/components/landing/HeroCta";
import { LandingNav } from "@/components/landing/LandingNav";
import { LectureIndex } from "@/components/landing/LectureIndex";
import { ScrollFx } from "@/components/landing/ScrollFx";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Mixed } from "@/lib/bidi";
import { loadCourse } from "@/lib/course";
import { OUTCOMES, PARTS, SUBJECTS } from "@/lib/syllabus";
import type { Session } from "@/lib/types";

function practiceSummary(session: Session | undefined) {
  if (!session) return "";
  const count = (kind: Session["steps"][number]["kind"]) => session.steps.filter((step) => step.kind === kind).length;
  const parts = [
    [count("check"), "quick question", "quick questions"],
    [count("exercise"), "coding exercise", "coding exercises"],
    [count("lab"), "lab", "labs"],
  ] as const;
  const list = parts.filter(([n]) => n > 0).map(([n, one, many]) => `${n} ${n === 1 ? one : many}`);
  return `${list.join(", ")}. Do it after the lessons.`;
}

const HEADLINE = ["See why programs", "run fast, starting", "from zero."];

const TAGLINE = ["Every idea is a card.", "Read it, check it, run it,", "and keep it."];

// Typical numbers on a modern processor. The bar length is the logarithm of the cycles, so all four fit on one scale.
const LADDER = [
  {
    name: "Registers",
    place: "Inside the processor",
    value: "about 1 cycle",
    bar: 0.04,
    body: "The processor is the chip that runs your program. It keeps the few numbers it is working on in tiny slots right beside its calculator, called registers. Reaching one takes about one tick of the processor's clock. One tick is called a cycle.",
  },
  {
    name: "Cache",
    place: "A small shelf close by",
    value: "about 4 cycles",
    bar: 0.11,
    body: "A cache is a small, fast store on the chip. It keeps copies of the memory you used a moment ago, in case you want it again. Reading from it takes a handful of cycles.",
  },
  {
    name: "Main memory",
    place: "The big warehouse",
    value: "about 200 cycles",
    bar: 0.42,
    body: "Main memory holds everything your program is using. It is large, but it sits outside the chip, so each trip there costs around two hundred cycles. A program that keeps asking for far away data spends most of its time waiting.",
  },
  {
    name: "Disk",
    place: "The archive across town",
    value: "300,000 cycles or more",
    bar: 1,
    body: "Files live on a disk or an SSD. One read can cost hundreds of thousands of cycles. The same work, arranged to stay close to the processor, can finish many times sooner. That is the skill this course teaches.",
  },
];

const STEPS = [
  {
    tone: "mint",
    title: "Read the lessons, in order",
    body: "Each lecture is split into short lessons. A lesson explains one idea in plain words, with a small example first, and a quick question right next to the idea it tests. This is where you learn.",
  },
  {
    tone: "coral",
    title: "Then do the practice",
    body: "When you finish a lecture's lessons, its practice makes you use them, one step at a time: a new question, then C code you write and run right in the page. It ends with a lab you open in VS Code, a free code editor.",
  },
  {
    tone: "sun",
    title: "Come back before the exam",
    body: "Your answers and your place stay in this browser. Skipped a step? It stays marked, so you can return to it. Forgot an idea? Every step links back to its lesson.",
  },
];

const BENEFITS = [
  { tone: "mint", title: "Made for a first read", body: "You do not need to know C, bits, or memory yet. The lessons start from zero and build up in order." },
  { tone: "card", title: "Follows the course", body: "Lessons cover the course in order, with the same terms and the same examples, so each new idea builds on the last." },
  { tone: "coral", title: "Code without setup", body: "The editor sends your code to Compiler Explorer, a free website that turns C into a program and runs it. You can run C from any browser without installing anything." },
  { tone: "sun", title: "Your place is saved", body: "Solved checks and your last lesson stay in this browser. There is no account to make and nothing to sign in to." },
];

const pad = (value: number) => String(value).padStart(2, "0");

export default function HomePage() {
  const course = loadCourse();
  const lectures = course.lectures;
  const lessons = lectures.flatMap((lecture) => lecture.lessons);
  const startHref = lessons[0] ? `/topics/${lessons[0].id}` : "/";
  const cta = <HeroCta courseId={course.id} lessons={lessons.map(({ id, title }) => ({ id, title }))} />;

  return (
    <article className="page landing">
      <ScrollFx />
      <ScrollReveal selector=".landing .sec-title, .syl-part, .bento > li, .stage-card, .deck-tab, .deck-soon, .deck-panels, .final-inner" />
      <div className="scroll-bar" aria-hidden="true" />
      <LandingNav startHref={startHref} />

      <section className="band hero" aria-labelledby="hero-title">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">A study site for High Performance Systems Programming</p>
            <h1 id="hero-title">
              {HEADLINE.map((line, lineIndex) => (
                <span className="hero-line" key={lineIndex}>
                  {line.split(" ").map((word, index) => (
                    <Fragment key={index}>
                      <span className="hero-word">
                        <span style={{ "--w": lineIndex * 4 + index } as React.CSSProperties}>{word}</span>
                      </span>{" "}
                    </Fragment>
                  ))}
                </span>
              ))}
            </h1>
            <p className="hero-sub">
              Learn how to write C, why some programs run fast and others crawl, and how to split a job across many
              processor cores and a graphics card. Short lessons, quick questions, and real C that runs on the page.
              No C experience needed.
            </p>
            {cta}
            <ul className="hero-proof" aria-label="What is on the site">
              <li><strong>{SUBJECTS.length}</strong> subjects</li>
              <li><strong>{lessons.length}</strong> lessons so far</li>
              <li><strong>0</strong> installs</li>
            </ul>
          </div>
          <CoreGrid />
        </div>
      </section>

      <div className="band ticker" aria-hidden="true">
        <div className="ticker-track" style={{ "--chips": SUBJECTS.length } as React.CSSProperties}>
          {[0, 1].map((copy) => (
            <ul key={copy}>
              {SUBJECTS.map((subject) => (
                <li key={subject.number}>
                  <Mixed text={subject.title} />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <section className="band band-accent ladder" id="speed" aria-labelledby="ladder-title">
        <div className="wrap">
          <p className="eyebrow">Why speed is about distance</p>
          <h2 className="sec-title" id="ladder-title">A program is only as fast as its data is close.</h2>
          <div className="ladder-grid">
            <ol className="ladder-steps">
              {LADDER.map((step, index) => (
                <li className="ladder-step" key={step.name} data-step={index}>
                  <span className="ladder-place">{pad(index + 1)} · {step.place}</span>
                  <h3>{step.name}</h3>
                  <p>{step.body}</p>
                </li>
              ))}
            </ol>
            <div className="ladder-stage stage-card" aria-label="How many cycles it takes to reach each place, on a typical machine">
              <p className="stage-title">Cycles to reach your data</p>
              <div className="ladder-readouts" aria-hidden="true">
                {LADDER.map((step, index) => (
                  <span key={step.name} className={index === LADDER.length - 1 ? "ladder-readout is-active" : "ladder-readout"}>{step.value}</span>
                ))}
              </div>
              <ul className="ladder-rows">
                {LADDER.map((step, index) => (
                  <li className="ladder-row is-on" key={step.name} data-step={index}>
                    <span className="ladder-name">{step.name}</span>
                    <span className="ladder-track"><span style={{ "--bar": step.bar } as React.CSSProperties} /></span>
                    <span className="ladder-value">{step.value}</span>
                  </li>
                ))}
              </ul>
              <p className="stage-note">Typical numbers on a modern machine. The bars use a squeezed scale, because the real gap is far too wide to draw.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="band band-sun tagline" aria-label="What this site is">
        <p>
          {TAGLINE.map((line, lineIndex) => (
            <span className="tagline-line" key={lineIndex}>
              {line.split(" ").map((word, index) => (
                <Fragment key={index}>
                  <span className="tagline-word">{word}</span>{" "}
                </Fragment>
              ))}
            </span>
          ))}
        </p>
      </section>

      <section className="band syllabus" id="syllabus" aria-labelledby="syllabus-title">
        <div className="wrap">
          <h2 className="sec-title" id="syllabus-title">What the course covers</h2>
          <p className="sec-intro">
            Ten subjects in three parts. You start with C, learn to make programs fast, and finish by running work on
            many processor cores and on a graphics card. Subjects with a lecture link are already written here.
          </p>
          {PARTS.map((part) => (
            <div className="syl-part" key={part.id}>
              <div className={`syl-head tone-${part.tone}`}>
                <h3>{part.title}</h3>
                <p>{part.blurb}</p>
              </div>
              <ol className="syl-list">
                {SUBJECTS.filter((subject) => subject.part === part.id).map((subject) => {
                  const lecture = subject.lecture ? lectures.find((item) => item.number === subject.lecture) : undefined;
                  const first = lecture?.lessons[0];
                  return (
                    <li className="syl-row" key={subject.number}>
                      <span className="syl-num">{pad(subject.number)}</span>
                      <div>
                        <strong>{subject.title}</strong>
                        <span>{subject.body}</span>
                      </div>
                      {first ? (
                        <Link className="subject-tag is-ready" href={`/topics/${first.id}`}>
                          Lecture {lecture!.number} is ready <span aria-hidden="true">→</span>
                        </Link>
                      ) : (
                        <span className="subject-tag">Arrives later</span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </div>
      </section>

      <section className="band band-soft how" id="how" aria-labelledby="how-title">
        <div className="wrap">
          <h2 className="sec-title" id="how-title">How to study each lecture</h2>
          <ol className="how-stack">
            {STEPS.map((step, index) => (
              <li className={`how-card tone-${step.tone}`} key={step.title} style={{ "--i": index } as React.CSSProperties}>
                <span className="how-num">{index + 1}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="band benefits" aria-labelledby="benefits-title">
        <div className="wrap">
          <h2 className="sec-title" id="benefits-title">Built for learning it the first time</h2>
          <ul className="bento">
            {BENEFITS.map((benefit) => (
              <li className={`bento-tile tone-${benefit.tone}`} key={benefit.title}>
                <strong>{benefit.title}</strong>
                <span>{benefit.body}</span>
              </li>
            ))}
            <li className="bento-tile bento-wide outcomes" id="outcomes">
              <strong>What you will be able to do</strong>
              <ol className="outcome-list">
                {OUTCOMES.map((outcome, index) => (
                  <li key={outcome}>
                    <span>{index + 1}</span>
                    {outcome}
                  </li>
                ))}
              </ol>
            </li>
          </ul>
        </div>
      </section>

      <section className="band deck" id="deck" aria-labelledby="deck-title">
        <div className="wrap">
          <h2 className="sec-title" id="deck-title">The lessons</h2>
          <p className="sec-intro">
            {lectures.length} {lectures.length === 1 ? "lecture" : "lectures"} and {lessons.length} lessons so far.
            Pick a lecture to see its lessons and its practice.
          </p>
          <LectureIndex
            courseId={course.id}
            lectures={lectures.map((lecture) => ({
              ...lecture,
              practiceSummary: practiceSummary(course.sessions.find((session) => session.id === lecture.sessionId)),
            }))}
            later="More lectures arrive through the semester: measuring speed, caches, many core processors, and graphics cards."
          />
        </div>
      </section>

      <section className="band band-ink final" aria-labelledby="final-title">
        <div className="final-cores" aria-hidden="true">
          {Array.from({ length: 16 }, (_, index) => (
            <span key={index} style={{ "--wave": `${(((index % 4) + Math.floor(index / 4)) * 0.18).toFixed(2)}s` } as React.CSSProperties} />
          ))}
        </div>
        <div className="wrap final-inner">
          <h2 id="final-title">
            Start with one card.
            <br /> The rest of the deck follows.
          </h2>
          <p>Your place and your solved checks stay in this browser. No account, no install.</p>
          {cta}
        </div>
      </section>

      <footer className="band landing-foot">
        <div className="wrap landing-foot-row">
          <span>High Performance Systems Programming</span>
          <nav aria-label="Footer">
            <a href="#syllabus">Syllabus</a>
            <a href="#deck">All lectures</a>
            <Link href="/glossary/">Glossary</Link>
          </nav>
        </div>
      </footer>
    </article>
  );
}
