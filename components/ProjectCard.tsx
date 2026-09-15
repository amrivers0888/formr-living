import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/types";
import { statusColor } from "@/lib/format";
import { Pill } from "./StatusPill";
import { BudgetBar } from "./BudgetBar";

export function ProjectCard({ project, spent }: { project: Project; spent: number }) {
  return (
    <Link href={`/projects/${project.id}`} className="group block">
      <article className="glass glass-hover overflow-hidden rounded-[var(--radius-xl2)]">
        <div className="relative h-40 w-full overflow-hidden">
          {project.cover_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={project.cover_image} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[var(--color-accent-soft)] to-[var(--color-panel)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute left-3 top-3">
            <Pill label={project.status} color={statusColor(project.status)} />
          </div>
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold leading-tight text-white drop-shadow">{project.name}</h3>
              {project.room && <p className="text-xs text-white/70">{project.room}</p>}
            </div>
            <ArrowUpRight className="h-5 w-5 shrink-0 text-white/60 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--color-accent)]" />
          </div>
        </div>

        <div className="space-y-3 p-4">
          <div className="flex items-start gap-2 text-sm">
            <span className="text-[var(--color-accent)]">→</span>
            <p className="line-clamp-2 text-[var(--color-text)]/90">
              {project.next_action || "No next action set"}
            </p>
          </div>
          <BudgetBar spent={spent} budget={project.estimated_budget} compact />
        </div>
      </article>
    </Link>
  );
}
