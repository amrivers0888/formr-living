"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Check, X, Loader2 } from "lucide-react";
import { currency } from "@/lib/format";
import { BudgetBar } from "./BudgetBar";

export function EditableBudget({
  projectId,
  spent,
  budget,
}: {
  projectId: string;
  spent: number;
  budget: number | null;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState<string>(budget != null ? String(budget) : "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function save() {
    const parsed = value.trim() === "" ? null : Number(value.replace(/[^0-9.]/g, ""));
    if (parsed != null && (isNaN(parsed) || parsed < 0)) {
      setError("Enter a whole number, or leave blank.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estimated_budget: parsed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed.");
      setEditing(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  function cancel() {
    setValue(budget != null ? String(budget) : "");
    setEditing(false);
    setError(null);
  }

  if (editing) {
    return (
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="eyebrow-ink">Estimated budget</span>
          <div className="flex items-center gap-1">
            <button
              onClick={save}
              disabled={busy}
              className="flex items-center gap-1 rounded-full bg-[var(--color-ink)] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[#EEEEED] disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Save
            </button>
            <button
              onClick={cancel}
              disabled={busy}
              className="flex items-center gap-1 rounded-full border border-[var(--color-border-strong)] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[var(--color-muted)]"
            >
              <X className="h-3 w-3" /> Cancel
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--color-muted)]">$</span>
          <input
            type="text"
            inputMode="numeric"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel(); }}
            autoFocus
            placeholder="0"
            className="w-full border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-3 py-2 text-lg font-medium text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)]"
          />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <span className="eyebrow-ink">Estimated budget</span>
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-[var(--color-muted)] hover:text-[var(--color-ink)]"
        >
          <Pencil className="h-3 w-3" /> {budget != null ? "Edit" : "Set budget"}
        </button>
      </div>
      {budget != null ? (
        <BudgetBar spent={spent} budget={budget} />
      ) : (
        <div className="text-sm text-[var(--color-muted)]">
          <span className="text-[var(--color-ink)]">{currency(spent)}</span> spent · no budget set
        </div>
      )}
    </div>
  );
}
