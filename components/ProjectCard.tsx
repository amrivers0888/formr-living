import Link from "next/link";
import type { Project } from "@/lib/types";
import { statusColor, currency } from "@/lib/format";
import { Pill } from "./StatusPill";

export function ProjectCard({ project, spent }: { project: Project; spent: number }) {
  const budget = project.estimated_budget;
  const pct = budget && budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;

  return (
    <Link href={`/projects/${project.id}`} className="group block">
      <article className="glass glass-hover overflow-hidden rounded-[var(--radius-xl2)]">
        <div className="relative h-56 w-full overflow-hidden">
          {project.cover_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={project.cover_image} alt="" className="h-full w-full object-cover transition-transform duration-[800ms] group-hover:scale-105" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[var(--color-accent-soft)] to-[var(--color-bg-soft)]" />
          )}
          <div className="absolute left-3 top-3">
            <Pill label={project.status} color={statusColor(project.status)} />
          </div>
        </div>

        <div className="p-5">
          {project.room && <p className="eyebrow">{project.room}</p>}
          <h3 className="mt-1.5 font-display text-xl leading-snug tracking-tight transition-colors group-hover:text-[var(--color-accent-strong)]">
            {project.name}
          </h3>
          <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm text-[var(--color-muted)]">
            {project.next_action || "No next action set"}
          </p>

          <div className="mt-4 border-t border-[var(--color-border)] pt-3">
            <div className="flex items-center justify-between text-xs text-[var(--color-muted)]">
              <span>{budget && budget > 0 ? `${currency(spent)} of ${currency(budget)}` : `${currency(spent)} spent`}</span>
              {budget && budget > 0 && <span>{pct}%</span>}
            </div>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-black/[0.06]">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct > 100 ? "#b5473c" : "var(--color-accent)" }} />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
