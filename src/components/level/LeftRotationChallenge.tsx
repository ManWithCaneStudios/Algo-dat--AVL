"use client";

import { useState } from "react";
import Link from "next/link";
import { explainTree, findImbalance, isSearchTree, type TreeNode } from "@/lib/search-tree";
import { type LeftRotation, type BranchSide } from "@/lib/rotation";
import { nodeFacts } from "@/lib/tutorial-exercises";
import { useTutorialExercises } from "./TutorialExercises";
import LevelScreen from "./LevelScreen";
import RotationScene from "./RotationScene";

const steps = [
  "Der Kratzbaum ist rechtslastig. Bei einer Katze mit BF +2 und einem nach rechts oder gerade wachsenden rechten Kind hilft eine Linksrotation. Die Suchbaumordnung bleibt dabei erhalten.",
  "Greife die rechte Kindkatze des betroffenen Knotens und ziehe sie nach links oben. Ihr Elternknoten wird automatisch zum Drehpunkt. Die rechte Kindkatze steigt auf; der bisherige Elternknoten rückt nach links unten. Die Vorschau folgt deiner Hand.",
  "Ziehe weit genug und lass los, um die Rotation einzurasten. Lässt du vorher los oder ziehst in die falsche Richtung, kehrt der Baum zurück. Mit der Tastatur: rechte Kindkatze fokussieren und Pfeil links oder Enter drücken.",
  "Hat die aufsteigende Katze schon einen linken Ast, bleibt er als ganzer Teilbaum auf der Ablage. Ziehe seine oberste Katze auf einen freien linken oder rechten Ast. Entscheide selbst, wo er nach der Rotation hingehört. Alle Katzen des Astes kommen mit.",
  "Löse drei Bäume mit jeweils genau einer Rotation. Die Balancefaktoren werden automatisch angezeigt. Bestätige erst, wenn kein Ast mehr auf der Ablage liegt. Für einen neuen Versuch nimmst du deine Schritte mit „Rückgängig“ zurück.",
];
const button = "rounded-xl border-2 border-line bg-cream-light px-4 py-2 text-sm font-bold hover:border-forest hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest";
type Snapshot = { tree: TreeNode; shelf?: TreeNode; slotParent?: number; moves: number; placements?: { expected: number; actual: number; side: BranchSide }[] };

export default function LeftRotationChallenge() {
  const { rotationRounds } = useTutorialExercises();
  const [round, setRound] = useState(0);
  const [complete, setComplete] = useState(false);
  function next() { if (round === rotationRounds.length - 1) setComplete(true); else setRound(value => value + 1); }
  if (complete) return <LevelScreen level={5} title="Linksrotation" tutorialSteps={steps} showTutorialInitially={false} wideWorkspace confirmDisabled undoDisabled onDevBack={() => setComplete(false)}>
    <div className="challenge-result text-center" role="status">
      <p className="text-5xl" aria-hidden="true">✓</p><h2 className="text-3xl font-extrabold">Linksrotation geschafft!</h2>
      <p>Du hast drei Bäume nach links gedreht und die inneren Teilbäume wieder richtig eingesetzt.</p>
      <button className={button} onClick={() => { setRound(0); setComplete(false); }}>Level 5 wiederholen</button><Link href="/" className={button}>Zum Menü</Link>
    </div>
  </LevelScreen>;
  return <RotationRound key={round} initialTree={rotationRounds[round]} round={round} onNext={next} onPrevious={() => setRound(value => value - 1)} />;
}

function RotationRound({ initialTree, round, onNext, onPrevious }: { initialTree: TreeNode; round: number; onNext: () => void; onPrevious: () => void }) {
  const [state, setState] = useState<Snapshot>({ tree: initialTree, moves: 0 });
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [selected, setSelected] = useState<number>();
  const [result, setResult] = useState<"editing" | "error" | "success">("editing");
  const [message, setMessage] = useState(`Ziehe die rechte Kindkatze ${initialTree.right!.value} nach links oben. Katze ${initialTree.value} ist ihr Drehpunkt.`);
  function rotate(plan: LeftRotation) {
    if (state.moves >= 1 || state.shelf || result === "success") return;
    setHistory(previous => [...previous, state]);
    setSelected(plan.lifted);
    setState({ tree: plan.tree, shelf: plan.shelf, slotParent: plan.pivot, moves: state.moves + 1, placements: state.placements });
    setResult("editing");
    setMessage(plan.shelf ? `Katze ${plan.lifted} ist aufgestiegen. Ihr bisheriger linker Ast ab Katze ${plan.shelf.value} wartet auf der Ablage. Setze ihn an einem freien Platz ein. Die Prüfung folgt erst mit „Bestätigen“.`
      : `Die Rotation ist eingerastet. Katze ${plan.lifted} steht nun über Katze ${plan.pivot}. Prüfe die Balancefaktoren und bestätige.`);
  }
  function attach(tree: TreeNode, parent: number, side: BranchSide) {
    setSelected(state.shelf?.value);
    setHistory(previous => [...previous, state]);
    setState({ tree, moves: state.moves, placements: [...(state.placements ?? []), { expected: state.slotParent!, actual: parent, side }] }); setResult("editing");
    setMessage(`Der ganze Ast wurde ${side === "left" ? "links" : "rechts"} an Katze ${parent} eingesetzt. Prüfe jetzt die gesamte Rotation mit „Bestätigen“.`);
  }
  function confirm() {
    if (state.shelf || state.moves === 0) return;
    const misplaced = state.placements?.find(placement => placement.actual !== placement.expected || placement.side !== "right");
    if (misplaced) {
      setResult("error");
      setMessage(`Der Ast wurde ${misplaced.side === "left" ? "links" : "rechts"} an Katze ${misplaced.actual} eingesetzt. Bei dieser Linksrotation gehört der bisherige linke Teilbaum der aufsteigenden Katze rechts an den früheren Elternknoten ${misplaced.expected}. ${explainTree(state.tree) ?? "Auch wenn Zahlen an mehreren Stellen passen, müssen die Verbindungen der Linksrotation erhalten bleiben."} Mit „Rückgängig“ kannst du die Platzierung korrigieren.`);
      return;
    }
    if (nodeFacts(state.tree).length !== nodeFacts(initialTree).length || !isSearchTree(state.tree)) {
      setResult("error"); setMessage(`Die Suchbaumordnung stimmt noch nicht oder ein Ast fehlt. ${explainTree(state.tree) ?? ""} Prüfe die Verbindungen und nutze gegebenenfalls „Rückgängig“.`); return;
    }
    const imbalance = findImbalance(state.tree);
    if (imbalance) {
      setResult("error"); setMessage(`Katze ${imbalance.value} ist noch unausgeglichen: BF = ${imbalance.rightHeight} − ${imbalance.leftHeight} = ${imbalance.rightHeight - imbalance.leftHeight}. Mache die Rotation rückgängig und wähle für deinen neuen Versuch den passenden Drehpunkt.`); return;
    }
    setResult("success"); setMessage("Richtig! Die Suchbaumordnung stimmt, alle Äste sind verbunden und jeder Balancefaktor liegt zwischen −1 und +1.");
  }
  return <LevelScreen level={5} title="Linksrotation" tutorialSteps={steps} showTutorialInitially={round === 0} wideWorkspace
    devBackHref="/tutorial?part=4.3" onDevBack={round > 0 ? onPrevious : undefined} onDevSkip={onNext} onConfirm={confirm} confirmDisabled={!!state.shelf || state.moves === 0 || result === "success"}
    undoDisabled={!history.length} onUndo={() => {
      if (!history.length) return;
      setState(history[history.length - 1]); setHistory(previous => previous.slice(0, -1)); setResult("editing");
      setSelected(undefined);
      setMessage("Letzten Schritt rückgängig gemacht. Du kannst erneut ziehen.");
    }}
    task={<div className="space-y-3 text-sm leading-relaxed">
      <p className="text-base font-extrabold">5.{round + 1} · {round === 0 ? "Die erste Linksrotation" : round === 1 ? "Ein Ast braucht einen neuen Platz" : "Einen ganzen Teilbaum mitnehmen"}</p>
      <div className="rounded-xl bg-blush p-3"><strong>Rechtes Kind nach links oben ziehen.</strong><br />Der Elternknoten wird zum Drehpunkt und rückt nach links unten.</div>
      <p>{state.shelf ? `Ziehe den Ast ab Katze ${state.shelf.value} von der Ablage auf einen beliebigen freien Ast. Entscheide selbst, wo er hingehört.` : "Die Katzen, Sitzflächen und Äste folgen deiner Ziehbewegung. Ziehe weit genug und lass los."}</p>
      <p className="text-xs">BF = Höhe rechts − Höhe links. Die Werte werden automatisch berechnet.</p>
      <p className="text-xs">Eine Rotation pro Baum. Ein neuer Versuch ist mit „Rückgängig“ möglich.</p>
      <p className="text-xs">Tastatur: Kindkatze fokussieren, dann ← oder Enter. Ast einsetzen: mit Tab einen freien Ast wählen und Enter drücken.</p>
    </div>}
  >
    <div className="challenge-workspace">
      <div className="text-center"><p className="text-lg font-extrabold">Baum {round + 1} von 3 · Nach links drehen</p><p className="mt-1 text-sm">{state.shelf ? "Ast auf der Ablage wieder einsetzen" : "Rechtslastigen Kratzbaum ausgleichen"}</p></div>
      <div className="challenge-tree"><RotationScene key={history.length} tree={state.tree} shelf={state.shelf} selectedValue={selected} locked={result === "success"} rotationDisabled={state.moves >= 1} onRotate={rotate} onAttach={attach} onMessage={setMessage} /></div>
      <div className={`rounded-2xl border px-4 py-3 text-center text-sm ${result === "error" ? "border-amber-700/30 bg-[#fff0d6]" : "border-line bg-cream-light"}`} role="status">
        <p>{message}</p>{result === "success" && <button className={`${button} mt-2`} onClick={onNext}>{round < 2 ? "Nächster Baum" : "Level 5 abschließen"}</button>}
      </div>
    </div>
  </LevelScreen>;
}
