/**
 * Dekorative Hintergrundflächen des Levelscreens (Koordinaten der
 * 1920x1080-Blaupause). Füllt den gesamten Bereich hinter dem Inhalt.
 */
export default function LevelBackground({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1920 1080"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <rect width={1920} height={1080} className="fill-cream" />
      {/* links unten */}
      <circle cx={150} cy={1150} r={520} className="fill-sage-light" />
      {/* rechts oben + rechts unten */}
      <circle cx={1850} cy={450} r={350} className="fill-sage-light" />
      <circle cx={1800} cy={1150} r={560} className="fill-sage-light" />
    </svg>
  );
}
