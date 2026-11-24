"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  onUndo?: () => void;
  onConfirm?: () => void;
  undoDisabled?: boolean;
  confirmDisabled?: boolean;
  wideWorkspace?: boolean;
  onDevSkip?: () => void;
  onDevBack?: () => void;
  devBackHref?: string;
  confirmLabel?: string;
  taskClassName?: string;
  showTutorialInitially?: boolean;
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
  onUndo,
  onConfirm,
  undoDisabled = false,
  confirmDisabled = false,
  wideWorkspace = false,
  onDevSkip,
  onDevBack,
  devBackHref,
  confirmLabel = "Bestätigen",
  taskClassName = "",
  showTutorialInitially = true,
}: LevelScreenProps) {
  const router = useRouter();
  const [tutorialOpen, setTutorialOpen] = useState(showTutorialInitially && tutorialSteps.length > 0);

  return (
    <main className="relative isolate flex flex-1 flex-col text-ink lg:h-dvh lg:overflow-hidden">
      <LevelBackground className="absolute inset-0 -z-10 h-full w-full" />
      {process.env.NODE_ENV === "development" && (onDevSkip || onDevBack || devBackHref) && (
        <div className="fixed top-2 right-2 z-[60] flex gap-2">
        {devBackHref && !onDevBack ? <Link href={devBackHref} onClick={event => {
          setTutorialOpen(false);
          if (`${window.location.pathname}${window.location.search}` === devBackHref) { event.preventDefault(); router.refresh(); }
        }} className="rounded-lg border border-forest/30 bg-cream-light px-3 py-1.5 text-xs font-bold text-forest shadow-sm hover:bg-sage-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest">← Dev: Zurück</Link> :
          <button type="button" disabled={!onDevBack} onClick={() => { setTutorialOpen(false); onDevBack?.(); }} className="rounded-lg border border-forest/30 bg-cream-light px-3 py-1.5 text-xs font-bold text-forest shadow-sm hover:bg-sage-light disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest">← Dev: Zurück</button>}
        {onDevSkip && <button
          type="button"
          onClick={() => { setTutorialOpen(false); onDevSkip(); }}
          title="Aktuelles Teillevel überspringen"
          className="rounded-lg border border-forest/30 bg-cream-light px-3 py-1.5 text-xs font-bold text-forest shadow-sm hover:bg-sage-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
        >
          Dev: Weiter →
        </button>}
        </div>
      )}

      {/* Topbar */}
      <header className="relative flex min-h-[max(64px,calc(120*var(--u)))] shrink-0 items-center rounded-b-(--lvl-radius) bg-bar px-[max(16px,calc(35*var(--u)))] shadow-[0_10px_30px_-18px_rgba(20,20,20,0.4)]">
        <Link
          href="/"
          className="relative z-10 flex h-(--lvl-btn-h) w-(--lvl-action-w) items-center gap-[calc(var(--lvl-icon)*0.3)] rounded-(--lvl-radius) bg-forest px-[calc(var(--lvl-icon)*0.9)] text-(length:--lvl-text) font-medium text-cream-light transition-[background-color,transform] duration-150 hover:bg-forest-dark active:scale-[0.985] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-forest"
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
      <TaskPanel className={`mx-4 mt-4 lg:absolute lg:left-[calc(35*var(--u))] lg:top-[max(84px,calc(196*var(--u)))] lg:m-0 lg:h-(--lvl-panel-h) lg:w-(--lvl-panel-w) ${taskClassName}`}>
        {task}
      </TaskPanel>

      {/* Arbeitsbereich */}
      <section
        aria-label="Arbeitsbereich"
        className={`relative mx-4 mt-4 min-h-[40vh] flex-1 lg:absolute lg:top-[max(84px,calc(150*var(--u)))] lg:bottom-[max(84px,calc(140*var(--u)))] lg:m-0 lg:min-h-0 ${wideWorkspace ? "lg:left-[calc(555*var(--u))] lg:right-[calc(200*var(--u))]" : "lg:inset-x-[calc(555*var(--u))]"}`}
      >
        {children}
      </section>

      {/* Hilfe / Code */}
      <div className="mx-4 mt-4 flex gap-3 lg:absolute lg:right-[calc(96*var(--u))] lg:top-[max(84px,calc(200*var(--u)))] lg:m-0 lg:flex-col lg:gap-[calc(24*var(--u))]">
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
          disabled
          className={`${squareButton} h-(--lvl-side-h) flex-1 lg:w-(--lvl-side-w) lg:flex-none`}
        >
          <Code aria-hidden="true" strokeWidth={1.5} className="size-(--lvl-side-icon)" />
        </button>
      </div>

      {/* Aktionen */}
      <div className="mx-4 my-5 flex justify-center gap-[max(12px,calc(38*var(--u)))] lg:absolute lg:inset-x-0 lg:bottom-[calc(42*var(--u))] lg:m-0">
        <button
          type="button"
          onClick={onUndo}
          disabled={undoDisabled}
          className={`${actionButton} border-[3px] border-line bg-cream-light hover:border-[#d2c6a9] hover:bg-white disabled:cursor-not-allowed disabled:opacity-40`}
        >
          Rückgängig
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={confirmDisabled}
          className={`${actionButton} bg-forest text-cream-light shadow-[0_6px_18px_-8px_rgba(47,74,59,0.6)] hover:bg-forest-dark disabled:cursor-not-allowed disabled:opacity-40`}
        >
          {confirmLabel}
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
