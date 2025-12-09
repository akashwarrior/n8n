import { createGoogleGenerativeAI, GoogleGenerativeAIProviderOptions } from "@ai-sdk/google";
import { WorkflowSchema } from "@/lib/ai-schemas";
import { streamObject } from "ai";
import { PROVIDERS } from "@n8n/actions";
import { z } from "zod";

function generateSystemPrompt(): string {
  let prompt = "";

  for (const provider of PROVIDERS) {
    prompt += `\n## ${provider.label} (provider: "${provider.type}")\n`;

    for (const action of provider.actions) {
      prompt += `- ${action.label}: provider: "${provider.type}", config: {actionId: "${action.id}"`;

      if (action.config.length > 0) {
        const configParts = action.config
          .filter((f) => f.type !== "display")
          .map((f) => `${f.name}: "${f.default || f.options?.[0].value || f.placeholder || f.label}"`);

        if (configParts.length > 0) {
          prompt += `, ${configParts.join(", ")}`;
        }
      }

      prompt += "}\n";
    }
  }

  return `You are a workflow automation assistant. Generate a complete workflow based on the user's request.

# Output Format
Return a JSON object with: name, description, nodes, and edges.

# Node Structure
Each node needs:
- id: unique string (e.g., "trigger-1", "http-1")
- type: always "action"
- position: {x, y} coordinates
- data: {label, provider, config}

# Providers and Their Configs
${prompt}
# Edge Structure
- id: unique string (e.g., "edge-1")
- source: id of the source node
- target: id of the target node

# Positioning
- Start first node at x: 100, y: 200
- Space nodes horizontally by 250px
- For parallel branches, space vertically by 150px

# Rules
- Every workflow needs at least ONE trigger node (from the "triggers" provider)
- The trigger node should be the first node in the workflow
- Connect nodes with edges in logical order

# Example
{
  "name": "API Data Fetcher",
  "description": "Fetches data from an API on manual trigger",
  "nodes": [
    {"id": "trigger-1", "type": "action", "position": {"x": 100, "y": 200}, "data": {"label": "Manual Trigger", "provider": "triggers", "config": {"actionId": "Manual"}}},
    {"id": "http-1", "type": "action", "position": {"x": 350, "y": 200}, "data": {"label": "Fetch Data", "provider": "system", "config": {"actionId": "http-request", "httpMethod": "GET", "endpoint": "https://api.example.com/data"}}}
  ],
  "edges": [
    {"id": "edge-1", "source": "trigger-1", "target": "http-1"}
  ]
}`;
}

const systemPrompt = generateSystemPrompt();

const requestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  existingWorkflow: z
    .object({
      nodes: z.array(z.any()).optional(),
      edges: z.array(z.any()).optional(),
    })
    .optional(),
});

export async function POST(request: Request) {
  try {
    const aiApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!aiApiKey) {
      return new Response(
        JSON.stringify({ error: "Missing GOOGLE_GENERATIVE_AI_API_KEY" }),
        { status: 500 },
      );
    }

    const google = createGoogleGenerativeAI({ apiKey: aiApiKey });

    const json = await request.json();
    const parsedBody = requestSchema.safeParse(json);

    if (!parsedBody.success) {
      const issues = parsedBody.error.issues
        .map((issue) => issue.message)
        .join(", ");
      return new Response(JSON.stringify({ error: issues }), { status: 400 });
    }

    const { prompt: userPrompt, existingWorkflow } = parsedBody.data;

    // Build context prompt
    let fullPrompt = userPrompt;
    if (existingWorkflow?.nodes?.length) {
      fullPrompt = `Current workflow has these nodes:
${JSON.stringify(existingWorkflow.nodes, null, 2)}

Current edges:
${JSON.stringify(existingWorkflow.edges || [], null, 2)}

User request: ${userPrompt}

Return the COMPLETE updated workflow with all nodes and edges (including existing ones that should remain).`;
    }

    const result = streamObject({
      model: google("gemini-2.5-flash-lite-preview-09-2025"),
      system: systemPrompt,
      prompt: fullPrompt,
      schema: WorkflowSchema,
      providerOptions: {
        google: {
          structuredOutputs: false,
        } satisfies GoogleGenerativeAIProviderOptions,
      }
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Failed to generate workflow:", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate workflow",
      }),
      { status: 500 },
    );
  }
}
