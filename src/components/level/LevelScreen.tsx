"use client";

import { useState } from "react";
import Link from "next/link";
import { CircleHelp, Code, House } from "lucide-react";
import LevelBackground from "./LevelBackground";
import TaskPanel from "./TaskPanel";
import TutorialDialog from "./TutorialDialog";

type LevelScreenProps = {
  level: number;
  title: string;
  /** Einführungstexte der Tutorialkatze; erscheinen beim Betreten des Levels */
  tutorialSteps?: string[];
  /** Inhalt des Aufgaben-Panels */
  task?: React.ReactNode;
  /** Inhalt des zentralen Arbeitsbereichs (z. B. der AVL-Baum) */
  children?: React.ReactNode;
};

const squareButton =
  "flex items-center justify-center rounded-(--lvl-radius) border-[3px] border-line bg-cream-light text-ink " +
  "transition-[background-color,border-color,transform] duration-150 hover:border-[#d2c6a9] hover:bg-white active:scale-[0.97] " +
  "focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-forest";

const actionButton =
  "flex h-(--lvl-btn-h) w-(--lvl-action-w) items-center justify-center rounded-(--lvl-radius) text-(length:--lvl-text) font-medium " +
  "transition-[background-color,border-color,transform] duration-150 active:scale-[0.985] " +
  "focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-forest";

/**
 * Grundgerüst eines Tutorial-Levels: Topbar, Aufgaben-Panel, Arbeitsbereich,
 * Hilfe-/Code-Buttons und die Aktionen Rückgängig / Bestätigen.
 *
 * Ab `lg` liegt alles absolut nach der 1920x1080-Blaupause, darunter wird
 * der Inhalt untereinander gestapelt. Beim Betreten öffnet sich der
 * Einführungsdialog der Tutorialkatze; der Hilfe-Button zeigt ihn erneut.
 */
export default function LevelScreen({
  level,
  title,
  tutorialSteps = [],
  task,
  children,
}: LevelScreenProps) {
  const [tutorialOpen, setTutorialOpen] = useState(tutorialSteps.length > 0);

  return (
    <main className="relative isolate flex flex-1 flex-col text-ink lg:h-dvh lg:overflow-hidden">
      <LevelBackground className="absolute inset-0 -z-10 h-full w-full" />

      {/* Topbar */}
      <header className="relative flex min-h-[max(72px,calc(170*var(--u)))] items-center rounded-b-[calc(var(--lvl-radius)*1.3)] bg-bar px-[max(16px,calc(35*var(--u)))] shadow-[0_10px_30px_-18px_rgba(20,20,20,0.4)]">
        <Link
          href="/"
          className="relative z-10 flex h-(--lvl-btn-h) items-center gap-[calc(var(--lvl-icon)*0.5)] rounded-(--lvl-radius) bg-forest px-[calc(var(--lvl-icon)*0.9)] text-(length:--lvl-text) font-medium text-cream-light transition-[background-color,transform] duration-150 hover:bg-forest-dark active:scale-[0.985] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-forest lg:w-[calc(305*var(--u))]"
        >
          <House aria-hidden="true" strokeWidth={1.75} className="size-(--lvl-icon)" />
          Menü
        </Link>
        <h1 className="pointer-events-none absolute inset-x-0 hidden text-center text-(length:--lvl-title) font-extrabold tracking-tight md:block">
          Tutorial Level {level}: {title}
        </h1>
      </header>
      <h1 className="px-4 pt-4 text-2xl font-extrabold tracking-tight md:hidden">
        Tutorial Level {level}: {title}
      </h1>

      {/* Aufgabe */}
      <TaskPanel className="mx-4 mt-4 lg:absolute lg:left-[calc(62*var(--u))] lg:top-[calc(215*var(--u))] lg:m-0 lg:h-(--lvl-panel-h) lg:w-(--lvl-panel-w)">
        {task}
      </TaskPanel>

      {/* Arbeitsbereich */}
      <section
        aria-label="Arbeitsbereich"
        className="relative mx-4 mt-4 min-h-[40vh] flex-1 lg:absolute lg:inset-x-[calc(600*var(--u))] lg:top-[calc(200*var(--u))] lg:bottom-[calc(170*var(--u))] lg:m-0 lg:min-h-0"
      >
        {children}
      </section>

      {/* Hilfe / Code */}
      <div className="mx-4 mt-4 flex gap-3 lg:absolute lg:right-[calc(30*var(--u))] lg:top-[calc(200*var(--u))] lg:m-0 lg:flex-col lg:gap-[calc(25*var(--u))]">
        <button
          type="button"
          aria-label="Hilfe: Einführung erneut anzeigen"
          onClick={() => setTutorialOpen(true)}
          disabled={tutorialSteps.length === 0}
          className={`${squareButton} h-(--lvl-side-h) flex-1 disabled:cursor-not-allowed disabled:opacity-50 lg:w-(--lvl-side-w) lg:flex-none`}
        >
          <CircleHelp aria-hidden="true" strokeWidth={1.5} className="size-(--lvl-side-icon)" />
        </button>
        <button
          type="button"
          aria-label="Code anzeigen"
          className={`${squareButton} h-(--lvl-side-h) flex-1 lg:w-(--lvl-side-w) lg:flex-none`}
        >
          <Code aria-hidden="true" strokeWidth={1.5} className="size-(--lvl-side-icon)" />
        </button>
      </div>

      {/* Aktionen */}
      <div className="mx-4 my-5 flex justify-center gap-[max(12px,calc(38*var(--u)))] lg:absolute lg:inset-x-0 lg:bottom-[calc(42*var(--u))] lg:m-0">
        <button
          type="button"
          className={`${actionButton} border-[3px] border-line bg-cream-light hover:border-[#d2c6a9] hover:bg-white`}
        >
          Rückgängig
        </button>
        <button
          type="button"
          className={`${actionButton} bg-forest text-cream-light shadow-[0_6px_18px_-8px_rgba(47,74,59,0.6)] hover:bg-forest-dark`}
        >
          Bestätigen
        </button>
      </div>

      <TutorialDialog
        steps={tutorialSteps}
        open={tutorialOpen}
        onClose={() => setTutorialOpen(false)}
      />
    </main>
  );
}
