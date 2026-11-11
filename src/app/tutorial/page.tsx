import LevelScreen from "@/components/level/LevelScreen";

export default function TutorialPage() {
  return (
    <LevelScreen
      level={1}
      title="Titel"
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
