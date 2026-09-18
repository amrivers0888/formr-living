"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";

type NavProject = { id: string; name: string };

export function Header({
  live,
  projects = [],
  onInk = false,
}: {
  live: boolean;
  projects?: NavProject[];
  /** When rendered on top of an ink/dark hero, use inverted colors. */
  onInk?: boolean;
}) {
  const pathname = usePathname() || "/";
  const [projectsOpen, setProjectsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setProjectsOpen(false); }, [pathname]);
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setProjectsOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const isHome = pathname === "/";
  const isExpenses = pathname === "/expenses";
  const isBrainstorm = pathname === "/brainstorm";
  const isProjectRoute = pathname.startsWith("/projects/");

  const inkText = onInk ? "text-[#EEEEED]" : "text-[var(--color-ink)]";
  const inkMuted = onInk ? "text-[var(--color-muted-cool)]" : "text-[var(--color-muted)]";
  const bg = onInk ? "" : "bg-[var(--color-bg)]/85 backdrop-blur-xl border-b border-[var(--color-border)]";

  return (
    <header className={`sticky top-0 z-30 ${bg}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5 sm:px-8">
        <Link href="/" className={`group flex items-center gap-3 ${inkText}`}>
          <Image
            src="/brand/formr-house-black.png"
            alt="Formr"
            width={260}
            height={220}
            priority
            className="h-9 w-auto select-none sm:h-10"
          />
          <span className={`hidden text-[0.62rem] uppercase tracking-[0.28em] sm:inline ${inkMuted}`}>
            Home Renovation Studio
          </span>
          <span
            className="ml-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
            style={{
              color: live ? (onInk ? "#c8dcc4" : "#446a44") : (onInk ? "#e6c890" : "#7a5a25"),
              background: live
                ? (onInk ? "rgba(120,160,120,0.18)" : "rgba(94,143,99,0.12)")
                : (onInk ? "rgba(180,140,60,0.2)" : "rgba(196,142,46,0.12)"),
              border: `1px solid ${live ? (onInk ? "rgba(120,160,120,0.4)" : "rgba(94,143,99,0.35)") : (onInk ? "rgba(180,140,60,0.45)" : "rgba(196,142,46,0.35)")}`,
            }}
            title={live ? "Connected to your database" : "Preview mode"}
          >
            {live ? "live" : "preview"}
          </span>
        </Link>

        <nav className={`hidden items-center gap-8 md:flex ${inkText}`}>
          <NavLink href="/" active={isHome} onInk={onInk}>Dashboard</NavLink>

          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setProjectsOpen((v) => !v)}
              className={`group flex items-center gap-1.5 text-sm font-medium transition-opacity ${
                isProjectRoute ? "opacity-100" : "opacity-75 hover:opacity-100"
              }`}
              aria-expanded={projectsOpen}
              aria-haspopup="menu"
            >
              <span className="relative">
                Projects
                {isProjectRoute && <span className={`absolute -bottom-1.5 left-0 h-px w-full ${onInk ? "bg-[var(--color-tan)]" : "bg-[var(--color-terra)]"}`} />}
              </span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${projectsOpen ? "rotate-180" : ""}`} />
            </button>
            {projectsOpen && (
              <div
                role="menu"
                className="absolute right-0 z-50 mt-4 min-w-[300px] overflow-hidden border border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-text)] shadow-[0_28px_60px_-24px_rgba(7,6,5,0.35)]"
              >
                <div className="border-b border-[var(--color-border)] bg-[var(--color-bg-alt)] px-4 py-2.5">
                  <span className="text-[0.65rem] uppercase tracking-[0.22em] text-[var(--color-terra-deep)]">All projects</span>
                </div>
                <div className="max-h-[52vh] overflow-y-auto py-1">
                  {projects.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-[var(--color-muted)]">No projects yet.</p>
                  ) : projects.map((p, i) => (
                    <Link
                      key={p.id}
                      href={`/projects/${p.id}`}
                      className={`flex items-baseline justify-between gap-3 px-4 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg-alt)] ${
                        pathname === `/projects/${p.id}` ? "bg-[var(--color-bg-alt)]" : ""
                      }`}
                    >
                      <span className="truncate">{p.name}</span>
                      <span className="shrink-0 text-[0.65rem] tabular-nums text-[var(--color-muted)]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </Link>
                  ))}
                </div>
                <div className="border-t border-[var(--color-border)]">
                  <Link
                    href="/brainstorm"
                    className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-[var(--color-terra-deep)] hover:bg-[var(--color-terra-soft)]"
                  >
                    <Sparkles className="h-4 w-4" /> Brainstorm a new project
                  </Link>
                </div>
              </div>
            )}
          </div>

          <NavLink href="/expenses" active={isExpenses} onInk={onInk}>Expenses</NavLink>
          <NavLink href="/brainstorm" active={isBrainstorm} onInk={onInk}>Brainstorm</NavLink>
        </nav>

        <Link
          href="/brainstorm"
          className={`hidden rounded-full px-5 py-2.5 text-sm font-medium transition-colors md:inline-flex md:items-center md:gap-1.5 ${
            onInk
              ? "bg-[#EEEEED] text-[var(--color-ink)] hover:bg-white"
              : "bg-[var(--color-ink)] text-[#EEEEED] hover:bg-[var(--color-terra-deep)]"
          }`}
        >
          Let's Build <span aria-hidden>↗</span>
        </Link>

        {/* Mobile */}
        <div className={`flex items-center gap-4 md:hidden ${inkText}`}>
          <Link href="/expenses" className="text-sm opacity-80">Ledger</Link>
          <Link
            href="/brainstorm"
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              onInk ? "bg-[#EEEEED] text-[var(--color-ink)]" : "bg-[var(--color-ink)] text-[#EEEEED]"
            }`}
          >
            Build ↗
          </Link>
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href, active, children, onInk,
}: {
  href: string; active: boolean; children: React.ReactNode; onInk: boolean;
}) {
  const underline = onInk ? "bg-[var(--color-tan)]" : "bg-[var(--color-terra)]";
  return (
    <Link
      href={href}
      className={`relative text-sm font-medium transition-opacity ${active ? "opacity-100" : "opacity-75 hover:opacity-100"}`}
    >
      {children}
      {active && <span className={`absolute -bottom-1.5 left-0 h-px w-full ${underline}`} />}
    </Link>
  );
}
