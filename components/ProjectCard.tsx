import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/types";
import { statusColor, currency } from "@/lib/format";
import { Pill } from "./StatusPill";

export function ProjectCard({
  project,
  spent,
  index,
}: {
  project: Project;
  spent: number;
  index?: number;
}) {
  const budget = project.estimated_budget;
  const pct = budget && budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;

  return (
    <Link href={`/projects/${project.id}`} className="group block">
      <article className="card card-hover">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--color-bg-alt)]">
          {project.cover_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.cover_image}
              alt=""
              className="h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.04]"
            />
          ) : (
            <div className="relative flex h-full w-full items-center justify-center bg-[var(--color-bg-alt)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/formr-house.png"
                alt=""
                className="h-[62%] w-auto opacity-40 transition-opacity duration-500 group-hover:opacity-60"
              />
            </div>
          )}
          <div className="absolute right-3 top-3">
            <Pill label={project.status} color={statusColor(project.status)} />
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-baseline justify-between">
            {index != null ? (
              <span className="eyebrow-num tabular-nums">{String(index + 1).padStart(2, "0")}.</span>
            ) : (
              <span className="eyebrow-num">·</span>
            )}
            <ArrowUpRight className="h-4 w-4 text-[var(--color-muted)] transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--color-terra)]" />
          </div>

          {project.room && (
            <p className="mt-4 text-[0.7rem] uppercase tracking-[0.22em] text-[var(--color-terra-deep)]">
              {project.room}
            </p>
          )}
          <h3 className="mt-2 font-display text-[1.65rem] leading-[1.1] tracking-tight text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-terra-deep)]">
            {project.name}
          </h3>
          <p className="mt-3 line-clamp-2 min-h-[2.75rem] text-sm leading-relaxed text-[var(--color-muted)]">
            {project.next_action || "No next action set"}
          </p>

          <div className="mt-6 border-t border-[var(--color-border)] pt-4">
            <div className="flex items-baseline justify-between text-xs text-[var(--color-muted)]">
              <span>
                {budget && budget > 0
                  ? <><span className="text-[var(--color-ink)]">{currency(spent)}</span> of {currency(budget)}</>
                  : <><span className="text-[var(--color-ink)]">{currency(spent)}</span> spent</>}
              </span>
              {budget && budget > 0 && (
                <span className="tabular-nums text-[var(--color-ink)]">{pct}%</span>
              )}
            </div>
            <div className="mt-3 h-px w-full bg-[var(--color-border)]">
              <div
                className="h-px"
                style={{
                  width: `${pct}%`,
                  background: pct > 100 ? "#b5473c" : "var(--color-terra)",
                }}
              />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
