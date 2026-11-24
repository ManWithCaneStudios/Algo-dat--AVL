"use client";

import { useState } from "react";
import Link from "next/link";
import { classifyTree, explainCategory, type TreeCategory } from "@/lib/search-tree";
import LevelScreen from "./LevelScreen";
import { useTutorialExercises } from "./TutorialExercises";
import BalanceFactorChallenge from "./BalanceFactorChallenge";
import SearchTree from "./SearchTree";

const categories: { value: TreeCategory; title: string; hint: string }[] = [
  { value: "unordered", title: "Binärer Baum ohne Suchbaumordnung", hint: "Die Zahlen verletzen die Suchbaumregel." },
  { value: "avl", title: "Gültiger AVL-Baum", hint: "Suchbaumordnung und Höhenbalance stimmen." },
  { value: "unbalanced", title: "Unausgeglichener Suchbaum", hint: "Die Ordnung stimmt, die Höhenbalance nicht." },
];
const labels = Object.fromEntries(categories.map(category => [category.value, category.title]));
const steps = [
  "In Level 3 lernst du den AVL-Baum kennen. Du siehst fünf Kratzbäume und ordnest jeden einer von drei Kategorien zu.",
  "Prüfe zuerst die Suchbaumordnung. Sind nicht alle kleineren Zahlen links und alle größeren rechts, gehört der Baum zur Kategorie „Binärer Baum ohne Suchbaumordnung“.",
  "Stimmt die Ordnung, prüfst du zusätzlich die Höhen: Bei einem AVL-Baum dürfen sich die Höhen des linken und rechten Teilbaums an keiner Katze um mehr als 1 unterscheiden. Ein Höhenunterschied von 1 ist also erlaubt!",
  "Stimmt die Ordnung, aber die Höhen unterscheiden sich irgendwo um mehr als 1, ist es ein unausgeglichener Suchbaum. Wähle für jeden Baum eine Kategorie. Nach fünf Antworten bestätigst du; mit „Rückgängig“ korrigierst du die letzte Auswahl.",
];
const buttonClass = "rounded-2xl border-2 border-line bg-cream-light px-5 py-3 font-bold transition hover:border-forest hover:bg-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-forest";

export default function TreeCategoryChallenge() {
  const { categoryTrees } = useTutorialExercises();
  const [answers, setAnswers] = useState<TreeCategory[]>([]);
  const [nextLevel, setNextLevel] = useState(false);
  const [phase, setPhase] = useState<"answering" | "review" | "complete">("answering");
  const finished = answers.length === categoryTrees.length;
  const current = Math.min(answers.length, categoryTrees.length - 1);
  const correct = answers.filter((answer, index) => answer === classifyTree(categoryTrees[index])).length;

  function reset() { setAnswers([]); setPhase("answering"); }
  function choose(category: TreeCategory) {
    setAnswers(previous => previous.length < categoryTrees.length ? [...previous, category] : previous);
  }

  if (nextLevel) return <BalanceFactorChallenge />;

  return <LevelScreen level={3} title="Bäume einordnen" tutorialSteps={steps} wideWorkspace
    devBackHref="/tutorial?part=2" onDevSkip={() => setNextLevel(true)}
    onUndo={() => { setAnswers(previous => previous.slice(0, -1)); setPhase("answering"); }}
    undoDisabled={answers.length === 0 || phase === "complete"}
    onConfirm={() => { if (finished && phase === "answering") setPhase(correct === categoryTrees.length ? "complete" : "review"); }}
    confirmDisabled={!finished || phase !== "answering"}
    task={<div className="flex flex-col gap-3 text-base leading-relaxed lg:text-[max(14px,calc(24*var(--u)))]">
      <p className="font-extrabold">3.1 · Bäume einordnen</p>
      <p>Wähle die passende Kategorie für jeden der fünf Kratzbäume.</p>
      <div className="rounded-xl bg-blush p-3"><strong>AVL-Regel:</strong> Die Suchbaumordnung muss stimmen. Zusätzlich dürfen sich die Teilbaumhöhen bei jeder Katze um höchstens 1 unterscheiden.</div>
    </div>}
  >
    <div className="challenge-workspace">
      {phase === "answering" ? <>
        <div className="text-center" aria-live="polite">
          <p className="text-lg font-extrabold">{finished ? "Alle fünf Bäume sind eingeordnet" : `Baum ${current + 1} von 5`}</p>
          <div className="mt-2 flex justify-center gap-2" aria-label={`${answers.length} von 5 beantwortet`}>
            {categoryTrees.map((_, index) => <span key={index} className={`h-2 w-8 rounded-full ${index < answers.length ? "bg-forest" : "bg-sage-light"}`} />)}
          </div>
        </div>
        <div className="challenge-tree" key={current}><SearchTree tree={categoryTrees[current]} /></div>
        {finished ? <p className="rounded-2xl bg-cream-light px-5 py-3 text-center font-semibold" role="status">Prüfe deine Zuordnung mit „Bestätigen“.<span className="mt-1 block text-sm font-normal">Mit „Rückgängig“ kannst du sie noch korrigieren.</span></p> :
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3" aria-label="Baumkategorien">
            {categories.map(category => <button key={category.value} type="button" className={`${buttonClass} flex flex-col items-center justify-center gap-1 text-sm`} onClick={() => choose(category.value)}>
              <span>{category.title}</span><span className="text-xs leading-snug font-normal text-ink/75">{category.hint}</span>
            </button>)}
          </div>}
      </> : phase === "review" ? <div className="challenge-result" role="status">
        <h2 className="text-2xl font-extrabold">{correct} von 5 richtig</h2>
        <p>Diese Kratzbäume gehören in eine andere Kategorie:</p>
        <ul className="space-y-3">{categoryTrees.map((tree, index) => answers[index] !== classifyTree(tree) && <li key={index} className="rounded-xl bg-blush p-3">
          <strong>Baum {index + 1}: {labels[classifyTree(tree)]}.</strong>
          <p className="mt-1 text-sm">Deine Auswahl: {labels[answers[index]]}.</p>
          <p className="mt-2">{explainCategory(tree)}</p>
        </li>)}</ul>
        <button type="button" className={buttonClass} onClick={reset}>Noch einmal versuchen</button>
        <p className="text-sm">Oder korrigiere die Zuordnung mit „Rückgängig“.</p>
      </div> : <div className="challenge-result text-center" role="status">
        <p className="text-5xl" aria-hidden="true">✓</p>
        <h2 className="text-3xl font-extrabold">Alle fünf richtig eingeordnet!</h2>
        <p>Du unterscheidest jetzt Suchbaumordnung und Höhenbalance. Ein AVL-Baum erfüllt beide Bedingungen.</p>
        <button type="button" className={buttonClass} onClick={() => setNextLevel(true)}>Weiter zu Level 4</button>
        <button type="button" className={buttonClass} onClick={reset}>Level 3 wiederholen</button>
        <Link href="/" className={buttonClass}>Zurück zum Menü</Link>
      </div>}
    </div>
  </LevelScreen>;
}
