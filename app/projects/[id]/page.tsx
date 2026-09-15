import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Ruler, ListChecks, ShoppingCart, Scissors, Hammer, Lightbulb, CircleCheck, Images, AlertTriangle } from "lucide-react";
import { getProjectDetail, hasSupabase } from "@/lib/data";
import { estMaterialCost, actualSpend } from "@/lib/types";
import { Header } from "@/components/Header";
import { ChatDock } from "@/components/ChatDock";
import { SectionCard, Empty } from "@/components/SectionCard";
import { Gallery } from "@/components/Gallery";
import { Pill } from "@/components/StatusPill";
import { BudgetBar } from "@/components/BudgetBar";
import {
  statusColor, orderStatusColor, measurementColor, cutColor, stepColor, currency, dims,
} from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: PageProps<"/projects/[id]">) {
  const { id } = await params;
  const detail = await getProjectDetail(id);
  if (!detail) notFound();

  const { project, materials, measurements, decisions, steps, cuts, files } = detail;
  const spent = actualSpend(materials);
  const est = estMaterialCost(materials);
  const decisionsList = decisions.filter((d) => d.kind === "decision");
  const questions = decisions.filter((d) => d.kind === "question");
  const overview = [
    ["What I'm building", project.what],
    ["Why", project.why],
    ["Design goal", project.design_goal],
    ["Aesthetic & materials", project.aesthetic],
    ["Constraints", project.constraints],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <>
      <Header live={hasSupabase()} />

      {/* Hero */}
      <div className="relative h-64 w-full overflow-hidden sm:h-80">
        {project.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={project.cover_image} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[var(--color-accent-soft)] to-[var(--color-panel)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)]/40 to-transparent" />
        <div className="absolute inset-x-0 top-0 mx-auto flex max-w-6xl px-5 py-4">
          <Link href="/" className="flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-sm text-white backdrop-blur hover:bg-black/60">
            <ArrowLeft className="h-4 w-4" /> All projects
          </Link>
        </div>
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-5 pb-5">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Pill label={project.status} color={statusColor(project.status)} />
            {project.priority && <span className="text-xs text-white/70">{project.priority} priority</span>}
            {project.current_phase && <span className="text-xs text-white/70">· {project.current_phase}</span>}
          </div>
          <h1 className="text-2xl font-semibold text-white drop-shadow sm:text-4xl">{project.name}</h1>
          {project.room && <p className="mt-1 text-white/70">{project.room}</p>}
        </div>
      </div>

      <main className="mx-auto max-w-6xl space-y-6 px-5 py-8">
        {/* Next action + snapshot */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="glass rounded-[var(--radius-xl2)] p-5 lg:col-span-2">
            <div className="text-xs uppercase tracking-wide text-[var(--color-accent)]">Next action</div>
            <p className="mt-2 text-lg">{project.next_action || "No next action set."}</p>
          </div>
          <div className="glass rounded-[var(--radius-xl2)] p-5">
            <BudgetBar spent={spent} budget={project.estimated_budget} />
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <SnapItem label="Est. materials" value={currency(est)} />
              <SnapItem label="Remaining" value={project.estimated_budget != null ? currency(project.estimated_budget - spent) : "—"} />
              <SnapItem label="Progress" value={`${project.percent_complete ?? 0}%`} />
              <SnapItem label="Phase" value={project.current_phase || "—"} />
            </div>
          </div>
        </div>

        {/* Overview */}
        {overview.length > 0 && (
          <SectionCard title="Overview" icon={<Lightbulb className="h-4 w-4" />}>
            <dl className="grid gap-4 sm:grid-cols-2">
              {overview.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">{k}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-[var(--color-text)]/90">{v}</dd>
                </div>
              ))}
            </dl>
          </SectionCard>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Final decisions */}
          <SectionCard title="Final Design Decisions" icon={<CircleCheck className="h-4 w-4" />}>
            {decisionsList.length === 0 ? (
              <Empty>No locked decisions yet.</Empty>
            ) : (
              <ul className="space-y-3">
                {decisionsList.map((d) => (
                  <li key={d.id} className="rounded-xl border border-[var(--color-border)] p-3">
                    <div className="font-medium">{d.topic}</div>
                    {d.final_decision && <div className="mt-0.5 text-sm text-emerald-300/90">{d.final_decision}</div>}
                    {d.reason && <div className="mt-1 text-xs text-[var(--color-muted)]">Why: {d.reason}</div>}
                    {d.original_idea && <div className="mt-1 text-xs text-[var(--color-muted)] line-through opacity-70">Was: {d.original_idea}</div>}
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          {/* Open questions */}
          <SectionCard title="Open Questions" icon={<ListChecks className="h-4 w-4" />}>
            {questions.length === 0 ? (
              <Empty>Nothing open — everything's decided.</Empty>
            ) : (
              <ul className="space-y-3">
                {questions.map((q) => (
                  <li key={q.id} className="rounded-xl border border-[var(--color-border)] p-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium">{q.topic}</span>
                      {q.impact && <span className="shrink-0 text-xs text-[var(--color-muted)]">{q.impact}</span>}
                    </div>
                    {q.options && <div className="mt-1 text-xs text-[var(--color-muted)]">{q.options}</div>}
                    {q.recommendation && <div className="mt-1 text-xs text-[var(--color-accent)]">{q.recommendation}</div>}
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>

        {/* Measurements */}
        <SectionCard
          title="Measurements"
          icon={<Ruler className="h-4 w-4" />}
          accent={<span className="text-xs text-[var(--color-muted)]">Only FINAL + verified is cut-ready</span>}
        >
          {measurements.length === 0 ? (
            <Empty>No measurements recorded.</Empty>
          ) : (
            <Table head={["Location", "W × H × D", "Units", "Status", "Verified", "Notes"]}>
              {measurements.map((m) => (
                <tr key={m.id} className="border-t border-[var(--color-border)]">
                  <Td className="font-medium">{m.location}</Td>
                  <Td>{dims([m.width, m.height, m.depth])}</Td>
                  <Td>{m.units || "—"}</Td>
                  <Td><Dot color={measurementColor(m.status)} label={m.status || "—"} /></Td>
                  <Td>{m.verified ? "✓" : "—"}</Td>
                  <Td className="max-w-xs text-[var(--color-muted)]">{m.notes || "—"}</Td>
                </tr>
              ))}
            </Table>
          )}
        </SectionCard>

        {/* Materials */}
        <SectionCard
          title="Materials & Shopping List"
          icon={<ShoppingCart className="h-4 w-4" />}
          accent={<span className="text-xs text-[var(--color-muted)]">Est {currency(est)} · Spent {currency(spent)}</span>}
        >
          {materials.length === 0 ? (
            <Empty>No materials added yet.</Empty>
          ) : (
            <Table head={["Item", "Retailer", "Qty", "Est.", "Actual", "Status"]}>
              {materials.map((m) => (
                <tr key={m.id} className="border-t border-[var(--color-border)]">
                  <Td className="font-medium">
                    {m.product_url ? (
                      <a href={m.product_url} target="_blank" rel="noreferrer" className="text-[var(--color-text)] underline decoration-[var(--color-accent)]/50 underline-offset-2 hover:text-[var(--color-accent)]">
                        {m.item}
                      </a>
                    ) : m.item}
                    {m.category && <span className="ml-2 text-xs text-[var(--color-muted)]">{m.category}</span>}
                  </Td>
                  <Td>{m.retailer || "—"}</Td>
                  <Td>{m.qty_needed ?? "—"} {m.unit || ""}</Td>
                  <Td>{currency((m.qty_needed ?? 0) * (m.est_unit_price ?? 0))}</Td>
                  <Td>{m.actual_unit_price != null ? currency((m.qty_ordered ?? 0) * m.actual_unit_price) : "—"}</Td>
                  <Td><Dot color={orderStatusColor(m.order_status)} label={m.order_status || "—"} /></Td>
                </tr>
              ))}
            </Table>
          )}
        </SectionCard>

        {/* Cut list */}
        <SectionCard
          title="Cut List"
          icon={<Scissors className="h-4 w-4" />}
          accent={cuts.some((c) => !c.final) ? (
            <span className="flex items-center gap-1 text-xs font-medium text-red-400">
              <AlertTriangle className="h-3.5 w-3.5" /> Parts marked NOT FINAL are not cut-ready
            </span>
          ) : undefined}
        >
          {cuts.length === 0 ? (
            <Empty>No cut list yet.</Empty>
          ) : (
            <Table head={["#", "Component", "Material", "L × W × D", "Qty", "Status"]}>
              {cuts.map((c) => (
                <tr key={c.id} className="border-t border-[var(--color-border)]">
                  <Td className="text-[var(--color-muted)]">{c.part_no || "—"}</Td>
                  <Td className="font-medium">{c.component}</Td>
                  <Td>{c.material || "—"}</Td>
                  <Td>{dims([c.length, c.width, c.depth])}</Td>
                  <Td>{c.quantity ?? "—"}</Td>
                  <Td><Dot color={cutColor(c.cut_status)} label={c.cut_status || "—"} /></Td>
                </tr>
              ))}
            </Table>
          )}
        </SectionCard>

        {/* Build plan */}
        <SectionCard title="Build Plan" icon={<Hammer className="h-4 w-4" />}>
          {steps.length === 0 ? (
            <Empty>No build steps yet.</Empty>
          ) : (
            <ol className="space-y-3">
              {steps.map((s) => (
                <li key={s.id} className="flex gap-3 rounded-xl border border-[var(--color-border)] p-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/5 text-sm font-semibold text-[var(--color-muted)]">
                    {s.step_no ?? "•"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{s.task}</span>
                      {s.phase && <span className="text-xs text-[var(--color-muted)]">{s.phase}</span>}
                      <Dot color={stepColor(s.status)} label={s.status || "—"} />
                    </div>
                    {s.instructions && <p className="mt-1 text-sm text-[var(--color-text)]/85">{s.instructions}</p>}
                    {s.dependencies && <p className="mt-1 text-xs text-[var(--color-muted)]">Depends on: {s.dependencies}</p>}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </SectionCard>

        {/* Gallery */}
        <SectionCard title="Files, Plans & Inspiration" icon={<Images className="h-4 w-4" />}>
          <Gallery files={files} />
        </SectionCard>
      </main>

      <ChatDock live={hasSupabase()} projectId={project.id} projectName={project.name} />
    </>
  );
}

function SnapItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-[var(--color-muted)]">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            {head.map((h) => <th key={h} className="pb-2 pr-4 font-medium">{h}</th>)}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`py-2.5 pr-4 align-top ${className}`}>{children}</td>;
}

function Dot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs" style={{ color }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
