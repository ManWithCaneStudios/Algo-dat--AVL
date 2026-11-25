"use client";

import { useState } from "react";
import { explainTree, findImbalance, isSearchTree, type TreeNode } from "@/lib/search-tree";
import { type LeftRotation, type BranchSide, type RotationDirection } from "@/lib/rotation";
import { nodeFacts } from "@/lib/tutorial-exercises";
import { useTutorialExercises } from "./TutorialExercises";
import LevelScreen from "./LevelScreen";
import RotationScene from "./RotationScene";

function rotationInfo(direction: RotationDirection) {
  return direction === "left"
    ? { level: 5, title: "Linksrotation", drag: "links", child: "rechte", inner: "linker", attachSide: "right" as const, attachName: "rechts", arrow: "←", back: "/tutorial?part=4.3" }
    : { level: 6, title: "Rechtsrotation", drag: "rechts", child: "linke", inner: "rechter", attachSide: "left" as const, attachName: "links", arrow: "→", back: "/tutorial?part=5.3" };
}
function tutorialSteps(direction: RotationDirection, round: number) {
  const info = rotationInfo(direction);
  const introduction = direction === "left"
    ? "Oh nein! Dieser Kratzbaum ist zu stark auf der rechten Seite gewachsen und wackelt schon bedenklich. Ein solcher Baum ist nicht mehr richtig ausbalanciert, und die Suche nach Katzen kann längere Wege brauchen. Zum Glück gibt es eine Lösung: die Linksrotation."
    : "Gut gemacht! Die Katzen konnten bereits einige Kratzbäume mit einer Linksrotation wieder ins Gleichgewicht bringen. Nun gibt es jedoch ein anderes Problem: Manche Kratzbäume sind zu stark nach links gewachsen. Damit die Suche weiterhin schnell funktioniert, müssen wir auch solche Bäume wieder ausbalancieren. Diesmal mit der Rechtsrotation.";
  const task = round === 0
    ? `Betrachte den unausgeglichenen Baum und seine Balancefaktoren. Finde heraus, warum er nach ${info.drag === "links" ? "rechts" : "links"} kippt, und beobachte bei deiner Ziehbewegung, wie eine ${info.title} das Gleichgewicht wiederherstellt.`
    : round === 1
      ? `Jetzt bist du an der Reihe. Der Kratzbaum ist erneut aus dem Gleichgewicht geraten. Führe die passende ${info.title} durch und achte darauf, dass am Ende sowohl die AVL-Balancebedingung als auch die Suchbaumregeln erfüllt sind.`
      : `Die Katzen haben noch einen weiteren unausgeglichenen Kratzbaum entdeckt. Untersuche ihn und führe die passende ${info.title} selbstständig durch. Nimm dabei auch den ganzen Teilbaum auf der Ablage mit.`;
  return [
    round === 0 ? introduction : task,
    `Bei den Bäumen in diesem Level reicht jeweils eine ${info.title}: Der betroffene Knoten hat BF ${direction === "left" ? "+2" : "−2"}, sein ${info.child}s Kind wächst ${direction === "left" ? "nach rechts oder gleich hoch auf beiden Seiten" : "nach links oder gleich hoch auf beiden Seiten"}. Wächst dieses Kind stärker zur anderen Seite, ist stattdessen eine Doppelrotation nötig.`,
    `Greife die ${info.child} Kindkatze und ziehe sie nach ${info.drag} oben. Ihr Elternknoten ist der Drehpunkt und rückt nach ${info.drag} unten. Die Animation folgt deiner Hand. Ziehe weit genug und lass los; ein zu kurzer Zug gleitet zurück.`,
    `Hat die aufsteigende Katze einen ${direction === "left" ? "linken" : "rechten"} Teilbaum, wartet dieser auf der Ablage. Ziehe ihn als ganzen Ast an einen freien Platz. Entscheide selbst, wo er nach der Rotation hingehört. Erst „Bestätigen“ prüft die Rotation und die Platzierung. Nach einer korrekten Lösung kommt direkt der nächste Baum.`,
    `Pro Baum ist eine Rotation erlaubt. Mit „Rückgängig“ kannst du es erneut versuchen. Falls du Hilfe brauchst, kannst du jederzeit den Hilfe-Knopf mit dem Fragezeichen drücken. Mit der Tastatur: Kindkatze fokussieren und Pfeil ${info.drag} oder Enter drücken; einen freien Ast mit Tab wählen und mit Enter einsetzen.`,
  ];
}
type Snapshot = { tree: TreeNode; shelf?: TreeNode; slotParent?: number; moves: number; placements?: { expected: number; actual: number; side: BranchSide }[] };

export default function RotationChallenge({ direction = "left", initialRound = 0 }: { direction?: RotationDirection; initialRound?: number }) {
  const exercises = useTutorialExercises();
  const rotationRounds = direction === "left" ? exercises.rotationRounds : exercises.rightRotationRounds;
  const [round, setRound] = useState(initialRound);
  const [nextLevel, setNextLevel] = useState(false);
  function next() {
    if (round < rotationRounds.length - 1) setRound(value => value + 1);
    else if (direction === "left") setNextLevel(true);
  }
  if (nextLevel) return <RotationChallenge direction="right" />;
  return <RotationRound direction={direction} key={round} initialTree={rotationRounds[round]} round={round} onNext={next} onPrevious={() => setRound(value => value - 1)} />;
}

function RotationRound({ direction, initialTree, round, onNext, onPrevious }: { direction: RotationDirection; initialTree: TreeNode; round: number; onNext: () => void; onPrevious: () => void }) {
  const info = rotationInfo(direction);
  const steps = tutorialSteps(direction, round);
  const [state, setState] = useState<Snapshot>({ tree: initialTree, moves: 0 });
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [selected, setSelected] = useState<number>();
  const [result, setResult] = useState<"editing" | "error" | "success">("editing");
  const [message, setMessage] = useState(`Ziehe die ${info.child} Kindkatze ${initialTree[direction === "left" ? "right" : "left"]!.value} nach ${info.drag} oben. Katze ${initialTree.value} ist ihr Drehpunkt.`);
  function rotate(plan: LeftRotation) {
    if (state.moves >= 1 || state.shelf || result === "success") return;
    setHistory(previous => [...previous, state]);
    setSelected(plan.lifted);
    setState({ tree: plan.tree, shelf: plan.shelf, slotParent: plan.pivot, moves: state.moves + 1, placements: state.placements });
    setResult("editing");
    setMessage(plan.shelf ? `Katze ${plan.lifted} ist aufgestiegen. Ihr bisheriger ${info.inner} Ast ab Katze ${plan.shelf.value} wartet auf der Ablage. Setze ihn an einem freien Platz ein. Die Prüfung folgt erst mit „Bestätigen“.`
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
    const misplaced = state.placements?.find(placement => placement.actual !== placement.expected || placement.side !== info.attachSide);
    if (misplaced) {
      setResult("error");
      setMessage(`Der Ast wurde ${misplaced.side === "left" ? "links" : "rechts"} an Katze ${misplaced.actual} eingesetzt. Bei dieser ${info.title} gehört der bisherige ${direction === "left" ? "linke" : "rechte"} Teilbaum der aufsteigenden Katze ${info.attachName} an den früheren Elternknoten ${misplaced.expected}. ${explainTree(state.tree) ?? "Auch wenn Zahlen an mehreren Stellen passen, müssen die Verbindungen der Rotation erhalten bleiben."} Mit „Rückgängig“ kannst du die Platzierung korrigieren.`);
      return;
    }
    if (nodeFacts(state.tree).length !== nodeFacts(initialTree).length || !isSearchTree(state.tree)) {
      setResult("error"); setMessage(`Die Suchbaumordnung stimmt noch nicht oder ein Ast fehlt. ${explainTree(state.tree) ?? ""} Prüfe die Verbindungen und nutze gegebenenfalls „Rückgängig“.`); return;
    }
    const imbalance = findImbalance(state.tree);
    if (imbalance) {
      setResult("error"); setMessage(`Katze ${imbalance.value} ist noch unausgeglichen: BF = ${imbalance.rightHeight} − ${imbalance.leftHeight} = ${imbalance.rightHeight - imbalance.leftHeight}. Mache die Rotation rückgängig und wähle für deinen neuen Versuch den passenden Drehpunkt.`); return;
    }
    if (direction === "right" && round === 2) {
      setResult("success");
      setMessage("Richtig! Level 6 ist abgeschlossen. Hier geht es weiter, sobald Level 7 verfügbar ist.");
    } else onNext();
  }
  return <LevelScreen level={info.level} title={info.title} tutorialSteps={steps} showTutorialInitially={round === 0} wideWorkspace
    devBackHref={info.back} onDevBack={round > 0 ? onPrevious : undefined} onDevSkip={onNext} onConfirm={confirm} confirmDisabled={!!state.shelf || state.moves === 0 || result === "success"}
    undoDisabled={!history.length} onUndo={() => {
      if (!history.length) return;
      setState(history[history.length - 1]); setHistory(previous => previous.slice(0, -1)); setResult("editing");
      setSelected(undefined);
      setMessage("Letzten Schritt rückgängig gemacht. Du kannst erneut ziehen.");
    }}
    task={<div className="space-y-3 text-sm leading-relaxed">
      <p className="text-base font-extrabold">{info.level}.{round + 1} · {round === 0 ? `Die erste ${info.title}` : round === 1 ? "Ein Ast braucht einen neuen Platz" : "Einen ganzen Teilbaum mitnehmen"}</p>
      <div className="rounded-xl bg-blush p-3"><strong>{direction === "left" ? "Rechtes" : "Linkes"} Kind nach {info.drag} oben ziehen.</strong><br />Der Elternknoten wird zum Drehpunkt und rückt nach {info.drag} unten.</div>
      <p>{state.shelf ? `Ziehe den Ast ab Katze ${state.shelf.value} von der Ablage auf einen beliebigen freien Ast. Entscheide selbst, wo er hingehört.` : "Die Katzen, Sitzflächen und Äste folgen deiner Ziehbewegung. Ziehe weit genug und lass los."}</p>
      <p className="text-xs">BF = Höhe rechts − Höhe links. Die Werte werden automatisch berechnet.</p>
      <p className="text-xs">Eine Rotation pro Baum. Ein neuer Versuch ist mit „Rückgängig“ möglich.</p>
      <p className="text-xs">Tastatur: Kindkatze fokussieren, dann {info.arrow} oder Enter. Ast einsetzen: mit Tab einen freien Ast wählen und Enter drücken.</p>
    </div>}
  >
    <div className="challenge-workspace">
      <div className="text-center"><p className="text-lg font-extrabold">Baum {round + 1} von 3 · Nach {info.drag} drehen</p><p className="mt-1 text-sm">{state.shelf ? "Ast auf der Ablage wieder einsetzen" : direction === "left" ? "Rechtslastigen Kratzbaum ausgleichen" : "Linkslastigen Kratzbaum ausgleichen"}</p></div>
      <div className="challenge-tree"><RotationScene direction={direction} key={history.length} tree={state.tree} shelf={state.shelf} selectedValue={selected} locked={result === "success"} rotationDisabled={state.moves >= 1} onRotate={rotate} onAttach={attach} onMessage={setMessage} /></div>
      <div className={`rounded-2xl border px-4 py-3 text-center text-sm ${result === "error" ? "border-amber-700/30 bg-[#fff0d6]" : "border-line bg-cream-light"}`} role="status">
        <p>{message}</p>
      </div>
    </div>
  </LevelScreen>;
}
