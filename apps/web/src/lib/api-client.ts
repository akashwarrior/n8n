import type { Projects, Workflows as PrismaWorkflows, Prisma } from "@n8n/db";
import type { IntegrationType } from "@n8n/Integrations/types";
import { WorkflowEdge, WorkflowNode } from "./workflow-store";

class ApiError extends Error {
  public status: number;

  constructor(status: number, message: string) {
    super();
    this.status = status;
    this.message = message;
  }
}

async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => { });
    throw new ApiError(response.status, error.error || "Request failed");
  }

  return await response.json();
}

interface Workflows extends Omit<PrismaWorkflows, "nodes" | "edges"> {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

interface WorkflowCreateType extends Omit<Prisma.WorkflowsCreateInput, "project" | "nodes" | "edges"> {
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

type workflowIdInput = { id: string };
export type WorkflowUpdateInput = Partial<Workflows> & { id: string };
export type WorkflowCreateInput = WorkflowCreateType & { projectId: string };

const workflow = {
  get: (data: workflowIdInput) =>
    apiCall<Workflows>(`/api/workflows/${data.id}`),

  update: (data: WorkflowUpdateInput) =>
    apiCall<Workflows>(`/api/workflows/${data.id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (data: workflowIdInput) =>
    apiCall<Workflows>(`/api/workflows/${data.id}`, {
      method: "DELETE",
    }),

  create: (data: WorkflowCreateInput) =>
    apiCall<Workflows>("/api/workflows", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export type projectCreateInput = Omit<Prisma.ProjectsCreateInput, "user">;
export type projectUpdateInput = Prisma.ProjectsUpdateInput & { id: string };

const project = {
  create: (data: projectCreateInput) =>
    apiCall<Projects>("/api/projects", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (data: projectUpdateInput) =>
    apiCall<Projects>(`/api/projects/${data.id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (data: { projectId: string }) =>
    apiCall<Projects>(`/api/projects/${data.projectId}`, {
      method: "DELETE",
    }),
};

export interface Credentials extends Prisma.CredentialsModel {
  type: IntegrationType;
  config: Record<string, string>;
}

export type credentialsCreateInput = Omit<
  Credentials,
  "id" | "createdAt" | "updatedAt"
>;
export type credentialsUpdateInput = Partial<Credentials> & {
  id: string;
};

const credential = {
  create: (data: credentialsCreateInput) =>
    apiCall<Credentials>("/api/credentials", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (data: credentialsUpdateInput) =>
    apiCall<Credentials>(`/api/credentials/${data.id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (data: { credentialsId: string }) =>
    apiCall<Credentials>(`/api/credentials/${data.credentialsId}`, {
      method: "DELETE",
    }),

  getAll: (data: { projectId: string }) =>
    apiCall<Credentials[]>(`/api/credentials?projectId=${data.projectId}`, {
      method: "GET",
    }),
};

export const api = {
  workflow,
  project,
  credential,
};
