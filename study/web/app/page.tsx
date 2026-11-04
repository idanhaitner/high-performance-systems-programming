import Link from "next/link";
import { Fragment } from "react";
import { FanMotion } from "@/components/landing/FanMotion";
import { HeroCta } from "@/components/landing/HeroCta";
import { LandingNav } from "@/components/landing/LandingNav";
import { LectureIndex } from "@/components/landing/LectureIndex";
import { Reveal } from "@/components/landing/Reveal";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Mixed } from "@/lib/bidi";
import { loadCourse } from "@/lib/course";
import { BOOKS, COURSE_FACTS, GRADING, OUTCOMES, PARTS, SUBJECTS } from "@/lib/syllabus";
import type { Session } from "@/lib/types";

const pad = (value: number) => String(value).padStart(2, "0");

// The same six colors as the hero cards, so a lesson's chip matches its card.
const CARD_TONES = ["mint", "sun", "coral", "card", "soft", "accent"];
const cardTone = (lessonNumber: number) => CARD_TONES[(lessonNumber - 1) % CARD_TONES.length];

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

const HEADLINE = ["See why programs run fast,", "starting from zero."];

const TAGLINE = ["Every idea is a card.", "Read it, check it, run it,", "and keep it."];

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
  { title: "Made for a first read", body: "You do not need to know C, bits, or memory yet. The lessons start from zero and build up in order." },
  { title: "Follows the course", body: "Lessons cover the course in order, with the same terms and the same examples, so each new idea builds on the last." },
  { title: "Code without setup", body: "The editor sends your code to Compiler Explorer, a free website that turns C into a program and runs it. You can run C from any browser without installing anything." },
  { title: "Your place is saved", body: "Solved checks and your last lesson stay in this browser. There is no account to make and nothing to sign in to." },
];

export default function HomePage() {
  const course = loadCourse();
  const lectures = course.lectures;
  const lessons = lectures.flatMap((lecture) => lecture.lessons);
  const startHref = lessons[0] ? `/topics/${lessons[0].id}` : "/";
  const fan = lessons.slice(0, 6);

  return (
    <article className="page landing">
      <Reveal />
      <FanMotion />
      <ScrollReveal selector=".landing section > h2, .syllabus-part, .outcome-list li, .grading-grid > *, .how-card, .benefits li, .deck-tab, .deck-soon, .deck-panels, .final" />
      <LandingNav startHref={startHref} />

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <h1 id="hero-title">
            {HEADLINE.map((line, lineIndex) => (
              <span className="hero-line" key={lineIndex}>
                {line.split(" ").map((word, index) => (
                  <Fragment key={index}>
                    <span className="hero-word">
                      <span style={{ "--w": lineIndex * 5 + index } as React.CSSProperties}>{word}</span>
                    </span>{" "}
                  </Fragment>
                ))}
              </span>
            ))}
          </h1>
          <p className="hero-sub">
            A study site for the course High Performance Systems Programming: how to write C, why some programs run
            fast and others crawl, and how to split a job across many processor cores and a graphics card. Read short
            lessons, answer quick questions, and run real C on the page. No C experience needed.
          </p>
          <HeroCta courseId={course.id} lessons={lessons.map(({ id, title }) => ({ id, title }))} />
        </div>
        <ol className="fan" aria-label="Lecture 1 lessons">
          {fan.map((lesson, index) => (
            <li key={lesson.id} style={{ "--i": index, "--n": fan.length } as React.CSSProperties}>
              <Link href={`/topics/${lesson.id}`}>
                <span className="fan-num">{lesson.lessonNumber}</span>
                <span className="fan-title" data-vt-title><Mixed text={lesson.title} /></span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track" style={{ "--chips": lessons.length } as React.CSSProperties}>
          {[0, 1].map((copy) => (
            <ul key={copy}>
              {lessons.concat(lessons).map((lesson, index) => (
                <li key={`${lesson.id}-${index}`} className={`marquee-chip tone-${cardTone(lesson.lessonNumber)}`}>
                  <span><Mixed text={lesson.title} /></span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <section className="tagline" aria-label="What this site is">
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

      <section className="syllabus" id="syllabus" aria-labelledby="syllabus-title">
        <h2 id="syllabus-title">What the course covers</h2>
        <p className="deck-intro">
          Ten subjects in three parts. You start with C, learn to make programs fast, and finish by running work on
          many processor cores and on a graphics card. Subjects with a lecture link are already written here.
        </p>
        <div className="syllabus-parts">
          {PARTS.map((part) => (
            <div className={`syllabus-part tone-${part.tone}`} key={part.id}>
              <h3>{part.title}</h3>
              <p>{part.blurb}</p>
              <ol>
                {SUBJECTS.filter((subject) => subject.part === part.id).map((subject) => {
                  const lecture = subject.lecture ? lectures.find((item) => item.number === subject.lecture) : undefined;
                  const first = lecture?.lessons[0];
                  return (
                    <li className="subject" key={subject.number}>
                      <span className="subject-num">{subject.number}</span>
                      <div>
                        <strong>{subject.title}</strong>
                        <span>{subject.body}</span>
                        {first ? (
                          <Link className="subject-tag is-ready" href={`/topics/${first.id}`}>
                            Lecture {lecture!.number} is ready <span aria-hidden="true">→</span>
                          </Link>
                        ) : (
                          <span className="subject-tag">Arrives later in the semester</span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </div>
      </section>

      <section className="outcomes" id="outcomes" aria-labelledby="outcomes-title">
        <h2 id="outcomes-title">What you will be able to do</h2>
        <ol className="outcome-list">
          {OUTCOMES.map((outcome, index) => (
            <li key={outcome}>
              <span>{index + 1}</span>
              {outcome}
            </li>
          ))}
        </ol>
      </section>

      <section className="grading" id="grading" aria-labelledby="grading-title">
        <h2 id="grading-title">How the course is graded</h2>
        <div className="grading-grid">
          <ul className="grading-bars">
            {GRADING.map((item) => (
              <li key={item.label}>
                <div className="grading-head">
                  <strong>{item.label}</strong>
                  <span>{item.percent}%</span>
                </div>
                <span className="grading-bar" aria-hidden="true">
                  <span style={{ "--fill": item.percent / 100 } as React.CSSProperties} />
                </span>
                <p>{item.note}</p>
              </li>
            ))}
          </ul>
          <dl className="course-facts">
            {COURSE_FACTS.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <details className="books">
          <summary>Books the course follows</summary>
          <ul>
            {BOOKS.map((book) => (
              <li key={book}>{book}</li>
            ))}
          </ul>
        </details>
      </section>

      <section className="how" id="how" aria-labelledby="how-title">
        <h2 id="how-title">How to study each lecture</h2>
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
        <p className="deck-intro">
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
      </section>

      <section className="final" aria-labelledby="final-title">
        <div className="final-cards" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
        <h2 id="final-title">
          Start with one card.
          <br /> The rest of the deck follows.
        </h2>
        <p>Your place and your solved checks stay in this browser.</p>
        <HeroCta courseId={course.id} lessons={lessons.map(({ id, title }) => ({ id, title }))} />
      </section>

      <footer className="landing-foot">
        <span>High Performance Systems Programming</span>
        <nav aria-label="Footer">
          <a href="#syllabus">Syllabus</a>
          <a href="#deck">All lectures</a>
          <Link href="/glossary/">Glossary</Link>
        </nav>
      </footer>
    </article>
  );
}
