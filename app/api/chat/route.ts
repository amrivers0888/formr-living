import OpenAI from "openai";
import { hasSupabase } from "@/lib/supabase";
import { createProject, updateProject, addMaterials, addMeasurements, addDecisions, addBuildSteps, addCutParts } from "@/lib/mutations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = process.env.OPENAI_MODEL || "gpt-4o";

const SYSTEM = `You are the assistant inside "Formr Living", a personal DIY home-renovation app for Allison.
You help her create and build out renovation projects (custom cabinetry, bathrooms, decks, basements, etc.).

Behavior:
- Be warm, concise, and practical. She is a hands-on DIYer.
- When she describes a project, CREATE it with create_project, then add measurements, decisions, open questions, materials, and build steps using the tools — infer sensible starter content, but do NOT invent exact final dimensions. Mark uncertain dimensions as ROUGH/ESTIMATED and unresolved choices as open questions (kind:"question").
- Keep "decisions" (kind:"decision") only for things clearly settled. Put anything undecided as a question.
- For materials, set order_status to "RESEARCHING" or "NEED TO BUY" and add est_unit_price + qty_needed when you can estimate; include product_url only if you are confident it's real.
- After using tools, briefly summarize what you created/added in plain language. Mention that dimensions aren't final until measured.
- If asked something you can't persist (no database), still give helpful planning advice.`;

// --- Tool definitions ---
const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "create_project",
      description: "Create a new renovation project. Returns the new project id.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          room: { type: "string" },
          type: { type: "string", description: "e.g. Cabinetry / Built-in, Bathroom, Bar, Outdoor, Finishing" },
          status: { type: "string", enum: ["Planning / Brainstorming", "Ready to Build", "In Progress", "Waiting on Materials", "On Hold", "Completed"] },
          priority: { type: "string", enum: ["High", "Medium", "Low"] },
          current_phase: { type: "string" },
          next_action: { type: "string" },
          estimated_budget: { type: "number" },
          what: { type: "string", description: "What is being built" },
          why: { type: "string" },
          design_goal: { type: "string" },
          aesthetic: { type: "string" },
          constraints: { type: "string" },
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_materials",
      description: "Add shopping-list / material items to a project.",
      parameters: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                item: { type: "string" },
                category: { type: "string" },
                description: { type: "string" },
                qty_needed: { type: "number" },
                unit: { type: "string" },
                retailer: { type: "string" },
                product_url: { type: "string" },
                est_unit_price: { type: "number" },
                order_status: { type: "string", enum: ["RESEARCHING", "NEED TO BUY", "READY TO ORDER", "ORDERED", "RECEIVED"] },
              },
              required: ["item"],
            },
          },
        },
        required: ["project_id", "items"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_measurements",
      description: "Add measurements. Use status ROUGH/ESTIMATED unless truly verified.",
      parameters: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                location: { type: "string" },
                width: { type: "number" }, height: { type: "number" }, depth: { type: "number" },
                thickness: { type: "number" }, quantity: { type: "number" },
                units: { type: "string" },
                status: { type: "string", enum: ["ROUGH", "ESTIMATED", "FIELD VERIFIED", "FINAL"] },
                notes: { type: "string" },
              },
              required: ["location"],
            },
          },
        },
        required: ["project_id", "items"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_decisions",
      description: "Add decisions (kind:'decision') or open questions (kind:'question').",
      parameters: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                topic: { type: "string" },
                kind: { type: "string", enum: ["decision", "question"] },
                status: { type: "string" },
                impact: { type: "string", enum: ["High", "Medium", "Low"] },
                options: { type: "string" },
                recommendation: { type: "string" },
                final_decision: { type: "string" },
                reason: { type: "string" },
              },
              required: ["topic", "kind"],
            },
          },
        },
        required: ["project_id", "items"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_build_steps",
      description: "Add ordered build steps.",
      parameters: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                step_no: { type: "number" },
                phase: { type: "string" },
                task: { type: "string" },
                instructions: { type: "string" },
                status: { type: "string", enum: ["NOT STARTED", "READY", "IN PROGRESS", "BLOCKED", "COMPLETE"] },
                difficulty: { type: "string", enum: ["Easy", "Medium", "Hard"] },
              },
              required: ["task"],
            },
          },
        },
        required: ["project_id", "items"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_project",
      description: "Update fields on an existing project (e.g. next_action, status, budget).",
      parameters: {
        type: "object",
        properties: { project_id: { type: "string" }, fields: { type: "object" } },
        required: ["project_id", "fields"],
      },
    },
  },
];

async function runTool(name: string, args: any): Promise<string> {
  switch (name) {
    case "create_project": {
      const p = await createProject(args);
      return `Created project "${p.name}" with id ${p.id}. Use this id for follow-up tools.`;
    }
    case "add_materials": return addMaterials(args.project_id, args.items);
    case "add_measurements": return addMeasurements(args.project_id, args.items);
    case "add_decisions": return addDecisions(args.project_id, args.items);
    case "add_build_steps": return addBuildSteps(args.project_id, args.items);
    case "update_project": return updateProject(args.project_id, args.fields);
    default: return `Unknown tool ${name}`;
  }
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json({ reply: "The AI isn't configured yet — add your OPENAI_API_KEY to the app's environment and I'll be able to chat and build projects.", actions: [] });
  }

  const body = await request.json().catch(() => ({}));
  const userMessages = Array.isArray(body.messages) ? body.messages : [];
  const context = body.projectId ? `\n\nContext: the user is currently viewing project id "${body.projectId}" (${body.projectName ?? ""}). Prefer adding to this project unless they clearly want a new one.` : "";
  const dbNote = hasSupabase() ? "" : "\n\nNOTE: The database is NOT connected, so tools will fail to save. Give planning help and tell the user their project will be saved once the database is connected.";

  const openai = new OpenAI({ apiKey });
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM + context + dbNote },
    ...userMessages.map((m: any) => ({ role: m.role, content: m.content })),
  ];

  const actions: string[] = [];
  let createdProjectId: string | null = null;

  try {
    for (let i = 0; i < 6; i++) {
      const completion = await openai.chat.completions.create({ model: MODEL, messages, tools, temperature: 0.4 });
      const msg = completion.choices[0].message;
      messages.push(msg);

      if (!msg.tool_calls || msg.tool_calls.length === 0) {
        return Response.json({ reply: msg.content ?? "", actions, createdProjectId });
      }

      for (const call of msg.tool_calls) {
        if (call.type !== "function") continue;
        let result: string;
        try {
          const args = JSON.parse(call.function.arguments || "{}");
          result = await runTool(call.function.name, args);
          if (call.function.name === "create_project") {
            const match = result.match(/id ([0-9a-f-]{36})/i);
            if (match) createdProjectId = match[1];
          }
          actions.push(result);
        } catch (e: any) {
          result = `Error: ${e.message}`;
          actions.push(result);
        }
        messages.push({ role: "tool", tool_call_id: call.id, content: result });
      }
    }
    return Response.json({ reply: "Done — that took a few steps. Anything else?", actions, createdProjectId });
  } catch (e: any) {
    return Response.json({ reply: `Something went wrong talking to the AI: ${e.message}`, actions }, { status: 200 });
  }
}
