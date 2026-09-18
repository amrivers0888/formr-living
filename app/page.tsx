import { getProjectsWithTotals, hasSupabase } from "@/lib/data";
import { Header } from "@/components/Header";
import { ProjectsView } from "@/components/ProjectsView";
import { HeroMasthead } from "@/components/HeroMasthead";
import { FeaturedProject } from "@/components/FeaturedProject";
import { AreasView } from "@/components/AreasView";
import { groupProjectsByArea } from "@/lib/areas";

export const dynamic = "force-dynamic";

export default async function Home() {
  const projects = await getProjectsWithTotals();
  const nav = projects.map((p) => ({ id: p.id, name: p.name })).sort((a, b) => a.name.localeCompare(b.name));
  const live = hasSupabase();
  const featured =
    projects.find((p) => p.priority === "High" && p.status !== "Completed" && p.cover_image) ??
    projects.find((p) => p.cover_image) ??
    projects[0];

  const totalSpent = projects.reduce((s, p) => s + p.spent, 0);
  const totalBudget = projects.reduce((s, p) => s + (p.estimated_budget ?? 0), 0);
  const active = projects.filter((p) => p.status !== "Completed").length;

  return (
    <>
      <div className="bg-[var(--color-ink)]">
        <Header live={live} projects={nav} onInk />
        <HeroMasthead
          featured={featured}
          totalProjects={projects.length}
          activeProjects={active}
          totalSpent={totalSpent}
          totalBudget={totalBudget}
        />
      </div>

      <main className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-24">
        {featured && (
          <section className="mb-20 sm:mb-28">
            <SectionHead num="01" title="Featured Project" caption="High priority. Currently underway." />
            <div className="mt-6">
              <FeaturedProject project={featured} />
            </div>
          </section>
        )}

        <section className="mb-20 sm:mb-28">
          <SectionHead
            num={featured ? "02" : "01"}
            title="By Area"
            caption={`${groupProjectsByArea(projects).length} areas`}
          />
          <div className="mt-6">
            <AreasView projects={projects} />
          </div>
        </section>

        <section>
          <SectionHead
            num={featured ? "03" : "02"}
            title="All Projects"
            caption={`${projects.length} on the ledger`}
          />
          <div className="mt-6">
            <ProjectsView projects={projects} excludeId={featured?.id} />
          </div>
        </section>
      </main>

      <footer className="bg-[var(--color-ink)] text-[#EEEEED]">
        <div className="mx-auto max-w-7xl overflow-hidden px-6 py-14 sm:px-8 sm:py-20">
          <p className="eyebrow-on-ink">A record kept</p>
          <div className="mt-6 font-display-huge text-[18vw] leading-[0.9] sm:text-[11rem] lg:text-[14rem]">
            <div>Formr</div>
            <div>Living</div>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[#EEEEED]/12 pt-6 text-xs uppercase tracking-[0.22em] text-[var(--color-muted-cool)]">
            <span>© 2026 · Allison &amp; her hands</span>
            <span>Made with sawdust and sweat</span>
          </div>
        </div>
      </footer>
    </>
  );
}

function SectionHead({ num, title, caption }: { num: string; title: string; caption: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-t border-[var(--color-border)] pt-6">
      <div className="flex items-baseline gap-4 sm:gap-8">
        <span className="eyebrow-num tabular-nums">{num}.</span>
        <h2 className="font-display text-3xl tracking-tight sm:text-4xl">{title}</h2>
      </div>
      <span className="text-xs uppercase tracking-[0.22em] text-[var(--color-muted)]">{caption}</span>
    </div>
  );
}
