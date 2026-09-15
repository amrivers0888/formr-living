"use client";

import { useMemo, useState } from "react";
import type { ProjectWithTotals } from "@/lib/data";
import { PROJECT_STATUSES, currency, statusColor } from "@/lib/format";
import { ProjectCard } from "./ProjectCard";

export function ProjectsView({ projects }: { projects: ProjectWithTotals[] }) {
  const [filter, setFilter] = useState<string>("All");

  const stats = useMemo(() => {
    const active = projects.filter((p) => p.status !== "Completed").length;
    const spent = projects.reduce((s, p) => s + p.spent, 0);
    const budget = projects.reduce((s, p) => s + (p.estimated_budget ?? 0), 0);
    return { total: projects.length, active, spent, budget };
  }, [projects]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of projects) map[p.status] = (map[p.status] ?? 0) + 1;
    return map;
  }, [projects]);

  const shown = filter === "All" ? projects : projects.filter((p) => p.status === filter);

  return (
    <div className="space-y-8">
      {/* Stat strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Projects" value={String(stats.total)} />
        <Stat label="Active" value={String(stats.active)} accent />
        <Stat label="Total spent" value={currency(stats.spent)} />
        <Stat label="Planned budget" value={currency(stats.budget)} />
      </div>

      {/* Filter chips */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        <Chip label={`All (${projects.length})`} active={filter === "All"} onClick={() => setFilter("All")} color="var(--color-accent-strong)" />
        {PROJECT_STATUSES.filter((s) => counts[s]).map((s) => (
          <Chip key={s} label={`${s} (${counts[s]})`} active={filter === s} onClick={() => setFilter(s)} color={statusColor(s)} />
        ))}
      </div>

      {/* Grid */}
      {shown.length === 0 ? (
        <p className="py-16 text-center text-[var(--color-muted)]">No projects in this view yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <ProjectCard key={p.id} project={p} spent={p.spent} />
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="text-xs uppercase tracking-wide text-[var(--color-muted)]">{label}</div>
      <div className={`mt-1 font-display text-2xl font-semibold ${accent ? "text-[var(--color-accent-strong)]" : ""}`}>{value}</div>
    </div>
  );
}

function Chip({ label, active, onClick, color }: { label: string; active: boolean; onClick: () => void; color: string }) {
  return (
    <button
      onClick={onClick}
      className="whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors"
      style={
        active
          ? { color, background: `color-mix(in srgb, ${color} 18%, transparent)`, border: `1px solid color-mix(in srgb, ${color} 45%, transparent)` }
          : { color: "var(--color-muted)", background: "transparent", border: "1px solid var(--color-border)" }
      }
    >
      {label}
    </button>
  );
}
