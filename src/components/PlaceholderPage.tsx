import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type PlaceholderPageProps = {
  title: string;
  text: string;
};

export default function PlaceholderPage({ title, text }: PlaceholderPageProps) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-cream px-6 text-center text-ink">
      <h1 className="text-5xl font-extrabold tracking-tight">{title}</h1>
      <p className="max-w-md text-lg text-ink/80">{text}</p>
      <Link
        href="/"
        className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-forest px-6 py-3 font-semibold text-cream-light transition-colors hover:bg-forest-dark focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-forest"
      >
        <ArrowLeft aria-hidden="true" className="size-5" />
        Zurück zum Start
      </Link>
    </main>
  );
}
