"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { currency } from "@/lib/format";

export interface ExpenseRow {
  id: string;
  project_id: string;
  project_name: string;
  item: string;
  category: string | null;
  retailer: string | null;
  qty: number;
  unit_price: number;
  total: number;
  order_date: string | null;
  status: string | null;
  notes: string | null;
}

type SortKey = "date" | "project" | "item" | "retailer" | "qty" | "unit_price" | "total" | "status";
type SortDir = "asc" | "desc";

export function ExpensesTable({ rows }: { rows: ExpenseRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [projectFilter, setProjectFilter] = useState<string>("");
  const [includeReturns, setIncludeReturns] = useState<boolean>(true);

  const projects = useMemo(() => {
    const s = new Set(rows.map((r) => r.project_name));
    return Array.from(s).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (projectFilter && r.project_name !== projectFilter) return false;
      if (!includeReturns && (r.status === "RETURNED" || r.status === "RETURNING")) return false;
      return true;
    });
  }, [rows, projectFilter, includeReturns]);

  const sorted = useMemo(() => {
    const cmp = (a: ExpenseRow, b: ExpenseRow) => {
      const dir = sortDir === "asc" ? 1 : -1;
      const av = valueFor(a, sortKey);
      const bv = valueFor(b, sortKey);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    };
    return [...filtered].sort(cmp);
  }, [filtered, sortKey, sortDir]);

  const totals = useMemo(() => {
    let received = 0, returned = 0;
    for (const r of filtered) {
      if (r.status === "RETURNED" || r.status === "RETURNING") returned += r.total;
      else received += r.total;
    }
    return { received, returned, net: received - returned };
  }, [filtered]);

  function setSort(k: SortKey) {
    if (k === sortKey) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir(k === "date" ? "desc" : "asc"); }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
          <span className="text-[0.7rem] uppercase tracking-[0.18em] text-[var(--color-muted)]">Project</span>
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-3 py-1.5 text-sm text-[var(--color-text)]"
          >
            <option value="">All projects</option>
            {projects.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
          <input
            type="checkbox"
            checked={includeReturns}
            onChange={(e) => setIncludeReturns(e.target.checked)}
            className="accent-[var(--color-terra)]"
          />
          <span>Include returns</span>
        </label>
        <div className="ml-auto flex items-center gap-4 text-sm">
          <Totals label="Spent" value={totals.received} />
          <Totals label="Returned" value={totals.returned} muted />
          <Totals label="Net" value={totals.net} strong />
        </div>
      </div>

      <div className="overflow-x-auto border border-[var(--color-border)] bg-[var(--color-panel)]">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-[0.7rem] uppercase tracking-[0.18em] text-[var(--color-muted)]">
              <Th onClick={() => setSort("date")}     active={sortKey === "date"}     dir={sortDir}>Date</Th>
              <Th onClick={() => setSort("project")}  active={sortKey === "project"}  dir={sortDir}>Project</Th>
              <Th onClick={() => setSort("item")}     active={sortKey === "item"}     dir={sortDir}>Item</Th>
              <Th onClick={() => setSort("retailer")} active={sortKey === "retailer"} dir={sortDir}>Retailer</Th>
              <Th onClick={() => setSort("qty")}      active={sortKey === "qty"}      dir={sortDir} align="right">Qty</Th>
              <Th onClick={() => setSort("unit_price")} active={sortKey === "unit_price"} dir={sortDir} align="right">Unit</Th>
              <Th onClick={() => setSort("total")}    active={sortKey === "total"}    dir={sortDir} align="right">Total</Th>
              <Th onClick={() => setSort("status")}   active={sortKey === "status"}   dir={sortDir}>Status</Th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr><td colSpan={8} className="py-8 text-center text-[var(--color-muted)]">No expenses match this filter.</td></tr>
            ) : sorted.map((r) => (
              <tr key={r.id} className={`border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-alt)] ${r.status === "RETURNED" ? "opacity-55" : ""}`}>
                <td className="py-3 pl-5 pr-3 text-[var(--color-muted)] tabular-nums">{fmtDate(r.order_date)}</td>
                <td className="py-3 pr-3">
                  <Link href={`/projects/${r.project_id}`} className="text-[var(--color-ink)] hover:text-[var(--color-terra-deep)]">
                    {r.project_name}
                  </Link>
                </td>
                <td className="py-3 pr-3 font-medium">
                  {r.item}
                  {r.category && <span className="ml-2 text-xs text-[var(--color-muted)]">{r.category}</span>}
                </td>
                <td className="py-3 pr-3 text-[var(--color-muted)]">{r.retailer || "—"}</td>
                <td className="py-3 pr-3 text-right tabular-nums">{r.qty}</td>
                <td className="py-3 pr-3 text-right tabular-nums">{currency(r.unit_price)}</td>
                <td className={`py-3 pr-3 text-right tabular-nums ${r.status === "RETURNED" ? "line-through" : "font-medium"}`}>{currency(r.total)}</td>
                <td className="py-3 pr-5 text-[0.65rem] uppercase tracking-[0.14em]">
                  <span style={{ color: r.status === "RETURNED" ? "#9B5234" : "#5e8f63" }}>
                    {r.status || "—"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function valueFor(r: ExpenseRow, k: SortKey): string | number | null {
  switch (k) {
    case "date": return r.order_date;
    case "project": return r.project_name.toLowerCase();
    case "item": return r.item.toLowerCase();
    case "retailer": return (r.retailer || "").toLowerCase();
    case "qty": return r.qty;
    case "unit_price": return r.unit_price;
    case "total": return r.total;
    case "status": return (r.status || "").toLowerCase();
  }
}

function fmtDate(d: string | null): string {
  if (!d) return "—";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function Th({ children, onClick, active, dir, align = "left" }: {
  children: React.ReactNode; onClick: () => void; active: boolean; dir: SortDir; align?: "left" | "right";
}) {
  const Icon = !active ? ArrowUpDown : dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <th className={`px-3 py-2.5 font-medium ${align === "right" ? "text-right" : ""}`}>
      <button onClick={onClick} className={`inline-flex items-center gap-1 hover:text-[var(--color-text)] ${active ? "text-[var(--color-text)]" : ""}`}>
        {children} <Icon className="h-3 w-3" />
      </button>
    </th>
  );
}

function Totals({ label, value, muted, strong }: { label: string; value: number; muted?: boolean; strong?: boolean }) {
  return (
    <div className={`flex items-baseline gap-1.5 ${muted ? "text-[var(--color-muted)]" : "text-[var(--color-text)]"}`}>
      <span className="text-[0.6rem] uppercase tracking-[0.22em] text-[var(--color-terra-deep)]">{label}</span>
      <span className={strong ? "font-display text-xl text-[var(--color-ink)]" : "font-medium tabular-nums"}>{currency(value)}</span>
    </div>
  );
}
