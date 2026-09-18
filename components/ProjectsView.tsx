"use client";

import { useMemo, useState } from "react";
import type { ProjectWithTotals } from "@/lib/data";
import { PROJECT_STATUSES, statusColor } from "@/lib/format";
import { ProjectCard } from "./ProjectCard";

export function ProjectsView({ projects, excludeId }: { projects: ProjectWithTotals[]; excludeId?: string }) {
  const [filter, setFilter] = useState<string>("All");

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of projects) map[p.status] = (map[p.status] ?? 0) + 1;
    return map;
  }, [projects]);

  const shown = (filter === "All" ? projects : projects.filter((p) => p.status === filter)).filter((p) => p.id !== excludeId);

  return (
    <div className="space-y-8">
      {/* Filter chips */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        <Chip label={`All (${projects.length})`} active={filter === "All"} onClick={() => setFilter("All")} color="var(--color-ink)" />
        {PROJECT_STATUSES.filter((s) => counts[s]).map((s) => (
          <Chip key={s} label={`${s} (${counts[s]})`} active={filter === s} onClick={() => setFilter(s)} color={statusColor(s)} />
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="py-20 text-center text-sm text-[var(--color-muted)]">Nothing in this view yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p, i) => (
            <ProjectCard key={p.id} project={p} spent={p.spent} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({ label, active, onClick, color }: { label: string; active: boolean; onClick: () => void; color: string }) {
  return (
    <button
      onClick={onClick}
      className="whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-[0.1em] transition-colors"
      style={
        active
          ? { color: "#EEEEED", background: color, border: `1px solid ${color}` }
          : { color: "var(--color-muted)", background: "transparent", border: "1px solid var(--color-border-strong)" }
      }
    >
      {label}
    </button>
  );
}
