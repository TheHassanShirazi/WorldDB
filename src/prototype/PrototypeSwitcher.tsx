"use client";

/**
 * PROTOTYPE — variant switcher.
 *
 * Deliberately ugly and obviously not part of any design being evaluated.
 * Gated out of production builds so a stray merge can't ship it.
 */

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

interface Props {
  variants: readonly string[];
  current: string;
  name?: string;
}

export function PrototypeSwitcher({ variants, current, name }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const go = (delta: number) => {
    const i = variants.indexOf(current);
    const next = variants[(i + delta + variants.length) % variants.length];
    router.replace(`${pathname}?variant=${next}`, { scroll: false });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      const typing =
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        (el instanceof HTMLElement && el.isContentEditable);
      if (typing) return;
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (process.env.NODE_ENV === "production") return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-black/10 bg-white px-1.5 py-1.5 text-neutral-900 shadow-[0_6px_24px_rgba(0,0,0,0.35)]">
      <button
        onClick={() => go(-1)}
        aria-label="Previous variant"
        className="rounded-full px-2.5 py-1 text-sm transition hover:bg-neutral-200"
      >
        ←
      </button>
      <span className="px-2 text-xs font-medium tabular-nums">
        {current}
        {name ? <span className="font-normal text-neutral-500"> — {name}</span> : null}
      </span>
      <button
        onClick={() => go(1)}
        aria-label="Next variant"
        className="rounded-full px-2.5 py-1 text-sm transition hover:bg-neutral-200"
      >
        →
      </button>
    </div>
  );
}
