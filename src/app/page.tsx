import { BookOpen, LogOut, Play, Settings } from "lucide-react";
import CatTreeScene from "@/components/CatTreeScene";
import MenuButton from "@/components/MenuButton";

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col bg-cream text-ink lg:h-dvh lg:overflow-hidden">
      {/* Menü */}
      <section className="relative z-10 flex flex-col justify-center px-6 pt-14 pb-10 lg:flex-1 lg:px-0 lg:pl-(--menu-x) lg:py-0">
        <h1 className="text-(length:--menu-title) leading-none font-extrabold tracking-tight">
          Tutorial
        </h1>
        <p className="mt-[calc(var(--menu-title)*0.28)] text-(length:--menu-sub) leading-tight text-ink/85">
          AVL-Bäume Schritt für Schritt verstehen
        </p>

        <nav
          aria-label="Hauptmenü"
          className="mt-[calc(var(--menu-title)*0.5)] flex flex-col gap-(--btn-gap)"
        >
          <MenuButton href="/tutorial" label="Starten" icon={Play} primary />
          <MenuButton href="/kapitel" label="Kapitel" icon={BookOpen} />
          <MenuButton href="/einstellungen" label="Einstellungen" icon={Settings} />
          <MenuButton href="/beenden" label="Beenden" icon={LogOut} />
        </nav>
      </section>

      {/* Illustration: auf Desktop als Vollbild-Hintergrund, mobil darunter */}
      <div className="relative h-[42vh] w-full lg:absolute lg:inset-0 lg:h-auto">
        <CatTreeScene className="block h-full w-full" />
      </div>
    </main>
  );
}
