# AVL Tutorial

Interaktives Tutorial zu AVL-Bäumen. Gebaut mit **Next.js (App Router) + React + Tailwind CSS v4**.

## Entwicklung

```bash
npm install
npm run dev
```

Danach läuft die App unter <http://localhost:3000>.

Weitere Skripte:

```bash
npm run build   # Produktions-Build
npm run start   # Produktions-Server
npm run lint    # ESLint
```

## Struktur

- `src/app/page.tsx` – Startseite (Menü mit Starten / Kapitel / Einstellungen / Beenden)
- `src/app/{tutorial,kapitel,einstellungen,beenden}/page.tsx` – Platzhalterseiten für die Menüpunkte
- `src/components/MenuButton.tsx` – Menü-Button der Startseite
- `src/components/CatTreeScene.tsx` – Illustration (Kratzbaum als SVG, Katze und Pflanze als Bilder)
- `src/components/level/` – Levelscreen (`LevelScreen`), Aufgaben-Panel (`TaskPanel`), Einführungsdialog der Tutorialkatze (`TutorialDialog`), Hintergrund
- `src/app/globals.css` – Tailwind-Theme (Farben, Schrift) und Skalierungsvariablen der Startseite
- `public/assets/` – zugeschnittene Bild-Assets (Katze, Pflanze, Kratzbaumteile)
- `design/blueprint-start.png` – Blaupause der Startseite
- `avl-prototype/` – älterer, eigenständiger HTML-Prototyp (Drag & Drop)
