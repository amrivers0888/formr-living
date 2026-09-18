import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Ruler, ListChecks, ShoppingCart, Scissors, Hammer, Lightbulb, CircleCheck, Images, AlertTriangle } from "lucide-react";
import { getProjectDetail, getProjectSummaries, hasSupabase } from "@/lib/data";
import { estMaterialCost, actualSpend } from "@/lib/types";
import type { Material } from "@/lib/types";
import { Header } from "@/components/Header";
import { HeroImage } from "@/components/HeroImage";
import { ChatDock } from "@/components/ChatDock";
import { SectionCard, Empty } from "@/components/SectionCard";
import { Gallery } from "@/components/Gallery";
import { Pill } from "@/components/StatusPill";
import { EditableBudget } from "@/components/EditableBudget";
import { EditableText } from "@/components/EditableText";
import {
  statusColor, orderStatusColor, measurementColor, cutColor, stepColor, currency, dims,
} from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: PageProps<"/projects/[id]">) {
  const { id } = await params;
  const [detail, nav] = await Promise.all([getProjectDetail(id), getProjectSummaries()]);
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
      <Header live={hasSupabase()} projects={nav} />

      <main className="mx-auto max-w-7xl px-6 py-10 sm:px-8 sm:py-14">
        {/* Editorial masthead */}
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.22em] text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All projects
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            {project.room && (
              <p className="text-[0.7rem] uppercase tracking-[0.24em] text-[var(--color-terra-deep)]">
                {project.room}
              </p>
            )}
            <h1 className="mt-4 font-display leading-[0.95] tracking-[-0.03em] text-[13vw] sm:text-[6.5rem] lg:text-[8rem]">
              {project.name}
            </h1>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Pill label={project.status} color={statusColor(project.status)} />
              {project.priority && (
                <span className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  {project.priority} priority
                </span>
              )}
              {project.current_phase && (
                <span className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  · {project.current_phase}
                </span>
              )}
            </div>
          </div>

          <aside className="lg:col-span-5">
            <div className="border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-3">
              <HeroImage cover={project.cover_image} projectId={project.id} />
            </div>
          </aside>
        </div>

        {/* Snapshot */}
        <section className="mt-16">
          <SectionHead num="01" title="Snapshot" caption={project.current_phase || "—"} />
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="border border-[var(--color-border)] bg-[var(--color-panel)] p-6 lg:col-span-2">
              <EditableText
                projectId={project.id}
                field="what"
                value={project.what}
                label="Description"
                placeholder="One sentence — what this project is."
                as="display"
              />
              {project.next_action && (
                <div className="mt-6 border-t border-[var(--color-border)] pt-4">
                  <p className="text-[0.65rem] uppercase tracking-[0.18em] text-[var(--color-muted)]">Next up</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text)]">{project.next_action}</p>
                </div>
              )}
            </div>
            <div className="border border-[var(--color-border)] bg-[var(--color-panel)] p-6">
              <EditableBudget projectId={project.id} spent={spent} budget={project.estimated_budget} />
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <SnapItem label="Est. materials" value={currency(est)} />
                <SnapItem label="Remaining" value={project.estimated_budget != null ? currency(project.estimated_budget - spent) : "—"} />
                <SnapItem label="Progress" value={`${project.percent_complete ?? 0}%`} />
                <SnapItem label="Phase" value={project.current_phase || "—"} />
              </div>
            </div>
          </div>
        </section>

        {overview.length > 0 && (
          <section className="mt-16">
            <SectionHead num="02" title="Overview" caption={`${overview.length} fields`} />
            <div className="mt-6 border border-[var(--color-border)] bg-[var(--color-panel)] p-8">
              <dl className="grid gap-8 sm:grid-cols-2">
                {overview.map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[0.7rem] uppercase tracking-[0.2em] text-[var(--color-terra-deep)]">{k}</dt>
                    <dd className="mt-2 text-sm leading-relaxed text-[var(--color-text)]">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        )}

        <section className="mt-16">
          <SectionHead num="03" title="Decisions & Questions" caption={`${decisionsList.length} locked · ${questions.length} open`} />
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <SectionCard title="Final decisions" icon={<CircleCheck className="h-4 w-4" />}>
              {decisionsList.length === 0 ? (
                <Empty>No locked decisions yet.</Empty>
              ) : (
                <ul className="space-y-3">
                  {decisionsList.map((d) => (
                    <li key={d.id} className="border-t border-[var(--color-border)] pt-3 first:border-0 first:pt-0">
                      <div className="font-medium">{d.topic}</div>
                      {d.final_decision && <div className="mt-1 text-sm text-[var(--color-status-done)]">{d.final_decision}</div>}
                      {d.reason && <div className="mt-1 text-xs text-[var(--color-muted)]">Why: {d.reason}</div>}
                      {d.original_idea && <div className="mt-1 text-xs text-[var(--color-muted)] line-through opacity-70">Was: {d.original_idea}</div>}
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>

            <SectionCard title="Open questions" icon={<ListChecks className="h-4 w-4" />}>
              {questions.length === 0 ? (
                <Empty>Nothing open — everything's decided.</Empty>
              ) : (
                <ul className="space-y-3">
                  {questions.map((q) => (
                    <li key={q.id} className="border-t border-[var(--color-border)] pt-3 first:border-0 first:pt-0">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-medium">{q.topic}</span>
                        {q.impact && <span className="shrink-0 text-xs text-[var(--color-muted)]">{q.impact}</span>}
                      </div>
                      {q.options && <div className="mt-1 text-xs text-[var(--color-muted)]">{q.options}</div>}
                      {q.recommendation && <div className="mt-1 text-xs text-[var(--color-terra-deep)]">{q.recommendation}</div>}
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          </div>
        </section>

        <section className="mt-16">
          <SectionHead num="04" title="Measurements" caption="Only FINAL + verified is cut-ready" />
          <div className="mt-6 border border-[var(--color-border)] bg-[var(--color-panel)]">
            {measurements.length === 0 ? (
              <div className="p-8"><Empty>No measurements recorded.</Empty></div>
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
          </div>
        </section>

        <section className="mt-16">
          <SectionHead
            num="05"
            title="Materials"
            caption={`Est ${currency(est)} · Spent ${currency(spent)}`}
          />

          <MaterialList
            heading="Scope material"
            caption="Planned + being researched"
            items={materials.filter(isScope)}
            variant="scope"
          />

          <MaterialList
            heading="Final material"
            caption="Ordered, received, or returned"
            items={materials.filter((m) => !isScope(m))}
            variant="final"
          />
        </section>

        <section className="mt-16">
          <SectionHead
            num="06"
            title="Cut List"
            caption={cuts.some((c) => !c.final) ? "Some parts still NOT FINAL" : `${cuts.length} parts`}
          />
          <div className="mt-6 border border-[var(--color-border)] bg-[var(--color-panel)]">
            {cuts.length === 0 ? (
              <div className="p-8"><Empty>No cut list yet.</Empty></div>
            ) : (
              <Table head={["#", "Component", "Material", "L × W × D", "Qty", "Status"]}>
                {cuts.map((c) => (
                  <tr key={c.id} className="border-t border-[var(--color-border)]">
                    <Td className="tabular-nums text-[var(--color-muted)]">{c.part_no || "—"}</Td>
                    <Td className="font-medium">{c.component}</Td>
                    <Td>{c.material || "—"}</Td>
                    <Td>{dims([c.length, c.width, c.depth])}</Td>
                    <Td className="tabular-nums">{c.quantity ?? "—"}</Td>
                    <Td><Dot color={cutColor(c.cut_status)} label={c.cut_status || "—"} /></Td>
                  </tr>
                ))}
              </Table>
            )}
          </div>
        </section>

        <section className="mt-16">
          <SectionHead num="07" title="Build Plan" caption={`${steps.length} steps`} />
          <div className="mt-6 border border-[var(--color-border)] bg-[var(--color-panel)] p-6 sm:p-8">
            {steps.length === 0 ? (
              <Empty>No build steps yet.</Empty>
            ) : (
              <ol className="space-y-4">
                {steps.map((s) => (
                  <li key={s.id} className="flex gap-4 border-t border-[var(--color-border)] pt-4 first:border-0 first:pt-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-[var(--color-border-strong)] text-sm font-medium tabular-nums text-[var(--color-terra-deep)]">
                      {s.step_no ?? "•"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{s.task}</span>
                        {s.phase && <span className="text-xs uppercase tracking-[0.14em] text-[var(--color-muted)]">{s.phase}</span>}
                        <Dot color={stepColor(s.status)} label={s.status || "—"} />
                      </div>
                      {s.instructions && <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text)]/85">{s.instructions}</p>}
                      {s.dependencies && <p className="mt-1 text-xs text-[var(--color-muted)]">Depends on: {s.dependencies}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>

        <section className="mt-16">
          <SectionHead num="08" title="Files, Plans & Inspiration" caption={`${files.length} items`} />
          <div className="mt-6">
            <Gallery files={files} />
          </div>
        </section>
      </main>

      <ChatDock live={hasSupabase()} projectId={project.id} projectName={project.name} />
    </>
  );
}

const SCOPE_STATUSES = new Set(["RESEARCHING", "NEED TO BUY", "READY TO ORDER"]);
function isScope(m: Material): boolean {
  return SCOPE_STATUSES.has(m.order_status ?? "RESEARCHING");
}

function MaterialList({
  heading, caption, items, variant,
}: {
  heading: string; caption: string; items: Material[]; variant: "scope" | "final";
}) {
  return (
    <div className="mt-8">
      <div className="mb-3 flex items-baseline justify-between border-b border-[var(--color-border)] pb-2">
        <div className="flex items-baseline gap-3">
          <span className="text-[0.65rem] uppercase tracking-[0.22em] text-[var(--color-terra-deep)]">{heading}</span>
          <span className="text-[0.65rem] uppercase tracking-[0.18em] text-[var(--color-muted)]">{caption}</span>
        </div>
        <span className="text-[0.65rem] uppercase tracking-[0.18em] text-[var(--color-muted)]">{items.length} items</span>
      </div>
      <div className="border border-[var(--color-border)] bg-[var(--color-panel)]">
        {items.length === 0 ? (
          <div className="p-8"><Empty>Nothing here yet.</Empty></div>
        ) : (
          <Table head={variant === "scope"
            ? ["Item", "Retailer", "Qty", "Est.", "Status"]
            : ["Item", "Retailer", "Qty", "Actual", "Status"]}>
            {items.map((m) => (
              <tr key={m.id} className="border-t border-[var(--color-border)]">
                <Td className="font-medium">
                  {m.product_url ? (
                    <a href={m.product_url} target="_blank" rel="noreferrer" className="text-[var(--color-text)] underline decoration-[var(--color-accent)]/50 underline-offset-2 hover:text-[var(--color-terra-deep)]">
                      {m.item}
                    </a>
                  ) : m.item}
                  {m.category && <span className="ml-2 text-xs text-[var(--color-muted)]">{m.category}</span>}
                </Td>
                <Td className="text-[var(--color-muted)]">{m.retailer || "—"}</Td>
                <Td className="tabular-nums">{m.qty_ordered ?? m.qty_needed ?? "—"} {m.unit || ""}</Td>
                {variant === "scope" ? (
                  <Td className="tabular-nums">{currency((m.qty_needed ?? 0) * (m.est_unit_price ?? 0))}</Td>
                ) : (
                  <Td className="tabular-nums">{m.actual_unit_price != null ? currency((m.qty_ordered ?? 0) * m.actual_unit_price) : "—"}</Td>
                )}
                <Td><Dot color={orderStatusColor(m.order_status)} label={m.order_status || "—"} /></Td>
              </tr>
            ))}
          </Table>
        )}
      </div>
    </div>
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

function SnapItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[0.65rem] uppercase tracking-[0.18em] text-[var(--color-muted)]">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="text-[0.7rem] uppercase tracking-[0.18em] text-[var(--color-muted)]">
            {head.map((h) => <th key={h} className="px-5 py-3 font-medium">{h}</th>)}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-5 py-3 align-top ${className}`}>{children}</td>;
}

function Dot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[0.7rem] uppercase tracking-[0.14em]" style={{ color }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
