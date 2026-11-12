"use client";

import { useEffect, useState } from "react";
import { isSearchTree, repairChallenge, swapTreeValues, traceSearch, type TreeNode } from "@/lib/search-tree";
import LevelScreen from "./LevelScreen";
import SearchTree from "./SearchTree";
import TreeCategoryChallenge from "./TreeCategoryChallenge";

const steps = [
  "Willkommen in Level 2! Finde Katze 30. Mit „Suchen“ läuft der Suchalgorithmus von oben nach unten durch den Kratzbaum: kleinere Zahl nach links, größere nach rechts.",
  "Aber etwas stimmt hier nicht! Beobachte zuerst, wo die Suche endet. Die gesuchte Katze kann im Baum sitzen und trotzdem nicht gefunden werden, wenn die Suchbaumordnung verletzt ist.",
  "Nach der ersten Suche kannst du eine Katze auf eine andere ziehen, um ihre Plätze zu tauschen. Tausche nur die Katzen, nicht ihre Äste. Du kannst alternativ zwei Katzen nacheinander anklicken oder mit der Tastatur auswählen.",
  "Klicke danach erneut auf „Suchen“. Erst wenn die Suchbaumordnung stimmt, kann die Suche ihren richtigen Weg gehen. Mit „Rückgängig“ nimmst du einen Tausch zurück.",
];
type Status = "idle" | "searching" | "returning" | "failed" | "invalid" | "found";

export default function RepairSearchChallenge() {
  const [tree, setTree] = useState(repairChallenge.tree);
  const [history, setHistory] = useState<TreeNode[]>([]);
  const [path, setPath] = useState<number[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [hasSearched, setHasSearched] = useState(false);
  const [selected, setSelected] = useState<number>();
  const [message, setMessage] = useState("Klicke auf „Suchen“ und beobachte den Weg zu Katze 30.");
  const [scene, setScene] = useState(0);
  const [nextLevel, setNextLevel] = useState(false);
  const running = status === "searching" || status === "returning";
  const canSwap = hasSearched && !running && status !== "found";
  const target = repairChallenge.target;

  useEffect(() => {
    if (status !== "searching") return;
    const result = traceSearch(tree, target);
    let index = 0;
    const timer = window.setInterval(() => {
      if (index < result.path.length) {
        const value = result.path[index];
        setPath(result.path.slice(0, ++index));
        setMessage(value === target ? `Katze ${target} erreicht!` : `${target} ist ${target < value ? "kleiner" : "größer"} als ${value}. Die Suche geht nach ${target < value ? "links" : "rechts"}.`);
      } else {
        window.clearInterval(timer);
        setHasSearched(true);
        if (!result.found) {
          setStatus("returning");
          if (result.path.length > 1) setPath(result.path.slice(0, -1));
          setMessage(`Sackgasse bei Katze ${result.path.at(-1)}: Der nächste Platz ist leer.${result.path.length > 1 ? ` Die Markierung läuft zurück zu Katze ${result.path.at(-2)}.` : ""}`);
        } else if (!isSearchTree(tree)) {
          setStatus("invalid");
          setMessage(`Katze ${target} gefunden! Aber an anderer Stelle ist die Suchbaumordnung noch verletzt. Prüfe den ganzen Baum und tausche weiter.`);
        } else {
          setStatus("found");
          setMessage(`Geschafft! Katze ${target} wurde gefunden und die Suchbaumordnung stimmt. Der Suchpfad führt jetzt zum richtigen Ziel.`);
        }
      }
    }, 650);
    return () => window.clearInterval(timer);
  }, [status, tree, target]);

  useEffect(() => {
    if (status !== "returning") return;
    const timer = window.setTimeout(() => {
      setStatus("failed");
      setMessage(`Katze ${target} wurde nicht gefunden. Die Markierung ist einen Schritt zurückgegangen. Tausche zwei Katzen, um die Suchbaumordnung wiederherzustellen, und suche erneut.`);
    }, 550);
    return () => window.clearTimeout(timer);
  }, [status, target]);

  function swap(first: number, second: number) {
    if (!canSwap || first === second) return;
    setHistory(previous => [...previous, tree]);
    setTree(swapTreeValues(tree, first, second));
    setPath([]);
    setSelected(undefined);
    setStatus("idle");
    setScene(previous => previous + 1);
    setMessage(`Katzen ${first} und ${second} getauscht. Klicke auf „Suchen“, um den neuen Weg zu prüfen.`);
  }

  function reset() {
    setTree(repairChallenge.tree); setHistory([]); setPath([]); setStatus("idle");
    setHasSearched(false); setSelected(undefined); setScene(previous => previous + 1);
    setMessage("Klicke auf „Suchen“ und beobachte den Weg zu Katze 30.");
  }

  if (nextLevel) return <TreeCategoryChallenge />;

  return <LevelScreen level={2} title="Suchen & Tauschen" tutorialSteps={steps} wideWorkspace
    confirmLabel="Suchen" confirmDisabled={running}
    onConfirm={() => { setPath([]); setSelected(undefined); setScene(previous => previous + 1); setStatus("searching"); setMessage("Die Suche startet bei der Wurzel …"); }}
    undoDisabled={running || history.length === 0}
    onUndo={() => {
      if (running || !history.length) return;
      setTree(history[history.length - 1]); setHistory(previous => previous.slice(0, -1));
      setPath([]); setSelected(undefined); setStatus("idle"); setScene(previous => previous + 1);
      setMessage("Letzten Tausch rückgängig gemacht. Prüfe den Baum mit „Suchen“.");
    }}
    onDevSkip={() => setNextLevel(true)}
    task={<div className="flex flex-col gap-3 text-base leading-relaxed lg:text-[max(14px,calc(24*var(--u)))]">
      <p className="font-extrabold">2.1 · Suchen & Tauschen</p>
      <p>Finde Katze <strong>{target}</strong> mit „Suchen“.</p>
      <div className="rounded-xl bg-blush p-3">{!hasSearched ? "Beobachte zuerst die Suche. Findet sie die Katze?" : status === "found" ? "Geschafft! Die Suche funktioniert wieder." : "Stelle die Suchbaumordnung wieder her: Ziehe eine Katze auf eine andere, um beide zu tauschen."}</div>
      {canSwap && <p className="text-sm">Alternativ: zwei Katzen nacheinander anklicken.</p>}
    </div>}
  >
    <div className="challenge-workspace">
      <div className="text-center" aria-live="polite">
        <p className="text-lg font-extrabold">Finde Katze {target}</p>
        <p className="mt-1 text-sm">Markierter Weg: {path.length ? path.join(" → ") : "noch nicht gestartet"}</p>
      </div>
      <div className="challenge-tree">
        <SearchTree key={scene} tree={tree} pathValues={path}
          selectedValues={selected !== undefined ? [selected] : path.length ? [path[path.length - 1]] : []}
          interactionDisabled={!canSwap}
          onSwapNodes={canSwap ? swap : undefined}
          onSelectNode={value => {
            if (!canSwap) return;
            if (selected === value) setSelected(undefined);
            else if (selected !== undefined) swap(selected, value);
            else { setSelected(value); setMessage(`Katze ${value} ausgewählt. Wähle ihre Tauschpartnerin oder ziehe sie auf eine andere Katze.`); }
          }} />
      </div>
      <div className={`rounded-2xl border px-4 py-3 text-center text-sm ${status === "failed" || status === "invalid" ? "border-amber-700/30 bg-[#fff0d6]" : "border-line bg-cream-light"}`} role="status" aria-atomic="true">
        <p>{message}</p>
        {status === "found" && <div className="mt-2 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={() => setNextLevel(true)} className="rounded-xl bg-forest px-4 py-2 font-bold text-cream-light hover:bg-forest-dark">Weiter zu Level 3</button>
          <button type="button" onClick={reset} className="rounded-xl border border-forest px-4 py-2 font-bold text-forest hover:bg-sage-light">Aufgabe wiederholen</button>
        </div>}
      </div>
    </div>
  </LevelScreen>;
}
