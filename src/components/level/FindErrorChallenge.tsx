"use client";

import { useState } from "react";
import { errorTrees, findTreeErrors } from "@/lib/search-tree";
import LevelScreen from "./LevelScreen";
import SearchTree from "./SearchTree";
import SearchPathChallenge from "./SearchPathChallenge";

const steps = [
  "Jetzt bist du Katzendetektiv! In den nächsten fünf Kratzbäumen sitzen eine oder mehrere Katzen am falschen Platz.",
  "Markiere alle Katzen, deren Zahlen die Suchbaumregel verletzen. Es können auch mehrere sein. Denke auch an ihre Vorfahren: Links müssen alle Zahlen kleiner sein, rechts alle größer.",
  "Angeklickte Katzen bleiben markiert. Ein erneuter Klick wählt sie wieder ab. Mit „Nächster Baum“ übernimmst du deine gesamte Auswahl. Nach fünf Bäumen bestätigst du deine Antworten.",
];
const buttonClass = "rounded-2xl border-2 border-line bg-cream-light px-6 py-3 text-lg font-bold transition hover:border-forest hover:bg-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-forest";

export default function FindErrorChallenge() {
  const [answers, setAnswers] = useState<number[][]>([]);
  const [phase, setPhase] = useState<"answering" | "review" | "complete">("answering");
  const [nextTask, setNextTask] = useState(false);
  const [selection, setSelection] = useState<number[]>([]);
  const [history, setHistory] = useState<number[][]>([]);
  const finished = answers.length === errorTrees.length;
  const current = Math.min(answers.length, errorTrees.length - 1);
  function isCorrect(values: number[], index: number) {
    const expected = errorTrees[index].wrongValues;
    return values.length === expected.length && expected.every(value => values.includes(value));
  }
  const correct = answers.filter(isCorrect).length;

  function toggle(value: number) {
    setHistory(previous => [...previous, selection]);
    setSelection(previous => previous.includes(value) ? previous.filter(item => item !== value) : [...previous, value]);
  }

  function undo() {
    if (history.length) {
      setSelection(history[history.length - 1]);
      setHistory(previous => previous.slice(0, -1));
    } else if (answers.length) {
      setSelection(answers[answers.length - 1]);
      setAnswers(previous => previous.slice(0, -1));
    }
    setPhase("answering");
  }

  function reset() {
    setAnswers([]);
    setSelection([]);
    setHistory([]);
    setPhase("answering");
  }

  if (nextTask) return <SearchPathChallenge />;

  return (
    <LevelScreen level={1} title="Fehler finden" tutorialSteps={steps} wideWorkspace
      onDevSkip={() => setNextTask(true)}
      onUndo={undo}
      undoDisabled={(answers.length === 0 && history.length === 0) || phase === "complete"}
      onConfirm={() => { if (finished && phase === "answering") setPhase(correct === errorTrees.length ? "complete" : "review"); }}
      confirmDisabled={!finished || phase !== "answering"}
      task={<div className="flex flex-col gap-3 text-base leading-relaxed lg:text-[max(14px,calc(24*var(--u)))]">
        <p className="font-extrabold">1.2 · Fehler finden</p>
        <p>Welche Katzen sitzen falsch? Markiere alle. Erneutes Anklicken wählt eine Katze wieder ab.</p>
        <div className="rounded-xl bg-blush p-3"><strong>Merke:</strong> Prüfe auch die Vorfahren. Die Regel gilt für den gesamten Teilbaum.</div>
      </div>}
    >
      <div className="challenge-workspace">
        {phase === "answering" ? <>
          <div className="text-center" aria-live="polite">
            <p className="text-lg font-extrabold">{finished ? "Alle fünf Bäume sind bearbeitet" : `Baum ${current + 1} von 5`}</p>
            <div className="mt-2 flex justify-center gap-2" aria-label={`${answers.length} von 5 beantwortet`}>
              {errorTrees.map((_, i) => <span key={i} className={`h-2 w-8 rounded-full ${i < answers.length ? "bg-forest" : "bg-sage-light"}`} />)}
            </div>
          </div>
          <div className="challenge-tree" key={current}>
            <SearchTree tree={errorTrees[current].tree}
              onSelectNode={finished ? undefined : toggle}
              selectedValues={finished ? answers[current] : selection} />
          </div>
          <div className="rounded-2xl bg-cream-light px-4 py-3 text-center font-semibold" role="status">
            {finished ? "Prüfe deine Auswahl mit „Bestätigen“." : "Welche Katzen sitzen am falschen Platz?"}
            <span className="mt-1 block text-sm font-normal">{finished ? "Mit „Rückgängig“ kannst du deine letzte Auswahl korrigieren." : `Ausgewählt: ${selection.length ? selection.join(", ") : "noch keine Katze"}`}</span>
            {!finished && <button type="button" disabled={selection.length === 0}
              className={`${buttonClass} mt-2 disabled:cursor-not-allowed disabled:opacity-40`}
              onClick={() => { if (selection.length) { setAnswers(previous => [...previous, selection]); setSelection([]); setHistory([]); } }}>
              {current === errorTrees.length - 1 ? "Auswahl übernehmen" : "Nächster Baum"}
            </button>}
          </div>
        </> : phase === "review" ? <div className="challenge-result" role="status">
          <h2 className="text-2xl font-extrabold">{correct} von 5 richtig</h2>
          <p>Diese Katzen haben sich verirrt:</p>
          <ul className="space-y-3">{errorTrees.map(({ tree, wrongValues }, i) => !isCorrect(answers[i], i) &&
            <li key={i} className="rounded-xl bg-blush p-3"><strong>Baum {i + 1}: {wrongValues.length === 1 ? "Katze" : "Katzen"} {wrongValues.join(", ")}.</strong> Gewählt: {answers[i].join(", ")}. {findTreeErrors(tree).map(error => error.explanation).join(" ")}</li>
          )}</ul>
          <button type="button" className={buttonClass} onClick={reset}>Noch einmal versuchen</button>
          <p className="text-sm">Oder korrigiere deine Auswahl mit „Rückgängig“.</p>
        </div> : <div className="challenge-result text-center" role="status">
          <p className="text-5xl" aria-hidden="true">✓</p>
          <h2 className="text-3xl font-extrabold">Alle Fehler gefunden!</h2>
          <p>Du hast in allen fünf Bäumen alle falsch platzierten Katzen erkannt.</p>
          <p className="rounded-2xl bg-blush p-5">1.2 · Fehler finden abgeschlossen</p>
          <button type="button" className={`${buttonClass} bg-forest text-cream-light hover:bg-forest-dark`} onClick={() => setNextTask(true)}>Weiter zu 1.3 · Suchpfad verfolgen</button>
          <button type="button" className={buttonClass} onClick={reset}>1.2 wiederholen</button>
        </div>}
      </div>
    </LevelScreen>
  );
}
