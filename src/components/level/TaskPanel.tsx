"use client";

import { useId, useState } from "react";
import { CircleArrowUp } from "lucide-react";

type TaskPanelProps = {
  title?: string;
  children?: React.ReactNode;
  className?: string;
};

/**
 * Aufgaben-Panel des Levelscreens. Über den Pfeil im Kopf lässt sich der
 * Inhalt ein- und ausklappen.
 */
export default function TaskPanel({
  title = "Aufgabe",
  children,
  className = "",
}: TaskPanelProps) {
  const [open, setOpen] = useState(true);
  const bodyId = useId();

  return (
    <aside
      aria-label={title}
      // eingeklappt nur so hoch wie der Kopf, auch wenn von außen eine feste Höhe gesetzt ist
      style={open ? undefined : { height: "auto" }}
      className={`flex flex-col rounded-(--lvl-radius) bg-sage-light shadow-[0_8px_24px_-14px_rgba(20,20,20,0.35)] ${className}`}
    >
      <header className="flex h-(--lvl-panel-head) shrink-0 items-center gap-[calc(var(--lvl-icon)*0.9)] px-[calc(var(--lvl-icon)*1)]">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={bodyId}
          aria-label={open ? "Aufgabe einklappen" : "Aufgabe ausklappen"}
          onClick={() => setOpen((v) => !v)}
          className="rounded-full text-ink transition-transform duration-200 hover:scale-105 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-forest"
        >
          <CircleArrowUp
            aria-hidden="true"
            strokeWidth={2}
            className={`size-(--lvl-icon) transition-transform duration-200 ${open ? "" : "rotate-180"}`}
          />
        </button>
        <h2 className="text-(length:--lvl-panel-text) font-bold">{title}</h2>
      </header>

      <div
        id={bodyId}
        hidden={!open}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-(--lvl-radius) bg-cream-light p-[calc(var(--lvl-icon)*1.4)]"
      >
        {children}
      </div>
    </aside>
  );
}
