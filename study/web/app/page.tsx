import Link from "next/link";
import { ChapterProgress } from "@/components/ChapterProgress";
import { HeroCta } from "@/components/landing/HeroCta";
import { LandingNav } from "@/components/landing/LandingNav";
import { Reveal } from "@/components/landing/Reveal";
import { Mixed } from "@/lib/bidi";
import { loadCourse } from "@/lib/course";

const pad = (value: number) => String(value).padStart(2, "0");

const TAGLINE = ["Every idea is a card.", "Read it, check it, run it,", "and keep it."];

const STEPS = [
  {
    tone: "mint",
    title: "Read a short lesson",
    body: "Each lesson explains one idea in plain words, with a small example first. Every new word is explained the first time it appears.",
  },
  {
    tone: "coral",
    title: "Answer a quick check",
    body: "A question sits right next to the idea it tests. Pick an answer and you see why it is right or wrong straight away.",
  },
  {
    tone: "sun",
    title: "Write and run real C",
    body: "Type C in the page, run it, test it, and look at the assembly the compiler made. Topics that need a real machine become a lab for VS Code.",
  },
];

const BENEFITS = [
  { title: "Made for a first read", body: "You do not need to know C, bits, or memory yet. The lessons start from zero and build up in order." },
  { title: "Follows your lectures", body: "Lessons follow the course lecture by lecture, with the same words and the same examples, so nothing is a surprise in class." },
  { title: "Code without setup", body: "The editor sends your code to Compiler Explorer, so you can run C from any browser without installing a compiler." },
  { title: "Your place is saved", body: "Solved checks and your last lesson stay in this browser. There is no account to make and nothing to sign in to." },
];

const FAQ = [
  {
    q: "Do I need to know C already?",
    a: "No. The first lessons teach just enough C to see how the machine stores your data, and every new word is explained before it is used.",
  },
  {
    q: "How is this different from the lecture slides?",
    a: "The slides are written for someone listening in the room. These lessons are written to be read alone, in order, with small examples and a check after each idea.",
  },
  {
    q: "Where does my code run?",
    a: "The editor sends your code to Compiler Explorer (godbolt.org), which compiles and runs it and sends back the output. You need an internet connection for this part.",
  },
  {
    q: "Is my progress saved?",
    a: "Yes, in this browser only. It is not synced between devices, and clearing the site's data in your browser resets it.",
  },
  {
    q: "Do I need an account?",
    a: "No. There is no sign up and no server of our own. You open the site and start reading.",
  },
  {
    q: "What is a lab?",
    a: "Some topics, like threads, timing, and graphics cards, need a real computer. A lab gives you a starter folder to download and open in VS Code.",
  },
  {
    q: "What if I get a check wrong?",
    a: "You see the explanation right away and can try again. Checks are there to help you notice what did not stick yet, not to grade you.",
  },
  {
    q: "Can I study on my phone?",
    a: "Reading and checks work well on a phone. Writing code is easier on a laptop with a real keyboard.",
  },
];

export default function HomePage() {
  const course = loadCourse();
  const lectures = course.lectures;
  const lessons = lectures.flatMap((lecture) => lecture.lessons);
  const startHref = lessons[0] ? `/topics/${lessons[0].id}` : "/";
  const checks = lessons.reduce((sum, lesson) => sum + lesson.practiceIds.length, 0);
  const steps = course.sessions.flatMap((session) => session.steps);
  const exercises = steps.filter((step) => step.kind === "exercise").length;
  const labs = steps.filter((step) => step.kind === "lab").length;
  const fan = lessons.slice(0, 6);

  return (
    <article className="page landing">
      <Reveal />
      <LandingNav startHref={startHref} />

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <h1 id="hero-title">
            See why programs run fast,
            <br /> starting from zero.
          </h1>
          <p className="hero-sub">
            Study cards for High Performance Systems Programming. Read a short lesson, answer a quick check,
            and run real C right on the page. No C experience needed.
          </p>
          <HeroCta courseId={course.id} lessons={lessons.map(({ id, title }) => ({ id, title }))} />
          <p className="hero-proof">
            <strong>{lessons.length} lessons</strong>
            <span>{checks} checks</span>
            {exercises > 0 && <span>{exercises} coding exercises</span>}
            {labs > 0 && <span>{labs} {labs === 1 ? "lab" : "labs"}</span>}
            <span>Free, no account</span>
          </p>
        </div>
        <ol className="fan" aria-label="Lecture 1 lessons">
          {fan.map((lesson, index) => (
            <li key={lesson.id} style={{ "--i": index, "--n": fan.length } as React.CSSProperties}>
              <Link href={`/topics/${lesson.id}`}>
                <span className="fan-num">{lesson.lessonNumber}</span>
                <span className="fan-title"><Mixed text={lesson.title} /></span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="tagline" aria-label="What this site is">
        <p>
          {TAGLINE.map((line, lineIndex) => (
            <span className="tagline-line" key={lineIndex}>
              {line.split(" ").map((word, index) => (
                <span className="tagline-word" key={index}>{word} </span>
              ))}
            </span>
          ))}
        </p>
      </section>

      <section className="how" id="how" aria-labelledby="how-title">
        <h2 id="how-title">Three steps for every idea</h2>
        <ol className="how-cards">
          {STEPS.map((step, index) => (
            <li className={`how-card tone-${step.tone}`} key={step.title}>
              <span className="how-num">{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="benefits" aria-labelledby="benefits-title">
        <h2 id="benefits-title">Built for learning it the first time</h2>
        <ul>
          {BENEFITS.map((benefit) => (
            <li key={benefit.title}>
              <strong>{benefit.title}</strong>
              <span>{benefit.body}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="deck" id="deck" aria-labelledby="deck-title">
        <h2 id="deck-title">The lessons</h2>
        {lectures.map((lecture) => (
          <div className="deck-lecture" id={lecture.id} key={lecture.id}>
            <header className="deck-head">
              <span className="deck-badge" aria-hidden="true">{pad(lecture.number)}</span>
              <div>
                <h3>Lecture {lecture.number}: <Mixed text={lecture.title} /></h3>
                <p><Mixed text={lecture.summary} /></p>
                <ChapterProgress courseId={course.id} practiceIds={lecture.lessons.flatMap((lesson) => lesson.practiceIds)} />
              </div>
              {lecture.sessionId && (
                <Link className="deck-session" href={`/sessions/${lecture.sessionId}/`}>Start guided session</Link>
              )}
            </header>
            <ol className="deck-grid">
              {lecture.lessons.map((lesson) => (
                <li key={lesson.id}>
                  <Link href={`/topics/${lesson.id}`}>
                    <span className="deck-num">{pad(lesson.lessonNumber)}</span>
                    <strong><Mixed text={lesson.title} /></strong>
                    {lesson.blurb && <span className="deck-blurb"><Mixed text={lesson.blurb} /></span>}
                    <ChapterProgress courseId={course.id} practiceIds={lesson.practiceIds} />
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        ))}
        <p className="deck-later">
          More lectures arrive through the semester: caches, the processor, many core machines, and graphics cards.
        </p>
      </section>

      <section className="faq" id="faq" aria-labelledby="faq-title">
        <h2 id="faq-title">Questions</h2>
        <div className="faq-list">
          {FAQ.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="final" aria-labelledby="final-title">
        <h2 id="final-title">
          Start with one card.
          <br /> The rest of the deck follows.
        </h2>
        <p>Free, no account, and your progress stays in this browser.</p>
        <HeroCta courseId={course.id} lessons={lessons.map(({ id, title }) => ({ id, title }))} />
      </section>

      <footer className="landing-foot">
        <span>High Performance Systems Programming</span>
        <nav aria-label="Footer">
          <Link href={startHref}>Lecture 1</Link>
          <Link href="/glossary/">Glossary</Link>
          <a href="#faq">Questions</a>
        </nav>
      </footer>
    </article>
  );
}
