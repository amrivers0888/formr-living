import { getProjectsWithTotals, hasSupabase } from "@/lib/data";
import { Header } from "@/components/Header";
import { ProjectsView } from "@/components/ProjectsView";
import { ChatDock } from "@/components/ChatDock";

export const dynamic = "force-dynamic";

export default async function Home() {
  const projects = await getProjectsWithTotals();
  const live = hasSupabase();

  return (
    <>
      <Header live={live} />
      <main className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Home Renovation Hub</h1>
          <p className="mt-1 text-[var(--color-muted)]">
            Every project, plan, measurement, and dollar — in one place. Tap a project to open its binder, or ask the assistant to start a new one.
          </p>
        </div>
        <ProjectsView projects={projects} />
      </main>
      <ChatDock live={live} />
    </>
  );
}
