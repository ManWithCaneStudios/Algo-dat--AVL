/**
 * Dekorative Szene der Startseite: zwei Kreise im Hintergrund, der
 * Kratzbaum (als SVG gezeichnet) sowie Pflanze und Katze als Bild-Assets.
 *
 * Alle Koordinaten beziehen sich auf die 1920x1080-Blaupause.
 */

type Rect = { x: number; y: number; w: number; h: number };

// Horizontale Plattformen (werden über den Pfosten gezeichnet)
const platforms: Rect[] = [
  { x: 1460, y: 100, w: 345, h: 50 }, // oben, mit Pflanze
  { x: 1272, y: 327, w: 488, h: 65 },
  { x: 1405, y: 507, w: 307, h: 58 },
  { x: 1405, y: 597, w: 355, h: 60 },
  { x: 1030, y: 777, w: 535, h: 70 }, // Plattform der Katze
  { x: 900, y: 937, w: 310, h: 60 },
];

// Vertikale Pfosten (ragen leicht in die Plattformen hinein)
const posts: Rect[] = [
  { x: 1612, y: 140, w: 78, h: 200 },
  { x: 1453, y: 380, w: 74, h: 410 },
  { x: 1622, y: 380, w: 80, h: 720 },
  { x: 1050, y: 830, w: 80, h: 120 },
  { x: 1300, y: 830, w: 95, h: 270 },
  { x: 945, y: 980, w: 90, h: 120 },
  { x: 1095, y: 980, w: 65, h: 120 },
];

function Post({ x, y, w, h, id }: Rect & { id: string }) {
  const stripes: number[] = [];
  for (let sy = y + 16; sy < y + h; sy += 24) stripes.push(sy);

  return (
    <g>
      <clipPath id={id}>
        <rect x={x} y={y} width={w} height={h} />
      </clipPath>
      <rect x={x} y={y} width={w} height={h} className="fill-wood" />
      <g
        clipPath={`url(#${id})`}
        fill="none"
        strokeWidth={3}
        className="stroke-wood-dark"
      >
        {stripes.map((sy) => (
          <path
            key={sy}
            d={`M${x} ${sy} Q${x + w / 2} ${sy + w * 0.4} ${x + w} ${sy}`}
          />
        ))}
      </g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill="none"
        strokeWidth={2.5}
        className="stroke-outline"
      />
    </g>
  );
}

export default function CatTreeScene({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1920 1080"
      preserveAspectRatio="xMaxYMax slice"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {/* Hintergrundkreise */}
      <circle cx={1510} cy={420} r={440} className="fill-sage" />
      <circle cx={1245} cy={1000} r={360} className="fill-sand" />

      {/* Kratzbaum */}
      {posts.map((p, i) => (
        <Post key={i} id={`post-${i}`} {...p} />
      ))}
      {platforms.map((p, i) => (
        <rect
          key={i}
          x={p.x}
          y={p.y}
          width={p.w}
          height={p.h}
          rx={10}
          strokeWidth={2.5}
          className="fill-wood stroke-outline"
        />
      ))}

      {/* Hängepflanze auf der obersten Plattform (Asset 372x785) */}
      <image href="/assets/plant.png" x={1517} y={12} width={242} height={510} />

      {/* Katze auf der großen Plattform (Asset 482x808) */}
      <image href="/assets/cat.png" x={1188} y={430} width={214} height={360} />
    </svg>
  );
}
