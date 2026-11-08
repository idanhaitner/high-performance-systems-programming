"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { Mixed } from "@/lib/bidi";
import { groupByLetter, linkDefinition, searchTerms } from "@/lib/glossary";
import type { GlossaryEntry } from "@/lib/types";

export type GlossaryLecture = { id: string; label: string };
export type GlossaryItem = GlossaryEntry & { lectureId: string | null; hasLesson: boolean };

const ALL = "all";

function plural(count: number) {
  return count === 1 ? "1 term" : `${count} terms`;
}

export function GlossaryBrowser({ entries, lectures }: { entries: GlossaryItem[]; lectures: GlossaryLecture[] }) {
  const [query, setQuery] = useState("");
  const [lecture, setLecture] = useState(ALL);
  const [testing, setTesting] = useState(false);
  const [shown, setShown] = useState<ReadonlySet<string>>(new Set());
  const [justShown, setJustShown] = useState<string | null>(null);

  const results = useMemo(
    () => searchTerms(entries.filter((entry) => lecture === ALL || entry.lectureId === lecture), query),
    [entries, lecture, query],
  );
  const searching = query.trim() !== "";
  const groups = useMemo(() => (searching ? [] : groupByLetter(results)), [results, searching]);
  const shownCount = results.filter((entry) => shown.has(entry.anchor)).length;

  // A link to a term must always land on its meaning, even when the search or the
  // lecture filter hides that term or a test covers it. This also serves the site's search box.
  useEffect(() => {
    const known = new Set(entries.map((entry) => entry.anchor));
    function onClick(event: MouseEvent) {
      const link = (event.target as Element | null)?.closest?.("a");
      if (!link?.hash || !link.pathname.replace(/\/$/, "").endsWith("/glossary")) return;
      const anchor = decodeURIComponent(link.hash.slice(1));
      if (!known.has(anchor)) return;
      flushSync(() => {
        if (!document.getElementById(anchor)) {
          setQuery("");
          setLecture(ALL);
        }
        setShown((current) => new Set(current).add(anchor));
      });
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [entries]);

  useEffect(() => {
    if (justShown) document.getElementById(`${justShown}-meaning`)?.focus();
  }, [justShown]);

  function row(entry: GlossaryItem) {
    const covered = testing && !shown.has(entry.anchor);
    return (
      <div className="glossary-row" id={entry.anchor} key={entry.anchor}>
        <dt className={entry.code ? "is-code" : undefined}><Mixed text={entry.term} /></dt>
        {covered ? (
          <dd>
            <button
              type="button"
              className="glossary-cover"
              aria-label={`Show the meaning of ${entry.term}`}
              onClick={() => {
                setShown((current) => new Set(current).add(entry.anchor));
                setJustShown(entry.anchor);
              }}
            >
              Show meaning
            </button>
          </dd>
        ) : (
          <dd id={`${entry.anchor}-meaning`} tabIndex={-1} className={testing ? "is-revealed" : undefined}>
            <p>
              {linkDefinition(entry, entries).map((part, index) =>
                part.anchor
                  ? <a key={index} className="glossary-xref" href={`#${part.anchor}`}><Mixed text={part.text} /></a>
                  : <Mixed key={index} text={part.text} />,
              )}
            </p>
            {entry.hasLesson && (
              <Link className="glossary-lesson" href={`/topics/${entry.topic}`}>
                Learn more in <Mixed text={entry.topicTitle} />
              </Link>
            )}
          </dd>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="glossary-find search">
        <label className="sr-only" htmlFor="glossary-q">Find a term</label>
        <input
          id="glossary-q"
          type="search"
          placeholder="Find a term"
          autoComplete="off"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className="glossary-tools">
        {lectures.length > 1 && (
          <div className="glossary-filter" role="radiogroup" aria-label="Which terms to show">
            {[{ id: ALL, label: "All" }, ...lectures].map((option) => (
              <label key={option.id}>
                <input
                  className="sr-only"
                  type="radio"
                  name="glossary-lecture"
                  checked={lecture === option.id}
                  onChange={() => setLecture(option.id)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        )}
        <button
          type="button"
          className="glossary-test"
          aria-pressed={testing}
          onClick={() => {
            setTesting(!testing);
            setShown(new Set());
            setJustShown(null);
          }}
        >
          Test yourself
        </button>
      </div>

      <div className="glossary-status" role="status">
        {testing ? (
          <p>Say the meaning to yourself, then check it. {shownCount} of {results.length} shown.</p>
        ) : (
          <p>{plural(results.length)}</p>
        )}
        {testing && shown.size > 0 && (
          <button type="button" className="glossary-reset" onClick={() => setShown(new Set())}>
            Cover them again
          </button>
        )}
      </div>

      {results.length === 0 && (
        <div className="glossary-empty">
          <p>No term matches {searching ? <>“{query.trim()}”</> : "this filter"}. Try a shorter word or look in all lectures.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setLecture(ALL);
            }}
          >
            Show all terms
          </button>
        </div>
      )}

      {searching && results.length > 0 && <dl className="glossary-list">{results.map(row)}</dl>}

      {groups.map((group) => (
        <section className="glossary-letter" key={group.letter} aria-labelledby={`letter-${group.letter}`}>
          <h2 id={`letter-${group.letter}`}>{group.letter}</h2>
          <dl className="glossary-list">{group.entries.map(row)}</dl>
        </section>
      ))}
    </>
  );
}
