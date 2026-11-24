"use client";

import { useState } from "react";
import Link from "next/link";
import { getSearchPath } from "@/lib/search-tree";
import LevelScreen from "./LevelScreen";
import { useTutorialExercises } from "./TutorialExercises";
import SearchTree from "./SearchTree";
import RepairSearchChallenge from "./RepairSearchChallenge";

const steps = [
  "Jetzt suchen wir wie ein Algorithmus! Du bekommst eine Zahl und verfolgst den Suchpfad durch den Kratzbaum. Beginne immer bei der Wurzel, der obersten Katze.",
  "Vergleiche die gesuchte Zahl mit der aktuellen Katze: Ist sie kleiner, gehst du zum linken Kind. Ist sie größer, gehst du zum rechten Kind. Klicke immer nur die nächste Katze auf diesem Weg an.",
  "Sind beide Zahlen gleich, endet die Suche. Du kannst auch falsche Wege anklicken: Erst mit „Bestätigen“ wird dein vollständiger Pfad geprüft. Mit „Rückgängig“ nimmst du einen Schritt zurück.",
];
const buttonClass = "rounded-2xl border-2 border-line bg-cream-light px-6 py-3 text-lg font-bold transition hover:border-forest hover:bg-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-forest";

export default function SearchPathChallenge() {
  const { pathChallenges } = useTutorialExercises();
  const [round, setRound] = useState(0);
  const [path, setPath] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);
  const [nextLevel, setNextLevel] = useState(false);
  const { tree, target } = pathChallenges[round];
  const expectedPath = getSearchPath(tree, target);
  const found = path.length === expectedPath.length && path.every((value, index) => value === expectedPath[index]);
  const current = path.at(-1);

  function select(value: number) {
    if (complete) return;
    setPath(previous => [...previous, value]);
    setError("");
  }

  function confirm() {
    if (!path.length || complete) return;
    if (!found) {
      const mismatch = path.findIndex((value, index) => value !== expectedPath[index]);
      if (path[0] !== tree.value) setError(`Die Suche muss bei der Wurzel ${tree.value} beginnen. Dein Pfad startet bei ${path[0]}.`);
      else if (mismatch >= expectedPath.length) setError(`Bei Katze ${target} ist die Zahl gefunden. Danach endet die Suche; weitere Schritte gehören nicht zum Suchpfad.`);
      else if (mismatch > 0) {
        const previous = expectedPath[mismatch - 1];
        setError(`Nach Katze ${previous} bist du zu ${path[mismatch]} gegangen. ${target} ist ${target < previous ? "kleiner" : "größer"} als ${previous}: Als Nächstes kommt das ${target < previous ? "linke" : "rechte"} Kind ${expectedPath[mismatch]}.`);
      } else setError(`Dein Pfad endet zu früh bei ${current}. Die gesuchte Katze ${target} wurde noch nicht erreicht.`);
      return;
    }
    if (round === pathChallenges.length - 1) setComplete(true);
    else { setRound(previous => previous + 1); setPath([]); setError(""); }
  }

  if (nextLevel) return <RepairSearchChallenge />;

  return (
    <LevelScreen level={1} title="Suchpfad" tutorialSteps={steps} wideWorkspace
      devBackHref="/tutorial?part=1.2" onDevSkip={() => setNextLevel(true)}
      onUndo={() => { setPath(previous => previous.slice(0, -1)); setError(""); }}
      undoDisabled={path.length === 0 || complete}
      onConfirm={confirm} confirmDisabled={path.length === 0 || complete}
      task={<div className="flex flex-col gap-3 text-base leading-relaxed lg:text-[max(14px,calc(24*var(--u)))]">
        <p className="font-extrabold">1.3 · Suchpfad verfolgen</p>
        <p>Suche Katze <strong>{target}</strong>. Klicke den Weg von der Wurzel bis zu ihr an.</p>
        <div className="rounded-xl bg-blush p-3"><strong>Vergleiche:</strong><br />Gesuchte Zahl kleiner → links.<br />Größer → rechts.<br />Gleich → gefunden!</div>
      </div>}
    >
      <div className="challenge-workspace">
        {complete ? <div className="challenge-result text-center" role="status">
          <p className="text-5xl" aria-hidden="true">✓</p>
          <h2 className="text-3xl font-extrabold">Level 1 abgeschlossen!</h2>
          <p>Du erkennst Suchbäume, findest falsch platzierte Katzen und verfolgst den Suchalgorithmus von der Wurzel bis zum Ziel.</p>
          <button type="button" className={buttonClass} onClick={() => setNextLevel(true)}>Weiter zu Level 2</button>
          <button type="button" className={buttonClass} onClick={() => { setRound(0); setPath([]); setError(""); setComplete(false); }}>1.3 wiederholen</button>
          <Link href="/" className={buttonClass}>Zurück zum Menü</Link>
        </div> : <>
          <div className="text-center" aria-live="polite">
            <p className="text-lg font-extrabold">Suche Katze {target} · Baum {round + 1} von {pathChallenges.length}</p>
            <p className="mt-1 text-sm">Dein Pfad: {path.length ? path.join(" → ") : "Starte bei der Wurzel"}</p>
          </div>
          <div className="challenge-tree" key={round}>
            <SearchTree tree={tree} onSelectNode={select} pathValues={path} selectedValue={current} />
          </div>
          <div className={`rounded-2xl border px-4 py-3 text-center text-sm ${error ? "border-amber-700/30 bg-[#fff0d6]" : "border-line bg-cream-light"}`} aria-live="polite" aria-atomic="true">
            {error || (current === undefined ? "Klicke zuerst die oberste Katze an."
              : `Du bist bei Katze ${current}. Wähle deinen nächsten Schritt oder prüfe den Pfad mit „Bestätigen“.`)}
          </div>
        </>}
      </div>
    </LevelScreen>
  );
}
