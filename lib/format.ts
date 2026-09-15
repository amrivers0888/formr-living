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

// Muted, earthy tones tuned for contrast on the warm cream background.
const RED = "#b5473c";
const CLAY = "#c2703a";
const BLUE = "#4e7db0";
const GOLD = "#b07d1e";
const GREEN = "#5e8f63";
const PINK = "#b0658a";
const STONE = "#857f70";

export function orderStatusColor(s: OrderStatus | null): string {
  switch (s) {
    case "NEED TO BUY": return RED;
    case "READY TO ORDER": return CLAY;
    case "ORDERED": return BLUE;
    case "PARTIALLY RECEIVED": return GOLD;
    case "RECEIVED": return GREEN;
    case "RETURNING":
    case "RETURNED": return PINK;
    case "CANCELLED": return STONE;
    default: return STONE;
  }
}

export function measurementColor(s: MeasurementStatus | null): string {
  switch (s) {
    case "ROUGH": return RED;
    case "ESTIMATED": return CLAY;
    case "FIELD VERIFIED": return BLUE;
    case "FINAL": return GREEN;
    default: return STONE;
  }
}

export function cutColor(s: CutStatus | null): string {
  switch (s) {
    case "NOT FINAL": return RED;
    case "READY TO CUT": return CLAY;
    case "CUT": return BLUE;
    case "TEST FIT": return GOLD;
    case "INSTALLED": return GREEN;
    default: return STONE;
  }
}

export function stepColor(s: StepStatus | null): string {
  switch (s) {
    case "NOT STARTED": return STONE;
    case "READY": return BLUE;
    case "IN PROGRESS": return GOLD;
    case "BLOCKED": return RED;
    case "COMPLETE": return GREEN;
    default: return STONE;
  }
}

export function dims(parts: (number | null | undefined)[], unit = '"'): string {
  const vals = parts.filter((p): p is number => p != null);
  if (!vals.length) return "—";
  return vals.map((v) => `${v}${unit}`).join(" × ");
}
