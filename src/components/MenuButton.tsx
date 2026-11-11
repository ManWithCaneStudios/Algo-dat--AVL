import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type MenuButtonProps = {
  href: string;
  label: string;
  icon: LucideIcon;
  primary?: boolean;
};

export default function MenuButton({
  href,
  label,
  icon: Icon,
  primary = false,
}: MenuButtonProps) {
  return (
    <Link
      href={href}
      className={[
        "relative flex w-(--btn-w) h-(--btn-h) items-center justify-center rounded-(--btn-radius)",
        "text-(length:--btn-text) font-semibold tracking-wide select-none",
        "transition-[background-color,border-color,transform,box-shadow] duration-150",
        "active:scale-[0.985] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-forest",
        primary
          ? "bg-forest text-cream-light shadow-[0_6px_18px_-8px_rgba(47,74,59,0.6)] hover:bg-forest-dark"
          : "border-[3px] border-line bg-cream-light text-ink hover:border-[#d2c6a9] hover:bg-white",
      ].join(" ")}
    >
      <Icon
        aria-hidden="true"
        strokeWidth={1.75}
        className="absolute left-(--btn-icon-x) top-1/2 size-(--btn-icon) -translate-y-1/2"
      />
      <span className="pl-[calc(var(--btn-icon)*0.6)]">{label}</span>
    </Link>
  );
}
