"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";

type TutorialDialogProps = {
  /** Ein Eintrag pro Tutorialschritt (eine Tatze pro Schritt) */
  steps: string[];
  open: boolean;
  onClose: () => void;
};

const dialogButton =
  "flex h-[max(44px,calc(60*var(--u)))] items-center justify-center rounded-[max(12px,calc(18*var(--u)))] px-[max(16px,calc(28*var(--u)))] " +
  "text-[max(1rem,calc(26*var(--u)))] font-medium transition-[background-color,border-color,transform,opacity] duration-150 " +
  "focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-forest";

/**
 * Einführungsdialog eines Levels: Die Tutorialkatze erklärt das Level in
 * mehreren Schritten. Die Tatzen oben zeigen Anzahl und Fortschritt der
 * Schritte, „Weiter“ springt zum nächsten Schritt, „Zurück“ zum vorherigen.
 */
export default function TutorialDialog({ steps, open, onClose }: TutorialDialogProps) {
  const [index, setIndex] = useState(0);
  const titleId = useId();
  const nextRef = useRef<HTMLButtonElement>(null);

  const isFirst = index === 0;
  const isLast = index === steps.length - 1;

  function close() {
    setIndex(0);
    onClose();
  }

  function next() {
    if (isLast) close();
    else setIndex((i) => i + 1);
  }

  function back() {
    if (!isFirst) setIndex((i) => i - 1);
  }

  // Fokus auf „Weiter“ setzen und Escape zum Schließen anbieten
  useEffect(() => {
    if (!open) return;
    nextRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open || steps.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/35 p-4 backdrop-blur-[2px]"
      onClick={close}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        className="relative grid w-full max-w-[max(560px,calc(1195*var(--u)))] animate-fade-up grid-cols-1 gap-6 rounded-[max(24px,calc(50*var(--u)))] bg-cream p-6 shadow-[0_30px_80px_-30px_rgba(20,20,20,0.5)] md:grid-cols-[calc(360*var(--u))_1fr] md:gap-0 md:py-[calc(50*var(--u))] md:pr-[calc(120*var(--u))] md:pl-0"
      >
        {/* Blätter in der linken oberen Ecke */}
        <Image
          src="/assets/plant-small.png"
          alt=""
          width={480}
          height={843}
          sizes="8vw"
          priority
          className="pointer-events-none absolute -top-[calc(40*var(--u))] -left-[calc(45*var(--u))] hidden w-[calc(150*var(--u))] md:block"
        />

        {/* Tutorialkatze */}
        <div className="flex items-end justify-center md:pl-[calc(60*var(--u))]">
          <Image
            src="/assets/cat-tutor.png"
            alt="Tutorialkatze mit Brille und Halstuch"
            width={900}
            height={1415}
            sizes="(min-width: 768px) 16vw, 140px"
            priority
            className="h-auto w-[140px] md:w-[calc(290*var(--u))]"
          />
        </div>

        <div className="flex min-w-0 flex-col">
          <h2 id={titleId} className="sr-only">
            Einführung, Schritt {index + 1} von {steps.length}
          </h2>

          {/* Tatzen = Schritte */}
          <ol
            aria-label="Tutorialschritte"
            className="flex items-center justify-center md:mb-[calc(55*var(--u))]"
          >
            {steps.map((_, i) => {
              const done = i < index;
              const active = i === index;
              return (
                <li key={i} className="flex items-center">
                  {i > 0 && (
                    <span
                      aria-hidden="true"
                      className={`mx-[max(6px,calc(10*var(--u)))] h-[max(10px,calc(28*var(--u)))] w-[max(16px,calc(40*var(--u)))] rounded-sm ${done || active ? "bg-sage-light" : "bg-cream-light"}`}
                    />
                  )}
                  <svg
                    viewBox="0 0 400 400"
                    role="img"
                    aria-label={`Schritt ${i + 1}${active ? " (aktuell)" : done ? " (erledigt)" : ""}`}
                    aria-current={active ? "step" : undefined}
                    className={`size-[max(44px,calc(95*var(--u)))] shrink-0 transition-opacity duration-300 ${done ? "opacity-70" : ""}`}
                  >
                    <circle cx="200" cy="200" r="200" fill={active ? "#31453b" : "#f4eee1"} />
                    <g fill="none" stroke="black" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
                      <ellipse cx="164" cy="135" rx="32" ry="42" transform="rotate(-12 164 135)" />
                      <ellipse cx="233" cy="135" rx="31" ry="42" transform="rotate(12 233 135)" />
                      <ellipse cx="114" cy="192" rx="28" ry="39" transform="rotate(-25 114 192)" />
                      <ellipse cx="286" cy="190" rx="28" ry="39" transform="rotate(25 286 190)" />
                      <path d="M 200 184 C 177 184 167 215 146 239 C 128 260 112 279 117 296 C 122 320 160 309 182 303 C 194 299 203 299 217 303 C 243 312 277 321 280 295 C 282 274 264 253 248 233 C 229 210 223 184 200 184 Z" />
                    </g>
                  </svg>
                </li>
              );
            })}
          </ol>

          {/* Hinweistext */}
          <div
            aria-live="polite"
            className="mt-6 flex min-h-[max(160px,calc(395*var(--u)))] items-center rounded-[max(14px,calc(20*var(--u)))] border border-line bg-white p-[max(20px,calc(40*var(--u)))] md:mt-0"
          >
            <p
              key={index}
              className="animate-fade-up text-[max(1.0625rem,calc(30*var(--u)))] leading-relaxed"
            >
              {steps[index]}
            </p>
          </div>

          {/* Navigation */}
          <div className="mt-6 flex justify-center gap-[max(12px,calc(20*var(--u)))] md:mt-[calc(30*var(--u))]">
            <button
              type="button"
              onClick={back}
              disabled={isFirst}
              className={`${dialogButton} min-w-[max(120px,calc(205*var(--u)))] border-[3px] border-line bg-cream-light text-ink hover:border-[#d2c6a9] hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-line disabled:hover:bg-cream-light`}
            >
              Zurück
            </button>
            <button
              ref={nextRef}
              type="button"
              onClick={next}
              className={`${dialogButton} min-w-[max(120px,calc(210*var(--u)))] bg-forest text-cream-light shadow-[0_6px_18px_-8px_rgba(47,74,59,0.6)] hover:bg-forest-dark active:scale-[0.985]`}
            >
              {isLast ? "Los geht's" : "Weiter"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
