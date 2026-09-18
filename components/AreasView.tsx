import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ProjectWithTotals } from "@/lib/data";
import { groupProjectsByArea } from "@/lib/areas";
import { currency } from "@/lib/format";

export function AreasView({ projects }: { projects: ProjectWithTotals[] }) {
  const groups = groupProjectsByArea(projects);

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {groups.map(({ area, projects: areaProjects }, index) => {
        const spent = areaProjects.reduce((s, p) => s + p.spent, 0);
        const budget = areaProjects.reduce((s, p) => s + (p.estimated_budget ?? 0), 0);
        const active = areaProjects.filter((p) => p.status !== "Completed").length;
        return (
          <Link key={area.slug} href={`/areas/${area.slug}`} className="group block">
            <article className="card card-hover flex h-full flex-col p-6 sm:p-7">
              <div className="flex items-baseline justify-between">
                <span className="eyebrow-num tabular-nums">{String(index + 1).padStart(2, "0")}.</span>
                <ArrowUpRight className="h-4 w-4 text-[var(--color-muted)] transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--color-terra-deep)]" />
              </div>
              <h3 className="mt-4 font-display text-[2rem] leading-[1.05] tracking-tight text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-terra-deep)]">
                {area.name}
              </h3>
              <p className="mt-3 line-clamp-2 min-h-[2.75rem] text-sm leading-relaxed text-[var(--color-muted)]">
                {area.blurb}
              </p>

              <div className="mt-6 flex flex-wrap gap-x-4 gap-y-1 text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
                <span><span className="tabular-nums text-[var(--color-ink)]">{areaProjects.length}</span> {areaProjects.length === 1 ? "project" : "projects"}</span>
                <span>·</span>
                <span><span className="tabular-nums text-[var(--color-ink)]">{active}</span> active</span>
              </div>

              <div className="mt-4 border-t border-[var(--color-border)] pt-3">
                <div className="flex items-baseline justify-between text-sm text-[var(--color-muted)]">
                  <span>
                    <span className="tabular-nums text-[var(--color-ink)]">{currency(spent)}</span> spent
                  </span>
                  {budget > 0 && (
                    <span>of {currency(budget)}</span>
                  )}
                </div>
              </div>
            </article>
          </Link>
        );
      })}
    </div>
  );
}
