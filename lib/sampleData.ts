import type { ProjectDetail, Project } from "./types";

/* Stable Unsplash imagery so the dashboard looks real before any uploads. */
const IMG = {
  pantry: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1200&q=80",
  walnut: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  wood: "https://images.unsplash.com/photo-1611021061285-98d1c3f6a5e9?auto=format&fit=crop&w=1200&q=80",
  bar: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80",
  basement: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
  bath: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
  deck: "https://images.unsplash.com/photo-1591825729269-caeb344f6df2?auto=format&fit=crop&w=1200&q=80",
  fireplace: "https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=1200&q=80",
};

const PANTRY_ID = "pantry";

const pantry: ProjectDetail = {
  project: {
    id: PANTRY_ID,
    name: "Custom Walnut Pantry / Appliance Cabinet",
    room: "Pantry",
    type: "Cabinetry / Built-in",
    status: "Planning / Brainstorming",
    priority: "High",
    current_phase: "Design",
    next_action: "Choose the drawer base — IKEA SEKTION/MAXIMERA vs. cheaper Hampton Bay premade base",
    target_start: null,
    target_completion: null,
    estimated_budget: 2200,
    design_status: "In Progress",
    materials_status: "Sourcing",
    build_plan_status: "Not Started",
    percent_complete: 5,
    cover_image: "/mockups/pantry-cabinet.png",
    what: "A floor-to-ceiling, furniture-quality custom built-in for an existing pantry niche (~39.5\" W × 108\" H), approximately 24\" deep. Bottom: two stacked drawers. Middle: a walnut appliance surface at counter height. Lower upper: toaster oven hidden behind two walnut doors. Upper: pantry shelving behind two walnut doors. Four upper doors total.",
    why: "Turn an awkward pantry niche into a statement built-in that hides the toaster oven and adds real storage.",
    design_goal: "Custom furniture-like built-in — traditional frame-and-panel / inset cabinetry.",
    aesthetic: "Walnut. Solid walnut rails/stiles, 1/4\" walnut ply floating panels, walnut face frame + drawer fronts, finished maple interior, brass / champagne-bronze hardware. NO decorative brass mesh.",
    constraints: "Must fit the existing niche (~39.5\" W × 108\" H). Inset frame-and-panel look. Reference: Jen Woodhouse / House of Wood 'Mudroom Locker Cabinets' — but do NOT copy its dimensions.",
    notes: "Dimensions are not final until the drawer base is selected and the toaster oven is measured.",
  },
  materials: [
    { id: "m1", project_id: PANTRY_ID, item: "IKEA SEKTION base + MAXIMERA drawers (option A)", category: "Cabinetry", description: "24\"-deep base with two large drawers.", qty_needed: 1, qty_ordered: 0, qty_received: 0, unit: "each", retailer: "IKEA", product_url: "https://www.ikea.com/us/en/cat/sektion-system-25612/", sku: null, est_unit_price: 350, actual_unit_price: null, order_status: "RESEARCHING", order_date: null, expected_delivery: null, received_date: null, notes: "Do not order until drawer base decision is made." },
    { id: "m2", project_id: PANTRY_ID, item: "Hampton Bay unfinished drawer base (option B)", category: "Cabinetry", description: "Cheaper premade drawer base.", qty_needed: 1, qty_ordered: 0, qty_received: 0, unit: "each", retailer: "Home Depot", product_url: "https://www.homedepot.com/", sku: null, est_unit_price: 200, actual_unit_price: null, order_status: "RESEARCHING", order_date: null, expected_delivery: null, received_date: null, notes: "Competing option vs. IKEA." },
    { id: "m3", project_id: PANTRY_ID, item: "3/4\" walnut plywood", category: "Plywood", description: "Carcass, shelves. 4x8 sheets.", qty_needed: 3, qty_ordered: 0, qty_received: 0, unit: "sheet", retailer: "Local Lumber", product_url: null, sku: null, est_unit_price: 180, actual_unit_price: null, order_status: "NEED TO BUY", order_date: null, expected_delivery: null, received_date: null, notes: null },
    { id: "m4", project_id: PANTRY_ID, item: "1/4\" walnut plywood", category: "Plywood", description: "Door floating panels.", qty_needed: 1, qty_ordered: 0, qty_received: 0, unit: "sheet", retailer: "Local Lumber", product_url: null, sku: null, est_unit_price: 90, actual_unit_price: null, order_status: "NEED TO BUY", order_date: null, expected_delivery: null, received_date: null, notes: null },
    { id: "m5", project_id: PANTRY_ID, item: "Solid walnut boards", category: "Lumber", description: "Face frame, door rails/stiles, appliance surface.", qty_needed: 40, qty_ordered: 0, qty_received: 0, unit: "board ft", retailer: "Local Lumber", product_url: null, sku: null, est_unit_price: 12, actual_unit_price: null, order_status: "NEED TO BUY", order_date: null, expected_delivery: null, received_date: null, notes: null },
    { id: "m6", project_id: PANTRY_ID, item: "Champagne-bronze pulls / knobs", category: "Hardware", description: "Drawers + 4 doors. No brass mesh.", qty_needed: 6, qty_ordered: 0, qty_received: 0, unit: "each", retailer: "Amazon", product_url: "https://www.amazon.com/", sku: null, est_unit_price: 14, actual_unit_price: null, order_status: "RESEARCHING", order_date: null, expected_delivery: null, received_date: null, notes: null },
    { id: "m7", project_id: PANTRY_ID, item: "Inset concealed hinges", category: "Hardware", description: "For 4 inset doors.", qty_needed: 8, qty_ordered: 0, qty_received: 0, unit: "each", retailer: "Rockler", product_url: "https://www.rockler.com/", sku: null, est_unit_price: 9, actual_unit_price: null, order_status: "RESEARCHING", order_date: null, expected_delivery: null, received_date: null, notes: null },
  ],
  measurements: [
    { id: "me1", project_id: PANTRY_ID, location: "Rough opening (existing niche)", width: 39.5, height: 108, depth: null, thickness: null, quantity: null, units: "inches", status: "ESTIMATED", verified: false, notes: ">24\" depth available; planning ~24\" deep." },
    { id: "me2", project_id: PANTRY_ID, location: "Cabinet depth (design target)", width: null, height: null, depth: 24, thickness: null, quantity: null, units: "inches", status: "FINAL", verified: true, notes: "Decided depth = 24\". Deeper base rejected." },
    { id: "me3", project_id: PANTRY_ID, location: "Toaster oven (appliance)", width: null, height: null, depth: null, thickness: null, quantity: null, units: "inches", status: "ROUGH", verified: false, notes: "Must measure W×H×D + ventilation clearances." },
    { id: "me4", project_id: PANTRY_ID, location: "Finished base / counter height", width: null, height: null, depth: null, thickness: null, quantity: null, units: "inches", status: "ROUGH", verified: false, notes: "Not yet determined." },
  ],
  decisions: [
    { id: "d1", project_id: PANTRY_ID, topic: "Base cabinet depth", kind: "decision", status: "DECIDED", impact: "Low", options: null, recommendation: null, original_idea: "Considered making the base 28-30\" deep.", final_decision: "Keep base 24\" deep.", reason: "No meaningful benefit and complicates the drawer system." },
    { id: "d2", project_id: PANTRY_ID, topic: "No decorative brass mesh", kind: "decision", status: "DECIDED", impact: "Low", options: null, recommendation: null, original_idea: null, final_decision: "Champagne-bronze hardware only; no brass mesh.", reason: "Clean inset frame-and-panel look." },
    { id: "q1", project_id: PANTRY_ID, topic: "IKEA SEKTION/MAXIMERA vs. cheaper premade drawer base", kind: "question", status: "OPEN", impact: "High", options: "1) IKEA SEKTION + MAXIMERA. 2) Hampton Bay unfinished base.", recommendation: "Undecided — this is the current next action.", original_idea: null, final_decision: null, reason: null },
    { id: "q2", project_id: PANTRY_ID, topic: "Exact toaster oven dimensions", kind: "question", status: "OPEN", impact: "High", options: "Measure W×H×D.", recommendation: null, original_idea: null, final_decision: null, reason: null },
    { id: "q3", project_id: PANTRY_ID, topic: "Toaster ventilation requirements", kind: "question", status: "OPEN", impact: "High", options: "Confirm clearances for enclosed use.", recommendation: null, original_idea: null, final_decision: null, reason: null },
    { id: "q4", project_id: PANTRY_ID, topic: "Final finished base / counter height", kind: "question", status: "OPEN", impact: "High", options: null, recommendation: null, original_idea: null, final_decision: null, reason: null },
  ],
  steps: [
    { id: "s1", project_id: PANTRY_ID, step_no: 1, phase: "Prep", task: "Choose & measure the drawer base", instructions: "Decide IKEA vs. Hampton Bay. Record exact external W×H×D. Gates everything above it.", dependencies: "None — current next action.", status: "READY", difficulty: "Easy" },
    { id: "s2", project_id: PANTRY_ID, step_no: 2, phase: "Prep", task: "Measure toaster oven + confirm ventilation", instructions: "Measure W×H×D. Look up manufacturer clearances for enclosed install.", dependencies: null, status: "READY", difficulty: "Easy" },
    { id: "s3", project_id: PANTRY_ID, step_no: 3, phase: "Prep", task: "Lock counter + upper carcass height", instructions: "Set counter height, derive upper carcass height from 108\" ceiling.", dependencies: "Steps 1 & 2.", status: "BLOCKED", difficulty: "Medium" },
    { id: "s4", project_id: PANTRY_ID, step_no: 4, phase: "Prep", task: "Produce the FINAL cut list", instructions: "Only after measurements are FINAL. Then flip parts to READY TO CUT.", dependencies: "Step 3.", status: "BLOCKED", difficulty: "Medium" },
    { id: "s5", project_id: PANTRY_ID, step_no: 5, phase: "Carcass", task: "Build upper carcass", instructions: "Cut 3/4\" walnut ply per final cut list; pocket-hole assembly; vented toaster compartment.", dependencies: null, status: "NOT STARTED", difficulty: "Hard" },
    { id: "s6", project_id: PANTRY_ID, step_no: 6, phase: "Doors / Drawers", task: "Build 4 inset doors", instructions: "2-1/4\" walnut rails/stiles, 1/4\" walnut ply floating panels, ~1/8\" reveal.", dependencies: null, status: "NOT STARTED", difficulty: "Hard" },
  ],
  cuts: [
    { id: "c1", project_id: PANTRY_ID, component: "Upper carcass side", part_no: "A1", material: "3/4\" Walnut Ply", quantity: 2, length: null, width: null, depth: null, cut_status: "NOT FINAL", final: false, notes: "Height depends on final upper carcass height." },
    { id: "c2", project_id: PANTRY_ID, component: "Door rail / stile (2-1/4\")", part_no: "D1", material: "Solid Walnut", quantity: null, length: null, width: 2.25, depth: null, cut_status: "NOT FINAL", final: false, notes: "Lengths depend on final door sizes." },
    { id: "c3", project_id: PANTRY_ID, component: "Door floating panel", part_no: "D2", material: "1/4\" Walnut Ply", quantity: 4, length: null, width: null, depth: null, cut_status: "NOT FINAL", final: false, notes: "4 doors." },
  ],
  files: [
    { id: "f1", project_id: PANTRY_ID, name: "Cabinet mockup", type: "Rendering", url: "/mockups/pantry-cabinet.png" },
    { id: "f2", project_id: PANTRY_ID, name: "Mockup with dimensions", type: "Rendering", url: "/mockups/pantry-dimensions.png" },
    { id: "f3", project_id: PANTRY_ID, name: "Build plan mockup", type: "Cut Diagram", url: "/mockups/pantry-build-plan.png" },
  ],
};

function shell(p: Partial<Project> & { id: string; name: string; cover_image: string; room: string; type: string }): ProjectDetail {
  return {
    project: {
      status: "Planning / Brainstorming", priority: "Low", current_phase: "Concept",
      next_action: "Define scope and rough dimensions", target_start: null, target_completion: null,
      estimated_budget: null, design_status: "Not Started", materials_status: "Not Started",
      build_plan_status: "Not Started", percent_complete: 0, what: null, why: null, design_goal: null,
      aesthetic: null, constraints: null, notes: null,
      ...p,
    } as Project,
    materials: [], measurements: [], decisions: [], steps: [], cuts: [], files: [],
  };
}

export const SAMPLE_DETAILS: ProjectDetail[] = [
  pantry,
  shell({ id: "basement-bar", name: "Basement Bar", room: "Basement", type: "Bar", cover_image: IMG.bar }),
  shell({ id: "basement-finishing", name: "Basement Finishing", room: "Basement", type: "Finishing", cover_image: IMG.basement }),
  shell({ id: "primary-bath", name: "Primary Bathroom / Shower", room: "Primary Bath", type: "Bathroom", cover_image: IMG.bath }),
  shell({ id: "deck", name: "Deck", room: "Deck / Exterior", type: "Outdoor", cover_image: IMG.deck }),
  shell({ id: "fireplace", name: "Living Room Fireplace / TV Wall", room: "Living Room", type: "Finishing", cover_image: IMG.fireplace }),
];

export const SAMPLE_PROJECTS: Project[] = SAMPLE_DETAILS.map((d) => d.project);
export function sampleDetail(id: string): ProjectDetail | undefined {
  return SAMPLE_DETAILS.find((d) => d.project.id === id);
}
