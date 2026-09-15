import { getProjectsWithTotals, hasSupabase } from "@/lib/data";
import { Header } from "@/components/Header";
import { ProjectsView } from "@/components/ProjectsView";
import { FeaturedProject } from "@/components/FeaturedProject";
import { ChatDock } from "@/components/ChatDock";

export const dynamic = "force-dynamic";

export default async function Home() {
  const projects = await getProjectsWithTotals();
  const live = hasSupabase();
  const featured =
    projects.find((p) => p.priority === "High" && p.status !== "Completed" && p.cover_image) ??
    projects.find((p) => p.cover_image) ??
    projects[0];

  return (
    <>
      <Header live={live} />
      <main className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
        <div className="mb-8 sm:mb-10">
          <p className="eyebrow">The DIY Home Edit</p>
          <h1 className="mt-2 font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl">Home Renovation</h1>
          <p className="mt-3 max-w-xl text-[var(--color-muted)]">
            A considered record of every project underway — plans, materials, budgets, and the details that make it feel custom.
          </p>
        </div>

        {featured && (
          <div className="mb-12">
            <FeaturedProject project={featured} />
          </div>
        )}

        <div className="mb-5 flex items-baseline justify-between">
          <p className="eyebrow">All Projects</p>
        </div>
        <ProjectsView projects={projects} excludeId={featured?.id} />
      </main>
      <ChatDock live={live} />
    </>
  );
}
