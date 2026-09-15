import type { ProjectStatus, OrderStatus, MeasurementStatus, CutStatus, StepStatus } from "./types";

export function currency(n: number | null | undefined): string {
  if (n == null) return "—";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function statusColor(s: ProjectStatus | null): string {
  switch (s) {
    case "Planning / Brainstorming": return "var(--color-status-planning)";
    case "Ready to Build": return "var(--color-status-ready)";
    case "In Progress": return "var(--color-status-progress)";
    case "Waiting on Materials": return "var(--color-status-waiting)";
    case "On Hold": return "var(--color-status-hold)";
    case "Completed": return "var(--color-status-done)";
    default: return "var(--color-muted)";
  }
}

export const PROJECT_STATUSES: ProjectStatus[] = [
  "Planning / Brainstorming",
  "Ready to Build",
  "In Progress",
  "Waiting on Materials",
  "On Hold",
  "Completed",
];

export function orderStatusColor(s: OrderStatus | null): string {
  switch (s) {
    case "NEED TO BUY": return "#f87171";
    case "READY TO ORDER": return "#fb923c";
    case "ORDERED": return "#60a5fa";
    case "PARTIALLY RECEIVED": return "#fbbf24";
    case "RECEIVED": return "#34d399";
    case "RETURNING":
    case "RETURNED": return "#f472b6";
    case "CANCELLED": return "#6b7280";
    default: return "#9a9aa8";
  }
}

export function measurementColor(s: MeasurementStatus | null): string {
  switch (s) {
    case "ROUGH": return "#f87171";
    case "ESTIMATED": return "#fb923c";
    case "FIELD VERIFIED": return "#60a5fa";
    case "FINAL": return "#34d399";
    default: return "#9a9aa8";
  }
}

export function cutColor(s: CutStatus | null): string {
  switch (s) {
    case "NOT FINAL": return "#f87171";
    case "READY TO CUT": return "#fb923c";
    case "CUT": return "#60a5fa";
    case "TEST FIT": return "#fbbf24";
    case "INSTALLED": return "#34d399";
    default: return "#9a9aa8";
  }
}

export function stepColor(s: StepStatus | null): string {
  switch (s) {
    case "NOT STARTED": return "#9a9aa8";
    case "READY": return "#60a5fa";
    case "IN PROGRESS": return "#fbbf24";
    case "BLOCKED": return "#f87171";
    case "COMPLETE": return "#34d399";
    default: return "#9a9aa8";
  }
}

export function dims(parts: (number | null | undefined)[], unit = '"'): string {
  const vals = parts.filter((p): p is number => p != null);
  if (!vals.length) return "—";
  return vals.map((v) => `${v}${unit}`).join(" × ");
}
