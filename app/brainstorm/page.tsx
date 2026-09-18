import { getProjectsWithTotals, hasSupabase } from "@/lib/data";
import { Header } from "@/components/Header";
import { ChatConversation } from "@/components/ChatConversation";

export const dynamic = "force-dynamic";

export default async function BrainstormPage() {
  const projects = await getProjectsWithTotals();
  const nav = projects.map((p) => ({ id: p.id, name: p.name }));

  return (
    <>
      <Header live={hasSupabase()} projects={nav} />

      <main className="mx-auto flex w-full max-w-5xl flex-col px-6 py-12 sm:px-8 sm:py-16" style={{ minHeight: "calc(100vh - 84px)" }}>
        <section className="mb-10">
          <p className="eyebrow-num">01.</p>
          <h1 className="mt-3 font-display text-6xl leading-[1.02] tracking-tight sm:text-7xl">Brainstorm</h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--color-muted)]">
            Describe what you&apos;re dreaming up in your own words. I&apos;ll shape it into a project — materials,
            measurements, decisions, and a build plan.
          </p>
        </section>

        <div className="flex flex-1 flex-col overflow-hidden border border-[var(--color-border)] bg-[var(--color-panel)]">
          <ChatConversation
            greeting="Tell me about the project. Room, vibe, what you want it to do, any constraints or dimensions you already know."
            variant="full"
            suggestions={[
              "A floor-to-ceiling walnut pantry with two drawers and a hidden toaster",
              "A screened-in porch bar with a walnut counter and open shelving",
              "A basement built-in bookshelf around a fireplace",
              "A primary-bath vanity with double sinks in warm oak",
            ]}
          />
        </div>
      </main>
    </>
  );
}
