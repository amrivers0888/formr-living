"use client";

import Link from "next/link";
import { Plus, Hammer } from "lucide-react";

export function Header({ live }: { live: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-bg)]/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent)]/15 text-[var(--color-accent)]">
            <Hammer className="h-4.5 w-4.5" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">
            Formr<span className="text-[var(--color-accent-strong)]"> Living</span>
          </span>
          <span
            className="ml-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
            style={{
              color: live ? "#34d399" : "#fbbf24",
              background: live ? "rgba(52,211,153,.12)" : "rgba(251,191,36,.12)",
            }}
            title={live ? "Connected to your database" : "Preview mode — showing sample data until the database is connected"}
          >
            {live ? "live" : "preview"}
          </span>
        </Link>

        <button
          onClick={() => window.dispatchEvent(new CustomEvent("reno:open-chat"))}
          className="flex items-center gap-1.5 rounded-full bg-[var(--color-accent-strong)] px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
        >
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>
    </header>
  );
}
