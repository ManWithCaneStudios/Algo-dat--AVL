"use client";

import { useState } from "react";
import LevelScreen from "./LevelScreen";
import { useTutorialExercises } from "./TutorialExercises";
import SearchTree from "./SearchTree";
import FindErrorChallenge from "./FindErrorChallenge";
import { explainTree, isSearchTree } from "@/lib/search-tree";

const steps = [
  "Willkommen! In Level 1 lernst du binäre Suchbäume kennen. Die Katzen tragen ihre Zahlen auf dem Halsband.",
  "Jede Katze hat höchstens zwei direkte Kinder. Im gesamten linken Teilbaum stehen nur kleinere Zahlen, im gesamten rechten Teilbaum nur größere. Diese Regel gilt für jede Katze!",
  "Du siehst nacheinander fünf Kratzbäume. Wähle jeweils „Suchbaum“ oder „Kein Suchbaum“. Deine Auswahl führt direkt zum nächsten Baum. Die Form und die Balance sind hier noch egal.",
  "Mit „Rückgängig“ kannst du die letzte Auswahl korrigieren. Erst nach allen fünf Bäumen klickst du auf „Bestätigen“. Dann schauen wir uns deine Antworten gemeinsam an.",
];
const choiceClass = "rounded-2xl border-2 border-line bg-cream-light px-6 py-3 text-lg font-bold transition hover:border-forest hover:bg-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-forest";

export default function SearchTreeChallenge() {
  const { exampleTrees } = useTutorialExercises();
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [phase, setPhase] = useState<"answering" | "review" | "complete">("answering");
  const [nextTask, setNextTask] = useState(false);
  const finished = answers.length === exampleTrees.length;
  const current = Math.min(answers.length, exampleTrees.length - 1);
  const correct = answers.filter((answer, i) => answer === isSearchTree(exampleTrees[i])).length;

  function undo() {
    setAnswers(previous => previous.slice(0, -1));
    setPhase("answering");
  }
  function confirm() {
    if (!finished || phase !== "answering") return;
    setPhase(correct === exampleTrees.length ? "complete" : "review");
  }

  if (nextTask) return <FindErrorChallenge />;

  return (
    <LevelScreen level={1} title="Suchbäume" tutorialSteps={steps} wideWorkspace
      onDevSkip={() => setNextTask(true)}
      onUndo={undo} undoDisabled={answers.length === 0 || phase === "complete"}
      onConfirm={confirm} confirmDisabled={!finished || phase !== "answering"}
      task={<div className="flex flex-col gap-3 text-base leading-relaxed lg:text-[max(14px,calc(24*var(--u)))]">
        <p className="font-extrabold">1.1 · Suchbäume erkennen</p>
        <p>Ist dieser Kratzbaum ein Suchbaum? Ordne alle fünf Bäume ein.</p>
        <div className="rounded-xl bg-blush p-3"><strong>Merke:</strong> Links nur kleinere Zahlen, rechts nur größere – im gesamten Teilbaum.</div>
      </div>}
    >
      <div className="challenge-workspace">
        {phase === "answering" ? <>
          <div className="text-center" aria-live="polite">
            <p className="text-lg font-extrabold">{finished ? "Alle fünf Antworten sind ausgewählt" : `Baum ${current + 1} von 5`}</p>
            <div className="mt-2 flex justify-center gap-2" aria-label={`${answers.length} von 5 beantwortet`}>
              {exampleTrees.map((_, i) => <span key={i} className={`h-2 w-8 rounded-full ${i < answers.length ? "bg-forest" : "bg-sage-light"}`} />)}
            </div>
          </div>
          <div className="challenge-tree" key={current}><SearchTree tree={exampleTrees[current]} /></div>
          {finished ? <p className="rounded-2xl bg-cream-light px-5 py-3 text-center font-semibold" role="status">Bereit? Prüfe deine Antworten mit „Bestätigen“.<br /><span className="text-sm font-normal">Mit „Rückgängig“ kannst du sie noch ändern.</span></p> :
            <div className="flex flex-wrap justify-center gap-3">
              <button type="button" className={choiceClass} onClick={() => setAnswers([...answers, true])}>Suchbaum</button>
              <button type="button" className={choiceClass} onClick={() => setAnswers([...answers, false])}>Kein Suchbaum</button>
            </div>}
        </> : phase === "review" ? <div className="challenge-result" role="status">
          <h2 className="text-2xl font-extrabold">{correct} von 5 richtig</h2>
          <p>Schau dir die Regeln noch einmal an:</p>
          <ul className="space-y-3">{exampleTrees.map((tree, i) => answers[i] !== isSearchTree(tree) && <li key={i} className="rounded-xl bg-blush p-3"><strong>Baum {i + 1}: {isSearchTree(tree) ? "Suchbaum" : "Kein Suchbaum"}.</strong> {explainTree(tree) ?? "Bei jeder Katze sind alle Zahlen links kleiner und rechts größer. Auch ein einseitiger Baum kann ein Suchbaum sein."}</li>)}</ul>
          <button type="button" className={choiceClass} onClick={() => { setAnswers([]); setPhase("answering"); }}>Noch einmal versuchen</button>
          <p className="text-sm">Oder korrigiere deine Antworten mit „Rückgängig“.</p>
        </div> : <div className="challenge-result text-center" role="status">
          <p className="text-5xl" aria-hidden="true">✓</p>
          <h2 className="text-3xl font-extrabold">Alle fünf richtig!</h2>
          <p>Du erkennst jetzt binäre Suchbäume.</p>
          <button type="button" className={`${choiceClass} bg-forest text-cream-light hover:bg-forest-dark`} onClick={() => setNextTask(true)}>Weiter zu 1.2 · Fehler finden</button>
          <button type="button" className={choiceClass} onClick={() => { setAnswers([]); setPhase("answering"); }}>Aufgabe 1 wiederholen</button>
        </div>}
      </div>
    </LevelScreen>
  );
}
