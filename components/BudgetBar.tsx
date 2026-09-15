import { currency } from "@/lib/format";

export function BudgetBar({ spent, budget, compact = false }: { spent: number; budget: number | null; compact?: boolean }) {
  const hasBudget = budget != null && budget > 0;
  const pct = hasBudget ? Math.min(100, Math.round((spent / (budget as number)) * 100)) : 0;
  const over = hasBudget && spent > (budget as number);
  const color = over ? "#f87171" : pct > 85 ? "#fb923c" : "var(--color-accent)";

  return (
    <div className="w-full">
      <div className={`flex items-center justify-between ${compact ? "text-xs" : "text-sm"} text-[var(--color-muted)]`}>
        <span>{currency(spent)} spent</span>
        <span>{hasBudget ? `of ${currency(budget)}` : "no budget set"}</span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-black/[0.06]">
        <div className="h-full rounded-full transition-all" style={{ width: `${hasBudget ? pct : 0}%`, background: color }} />
      </div>
      {over && <div className="mt-1 text-xs font-medium text-red-400">Over budget</div>}
    </div>
  );
}
