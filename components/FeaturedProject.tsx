import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ProjectWithTotals } from "@/lib/data";
import { statusColor, currency } from "@/lib/format";
import { Pill } from "./StatusPill";

/** Editorial split: photograph on the left, project meta card on the right. */
export function FeaturedProject({ project }: { project: ProjectWithTotals }) {
  return (
    <Link href={`/projects/${project.id}`} className="group block">
      <article className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <div className="flex aspect-[3/4] w-full items-center justify-center overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-6 sm:p-8">
            {project.cover_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={project.cover_image}
                alt=""
                className="max-h-full max-w-full object-contain transition-transform duration-[1100ms] group-hover:scale-[1.02]"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/brand/formr-house.png" alt="" className="h-[60%] w-auto opacity-45" />
            )}
          </div>
        </div>

        <aside className="flex flex-col justify-between border border-[var(--color-border)] bg-[var(--color-panel)] p-8 sm:p-10 lg:col-span-7">
          <div>
            <div className="flex items-baseline justify-between">
              <span className="eyebrow-num">FT.</span>
              <ArrowUpRight className="h-4 w-4 text-[var(--color-muted)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--color-terra)]" />
            </div>
            {project.room && <p className="mt-6 text-xs uppercase tracking-[0.24em] text-[var(--color-terra-deep)]">{project.room}</p>}
            <h3 className="mt-3 font-display text-[2.25rem] leading-[1.05] tracking-tight text-[var(--color-ink)]">
              {project.name}
            </h3>
            {project.next_action && (
              <p className="mt-6 text-sm leading-relaxed text-[var(--color-muted)]">
                <span className="text-[var(--color-terra-deep)]">Next —</span> {project.next_action}
              </p>
            )}
          </div>

          <div className="mt-10 space-y-4">
            <Pill label={project.status} color={statusColor(project.status)} />
            {project.estimated_budget != null && (
              <div className="border-t border-[var(--color-border)] pt-4 text-sm text-[var(--color-muted)]">
                <span className="text-[var(--color-ink)]">{currency(project.spent)}</span> spent
                <span className="mx-1.5">of</span>
                <span className="text-[var(--color-ink)]">{currency(project.estimated_budget)}</span>
              </div>
            )}
          </div>
        </aside>
      </article>
    </Link>
  );
}
