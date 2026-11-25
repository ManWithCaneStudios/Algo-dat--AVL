"use client";

import { useState } from "react";
import Link from "next/link";
import { nodeFacts } from "@/lib/tutorial-exercises";
import type { TreeNode } from "@/lib/search-tree";
import { useTutorialExercises } from "./TutorialExercises";
import LevelScreen from "./LevelScreen";
import SearchTree from "./SearchTree";
import LeftRotationChallenge from "./LeftRotationChallenge";

const steps = [
  "Um herauszufinden, ob ein Suchbaum die AVL-Balancebedingung erfüllt, nutzen die Katzen den Balancefaktor. Er zeigt an, wie sich die Höhen des linken und rechten Teilbaums eines Knotens unterscheiden. Mit seiner Hilfe können unausgeglichene Stellen im Baum schnell erkannt werden.",
  "In diesem Level lernst du, Teilbaumhöhen zu bestimmen und daraus Balancefaktoren zu berechnen. Zähle die Ebenen auf dem längsten Weg im Teilbaum: Ein leerer Teilbaum hat Höhe 0, eine einzelne Katze Höhe 1. Die Formel lautet: Balancefaktor = Höhe rechts − Höhe links.",
  "Zum Beispiel: Rechts ist der Teilbaum zwei Ebenen hoch und links eine Ebene. Dann ist BF = 2 − 1 = +1. Bei 0 sind beide Seiten gleich hoch, bei −1 ist links eine Ebene mehr. Erlaubt sind −1, 0 und +1. Ein Suchbaum erfüllt die AVL-Balancebedingung nur, wenn das an jeder Katze gilt.",
  "Bestimme für die vorgegebenen Katzen die Höhe des linken und rechten Teilbaums und berechne den Balancefaktor. Arbeite von unten zur Wurzel. Klicke eine freigegebene Katze an: Die Eingabefelder erscheinen direkt daneben. Nach jeder Zahl springst du ins nächste Feld; die vollständige Rechnung wird automatisch übernommen. Manche Werte sind schon vorbereitet.",
  "Nachdem die geforderten Balancefaktoren eingetragen wurden, wechselst du automatisch zum Markieren. Untersuche den gesamten Baum und markiere alle Katzen mit einem BF über +1 oder unter −1. In jedem der drei Bäume gibt es mindestens eine. „Bestätigen“ prüft Rechnungen und Markierungen. Ab den Rotationsleveln werden die Werte automatisch berechnet.",
];
const button = "rounded-xl border-2 border-line bg-cream-light px-4 py-2 text-sm font-bold hover:border-forest hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest disabled:cursor-not-allowed disabled:opacity-40";
type Entry = { left: string; right: string; bf: string; saved: boolean };
type Issue = { value: number; field?: "left" | "right" | "bf"; message: string };
type Snapshot = { entries: Record<number, Entry>; selected?: number; marked: number[]; stage: "calculate" | "mark" };

export default function BalanceFactorChallenge({ initialRound = 0 }: { initialRound?: number }) {
  const { balanceRounds } = useTutorialExercises();
  const [round, setRound] = useState(initialRound);
  const [complete, setComplete] = useState(false);
  const [showValues, setShowValues] = useState(false);
  const [nextLevel, setNextLevel] = useState(false);
  if (nextLevel) return <LeftRotationChallenge />;
  if (complete) {
    const tree = balanceRounds[2].tree;
    const facts = nodeFacts(tree);
    return <LevelScreen level={4} title="Balancefaktor" tutorialSteps={steps} showTutorialInitially={false} wideWorkspace
      confirmDisabled undoDisabled onDevBack={() => setComplete(false)} onDevSkip={() => setNextLevel(true)}
      task={<div className="space-y-3 text-base"><h2 className="font-bold">Level 4 abgeschlossen!</h2><p>Ab jetzt können die Höhen und Balancefaktoren automatisch angezeigt werden.</p><p>BF = rechts − links</p><button className={button} onClick={() => setShowValues(value => !value)}>{showValues ? "Werte ausblenden" : "Werte automatisch anzeigen"}</button><p className="text-sm">L = linke Höhe · R = rechte Höhe. Die Rechnungen stehen unter dem Baum.</p></div>}
    >
      <div className="challenge-workspace">
        <h2 className="text-center text-xl font-extrabold">Alle drei Bäume geschafft!</h2>
        <div className="challenge-tree"><SearchTree tree={tree} interactionDisabled nodeBadges={showValues ? Object.fromEntries(facts.map(f => [f.node.value, `L ${f.left} · R ${f.right} · BF ${f.bf > 0 ? "+" : ""}${f.bf}`])) : undefined} /></div>
        <div className="balance-completion rounded-2xl bg-cream-light p-4 text-center">
          {showValues && <ul className="mb-3 max-h-24 overflow-y-auto text-sm">{facts.map(f => <li key={f.node.value}>Katze {f.node.value}: BF = {f.right} − {f.left} = {f.bf}</li>)}</ul>}
          <div className="flex flex-wrap justify-center gap-2"><button className={button} onClick={() => setNextLevel(true)}>Weiter zu Level 5</button><button className={button} onClick={() => { setRound(0); setComplete(false); }}>Level 4 wiederholen</button><Link href="/" className={button}>Zum Menü</Link></div>
        </div>
      </div>
    </LevelScreen>;
  }
  return <BalanceRound key={round} round={round} tree={balanceRounds[round].tree} manualValues={balanceRounds[round].manualValues} onPrevious={() => setRound(value => value - 1)}
    onNext={() => { if (round === 2) setComplete(true); else setRound(value => value + 1); }} />;
}

function BalanceRound({ round, tree, manualValues, onNext, onPrevious }: { round: number; tree: TreeNode; manualValues: number[]; onNext: () => void; onPrevious: () => void }) {
  const facts = nodeFacts(tree);
  const manual = new Set(manualValues);
  const initialEntries = Object.fromEntries(facts.map(f => [f.node.value, manual.has(f.node.value) ? { left: "", right: "", bf: "", saved: false } : { left: String(f.left), right: String(f.right), bf: String(f.bf), saved: true }]));
  const [state, setState] = useState<Snapshot>({ entries: initialEntries, marked: [], stage: "calculate" });
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [result, setResult] = useState<"editing" | "review">("editing");
  const [hint, setHint] = useState("Beginne bei einer freigegebenen Katze ganz unten.");
  const fact = facts.find(f => f.node.value === state.selected);
  const entry = state.selected !== undefined ? state.entries[state.selected] : undefined;
  const ready = (node: TreeNode) => (!node.left || state.entries[node.left.value].saved) && (!node.right || state.entries[node.right.value].saved);
  const allSaved = manualValues.every(value => state.entries[value].saved);
  const savedCount = manualValues.filter(value => state.entries[value].saved).length;

  function commit(nextEntry = entry) {
    if (state.selected === undefined || !nextEntry || !manual.has(state.selected)) return;
    if ([nextEntry.left, nextEntry.right, nextEntry.bf].some(value => value.trim() === "" || !Number.isInteger(Number(value))) || Number(nextEntry.left) < 0 || Number(nextEntry.right) < 0) return;
    const entries = { ...state.entries, [state.selected]: { ...nextEntry, saved: true } };
    const finished = manualValues.every(value => entries[value].saved);
    update({ ...state, entries, selected: undefined, stage: finished ? "mark" : "calculate" });
    setHint(finished ? "Alle Werte eingetragen. Markiere jetzt die unausgeglichenen Katzen." : "Werte übernommen. Wähle die nächste freigegebene Katze.");
  }

  function update(next: Snapshot) { setHistory(previous => [...previous, state]); setState(next); }
  function choose(value: number) {
    if (result !== "editing") return;
    if (state.stage === "mark") { update({ ...state, marked: state.marked.includes(value) ? state.marked.filter(item => item !== value) : [...state.marked, value] }); return; }
    const selectedFact = facts.find(f => f.node.value === value)!;
    if (!ready(selectedFact.node)) { setHint("Bearbeite zuerst die Kinder dieser Katze. Danach wird sie freigegeben."); return; }
    if (!manual.has(value)) { setHint(`Katze ${value} ist bereits vorbereitet: links ${state.entries[value].left}, rechts ${state.entries[value].right}, BF ${state.entries[value].bf}.`); return; }
    setState(previous => ({ ...previous, selected: value })); setHint("");
  }
  function check() {
    if (state.stage !== "mark" || !allSaved) return;
    const errors: Issue[] = [];
    for (const f of facts) {
      if (manual.has(f.node.value)) {
        for (const field of ["left", "right", "bf"] as const) {
          const actual = Number(state.entries[f.node.value][field]);
          if (actual !== f[field]) {
            const label = field === "left" ? "Linke Teilbaumhöhe" : field === "right" ? "Rechte Teilbaumhöhe" : "Balancefaktor";
            const signHint = field === "bf" && f.bf !== 0 && actual === -f.bf ? " Du hast die Seiten vertauscht: rechts minus links!" : "";
            errors.push({ value: f.node.value, field, message: `${label}: ${actual} eingetragen, richtig ist ${f[field]}.${field === "bf" ? ` BF = ${f.right} − ${f.left} = ${f.bf}.` : " Zähle die Ebenen des längsten Weges; ein leerer Teilbaum hat Höhe 0."}${signHint}` });
          }
        }
      }
      const unbalanced = Math.abs(f.bf) > 1;
      if (state.marked.includes(f.node.value) !== unbalanced) errors.push({ value: f.node.value, message: unbalanced ? `Nicht markiert: BF ${f.bf} liegt außerhalb von −1 bis +1.` : `Zu Unrecht markiert: BF ${f.bf} ist zulässig.` });
    }
    setIssues(errors);
    if (errors.length) setResult("review");
    else onNext();
  }
  function changeField(field: "left" | "right" | "bf", value: string) {
    if (state.selected === undefined || !entry) return;
    const nextEntry = { ...entry, [field]: value, saved: false };
    if (field === "bf" && /^-?\d+$/.test(value) && nextEntry.left !== "" && nextEntry.right !== "" && Number(nextEntry.left) >= 0 && Number(nextEntry.right) >= 0) commit(nextEntry);
    else update({ ...state, entries: { ...state.entries, [state.selected]: nextEntry } });
  }

  return <LevelScreen level={4} title="Balancefaktor" tutorialSteps={steps} showTutorialInitially={round === 0} wideWorkspace
    confirmDisabled={state.stage !== "mark" || !allSaved || result !== "editing"} onConfirm={check}
    undoDisabled={!history.length}
    onUndo={() => { if (history.length) { setState(history[history.length - 1]); setHistory(previous => previous.slice(0, -1)); setResult("editing"); setHint(""); } }}
    devBackHref="/tutorial?part=3" onDevBack={round > 0 ? onPrevious : undefined} onDevSkip={onNext}
    task={<div className="balance-editor space-y-3 text-sm leading-relaxed">
      <p className="text-base font-extrabold">4.{round + 1} · {round === 0 ? "Von unten nach oben" : round === 1 ? "Blätter sind vorbereitet" : "Selbstständig rechnen"}</p>
      <div className="rounded-xl bg-blush p-3"><strong>BF = rechts − links</strong><br />Leer: Höhe 0 · Blatt: Höhe 1<br />Zulässig: −1, 0 und +1</div>
      <p>{round === 0 ? "Berechne alle fünf Katzen." : round === 1 ? "Die Blätter sind ausgefüllt. Berechne die übrigen Katzen." : "Berechne die drei offenen Katzen. Die anderen Werte sind vorbereitet."}</p>
      <p>{state.stage === "calculate" ? "Klicke eine Katze an und tippe Höhe links, Höhe rechts und BF. Der Fokus springt automatisch weiter; der letzte Wert übernimmt die Rechnung." : "Markiere alle Katzen mit BF kleiner als −1 oder größer als +1."}</p>
      {state.stage === "mark" && <>
        <p>Ausgewählt: {state.marked.length ? state.marked.join(", ") : "noch keine Katze"}.</p>
        <button type="button" className={button} disabled={result !== "editing"} onClick={() => update({ ...state, stage: "calculate" })}>Rechnungen bearbeiten</button>
      </>}
      {state.stage === "calculate" && allSaved && <button type="button" className={button} disabled={result !== "editing"} onClick={() => update({ ...state, selected: undefined, stage: "mark" })}>Zur Markierung</button>}
    </div>}
  >
    <div className="challenge-workspace">
      <div className="text-center"><p className="text-lg font-extrabold">Baum {round + 1} von 3 · {state.stage === "calculate" ? "Höhen & BF berechnen" : "Ungleichgewichte markieren"}</p><p className="mt-1 text-sm">{state.stage === "calculate" ? `${savedCount} / ${manualValues.length} Rechnungen · Erst Kinder, dann ihre Eltern.` : "Klicke alle unausgeglichenen Katzen an, dann bestätige."}</p></div>
      {result === "review" ? <div className="challenge-result balance-review" role="status">
        <h2 className="text-xl font-extrabold">Noch nicht ganz richtig</h2>
        <ul className="space-y-2">{issues.map((issue, index) => <li key={index} className="rounded-xl bg-blush p-3 text-sm"><strong>Katze {issue.value}:</strong> {issue.message}</li>)}</ul>
        <button className={button} onClick={() => { setResult("editing"); setState(previous => ({ ...previous, stage: "calculate", selected: issues[0]?.value })); }}>Eingaben korrigieren</button>
      </div> : <div className="challenge-tree"><SearchTree tree={tree} onSelectNode={choose} interactionDisabled={result !== "editing"}
        selectedValues={state.stage === "mark" ? state.marked : state.selected !== undefined ? [state.selected] : []}
        errorValues={[...new Set(issues.map(issue => issue.value))]}
        nodePopover={state.stage === "calculate" && result === "editing" && fact && entry && manual.has(fact.node.value) ? { value: fact.node.value, content:
          <div onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) commit(); }}
            onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); commit(); } }}>
            {([ ["left", "Höhe links"], ["right", "Höhe rechts"], ["bf", "Balancefaktor"] ] as const).map(([field, label]) => <label key={field} className="balance-node-field">
              <span>{label}</span><input type="number" step="1" min={field === "bf" ? undefined : 0}
                aria-label={`${label} für Katze ${fact.node.value}`} aria-invalid={issues.some(issue => issue.value === fact.node.value && issue.field === field)}
                value={entry[field]} onChange={event => {
                  const value = event.target.value;
                  changeField(field, value);
                  if (field !== "bf" && /^\d+$/.test(value)) {
                    const next = event.currentTarget.parentElement?.nextElementSibling?.querySelector<HTMLInputElement>("input");
                    next?.focus(); next?.select();
                  }
                }} />
            </label>)}
          </div>
        } : undefined}
        nodeBadges={Object.fromEntries(facts.filter(f => state.entries[f.node.value].saved).map(f => [f.node.value, `BF ${state.entries[f.node.value].bf}`]))} /></div>}
      <div className="rounded-2xl bg-cream-light px-4 py-3 text-center text-sm" role="status">
        <p>{state.stage === "calculate" ? (hint || "Trage die drei Werte ein. Nach der letzten Rechnung startet die Markierung automatisch.") : "Bereit? „Bestätigen“ prüft Rechnungen und Markierungen gemeinsam."}</p>
      </div>
    </div>
  </LevelScreen>;
}
