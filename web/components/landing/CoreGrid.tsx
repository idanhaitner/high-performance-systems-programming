"use client";

import { useEffect, useState } from "react";

const COLS = 7;
const ROWS = 6;
const PIECES = COLS * ROWS;
const TONES = ["mint", "sun", "coral", "accent"];

// Seconds one round takes (it matches landing.css). In a round, every worker finishes one piece.
const ROUND = 0.1;
const OPTIONS = [1, 3, 7, 42];
const runTime = (workers: number) => Math.ceil(PIECES / workers) * ROUND + 0.3;

// The hero picture, and a tiny lesson about the whole course: one job is cut into 42 equal pieces, one per square.
// A square that fills in is a piece that is done. Pick how many workers share the job: each round, every worker
// finishes one piece, so more workers means fewer rounds, and the time bar shows the job ending sooner.
// It plays the 7-worker run once by itself, then the student can try any size. With reduced motion nothing
// moves: the board jumps straight to the finished picture.
export function CoreGrid() {
  const [run, setRun] = useState<{ workers: number; id: number }>({ workers: 0, id: 0 });
  const start = (workers: number) => {
    setRun((previous) => ({ workers, id: previous.id + 1 }));
  };

  // Show one run shortly after the page appears, so the board explains itself.
  useEffect(() => {
    const first = window.setTimeout(() => start(7), 900);
    return () => clearTimeout(first);
  }, []);

  const { workers } = run;
  return (
    <figure className="cores">
      <div
        key={run.id}
        className={`core-board${workers ? " is-run" : ""}`}
        role="img"
        aria-label={`A board of ${PIECES} squares. Each square is one piece of a job. A filled square is a finished piece.`}
      >
        {Array.from({ length: PIECES }, (_, index) => {
          const row = Math.floor(index / COLS);
          const col = index % COLS;
          return (
            <span
              key={index}
              className={`core core-${TONES[(row + col) % TONES.length]}`}
              style={{ "--r": workers ? Math.floor(index / workers) : 0, "--wave": `${((row + col) * 0.14).toFixed(2)}s` } as React.CSSProperties}
            />
          );
        })}
      </div>
      <figcaption>
        <span className="core-lead">
          One job, cut into 42 equal pieces. A worker (a processor core) takes one piece at a time. A filled square means that piece is done.
        </span>
        <span className="core-picks" role="group" aria-label="How many workers share the job">
          <span className="core-picks-label">Workers</span>
          {OPTIONS.map((count) => (
            <button key={count} type="button" className="core-pick" aria-pressed={workers === count} onClick={() => start(count)}>
              {count}
            </button>
          ))}
        </span>
        <span className={`core-time${workers ? " is-run" : ""}`} key={`time-${run.id}`} aria-hidden="true">
          <span style={{ "--run-time": `${workers ? runTime(workers) : 0}s` } as React.CSSProperties} />
        </span>
      </figcaption>
    </figure>
  );
}
