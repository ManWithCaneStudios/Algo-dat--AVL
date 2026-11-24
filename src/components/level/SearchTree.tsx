"use client";

import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from "react";
import type { TreeNode } from "@/lib/search-tree";
import catFront from "../../../public/assets/cat-front.png";

type PositionedNode = { node: TreeNode; x: number; y: number; parent?: { x: number; y: number; value: number } };

type SearchTreeProps = {
  tree: TreeNode;
  onSelectNode?: (value: number) => void;
  selectedValue?: number;
  selectedValues?: number[];
  pathValues?: number[];
  onSwapNodes?: (first: number, second: number) => void;
  interactionDisabled?: boolean;
  errorValues?: number[];
  nodeBadges?: Record<number, string>;
  nodePopover?: { value: number; content: ReactNode };
};

function NodePopover({ svgRef, value, children }: { svgRef: RefObject<SVGSVGElement | null>; value: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ left: number; top: number }>();
  const positioned = position !== undefined;
  useEffect(() => {
    if (!positioned) return;
    const input = ref.current?.querySelector<HTMLInputElement>("input");
    input?.focus(); input?.select();
  }, [positioned, value]);
  useEffect(() => {
    const svg = svgRef.current, panel = ref.current;
    if (!svg || !panel || !svg.parentElement) return;
    const container = svg.parentElement;
    function measure() {
      const anchor = svg!.querySelector(`[data-cat-value="${value}"]`);
      if (!anchor) return;
      const bounds = anchor.getBoundingClientRect(), outer = container.getBoundingClientRect();
      const width = panel!.offsetWidth, height = panel!.offsetHeight;
      const right = bounds.right - outer.left + 10;
      const left = bounds.left - outer.left - width - 10;
      const fitsBeside = right + width <= outer.width || left >= 0;
      const preferred = right + width <= outer.width ? right : left;
      const below = bounds.bottom - outer.top + 8;
      const above = bounds.top - outer.top - height - 8;
      setPosition({
        left: Math.max(0, Math.min(outer.width - width, fitsBeside ? preferred : (bounds.left + bounds.width / 2 - outer.left - width / 2))),
        top: Math.max(0, Math.min(outer.height - height, fitsBeside ? bounds.top - outer.top + 16 : below + height <= outer.height ? below : above)),
      });
    }
    const frame = requestAnimationFrame(measure);
    const observer = new ResizeObserver(measure);
    observer.observe(container); observer.observe(panel);
    window.addEventListener("scroll", measure, true);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener("scroll", measure, true); };
  }, [svgRef, value]);
  return <div ref={ref} className="balance-node-popover" role="group" aria-label={`Werte für Katze ${value}`} style={{ left: position?.left ?? 0, top: position?.top ?? 0, visibility: position ? "visible" : "hidden" }}>{children}</div>;
}

function LiquidFill({ width, height, active, delay = 0, duration = 325, radius = 0 }: {
  width: number; height: number; active: boolean; delay?: number; duration?: number; radius?: number;
}) {
  const clipId = useId().replaceAll(":", "");
  const wave = Math.min(5, height / 4);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  useEffect(() => {
    const from = progressRef.current;
    const target = active ? 1 : 0;
    if (from === target) return;
    let frame: number;
    const start = performance.now() + (active ? delay : 0);
    function tick(now: number) {
      const time = Math.min(1, Math.max(0, (now - start) / duration));
      // Ease-in-out quart: gentle ends with a more energetic middle.
      const eased = time < 0.5 ? 8 * time ** 4 : 1 - (-2 * time + 2) ** 4 / 2;
      progressRef.current = from + (target - from) * eased;
      setProgress(progressRef.current);
      if (time < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, delay, duration]);
  return <g className="tree-liquid-fill" data-active={active} stroke="none" pointerEvents="none">
    <defs><clipPath id={clipId}><rect width={width} height={height} rx={radius} /></clipPath></defs>
    <g clipPath={`url(#${clipId})`}>
      <g className="tree-liquid-progress" style={{
        transform: `translateY(${-wave + progress * (height + wave * 2)}px)`,
        transition: "none",
      }}>
        <g className="tree-liquid-wave" style={{ animation: "none", transform: `translateX(${Math.sin(progress * Math.PI * 8) * 5}px)` }}>
          <path fill="#b5c646" d={`M${-width} ${-height - wave * 3} H${width * 2} V0 Q${width * 1.75} ${wave} ${width * 1.5} 0 T${width} 0 T${width * .5} 0 T0 0 T${-width * .5} 0 T${-width} 0 Z`} />
          <path fill="none" stroke="#e4ecaa" strokeWidth="2" opacity=".85" d={`M${-width} 0 Q${-width * .75} ${wave} ${-width * .5} 0 T0 0 T${width * .5} 0 T${width} 0 T${width * 1.5} 0 T${width * 2} 0`} />
        </g>
      </g>
    </g>
  </g>;
}

export default function SearchTree({ tree, onSelectNode, selectedValue, selectedValues, pathValues = [], onSwapNodes, interactionDisabled = false, errorValues = [], nodeBadges, nodePopover }: SearchTreeProps) {
  const patternId = useId().replaceAll(":", "");
  const svgRef = useRef<SVGSVGElement>(null);
  const [clicked, setClicked] = useState<{ tree: TreeNode; externalValue: number | undefined; value: number }>();
  type DragState = { value: number; startX: number; startY: number; dx: number; dy: number; moved: boolean; over?: number };
  const dragRef = useRef<DragState | undefined>(undefined);
  const [drag, setDrag] = useState<DragState>();
  const suppressClick = useRef(false);
  // Visual selection is independent of whether a challenge accepts the answer.
  const activeValue = clicked?.tree === tree && clicked.externalValue === selectedValue ? clicked.value : selectedValue;
  function select(value: number) {
    if (interactionDisabled) return;
    if (suppressClick.current) { suppressClick.current = false; return; }
    setClicked({ tree, externalValue: selectedValue, value });
    onSelectNode?.(value);
  }
  const nodes: PositionedNode[] = [];
  function layout(node: TreeNode, x: number, y: number, spread: number, parent?: { x: number; y: number; value: number }) {
    nodes.push({ node, x, y, parent });
    if (node.left) layout(node.left, x - spread, y + 155, spread / 2, { x, y, value: node.value });
    if (node.right) layout(node.right, x + spread, y + 155, spread / 2, { x, y, value: node.value });
  }
  layout(tree, 400, 145, 205);
  const bottom = Math.max(...nodes.map(n => n.y)) + 65;
  const leftmost = Math.min(...nodes.map(node => node.x));
  const rightmost = Math.max(...nodes.map(node => node.x));
  const viewLeft = Math.min(0, leftmost - 76);
  const viewRight = Math.max(800, rightmost + 76);
  const baseLeft = Math.min(70, leftmost - 16);
  const baseRight = Math.max(730, rightmost + 16);
  return (<>
    <svg ref={svgRef} viewBox={`${viewLeft} 0 ${viewRight - viewLeft} ${bottom + 20}`} role="group" aria-label="Kratzbaum mit nummerierten Katzen" className="challenge-tree-image">
      <title>Prüfe die Zahlen im gesamten linken und rechten Teilbaum.</title>
      <desc>{nodes.map(({ node }) => `Katze ${node.value}: links ${node.left?.value ?? "leer"}, rechts ${node.right?.value ?? "leer"}`).join(". ")}</desc>
      <defs>
        <filter id={`${patternId}-selected`} x="-45%" y="-35%" width="190%" height="170%" colorInterpolationFilters="sRGB">
          <feMorphology in="SourceAlpha" operator="dilate" radius="1" result="expanded" />
          <feFlood floodColor="#e8b72e" />
          <feComposite in2="expanded" operator="in" result="gold" />
          <feGaussianBlur in="gold" stdDeviation="6" result="blurredGlow" />
          {/* Keep the glow outside the solid outline instead of washing over it. */}
          <feComposite in="blurredGlow" in2="expanded" operator="out" result="glow" />
          <feFlood floodColor="#b5c646" />
          <feComposite in2="expanded" operator="in" result="outline" />
          <feMerge><feMergeNode in="glow" /><feMergeNode in="glow" /><feMergeNode in="outline" /></feMerge>
        </filter>
        <pattern id={patternId} width="24" height="13" patternUnits="userSpaceOnUse">
          <rect width="24" height="13" fill="#e7bc8e" />
          <path d="M0 4 Q12 14 24 4" fill="none" stroke="#c7986b" strokeWidth="1.3" />
        </pattern>
      </defs>
      <g stroke="#44372c" strokeWidth="2">
        <rect x="388" y="145" width="24" height={bottom - 145} fill={`url(#${patternId})`} />
        {nodes.filter(n => n.parent).map(({ node, x, y, parent }, i) => {
          const direction = x < parent!.x ? -1 : 1;
          const attachment = Math.min(42, Math.abs(x - parent!.x) * 0.2);
          const startX = parent!.x + direction * attachment;
          const startY = parent!.y + 12;
          const endX = x - direction * attachment;
          const endY = y + 9;
          const dx = endX - startX;
          const dy = endY - startY;
          const angle = Number((Math.atan2(dy, dx) * 180 / Math.PI - 90).toFixed(6));
          const visited = pathValues.some((value, index) => value === parent!.value && pathValues[index + 1] === node.value);
          const length = Number(Math.hypot(dx, dy).toFixed(6));
          return <g key={i} transform={`translate(${startX} ${startY}) rotate(${angle})`}>
            <rect x="-11" y="0" width="22" height={length} fill={`url(#${patternId})`} />
            <g transform="translate(-10 1)"><LiquidFill width={20} height={length - 2} active={visited} /></g>
          </g>;
        })}
        {nodes.filter(n => !n.node.left && !n.node.right).map(({ x, y }) => <rect key={x} x={x - 12} y={y} width="24" height={bottom - y} fill={`url(#${patternId})`} />)}
        <rect x={baseLeft} y={bottom} width={baseRight - baseLeft} height="17" rx="8" fill="#e7bc8e" />
        {nodes.map(({ node, x, y, parent }) => {
          const visited = pathValues.includes(node.value);
          return <g key={node.value} transform={`translate(${x} ${y})`}>
            <rect x="-64" y="0" width="128" height="19" rx="9" fill="#e7bc8e" />
            <g transform="translate(-63 1)"><LiquidFill width={126} height={17} radius={8} active={visited} delay={parent ? 240 : 0} duration={175} /></g>
          </g>;
        })}
      </g>
      {nodes.map(({ node, x, y }) => (
        <g key={node.value}
          role="button"
          tabIndex={interactionDisabled ? -1 : 0}
          aria-disabled={interactionDisabled}
          aria-label={`Katze ${node.value} auswählen`}
          data-cat-value={node.value}
          data-error={errorValues.includes(node.value)}
          aria-pressed={selectedValues ? selectedValues.includes(node.value) : activeValue === node.value}
          className="tree-cat tree-cat-button"
          data-highlighted={drag?.value === node.value || drag?.over === node.value || (selectedValues ? selectedValues.includes(node.value) : activeValue === node.value)}
          style={{
            touchAction: onSwapNodes ? "none" : undefined,
            cursor: interactionDisabled ? "default" : onSwapNodes ? "grab" : undefined,
            transform: drag?.value === node.value && drag.moved ? `translate(${drag.dx}px, ${drag.dy}px)` : undefined,
            opacity: drag?.value === node.value && drag.moved ? .75 : 1,
            pointerEvents: drag?.value === node.value && drag.moved ? "none" : undefined,
          }}
          onPointerDown={event => {
            suppressClick.current = false;
            if (!onSwapNodes || interactionDisabled || event.button !== 0) return;
            dragRef.current = { value: node.value, startX: event.clientX, startY: event.clientY, dx: 0, dy: 0, moved: false };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={event => {
            const currentDrag = dragRef.current;
            if (!currentDrag || !onSwapNodes) return;
            const moved = currentDrag.moved || Math.hypot(event.clientX - currentDrag.startX, event.clientY - currentDrag.startY) > 6;
            if (!moved) return;
            const matrix = event.currentTarget.ownerSVGElement?.getScreenCTM();
            if (!matrix) return;
            const point = new DOMPoint(event.clientX - currentDrag.startX, event.clientY - currentDrag.startY).matrixTransform(matrix.inverse());
            const origin = new DOMPoint(0, 0).matrixTransform(matrix.inverse());
            const target = document.elementsFromPoint(event.clientX, event.clientY)
              .map(element => element.closest<SVGGElement>("[data-cat-value]"))
              .find(element => element && Number(element.dataset.catValue) !== currentDrag.value);
            const updated = { ...currentDrag, moved, dx: point.x - origin.x, dy: point.y - origin.y, over: target ? Number(target.dataset.catValue) : undefined };
            dragRef.current = updated;
            setDrag(updated);
          }}
          onPointerUp={event => {
            const currentDrag = dragRef.current;
            dragRef.current = undefined;
            setDrag(undefined);
            if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
            if (currentDrag?.moved) {
              suppressClick.current = true;
              if (currentDrag.over !== undefined) onSwapNodes?.(currentDrag.value, currentDrag.over);
            }
          }}
          onPointerCancel={() => { dragRef.current = undefined; setDrag(undefined); }}
          onClick={() => select(node.value)}
          onKeyDown={event => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              suppressClick.current = false;
              select(node.value);
            }
          }}
        >
          <rect x={x - 60} y={y - 143} width="120" height="146" fill="transparent" />
          <image className="tree-cat-outline" aria-hidden="true" pointerEvents="none" filter={`url(#${patternId}-selected)`} href={catFront.src} x={x - 56} y={y - 140} width="112" height="142" preserveAspectRatio="xMidYMax meet" />
          <image className="tree-cat-sprite" href={catFront.src} x={x - 56} y={y - 140} width="112" height="142" preserveAspectRatio="xMidYMax meet" />
          {/* The gold loop visibly connects the number tag to the scarf. */}
          <circle className="tree-cat-pendant" cx={x - 2} cy={y - 45} r="14" fill="#fff8e9" stroke="#2f4a3b" strokeWidth="1.7" />
          <rect x={x - 4.5} y={y - 65} width="5" height="10" rx="2.5" fill="#e9b52b" stroke="#6b4618" strokeWidth="1.2" />
          <text
            x={x - 2} y={y - 44}
            textAnchor="middle" dominantBaseline="central"
            fontSize={String(node.value).length <= 2 ? 16 : String(node.value).length === 3 ? 13 : 10}
            fontWeight="800" fill="#263d31"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >{node.value}</text>
          {errorValues.includes(node.value) && <circle cx={x + 43} cy={y - 122} r="7" fill="#b84d32" stroke="#fff8e9" strokeWidth="2" />}
          {nodeBadges?.[node.value] && <g pointerEvents="none">
            <rect x={x - 60} y={y + 22} width="120" height="24" rx="8" fill="#faf6ec" stroke="#a7b6a1" />
            <text x={x} y={y + 38} textAnchor="middle" fontSize="13" fontWeight="700" fill="#263d31">{nodeBadges[node.value]}</text>
          </g>}
        </g>
      ))}
    </svg>
    {nodePopover && <NodePopover key={nodePopover.value} svgRef={svgRef} value={nodePopover.value}>{nodePopover.content}</NodePopover>}
    </>
  );
}
