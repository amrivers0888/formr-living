export type ProjectStatus =
  | "Planning / Brainstorming"
  | "Ready to Build"
  | "In Progress"
  | "Waiting on Materials"
  | "On Hold"
  | "Completed";

export type Priority = "High" | "Medium" | "Low";

export type OrderStatus =
  | "RESEARCHING"
  | "NEED TO BUY"
  | "READY TO ORDER"
  | "ORDERED"
  | "PARTIALLY RECEIVED"
  | "RECEIVED"
  | "RETURNING"
  | "RETURNED"
  | "CANCELLED";

export type MeasurementStatus = "ROUGH" | "ESTIMATED" | "FIELD VERIFIED" | "FINAL";
export type CutStatus = "NOT FINAL" | "READY TO CUT" | "CUT" | "TEST FIT" | "INSTALLED";
export type StepStatus = "NOT STARTED" | "READY" | "IN PROGRESS" | "BLOCKED" | "COMPLETE";
export type DecisionKind = "question" | "decision";

export interface Project {
  id: string;
  name: string;
  room: string | null;
  type: string | null;
  status: ProjectStatus;
  priority: Priority | null;
  current_phase: string | null;
  next_action: string | null;
  target_start: string | null;
  target_completion: string | null;
  estimated_budget: number | null;
  design_status: string | null;
  materials_status: string | null;
  build_plan_status: string | null;
  percent_complete: number | null;
  cover_image: string | null;
  what: string | null;
  why: string | null;
  design_goal: string | null;
  aesthetic: string | null;
  constraints: string | null;
  notes: string | null;
  created_at?: string;
}

export interface Material {
  id: string;
  project_id: string;
  item: string;
  category: string | null;
  description: string | null;
  qty_needed: number | null;
  qty_ordered: number | null;
  qty_received: number | null;
  unit: string | null;
  retailer: string | null;
  product_url: string | null;
  sku: string | null;
  est_unit_price: number | null;
  actual_unit_price: number | null;
  order_status: OrderStatus | null;
  order_date: string | null;
  expected_delivery: string | null;
  received_date: string | null;
  notes: string | null;
}

export interface Measurement {
  id: string;
  project_id: string;
  location: string;
  width: number | null;
  height: number | null;
  depth: number | null;
  thickness: number | null;
  quantity: number | null;
  units: string | null;
  status: MeasurementStatus | null;
  verified: boolean | null;
  notes: string | null;
}

export interface Decision {
  id: string;
  project_id: string;
  topic: string;
  kind: DecisionKind;
  status: string | null;
  impact: string | null;
  options: string | null;
  recommendation: string | null;
  original_idea: string | null;
  final_decision: string | null;
  reason: string | null;
  created_at?: string;
}

export interface BuildStep {
  id: string;
  project_id: string;
  step_no: number | null;
  phase: string | null;
  task: string;
  instructions: string | null;
  dependencies: string | null;
  status: StepStatus | null;
  difficulty: string | null;
}

export interface CutPart {
  id: string;
  project_id: string;
  component: string;
  part_no: string | null;
  material: string | null;
  quantity: number | null;
  length: number | null;
  width: number | null;
  depth: number | null;
  cut_status: CutStatus | null;
  final: boolean | null;
  notes: string | null;
}

export interface FileRef {
  id: string;
  project_id: string;
  name: string;
  type: string | null;
  url: string | null;
}

export interface ProjectDetail {
  project: Project;
  materials: Material[];
  measurements: Measurement[];
  decisions: Decision[];
  steps: BuildStep[];
  cuts: CutPart[];
  files: FileRef[];
}

/* ---- Derived budget helpers ---- */
export function estMaterialCost(materials: Material[]): number {
  return materials.reduce((s, m) => s + (m.qty_needed ?? 0) * (m.est_unit_price ?? 0), 0);
}
export function actualSpend(materials: Material[]): number {
  return materials.reduce((s, m) => s + (m.qty_ordered ?? 0) * (m.actual_unit_price ?? 0), 0);
}
