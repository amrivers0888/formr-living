import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getProjectsWithTotals, hasSupabase } from "@/lib/data";
import { getAreaBySlug, projectsInArea } from "@/lib/areas";
import { Header } from "@/components/Header";
import { ProjectCard } from "@/components/ProjectCard";
import { currency } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AreaPage({ params }: PageProps<"/areas/[slug]">) {
  const { slug } = await params;
  const area = getAreaBySlug(slug);
  if (!area) notFound();

  const allProjects = await getProjectsWithTotals();
  const nav = allProjects.map((p) => ({ id: p.id, name: p.name })).sort((a, b) => a.name.localeCompare(b.name));
  const projects = projectsInArea(area, allProjects);

  const totalSpent = projects.reduce((s, p) => s + p.spent, 0);
  const totalBudget = projects.reduce((s, p) => s + (p.estimated_budget ?? 0), 0);
  const active = projects.filter((p) => p.status !== "Completed").length;

  return (
    <>
      <Header live={hasSupabase()} projects={nav} />

      <main className="mx-auto max-w-7xl px-6 py-10 sm:px-8 sm:py-14">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.22em] text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
          </Link>
        </div>

        <section>
          <p className="eyebrow-num">AREA</p>
          <h1 className="mt-3 font-display leading-[0.95] tracking-[-0.03em] text-[15vw] sm:text-[7rem] lg:text-[9rem]">
            {area.name}
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-[var(--color-muted)]">
            {area.blurb}
          </p>
        </section>

        <section className="mt-16 grid gap-8 border-t border-[var(--color-border)] pt-10 sm:grid-cols-4">
          <Snap label="Projects" value={String(projects.length)} />
          <Snap label="Active" value={String(active)} />
          <Snap label="Spent" value={currency(totalSpent)} />
          <Snap label="Planned" value={totalBudget > 0 ? currency(totalBudget) : "—"} />
        </section>

        <section className="mt-16">
          <div className="flex items-baseline justify-between gap-6 border-t border-[var(--color-border)] pt-6">
            <div className="flex items-baseline gap-4 sm:gap-8">
              <span className="eyebrow-num tabular-nums">01.</span>
              <h2 className="font-display text-3xl tracking-tight sm:text-4xl">Projects</h2>
            </div>
            <span className="text-xs uppercase tracking-[0.22em] text-[var(--color-muted)]">{projects.length} in this area</span>
          </div>

          {projects.length === 0 ? (
            <p className="mt-16 text-center text-sm text-[var(--color-muted)]">Nothing in this area yet.</p>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p, i) => (
                <ProjectCard key={p.id} project={p} spent={p.spent} index={i} />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

function Snap({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[0.7rem] uppercase tracking-[0.22em] text-[var(--color-terra-deep)]">{label}</div>
      <div className="mt-3 font-display text-4xl tracking-tight text-[var(--color-ink)] sm:text-5xl">{value}</div>
    </div>
  );
}
