"use client";

import { useEffect, useId, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { TreeNode } from "@/lib/search-tree";
import { attachBranch, liftRightChild, type LeftRotation, type BranchSide } from "@/lib/rotation";
import { nodeFacts } from "@/lib/tutorial-exercises";
import catFront from "../../../public/assets/cat-front.png";

type Point = { x: number; y: number };
type Placed = Point & { node: TreeNode; spread: number };
type Preview = { before: TreeNode; after: TreeNode; beforeShelf?: TreeNode; afterShelf?: TreeNode; from?: Map<number, Point>; rotation?: LeftRotation };
type Drag = { kind: "rotate" | "branch"; value: number; start: Point; delta: Point; plan?: LeftRotation };
type Slot = Point & { parent: number; side: BranchSide };

function layout(tree: TreeNode | undefined, shelf = false): Map<number, Placed> {
  const result = new Map<number, Placed>();
  function visit(node: TreeNode, x: number, y: number, spread: number) {
    result.set(node.value, { node, x, y, spread });
    if (node.left) visit(node.left, x - spread, y + (shelf ? 115 : 150), spread / 2);
    if (node.right) visit(node.right, x + spread, y + (shelf ? 115 : 150), spread / 2);
  }
  if (tree) visit(tree, shelf ? 930 : 400, shelf ? 535 : 140, shelf ? 65 : 185);
  return result;
}
function edges(tree: TreeNode | undefined): [number, number][] {
  if (!tree) return [];
  return [...(tree.left ? [[tree.value, tree.left.value] as [number, number], ...edges(tree.left)] : []), ...(tree.right ? [[tree.value, tree.right.value] as [number, number], ...edges(tree.right)] : [])];
}

export default function RotationScene({ tree, shelf, selectedValue, locked, rotationDisabled = false, onRotate, onAttach, onMessage }: {
  tree: TreeNode; shelf?: TreeNode; selectedValue?: number; locked: boolean; rotationDisabled?: boolean;
  onRotate: (plan: LeftRotation) => void; onAttach: (tree: TreeNode, parent: number, side: BranchSide) => void; onMessage: (message: string) => void;
}) {
  const id = useId().replaceAll(":", "");
  const svgRef = useRef<SVGSVGElement>(null);
  const frameRef = useRef(0);
  const dragRef = useRef<Drag | undefined>(undefined);
  const progressRef = useRef(0);
  const [drag, setDrag] = useState<Drag>();
  const [preview, setPreview] = useState<Preview>();
  const [progress, setProgress] = useState(0);
  const [settling, setSettling] = useState(false);
  const [selected, setSelected] = useState<number | undefined>(selectedValue);
  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  const beforeTree = preview?.before ?? tree;
  const afterTree = preview?.after ?? tree;
  const beforeShelf = preview ? preview.beforeShelf : shelf;
  const afterShelf = preview ? preview.afterShelf : shelf;
  const before = new Map([...layout(beforeTree), ...layout(beforeShelf, true)]);
  const after = new Map([...layout(afterTree), ...layout(afterShelf, true)]);
  const points = new Map<number, Placed>();
  for (const [value, original] of before) {
    const start = preview?.from?.get(value) ?? original;
    const end = after.get(value) ?? original;
    let x = start.x + (end.x - start.x) * progress;
    let y = start.y + (end.y - start.y) * progress;
    // Separate arcs make the rising child and descending parent readable.
    if (preview?.rotation?.pivot === value) x -= Math.sin(progress * Math.PI) * 35;
    if (preview?.rotation?.lifted === value) y -= Math.sin(progress * Math.PI) * 60;
    if (!preview && drag?.kind === "branch" && layout(shelf, true).has(value)) { x += drag.delta.x; y += drag.delta.y; }
    points.set(value, { ...original, x, y });
  }
  const beforeEdges = [...edges(beforeTree), ...edges(beforeShelf)];
  const afterEdges = [...edges(afterTree), ...edges(afterShelf)];
  const edgeKeys = new Set([...beforeEdges, ...afterEdges].map(([a, b]) => `${a}:${b}`));
  const facts = new Map([...nodeFacts(tree), ...(shelf ? nodeFacts(shelf) : [])].map(f => [f.node.value, f]));
  const slots: Slot[] = shelf ? [...layout(tree).values()].flatMap(p => (["left", "right"] as const).filter(side => !p.node[side]).map(side => ({ parent: p.node.value, side, x: p.x + (side === "left" ? -1 : 1) * Math.max(92.5, p.spread), y: p.y + 150 }))) : [];
  const baseY = Math.max(650, ...[...layout(beforeTree).values(), ...layout(afterTree).values()].map(p => p.y + 70));
  const viewHeight = Math.max(750, baseY + 40, ...slots.map(slot => slot.y + 40));
  function nearestSlot(position: Point): Slot | undefined {
    return slots.filter(slot => Math.abs(position.x - slot.x) < 44 && position.y > slot.y - 112 && position.y < slot.y + 20)
      .sort((a, b) => Math.hypot(position.x - a.x, position.y - a.y + 48) - Math.hypot(position.x - b.x, position.y - b.y + 48))[0];
  }
  const hoverSlot = drag?.kind === "branch" ? nearestSlot({ x: drag.start.x + drag.delta.x, y: drag.start.y + drag.delta.y }) : undefined;

  function point(event: ReactPointerEvent<SVGGElement>): Point {
    const matrix = svgRef.current!.getScreenCTM()!;
    return new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
  }
  function animate(to: number, done: () => void) {
    cancelAnimationFrame(frameRef.current);
    const from = progressRef.current;
    let start: number | undefined;
    setSettling(true);
    function tick(now: number) {
      start ??= now;
      const time = Math.min(1, (now - start) / 420);
      const eased = time * time * (3 - 2 * time);
      progressRef.current = from + (to - from) * eased;
      setProgress(progressRef.current);
      if (time < 1) frameRef.current = requestAnimationFrame(tick);
      else { done(); setPreview(undefined); setProgress(0); progressRef.current = 0; setSettling(false); }
    }
    frameRef.current = requestAnimationFrame(tick);
  }
  function start(value: number, event: ReactPointerEvent<SVGGElement>) {
    if (locked || settling || event.button !== 0) return;
    setSelected(value);
    const origin = point(event);
    if (shelf) {
      if (value !== shelf.value) { onMessage("Ziehe den abgelegten Ast an seiner obersten Katze. Alle Katzen darunter kommen gemeinsam mit."); return; }
      const next: Drag = { kind: "branch", value, start: origin, delta: { x: 0, y: 0 } };
      dragRef.current = next; setDrag(next);
    } else {
      if (rotationDisabled) { onMessage("Pro Baum ist nur eine Rotation erlaubt. Nutze „Rückgängig“, um einen neuen Versuch zu starten."); return; }
      const plan = liftRightChild(tree, value);
      if (!plan) { onMessage("Für eine Linksrotation ziehst du ein rechtes Kind nach links oben. Sein Elternknoten ist der Drehpunkt."); return; }
      dragRef.current = { kind: "rotate", value, start: origin, delta: { x: 0, y: 0 }, plan };
      setPreview({ before: tree, after: plan.tree, afterShelf: plan.shelf, rotation: plan });
      setProgress(0); progressRef.current = 0;
      onMessage(`Katze ${plan.pivot} ist der Drehpunkt. Ziehe Katze ${value} nach links oben auf ihren Platz.`);
    }
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function move(event: ReactPointerEvent<SVGGElement>) {
    const current = dragRef.current;
    if (!current) return;
    const position = point(event);
    current.delta = { x: position.x - current.start.x, y: position.y - current.start.y };
    if (current.kind === "branch") { setDrag({ ...current }); return; }
    const from = layout(tree).get(current.value)!;
    const to = layout(tree).get(current.plan!.pivot)!;
    const dx = to.x - from.x, dy = to.y - from.y;
    const amount = Math.max(0, Math.min(1, (current.delta.x * dx + current.delta.y * dy) / (dx * dx + dy * dy)));
    progressRef.current = amount; setProgress(amount);
  }
  function attach(parent: number, side: BranchSide, delta?: Point) {
    if (!shelf || locked || settling) return;
    const attached = attachBranch(tree, parent, side, shelf);
    const from = new Map<number, Point>();
    if (delta) for (const [value, p] of layout(shelf, true)) from.set(value, { x: p.x + delta.x, y: p.y + delta.y });
    setPreview({ before: tree, beforeShelf: shelf, after: attached, from });
    setDrag(undefined); progressRef.current = 0; setProgress(0);
    animate(1, () => onAttach(attached, parent, side));
  }
  function release(event: ReactPointerEvent<SVGGElement>, cancelled = false) {
    const current = dragRef.current;
    dragRef.current = undefined;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (!current) return;
    if (current.kind === "branch") {
      const position = point(event);
      const target = nearestSlot(position);
      if (!cancelled && target) attach(target.parent, target.side, current.delta);
      else {
        const from = new Map<number, Point>();
        for (const [value, p] of layout(shelf, true)) from.set(value, { x: p.x + current.delta.x, y: p.y + current.delta.y });
        setPreview({ before: tree, beforeShelf: shelf, after: tree, afterShelf: shelf, from });
        setDrag(undefined); progressRef.current = 0; setProgress(0);
        animate(1, () => onMessage("Der Ast bleibt auf der Ablage. Ziehe ihn auf einen freien linken oder rechten Ast. Ob die Platzierung stimmt, prüfst du anschließend mit „Bestätigen“."));
      }
    } else if (!cancelled && progressRef.current >= .55) {
      animate(1, () => onRotate(current.plan!));
    } else {
      animate(0, () => onMessage("Noch keine Rotation: Ziehe das rechte Kind weiter nach links oben. Der Baum ist wieder in seiner Ausgangslage."));
    }
  }
  function keyboard(value: number) {
    if (locked || settling || dragRef.current) return;
    if (shelf) { if (value === shelf.value) { setSelected(value); onMessage("Wähle mit Tab einen freien linken oder rechten Ast und setze den Teilbaum dort mit Enter ein."); } return; }
    if (rotationDisabled) { onMessage("Pro Baum ist nur eine Rotation erlaubt. Nutze „Rückgängig“ für einen neuen Versuch."); return; }
    const plan = liftRightChild(tree, value);
    if (!plan) { onMessage("Diese Katze ist kein rechtes Kind. Wähle das rechte Kind des Drehpunkts."); return; }
    setSelected(value); setPreview({ before: tree, after: plan.tree, afterShelf: plan.shelf, rotation: plan });
    animate(1, () => onRotate(plan));
  }

  return <svg ref={svgRef} viewBox={`0 0 1100 ${viewHeight}`} className="rotation-scene" role="group" aria-label="Kratzbaum für Linksrotation" data-preview-progress={progress.toFixed(3)}>
    <defs>
      <pattern id={`${id}-rope`} width="22" height="14" patternUnits="userSpaceOnUse"><rect width="22" height="14" fill="#e7bc8e" /><path d="M0 3 Q11 13 22 3" fill="none" stroke="#c7986b" strokeWidth="1.2" /></pattern>
      <filter id={`${id}-glow`} x="-40%" y="-30%" width="180%" height="160%"><feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#e8b72e" /></filter>
    </defs>
    <rect x="805" y="370" width="280" height="360" rx="24" fill="#faf6ec" stroke="#cbd0b8" strokeWidth="3" strokeDasharray="8 5" />
    <text x="945" y="401" textAnchor="middle" fontSize="22" fontWeight="800" fill="#2f4a3b">Ablage</text>
    {!shelf && !preview?.afterShelf && <text x="945" y="440" textAnchor="middle" fontSize="15" fill="#52604d">Platz für einen ganzen Ast</text>}
    <g stroke="#44372c" strokeWidth="2">
      {[...new Set([...nodeFacts(beforeTree), ...nodeFacts(afterTree)].filter(f => !f.node.left && !f.node.right).map(f => f.node.value))].map(value => {
        const p = points.get(value)!;
        const wasLeaf = nodeFacts(beforeTree).some(f => f.node.value === value && !f.node.left && !f.node.right);
        const isLeaf = nodeFacts(afterTree).some(f => f.node.value === value && !f.node.left && !f.node.right);
        return <rect key={`support-${value}`} x={p.x - 11} y={p.y + 10} width="22" height={Math.max(0, baseY - 10 - p.y)} fill={`url(#${id}-rope)`} opacity={wasLeaf && isLeaf ? 1 : wasLeaf ? 1 - progress : progress} />;
      })}
      {[beforeTree, ...(preview ? [afterTree] : [])].map((root, index) => { const p = points.get(root.value)!; return <rect key={`${root.value}-${index}`} x={p.x - 11} y={p.y + 10} width="22" height={Math.max(0, baseY - 10 - p.y)} fill={`url(#${id}-rope)`} opacity={preview ? index === 0 ? 1 - progress : progress : 1} />; })}
      {[...edgeKeys].map(key => {
        const [a, b] = key.split(":").map(Number);
        const p = points.get(a)!, q = points.get(b)!;
        const direction = q.x < p.x ? -1 : 1;
        const offset = Math.min(36, Math.abs(q.x - p.x) * .2);
        const dx = q.x - direction * offset - (p.x + direction * offset), dy = q.y - p.y - 5;
        const opacity = !preview ? 1 : beforeEdges.some(e => e[0] === a && e[1] === b) ? afterEdges.some(e => e[0] === a && e[1] === b) ? 1 : 1 - progress : progress;
        return <rect key={key} x="-10" width="20" height={Math.hypot(dx, dy).toFixed(5)} fill={`url(#${id}-rope)`} opacity={opacity}
          transform={`translate(${p.x + direction * offset} ${p.y + 12}) rotate(${(Math.atan2(dy, dx) * 180 / Math.PI - 90).toFixed(5)})`} />;
      })}
      <rect x="65" y={baseY} width="705" height="18" rx="9" fill="#e7bc8e" />
    </g>
    {shelf && !preview && slots.map(slot => <g key={`${slot.parent}-${slot.side}`} role="button" tabIndex={locked || settling ? -1 : 0}
      aria-label={`Freier ${slot.side === "left" ? "linker" : "rechter"} Ast an Katze ${slot.parent}`}
      data-drop-parent={slot.parent} data-drop-side={slot.side}
      onClick={event => { if (!locked && !settling) attach(Number(event.currentTarget.dataset.dropParent), event.currentTarget.dataset.dropSide as BranchSide); }}
      onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); attach(Number(event.currentTarget.dataset.dropParent), event.currentTarget.dataset.dropSide as BranchSide); } }}>
      <rect x={slot.x - 40} y={slot.y - 108} width="80" height="126" rx="14" fill={hoverSlot === slot ? "#cbd0b8" : "#faf6ecbb"} stroke="#a7b6a1" strokeWidth="2" strokeDasharray="6 5" />
      <text x={slot.x} y={slot.y - 52} textAnchor="middle" fontSize="24" fill="#52604d" pointerEvents="none">+</text>
      <rect x={slot.x - 37} y={slot.y} width="74" height="14" rx="7" fill="#faf6ec" stroke="#a7b6a1" strokeDasharray="5 4" />
    </g>)}
    {preview?.rotation && <g opacity={1 - progress} pointerEvents="none"><circle cx={layout(tree).get(preview.rotation.pivot)!.x} cy={layout(tree).get(preview.rotation.pivot)!.y - 55} r="64" fill="none" stroke="#8a9c37" strokeWidth="3" strokeDasharray="7 5" /></g>}
    {[...points].map(([value, p]) => {
      const bf = facts.get(value)?.bf;
      const onShelf = layout(shelf, true).has(value);
      const highlighted = selected === value || preview?.rotation?.pivot === value;
      const canDrag = !locked && !settling && (shelf ? value === shelf.value : !rotationDisabled);
      return <g key={value} transform={`translate(${p.x} ${p.y})`} className="tree-cat rotation-cat" data-highlighted={highlighted} data-rotation-cat={value}
        role="button" tabIndex={canDrag ? 0 : -1} aria-disabled={!canDrag} aria-label={onShelf && shelf?.value === value ? `Ast ab Katze ${value} ziehen` : `Katze ${value} rotieren`}
        style={{ cursor: canDrag ? "grab" : "default", touchAction: "none" }}
        onPointerDown={event => start(value, event)} onPointerMove={move} onPointerUp={event => release(event)} onPointerCancel={event => release(event, true)}
        onKeyDown={event => { if (event.key === "Enter" || event.key === "ArrowLeft" || event.key === " ") { event.preventDefault(); keyboard(value); } }}>
        <rect x="-58" y="-130" width="116" height="150" fill="transparent" />
        <image href={catFront.src} x="-50" y="-126" width="100" height="128" filter={highlighted ? `url(#${id}-glow)` : undefined} />
        <rect x="-55" width="110" height="18" rx="9" fill="#e7bc8e" stroke="#44372c" strokeWidth="2" />
        <circle cx="-2" cy="-40" r="12.5" fill="#fff8e9" stroke={highlighted ? "#b5c646" : "#2f4a3b"} strokeWidth="1.7" />
        <rect x="-4.2" y="-57" width="4.4" height="8" rx="2" fill="#e9b52b" stroke="#6b4618" />
        <text x="-2" y="-39" textAnchor="middle" dominantBaseline="central" fontSize="15" fontWeight="800" fill="#263d31">{value}</text>
        {!preview && bf !== undefined && <g pointerEvents="none"><rect x="-37" y="21" width="74" height="25" rx="8" fill={Math.abs(bf) > 1 ? "#f7ddc4" : "#faf6ec"} stroke="#cbd0b8" /><text x="0" y="39" textAnchor="middle" fontSize="16" fontWeight="700" fill="#263d31">BF {bf > 0 ? "+" : ""}{bf}</text></g>}
      </g>;
    })}
  </svg>;
}
