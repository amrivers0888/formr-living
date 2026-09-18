import { getServerClient, hasSupabase } from "@/lib/supabase";
import { SAMPLE_DETAILS } from "@/lib/sampleData";
import { Header } from "@/components/Header";
import { ExpensesTable, type ExpenseRow } from "@/components/ExpensesTable";
import { currency } from "@/lib/format";

export const dynamic = "force-dynamic";

async function loadRowsAndNav(): Promise<{ rows: ExpenseRow[]; nav: { id: string; name: string }[] }> {
  const db = getServerClient();
  if (!db) {
    const rows = SAMPLE_DETAILS.flatMap((d) => d.materials.map((m) => toRow(m, d.project.name)));
    const nav = SAMPLE_DETAILS.map((d) => ({ id: d.project.id, name: d.project.name })).sort((a, b) => a.name.localeCompare(b.name));
    return { rows, nav };
  }
  const [projects, materials] = await Promise.all([
    db.from("projects").select("id, name"),
    db.from("materials").select("*"),
  ]);
  if (projects.error) throw new Error(projects.error.message);
  if (materials.error) throw new Error(materials.error.message);
  const nameById = new Map<string, string>((projects.data ?? []).map((p) => [p.id, p.name]));
  const rows = (materials.data ?? []).map((m) => toRow(m, nameById.get(m.project_id) ?? "—"));
  const nav = (projects.data ?? [])
    .map((p) => ({ id: p.id as string, name: p.name as string }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return { rows, nav };
}

function toRow(m: Record<string, unknown>, projectName: string): ExpenseRow {
  const qty = Number(m.qty_ordered ?? m.qty_needed ?? 0) || 0;
  const unit = Number(m.actual_unit_price ?? m.est_unit_price ?? 0) || 0;
  return {
    id: String(m.id),
    project_id: String(m.project_id),
    project_name: projectName,
    item: String(m.item ?? ""),
    category: (m.category as string) ?? null,
    retailer: (m.retailer as string) ?? null,
    qty,
    unit_price: unit,
    total: qty * unit,
    order_date: (m.order_date as string) ?? null,
    status: (m.order_status as string) ?? null,
    notes: (m.notes as string) ?? null,
  };
}

export default async function ExpensesPage() {
  const { rows, nav } = await loadRowsAndNav();

  const byProject = new Map<string, { name: string; id: string; spent: number; returned: number }>();
  for (const r of rows) {
    const b = byProject.get(r.project_id) ?? { name: r.project_name, id: r.project_id, spent: 0, returned: 0 };
    if (r.status === "RETURNED" || r.status === "RETURNING") b.returned += r.total;
    else b.spent += r.total;
    byProject.set(r.project_id, b);
  }
  const buckets = Array.from(byProject.values()).sort((a, b) => (b.spent - b.returned) - (a.spent - a.returned));
  const grandSpent = buckets.reduce((s, b) => s + b.spent, 0);
  const grandReturned = buckets.reduce((s, b) => s + b.returned, 0);
  const grandNet = grandSpent - grandReturned;

  return (
    <>
      <Header live={hasSupabase()} projects={nav} />

      <main className="mx-auto max-w-7xl px-6 py-12 sm:px-8 sm:py-16">
        <section>
          <p className="eyebrow-num">01.</p>
          <h1 className="mt-3 font-display text-6xl leading-[1.02] tracking-tight sm:text-7xl">The Ledger</h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--color-muted)]">
            Every purchase across every project — a running record so nothing gets misplaced between the
            receipt and the reveal.
          </p>
        </section>

        <section className="mt-16 grid gap-8 border-t border-[var(--color-border)] pt-10 sm:grid-cols-3">
          <Snap label="Total spent" value={grandSpent} />
          <Snap label="Returned" value={grandReturned} muted />
          <Snap label="Net" value={grandNet} strong />
        </section>

        <section className="mt-20">
          <SectionHead num="02" title="By Project" caption={`${buckets.length} tracked`} />
          <div className="mt-6 border-t border-[var(--color-border)] bg-[var(--color-panel)]">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-[0.7rem] uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  <th className="px-5 py-3 font-medium">Project</th>
                  <th className="px-5 py-3 text-right font-medium">Spent</th>
                  <th className="px-5 py-3 text-right font-medium">Returned</th>
                  <th className="px-5 py-3 text-right font-medium">Net</th>
                </tr>
              </thead>
              <tbody>
                {buckets.length === 0 ? (
                  <tr><td colSpan={4} className="py-10 text-center text-[var(--color-muted)]">No expenses yet.</td></tr>
                ) : buckets.map((b) => (
                  <tr key={b.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-alt)]">
                    <td className="px-5 py-3.5 font-medium">
                      <a href={`/projects/${b.id}`} className="hover:text-[var(--color-terra-deep)]">{b.name}</a>
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums">{currency(b.spent)}</td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-[var(--color-muted)]">{b.returned ? currency(b.returned) : "—"}</td>
                    <td className="px-5 py-3.5 text-right font-semibold tabular-nums">{currency(b.spent - b.returned)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-20">
          <SectionHead num="03" title="All Line Items" caption={`${rows.length} entries`} />
          <div className="mt-6">
            <ExpensesTable rows={rows} />
          </div>
        </section>
      </main>
    </>
  );
}

function Snap({ label, value, muted, strong }: { label: string; value: number; muted?: boolean; strong?: boolean }) {
  return (
    <div>
      <div className="text-[0.7rem] uppercase tracking-[0.22em] text-[var(--color-terra-deep)]">{label}</div>
      <div
        className={`mt-3 font-display tracking-tight ${
          strong ? "text-5xl text-[var(--color-ink)]" : muted ? "text-3xl text-[var(--color-muted)]" : "text-3xl text-[var(--color-ink)]"
        }`}
      >
        {currency(value)}
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
