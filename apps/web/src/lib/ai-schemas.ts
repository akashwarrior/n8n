import { PROVIDERS } from "@n8n/actions";
import { z } from "zod";

export const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const NodeConfigSchema = z.object({
  actionId: z.string(),
}).loose();

export const NodeDataSchema = z.object({
  label: z.string().optional(),
  description: z.string().optional(),
  provider: z.enum(PROVIDERS.map((p) => p.type)).optional(),
  config: NodeConfigSchema.optional(),
});

export const NodeSchema = z.object({
  id: z.string(),
  type: z.string().default("action"),
  position: PositionSchema,
  data: NodeDataSchema,
});

export const EdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
});

export const WorkflowSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
});

export type AIWorkflow = z.infer<typeof WorkflowSchema>;
export type AINode = z.infer<typeof NodeSchema>;
export type AIEdge = z.infer<typeof EdgeSchema>;
