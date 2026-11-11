import LevelScreen from "@/components/level/LevelScreen";

/** Einführung der Tutorialkatze für Level 1 – ein Eintrag pro Tatze */
const tutorialSteps = [
  "Hallo! Schön, dass du da bist. In diesem Level lernst du, was einen AVL-Baum ausmacht. Ich begleite dich Schritt für Schritt.",
  "Ein AVL-Baum ist ein binärer Suchbaum: Links von einem Knoten stehen nur kleinere Werte, rechts nur größere. Das Besondere: Er hält sich selbst im Gleichgewicht.",
  "Für jeden Knoten darf sich die Höhe des linken und des rechten Teilbaums um höchstens 1 unterscheiden. Diesen Unterschied nennt man Balancefaktor.",
  "Deine Aufgabe findest du links im Panel. Mit „Bestätigen“ prüfst du deine Lösung, „Rückgängig“ nimmt den letzten Schritt zurück. Über das Fragezeichen kannst du mich jederzeit zurückholen. Viel Erfolg!",
];

export default function TutorialPage() {
  return (
    <LevelScreen
      level={1}
      title="Titel"
      tutorialSteps={tutorialSteps}
      task={
        // Platzhalter laut Blaupause – hier kommt später die Aufgabenstellung hin
        <div className="flex flex-1 flex-col justify-center gap-[calc(var(--lvl-icon)*0.6)]">
          <div
            aria-hidden="true"
            className="h-[max(64px,calc(128*var(--u)))] rounded-(--lvl-radius) bg-blush"
          />
          <hr className="mx-[calc(var(--lvl-icon)*0.4)] border-0 border-t-2 border-sage-light" />
        </div>
      }
    />
  );
}
