"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#deck", label: "The lessons" },
  { href: "#faq", label: "Questions" },
  { href: "/glossary/", label: "Glossary" },
];

export function LandingNav({ startHref }: { startHref: string }) {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    // iOS Safari ignores overflow on body alone, so lock the root element too.
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className={`landing-nav${open ? " is-open" : ""}`}>
      <div className="landing-bar">
        <Link className="landing-mark" href="/" aria-current="page">
          <span aria-hidden="true" />
          Systems Programming
        </Link>
        <nav className="landing-links" aria-label="Home sections">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href}>{link.label}</Link>
          ))}
        </nav>
        <Link className="landing-cta landing-cta-small" href={startHref}>Start lecture 1</Link>
        <button
          ref={toggleRef}
          type="button"
          className="landing-toggle"
          aria-expanded={open}
          aria-controls="landing-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <span aria-hidden="true" />
        </button>
      </div>
      <div
        className="landing-menu"
        id="landing-menu"
        hidden={!open}
        onClick={(event) => {
          // A tap on the empty part of the panel closes it.
          if (event.target === event.currentTarget) setOpen(false);
        }}
      >
        <nav aria-label="Home sections">
          {LINKS.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              style={{ animationDelay: `${Math.min(index * 60, 400)}ms` }}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link className="landing-cta" href={startHref} style={{ animationDelay: `${Math.min(LINKS.length * 60, 400)}ms` }}>
            Start lecture 1
          </Link>
        </nav>
      </div>
    </header>
  );
}
