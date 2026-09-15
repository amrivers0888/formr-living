import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ProjectWithTotals } from "@/lib/data";
import { statusColor, currency } from "@/lib/format";
import { Pill } from "./StatusPill";

export function FeaturedProject({ project }: { project: ProjectWithTotals }) {
  return (
    <Link href={`/projects/${project.id}`} className="group relative block overflow-hidden rounded-[var(--radius-xl2)] border border-[var(--color-border)]">
      <div className="relative h-[26rem] w-full sm:h-[30rem]">
        {project.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={project.cover_image} alt="" className="h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-105" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[var(--color-accent-soft)] to-[var(--color-bg-soft)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/5" />
      </div>

      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
        <div className="max-w-2xl">
          <div className="mb-3 flex items-center gap-3">
            <span className="eyebrow text-white/80">Featured project</span>
            {project.room && <span className="text-white/50">·</span>}
            {project.room && <span className="eyebrow text-white/70">{project.room}</span>}
          </div>
          <h2 className="font-display text-3xl leading-tight text-white sm:text-5xl">{project.name}</h2>
          {project.next_action && (
            <p className="mt-3 max-w-xl text-sm text-white/85 sm:text-base">
              <span className="text-[var(--color-accent)]">Next:</span> {project.next_action}
            </p>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[var(--color-ink)] transition-transform group-hover:translate-x-0.5">
              Open project <ArrowRight className="h-4 w-4" />
            </span>
            <Pill label={project.status} color={statusColor(project.status)} />
            {project.estimated_budget != null && (
              <span className="text-sm text-white/70">{currency(project.spent)} of {currency(project.estimated_budget)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
