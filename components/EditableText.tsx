"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Check, X, Loader2 } from "lucide-react";

/**
 * Inline editable text for a project field. Use for a description, tagline,
 * or next-action — anything that maps to a single column in `projects`.
 */
export function EditableText({
  projectId,
  field,
  value,
  label,
  placeholder = "Add something…",
  as = "text",
  className = "",
}: {
  projectId: string;
  field: string;
  value: string | null;
  label: string;
  placeholder?: string;
  as?: "text" | "display";
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [current, setCurrent] = useState<string>(value ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: current.trim() || null }),
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
    setCurrent(value ?? "");
    setEditing(false);
    setError(null);
  }

  const displayCls =
    as === "display"
      ? "font-display text-2xl leading-snug tracking-tight"
      : "text-sm leading-relaxed";

  if (editing) {
    return (
      <div className={className}>
        <div className="flex items-baseline justify-between">
          <span className="eyebrow-ink">{label}</span>
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
        <textarea
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) save();
            if (e.key === "Escape") cancel();
          }}
          autoFocus
          rows={as === "display" ? 3 : 4}
          placeholder={placeholder}
          className={`mt-3 w-full resize-none border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-3 py-2 text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)] ${
            as === "display" ? "font-display text-2xl leading-snug" : "text-sm leading-relaxed"
          }`}
        />
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        {as === "display" && <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-[var(--color-muted)]">⌘/Ctrl + Enter to save · Esc to cancel</p>}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between">
        <span className="eyebrow-ink">{label}</span>
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-[var(--color-muted)] hover:text-[var(--color-ink)]"
        >
          <Pencil className="h-3 w-3" /> {value ? "Edit" : `Add ${label.toLowerCase()}`}
        </button>
      </div>
      {value ? (
        <p className={`mt-3 ${displayCls}`}>{value}</p>
      ) : (
        <p className="mt-3 text-sm italic text-[var(--color-muted)]">{placeholder}</p>
      )}
    </div>
  );
}
